import { render, screen } from "@testing-library/react";
import { MessageBubble } from "@/components/MessageBubble";
import type { ChatMessage } from "@/lib/types";

describe("MessageBubble", () => {
  it("renders user message with 'You' label", () => {
    const msg: ChatMessage = {
      id: "1",
      role: "user",
      content: "Send 10 POT to Alice",
      timestamp: new Date(),
    };
    render(<MessageBubble message={msg} />);
    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByText("Send 10 POT to Alice")).toBeInTheDocument();
  });

  it("renders assistant message with 'Potdo' label", () => {
    const msg: ChatMessage = {
      id: "2",
      role: "assistant",
      content: "I'll prepare the transfer.",
      timestamp: new Date(),
    };
    render(<MessageBubble message={msg} />);
    expect(screen.getByText("Potdo")).toBeInTheDocument();
    expect(screen.getByText("I'll prepare the transfer.")).toBeInTheDocument();
  });
});
