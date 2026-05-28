import { render, screen } from "@testing-library/react";
import { BatchCard } from "@/components/BatchCard";
import type { BatchTransferIntent } from "@/lib/types";

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe("BatchCard", () => {
  const intent: BatchTransferIntent = {
    action: "batch_transfer",
    transfers: [
      {
        to: "Alice",
        toAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        amount: 5,
      },
      {
        to: "Bob",
        toAddress: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        amount: 5,
      },
    ],
  };

  it("renders batch airdrop header", () => {
    render(<BatchCard intent={intent} />);
    expect(screen.getByText("Batch Airdrop Preview")).toBeInTheDocument();
  });

  it("shows recipient count", () => {
    render(<BatchCard intent={intent} />);
    expect(screen.getByText("2 recipients")).toBeInTheDocument();
  });

  it("shows recipient names", () => {
    render(<BatchCard intent={intent} />);
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
    expect(screen.getByText(/Bob/)).toBeInTheDocument();
  });

  it("shows total amount", () => {
    render(<BatchCard intent={intent} />);
    expect(screen.getByText("10.00 POT")).toBeInTheDocument();
  });

  it("renders Execute Batch button", () => {
    render(<BatchCard intent={intent} isConnected={true} />);
    expect(screen.getByText("📦 Execute Batch")).toBeInTheDocument();
  });

  it("renders Connect Wallet button when disconnected", () => {
    render(<BatchCard intent={intent} isConnected={false} />);
    expect(screen.getByText("🔌 Connect Wallet to Execute")).toBeInTheDocument();
  });

  it("shows balance info when provided", () => {
    render(<BatchCard intent={intent} senderBalance={2000000000000000n} isConnected={true} />);
    expect(screen.getByText("20.0000 POT")).toBeInTheDocument();
  });

  it("shows insufficient balance warning when balance is insufficient", () => {
    render(<BatchCard intent={intent} senderBalance={100n} isConnected={true} />);
    expect(screen.getByText(/Insufficient Balance/)).toBeInTheDocument();
    expect(screen.getByText("Cannot Execute")).toBeInTheDocument();
  });

  it("shows Processing... and is disabled when status is pending", () => {
    render(<BatchCard intent={intent} isConnected={true} status="pending" />);
    const button = screen.getByText("⏳ Processing...");
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it("shows self-transfer warning when any recipient in batch is sender", () => {
    render(
      <BatchCard
        intent={intent}
        isConnected={true}
        senderAddress="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
      />
    );
    expect(
      screen.getByText(
        /Cannot send tokens to yourself! One or more recipients match the sender address./
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Cannot Send to Yourself")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cannot Send to Yourself" })).toBeDisabled();
  });
});
