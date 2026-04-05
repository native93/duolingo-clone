import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import * as fs from "fs";
import * as path from "path";

import * as schema from "@/db/schema";
import {
  NAMES_PER_LESSON,
  REVIEW_FREQUENCY,
  REVIEW_OLD_RATIO,
  CHALLENGES_PER_LEARN_LESSON,
  CHALLENGES_PER_REVIEW_LESSON,
  CHALLENGES_PER_CHECKPOINT,
} from "@/constants";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Load the 99 Names data
const namesData = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "public/data/99-names-with-audio.json"),
    "utf-8"
  )
) as {
  number: number;
  arabic: string;
  arabicPlain: string;
  transliteration: string;
  meaning: string;
  audioSrc: string;
}[];

// Shuffle array helper
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Get random wrong options (excluding specific indices)
function getRandomWrongOptions(
  excludeIndices: Set<number>,
  count: number
): typeof namesData {
  const options: typeof namesData = [];
  const available = namesData.filter((_, idx) => !excludeIndices.has(idx));
  const shuffled = shuffle(available);
  return shuffled.slice(0, count);
}

// Get similar meaning distractors (for harder checkpoint questions)
function getSimilarDistractors(
  correctName: (typeof namesData)[0],
  count: number
): typeof namesData {
  // For now, just get random ones (future: implement semantic similarity)
  return getRandomWrongOptions(new Set([correctName.number - 1]), count);
}

type LessonType = "learn" | "review" | "checkpoint";

interface LessonPlan {
  type: LessonType;
  title: string;
  names: typeof namesData; // Names to teach/review in this lesson
  reviewPool?: typeof namesData; // Additional names for review mixing
}

// Generate lesson plan for a unit
function generateUnitLessonPlan(
  unitNames: typeof namesData,
  previousUnitNames: typeof namesData
): LessonPlan[] {
  const lessons: LessonPlan[] = [];
  const learnLessonNames: (typeof namesData)[] = [];

  // Split unit names into groups of NAMES_PER_LESSON
  for (let i = 0; i < unitNames.length; i += NAMES_PER_LESSON) {
    const lessonNames = unitNames.slice(i, i + NAMES_PER_LESSON);
    learnLessonNames.push(lessonNames);

    // Create learn lesson
    const startNum = lessonNames[0].number;
    const endNum = lessonNames[lessonNames.length - 1].number;
    lessons.push({
      type: "learn",
      title: `Learn Names ${startNum}-${endNum}`,
      names: lessonNames,
    });

    // Add review lesson after every REVIEW_FREQUENCY learn lessons
    if (learnLessonNames.length % REVIEW_FREQUENCY === 0) {
      const reviewNames = learnLessonNames.flat();
      const reviewStart = reviewNames[0].number;
      const reviewEnd = reviewNames[reviewNames.length - 1].number;
      lessons.push({
        type: "review",
        title: `Review Names ${reviewStart}-${reviewEnd}`,
        names: reviewNames,
        reviewPool: previousUnitNames,
      });
    }
  }

  // Add checkpoint at the end of the unit
  lessons.push({
    type: "checkpoint",
    title: `Checkpoint: All Unit Names`,
    names: unitNames,
  });

  return lessons;
}

