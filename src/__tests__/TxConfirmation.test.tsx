import { render, screen, act } from "@testing-library/react";
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
  beforeAll(() => {
    global.requestAnimationFrame = (cb) => setTimeout(cb, 16) as unknown as number;
    global.cancelAnimationFrame = (id) => clearTimeout(id as unknown as NodeJS.Timeout);
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders Transaction Confirmed header and runs animation", () => {
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

    act(() => {
      jest.advanceTimersByTime(2000);
    });
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
    render(<TxConfirmation txResult={{ status: "finalized", txHash: "0xabc123" }} />);
    expect(screen.getByText("Transaction Confirmed!")).toBeInTheDocument();
    expect(screen.queryByText(/Block #/)).not.toBeInTheDocument();
  });

  it("renders without txHash", () => {
    render(<TxConfirmation txResult={{ status: "finalized" }} />);
    expect(screen.getByText("Transaction Confirmed!")).toBeInTheDocument();
    expect(screen.queryByText("View on Explorer")).not.toBeInTheDocument();
  });

  it("shows 'Demo Transaction' badge for demo hashes", () => {
    render(
      <TxConfirmation
        txResult={{
          status: "finalized",
          txHash: "0xdemo_tx_hash_finalized",
          blockNumber: 42000,
        }}
      />
    );
    expect(screen.getByText("Demo Transaction ✨")).toBeInTheDocument();
    expect(screen.queryByText("View on Explorer →")).not.toBeInTheDocument();
  });

  it("shows explorer link for real hashes", () => {
    render(
      <TxConfirmation
        txResult={{
          status: "finalized",
          txHash: "0xabc123real",
          explorerUrl: "https://portaldot.subscan.io/extrinsic/0xabc123real",
        }}
      />
    );
    expect(screen.getByText("View on Explorer →")).toBeInTheDocument();
    expect(screen.queryByText("Demo Transaction ✨")).not.toBeInTheDocument();
  });
});
