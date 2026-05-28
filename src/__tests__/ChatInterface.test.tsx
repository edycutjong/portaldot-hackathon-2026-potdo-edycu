import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { ChatInterface } from "@/components/ChatInterface";
import { useWallet } from "@/context/WalletContext";
import { logTransaction } from "@/lib/supabase";
import type { ParsedIntent } from "@/lib/types";
import { SUGGESTED_COMMANDS } from "@/lib/constants";

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
    isBalanceLoading: boolean;
    accounts?: Record<string, unknown>[];
    isDemoMode?: boolean;
    chainName?: string;
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
      isBalanceLoading: false,
      isDemoMode: true,
      chainName: "Demo Network",
      accounts: [
        {
          address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
          meta: { name: "Alice" },
        },
      ],
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
    const suggestBtn = screen.getByText("Send 10 POT to Alpha");
    fireEvent.click(suggestBtn);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
    expect(input).toHaveValue("Send 10 POT to Alpha");
  });

  it("handles external input and consumes it correctly", () => {
    const { rerender } = render(
      <ChatInterface
        externalInput="external command"
        onExternalInputConsumed={mockOnExternalInputConsumed}
      />
    );
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
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
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
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
        to: "Beta",
        toAddress: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
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
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
    const form = screen.getByRole("textbox").closest("form")!;

    fireEvent.change(input, { target: { value: "Send 10 POT to Alpha" } });
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
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
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
        intent: {
          action: "check_identity",
          address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        },
      }),
    });
    mockQueryIdentity.mockResolvedValueOnce({
      address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      display: "Alpha Dev",
      isVerified: true,
    });

    render(<ChatInterface />);
    const input2 = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
    const form2 = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input2, { target: { value: "who is Alpha?" } });
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
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
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
        intent: { action: "estimate_fee", command: "send 10 POT to Alpha" },
      }),
    });
    mockEstimateFee.mockResolvedValueOnce({
      partialFee: "0.015",
      weight: "123,000",
      class: "Normal",
    });

    render(<ChatInterface />);
    const input2 = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
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
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
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
    const input2 = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
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
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
    const form = screen.getByRole("textbox").closest("form")!;

    fireEvent.change(input, { target: { value: "error please" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText("Sorry, something went wrong. Please try again.")
      ).toBeInTheDocument();
    });
  });

  it("executes batch transactions", async () => {
    const mockResponse = {
      message: "Please confirm your batch transfer:",
      intent: {
        action: "batch_transfer",
        transfers: [
          { to: "Gamma", toAddress: "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y", amount: 5 },
          { to: "Beta", toAddress: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty", amount: 5 },
        ],
      },
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
    const form = screen.getByRole("textbox").closest("form")!;

    fireEvent.change(input, { target: { value: "Send 5 to Alpha and Beta" } });
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
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
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
    const input2 = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
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
            {
              to: "Gamma",
              toAddress: "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y",
              amount: 5,
            },
            {
              to: "Beta",
              toAddress: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
              amount: 5,
            },
          ],
        },
      }),
    });

    currentWallet.connected = false;
    currentWallet.address = "";

    render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
    const form = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input, { target: { value: "Airdrop 5 POT to Alpha and Beta" } });
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
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
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
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
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
        intent: {
          action: "transfer",
          to: "Beta",
          toAddress: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
          amount: 10,
        },
        txResult: { status: "failed", error: "Insufficient Balance" },
      }),
    });

    render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
    const form = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input, { target: { value: "Send 10 POT to Alpha" } });
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
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
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
        intent: {
          action: "transfer",
          to: "Beta",
          toAddress: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
          amount: 10,
        },
      }),
    });

    const { unmount } = render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
    const form = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input, { target: { value: "Send 10 POT to Alpha" } });
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
          transfers: [
            {
              to: "Gamma",
              toAddress: "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y",
              amount: 5,
            },
          ],
        },
      }),
    });

    const { unmount: unmount2 } = render(<ChatInterface />);
    const input2 = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
    const form2 = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input2, { target: { value: "Airdrop 5 POT to Alpha" } });
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
    const input3 = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
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
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
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
        intent: {
          action: "check_identity",
          address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        },
      }),
    });
    mockQueryIdentity.mockRejectedValueOnce(new Error("Identity Error"));

    const { unmount: unmount2 } = render(<ChatInterface />);
    const input2 = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
    const form2 = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input2, { target: { value: "Who is Alpha?" } });
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
    const input3 = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
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
    const input4 = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
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
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
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
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
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
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
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
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
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
    const input2 = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
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
        intent: {
          action: "transfer",
          to: "Beta",
          toAddress: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
          amount: 10,
        },
      }),
    });

    const { unmount } = render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
    const form = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input, { target: { value: "Send 10 POT to Alpha" } });
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
          transfers: [
            {
              to: "Gamma",
              toAddress: "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y",
              amount: 5,
            },
          ],
        },
      }),
    });

    render(<ChatInterface />);
    const input2 = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
    const form2 = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input2, { target: { value: "Airdrop 5 POT to Alpha" } });
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

  it("persists chat history in localStorage per wallet address", async () => {
    localStorage.clear();
    localStorage.setItem("test_enable_persistence", "true");

    // Mock guest and Alpha messages in localStorage
    const mockGuestMessages = [
      { id: "msg-1", role: "user" as const, content: "hello guest query" },
      { id: "msg-2", role: "assistant" as const, content: "hello guest reply" },
    ];
    const mockAlphaMessages = [
      { id: "msg-3", role: "user" as const, content: "hello alpha query" },
      { id: "msg-4", role: "assistant" as const, content: "hello alpha reply" },
    ];

    localStorage.setItem(
      "potdo_chat_history_demo_network_guest",
      JSON.stringify(mockGuestMessages)
    );
    localStorage.setItem(
      "potdo_chat_history_demo_network_5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      JSON.stringify(mockAlphaMessages)
    );

    // 1. Render as Guest / disconnected wallet
    currentWallet.address = "";
    currentWallet.connected = false;

    const { rerender } = render(<ChatInterface />);

    await waitFor(() => {
      expect(screen.getByText("hello guest query")).toBeInTheDocument();
    });
    expect(screen.queryByText("hello alpha query")).not.toBeInTheDocument();

    // 2. Switch to Alpha wallet
    currentWallet.address = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
    currentWallet.connected = true;

    rerender(<ChatInterface />);

    await waitFor(() => {
      expect(screen.getByText("hello alpha query")).toBeInTheDocument();
    });
    expect(screen.queryByText("hello guest query")).not.toBeInTheDocument();

    localStorage.removeItem("test_enable_persistence");
  });

  it("handles scrollRef being null gracefully", () => {
    // Mounting a component naturally starts with scrollRef.current as null
    expect(() => render(<ChatInterface />)).not.toThrow();
  });

  it("dynamically replaces active name in suggestions and placeholder to avoid self-sending and duplicates", () => {
    localStorage.setItem("test_enable_dynamic_commands", "true");

    // 1. Connected as Alpha on Demo Mode
    const walletAlphaDemo = {
      ...currentWallet,
      address: "5DRcc5Jf3rvuLQHEbuvDZtXMfmS9WS3NETFP2h1W8r2j1KUm",
      isDemoMode: true,
      accounts: [
        { address: "5DRcc5Jf3rvuLQHEbuvDZtXMfmS9WS3NETFP2h1W8r2j1KUm", meta: { name: "Alpha" } },
        { address: "5FBjUb4p6yzvcWsCDHxoeeppJjJ7vZW675sPgrNFK3acMQ5o", meta: { name: "Beta" } },
        { address: "5E1oSt5YAdzq6RdEHt1UyMFcLqQVQMq9TiF3TAfxDvsDjp3P", meta: { name: "Gamma" } },
        { address: "5CfPKgVHzzi7thpNYf5kKRDQ676mVmsYtAQsTWaRqoaX4eQX", meta: { name: "Delta" } },
      ],
    };
    (useWallet as jest.Mock).mockImplementation(() => walletAlphaDemo);

    const { unmount } = render(<ChatInterface />);

    // Check placeholder
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Beta"/);
    expect(input).toBeInTheDocument();

    // Check multi-recipient button text (Alpha replaced by Delta, leaving Beta and Gamma)
    expect(screen.getByText("Airdrop 5 POT to Delta, Beta, and Gamma")).toBeInTheDocument();
    unmount();

    // 2. Connected as Beta on Demo Mode
    const walletBetaDemo = {
      ...currentWallet,
      address: "5FBjUb4p6yzvcWsCDHxoeeppJjJ7vZW675sPgrNFK3acMQ5o",
      isDemoMode: true,
      accounts: [
        { address: "5DRcc5Jf3rvuLQHEbuvDZtXMfmS9WS3NETFP2h1W8r2j1KUm", meta: { name: "Alpha" } },
        { address: "5FBjUb4p6yzvcWsCDHxoeeppJjJ7vZW675sPgrNFK3acMQ5o", meta: { name: "Beta" } },
        { address: "5E1oSt5YAdzq6RdEHt1UyMFcLqQVQMq9TiF3TAfxDvsDjp3P", meta: { name: "Gamma" } },
        { address: "5CfPKgVHzzi7thpNYf5kKRDQ676mVmsYtAQsTWaRqoaX4eQX", meta: { name: "Delta" } },
      ],
    };
    (useWallet as jest.Mock).mockImplementation(() => walletBetaDemo);

    const { unmount: unmountBeta } = render(<ChatInterface />);
    expect(screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/)).toBeInTheDocument();
    expect(screen.getByText("Airdrop 5 POT to Alpha, Delta, and Gamma")).toBeInTheDocument();
    unmountBeta();

    // 3. Connected as Alice on Testnet mode (isDemoMode = false)
    const walletAliceTestnet = {
      ...currentWallet,
      address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      isDemoMode: false,
      accounts: [
        { address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", meta: { name: "Alice" } },
        { address: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty", meta: { name: "Bob" } },
        { address: "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y", meta: { name: "Charlie" } },
        { address: "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYUM3aUNew", meta: { name: "Dave" } },
      ],
    };
    (useWallet as jest.Mock).mockImplementation(() => walletAliceTestnet);

    const { unmount: unmountAlice } = render(<ChatInterface />);
    expect(screen.getByPlaceholderText(/Try: "Send 10 POT to Bob"/)).toBeInTheDocument();
    expect(screen.getByText("Airdrop 5 POT to Dave, Bob, and Charlie")).toBeInTheDocument();
    unmountAlice();

    // 4. Custom name connected as Edy (mentioned in custom command "Set my name to Edy")
    const walletEdy = {
      ...currentWallet,
      address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      isDemoMode: true,
      accounts: [
        { address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", meta: { name: "Edy" } },
      ],
    };
    (useWallet as jest.Mock).mockImplementation(() => walletEdy);

    const { unmount: unmountEdy } = render(<ChatInterface />);
    expect(screen.getByText("Set my name to Alpha")).toBeInTheDocument();
    unmountEdy();

    localStorage.removeItem("test_enable_dynamic_commands");
  });

  it("handles localStorage load error gracefully", async () => {
    localStorage.clear();
    localStorage.setItem("test_enable_persistence", "true");

    const getItemSpy = jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Local storage access blocked");
    });

    try {
      render(<ChatInterface />);

      // Flush setTimeout timers in catch block
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // It should render welcome screen and handle error without crashing
      expect(screen.getByText("Welcome to Potdo")).toBeInTheDocument();
    } finally {
      getItemSpy.mockRestore();
      localStorage.removeItem("test_enable_persistence");
    }
  });

  it("handles localStorage save error gracefully", async () => {
    localStorage.clear();
    localStorage.setItem("test_enable_persistence", "true");
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const setItemSpy = jest.spyOn(Storage.prototype, "setItem").mockImplementation((key) => {
      if (key.startsWith("potdo_chat_history")) {
        throw new Error("Quota exceeded");
      }
    });

    let unmountFn: (() => void) | undefined;
    try {
      const { unmount } = render(<ChatInterface />);
      unmountFn = unmount;
      const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
      const form = screen.getByRole("textbox").closest("form")!;
      fireEvent.change(input, { target: { value: "Airdrop 5 POT to Alpha" } });
      fireEvent.submit(form);

      // It should not crash on save failure
      await waitFor(() => {
        expect(screen.getByText("Airdrop 5 POT to Alpha")).toBeInTheDocument();
      });
    } finally {
      setItemSpy.mockRestore();
      consoleSpy.mockRestore();
      localStorage.removeItem("test_enable_persistence");
      if (unmountFn) unmountFn();
    }
  });

  it("skips saving chat history if the key changes before history is loaded", async () => {
    localStorage.clear();
    localStorage.setItem("test_enable_persistence", "true");

    const { rerender, unmount } = render(<ChatInterface />);

    // Allow mount effects to run first
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Switch address immediately by updating mock and reference
    currentWallet = {
      ...currentWallet,
      address: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
    };
    (useWallet as jest.Mock).mockImplementation(() => currentWallet);
    rerender(<ChatInterface />);

    // Allow update effects to run
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    localStorage.removeItem("test_enable_persistence");
    unmount();
  });

  it("handles localStorage remove error gracefully on mount", () => {
    localStorage.setItem("test_enable_persistence", "true");
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const removeItemSpy = jest.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("Remove item blocked");
    });

    try {
      render(<ChatInterface />);
    } finally {
      removeItemSpy.mockRestore();
      consoleSpy.mockRestore();
      localStorage.removeItem("test_enable_persistence");
    }
  });

  it("resolves max transfer (-1) to the actual balance minus the gas fee", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        message: "Send max:",
        intent: {
          action: "transfer",
          to: "Alpha",
          toAddress: "5DRcc5Jf3rvuLQHEbuvDZtXMfmS9WS3NETFP2h1W8r2j1KUm",
          amount: -1,
        },
      }),
    });

    render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
    const form = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input, { target: { value: "Send everything to Alpha" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Execute Transfer/)).toBeInTheDocument();
    });

    // Mock findLast temporarily to return undefined
    const originalFindLast = Array.prototype.findLast;
    Array.prototype.findLast = jest.fn().mockReturnValue(undefined);

    fireEvent.click(screen.getByRole("button", { name: "✅ Execute Transfer" }));

    // Restore findLast
    Array.prototype.findLast = originalFindLast;

    expect(mockExecuteTransfer).toHaveBeenCalled();
    const resolvedAmount = mockExecuteTransfer.mock.calls[0][1];
    expect(resolvedAmount).toBe(499.9988);
  });

  it("supports selecting slash commands from autocomplete dropdown on click", async () => {
    render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
    fireEvent.change(input, { target: { value: "/send" } });

    // Check dropdown shows /send command
    await waitFor(() => {
      expect(screen.getByText("Transfer POT tokens")).toBeInTheDocument();
    });

    // Click on the button for /send command
    const slashBtn = screen.getByRole("button", { name: /^\/send\b/ });
    fireEvent.click(slashBtn);

    // Input should be updated with the example
    expect(input).toHaveValue("Send 10 POT to Alpha");
  });

  it("supports arrow, enter, tab, and escape key navigation for slash menu", async () => {
    render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
    fireEvent.change(input, { target: { value: "/" } });

    await waitFor(() => {
      expect(screen.getByText("Transfer POT tokens")).toBeInTheDocument();
    });

    // Arrow down
    fireEvent.keyDown(input, { key: "ArrowDown" });
    // Arrow up
    fireEvent.keyDown(input, { key: "ArrowUp" });
    // Escape to clear
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input).toHaveValue("");

    // Show again
    fireEvent.change(input, { target: { value: "/" } });
    await waitFor(() => {
      expect(screen.getByText("Transfer POT tokens")).toBeInTheDocument();
    });

    // Press Enter to select first item
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input).toHaveValue("Send 10 POT to Alpha");
  });

  it("returns null in renderIntentCard when optional check data is missing", () => {
    const msgStaking = {
      id: "staking-1",
      role: "assistant" as const,
      content: "Staking check",
      intent: { action: "check_staking" },
    };
    const msgIdentity = {
      id: "identity-1",
      role: "assistant" as const,
      content: "Identity check",
      intent: { action: "check_identity" },
    };
    const msgVesting = {
      id: "vesting-1",
      role: "assistant" as const,
      content: "Vesting check",
      intent: { action: "check_vesting" },
    };
    const msgFee = {
      id: "fee-1",
      role: "assistant" as const,
      content: "Fee check",
      intent: { action: "estimate_fee" },
    };
    const msgChain = {
      id: "chain-1",
      role: "assistant" as const,
      content: "Chain check",
      intent: { action: "check_chain_info" },
    };

    localStorage.setItem(
      "potdo_chat_history_demo_network_5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      JSON.stringify([msgStaking, msgIdentity, msgVesting, msgFee, msgChain])
    );
    localStorage.setItem("test_enable_persistence", "true");

    render(<ChatInterface />);

    // Since info is missing, no cards should be rendered
    expect(screen.queryByText("Active Staked")).not.toBeInTheDocument();
    expect(screen.queryByText("On-Chain Identity")).not.toBeInTheDocument();
    expect(screen.queryByText("Vesting Schedule")).not.toBeInTheDocument();
    expect(screen.queryByText("Fee Estimate")).not.toBeInTheDocument();
    expect(screen.queryByText("Chain Details")).not.toBeInTheDocument();

    localStorage.removeItem("test_enable_persistence");
  });

  it("handles malformed JSON in localStorage load gracefully", async () => {
    localStorage.clear();
    localStorage.setItem("test_enable_persistence", "true");
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const key = "potdo_chat_history_demo_network_5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
    localStorage.setItem(key, "{malformed_json}");

    render(<ChatInterface />);

    // Flush setTimeout timers in catch block
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // It should render welcome screen and handle parse error without crashing
    expect(screen.getByText("Welcome to Potdo")).toBeInTheDocument();

    consoleSpy.mockRestore();
    localStorage.removeItem("test_enable_persistence");
    localStorage.removeItem(key);
  });

  it("renders messages with account name when account exists in wallet", async () => {
    currentWallet = {
      ...currentWallet,
      accounts: [
        {
          address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
          meta: { name: "Alice" },
        },
      ],
    };
    (useWallet as jest.Mock).mockImplementation(() => currentWallet);

    render(<ChatInterface />);

    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
    const form = screen.getByRole("textbox").closest("form")!;
    fireEvent.change(input, { target: { value: "Hello" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Alice/)).toBeInTheDocument();
    });
  });

  it("skips saving chat history if load effect is skipped but save effect runs", () => {
    localStorage.clear();

    let callCount = 0;
    const getItemSpy = jest.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
      if (key === "test_enable_persistence") {
        callCount++;
        return callCount === 1 ? null : "true";
      }
      return null;
    });

    try {
      render(<ChatInterface />);
    } finally {
      getItemSpy.mockRestore();
    }
  });

  it("handles accounts being undefined or missing meta/name in mapping", async () => {
    localStorage.setItem("test_enable_dynamic_commands", "true");
    try {
      // accounts is undefined
      currentWallet = {
        ...currentWallet,
        accounts: undefined,
      };
      (useWallet as jest.Mock).mockImplementation(() => currentWallet);

      const { unmount } = render(<ChatInterface />);
      unmount();

      // accounts is empty array
      currentWallet = {
        ...currentWallet,
        accounts: [],
      };
      (useWallet as jest.Mock).mockImplementation(() => currentWallet);
      const { unmount: unmount2 } = render(<ChatInterface />);
      unmount2();

      // account exists but has no meta or name
      currentWallet = {
        ...currentWallet,
        accounts: [
          {
            address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
          },
        ],
      };
      (useWallet as jest.Mock).mockImplementation(() => currentWallet);
      const { unmount: unmount3 } = render(<ChatInterface />);
      unmount3();
    } finally {
      localStorage.removeItem("test_enable_dynamic_commands");
    }
  });

  it("covers all getDynamicCommand branches via suggestion rendering", () => {
    localStorage.setItem("test_enable_dynamic_commands", "true");
    const originalSuggestions = [...SUGGESTED_COMMANDS];

    try {
      const cases = [
        {
          isDemoMode: true,
          activeName: "Alpha",
          input: "Send 5 POT to Alpha, Beta, Gamma, and Delta",
          expected: "Send 5 POT to Beta, Beta, Gamma, and Delta",
        },
        {
          isDemoMode: true,
          activeName: "Delta",
          input: "Send 5 POT to Alpha, Beta, Gamma, and Delta",
          expected: "Send 5 POT to Alpha, Beta, Gamma, and Alpha",
        },
        {
          isDemoMode: false,
          activeName: "Alice",
          input: "Send 5 POT to Alice, Bob, Charlie, and Dave",
          expected: "Send 5 POT to Bob, Bob, Charlie, and Dave",
        },
        {
          isDemoMode: false,
          activeName: "Dave",
          input: "Send 5 POT to Alice, Bob, Charlie, and Dave",
          expected: "Send 5 POT to Alice, Bob, Charlie, and Alice",
        },
        {
          isDemoMode: true,
          activeName: "Edy",
          input: "Send 10 POT to Edy",
          expected: "Send 10 POT to Alpha",
        },
        {
          isDemoMode: false,
          activeName: "Edy",
          input: "Send 10 POT to Edy",
          expected: "Send 10 POT to Alice",
        },
        {
          isDemoMode: false,
          activeName: "Alice",
          input: "Send 10 POT to Alice",
          expected: "Send 10 POT to Bob",
        },
        {
          isDemoMode: false,
          activeName: "Bob",
          input: "Send 10 POT to Bob",
          expected: "Send 10 POT to Alice",
        },
      ];

      for (const tc of cases) {
        currentWallet = {
          ...currentWallet,
          isDemoMode: tc.isDemoMode,
          accounts: [
            {
              address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
              meta: { name: tc.activeName },
            },
          ],
        };
        (useWallet as jest.Mock).mockImplementation(() => currentWallet);

        SUGGESTED_COMMANDS[0] = tc.input;

        const { unmount } = render(<ChatInterface />);
        expect(screen.getByText(tc.expected)).toBeInTheDocument();
        unmount();
      }
    } finally {
      localStorage.removeItem("test_enable_dynamic_commands");
      // Restore original suggestions
      SUGGESTED_COMMANDS.length = 0;
      SUGGESTED_COMMANDS.push(...originalSuggestions);
    }
  });

  it("resolves max transfer with balance less than or equal to gas fee", async () => {
    currentWallet = {
      ...currentWallet,
      balance: 1000n, // less than gas fee of 120000000n (0.0012 POT)
    };
    (useWallet as jest.Mock).mockImplementation(() => currentWallet);

    const mockResponse = {
      message: "Sending maximum balance to Beta",
      intent: {
        action: "transfer",
        to: "Beta",
        toAddress: "5FHneW46xGXgs5mUqt2J6me856mQ6QN944C3BtEZBm5i7gS5",
        amount: -1,
      },
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);

    // trigger sendall Beta (which has intent amount = -1)
    fireEvent.change(input, { target: { value: "/sendall Beta" } });
    const form = screen.getByRole("textbox").closest("form")!;
    fireEvent.submit(form);

    // wait for execution card to be rendered and click execute
    const executeButton = await screen.findByRole("button", { name: /Execute/i });
    fireEvent.click(executeButton);

    expect(currentWallet.executeTransfer).toHaveBeenCalledWith(
      expect.any(String),
      0,
      expect.any(Function)
    );
  });

  it("handles scrollRef.current or inputRef.current being null", async () => {
    let refCount = 0;
    const fakeRef = {};
    Object.defineProperty(fakeRef, "current", {
      get: () => null,
      set: () => {},
    });

    const useRefSpy = jest.spyOn(React, "useRef").mockImplementation((init) => {
      refCount++;
      if (refCount === 1 || refCount === 2) {
        // scrollRef is 1, inputRef is 2
        return fakeRef as unknown as React.RefObject<HTMLDivElement>;
      }
      return { current: init };
    });

    try {
      currentWallet = {
        ...currentWallet,
        accounts: [],
      };
      (useWallet as jest.Mock).mockImplementation(() => currentWallet);

      render(<ChatInterface />);

      const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);
      // Type "/" to open slash menu
      fireEvent.change(input, { target: { value: "/" } });

      // Press Enter to select command - this triggers selectSlashCommand
      fireEvent.keyDown(input, { key: "Enter" });

      // Verification: it did not throw/crash even when refs are null
    } finally {
      useRefSpy.mockRestore();
    }
  });

  it("handles key events when showSlashMenu is false", () => {
    render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);

    // Type a regular command (menu closed) and press ArrowDown
    fireEvent.change(input, { target: { value: "Hello" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(input).toHaveValue("Hello");
  });

  it("handles selectSlashCommand when cmd is undefined", async () => {
    const { rerender } = render(<ChatInterface externalInput="" />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);

    // 1. Open slash menu with '/send'
    fireEvent.change(input, { target: { value: "/send" } });

    // 2. Press ArrowDown to set slashIndex to 1 (which would be "/sendall")
    fireEvent.keyDown(input, { key: "ArrowDown" });

    // 3. Change input to "/sendall" via externalInput to avoid resetting slashIndex
    rerender(<ChatInterface externalInput="/sendall" />);

    // 4. Press Enter (selectSlashCommand(1) will get undefined cmd)
    fireEvent.keyDown(input, { key: "Enter" });

    // Verification: it did not crash, input stays "/sendall"
    expect(input).toHaveValue("/sendall");
  });

  it("sets input to empty on Escape key press", () => {
    render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);

    // Open menu
    fireEvent.change(input, { target: { value: "/" } });

    // Press Escape
    fireEvent.keyDown(input, { key: "Escape" });

    expect(input).toHaveValue("");
  });

  it("renders loading text for check_balance when balance is loading", async () => {
    currentWallet = {
      ...currentWallet,
      isBalanceLoading: true,
    };
    (useWallet as jest.Mock).mockImplementation(() => currentWallet);

    localStorage.clear();
    const key = "potdo_chat_history_demo_network_5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
    localStorage.setItem(
      key,
      JSON.stringify([
        {
          id: "1",
          role: "assistant",
          content: "Balance check",
          timestamp: new Date().toISOString(),
          intent: {
            action: "check_balance",
          },
        },
      ])
    );
    localStorage.setItem("test_enable_persistence", "true");

    try {
      render(<ChatInterface />);
      await screen.findByText("...");
    } finally {
      localStorage.removeItem("test_enable_persistence");
      localStorage.removeItem(key);
    }
  });

  it("handles chainName being falsy to cover storage key fallback", () => {
    localStorage.setItem("test_enable_persistence", "true");
    try {
      currentWallet = {
        ...currentWallet,
        chainName: undefined,
      };
      (useWallet as jest.Mock).mockImplementation(() => currentWallet);

      render(<ChatInterface />);
      expect(screen.getByText("Welcome to Potdo")).toBeInTheDocument();
    } finally {
      localStorage.removeItem("test_enable_persistence");
    }
  });

  it("handles non-string activeName in mapping", () => {
    localStorage.setItem("test_enable_dynamic_commands", "true");
    try {
      currentWallet = {
        ...currentWallet,
        accounts: [
          {
            address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
            meta: { name: 123 } as unknown as Record<string, unknown>,
          },
        ],
      };
      (useWallet as jest.Mock).mockImplementation(() => currentWallet);

      render(<ChatInterface />);
      expect(screen.getByText("Welcome to Potdo")).toBeInTheDocument();
    } finally {
      localStorage.removeItem("test_enable_dynamic_commands");
    }
  });

  it("handles keypress when showSlashMenu is true but key is not Escape or arrow/enter/tab", () => {
    render(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Try: "Send 10 POT to Alpha"/);

    // Open menu
    fireEvent.change(input, { target: { value: "/" } });

    // Press key "a"
    fireEvent.keyDown(input, { key: "a" });

    expect(input).toHaveValue("/");
  });

  it("handles active address missing from non-empty accounts array", () => {
    localStorage.setItem("test_enable_dynamic_commands", "true");
    try {
      currentWallet = {
        ...currentWallet,
        address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        accounts: [
          {
            address: "5FHneW46xGXgs5mUqt2J6me856mQ6QN944C3BtEZBm5i7gS5", // different address (Beta)
            meta: { name: "Beta" },
          },
        ],
      };
      (useWallet as jest.Mock).mockImplementation(() => currentWallet);

      render(<ChatInterface />);
      expect(screen.getByText("Welcome to Potdo")).toBeInTheDocument();
    } finally {
      localStorage.removeItem("test_enable_dynamic_commands");
    }
  });
});
