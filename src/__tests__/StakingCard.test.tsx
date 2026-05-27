import { render, screen, fireEvent } from "@testing-library/react";
import { StakingCard } from "@/components/StakingCard";
import type { StakeIntent, UnstakeIntent } from "@/lib/types";

describe("StakingCard", () => {
  const mockOnExecute = jest.fn();

  beforeEach(() => {
    mockOnExecute.mockClear();
  });

  it("renders Stake Preview with validator and executes successfully", () => {
    const intent: StakeIntent = {
      action: "stake",
      amount: 100,
      validator: "ValidatorX",
    };

    render(
      <StakingCard
        intent={intent}
        senderBalance={BigInt(200 * 1e14)} // 200 POT
        isConnected={true}
        onExecute={mockOnExecute}
      />
    );

    expect(screen.getByText("Stake Preview")).toBeInTheDocument();
    expect(screen.getByText("Bond & Nominate")).toBeInTheDocument();
    expect(screen.getByText("100 POT")).toBeInTheDocument();
    expect(screen.getByText("ValidatorX")).toBeInTheDocument();

    const button = screen.getByRole("button", { name: "Execute Stake" });
    expect(button).toBeEnabled();
    expect(button).toHaveClass("bg-indigo-500");

    fireEvent.click(button);
    expect(mockOnExecute).toHaveBeenCalledTimes(1);
  });

  it("renders Unstake Preview with unbonding note", () => {
    const intent: UnstakeIntent = {
      action: "unstake",
      amount: 50,
    };

    render(
      <StakingCard
        intent={intent}
        senderBalance={BigInt(10 * 1e14)} // 10 POT (balance doesn't restrict unstake)
        isConnected={true}
        onExecute={mockOnExecute}
      />
    );

    expect(screen.getByText("Unstake Preview")).toBeInTheDocument();
    expect(screen.getByText("Unbond")).toBeInTheDocument();
    expect(screen.getByText("~28 era unbonding period")).toBeInTheDocument();

    const button = screen.getByRole("button", { name: "Execute Unstake" });
    expect(button).toBeEnabled();
    expect(button).toHaveClass("bg-amber-500");

    fireEvent.click(button);
    expect(mockOnExecute).toHaveBeenCalledTimes(1);
  });

  it("shows insufficient balance warning and disables execution when balance too low", () => {
    const intent: StakeIntent = {
      action: "stake",
      amount: 100,
    };

    render(
      <StakingCard
        intent={intent}
        senderBalance={BigInt(50 * 1e14)} // 50 POT
        isConnected={true}
        onExecute={mockOnExecute}
      />
    );

    expect(screen.getByText(/Insufficient balance/)).toBeInTheDocument();
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("bg-slate-800");
  });

  it("requires connected wallet and displays 'Connect Wallet'", () => {
    const intent: StakeIntent = {
      action: "stake",
      amount: 10,
    };

    render(
      <StakingCard
        intent={intent}
        senderBalance={BigInt(50 * 1e14)}
        isConnected={false}
        onExecute={mockOnExecute}
      />
    );

    const button = screen.getByRole("button", { name: "Connect Wallet" });
    expect(button).toBeEnabled();
  });

  it("handles pending state during transaction submission", () => {
    const intent: StakeIntent = {
      action: "stake",
      amount: 10,
    };

    render(
      <StakingCard
        intent={intent}
        senderBalance={BigInt(50 * 1e14)}
        isConnected={true}
        status="pending"
        onExecute={mockOnExecute}
      />
    );

    const button = screen.getByRole("button", { name: "Processing..." });
    expect(button).toBeDisabled();
    expect(button).toHaveClass("bg-slate-700");
  });
});
