import Image from "next/image";

import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <div className="hidden h-20 w-full border-t-2 border-slate-200 p-2 lg:block">
      <div className="mx-auto flex h-full max-w-screen-lg items-center justify-evenly">
        <Button size="lg" variant="ghost" className="w-full cursor-default">
          <Image
            src="/kaaba.svg"
            alt="99 Names"
            height={32}
            width={40}
            className="mr-4"
          />
          99 Names of Allah
        </Button>

        <Button
          size="lg"
          variant="ghost"
          className="w-full cursor-default opacity-50"
        >
          <span className="mr-4 text-2xl">📖</span>
          Common Words
          <span className="ml-2 text-xs text-muted-foreground">(Soon)</span>
        </Button>

        <Button
          size="lg"
          variant="ghost"
          className="w-full cursor-default opacity-50"
        >
          <span className="mr-4 text-2xl">🕌</span>
          Surah Vocabulary
          <span className="ml-2 text-xs text-muted-foreground">(Soon)</span>
        </Button>

        <Button
          size="lg"
          variant="ghost"
          className="w-full cursor-default opacity-50"
        >
          <span className="mr-4 text-2xl">🤲</span>
          Dua Phrases
          <span className="ml-2 text-xs text-muted-foreground">(Soon)</span>
        </Button>
      </div>
    </div>
  );
};
