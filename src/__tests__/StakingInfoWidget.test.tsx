import { render, screen } from "@testing-library/react";
import { StakingInfoWidget } from "@/components/StakingInfoWidget";

describe("StakingInfoWidget", () => {
  const mockStakingInfo = {
    bonded: "100",
    active: "90",
    unlocking: "10",
    rewardDestination: "Stash",
    nominations: [
      "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
    ],
  };

  it("renders staking overview with list of nominations", () => {
    render(<StakingInfoWidget info={mockStakingInfo} />);
    expect(screen.getByText("Staking Overview")).toBeInTheDocument();
    expect(screen.getByText("100 POT")).toBeInTheDocument();
    expect(screen.getByText("90 POT")).toBeInTheDocument();
    expect(screen.getByText("10 POT")).toBeInTheDocument();
    expect(screen.getByText("Stash")).toBeInTheDocument();

    // Check nomination list header
    expect(screen.getByText("Nominated Validators (2)")).toBeInTheDocument();

    // Check nomination addresses are truncated correctly
    expect(screen.getByText("1. 5GrwvaEF...GKutQY")).toBeInTheDocument();
    expect(screen.getByText("2. 5FHneW46...M694ty")).toBeInTheDocument();
  });

  it("does not render nomination list if empty", () => {
    render(<StakingInfoWidget info={{ ...mockStakingInfo, nominations: [] }} />);
    expect(screen.queryByText(/Nominated Validators/)).not.toBeInTheDocument();
  });
});
