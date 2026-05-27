import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConnectWalletModal } from "@/components/ConnectWalletModal";
import { useWallet } from "@/context/WalletContext";

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

describe("ConnectWalletModal", () => {
  const mockSetShowConnectModal = jest.fn();
  const mockConnectExtension = jest.fn();
  const mockConnectDemo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with mainnet configuration and instructions", () => {
    (useWallet as jest.Mock).mockReturnValue({
      targetChainName: "Portaldot Mainnet",
      rpcEndpoint: "wss://mainnet.portaldot.io",
      setShowConnectModal: mockSetShowConnectModal,
      connectExtension: mockConnectExtension,
      connectDemo: mockConnectDemo,
      connecting: false,
    });

    render(<ConnectWalletModal />);

    expect(screen.getByText("Connect Wallet")).toBeInTheDocument();
    expect(screen.getByText("Portaldot Mainnet")).toBeInTheDocument();
    expect(screen.getByText("wss://mainnet.portaldot.io")).toBeInTheDocument();
    expect(screen.getByText("Mainnet")).toBeInTheDocument();
    expect(screen.getByText("Mainnet Node Configured")).toBeInTheDocument();
    expect(screen.getByText(/This instance is connected to the live Portaldot Mainnet/)).toBeInTheDocument();
    expect(screen.getByText("Connect Substrate Extension")).toBeInTheDocument();
    expect(screen.getByText("Enter Demo Mode (Simulation)")).toBeInTheDocument();
  });

  it("renders with testnet/local configuration and instructions", () => {
    (useWallet as jest.Mock).mockReturnValue({
      targetChainName: "Portaldot Local Node",
      rpcEndpoint: "ws://127.0.0.1:9944",
      setShowConnectModal: mockSetShowConnectModal,
      connectExtension: mockConnectExtension,
      connectDemo: mockConnectDemo,
      connecting: false,
    });

    render(<ConnectWalletModal />);

    expect(screen.getByText("Portaldot Local Node")).toBeInTheDocument();
    expect(screen.getByText("ws://127.0.0.1:9944")).toBeInTheDocument();
    expect(screen.getByText("Testnet / Local Dev")).toBeInTheDocument();
    expect(screen.getByText("Testnet Node Configured")).toBeInTheDocument();
    expect(screen.getByText(/This instance points to a test or dev environment/)).toBeInTheDocument();
  });

  it("handles close button click", () => {
    (useWallet as jest.Mock).mockReturnValue({
      targetChainName: "Portaldot Mainnet",
      rpcEndpoint: "wss://mainnet.portaldot.io",
      setShowConnectModal: mockSetShowConnectModal,
      connectExtension: mockConnectExtension,
      connectDemo: mockConnectDemo,
      connecting: false,
    });

    render(<ConnectWalletModal />);

    const closeBtn = screen.getByRole("button", { name: "Close modal" });
    fireEvent.click(closeBtn);

    expect(mockSetShowConnectModal).toHaveBeenCalledWith(false);
  });

  it("handles backdrop click to close", () => {
    (useWallet as jest.Mock).mockReturnValue({
      targetChainName: "Portaldot Mainnet",
      rpcEndpoint: "wss://mainnet.portaldot.io",
      setShowConnectModal: mockSetShowConnectModal,
      connectExtension: mockConnectExtension,
      connectDemo: mockConnectDemo,
      connecting: false,
    });

    render(<ConnectWalletModal />);

    const backdrop = screen.getByTestId("connect-modal-backdrop");
    fireEvent.click(backdrop);

    expect(mockSetShowConnectModal).toHaveBeenCalledWith(false);
  });

  it("handles Connect Substrate Extension button click", () => {
    (useWallet as jest.Mock).mockReturnValue({
      targetChainName: "Portaldot Mainnet",
      rpcEndpoint: "wss://mainnet.portaldot.io",
      setShowConnectModal: mockSetShowConnectModal,
      connectExtension: mockConnectExtension,
      connectDemo: mockConnectDemo,
      connecting: false,
    });

    render(<ConnectWalletModal />);

    const connectBtn = screen.getByRole("button", { name: "Connect Substrate Extension" });
    fireEvent.click(connectBtn);

    expect(mockConnectExtension).toHaveBeenCalled();
  });

  it("handles Enter Demo Mode button click", () => {
    (useWallet as jest.Mock).mockReturnValue({
      targetChainName: "Portaldot Mainnet",
      rpcEndpoint: "wss://mainnet.portaldot.io",
      setShowConnectModal: mockSetShowConnectModal,
      connectExtension: mockConnectExtension,
      connectDemo: mockConnectDemo,
      connecting: false,
    });

    render(<ConnectWalletModal />);

    const demoBtn = screen.getByRole("button", { name: "Enter Demo Mode (Simulation)" });
    fireEvent.click(demoBtn);

    expect(mockConnectDemo).toHaveBeenCalled();
  });

  it("disables buttons when connecting is true", () => {
    (useWallet as jest.Mock).mockReturnValue({
      targetChainName: "Portaldot Mainnet",
      rpcEndpoint: "wss://mainnet.portaldot.io",
      setShowConnectModal: mockSetShowConnectModal,
      connectExtension: mockConnectExtension,
      connectDemo: mockConnectDemo,
      connecting: true,
    });

    render(<ConnectWalletModal />);

    const connectBtn = screen.getByRole("button", { name: "Enabling Extension..." });
    const demoBtn = screen.getByRole("button", { name: "Enter Demo Mode (Simulation)" });

    expect(connectBtn).toBeDisabled();
    expect(demoBtn).toBeDisabled();
  });
});
