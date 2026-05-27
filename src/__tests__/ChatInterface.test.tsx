import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { ChatInterface } from "@/components/ChatInterface";
import { useWallet } from "@/context/WalletContext";
import { logTransaction } from "@/lib/supabase";
import type { ParsedIntent } from "@/lib/types";

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Mock useWallet hook
jest.mock("@/context/WalletContext", () => ({
  useWallet: jest.fn(),
}));

// Mock Supabase lib
jest.mock("@/lib/supabase", () => ({
  logTransaction: jest.fn().mockResolvedValue({ success: true }),
}));

describe("ChatInterface", () => {
  const mockConnect = jest.fn();
  const mockExecuteTransfer = jest.fn();
  const mockExecuteBatch = jest.fn();
  const mockExecuteStake = jest.fn();
  const mockExecuteUnstake = jest.fn();
  const mockExecuteSetIdentity = jest.fn();
  const mockQueryStaking = jest.fn();
  const mockQueryIdentity = jest.fn();
  const mockQueryVesting = jest.fn();
  const mockEstimateFee = jest.fn();
  const mockQueryChainInfo = jest.fn();
  const mockOnExternalInputConsumed = jest.fn();
  const mockOnCommandExecuted = jest.fn();

  let currentWallet: {
    address: string;
    balance: bigint;
    connected: boolean;
    connect: jest.Mock;
    executeTransfer: jest.Mock;
    executeBatch: jest.Mock;
    executeStake: jest.Mock;
    executeUnstake: jest.Mock;
    executeSetIdentity: jest.Mock;
    queryStaking: jest.Mock;
    queryIdentity: jest.Mock;
    queryVesting: jest.Mock;
    estimateFee: jest.Mock;
    queryChainInfo: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    currentWallet = {
      address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      balance: BigInt(500 * 1e14), // 500 POT
      connected: true,
      connect: mockConnect,
      executeTransfer: mockExecuteTransfer,
      executeBatch: mockExecuteBatch,
      executeStake: mockExecuteStake,
      executeUnstake: mockExecuteUnstake,
      executeSetIdentity: mockExecuteSetIdentity,
      queryStaking: mockQueryStaking,
      queryIdentity: mockQueryIdentity,
      queryVesting: mockQueryVesting,
      estimateFee: mockEstimateFee,
      queryChainInfo: mockQueryChainInfo,
    };
    (useWallet as jest.Mock).mockImplementation(() => currentWallet);
    global.fetch = jest.fn();
  });

  it("renders the welcome screen when there are no messages", () => {
    render(<ChatInterface />);
    expect(screen.getByText("Welcome to Potdo")).toBeInTheDocument();
    expect(screen.getByText(/Your AI copilot for Portaldot/)).toBeInTheDocument();
  });

  it("supports suggested commands on button click", () => {
    render(<ChatInterface />);
    const suggestBtn = screen.getByText("Send 10 POT to Alice");
    fireEvent.click(suggestBtn);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    expect(input).toHaveValue("Send 10 POT to Alice");
  });

  it("handles external input and consumes it correctly", () => {
    const { rerender } = render(
      <ChatInterface
        externalInput="external command"
        onExternalInputConsumed={mockOnExternalInputConsumed}
      />
    );
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    expect(input).toHaveValue("external command");
    expect(mockOnExternalInputConsumed).toHaveBeenCalledTimes(1);

    // Re-render with same input, shouldn't trigger again
    rerender(
      <ChatInterface
        externalInput="external command"
        onExternalInputConsumed={mockOnExternalInputConsumed}
      />
    );
    expect(mockOnExternalInputConsumed).toHaveBeenCalledTimes(1);
  });

  it("sends a message and renders BalanceWidget on check_balance intent", async () => {
    const mockResponse = {
      message: "Here is your balance overview:",
      intent: { action: "check_balance" },
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form = screen.getByRole("textbox").closest("form")!;

    fireEvent.change(input, { target: { value: "check my balance" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Here is your balance overview:")).toBeInTheDocument();
      expect(screen.getByText("POT (Free)")).toBeInTheDocument();
    });
  });

  it("sends a transfer command, renders preview, handles connect triggers, and executes transaction", async () => {
    const mockResponse = {
      message: "Please confirm your transfer:",
      intent: {
        action: "transfer",
        to: "Alice",
        toAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        amount: 10,
      },
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    // Mock wallet to be disconnected initially
    currentWallet.connected = false;
    currentWallet.address = "";

    const { rerender } = render(<ChatInterface onCommandExecuted={mockOnCommandExecuted} />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form = screen.getByRole("textbox").closest("form")!;

    fireEvent.change(input, { target: { value: "Send 10 POT to Alice" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Please confirm your transfer:")).toBeInTheDocument();
      expect(screen.getByText("Transfer Preview")).toBeInTheDocument();
    });

    const executeBtn = screen.getByRole("button", { name: "🔌 Connect Wallet to Execute" });
    fireEvent.click(executeBtn);
    expect(mockConnect).toHaveBeenCalledWith(false);

    // Now re-mock as connected
    currentWallet.connected = true;
    currentWallet.address = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
    rerender(<ChatInterface onCommandExecuted={mockOnCommandExecuted} />);

    // Click execute again
    const executeBtnConnected = screen.getByRole("button", { name: "✅ Execute Transfer" });
    fireEvent.click(executeBtnConnected);

    // Verify executeTransfer called
    expect(mockExecuteTransfer).toHaveBeenCalled();
    const callback = mockExecuteTransfer.mock.calls[0][2];

    // Trigger callback finalized
    await act(async () => {
      await callback("finalized", "0xtest", 100, undefined);
    });

    expect(screen.getByText("Transaction Confirmed!")).toBeInTheDocument();
    expect(logTransaction).toHaveBeenCalled();
    expect(mockOnCommandExecuted).toHaveBeenCalled();
  });

  it("handles queries like check_staking, check_identity, check_vesting, estimate_fee, check_chain_info", async () => {
    // 1. check_staking
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        message: "Staking stats:",
        intent: { action: "check_staking" },
      }),
    });
    mockQueryStaking.mockResolvedValueOnce({
      bonded: 100,
      active: 80,
      unlocking: 20,
      rewardDestination: "Stash",
      nominations: [],
    });

    const { unmount } = render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input, { target: { value: "my staking info" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Staking stats:")).toBeInTheDocument();
      expect(screen.getByText("Staking Overview")).toBeInTheDocument();
    });
    unmount();

    // 2. check_identity
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        message: "Identity info:",
        intent: { action: "check_identity", address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" },
      }),
    });
    mockQueryIdentity.mockResolvedValueOnce({
      address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      display: "Alice Dev",
      isVerified: true,
    });

    render(<ChatInterface />);
    const input2 = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form2 = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input2, { target: { value: "who is Alice?" } });
    fireEvent.submit(form2);

    await waitFor(() => {
      expect(screen.getByText("Identity info:")).toBeInTheDocument();
      expect(screen.getByText("On-Chain Identity")).toBeInTheDocument();
    });
  });

  it("handles other queries check_vesting, estimate_fee, check_chain_info", async () => {
    // 3. check_vesting
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        message: "Vesting stats:",
        intent: { action: "check_vesting" },
      }),
    });
    mockQueryVesting.mockResolvedValueOnce({
      locked: "100.00",
      alreadyVested: "50.00",
      perPeriod: "1.00",
      startingBlock: 100,
      periodCount: 150,
    });

    const { unmount } = render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input, { target: { value: "vesting" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Vesting stats:")).toBeInTheDocument();
      expect(screen.getByText("Vesting Schedule")).toBeInTheDocument();
    });
    unmount();

    // 4. estimate_fee
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        message: "Fee estimate:",
        intent: { action: "estimate_fee", command: "send 10 POT to Alice" },
      }),
    });
    mockEstimateFee.mockResolvedValueOnce({
      partialFee: "0.015",
      weight: "123,000",
      class: "Normal",
    });

    render(<ChatInterface />);
    const input2 = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form2 = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input2, { target: { value: "gas for sending" } });
    fireEvent.submit(form2);

    await waitFor(() => {
      expect(screen.getByText("Fee estimate:")).toBeInTheDocument();
      expect(screen.getByText("Fee Estimate")).toBeInTheDocument();
    });
  });

  it("handles chain info queries and query failures gracefully", async () => {
    // 5. check_chain_info
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        message: "Chain stats:",
        intent: { action: "check_chain_info" },
      }),
    });
    mockQueryChainInfo.mockResolvedValueOnce({
      chainName: "Portaldot",
      blockNumber: 450000,
      runtimeVersion: 45,
      peerCount: 12,
      nodeVersion: "1.0",
      isSyncing: false,
    });

    const { unmount } = render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input, { target: { value: "network status" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Chain stats:")).toBeInTheDocument();
      expect(screen.getByText("Network Status")).toBeInTheDocument();
    });
    unmount();

    // 6. Query failure
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        message: "Chain stats failed:",
        intent: { action: "check_chain_info" },
      }),
    });
    mockQueryChainInfo.mockRejectedValueOnce(new Error("RPC Error"));

    render(<ChatInterface />);
    const input2 = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form2 = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input2, { target: { value: "network status" } });
    fireEvent.submit(form2);

    await waitFor(() => {
      // The assistant message is still added but widget is omitted
      expect(screen.getByText("Chain stats failed:")).toBeInTheDocument();
      expect(screen.queryByText("Network Status")).not.toBeInTheDocument();
    });
  });

  it("handles api fetch failure", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"));

    render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form = screen.getByRole("textbox").closest("form")!;

    fireEvent.change(input, { target: { value: "error please" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Sorry, something went wrong. Please try again.")).toBeInTheDocument();
    });
  });

  it("executes batch transactions", async () => {
    const mockResponse = {
      message: "Please confirm your batch transfer:",
      intent: {
        action: "batch_transfer",
        transfers: [
          { to: "Alice", toAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", amount: 5 },
          { to: "Bob", toAddress: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty", amount: 5 },
        ],
      },
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form = screen.getByRole("textbox").closest("form")!;

    fireEvent.change(input, { target: { value: "Send 5 to Alice and Bob" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Please confirm your batch transfer:")).toBeInTheDocument();
      expect(screen.getByText("Batch Airdrop Preview")).toBeInTheDocument();
    });

    const executeBtn = screen.getByRole("button", { name: "📦 Execute Batch" });
    fireEvent.click(executeBtn);

    expect(mockExecuteBatch).toHaveBeenCalled();
    const callback = mockExecuteBatch.mock.calls[0][1];

    await act(async () => {
      await callback("finalized", "0xbatch", 101, undefined);
    });

    expect(screen.getByText("Transaction Confirmed!")).toBeInTheDocument();
  });

  it("handles stake, unstake, and set_identity actions", async () => {
    // 1. Stake action
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        message: "Confirm stake:",
        intent: { action: "stake", amount: 50, validator: "ValidatorX" },
      }),
    });

    const { unmount } = render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input, { target: { value: "Stake 50 POT to ValidatorX" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Confirm stake:")).toBeInTheDocument();
      expect(screen.getByText("Execute Stake")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Execute Stake" }));
    expect(mockExecuteStake).toHaveBeenCalled();
    const callbackStake = mockExecuteStake.mock.calls[0][2];
    await act(async () => {
      await callbackStake("finalized", "0xstake", 102, undefined);
    });
    expect(screen.getByText("Transaction Confirmed!")).toBeInTheDocument();
    unmount();

    // 2. Set Identity action
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        message: "Confirm display name setting:",
        intent: { action: "set_identity", displayName: "Edy" },
      }),
    });

    render(<ChatInterface />);
    const input2 = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form2 = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input2, { target: { value: "Set my name to Edy" } });
    fireEvent.submit(form2);

    await waitFor(() => {
      expect(screen.getByText("Confirm display name setting:")).toBeInTheDocument();
      expect(screen.getByText("Set Identity Preview")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Set Identity" }));
    expect(mockExecuteSetIdentity).toHaveBeenCalled();
    const callbackId = mockExecuteSetIdentity.mock.calls[0][1];
    await act(async () => {
      await callbackId("finalized", "0xid", 103, undefined);
    });
    expect(screen.getByText("Transaction Confirmed!")).toBeInTheDocument();
  });

  it("handles batch execute when disconnected by calling connect", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        message: "Please confirm your batch transfer:",
        intent: {
          action: "batch_transfer",
          transfers: [
            { to: "Alice", toAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", amount: 5 },
            { to: "Bob", toAddress: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty", amount: 5 },
          ],
        },
      }),
    });

    currentWallet.connected = false;
    currentWallet.address = "";

    render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input, { target: { value: "Airdrop 5 POT to Alice and Bob" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Batch Airdrop Preview")).toBeInTheDocument();
    });

    const executeBtn = screen.getByRole("button", { name: "🔌 Connect Wallet to Execute" });
    fireEvent.click(executeBtn);
    expect(mockConnect).toHaveBeenCalledWith(false);
  });

  it("executes unstake transaction preview and click", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        message: "Confirm unstake:",
        intent: { action: "unstake", amount: 25 },
      }),
    });

    render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input, { target: { value: "Unstake 25 POT" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Execute Unstake")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Execute Unstake" }));
    expect(mockExecuteUnstake).toHaveBeenCalled();
    const callback = mockExecuteUnstake.mock.calls[0][1];
    await act(async () => {
      await callback("finalized", "0xunstake", 104, undefined);
    });
    expect(screen.getByText("Transaction Confirmed!")).toBeInTheDocument();
  });

  it("renders nothing for unknown intent action in renderIntentCard", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        message: "Unknown action message",
        intent: { action: "unknown_action" } as unknown as ParsedIntent,
      }),
    });

    render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input, { target: { value: "Gibberish" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Unknown action message")).toBeInTheDocument();
    });
  });

  it("handles failed transaction result rendering (TxError)", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        message: "Your transaction failed:",
        intent: { action: "transfer", to: "Alice", toAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", amount: 10 },
        txResult: { status: "failed", error: "Insufficient Balance" },
      }),
    });

    render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input, { target: { value: "Send 10 POT to Alice" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Your transaction failed:")).toBeInTheDocument();
      expect(screen.getByText("Transaction Failed")).toBeInTheDocument();
    });
  });

  it("handles staking without validator, and triggers failed and intermediate callback states", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        message: "Confirm stake:",
        intent: { action: "stake", amount: 100 },
      }),
    });

    render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input, { target: { value: "Stake 100 POT" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Confirm stake:")).toBeInTheDocument();
    });

    const executeBtn = screen.getByRole("button", { name: "Execute Stake" });
    fireEvent.click(executeBtn);

    expect(mockExecuteStake).toHaveBeenCalled();
    const callback = mockExecuteStake.mock.calls[0][2];

    await act(async () => {
      await callback("ready", undefined, undefined, undefined);
    });

    await act(async () => {
      await callback("failed", undefined, undefined, "ExtrinsicError");
    });
    expect(screen.getByText("Transaction Failed")).toBeInTheDocument();
  });

  it("handles failed status and intermediate status callbacks for transfer, batch, and set_identity", async () => {
    // 1. Single transfer failed callback
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        message: "Please confirm:",
        intent: { action: "transfer", to: "Alice", toAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", amount: 10 },
      }),
    });

    const { unmount } = render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input, { target: { value: "Send 10 POT to Alice" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Transfer Preview")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "✅ Execute Transfer" }));
    const transferCallback = mockExecuteTransfer.mock.calls[0][2];
    await act(async () => {
      await transferCallback("ready", undefined, undefined, undefined);
    });
    await act(async () => {
      await transferCallback("failed", "0xerr", undefined, "Fail");
    });
    expect(screen.getByText("Transaction Failed")).toBeInTheDocument();
    unmount();

    // 2. Batch transfer failed callback
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        message: "Confirm batch:",
        intent: {
          action: "batch_transfer",
          transfers: [{ to: "Alice", toAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", amount: 5 }],
        },
      }),
    });

    const { unmount: unmount2 } = render(<ChatInterface />);
    const input2 = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form2 = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input2, { target: { value: "Airdrop 5 POT to Alice" } });
    fireEvent.submit(form2);

    await waitFor(() => {
      expect(screen.getByText("Batch Airdrop Preview")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "📦 Execute Batch" }));
    const batchCallback = mockExecuteBatch.mock.calls[0][1];
    await act(async () => {
      await batchCallback("ready", undefined, undefined, undefined);
    });
    await act(async () => {
      await batchCallback("failed", "0xerr", undefined, "Fail");
    });
    expect(screen.getByText("Transaction Failed")).toBeInTheDocument();
    unmount2();

    // 3. Set identity failed callback
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        message: "Confirm identity:",
        intent: { action: "set_identity", displayName: "Edy" },
      }),
    });

    render(<ChatInterface />);
    const input3 = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form3 = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input3, { target: { value: "Set my name to Edy" } });
    fireEvent.submit(form3);

    await waitFor(() => {
      expect(screen.getByText("Confirm identity:")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Set Identity" }));
    const idCallback = mockExecuteSetIdentity.mock.calls[0][1];
    await act(async () => {
      await idCallback("ready", undefined, undefined, undefined);
    });
    await act(async () => {
      await idCallback("failed", "0xerr", undefined, "Fail");
    });
    expect(screen.getByText("Transaction Failed")).toBeInTheDocument();
  });

  it("handles other query failures gracefully", async () => {
    // Staking query failure
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        message: "Staking check:",
        intent: { action: "check_staking" },
      }),
    });
    mockQueryStaking.mockRejectedValueOnce(new Error("Staking Error"));

    const { unmount } = render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input, { target: { value: "staking" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Staking check:")).toBeInTheDocument();
    });
    unmount();

    // Identity query failure
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        message: "Identity check:",
        intent: { action: "check_identity", address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" },
      }),
    });
    mockQueryIdentity.mockRejectedValueOnce(new Error("Identity Error"));

    const { unmount: unmount2 } = render(<ChatInterface />);
    const input2 = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form2 = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input2, { target: { value: "Who is Alice?" } });
    fireEvent.submit(form2);

    await waitFor(() => {
      expect(screen.getByText("Identity check:")).toBeInTheDocument();
    });
    unmount2();

    // Vesting query failure
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        message: "Vesting check:",
        intent: { action: "check_vesting" },
      }),
    });
    mockQueryVesting.mockRejectedValueOnce(new Error("Vesting Error"));

    const { unmount: unmount3 } = render(<ChatInterface />);
    const input3 = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form3 = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input3, { target: { value: "vesting" } });
    fireEvent.submit(form3);

    await waitFor(() => {
      expect(screen.getByText("Vesting check:")).toBeInTheDocument();
    });
    unmount3();

    // Fee estimate query failure
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        message: "Fee check:",
        intent: { action: "estimate_fee", command: "send 10 POT" },
      }),
    });
    mockEstimateFee.mockRejectedValueOnce(new Error("Fee Error"));

    render(<ChatInterface />);
    const input4 = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form4 = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input4, { target: { value: "gas for sending" } });
    fireEvent.submit(form4);

    await waitFor(() => {
      expect(screen.getByText("Fee check:")).toBeInTheDocument();
    });
  });

  it("handles chain info query failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        message: "Chain info check:",
        intent: { action: "check_chain_info" },
      }),
    });
    mockQueryChainInfo.mockRejectedValueOnce(new Error("Chain Info Error"));

    render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input, { target: { value: "chain info" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Chain info check:")).toBeInTheDocument();
    });
  });

  it("handles chat response without intent", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        // Omit message and intent to test data.message || "" fallback
      }),
    });

    render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input, { target: { value: "Hello" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.queryByText("Welcome to Potdo")).not.toBeInTheDocument();
    });
  });

  it("submits empty input or submits while loading and returns early", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        message: "Replying...",
      }),
    });

    render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form = screen.getByRole("textbox").closest("form")!;
    
    // 1. Submit empty input
    fireEvent.submit(form);

    // 2. Submit while loading
    fireEvent.change(input, { target: { value: "Hello" } });
    fireEvent.submit(form);
    
    // Submit again immediately while loading is true
    fireEvent.change(input, { target: { value: "Hello again" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Replying...")).toBeInTheDocument();
    });
  });

  it("handles stake execute and identity execute when disconnected by calling connect", async () => {
    // 1. Stake disconnected
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        message: "Confirm stake:",
        intent: { action: "stake", amount: 100 },
      }),
    });

    currentWallet.connected = false;
    currentWallet.address = "";

    const { unmount } = render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input, { target: { value: "Stake 100 POT" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Confirm stake:")).toBeInTheDocument();
    });

    const executeBtn = screen.getByRole("button", { name: "Connect Wallet" });
    fireEvent.click(executeBtn);
    expect(mockConnect).toHaveBeenCalledWith(false);
    unmount();

    // 2. Identity disconnected
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        message: "Confirm identity:",
        intent: { action: "set_identity", displayName: "Edy" },
      }),
    });

    render(<ChatInterface />);
    const input2 = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form2 = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input2, { target: { value: "Set my name to Edy" } });
    fireEvent.submit(form2);

    await waitFor(() => {
      expect(screen.getByText("Confirm identity:")).toBeInTheDocument();
    });

    const executeBtn2 = screen.getByRole("button", { name: "Connect Wallet" });
    fireEvent.click(executeBtn2);
    expect(mockConnect).toHaveBeenCalledWith(false);
  });

  it("covers fallback commandText when userMessage is not found", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        message: "Please confirm:",
        intent: { action: "transfer", to: "Alice", toAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", amount: 10 },
      }),
    });

    const { unmount } = render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input, { target: { value: "Send 10 POT to Alice" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Transfer Preview")).toBeInTheDocument();
    });

    // Mock findLast temporarily to return undefined
    const originalFindLast = Array.prototype.findLast;
    Array.prototype.findLast = jest.fn().mockReturnValue(undefined);

    fireEvent.click(screen.getByRole("button", { name: "✅ Execute Transfer" }));
    
    // Restore findLast
    Array.prototype.findLast = originalFindLast;

    expect(mockExecuteTransfer).toHaveBeenCalled();
    const callback = mockExecuteTransfer.mock.calls[0][2];
    await act(async () => {
      await callback("finalized", "0x123", 100);
    });
    unmount();

    // 2. Batch fallback commandText
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        message: "Confirm batch:",
        intent: {
          action: "batch_transfer",
          transfers: [{ to: "Alice", toAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", amount: 5 }],
        },
      }),
    });

    render(<ChatInterface />);
    const input2 = screen.getByPlaceholderText(/Try: "Send 10 POT to Alice"/);
    const form2 = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input2, { target: { value: "Airdrop 5 POT to Alice" } });
    fireEvent.submit(form2);

    await waitFor(() => {
      expect(screen.getByText("Batch Airdrop Preview")).toBeInTheDocument();
    });

    // Mock findLast temporarily to return undefined
    Array.prototype.findLast = jest.fn().mockReturnValue(undefined);

    fireEvent.click(screen.getByRole("button", { name: "📦 Execute Batch" }));
    
    // Restore findLast
    Array.prototype.findLast = originalFindLast;

    expect(mockExecuteBatch).toHaveBeenCalled();
    const callbackBatch = mockExecuteBatch.mock.calls[0][1];
    await act(async () => {
      await callbackBatch("finalized", "0xbatch", 100);
    });
  });

  it("persists chat history in localStorage per wallet address", () => {
    localStorage.clear();
    localStorage.setItem("test_enable_persistence", "true");
    
    // Mock guest and Alice messages in localStorage
    const mockGuestMessages = [
      { id: "msg-1", role: "user" as const, content: "hello guest query" },
      { id: "msg-2", role: "assistant" as const, content: "hello guest reply" }
    ];
    const mockAliceMessages = [
      { id: "msg-3", role: "user" as const, content: "hello alice query" },
      { id: "msg-4", role: "assistant" as const, content: "hello alice reply" }
    ];
    
    localStorage.setItem("potdo_chat_history_guest", JSON.stringify(mockGuestMessages));
    localStorage.setItem("potdo_chat_history_5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", JSON.stringify(mockAliceMessages));
    
    // 1. Render as Guest / disconnected wallet
    currentWallet.address = "";
    currentWallet.connected = false;
    
    const { rerender } = render(<ChatInterface />);
    
    expect(screen.getByText("hello guest query")).toBeInTheDocument();
    expect(screen.queryByText("hello alice query")).not.toBeInTheDocument();
    
    // 2. Switch to Alice wallet
    currentWallet.address = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
    currentWallet.connected = true;
    
    rerender(<ChatInterface />);
    
    expect(screen.getByText("hello alice query")).toBeInTheDocument();
    expect(screen.queryByText("hello guest query")).not.toBeInTheDocument();

    localStorage.removeItem("test_enable_persistence");
  });

  it("handles scrollRef being null gracefully", () => {
    // Mounting a component naturally starts with scrollRef.current as null
    expect(() => render(<ChatInterface />)).not.toThrow();
  });
});
