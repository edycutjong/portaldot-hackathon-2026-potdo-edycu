import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "@/components/Header";

describe("Header", () => {
  it("renders Potdo logo text", () => {
    render(<Header />);
    expect(screen.getByText("Potdo")).toBeInTheDocument();
    expect(screen.getByAltText("Potdo Icon")).toBeInTheDocument();
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

  it("shows Demo Mode badge when connected and isDemoMode is true", () => {
    render(
      <Header
        connected={true}
        address="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
        isDemoMode={true}
      />
    );
    expect(screen.getByText("Demo Mode ⚡")).toBeInTheDocument();
  });

  it("hides Demo Mode badge when connected and isDemoMode is false", () => {
    render(
      <Header
        connected={true}
        address="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
        isDemoMode={false}
      />
    );
    expect(screen.queryByText("Demo Mode ⚡")).not.toBeInTheDocument();
  });

  it("shows Connecting... state when connecting is true", () => {
    render(<Header connected={false} connecting={true} />);
    const button = screen.getByText("Connecting...");
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it("renders a select dropdown and handles account selection when multiple accounts are present", () => {
    const onSelectAccount = jest.fn();
    const accounts = [
      { address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", meta: { name: "Alice", source: "extension" } },
      { address: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty", meta: { source: "extension" } }, // missing name to test fallback
    ];
    render(
      <Header
        connected={true}
        address="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
        accounts={accounts}
        onSelectAccount={onSelectAccount}
      />
    );

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    
    // Simulate selection change to Bob
    select.click();
    const option = screen.getByText("Account (5FHn...94ty)");
    expect(option).toBeInTheDocument();
    
    // Trigger onChange manually
    fireEvent.change(select, { target: { value: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty" } });
    
    expect(onSelectAccount).toHaveBeenCalledWith("5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty");
  });

  it("calls onDisconnect when disconnect is clicked", () => {
    const onDisconnect = jest.fn();
    render(
      <Header
        connected={true}
        address="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
        onDisconnect={onDisconnect}
      />
    );
    const button = screen.getByText("Disconnect");
    button.click();
    expect(onDisconnect).toHaveBeenCalledTimes(1);
  });

  it("renders API Docs link when NEXT_PUBLIC_BACKEND_URL env var is defined", () => {
    const originalEnv = process.env.NEXT_PUBLIC_BACKEND_URL;
    process.env.NEXT_PUBLIC_BACKEND_URL = "http://mock-backend:8000";
    
    render(<Header />);
    const link = screen.getByText("API Docs");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "http://mock-backend:8000/docs");
    
    process.env.NEXT_PUBLIC_BACKEND_URL = originalEnv;
  });

  it("hides API Docs link when NEXT_PUBLIC_BACKEND_URL env var is empty", () => {
    const originalEnv = process.env.NEXT_PUBLIC_BACKEND_URL;
    delete process.env.NEXT_PUBLIC_BACKEND_URL;
    
    render(<Header />);
    expect(screen.queryByText("API Docs")).not.toBeInTheDocument();
    
    process.env.NEXT_PUBLIC_BACKEND_URL = originalEnv;
  });
});

