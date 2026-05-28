import { render, screen } from "@testing-library/react";
import { BalanceWidget } from "@/components/BalanceWidget";

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe("BalanceWidget", () => {
  it("renders with default dashes", () => {
    render(<BalanceWidget />);
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByText("Balance")).toBeInTheDocument();
    expect(screen.getByText("Portaldot")).toBeInTheDocument();
  });

  it("renders with provided balance values", () => {
    render(<BalanceWidget free="100.0000" reserved="5.0000" frozen="2.0000" />);
    expect(screen.getByText("100.0000")).toBeInTheDocument();
    expect(screen.getByText("5.0000")).toBeInTheDocument();
    expect(screen.getByText("2.0000")).toBeInTheDocument();
  });

  it("shows POT label", () => {
    render(<BalanceWidget free="50.0000" />);
    expect(screen.getByText("POT (Free)")).toBeInTheDocument();
  });

  it("shows Reserved and Frozen labels", () => {
    render(<BalanceWidget />);
    expect(screen.getByText("Reserved")).toBeInTheDocument();
    expect(screen.getByText("Frozen")).toBeInTheDocument();
  });
});
