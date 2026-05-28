import { render, screen } from "@testing-library/react";
import { MessageBubble } from "@/components/MessageBubble";
import type { ChatMessage } from "@/lib/types";

describe("MessageBubble", () => {
  it("renders user message with 'You' label", () => {
    const msg: ChatMessage = {
      id: "1",
      role: "user",
      content: "Send 10 POT to Alpha",
      timestamp: new Date(),
    };
    render(<MessageBubble message={msg} />);
    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByText("Send 10 POT to Alpha")).toBeInTheDocument();
  });

  it("renders user message with name and address when connected", () => {
    const msg: ChatMessage = {
      id: "1",
      role: "user",
      content: "Send 10 POT to Alpha",
      timestamp: new Date(),
    };
    render(
      <MessageBubble
        message={msg}
        senderAddress="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
        senderName="Alpha"
      />
    );
    expect(screen.getByText(/You/)).toBeInTheDocument();
    expect(screen.getByText(/\(Alpha - 5Grwva.*GKutQY\)/)).toBeInTheDocument();
    expect(screen.getByText("Send 10 POT to Alpha")).toBeInTheDocument();
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

  it("renders user message with fallback name 'Guest' if senderName is not provided", () => {
    const msg: ChatMessage = {
      id: "1",
      role: "user",
      content: "Send 10 POT to Alpha",
      timestamp: new Date(),
    };
    render(
      <MessageBubble
        message={msg}
        senderAddress="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
      />
    );
    expect(screen.getByText(/You/)).toBeInTheDocument();
    expect(screen.getByText(/\(Guest - 5Grwva.*GKutQY\)/)).toBeInTheDocument();
  });
});
