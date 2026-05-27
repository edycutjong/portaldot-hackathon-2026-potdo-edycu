import { render, screen, fireEvent, act } from "@testing-library/react";
import { ProxySettingsWidget } from "@/components/ProxySettingsWidget";
import { WalletContext } from "@/context/WalletContext";

const mockWalletBase = {
  connected: false,
  address: null,
  balance: 0n,
  isDemoMode: true,
  connecting: false,
  isBalanceLoading: false,
  extensionInstalled: false,
  accounts: [],
  isProxyActive: false,
  proxyType: "Any",
  agentAddress: null,
  checkingProxy: false,
  chainName: "Demo Network",
  targetChainName: "Portaldot Network",
  rpcEndpoint: "wss://mainnet.portaldot.io",
  showConnectModal: false,
  setShowConnectModal: jest.fn(),
  connect: jest.fn(),
  connectExtension: jest.fn(),
  connectDemo: jest.fn(),
  disconnect: jest.fn(),
  selectAccount: jest.fn(),
  checkProxyStatus: jest.fn(),
  addProxyDelegate: jest.fn(),
  removeProxyDelegate: jest.fn(),
  executeTransfer: jest.fn(),
  executeBatch: jest.fn(),
  executeStake: jest.fn(),
  executeUnstake: jest.fn(),
  executeSetIdentity: jest.fn(),
  queryStaking: jest.fn(),
  queryIdentity: jest.fn(),
  queryVesting: jest.fn(),
  estimateFee: jest.fn(),
  queryChainInfo: jest.fn(),
};

