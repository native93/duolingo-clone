/**
 * Checks if a string contains Arabic characters
 */
export function containsArabic(text: string): boolean {
  // Arabic Unicode range: \u0600-\u06FF (Arabic) and \u0750-\u077F (Arabic Supplement)
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F]/;
  return arabicPattern.test(text);
}

/**
 * Returns "rtl" if text contains Arabic, "ltr" otherwise
 */
export function getTextDirection(text: string): "rtl" | "ltr" {
  return containsArabic(text) ? "rtl" : "ltr";
}
