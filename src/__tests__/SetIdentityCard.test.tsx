import { render, screen, fireEvent } from "@testing-library/react";
import { SetIdentityCard } from "@/components/SetIdentityCard";
import type { SetIdentityIntent } from "@/lib/types";

describe("SetIdentityCard", () => {
  const baseIntent: SetIdentityIntent = {
    action: "set_identity",
    displayName: "Edy",
  };

  it("renders identity preview with display name", () => {
    render(<SetIdentityCard intent={baseIntent} isConnected={true} onExecute={() => {}} />);
    expect(screen.getByText("Set Identity Preview")).toBeInTheDocument();
    expect(screen.getByText("Edy")).toBeInTheDocument();
    expect(screen.getByText("Set Display Name")).toBeInTheDocument();
    expect(screen.getByText("identity.setIdentity")).toBeInTheDocument();
  });

  it("shows Set Identity button when connected", () => {
    render(<SetIdentityCard intent={baseIntent} isConnected={true} onExecute={() => {}} />);
    expect(screen.getByText("Set Identity")).toBeInTheDocument();
  });

  it("shows Connect Wallet when not connected", () => {
    render(<SetIdentityCard intent={baseIntent} isConnected={false} onExecute={() => {}} />);
    expect(screen.getByText("Connect Wallet")).toBeInTheDocument();
  });

  it("shows Processing... when pending", () => {
    render(
      <SetIdentityCard
        intent={baseIntent}
        isConnected={true}
        status="pending"
        onExecute={() => {}}
      />
    );
    expect(screen.getByText("Processing...")).toBeInTheDocument();
  });

  it("shows Processing... when submitted", () => {
    render(
      <SetIdentityCard
        intent={baseIntent}
        isConnected={true}
        status="submitted"
        onExecute={() => {}}
      />
    );
    expect(screen.getByText("Processing...")).toBeInTheDocument();
  });

  it("calls onExecute when button is clicked", () => {
    const handleExecute = jest.fn();
    render(<SetIdentityCard intent={baseIntent} isConnected={true} onExecute={handleExecute} />);
    fireEvent.click(screen.getByText("Set Identity"));
    expect(handleExecute).toHaveBeenCalledTimes(1);
  });

  it("disables button when pending", () => {
    render(
      <SetIdentityCard
        intent={baseIntent}
        isConnected={true}
        status="pending"
        onExecute={() => {}}
      />
    );
    expect(screen.getByText("Processing...")).toBeDisabled();
  });

  it("has correct test id", () => {
    render(<SetIdentityCard intent={baseIntent} isConnected={true} onExecute={() => {}} />);
    expect(document.getElementById("set-identity-card")).toBeInTheDocument();
    expect(document.getElementById("set-identity-execute")).toBeInTheDocument();
  });
});
