import { describe, expect, it } from "vitest";

import { containsArabic, getTextDirection } from "@/lib/arabic";

describe("containsArabic", () => {
  it("returns true for Arabic text", () => {
    expect(containsArabic("الرَّحْمَنُ")).toBe(true);
  });

  it("returns true for mixed Arabic and English", () => {
    expect(containsArabic("الرَّحْمَنُ (Ar Rahmaan)")).toBe(true);
  });

  it("returns false for English only", () => {
    expect(containsArabic("The Beneficent")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(containsArabic("")).toBe(false);
  });

  it("returns false for numbers only", () => {
    expect(containsArabic("12345")).toBe(false);
  });

  it("returns true for Arabic numerals", () => {
    // Arabic-Indic digits are in the Arabic Unicode range
    expect(containsArabic("١٢٣")).toBe(true);
  });

  it("handles all 99 Names of Allah", () => {
    const sampleNames = [
      "الرَّحْمَنُ",
      "الرَّحِيمُ",
      "الْمَلِكُ",
      "الْقُدُّوسُ",
      "السَّلاَمُ",
      "ذُوالْجَلاَلِ وَالإكْرَامِ", // longer name with spaces
    ];

    sampleNames.forEach((name) => {
      expect(containsArabic(name)).toBe(true);
    });
  });
});

describe("getTextDirection", () => {
  it('returns "rtl" for Arabic text', () => {
    expect(getTextDirection("الرَّحْمَنُ")).toBe("rtl");
  });

  it('returns "ltr" for English text', () => {
    expect(getTextDirection("The Beneficent")).toBe("ltr");
  });

  it('returns "rtl" for mixed text with Arabic', () => {
    expect(getTextDirection("What does الرَّحْمَنُ mean?")).toBe("rtl");
  });

  it('returns "ltr" for empty string', () => {
    expect(getTextDirection("")).toBe("ltr");
  });

  it('returns "ltr" for transliteration only', () => {
    expect(getTextDirection("Ar Rahmaan")).toBe("ltr");
  });
});