// Create challenges for a learn lesson
async function createLearnLessonChallenges(
  lessonId: number,
  names: typeof namesData
): Promise<number> {
  let challengeOrder = 0;

  // Phase 1: Introduction (ASSIST) - 1 per name
  for (const name of names) {
    const [challenge] = await db
      .insert(schema.challenges)
      .values([
        {
          lessonId,
          type: "ASSIST",
          question: `"${name.meaning}"`,
          order: ++challengeOrder,
        },
      ])
      .returning();

    const wrongOptions = getRandomWrongOptions(new Set([name.number - 1]), 2);
    const options = shuffle([
      { ...name, correct: true },
      { ...wrongOptions[0], correct: false },
      { ...wrongOptions[1], correct: false },
    ]);

    await db.insert(schema.challengeOptions).values(
      options.map((opt) => ({
        challengeId: challenge.id,
        correct: opt.correct,
        text: opt.arabic,
        audioSrc: opt.audioSrc,
      }))
    );
  }

  // Phase 2: Practice (SELECT) - 2 per name, mixed order
  const practiceQuestions: Array<{
    name: (typeof namesData)[0];
    questionType: "arabic-to-meaning" | "meaning-to-arabic";
  }> = [];

  for (const name of names) {
    practiceQuestions.push({ name, questionType: "arabic-to-meaning" });
    practiceQuestions.push({ name, questionType: "meaning-to-arabic" });
  }

  const shuffledPractice = shuffle(practiceQuestions);

  for (const { name, questionType } of shuffledPractice) {
    if (questionType === "arabic-to-meaning") {
      // "What does [Arabic] mean?"
      const [challenge] = await db
        .insert(schema.challenges)
        .values([
          {
            lessonId,
            type: "SELECT",
            question: `What does "${name.arabic}" mean?`,
            order: ++challengeOrder,
          },
        ])
        .returning();

      const wrongOptions = getRandomWrongOptions(new Set([name.number - 1]), 2);
      const options = shuffle([
        { ...name, correct: true },
        { ...wrongOptions[0], correct: false },
        { ...wrongOptions[1], correct: false },
      ]);

      await db.insert(schema.challengeOptions).values(
        options.map((opt) => ({
          challengeId: challenge.id,
          correct: opt.correct,
          text: opt.meaning,
          audioSrc: opt.audioSrc,
        }))
      );
    } else {
      // "Which name means [meaning]?"
      const [challenge] = await db
        .insert(schema.challenges)
        .values([
          {
            lessonId,
            type: "SELECT",
            question: `Which name means "${name.meaning}"?`,
            order: ++challengeOrder,
          },
        ])
        .returning();

      const wrongOptions = getRandomWrongOptions(new Set([name.number - 1]), 2);
      const options = shuffle([
        { ...name, correct: true },
        { ...wrongOptions[0], correct: false },
        { ...wrongOptions[1], correct: false },
      ]);

      await db.insert(schema.challengeOptions).values(
        options.map((opt) => ({
          challengeId: challenge.id,
          correct: opt.correct,
          text: `${opt.arabic} (${opt.transliteration})`,
          audioSrc: opt.audioSrc,
        }))
      );
    }
  }

  return challengeOrder;
}

// Create challenges for a review lesson
async function createReviewLessonChallenges(
  lessonId: number,
  currentNames: typeof namesData,
  reviewPool: typeof namesData
): Promise<number> {
  let challengeOrder = 0;

  // Calculate how many old names to include (30% of total)
  const oldNameCount = Math.floor(CHALLENGES_PER_REVIEW_LESSON * REVIEW_OLD_RATIO);
  const currentNameCount = CHALLENGES_PER_REVIEW_LESSON - oldNameCount;

  // Get random old names from review pool
  const oldNames = reviewPool.length > 0 ? shuffle(reviewPool).slice(0, oldNameCount) : [];

  // Build challenge pool
  const challengePool: Array<{
    name: (typeof namesData)[0];
    isOld: boolean;
  }> = [];

  // Add current unit names
  const shuffledCurrent = shuffle(currentNames);
  for (let i = 0; i < Math.min(currentNameCount, shuffledCurrent.length); i++) {
    challengePool.push({ name: shuffledCurrent[i], isOld: false });
  }

  // Add old names
  for (const name of oldNames) {
    challengePool.push({ name, isOld: true });
  }

  // Shuffle the pool
  const shuffledPool = shuffle(challengePool);

  // Generate challenges
  for (const { name, isOld } of shuffledPool) {
    const questionType = Math.random() < 0.5 ? "arabic-to-meaning" : "meaning-to-arabic";

    if (questionType === "arabic-to-meaning") {
      const [challenge] = await db
        .insert(schema.challenges)
        .values([
          {
            lessonId,
            type: "SELECT",
            question: `What does "${name.arabic}" mean?`,
            order: ++challengeOrder,
          },
        ])
        .returning();

      const wrongOptions = getRandomWrongOptions(new Set([name.number - 1]), 2);
      const options = shuffle([
        { ...name, correct: true },
        { ...wrongOptions[0], correct: false },
        { ...wrongOptions[1], correct: false },
      ]);

      await db.insert(schema.challengeOptions).values(
        options.map((opt) => ({
          challengeId: challenge.id,
          correct: opt.correct,
          text: opt.meaning,
          audioSrc: opt.audioSrc,
        }))
      );
    } else {
      const [challenge] = await db
        .insert(schema.challenges)
        .values([
          {
            lessonId,
            type: "SELECT",
            question: `Which name means "${name.meaning}"?`,
            order: ++challengeOrder,
          },
        ])
        .returning();

      const wrongOptions = getRandomWrongOptions(new Set([name.number - 1]), 2);
      const options = shuffle([
        { ...name, correct: true },
        { ...wrongOptions[0], correct: false },
        { ...wrongOptions[1], correct: false },
      ]);

      await db.insert(schema.challengeOptions).values(
        options.map((opt) => ({
          challengeId: challenge.id,
          correct: opt.correct,
          text: `${opt.arabic} (${opt.transliteration})`,
          audioSrc: opt.audioSrc,
        }))
      );
    }
  }

  return challengeOrder;
}

