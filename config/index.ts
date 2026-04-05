import type { Metadata } from "next";

export const siteConfig: Metadata = {
  title: "Quranic Vocabulary - Learn the Language of the Quran",
  description:
    "Master Quranic Arabic vocabulary through interactive lessons. Start with the 99 Names of Allah and build your understanding of the Quran.",
  keywords: [
    "quranic vocabulary",
    "quran arabic",
    "99 names of allah",
    "asma ul husna",
    "islamic learning",
    "arabic learning",
    "muslim education",
    "quran comprehension",
    "learn quranic arabic",
    "understand quran",
  ] as Array<string>,
  authors: {
    name: "Quranic Vocabulary App",
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
