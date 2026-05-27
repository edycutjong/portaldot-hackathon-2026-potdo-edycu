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
    to: "Alpha",
    toAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    amount: 10,
  };

  it("renders transfer preview header", () => {
    render(<TransferCard intent={intent} />);
    expect(screen.getByText("Transfer Preview")).toBeInTheDocument();
  });

  it("shows recipient name", () => {
    render(<TransferCard intent={intent} />);
    expect(screen.getByText(/Alpha/)).toBeInTheDocument();
  });

  it("shows amount", () => {
    render(<TransferCard intent={intent} />);
    expect(screen.getByText("10.0000 POT")).toBeInTheDocument();
  });

  it("shows execute button when balance is sufficient", () => {
    render(<TransferCard intent={intent} isConnected={true} />);
    expect(screen.getByText("✅ Execute Transfer")).toBeInTheDocument();
  });

  it("shows gas estimate", () => {
    render(<TransferCard intent={intent} />);
    expect(screen.getByText("~0.0012 POT")).toBeInTheDocument();
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

  it("renders Max transfer correctly", () => {
    const maxIntent: TransferIntent = {
      action: "transfer",
      to: "Alpha",
      toAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      amount: -1,
    };
    render(<TransferCard intent={maxIntent} senderBalance={100000000000000000n} isConnected={true} />);
    expect(screen.getByText("Max (999.9988 POT)")).toBeInTheDocument();
    expect(screen.getAllByText(/1000\.0000 POT/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/0\.0000 POT/).length).toBeGreaterThan(0);
  });

  it("renders From details with senderAddress and senderName", () => {
    render(
      <TransferCard
        intent={intent}
        senderAddress="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
        senderName="Alpha"
      />
    );
    expect(screen.getByText((_content, element) => {
      return element?.tagName === "SPAN" && (element?.textContent?.includes("You (Alpha - ") || false);
    })).toBeInTheDocument();
  });

  it("renders From details with senderAddress but no senderName (Guest fallback)", () => {
    render(
      <TransferCard
        intent={intent}
        senderAddress="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
      />
    );
    expect(screen.getByText((_content, element) => {
      return element?.tagName === "SPAN" && (element?.textContent?.includes("You (Guest - ") || false);
    })).toBeInTheDocument();
  });

  it("shows self-transfer warning when recipient is sender", () => {
    render(
      <TransferCard
        intent={intent}
        isConnected={true}
        senderAddress="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
      />
    );
    expect(screen.getByText(/Cannot send tokens to yourself!/)).toBeInTheDocument();
    expect(screen.getByText("Cannot Send to Yourself")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cannot Send to Yourself" })).toBeDisabled();
  });
});
