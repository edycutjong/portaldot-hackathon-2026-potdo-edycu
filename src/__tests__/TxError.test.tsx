import { render, screen, fireEvent } from "@testing-library/react";
import { TxError } from "@/components/TxError";

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe("TxError", () => {
  it("renders Transaction Failed header", () => {
    render(<TxError txResult={{ status: "failed", error: "something broke" }} />);
    expect(screen.getByText("Transaction Failed")).toBeInTheDocument();
  });

  it("translates insufficient balance error", () => {
    render(
      <TxError
        txResult={{ status: "failed", error: "Insufficient balance for transfer" }}
      />
    );
    expect(
      screen.getByText(/Insufficient balance to complete/)
    ).toBeInTheDocument();
  });

  it("translates nonce error", () => {
    render(
      <TxError txResult={{ status: "failed", error: "Invalid nonce" }} />
    );
    expect(screen.getByText(/nonce mismatch/)).toBeInTheDocument();
  });

  it("translates signature error", () => {
    render(
      <TxError txResult={{ status: "failed", error: "Signature verification failed" }} />
    );
    expect(screen.getByText(/signature was rejected/)).toBeInTheDocument();
  });

  it("translates cancelled error", () => {
    render(
      <TxError txResult={{ status: "failed", error: "User cancelled the request" }} />
    );
    expect(screen.getByText(/cancelled the transaction/)).toBeInTheDocument();
  });

  it("shows raw error for unknown errors", () => {
    render(
      <TxError txResult={{ status: "failed", error: "Custom error code 42" }} />
    );
    const elements = screen.getAllByText("Custom error code 42");
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it("handles missing error string", () => {
    render(<TxError txResult={{ status: "failed" }} />);
    expect(
      screen.getByText(/unknown error/)
    ).toBeInTheDocument();
  });

  it("renders Try Again button when onRetry is provided", () => {
    const mockRetry = jest.fn();
    render(
      <TxError
        txResult={{ status: "failed", error: "something broke" }}
        onRetry={mockRetry}
      />
    );
    const btn = screen.getByText(/Try Again/);
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it("does not render Try Again button when onRetry is omitted", () => {
    render(<TxError txResult={{ status: "failed", error: "something broke" }} />);
    expect(screen.queryByText(/Try Again/)).not.toBeInTheDocument();
  });
});
