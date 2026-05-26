import "server-only";

// Re-export from the core parser (which is testable without server-only)
export { parseIntent, validateIntent } from "./intent-parser";
