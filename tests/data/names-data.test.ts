import * as fs from "fs";
import * as path from "path";
import { describe, expect, it } from "vitest";

type NameData = {
  number: number;
  arabic: string;
  transliteration: string;
  meaning: string;
  audioSrc: string;
};

describe("99 Names JSON Data", () => {
  const dataPath = path.join(process.cwd(), "public/data/99-names-with-audio.json");
  const namesData: NameData[] = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  it("contains exactly 99 names", () => {
    expect(namesData).toHaveLength(99);
  });

  it("has sequential numbers from 1 to 99", () => {
    namesData.forEach((name, index) => {
      expect(name.number).toBe(index + 1);
    });
  });

  it("all names have required fields", () => {
    namesData.forEach((name) => {
      expect(name).toHaveProperty("number");
      expect(name).toHaveProperty("arabic");
      expect(name).toHaveProperty("transliteration");
      expect(name).toHaveProperty("meaning");
      expect(name).toHaveProperty("audioSrc");
    });
  });

  it("all names have non-empty Arabic text", () => {
    namesData.forEach((name) => {
      expect(name.arabic.length).toBeGreaterThan(0);
    });
  });

  it("all names have non-empty transliteration", () => {
    namesData.forEach((name) => {
      expect(name.transliteration.length).toBeGreaterThan(0);
    });
  });

  it("all names have non-empty meaning", () => {
    namesData.forEach((name) => {
      expect(name.meaning.length).toBeGreaterThan(0);
    });
  });

  it("all audio paths follow correct format", () => {
    namesData.forEach((name) => {
      expect(name.audioSrc).toMatch(/^\/audio\/\d{2}-[\w-]+\.mp3$/);
    });
  });

  it("audio files exist on disk", () => {
    namesData.forEach((name) => {
      const audioPath = path.join(process.cwd(), "public", name.audioSrc);
      expect(fs.existsSync(audioPath)).toBe(true);
    });
  });

  it("first name is Ar Rahmaan (The Beneficent)", () => {
    expect(namesData[0].transliteration).toBe("Ar Rahmaan");
    expect(namesData[0].meaning).toBe("The Beneficent");
  });

  it("last name is As Saboor (The Patient One)", () => {
    expect(namesData[98].transliteration).toBe("As Saboor");
    expect(namesData[98].meaning).toBe("The Patient One");
  });

  it("all Arabic text contains Arabic characters", () => {
    const arabicPattern = /[\u0600-\u06FF]/;
    namesData.forEach((name) => {
      expect(arabicPattern.test(name.arabic)).toBe(true);
    });
  });

  it("transliterations do not contain Arabic characters", () => {
    const arabicPattern = /[\u0600-\u06FF]/;
    namesData.forEach((name) => {
      expect(arabicPattern.test(name.transliteration)).toBe(false);
    });
  });
});
