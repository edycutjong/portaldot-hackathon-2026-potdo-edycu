import { render, screen } from "@testing-library/react";
import { Header } from "@/components/Header";

describe("Header", () => {
  it("renders Potdo logo text", () => {
    render(<Header />);
    expect(screen.getByText("Potdo")).toBeInTheDocument();
    expect(screen.getByText("P")).toBeInTheDocument();
  });

  it("shows Connect Wallet button when not connected", () => {
    render(<Header connected={false} />);
    expect(screen.getByText("Connect Wallet")).toBeInTheDocument();
  });

  it("shows wallet address when connected", () => {
    render(
      <Header
        connected={true}
        address="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
        balance="100.0000 POT"
      />
    );
    expect(screen.getByText(/5Grwva/)).toBeInTheDocument();
    expect(screen.getByText("100.0000 POT")).toBeInTheDocument();
  });

  it("hides Connect button when connected", () => {
    render(
      <Header
        connected={true}
        address="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
      />
    );
    expect(screen.queryByText("Connect Wallet")).not.toBeInTheDocument();
  });
});
