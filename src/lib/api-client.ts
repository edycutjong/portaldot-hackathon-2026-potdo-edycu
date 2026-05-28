// Singleton API Client for Potdo backend and chain connection
import type {
  StakingInfo,
  OnChainIdentity,
  VestingSchedule,
  FeeEstimate,
  ChainInfo,
} from "@/lib/types";

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

class PotdoApiClient {
  private isDemoMode = true;
  private backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";

  setDemoMode(isDemo: boolean) {
    this.isDemoMode = isDemo;
  }

  private shouldBypass(): boolean {
    return this.isDemoMode || !this.backendUrl;
  }

  private async get<T>(path: string): Promise<T | null> {
    if (this.shouldBypass()) return null;
    try {
      let res: Response;
      try {
        res = await fetch(`${this.backendUrl}${path}`);
      } catch (fetchErr) {
        console.warn(`API GET ${path} offline:`, fetchErr);
        return null;
      }

      if (res.ok) {
        return (await res.json()) as T;
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new ApiError(errData.detail || `Request failed with status ${res.status}`);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
      console.warn(`API GET ${path} unexpected error:`, err);
      return null;
    }
  }

  private async post<T>(path: string, body: Record<string, unknown>): Promise<T | null> {
    if (this.shouldBypass()) return null;
    try {
      let res: Response;
      try {
        res = await fetch(`${this.backendUrl}${path}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } catch (fetchErr) {
        console.warn(`API POST ${path} offline:`, fetchErr);
        return null;
      }

      if (res.ok) {
        return (await res.json()) as T;
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new ApiError(errData.detail || `Request failed with status ${res.status}`);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
      console.warn(`API POST ${path} unexpected error:`, err);
      return null;
    }
  }

  // --- Methods ---

  async getProxyStatus(address: string) {
    return this.get<{ isProxyActive: boolean; proxyType: string; delegate: string | null }>(
      `/proxy-status/${address}`
    );
  }

  async getBalance(address: string) {
    return this.get<{ balancePlanck: string }>(`/balance/${address}`);
  }

  async addProxy(senderAddress: string, delegateAddress: string, proxyType: string) {
    return this.post<{ txHash: string; blockNumber: number }>(`/add-proxy`, {
      sender_address: senderAddress,
      delegate_address: delegateAddress,
      proxy_type: proxyType,
    });
  }

  async removeProxy(senderAddress: string, delegateAddress: string, proxyType: string) {
    return this.post<{ txHash: string; blockNumber: number }>(`/remove-proxy`, {
      sender_address: senderAddress,
      delegate_address: delegateAddress,
      proxy_type: proxyType,
    });
  }

  async prepareTx(endpoint: string, senderAddress: string, body: Record<string, unknown>) {
    return this.post<unknown>(`/${endpoint}`, {
      sender_address: senderAddress,
      ...body,
    });
  }

  async submitTx(
    endpoint: string,
    senderAddress: string,
    signature: string,
    body: Record<string, unknown>
  ) {
    return this.post<{ txHash: string; blockNumber: number }>(`/${endpoint}`, {
      sender_address: senderAddress,
      signature,
      ...body,
    });
  }

  async executeTransfer(
    toAddress: string,
    amountPot: number,
    proxied?: boolean,
    realAddress?: string
  ) {
    const payload: Record<string, unknown> = {
      to_address: toAddress,
      amount_pot: amountPot,
    };
    if (proxied !== undefined) payload.proxied = proxied;
    if (realAddress !== undefined) payload.real_address = realAddress;

    return this.post<{ txHash: string; blockNumber: number }>(`/transfer`, payload);
  }

  async executeBatch(
    transfers: Array<{ toAddress: string; amount: number }>,
    proxied?: boolean,
    realAddress?: string
  ) {
    const payload: Record<string, unknown> = {
      transfers: transfers.map((t) => ({ to_address: t.toAddress, amount: t.amount })),
    };
    if (proxied !== undefined) payload.proxied = proxied;
    if (realAddress !== undefined) payload.real_address = realAddress;

    return this.post<{ txHash: string; blockNumber: number }>(`/batch`, payload);
  }

  async executeStake(
    amountPot: number,
    validator?: string,
    proxied?: boolean,
    realAddress?: string
  ) {
    const payload: Record<string, unknown> = {
      amount_pot: amountPot,
    };
    if (validator !== undefined) payload.validator = validator;
    if (proxied !== undefined) payload.proxied = proxied;
    if (realAddress !== undefined) payload.real_address = realAddress;

    return this.post<{ txHash: string; blockNumber: number }>(`/stake`, payload);
  }

  async executeUnstake(amountPot: number, proxied?: boolean, realAddress?: string) {
    const payload: Record<string, unknown> = {
      amount_pot: amountPot,
    };
    if (proxied !== undefined) payload.proxied = proxied;
    if (realAddress !== undefined) payload.real_address = realAddress;

    return this.post<{ txHash: string; blockNumber: number }>(`/unstake`, payload);
  }

  async executeSetIdentity(displayName: string, proxied?: boolean, realAddress?: string) {
    const payload: Record<string, unknown> = {
      display_name: displayName,
    };
    if (proxied !== undefined) payload.proxied = proxied;
    if (realAddress !== undefined) payload.real_address = realAddress;

    return this.post<{ txHash: string; blockNumber: number }>(`/set-identity`, payload);
  }

  async getStakingInfo(address: string) {
    return this.get<StakingInfo>(`/staking/${address}`);
  }

  async getIdentity(target: string) {
    return this.get<OnChainIdentity>(`/identity/${target}`);
  }

  async getVesting(address: string) {
    return this.get<VestingSchedule>(`/vesting/${address}`);
  }

  async estimateFee(command: string) {
    return this.post<FeeEstimate>(`/estimate-fee`, { command });
  }

  async getChainInfo() {
    return this.get<ChainInfo>(`/chain-info`);
  }

  async checkHealth() {
    try {
      const res = await fetch(`${this.backendUrl}/health`);
      if (res.ok) return (await res.json()) as { rpc_endpoint?: string };
    } catch (err) {
      console.warn("API health check failed:", err);
    }
    return null;
  }
}

export const potdoClient = new PotdoApiClient();
