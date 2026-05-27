import { render, screen } from "@testing-library/react";
import { TransferCard } from "@/components/TransferCard";
import type { TransferIntent } from "@/lib/types";

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe("TransferCard", () => {
  const intent: TransferIntent = {
    action: "transfer",
    to: "Alice",
    toAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    amount: 10,
  };

  it("renders transfer preview header", () => {
    render(<TransferCard intent={intent} />);
    expect(screen.getByText("Transfer Preview")).toBeInTheDocument();
  });

  it("shows recipient name", () => {
    render(<TransferCard intent={intent} />);
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
  });

  it("shows amount", () => {
    render(<TransferCard intent={intent} />);
    expect(screen.getByText("10.00 POT")).toBeInTheDocument();
  });

  it("shows execute button when balance is sufficient", () => {
    render(<TransferCard intent={intent} isConnected={true} />);
    expect(screen.getByText("✅ Execute Transfer")).toBeInTheDocument();
  });

  it("shows gas estimate", () => {
    render(<TransferCard intent={intent} />);
    expect(screen.getByText("~0.001 POT")).toBeInTheDocument();
  });

  it("shows insufficient balance warning", () => {
    render(<TransferCard intent={intent} senderBalance={100n} isConnected={true} />);
    expect(screen.getByText(/Insufficient Balance/)).toBeInTheDocument();
    expect(screen.getByText("Cannot Execute")).toBeInTheDocument();
  });

  it("shows balance info when provided", () => {
    render(
      <TransferCard intent={intent} senderBalance={2000000000000000n} />
    );
    expect(screen.getByText("20.0000 POT")).toBeInTheDocument();
  });

  it("shows Connect Wallet button when disconnected", () => {
    render(<TransferCard intent={intent} isConnected={false} />);
    expect(screen.getByText("🔌 Connect Wallet to Execute")).toBeInTheDocument();
  });

  it("shows Processing... and is disabled when status is pending", () => {
    render(<TransferCard intent={intent} isConnected={true} status="pending" />);
    const button = screen.getByText("⏳ Processing...");
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });
});