// Create challenges for a checkpoint lesson
async function createCheckpointChallenges(
  lessonId: number,
  unitNames: typeof namesData
): Promise<number> {
  let challengeOrder = 0;

  // Create mixed challenges covering all unit names
  const challengePool: Array<{
    name: (typeof namesData)[0];
    questionType: "arabic-to-meaning" | "meaning-to-arabic" | "assist";
  }> = [];

  // Add variety of question types for each name
  for (const name of unitNames) {
    // Randomly select question type with distribution
    const rand = Math.random();
    if (rand < 0.4) {
      challengePool.push({ name, questionType: "arabic-to-meaning" });
    } else if (rand < 0.8) {
      challengePool.push({ name, questionType: "meaning-to-arabic" });
    } else {
      challengePool.push({ name, questionType: "assist" });
    }
  }

  // Shuffle and limit to checkpoint size
  const shuffledPool = shuffle(challengePool).slice(0, CHALLENGES_PER_CHECKPOINT);

  for (const { name, questionType } of shuffledPool) {
    if (questionType === "assist") {
      const [challenge] = await db
        .insert(schema.challenges)
        .values([
          {
            lessonId,
            type: "ASSIST",
            question: `"${name.meaning}"`,
            order: ++challengeOrder,
          },
        ])
        .returning();

      // Use similar distractors for harder checkpoint
      const wrongOptions = getSimilarDistractors(name, 2);
      const options = shuffle([
        { ...name, correct: true },
        { ...wrongOptions[0], correct: false },
        { ...wrongOptions[1], correct: false },
      ]);

      await db.insert(schema.challengeOptions).values(
        options.map((opt) => ({
          challengeId: challenge.id,
          correct: opt.correct,
          text: opt.arabic,
          audioSrc: opt.audioSrc,
        }))
      );
    } else if (questionType === "arabic-to-meaning") {
      const [challenge] = await db
        .insert(schema.challenges)
        .values([
          {
            lessonId,
            type: "SELECT",
            question: `What does "${name.arabic}" mean?`,
            order: ++challengeOrder,
          },
        ])
        .returning();

      const wrongOptions = getSimilarDistractors(name, 2);
      const options = shuffle([
        { ...name, correct: true },
        { ...wrongOptions[0], correct: false },
        { ...wrongOptions[1], correct: false },
      ]);

      await db.insert(schema.challengeOptions).values(
        options.map((opt) => ({
          challengeId: challenge.id,
          correct: opt.correct,
          text: opt.meaning,
          audioSrc: opt.audioSrc,
        }))
      );
    } else {
      const [challenge] = await db
        .insert(schema.challenges)
        .values([
          {
            lessonId,
            type: "SELECT",
            question: `Which name means "${name.meaning}"?`,
            order: ++challengeOrder,
          },
        ])
        .returning();

      const wrongOptions = getSimilarDistractors(name, 2);
      const options = shuffle([
        { ...name, correct: true },
        { ...wrongOptions[0], correct: false },
        { ...wrongOptions[1], correct: false },
      ]);

      await db.insert(schema.challengeOptions).values(
        options.map((opt) => ({
          challengeId: challenge.id,
          correct: opt.correct,
          text: `${opt.arabic} (${opt.transliteration})`,
          audioSrc: opt.audioSrc,
        }))
      );
    }
  }

  return challengeOrder;
}

