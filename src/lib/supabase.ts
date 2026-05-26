import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * Log a transaction to Supabase for history persistence.
 * Gracefully no-ops if Supabase is not configured (demo mode).
 */
export async function logTransaction(data: {
  sender: string;
  command: string;
  intent: Record<string, unknown>;
  txHash?: string;
  blockNumber?: number;
  status: string;
  errorMessage?: string;
  gasFee?: string;
}) {
  if (!supabase) return null;

  try {
    const { data: result, error } = await supabase
      .from("potdo_transactions")
      .insert([
        {
          sender: data.sender,
          command: data.command,
          intent: data.intent,
          tx_hash: data.txHash,
          block_number: data.blockNumber,
          status: data.status,
          error_message: data.errorMessage,
          gas_fee: data.gasFee,
        },
      ])
      .select()
      .single();

    if (error) {
      console.warn("Supabase log failed:", error.message);
      return null;
    }
    return result;
  } catch (_err) {
    return null;
  }
}

/**
 * Fetch transaction history from Supabase.
 */
export async function fetchHistory(sender?: string, limit = 20) {
  if (!supabase) return [];

  try {
    let query = supabase
      .from("potdo_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (sender) {
      query = query.eq("sender", sender);
    }

    const { data, error } = await query;
    if (error) {
      console.warn("Supabase fetch failed:", error.message);
      return [];
    }
    return data || [];
  } catch (_err) {
    return [];
  }
}
