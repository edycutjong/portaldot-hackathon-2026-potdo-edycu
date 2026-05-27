import { render, screen, fireEvent, act } from "@testing-library/react";
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

  beforeEach(() => {
    jest.useFakeTimers();
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

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

  it("handles copy-to-clipboard for address", async () => {
    render(<IdentityCard identity={fullIdentity} />);
    const copyableAddress = screen.getByTitle("Click to copy full address");
    
    fireEvent.click(copyableAddress);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(fullIdentity.address);
    expect(screen.getByText("Copied!")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
  });

  it("handles copy-to-clipboard for email", async () => {
    render(<IdentityCard identity={fullIdentity} />);
    const copyableEmail = screen.getByTitle("Click to copy email address");
    
    fireEvent.click(copyableEmail);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(fullIdentity.email);
    expect(screen.getByText("Copied!")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
  });

  it("renders website link with correct attributes to open external page", () => {
    render(<IdentityCard identity={fullIdentity} />);
    const link = screen.getByRole("link", { name: /https:\/\/alpha\.dev/i }) as HTMLAnchorElement;
    expect(link.href).toBe("https://alpha.dev/");
    expect(link.target).toBe("_blank");
    expect(link.rel).toContain("noopener");
  });

  it("prefixes protocol to website link if missing", () => {
    render(
      <IdentityCard
        identity={{
          display: "Alpha Developer",
          isVerified: false,
          address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
          web: "alpha.dev",
        }}
      />
    );
    const link = screen.getByRole("link", { name: /alpha\.dev/i }) as HTMLAnchorElement;
    expect(link.href).toBe("https://alpha.dev/");
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
    
    const dashElements = screen.getAllByText("—");
    expect(dashElements.length).toBe(2);

    expect(screen.queryByText("https://alpha.dev")).not.toBeInTheDocument();
    expect(screen.queryByText("alpha@dev.com")).not.toBeInTheDocument();
    expect(screen.queryByText("Twitter")).not.toBeInTheDocument();
  });
});
