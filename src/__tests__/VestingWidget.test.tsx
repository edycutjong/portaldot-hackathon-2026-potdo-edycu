import { render, screen } from "@testing-library/react";
import { VestingWidget } from "@/components/VestingWidget";

describe("VestingWidget", () => {
  const mockSchedule = {
    locked: "50.0000",
    alreadyVested: "50.0000",
    perPeriod: "1.0000",
    startingBlock: 100000,
    periodCount: 100,
  };

  it("renders vesting schedule correctly with non-zero progress", () => {
    render(<VestingWidget schedule={mockSchedule} />);
    expect(screen.getByText("Vesting Schedule")).toBeInTheDocument();
    expect(screen.getByText("50% Vested")).toBeInTheDocument();
    expect(screen.getByText("50.0000 / 100.0000 POT")).toBeInTheDocument();
    expect(screen.getAllByText("50.0000 POT")).toHaveLength(2);
    expect(screen.getByText("1.0000 POT")).toBeInTheDocument();
    expect(screen.getByText("#100,000")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("handles zero total lock gracefully", () => {
    render(
      <VestingWidget
        schedule={{
          locked: "0.0000",
          alreadyVested: "0.0000",
          perPeriod: "0.0000",
          startingBlock: 0,
          periodCount: 0,
        }}
      />
    );
    expect(screen.getByText("0% Vested")).toBeInTheDocument();
    expect(screen.getByText("0.0000 / 0.0000 POT")).toBeInTheDocument();
  });
});
