import { render, screen, fireEvent } from "@testing-library/react";
import { FAQSection } from "@/components/landing/FAQSection";

describe("FAQSection", () => {
  it("renders all questions in the list", () => {
    render(<FAQSection />);
    expect(screen.getByText("Do I need an API key to try Potdo?")).toBeInTheDocument();
    expect(
      screen.getByText("How does the AI understand my transaction intent?")
    ).toBeInTheDocument();
    expect(screen.getByText("Is this safe to use with real tokens?")).toBeInTheDocument();
    expect(screen.getByText("What is Portaldot?")).toBeInTheDocument();
  });

  it("toggles the open/close state of an accordion item on click", () => {
    render(<FAQSection />);
    const firstQuestion = screen.getByText("Do I need an API key to try Potdo?");
    const button = firstQuestion.closest("button")!;

    // Initial state: not expanded
    expect(button).toHaveAttribute("aria-expanded", "false");

    // Click to open
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    // Click to close
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("closes previously open item when opening a new item", () => {
    render(<FAQSection />);
    const q1 = screen.getByText("Do I need an API key to try Potdo?").closest("button")!;
    const q2 = screen
      .getByText("How does the AI understand my transaction intent?")
      .closest("button")!;

    // Open first question
    fireEvent.click(q1);
    expect(q1).toHaveAttribute("aria-expanded", "true");
    expect(q2).toHaveAttribute("aria-expanded", "false");

    // Open second question
    fireEvent.click(q2);
    expect(q1).toHaveAttribute("aria-expanded", "false");
    expect(q2).toHaveAttribute("aria-expanded", "true");
  });
});
