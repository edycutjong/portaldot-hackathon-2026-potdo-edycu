import { render, screen } from "@testing-library/react";
import { TxConfirmation } from "@/components/TxConfirmation";

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe("TxConfirmation", () => {
  it("renders Transaction Confirmed header", () => {
    render(
      <TxConfirmation
        txResult={{
          status: "finalized",
          txHash: "0xabc123",
          blockNumber: 42000,
        }}
      />
    );
    expect(screen.getByText("Transaction Confirmed!")).toBeInTheDocument();
  });

  it("shows block number", () => {
    render(
      <TxConfirmation
        txResult={{
          status: "finalized",
          txHash: "0xabc123",
          blockNumber: 42000,
        }}
      />
    );
    expect(screen.getByText("Block #42,000")).toBeInTheDocument();
  });

  it("shows explorer link", () => {
    render(
      <TxConfirmation
        txResult={{
          status: "finalized",
          txHash: "0xabc123",
          explorerUrl: "https://explorer.example.com/tx/0xabc123",
        }}
      />
    );
    expect(screen.getByText("View on Explorer →")).toBeInTheDocument();
  });

  it("renders without block number", () => {
    render(
      <TxConfirmation txResult={{ status: "finalized", txHash: "0xabc123" }} />
    );
    expect(screen.getByText("Transaction Confirmed!")).toBeInTheDocument();
    expect(screen.queryByText(/Block #/)).not.toBeInTheDocument();
  });

  it("renders without txHash", () => {
    render(<TxConfirmation txResult={{ status: "finalized" }} />);
    expect(screen.getByText("Transaction Confirmed!")).toBeInTheDocument();
    expect(screen.queryByText("View on Explorer")).not.toBeInTheDocument();
  });
});
