import { render, screen } from "@testing-library/react";
import { IdentityCard } from "@/components/IdentityCard";

describe("IdentityCard", () => {
  const fullIdentity = {
    address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    display: "Alpha Developer",
    isVerified: true,
    web: "https://alpha.dev",
    email: "alpha@dev.com",
    twitter: "@alpha_dev",
  };

  it("renders full identity correctly with all fields", () => {
    render(<IdentityCard identity={fullIdentity} />);
    expect(screen.getByText("On-Chain Identity")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
    expect(screen.getByText("Alpha Developer")).toBeInTheDocument();
    expect(screen.getByText("5GrwvaEF...GKutQY")).toBeInTheDocument();
    expect(screen.getByText("https://alpha.dev")).toBeInTheDocument();
    expect(screen.getByText("alpha@dev.com")).toBeInTheDocument();
    expect(screen.getByText("@alpha_dev")).toBeInTheDocument();
  });

  it("renders minimal identity with fallbacks and no optional fields", () => {
    render(
      <IdentityCard
        identity={{
          display: "",
          isVerified: false,
          address: "",
        }}
      />
    );
    expect(screen.queryByText("Verified")).not.toBeInTheDocument();
    
    // We should see a double-dash fallback for address and display name
    const dashElements = screen.getAllByText("—");
    expect(dashElements.length).toBe(2);

    expect(screen.queryByText("https://alpha.dev")).not.toBeInTheDocument();
    expect(screen.queryByText("alpha@dev.com")).not.toBeInTheDocument();
    expect(screen.queryByText("Twitter")).not.toBeInTheDocument();
  });
});
