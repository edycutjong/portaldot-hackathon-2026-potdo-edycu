import { render, screen } from "@testing-library/react";
import NotFound from "@/app/not-found";

describe("NotFound Page", () => {
  it("renders 404 title and message", () => {
    render(<NotFound />);

    // Check main title and status messages
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Transaction Path Unknown")).toBeInTheDocument();
    expect(
      screen.getByText(/The requested page or resource could not be resolved/)
    ).toBeInTheDocument();

    // Check code/cmd mockup text
    expect(screen.getByText("potdo --route query")).toBeInTheDocument();
    expect(screen.getByText("Error: Route not found. Invalid destination.")).toBeInTheDocument();

    // Check navigation link
    const link = screen.getByText("Return to Dashboard");
    expect(link).toBeInTheDocument();
    expect(link.getAttribute("href")).toBe("/");
  });
});
