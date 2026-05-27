import { NextResponse } from "next/server";
import { parseIntent, validateIntent } from "@/lib/ai-tools";
import type { ParsedIntent } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { message: "Please provide a message.", intent: null },
        { status: 400 }
      );
    }

    // Parse the intent using the deterministic parser
    const intent: ParsedIntent | null = parseIntent(message);

    if (!intent) {
      return NextResponse.json({
        message: `I understood your command, but I couldn't parse a valid transaction from it. Try something like:\n\n• "Send 10 POT to Alice"\n• "Airdrop 5 POT to Alice, Bob, and Charlie"\n• "What's my balance?"\n• "Stake 100 POT"\n• "Set my name to Edy"\n• "Show vesting schedule"\n• "Chain info"`,
        intent: null,
      });
    }

    // Validate the intent
    const validation = validateIntent(intent);
    if (!validation.valid) {
      return NextResponse.json({
        message: `⚠️ ${validation.error}`,
        intent: null,
      });
    }

    // Build response message based on intent type
    let responseMessage = "";

    switch (intent.action) {
      case "transfer":
        responseMessage = `I'll prepare a transfer of ${intent.amount} POT to ${intent.to}. Review the details below and click Execute when ready.`;
        break;
      case "batch_transfer":
        responseMessage = `I'll prepare a batch airdrop to ${intent.transfers.length} recipients. Review the details below and click Execute Batch when ready.`;
        break;
      case "check_balance":
        responseMessage = `Here's your current balance on Portaldot:`;
        break;
      case "stake":
        responseMessage = `I'll prepare a staking bond of ${intent.amount} POT${intent.validator ? ` with validator ${intent.validator}` : ""}. Review the details below.`;
        break;
      case "unstake":
        responseMessage = `I'll prepare an unbond request for ${intent.amount} POT. Note: unbonding takes ~28 eras. Review below.`;
        break;
      case "check_staking":
        responseMessage = `Here's your current staking status on Portaldot:`;
        break;
      case "set_identity":
        responseMessage = `I'll set your on-chain identity display name to "${intent.displayName}". This requires a deposit. Review below.`;
        break;
      case "check_identity":
        responseMessage = intent.name
          ? `Looking up on-chain identity for ${intent.name}:`
          : `Here's your on-chain identity:`;
        break;
      case "check_vesting":
        responseMessage = `Here's your vesting schedule on Portaldot:`;
        break;
      case "estimate_fee":
        responseMessage = `Estimated transaction fee:`;
        break;
      case "check_chain_info":
        responseMessage = `Current Portaldot network status:`;
        break;
    }

    return NextResponse.json({
      message: responseMessage,
      intent,
    });
  } catch {
    return NextResponse.json(
      { message: "An error occurred processing your request.", intent: null },
      { status: 500 }
    );
  }
}
