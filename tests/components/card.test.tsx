import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Card } from "@/app/lesson/card";

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string }) => <img alt={alt} {...props} />,
}));

// Mock react-use
vi.mock("react-use", () => ({
  useAudio: () => [<audio key="mock-audio" />, {}, { play: vi.fn() }],
  useKey: vi.fn(),
}));

const defaultProps = {
  id: 1,
  text: "Test text",
  imageSrc: null,
  audioSrc: null,
  shortcut: "1",
  onClick: vi.fn(),
  type: "SELECT" as const,
};

describe("Card", () => {
  it("renders English text with LTR direction", () => {
    render(<Card {...defaultProps} text="The Beneficent" />);

    const text = screen.getByText("The Beneficent");
    expect(text).toHaveAttribute("dir", "ltr");
  });

  it("renders Arabic text with RTL direction", () => {
    render(<Card {...defaultProps} text="الرَّحْمَنُ" />);

    const text = screen.getByText("الرَّحْمَنُ");
    expect(text).toHaveAttribute("dir", "rtl");
  });

  it("applies font-arabic class to Arabic text", () => {
    render(<Card {...defaultProps} text="الرَّحْمَنُ" />);

    const text = screen.getByText("الرَّحْمَنُ");
    expect(text).toHaveClass("font-arabic");
  });

  it("does not apply font-arabic class to English text", () => {
    render(<Card {...defaultProps} text="The Beneficent" />);

    const text = screen.getByText("The Beneficent");
    expect(text).not.toHaveClass("font-arabic");
  });

  it("applies larger text size to Arabic text", () => {
    render(<Card {...defaultProps} text="الرَّحْمَنُ" />);

    const text = screen.getByText("الرَّحْمَنُ");
    expect(text).toHaveClass("text-2xl");
  });

  it("renders keyboard shortcut", () => {
    render(<Card {...defaultProps} shortcut="1" />);

    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("applies selected styles when selected", () => {
    render(<Card {...defaultProps} selected={true} status="none" />);

    const text = screen.getByText(defaultProps.text);
    expect(text).toHaveClass("text-sky-500");
  });

  it("applies correct styles when correct", () => {
    render(<Card {...defaultProps} selected={true} status="correct" />);

    const text = screen.getByText(defaultProps.text);
    expect(text).toHaveClass("text-green-500");
  });

  it("applies wrong styles when wrong", () => {
    render(<Card {...defaultProps} selected={true} status="wrong" />);

    const text = screen.getByText(defaultProps.text);
    expect(text).toHaveClass("text-rose-500");
  });

  it("renders image when imageSrc provided", () => {
    render(<Card {...defaultProps} imageSrc="/test.svg" />);

    expect(screen.getByAltText(defaultProps.text)).toBeInTheDocument();
  });

  it("handles mixed Arabic-English text (transliteration with Arabic)", () => {
    render(<Card {...defaultProps} text="الرَّحْمَنُ (Ar Rahmaan)" />);

    // The component splits Arabic + transliteration into two elements
    const arabicText = screen.getByText("الرَّحْمَنُ");
    expect(arabicText).toHaveAttribute("dir", "rtl");
    expect(screen.getByText("(Ar Rahmaan)")).toBeInTheDocument();
  });
});
