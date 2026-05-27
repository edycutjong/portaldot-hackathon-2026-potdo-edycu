"use client";

import React, { createContext, useContext, useState } from "react";
import { potToPlanck, planckToPot } from "@/lib/format";
import type { StakingInfo, OnChainIdentity, VestingSchedule, FeeEstimate, ChainInfo } from "@/lib/types";

export interface InjectedAccount {
  address: string;
  meta: {
    name?: string;
    source: string;
  };
}

interface WalletContextType {
  connected: boolean;
  address: string | null;
  balance: bigint;
  isDemoMode: boolean;
  connecting: boolean;
  extensionInstalled: boolean;
  accounts: InjectedAccount[];
  connect: (useDemo?: boolean) => Promise<void>;
  disconnect: () => void;
  selectAccount: (address: string) => Promise<void>;
  executeTransfer: (
    toAddress: string,
    amountPot: number,
    onStatusChange: (status: string, txHash?: string, blockNumber?: number, error?: string) => void
  ) => Promise<void>;
  executeBatch: (
    transfers: Array<{ toAddress: string; amount: number }>,
    onStatusChange: (status: string, txHash?: string, blockNumber?: number, error?: string) => void
  ) => Promise<void>;
  executeStake: (
    amountPot: number,
    validator: string | undefined,
    onStatusChange: (status: string, txHash?: string, blockNumber?: number, error?: string) => void
  ) => Promise<void>;
  executeUnstake: (
    amountPot: number,
    onStatusChange: (status: string, txHash?: string, blockNumber?: number, error?: string) => void
  ) => Promise<void>;
  executeSetIdentity: (
    displayName: string,
    onStatusChange: (status: string, txHash?: string, blockNumber?: number, error?: string) => void
  ) => Promise<void>;
  queryStaking: () => Promise<StakingInfo>;
  queryIdentity: (targetAddress?: string) => Promise<OnChainIdentity>;
  queryVesting: () => Promise<VestingSchedule>;
  estimateFee: (command: string) => Promise<FeeEstimate>;
  queryChainInfo: () => Promise<ChainInfo>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint>(0n);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [accounts, setAccounts] = useState<InjectedAccount[]>([]);

  // Check if extension is installed (mocked/simulated)
  const extensionInstalled = typeof window !== "undefined" && !!(window as unknown as { injectedWeb3?: unknown }).injectedWeb3;

  const refreshBalance = async (addr: string) => {
    if (BACKEND_URL) {
      try {
        const res = await fetch(`${BACKEND_URL}/balance/${addr}`);
        if (res.ok) {
          const data = await res.json();
          setBalance(BigInt(data.balancePlanck));
          return;
        }
      } catch (err) {
        console.warn("Backend balance query failed, falling back to mock:", err);
      }
    }

    // Simulated balance lookup based on address book
    if (addr === "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY") {
      setBalance(100000000000000000n); // 1000 POT
    } else if (addr === "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty") {
      setBalance(50000000000000000n); // 500 POT
    } else if (addr === "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y") {
      setBalance(15000000000000000n); // 150 POT
    } else if (addr === "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYUM3aUNew") {
      setBalance(7500000000000000n); // 75 POT
    } else {
      setBalance(10000000000000000n); // 100 POT fallback
    }
  };

  const connect = async (useDemo = false) => {
    void useDemo;
    setConnecting(true);
    // Simulate loading/extension response delay
    await new Promise((r) => setTimeout(r, 600));

    const formattedAccounts: InjectedAccount[] = [
      {
        address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        meta: { name: "Alice", source: "portaldotjs" },
      },
      {
        address: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        meta: { name: "Bob", source: "portaldotjs" },
      },
      {
        address: "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y",
        meta: { name: "Charlie", source: "portaldotjs" },
      },
      {
        address: "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYUM3aUNew",
        meta: { name: "Dave", source: "portaldotjs" },
      },
    ];

    setAccounts(formattedAccounts);
    setAddress(formattedAccounts[0].address);
    setBalance(100000000000000000n); // 1000 POT
    setIsDemoMode(true);
    setConnected(true);
    setConnecting(false);
  };

  const disconnect = () => {
    setConnected(false);
    setAddress(null);
    setBalance(0n);
    setIsDemoMode(true);
    setAccounts([]);
  };

  const selectAccount = async (addr: string) => {
    setAddress(addr);
    await refreshBalance(addr);
  };

