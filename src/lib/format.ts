import { TOKEN_DECIMALS, TOKEN_UNIT } from "./constants";

/**
 * Convert planck (smallest unit) to human-readable POT string.
 * Uses the official 14 decimal places for Portaldot.
 */
export function planckToPot(planck: bigint): string {
  const whole = planck / TOKEN_UNIT;
  const remainder = planck % TOKEN_UNIT;
  const decimal = remainder.toString().padStart(TOKEN_DECIMALS, "0").slice(0, 4);
  return `${whole}.${decimal}`;
}

/**
 * Convert human-readable POT amount to planck.
 */
export function potToPlanck(pot: number): bigint {
  // Handle floating point by converting to string
  const str = pot.toFixed(TOKEN_DECIMALS);
  const [wholePart, decimalPart = ""] = str.split(".");
  const paddedDecimal = decimalPart.padEnd(TOKEN_DECIMALS, "0").slice(0, TOKEN_DECIMALS);
  return BigInt(wholePart) * TOKEN_UNIT + BigInt(paddedDecimal);
}

/**
 * Format a POT amount for display (e.g., "100.5000 POT").
 */
export function formatPot(planck: bigint): string {
  return `${planckToPot(planck)} POT`;
}

/**
 * Validate an SS58 address format.
 * Basic validation: starts with 5, is 48 chars, alphanumeric (base58).
 */
export function isValidSS58Address(address: string): boolean {
  if (!address || typeof address !== "string") return false;
  // Substrate addresses start with 1-9 or a letter, are 46-48 chars
  const ss58Regex = /^[1-9A-HJ-NP-Za-km-z]{46,48}$/;
  return ss58Regex.test(address);
}

/**
 * Truncate an address for display: "5Grwva...utQY"
 */
export function truncateAddress(address: string, chars = 6): string {
  if (!address) return "";
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Resolve a name to an address using the address book.
 */
export function resolveRecipient(
  nameOrAddress: string,
  addressBook: Record<string, string>
): { name: string; address: string } | null {
  // Check if it's already a valid address
  if (isValidSS58Address(nameOrAddress)) {
    // Reverse lookup for display name
    const name =
      Object.entries(addressBook).find(
        ([, addr]) => addr === nameOrAddress
      )?.[0] || truncateAddress(nameOrAddress);
    return { name, address: nameOrAddress };
  }

  // Look up by name (case-insensitive)
  const normalized = nameOrAddress.trim().toLowerCase();
  const entry = Object.entries(addressBook).find(
    ([name]) => name.toLowerCase() === normalized
  );

  if (entry) {
    return { name: entry[0], address: entry[1] };
  }

  return null;
}

/**
 * Parse word numbers to digits (e.g., "fifty" -> 50).
 */
export function parseAmount(input: string): number | null {
  // Try direct number parse first
  const direct = parseFloat(input);
  if (!isNaN(direct) && direct > 0) return direct;

  // Word-to-number mapping
  const wordNumbers: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
    sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
    thirty: 30, forty: 40, fifty: 50, sixty: 60,
    seventy: 70, eighty: 80, ninety: 90, hundred: 100,
    thousand: 1000,
  };

  const normalized = input.toLowerCase().trim();
  const num = wordNumbers[normalized];
  if (num && num > 0) return num;

  return null;
}
