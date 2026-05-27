import { render, screen } from "@testing-library/react";
import { ChainInfoWidget } from "@/components/ChainInfoWidget";

describe("ChainInfoWidget", () => {
  const mockInfo = {
    chainName: "Portaldot Mainnet",
    blockNumber: 1234567,
    runtimeVersion: 100,
    peerCount: 24,
    nodeVersion: "1.2.3",
    isSyncing: false,
  };

  it("renders offline/online status correctly when not syncing", () => {
    render(<ChainInfoWidget info={mockInfo} />);
    expect(screen.getByText("Network Status")).toBeInTheDocument();
    expect(screen.getByText("Online")).toBeInTheDocument();
    expect(screen.queryByText("Syncing")).not.toBeInTheDocument();
    expect(screen.getByText("Portaldot Mainnet")).toBeInTheDocument();
    expect(screen.getByText("#1,234,567")).toBeInTheDocument();
    expect(screen.getByText("v100")).toBeInTheDocument();
    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("1.2.3")).toBeInTheDocument();
  });

  it("renders syncing status correctly when syncing", () => {
    render(<ChainInfoWidget info={{ ...mockInfo, isSyncing: true }} />);
    expect(screen.getByText("Syncing")).toBeInTheDocument();
    expect(screen.queryByText("Online")).not.toBeInTheDocument();
  });
});
