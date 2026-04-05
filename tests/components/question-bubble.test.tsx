import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { QuestionBubble } from "@/app/lesson/question-bubble";

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string }) => <img alt={alt} {...props} />,
}));

describe("QuestionBubble", () => {
  it("renders English question with LTR direction", () => {
    render(<QuestionBubble question="What does this mean?" />);

    const bubble = screen.getByText("What does this mean?");
    expect(bubble).toHaveAttribute("dir", "ltr");
  });

  it("renders Arabic question with RTL direction", () => {
    render(<QuestionBubble question='What does "الرَّحْمَنُ" mean?' />);

    const bubble = screen.getByText(/الرَّحْمَنُ/);
    expect(bubble).toHaveAttribute("dir", "rtl");
  });

  it("applies font-arabic class to Arabic text", () => {
    render(<QuestionBubble question="الرَّحْمَنُ" />);

    const bubble = screen.getByText("الرَّحْمَنُ");
    expect(bubble).toHaveClass("font-arabic");
  });

  it("does not apply font-arabic class to English text", () => {
    render(<QuestionBubble question="The Beneficent" />);

    const bubble = screen.getByText("The Beneficent");
    expect(bubble).not.toHaveClass("font-arabic");
  });

  it("renders mascot image", () => {
    render(<QuestionBubble question="Test question" />);

    const images = screen.getAllByAltText("Mascot");
    expect(images.length).toBeGreaterThan(0);
  });
});
