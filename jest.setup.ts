import "@testing-library/jest-dom/jest-globals";

// Mock HTMLCanvasElement getContext to prevent jsdom errors
if (typeof window !== "undefined") {
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    clearRect: jest.fn(),
    fillRect: jest.fn(),
  })) as any;
}
