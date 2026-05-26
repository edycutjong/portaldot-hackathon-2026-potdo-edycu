import { render, screen } from "@testing-library/react";
import { CommandHistory } from "@/components/CommandHistory";
import type { HistoryEntry } from "@/lib/types";

describe("CommandHistory", () => {
  it("renders 'No commands yet' when empty", () => {
    render(<CommandHistory entries={[]} />);
    expect(screen.getByText(/No commands yet/)).toBeInTheDocument();
  });

  it("renders Command History heading", () => {
    render(<CommandHistory entries={[]} />);
    expect(screen.getByText("Command History")).toBeInTheDocument();
  });

  it("renders history entries", () => {
    const entries: HistoryEntry[] = [
      {
        id: "1",
        command: "Send 10 POT to Alice",
        status: "finalized",
        timestamp: new Date(),
      },
      {
        id: "2",
        command: "Check balance",
        status: "parsed",
        timestamp: new Date(),
      },
    ];
    render(<CommandHistory entries={entries} />);
    expect(screen.getByText("Send 10 POT to Alice")).toBeInTheDocument();
    expect(screen.getByText("Check balance")).toBeInTheDocument();
  });

  it("shows status icons for different statuses", () => {
    const entries: HistoryEntry[] = [
      { id: "1", command: "cmd1", status: "finalized", timestamp: new Date() },
      { id: "2", command: "cmd2", status: "failed", timestamp: new Date() },
      { id: "3", command: "cmd3", status: "pending", timestamp: new Date() },
    ];
    render(<CommandHistory entries={entries} />);
    expect(screen.getByText("🟢")).toBeInTheDocument();
    expect(screen.getByText("🔴")).toBeInTheDocument();
    expect(screen.getByText("🟡")).toBeInTheDocument();
  });
});
