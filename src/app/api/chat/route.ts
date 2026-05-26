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
        message: `I understood your command, but I couldn't parse a valid transaction from it. Try something like:\n\n• "Send 10 POT to Alice"\n• "Airdrop 5 POT to Alice, Bob, and Charlie"\n• "What's my balance?"`,
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