describe("ProxySettingsWidget", () => {
  it("renders nothing when disconnected", () => {
    const { container } = render(
      <WalletContext.Provider value={{ ...mockWalletBase, connected: false }}>
        <ProxySettingsWidget />
      </WalletContext.Provider>
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when context is missing entirely (for test safety)", () => {
    const { container } = render(<ProxySettingsWidget />);
    expect(container.firstChild).toBeNull();
  });

  it("renders status as Inactive when connected and proxy is not active", () => {
    render(
      <WalletContext.Provider
        value={{
          ...mockWalletBase,
          connected: true,
          isProxyActive: false,
          agentAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        }}
      >
        <ProxySettingsWidget />
      </WalletContext.Provider>
    );

    expect(screen.getByText("Secure Delegation")).toBeInTheDocument();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
    expect(screen.getByText("Enable Secure Delegation")).toBeInTheDocument();
    expect(screen.getByText("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")).toBeInTheDocument();
  });

  it("renders status as Checking... when checkingProxy is true", () => {
    render(
      <WalletContext.Provider
        value={{
          ...mockWalletBase,
          connected: true,
          checkingProxy: true,
        }}
      >
        <ProxySettingsWidget />
      </WalletContext.Provider>
    );

    expect(screen.getByText("Checking...")).toBeInTheDocument();
  });

  it("renders status as Guarded when isProxyActive is true", () => {
    render(
      <WalletContext.Provider
        value={{
          ...mockWalletBase,
          connected: true,
          isProxyActive: true,
        }}
      >
        <ProxySettingsWidget />
      </WalletContext.Provider>
    );

    expect(screen.getByText("Guarded")).toBeInTheDocument();
    expect(screen.getByText("Revoke Agent Authority")).toBeInTheDocument();
  });

  it("calls addProxyDelegate and goes through status cycle when enabling", async () => {
    let statusCallback: (status: string, txHash?: string, blockNumber?: number, error?: string) => void;
    const addProxyDelegateMock = jest.fn().mockImplementation((type, cb) => {
      statusCallback = cb;
      return Promise.resolve();
    });

    render(
      <WalletContext.Provider
        value={{
          ...mockWalletBase,
          connected: true,
          isProxyActive: false,
          addProxyDelegate: addProxyDelegateMock,
        }}
      >
        <ProxySettingsWidget />
      </WalletContext.Provider>
    );

    const button = screen.getByText("Enable Secure Delegation");
    fireEvent.click(button);

    expect(addProxyDelegateMock).toHaveBeenCalledWith("Any", expect.any(Function));

    // Call statusCallback for pending state
    act(() => {
      statusCallback("pending");
    });
    expect(screen.getByText("Submitting delegation transaction...")).toBeInTheDocument();

    // Call statusCallback for submitted state
    act(() => {
      statusCallback("submitted");
    });
    expect(screen.getByText("Delegation submitted...")).toBeInTheDocument();

    // Call statusCallback for finalized state
    act(() => {
      statusCallback("finalized");
    });
    expect(screen.queryByText("Delegation submitted...")).not.toBeInTheDocument();
  });

  it("shows error when addProxyDelegate fails status callback", async () => {
    let statusCallback: (status: string, txHash?: string, blockNumber?: number, error?: string) => void;
    const addProxyDelegateMock = jest.fn().mockImplementation((type, cb) => {
      statusCallback = cb;
      return Promise.resolve();
    });

    render(
      <WalletContext.Provider
        value={{
          ...mockWalletBase,
          connected: true,
          isProxyActive: false,
          addProxyDelegate: addProxyDelegateMock,
        }}
      >
        <ProxySettingsWidget />
      </WalletContext.Provider>
    );

    const button = screen.getByText("Enable Secure Delegation");
    fireEvent.click(button);

    act(() => {
      statusCallback("failed", undefined, undefined, "User rejected signature");
    });

    expect(screen.getByText("Error: User rejected signature")).toBeInTheDocument();
  });

  it("calls removeProxyDelegate and goes through status cycle when revoking", async () => {
    let statusCallback: (status: string, txHash?: string, blockNumber?: number, error?: string) => void;
    const removeProxyDelegateMock = jest.fn().mockImplementation((type, cb) => {
      statusCallback = cb;
      return Promise.resolve();
    });

    render(
      <WalletContext.Provider
        value={{
          ...mockWalletBase,
          connected: true,
          isProxyActive: true,
          removeProxyDelegate: removeProxyDelegateMock,
        }}
      >
        <ProxySettingsWidget />
      </WalletContext.Provider>
    );

    const button = screen.getByText("Revoke Agent Authority");
    fireEvent.click(button);

    expect(removeProxyDelegateMock).toHaveBeenCalledWith("Any", expect.any(Function));

    act(() => {
      statusCallback("pending");
    });
    expect(screen.getByText("Submitting revoke transaction...")).toBeInTheDocument();

    act(() => {
      statusCallback("submitted");
    });
    expect(screen.getByText("Revocation submitted...")).toBeInTheDocument();

    act(() => {
      statusCallback("finalized");
    });
    expect(screen.queryByText("Revocation submitted...")).not.toBeInTheDocument();
  });

  it("shows error when removeProxyDelegate fails status callback", async () => {
    let statusCallback: (status: string, txHash?: string, blockNumber?: number, error?: string) => void;
    const removeProxyDelegateMock = jest.fn().mockImplementation((type, cb) => {
      statusCallback = cb;
      return Promise.resolve();
    });

    render(
      <WalletContext.Provider
        value={{
          ...mockWalletBase,
          connected: true,
          isProxyActive: true,
          removeProxyDelegate: removeProxyDelegateMock,
        }}
      >
        <ProxySettingsWidget />
      </WalletContext.Provider>
    );

    const button = screen.getByText("Revoke Agent Authority");
    fireEvent.click(button);

    act(() => {
      statusCallback("failed", undefined, undefined, "Extrinsic error");
    });

    expect(screen.getByText("Error: Extrinsic error")).toBeInTheDocument();
  });

  it("handles exception thrown in addProxyDelegate hook invocation", async () => {
    const addProxyDelegateMock = jest.fn().mockRejectedValue(new Error("Network disconnect"));

    render(
      <WalletContext.Provider
        value={{
          ...mockWalletBase,
          connected: true,
          isProxyActive: false,
          addProxyDelegate: addProxyDelegateMock,
        }}
      >
        <ProxySettingsWidget />
      </WalletContext.Provider>
    );

    const button = screen.getByText("Enable Secure Delegation");
    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByText("Error: Network disconnect")).toBeInTheDocument();
  });
});
