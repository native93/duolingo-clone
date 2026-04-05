import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import * as fs from "fs";
import * as path from "path";

import * as schema from "@/db/schema";

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
  transliteration: string;
  meaning: string;
  audioSrc: string;
}[];

// Helper to get random wrong options (excluding the correct answer)
function getRandomWrongOptions(
  correctIndex: number,
  count: number
): typeof namesData {
  const options: typeof namesData = [];
  const usedIndices = new Set<number>([correctIndex]);

  while (options.length < count) {
    const randomIndex = Math.floor(Math.random() * namesData.length);
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      options.push(namesData[randomIndex]);
    }
  }

  return options;
}

const main = async () => {
  try {
    console.log("🕌 Seeding database with 99 Names of Allah...\n");

    // Delete all existing data
    console.log("Clearing existing data...");
    await Promise.all([
      db.delete(schema.challengeProgress),
      db.delete(schema.challengeOptions),
      db.delete(schema.challenges),
      db.delete(schema.lessons),
      db.delete(schema.units),
      db.delete(schema.userProgress),
      db.delete(schema.courses),
    ]);

    // Insert the course
    console.log("Creating course: Asma ul Husna...");
    const [course] = await db
      .insert(schema.courses)
      .values([
        {
          title: "Asma ul Husna",
          imageSrc: "/kaaba.svg", // We'll need to add this icon
        },
      ])
      .returning();

    // Split 99 names into 10 units
    const namesPerUnit = 10;
    const unitCount = Math.ceil(namesData.length / namesPerUnit);

    for (let unitIndex = 0; unitIndex < unitCount; unitIndex++) {
      const startName = unitIndex * namesPerUnit + 1;
      const endName = Math.min((unitIndex + 1) * namesPerUnit, 99);

      console.log(`\nCreating Unit ${unitIndex + 1}: Names ${startName}-${endName}...`);

      // Insert unit
      const [unit] = await db
        .insert(schema.units)
        .values([
          {
            courseId: course.id,
            title: `Unit ${unitIndex + 1}`,
            description: `Names ${startName}-${endName} of Allah`,
            order: unitIndex + 1,
          },
        ])
        .returning();

      // Get names for this unit
      const unitNames = namesData.slice(
        unitIndex * namesPerUnit,
        (unitIndex + 1) * namesPerUnit
      );

      // Create one lesson per name in this unit
      for (let lessonIndex = 0; lessonIndex < unitNames.length; lessonIndex++) {
        const name = unitNames[lessonIndex];

        // Insert lesson
        const [lesson] = await db
          .insert(schema.lessons)
          .values([
            {
              unitId: unit.id,
              title: name.transliteration,
              order: lessonIndex + 1,
            },
          ])
          .returning();

        // Create 3 challenges per lesson:
        // 1. SELECT: "What does [Arabic] mean?" (with images/cards)
        // 2. ASSIST: Match the meaning to the Arabic (audio-based)
        // 3. SELECT: "Which name means [meaning]?" (reverse quiz)

        // Challenge 1: What does this Arabic name mean?
        const [challenge1] = await db
          .insert(schema.challenges)
          .values([
            {
              lessonId: lesson.id,
              type: "SELECT",
              question: `What does "${name.arabic}" mean?`,
              order: 1,
            },
          ])
          .returning();

        // Get 2 random wrong meanings
        const wrongOptions1 = getRandomWrongOptions(name.number - 1, 2);

        // Shuffle options (correct answer at random position)
        const options1 = [
          { ...name, correct: true },
          { ...wrongOptions1[0], correct: false },
          { ...wrongOptions1[1], correct: false },
        ].sort(() => Math.random() - 0.5);

        await db.insert(schema.challengeOptions).values(
          options1.map((opt) => ({
            challengeId: challenge1.id,
            correct: opt.correct,
            text: opt.meaning,
            audioSrc: opt.audioSrc,
          }))
        );

        // Challenge 2: ASSIST type - listen and match
        const [challenge2] = await db
          .insert(schema.challenges)
          .values([
            {
              lessonId: lesson.id,
              type: "ASSIST",
              question: `"${name.meaning}"`,
              order: 2,
            },
          ])
          .returning();

        const wrongOptions2 = getRandomWrongOptions(name.number - 1, 2);

        const options2 = [
          { ...name, correct: true },
          { ...wrongOptions2[0], correct: false },
          { ...wrongOptions2[1], correct: false },
        ].sort(() => Math.random() - 0.5);

        await db.insert(schema.challengeOptions).values(
          options2.map((opt) => ({
            challengeId: challenge2.id,
            correct: opt.correct,
            text: opt.arabic,
            audioSrc: opt.audioSrc,
          }))
        );

        // Challenge 3: Reverse - which name means this?
        const [challenge3] = await db
          .insert(schema.challenges)
          .values([
            {
              lessonId: lesson.id,
              type: "SELECT",
              question: `Which name means "${name.meaning}"?`,
              order: 3,
            },
          ])
          .returning();

        const wrongOptions3 = getRandomWrongOptions(name.number - 1, 2);

        const options3 = [
          { ...name, correct: true },
          { ...wrongOptions3[0], correct: false },
          { ...wrongOptions3[1], correct: false },
        ].sort(() => Math.random() - 0.5);

        await db.insert(schema.challengeOptions).values(
          options3.map((opt) => ({
            challengeId: challenge3.id,
            correct: opt.correct,
            text: `${opt.arabic} (${opt.transliteration})`,
            audioSrc: opt.audioSrc,
          }))
        );

        console.log(`  ✓ Lesson: ${name.transliteration} - ${name.meaning}`);
      }
    }

    console.log("\n✅ Database seeded successfully with 99 Names of Allah!");
    console.log(`
Summary:
- 1 Course: Asma ul Husna
- ${unitCount} Units
- 99 Lessons (one per name)
- 297 Challenges (3 per name)
- 891 Challenge Options (3 per challenge)
`);
  } catch (error) {
    console.error("Error seeding database:", error);
    throw new Error("Failed to seed database");
  }
};

void main();