  const executeTransfer = async (
    toAddress: string,
    amountPot: number,
    onStatusChange: (status: string, txHash?: string, blockNumber?: number, error?: string) => void
  ) => {
    onStatusChange("pending");

    if (BACKEND_URL) {
      try {
        const res = await fetch(`${BACKEND_URL}/transfer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to_address: toAddress, amount_pot: amountPot })
        });
        if (res.ok) {
          const data = await res.json();
          onStatusChange("submitted", data.txHash);
          onStatusChange("finalized", data.txHash, data.blockNumber);
          await refreshBalance(address || "");
          return;
        } else {
          const errData = await res.json();
          onStatusChange("failed", undefined, undefined, errData.detail || "Transaction failed");
          return;
        }
      } catch (err) {
        console.warn("Backend transfer failed, falling back to mock:", err);
      }
    }

    await new Promise((r) => setTimeout(r, 800));
    onStatusChange("submitted", "0xdemo_tx_hash_" + Math.random().toString(36).substring(2, 10));
    await new Promise((r) => setTimeout(r, 1200));

    const mockBlock = Math.floor(100000 + Math.random() * 900000);
    onStatusChange("finalized", "0xdemo_tx_hash_finalized", mockBlock);

    setBalance((prev) => {
      const cost = potToPlanck(amountPot) + potToPlanck(0.0012);
      return prev >= cost ? prev - cost : 0n;
    });
  };

  const executeBatch = async (
    transfers: Array<{ toAddress: string; amount: number }>,
    onStatusChange: (status: string, txHash?: string, blockNumber?: number, error?: string) => void
  ) => {
    const totalAmount = transfers.reduce((sum, t) => sum + t.amount, 0);
    onStatusChange("pending");

    if (BACKEND_URL) {
      try {
        const res = await fetch(`${BACKEND_URL}/batch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transfers: transfers.map(t => ({ to_address: t.toAddress, amount: t.amount }))
          })
        });
        if (res.ok) {
          const data = await res.json();
          onStatusChange("submitted", data.txHash);
          onStatusChange("finalized", data.txHash, data.blockNumber);
          await refreshBalance(address || "");
          return;
        } else {
          const errData = await res.json();
          onStatusChange("failed", undefined, undefined, errData.detail || "Batch failed");
          return;
        }
      } catch (err) {
        console.warn("Backend batch failed, falling back to mock:", err);
      }
    }

    await new Promise((r) => setTimeout(r, 800));
    onStatusChange("submitted", "0xdemo_batch_hash_" + Math.random().toString(36).substring(2, 10));
    await new Promise((r) => setTimeout(r, 1200));

    const mockBlock = Math.floor(100000 + Math.random() * 900000);
    onStatusChange("finalized", "0xdemo_batch_hash_finalized", mockBlock);

    setBalance((prev) => {
      const cost = potToPlanck(totalAmount) + potToPlanck(0.0036);
      return prev >= cost ? prev - cost : 0n;
    });
  };

  const executeStake = async (
    amountPot: number,
    validator: string | undefined,
    onStatusChange: (status: string, txHash?: string, blockNumber?: number, error?: string) => void
  ) => {
    onStatusChange("pending");

    if (BACKEND_URL) {
      try {
        const res = await fetch(`${BACKEND_URL}/stake`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount_pot: amountPot, validator })
        });
        if (res.ok) {
          const data = await res.json();
          onStatusChange("submitted", data.txHash);
          onStatusChange("finalized", data.txHash, data.blockNumber);
          await refreshBalance(address || "");
          return;
        } else {
          const errData = await res.json();
          onStatusChange("failed", undefined, undefined, errData.detail || "Staking failed");
          return;
        }
      } catch (err) {
        console.warn("Backend stake failed, falling back to mock:", err);
      }
    }

    await new Promise((r) => setTimeout(r, 800));
    onStatusChange("submitted", "0xdemo_stake_" + Math.random().toString(36).substring(2, 10));
    await new Promise((r) => setTimeout(r, 1200));
    const mockBlock = Math.floor(100000 + Math.random() * 900000);
    onStatusChange("finalized", "0xdemo_stake_finalized", mockBlock);

    setBalance((prev) => {
      const cost = potToPlanck(amountPot) + potToPlanck(0.0012);
      return prev >= cost ? prev - cost : 0n;
    });
  };

  const executeUnstake = async (
    amountPot: number,
    onStatusChange: (status: string, txHash?: string, blockNumber?: number, error?: string) => void
  ) => {
    onStatusChange("pending");

    if (BACKEND_URL) {
      try {
        const res = await fetch(`${BACKEND_URL}/unstake`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount_pot: amountPot })
        });
        if (res.ok) {
          const data = await res.json();
          onStatusChange("submitted", data.txHash);
          onStatusChange("finalized", data.txHash, data.blockNumber);
          await refreshBalance(address || "");
          return;
        } else {
          const errData = await res.json();
          onStatusChange("failed", undefined, undefined, errData.detail || "Unstaking failed");
          return;
        }
      } catch (err) {
        console.warn("Backend unstake failed, falling back to mock:", err);
      }
    }

    await new Promise((r) => setTimeout(r, 800));
    onStatusChange("submitted", "0xdemo_unstake_" + Math.random().toString(36).substring(2, 10));
    await new Promise((r) => setTimeout(r, 1200));
    const mockBlock = Math.floor(100000 + Math.random() * 900000);
    onStatusChange("finalized", "0xdemo_unstake_finalized", mockBlock);
  };

  const executeSetIdentity = async (
    displayName: string,
    onStatusChange: (status: string, txHash?: string, blockNumber?: number, error?: string) => void
  ) => {
    onStatusChange("pending");

    if (BACKEND_URL) {
      try {
        const res = await fetch(`${BACKEND_URL}/set-identity`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ display_name: displayName })
        });
        if (res.ok) {
          const data = await res.json();
          onStatusChange("submitted", data.txHash);
          onStatusChange("finalized", data.txHash, data.blockNumber);
          await refreshBalance(address || "");
          return;
        } else {
          const errData = await res.json();
          onStatusChange("failed", undefined, undefined, errData.detail || "Identity setup failed");
          return;
        }
      } catch (err) {
        console.warn("Backend set identity failed, falling back to mock:", err);
      }
    }

    await new Promise((r) => setTimeout(r, 800));
    onStatusChange("submitted", "0xdemo_identity_" + Math.random().toString(36).substring(2, 10));
    await new Promise((r) => setTimeout(r, 1200));
    const mockBlock = Math.floor(100000 + Math.random() * 900000);
    onStatusChange("finalized", "0xdemo_identity_finalized", mockBlock);
  };

  const queryStaking = async (): Promise<StakingInfo> => {
    if (BACKEND_URL && address) {
      try {
        const res = await fetch(`${BACKEND_URL}/staking/${address}`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn("Backend staking query failed:", err);
      }
    }

    return {
      bonded: planckToPot(50000000000000000n),
      active: planckToPot(45000000000000000n),
      unlocking: planckToPot(5000000000000000n),
      nominations: [
        "5GNJqTPyNqANBkUVMN1LPPrxXnFouWA2MR5A4H7vz6NM4Jk",
        "5HpG9w8EBLe5XCrbczpwq5TSXvedjrBGCwqxK1iQ7qUsSWFc",
      ],
      rewardDestination: "Staked",
    };
  };

  const queryIdentity = async (targetAddress?: string): Promise<OnChainIdentity> => {
    const target = targetAddress || address || "";
    if (!target) {
      return {
        display: "Not Connected",
        isVerified: false,
        address: "",
      };
    }

    if (BACKEND_URL) {
      try {
        const res = await fetch(`${BACKEND_URL}/identity/${target}`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn("Backend identity query failed:", err);
      }
    }

    return {
      display: target === address ? "Potdo User" : "Alice",
      web: "https://portaldot.io",
      email: "user@portaldot.io",
      isVerified: true,
      address: target,
    };
  };

  const queryVesting = async (): Promise<VestingSchedule> => {
    if (BACKEND_URL && address) {
      try {
        const res = await fetch(`${BACKEND_URL}/vesting/${address}`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn("Backend vesting query failed:", err);
      }
    }

    return {
      locked: planckToPot(200000000000000000n),
      perPeriod: planckToPot(10000000000000000n),
      startingBlock: 100000,
      periodCount: 20,
      alreadyVested: planckToPot(60000000000000000n),
    };
  };

  const estimateFee = async (command: string): Promise<FeeEstimate> => {
    if (BACKEND_URL) {
      try {
        const res = await fetch(`${BACKEND_URL}/estimate-fee`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command })
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn("Backend fee estimate failed:", err);
      }
    }

    return {
      partialFee: "0.0012",
      weight: "186,423,000",
      class: "Normal",
    };
  };

  const queryChainInfo = async (): Promise<ChainInfo> => {
    if (BACKEND_URL) {
      try {
        const res = await fetch(`${BACKEND_URL}/chain-info`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn("Backend chain info query failed:", err);
      }
    }

    return {
      chainName: "Portaldot",
      blockNumber: 142857 + Math.floor(Math.random() * 1000),
      runtimeVersion: 100,
      peerCount: 24 + Math.floor(Math.random() * 10),
      isSyncing: false,
      nodeVersion: "1.0.0",
    };
  };

  return (
    <WalletContext.Provider
      value={{
        connected,
        address,
        balance,
        isDemoMode,
        connecting,
        extensionInstalled,
        accounts,
        connect,
        disconnect,
        selectAccount,
        executeTransfer,
        executeBatch,
        executeStake,
        executeUnstake,
        executeSetIdentity,
        queryStaking,
        queryIdentity,
        queryVesting,
        estimateFee,
        queryChainInfo,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
