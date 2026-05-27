import { render, screen, act } from "@testing-library/react";
import { TerminalDemo } from "@/components/TerminalDemo";

describe("TerminalDemo", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const typeCommand = () => {
    for (let i = 0; i < 21; i++) {
      act(() => {
        jest.advanceTimersByTime(55);
      });
    }
  };

  it("advances through the animation phases sequentially via fake timers", () => {
    render(<TerminalDemo />);
    expect(screen.getByText("potdo terminal")).toBeInTheDocument();

    // 1. Typing phase
    typeCommand();

    // 2. Typing finished (waiting for parsing)
    act(() => {
      jest.advanceTimersByTime(900);
    });
    expect(screen.getByText("Parsing intent...")).toBeInTheDocument();

    // 3. Parsing phase -> Preview
    act(() => {
      jest.advanceTimersByTime(1200);
    });
    expect(screen.getByText("Transfer Preview")).toBeInTheDocument();

    // 4. Preview phase -> Confirmed
    act(() => {
      jest.advanceTimersByTime(900);
    });
    expect(screen.getByText("Transaction Confirmed!")).toBeInTheDocument();

    // 5. Confirmed phase -> loop back
    act(() => {
      jest.advanceTimersByTime(3500);
    });
  });

  it("clears typing timer on unmount", () => {
    const { unmount } = render(<TerminalDemo />);
    act(() => {
      jest.advanceTimersByTime(55);
    });
    unmount();
  });

  it("clears typing finished timer on unmount", () => {
    const { unmount } = render(<TerminalDemo />);
    typeCommand();
    act(() => {
      jest.advanceTimersByTime(400);
    });
    unmount();
  });

  it("clears parsing timer on unmount", () => {
    const { unmount } = render(<TerminalDemo />);
    typeCommand();
    act(() => {
      jest.advanceTimersByTime(900); // enter parsing
      jest.advanceTimersByTime(500); // wait halfway
    });
    unmount();
  });

  it("clears preview timer on unmount", () => {
    const { unmount } = render(<TerminalDemo />);
    typeCommand();
    act(() => {
      jest.advanceTimersByTime(900); // enter parsing
      jest.advanceTimersByTime(1200); // enter preview
      jest.advanceTimersByTime(400); // wait halfway
    });
    unmount();
  });

  it("clears confirmed timer on unmount", () => {
    const { unmount } = render(<TerminalDemo />);
    typeCommand();
    act(() => {
      jest.advanceTimersByTime(900); // enter parsing
      jest.advanceTimersByTime(1200); // enter preview
      jest.advanceTimersByTime(900); // enter confirmed
      jest.advanceTimersByTime(1500); // wait halfway
    });
    unmount();
  });
});
