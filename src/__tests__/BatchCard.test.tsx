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
    render(<BatchCard intent={intent} />);
    expect(screen.getByText("📦 Execute Batch")).toBeInTheDocument();
  });
});