const main = async () => {
  try {
    console.log("🕌 Seeding database with Quranic Vocabulary - 99 Names Module...\n");

    // Delete all existing data (sequentially to avoid deadlocks)
    console.log("Clearing existing data...");
    await db.delete(schema.challengeProgress);
    await db.delete(schema.challengeOptions);
    await db.delete(schema.challenges);
    await db.delete(schema.lessons);
    await db.delete(schema.units);
    await db.delete(schema.userProgress);
    await db.delete(schema.courses);

    // Insert the course
    console.log("Creating course: 99 Names of Allah...");
    const [course] = await db
      .insert(schema.courses)
      .values([
        {
          title: "99 Names of Allah",
          imageSrc: "/kaaba.svg",
        },
      ])
      .returning();

    // Configuration for unit structure
    const NAMES_PER_UNIT = 15; // Each unit covers 15 names
    const unitCount = Math.ceil(namesData.length / NAMES_PER_UNIT);

    let totalLessons = 0;
    let totalChallenges = 0;
    let totalOptions = 0;
    let previousUnitNames: typeof namesData = [];

    for (let unitIndex = 0; unitIndex < unitCount; unitIndex++) {
      const startName = unitIndex * NAMES_PER_UNIT + 1;
      const endName = Math.min((unitIndex + 1) * NAMES_PER_UNIT, 99);

      console.log(`\n📚 Creating Unit ${unitIndex + 1}: Names ${startName}-${endName}...`);

      // Insert unit
      const [unit] = await db
        .insert(schema.units)
        .values([
          {
            courseId: course.id,
            title: `Unit ${unitIndex + 1}`,
            description: `Master Names ${startName}-${endName} of Allah`,
            order: unitIndex + 1,
          },
        ])
        .returning();

      // Get names for this unit
      const unitNames = namesData.slice(
        unitIndex * NAMES_PER_UNIT,
        (unitIndex + 1) * NAMES_PER_UNIT
      );

      // Generate lesson plan
      const lessonPlan = generateUnitLessonPlan(unitNames, previousUnitNames);

      console.log(`   Generating ${lessonPlan.length} lessons...`);

      for (let lessonIndex = 0; lessonIndex < lessonPlan.length; lessonIndex++) {
        const plan = lessonPlan[lessonIndex];

        // Insert lesson
        const [lesson] = await db
          .insert(schema.lessons)
          .values([
            {
              unitId: unit.id,
              title: plan.title,
              order: lessonIndex + 1,
              lessonType: plan.type,
            },
          ])
          .returning();

        totalLessons++;

        // Create challenges based on lesson type
        let challengeCount = 0;
        if (plan.type === "learn") {
          challengeCount = await createLearnLessonChallenges(lesson.id, plan.names);
        } else if (plan.type === "review") {
          challengeCount = await createReviewLessonChallenges(
            lesson.id,
            plan.names,
            plan.reviewPool || []
          );
        } else if (plan.type === "checkpoint") {
          challengeCount = await createCheckpointChallenges(lesson.id, plan.names);
        }

        totalChallenges += challengeCount;
        totalOptions += challengeCount * 3; // 3 options per challenge

        const typeEmoji =
          plan.type === "learn" ? "📖" : plan.type === "review" ? "🔄" : "✅";
        console.log(`   ${typeEmoji} ${plan.title} (${challengeCount} challenges)`);
      }

      // Update previous unit names for review mixing
      previousUnitNames = [...previousUnitNames, ...unitNames];
    }

    console.log("\n✅ Database seeded successfully with Quranic Vocabulary!");
    console.log(`
Summary:
- 1 Course: 99 Names of Allah
- ${unitCount} Units (${NAMES_PER_UNIT} names each)
- ${totalLessons} Lessons (learn + review + checkpoint)
- ${totalChallenges} Challenges
- ${totalOptions} Challenge Options

Lesson Structure per Unit:
- Learn Lessons: ${NAMES_PER_LESSON} names each
- Review Lessons: After every ${REVIEW_FREQUENCY} learn lessons
- Checkpoint: End of each unit
- Review Mix: ${Math.round(REVIEW_OLD_RATIO * 100)}% from previous units
`);
  } catch (error) {
    console.error("Error seeding database:", error);
    throw new Error("Failed to seed database");
  }
};

void main();
