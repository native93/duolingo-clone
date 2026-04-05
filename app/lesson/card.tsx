import { useCallback } from "react";

import Image from "next/image";
import { useAudio, useKey } from "react-use";

import { containsArabic, getTextDirection } from "@/lib/arabic";
import { challenges } from "@/db/schema";
import { cn } from "@/lib/utils";

// Parse mixed Arabic/English text like "الْقُدُّوسُ (Al-Quddus)"
function parseArabicText(text: string): { arabic: string; transliteration: string } | null {
  const match = text.match(/^(.+?)\s*\(([^)]+)\)$/);
  if (match && containsArabic(match[1])) {
    return { arabic: match[1].trim(), transliteration: match[2] };
  }
  return null;
}

// Render text with proper Arabic/English separation
function renderText(
  text: string,
  selected?: boolean,
  status?: "correct" | "wrong" | "none"
) {
  const parsed = parseArabicText(text);
  const colorClass = cn(
    selected && "text-sky-500",
    selected && status === "correct" && "text-green-500",
    selected && status === "wrong" && "text-rose-500"
  );

  if (parsed) {
    // Two-line layout: Arabic on top, transliteration below
    return (
      <div className="flex flex-col items-center text-center">
        <p
          dir="rtl"
          className={cn(
            "font-arabic text-2xl text-neutral-600 lg:text-3xl",
            colorClass
          )}
        >
          {parsed.arabic}
        </p>
        <p
          className={cn(
            "text-sm text-neutral-500 lg:text-base",
            colorClass
          )}
        >
          ({parsed.transliteration})
        </p>
      </div>
    );
  }

  // Regular text (pure Arabic or pure English)
  return (
    <p
      dir={getTextDirection(text)}
      className={cn(
        "text-sm text-neutral-600 lg:text-base",
        getTextDirection(text) === "rtl" && "font-arabic text-2xl lg:text-3xl",
        colorClass
      )}
    >
      {text}
    </p>
  );
}

type CardProps = {
  id: number;
  text: string;
  imageSrc: string | null;
  audioSrc: string | null;
  shortcut: string;
  selected?: boolean;
  onClick: () => void;
  status?: "correct" | "wrong" | "none";
  disabled?: boolean;
  type: (typeof challenges.$inferSelect)["type"];
};

export const Card = ({
  text,
  imageSrc,
  audioSrc,
  shortcut,
  selected,
  onClick,
  status,
  disabled,
  type,
}: CardProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [audio, _, controls] = useAudio({ src: audioSrc || "" });

  const handleClick = useCallback(() => {
    if (disabled) return;

    void controls.play();
    onClick();
  }, [disabled, onClick, controls]);

  useKey(shortcut, handleClick, {}, [handleClick]);

  return (
    <div
      onClick={handleClick}
      className={cn(
        "h-full cursor-pointer rounded-xl border-2 border-b-4 p-4 hover:bg-black/5 active:border-b-2 lg:p-6",
        selected && "border-sky-300 bg-sky-100 hover:bg-sky-100",
        selected &&
          status === "correct" &&
          "border-green-300 bg-green-100 hover:bg-green-100",
        selected &&
          status === "wrong" &&
          "border-rose-300 bg-rose-100 hover:bg-rose-100",
        disabled && "pointer-events-none hover:bg-white",
        type === "ASSIST" && "w-full lg:p-3"
      )}
    >
      {audio}
      {imageSrc && (
        <div className="relative mb-4 aspect-square max-h-[80px] w-full lg:max-h-[150px]">
          <Image src={imageSrc} fill alt={text} />
        </div>
      )}

      <div
        className={cn(
          "flex items-center justify-between",
          type === "ASSIST" && "flex-row-reverse"
        )}
      >
        {type === "ASSIST" && <div aria-hidden />}
        {renderText(text, selected, status)}

        <div
          className={cn(
            "flex h-[20px] w-[20px] items-center justify-center rounded-lg border-2 text-xs font-semibold text-neutral-400 lg:h-[30px] lg:w-[30px] lg:text-[15px]",
            selected && "border-sky-300 text-sky-500",
            selected &&
              status === "correct" &&
              "border-green-500 text-green-500",
            selected && status === "wrong" && "border-rose-500 text-rose-500"
          )}
        >
          {shortcut}
        </div>
      </div>
    </div>
  );
};
