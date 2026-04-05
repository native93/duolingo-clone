import type { Metadata } from "next";

export const siteConfig: Metadata = {
  title: "Asma ul Husna - Learn the 99 Names of Allah",
  description:
    "Learn and understand the 99 Beautiful Names of Allah through interactive lessons and quizzes. Bridge from recitation to comprehension.",
  keywords: [
    "99 names of allah",
    "asma ul husna",
    "islamic learning",
    "quran vocabulary",
    "arabic learning",
    "muslim education",
    "names of god",
    "divine attributes",
    "islamic app",
    "learn arabic",
    "quran comprehension",
  ] as Array<string>,
  authors: {
    name: "Asma ul Husna App",
    url: "https://github.com/sanidhyy/duolingo-clone",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
} as const;

export const links = {
  sourceCode: "https://github.com/sanidhyy/duolingo-clone",
  email: "sanidhya.verma12345@gmail.com",
} as const;
