import { render, screen } from "@testing-library/react";
import { FeeEstimateWidget } from "@/components/FeeEstimateWidget";

describe("FeeEstimateWidget", () => {
  const baseFee = {
    partialFee: "0.0125",
    weight: "150,000,000",
    class: "Normal" as const,
  };

  it("renders with Normal class correctly", () => {
    render(<FeeEstimateWidget fee={baseFee} />);
    expect(screen.getByText("Fee Estimate")).toBeInTheDocument();
    expect(screen.getByText("0.0125 POT")).toBeInTheDocument();
    expect(screen.getByText("150,000,000")).toBeInTheDocument();

    const classEl = screen.getByText("Normal");
    expect(classEl).toBeInTheDocument();
    expect(classEl).toHaveClass("text-green-400");
  });

  it("renders with Operational class correctly", () => {
    render(<FeeEstimateWidget fee={{ ...baseFee, class: "Operational" }} />);
    const classEl = screen.getByText("Operational");
    expect(classEl).toBeInTheDocument();
    expect(classEl).toHaveClass("text-amber-400");
  });

  it("renders with other classes (e.g. Mandatory) correctly", () => {
    render(<FeeEstimateWidget fee={{ ...baseFee, class: "Mandatory" as "Normal" }} />);
    const classEl = screen.getByText("Mandatory");
    expect(classEl).toBeInTheDocument();
    expect(classEl).toHaveClass("text-red-400");
  });
});
