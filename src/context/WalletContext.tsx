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
  isProxyActive: boolean;
  proxyType: string;
  agentAddress: string | null;
  checkingProxy: boolean;
  connect: (useDemo?: boolean) => Promise<void>;
  disconnect: () => void;
  selectAccount: (address: string) => Promise<void>;
  checkProxyStatus: () => Promise<void>;
  addProxyDelegate: (
    proxyType?: string,
    onStatusChange?: (status: string, txHash?: string, blockNumber?: number, error?: string) => void
  ) => Promise<void>;
  removeProxyDelegate: (
    proxyType?: string,
    onStatusChange?: (status: string, txHash?: string, blockNumber?: number, error?: string) => void
  ) => Promise<void>;
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

export const WalletContext = createContext<WalletContextType | undefined>(undefined);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint>(0n);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
  
  const [isProxyActive, setIsProxyActive] = useState(false);
  const [proxyType, setProxyType] = useState("Any");
  const [agentAddress, setAgentAddress] = useState<string | null>(null);
  const [checkingProxy, setCheckingProxy] = useState(false);

  // Check if extension is installed (mocked/simulated)
  const extensionInstalled = typeof window !== "undefined" && !!(window as unknown as { injectedWeb3?: unknown }).injectedWeb3;

  const checkProxyStatus = async (addr?: string) => {
    const targetAddr = addr || address;
    if (!targetAddr) return;
    setCheckingProxy(true);
    if (BACKEND_URL) {
      try {
        const res = await fetch(`${BACKEND_URL}/proxy-status/${targetAddr}`);
        if (res.ok) {
          const data = await res.json();
          setIsProxyActive(data.isProxyActive);
          setProxyType(data.proxyType);
          setAgentAddress(data.delegate);
          setCheckingProxy(false);
          return;
        }
      } catch (err) {
        console.warn("Backend proxy status query failed:", err);
      }
    }
    // Fallback/Demo mode
    const isAlice = targetAddr === "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
    setIsProxyActive(isAlice);
    setProxyType("Any");
    setAgentAddress("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY");
    setCheckingProxy(false);
  };

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
    setConnecting(true);
    try {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      if (!useDemo && typeof window !== "undefined" && (window as any).injectedWeb3) {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const injectedWeb3 = (window as any).injectedWeb3;
        const extensionNames = Object.keys(injectedWeb3);
        if (extensionNames.length > 0) {
          // Auto-connect to the first extension (Talisman, SubWallet, or polkadot-js)
          const extName = extensionNames[0];
          const extension = injectedWeb3[extName];
          const enabledExtension = await extension.enable("Potdo");
          const extAccounts = await enabledExtension.accounts.get();
          
          if (extAccounts && extAccounts.length > 0) {
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            const formattedAccounts: InjectedAccount[] = extAccounts.map((acc: any) => ({
              address: acc.address,
              meta: { name: acc.name || "Unnamed Account", source: extName },
            }));
            
            setAccounts(formattedAccounts);
            setAddress(formattedAccounts[0].address);
            setIsDemoMode(false);
            setConnected(true);
            setConnecting(false);
            await refreshBalance(formattedAccounts[0].address);
            await checkProxyStatus(formattedAccounts[0].address);
            return;
          }
        }
      }
    } catch (err) {
      console.warn("Substrate extension connection failed, falling back to demo mode:", err);
    }

    // Demo Mode Fallback
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
    await checkProxyStatus(formattedAccounts[0].address);
  };

  const disconnect = () => {
    setConnected(false);
    setAddress(null);
    setBalance(0n);
    setIsDemoMode(true);
    setAccounts([]);
    setIsProxyActive(false);
    setProxyType("Any");
  };

  const selectAccount = async (addr: string) => {
    setAddress(addr);
    await refreshBalance(addr);
    await checkProxyStatus(addr);
  };

  const addProxyDelegate = async (
    pType = "Any",
    onStatusChange?: (status: string, txHash?: string, blockNumber?: number, error?: string) => void
  ) => {
    const statusCallback = onStatusChange || (() => {});
    statusCallback("pending");
    const delegate = agentAddress || "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
    const handled = await signAndSubmit(
      "prepare-add-proxy",
      "submit-add-proxy",
      { delegate_address: delegate, proxy_type: pType },
      statusCallback
    );
    if (handled) {
      await checkProxyStatus();
      return;
    }
    
    // Fallback/Simulated
    await new Promise((r) => setTimeout(r, 800));
    statusCallback("submitted", "0xdemo_add_proxy_tx");
    await new Promise((r) => setTimeout(r, 1200));
    const mockBlock = 142857;
    statusCallback("finalized", "0xdemo_add_proxy_finalized", mockBlock);
    setIsProxyActive(true);
    setProxyType(pType);
  };

  const removeProxyDelegate = async (
    pType = "Any",
    onStatusChange?: (status: string, txHash?: string, blockNumber?: number, error?: string) => void
  ) => {
    const statusCallback = onStatusChange || (() => {});
    statusCallback("pending");
    const delegate = agentAddress || "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
    const handled = await signAndSubmit(
      "prepare-remove-proxy",
      "submit-remove-proxy",
      { delegate_address: delegate, proxy_type: pType },
      statusCallback
    );
    if (handled) {
      await checkProxyStatus();
      return;
    }
    
    // Fallback/Simulated
    await new Promise((r) => setTimeout(r, 800));
    statusCallback("submitted", "0xdemo_remove_proxy_tx");
    await new Promise((r) => setTimeout(r, 1200));
    const mockBlock = 142857;
    statusCallback("finalized", "0xdemo_remove_proxy_finalized", mockBlock);
    setIsProxyActive(false);
  };

  const signAndSubmit = async (
    prepareEndpoint: string,
    submitEndpoint: string,
    prepareBody: object,
    onStatusChange: (status: string, txHash?: string, blockNumber?: number, error?: string) => void
  ): Promise<boolean> => {
    const activeAccount = accounts.find(a => a.address === address);
    const source = activeAccount?.meta.source;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    if (!isDemoMode && typeof window !== "undefined" && source && (window as any).injectedWeb3?.[source]) {
      try {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const extension = (window as any).injectedWeb3[source];
        const enabled = await extension.enable("Potdo");
        const signer = enabled.signer;
        
        // 1. Prepare payload JSON on the backend
        const prepRes = await fetch(`${BACKEND_URL}/${prepareEndpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sender_address: address, ...prepareBody })
        });
        if (!prepRes.ok) {
          const errData = await prepRes.json();
          throw new Error(errData.detail || `Failed to prepare transaction`);
        }
        const payload = await prepRes.json();
        
        // 2. Request signature from the wallet extension
        const signResult = await signer.signPayload(payload);
        const signature = signResult.signature;
        
        // 3. Submit transaction with the signature
        const submitRes = await fetch(`${BACKEND_URL}/${submitEndpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sender_address: address, signature, ...prepareBody })
        });
        if (!submitRes.ok) {
          const errData = await submitRes.json();
          throw new Error(errData.detail || `Failed to submit signed transaction`);
        }
        const data = await submitRes.json();
        onStatusChange("submitted", data.txHash);
        onStatusChange("finalized", data.txHash, data.blockNumber);
        await refreshBalance(address || "");
        return true;
      } catch (err: unknown) {
        console.error("Wallet extension transaction execution failed:", err);
        const errMsg = err instanceof Error ? err.message : "Transaction failed";
        onStatusChange("failed", undefined, undefined, errMsg);
        return true;
      }
    }
    return false;
  };

  const executeTransfer = async (
    toAddress: string,
    amountPot: number,
    onStatusChange: (status: string, txHash?: string, blockNumber?: number, error?: string) => void
  ) => {
    onStatusChange("pending");

    if (isProxyActive) {
      if (BACKEND_URL) {
        try {
          const res = await fetch(`${BACKEND_URL}/transfer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to_address: toAddress,
              amount_pot: amountPot,
              proxied: true,
              real_address: address
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
            onStatusChange("failed", undefined, undefined, errData.detail || "Transaction failed");
            return;
          }
        } catch (err: unknown) {
          console.warn("Proxied transfer failed:", err);
          const errMsg = err instanceof Error ? err.message : "Transaction failed";
          onStatusChange("failed", undefined, undefined, errMsg);
          return;
        }
      }
    } else {
      const handled = await signAndSubmit(
        "prepare-transfer",
        "submit-transfer",
        { to_address: toAddress, amount_pot: amountPot },
        onStatusChange
      );
      if (handled) return;
    }

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

    if (isProxyActive) {
      if (BACKEND_URL) {
        try {
          const res = await fetch(`${BACKEND_URL}/batch`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              transfers: transfers.map(t => ({ to_address: t.toAddress, amount: t.amount })),
              proxied: true,
              real_address: address
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
        } catch (err: unknown) {
          console.warn("Proxied batch failed:", err);
          const errMsg = err instanceof Error ? err.message : "Batch failed";
          onStatusChange("failed", undefined, undefined, errMsg);
          return;
        }
      }
    } else {
      const handled = await signAndSubmit(
        "prepare-batch",
        "submit-batch",
        { transfers: transfers.map(t => ({ to_address: t.toAddress, amount: t.amount })) },
        onStatusChange
      );
      if (handled) return;
    }

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

    if (isProxyActive) {
      if (BACKEND_URL) {
        try {
          const res = await fetch(`${BACKEND_URL}/stake`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount_pot: amountPot,
              validator,
              proxied: true,
              real_address: address
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
            onStatusChange("failed", undefined, undefined, errData.detail || "Staking failed");
            return;
          }
        } catch (err: unknown) {
          console.warn("Proxied stake failed:", err);
          const errMsg = err instanceof Error ? err.message : "Staking failed";
          onStatusChange("failed", undefined, undefined, errMsg);
          return;
        }
      }
    } else {
      const handled = await signAndSubmit(
        "prepare-stake",
        "submit-stake",
        { amount_pot: amountPot, validator },
        onStatusChange
      );
      if (handled) return;
    }

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

    if (isProxyActive) {
      if (BACKEND_URL) {
        try {
          const res = await fetch(`${BACKEND_URL}/unstake`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount_pot: amountPot,
              proxied: true,
              real_address: address
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
            onStatusChange("failed", undefined, undefined, errData.detail || "Unstaking failed");
            return;
          }
        } catch (err: unknown) {
          console.warn("Proxied unstake failed:", err);
          const errMsg = err instanceof Error ? err.message : "Unstaking failed";
          onStatusChange("failed", undefined, undefined, errMsg);
          return;
        }
      }
    } else {
      const handled = await signAndSubmit(
        "prepare-unstake",
        "submit-unstake",
        { amount_pot: amountPot },
        onStatusChange
      );
      if (handled) return;
    }

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

    if (isProxyActive) {
      if (BACKEND_URL) {
        try {
          const res = await fetch(`${BACKEND_URL}/set-identity`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              display_name: displayName,
              proxied: true,
              real_address: address
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
            onStatusChange("failed", undefined, undefined, errData.detail || "Identity setup failed");
            return;
          }
        } catch (err: unknown) {
          console.warn("Proxied identity setup failed:", err);
          const errMsg = err instanceof Error ? err.message : "Identity setup failed";
          onStatusChange("failed", undefined, undefined, errMsg);
          return;
        }
      }
    } else {
      const handled = await signAndSubmit(
        "prepare-set-identity",
        "submit-set-identity",
        { display_name: displayName },
        onStatusChange
      );
      if (handled) return;
    }

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
        isProxyActive,
        proxyType,
        agentAddress,
        checkingProxy,
        connect,
        disconnect,
        selectAccount,
        checkProxyStatus,
        addProxyDelegate,
        removeProxyDelegate,
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
