"use client";

import React, { createContext, useContext, useState } from "react";
import type { ApiPromise } from "@polkadot/api";
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

interface AccountInfo {
  data: {
    free: {
      toString: () => string;
    };
  };
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint>(0n);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [accounts, setAccounts] = useState<InjectedAccount[]>([]);

  // Lazy initializer to check if extension is installed on mount/first render
  const [extensionInstalled, setExtensionInstalled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return !!(window as unknown as { injectedWeb3?: unknown }).injectedWeb3;
    }
    return true;
  });

  const refreshBalance = async (addr: string, apiInstance?: ApiPromise) => {
    try {
      let api = apiInstance;
      let shouldDisconnect = false;

      if (!api) {
        const { ApiPromise, WsProvider } = await import("@polkadot/api");
        const provider = new WsProvider("wss://mainnet.portaldot.io");
        api = await ApiPromise.create({ provider });
        shouldDisconnect = true;
      }

      const balanceData = await api.query.system.account(addr);
      const info = balanceData as unknown as AccountInfo;
      if (info && info.data) {
        setBalance(BigInt(info.data.free.toString()));
      }

      if (shouldDisconnect) {
        await api.disconnect();
      }
    } catch (err) {
      console.warn("Failed to fetch real on-chain balance, falling back to mock balance:", err);
      setBalance(100000000000000000n); // 1000 POT
    }
  };

  const connect = async (useDemo = false) => {
    setConnecting(true);

    if (useDemo || typeof window === "undefined" || !(window as unknown as { injectedWeb3?: unknown }).injectedWeb3) {
      setAddress("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY");
      setBalance(100000000000000000n); // 1000 POT
      setIsDemoMode(true);
      setConnected(true);
      setConnecting(false);
      return;
    }

    try {
      const { web3Enable, web3Accounts } = await import("@polkadot/extension-dapp");
      const extensions = await web3Enable("Potdo");

      if (extensions.length === 0) {
        setExtensionInstalled(false);
        await connect(true);
        return;
      }

      setExtensionInstalled(true);
      const allAccounts = await web3Accounts();

      if (allAccounts.length === 0) {
        await connect(true);
        return;
      }

      const formattedAccounts: InjectedAccount[] = allAccounts.map((a) => ({
        address: a.address,
        meta: {
          name: a.meta.name,
          source: a.meta.source,
        },
      }));

      setAccounts(formattedAccounts);
      const activeAddr = formattedAccounts[0].address;
      setAddress(activeAddr);
      setIsDemoMode(false);
      setConnected(true);

      await refreshBalance(activeAddr);
    } catch (err) {
      console.warn("Extension connect failed, falling back to Demo Mode:", err);
      await connect(true);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    setConnected(false);
    setAddress(null);
    setBalance(0n);
    setIsDemoMode(true);
    setAccounts([]);
  };

  const selectAccount = async (addr: string) => {
    if (isDemoMode) return;
    setAddress(addr);
    await refreshBalance(addr);
  };

  const executeTransfer = async (
    toAddress: string,
    amountPot: number,
    onStatusChange: (status: string, txHash?: string, blockNumber?: number, error?: string) => void
  ) => {
    if (isDemoMode || !address) {
      onStatusChange("pending");
      await new Promise((r) => setTimeout(r, 800));
      onStatusChange("submitted", "0xdemo_tx_hash_" + Math.random().toString(36).substring(2, 10));
      await new Promise((r) => setTimeout(r, 1200));

      const mockBlock = Math.floor(100000 + Math.random() * 900000);
      onStatusChange("finalized", "0xdemo_tx_hash_finalized", mockBlock);

      setBalance((prev) => {
        const cost = potToPlanck(amountPot) + potToPlanck(0.001);
        return prev >= cost ? prev - cost : 0n;
      });
      return;
    }

    try {
      onStatusChange("pending");
      const { ApiPromise, WsProvider } = await import("@polkadot/api");
      const { web3FromAddress } = await import("@polkadot/extension-dapp");

      const provider = new WsProvider("wss://mainnet.portaldot.io");
      const api = await ApiPromise.create({ provider });

      const injector = await web3FromAddress(address);
      api.setSigner(injector.signer);

      const amountPlanck = potToPlanck(amountPot);
      const tx = api.tx.balances.transferKeepAlive(toAddress, amountPlanck);

      const unsub = await tx.signAndSend(address, ({ status, dispatchError }) => {
        if (status.isReady) {
          onStatusChange("submitted");
        }
        if (status.isInBlock) {
          const blockHash = status.asInBlock.toString();
          api.rpc.chain
            .getHeader(blockHash)
            .then((header) => {
              const blockNumber = header.number.toNumber();

              if (dispatchError) {
                let errorMsg = "Transaction failed";
                if (dispatchError.isModule) {
                  const decoded = api.registry.findMetaError(dispatchError.asModule);
                  errorMsg = `${decoded.section}.${decoded.name}: ${decoded.docs.join(" ")}`;
                }
                onStatusChange("failed", undefined, blockNumber, errorMsg);
              } else {
                onStatusChange("finalized", tx.hash.toHex(), blockNumber);
                refreshBalance(address, api);
              }
              unsub();
              api.disconnect();
            })
            .catch((err) => {
              const errStr = err instanceof Error ? err.message : String(err);
              onStatusChange("failed", undefined, undefined, errStr);
              unsub();
              api.disconnect();
            });
        }
      });
    } catch (err) {
      const errStr = err instanceof Error ? err.message : String(err);
      onStatusChange("failed", undefined, undefined, errStr);
    }
  };

  const executeBatch = async (
    transfers: Array<{ toAddress: string; amount: number }>,
    onStatusChange: (status: string, txHash?: string, blockNumber?: number, error?: string) => void
  ) => {
    const totalAmount = transfers.reduce((sum, t) => sum + t.amount, 0);

    if (isDemoMode || !address) {
      onStatusChange("pending");
      await new Promise((r) => setTimeout(r, 800));
      onStatusChange("submitted", "0xdemo_batch_hash_" + Math.random().toString(36).substring(2, 10));
      await new Promise((r) => setTimeout(r, 1200));

      const mockBlock = Math.floor(100000 + Math.random() * 900000);
      onStatusChange("finalized", "0xdemo_batch_hash_finalized", mockBlock);

      setBalance((prev) => {
        const cost = potToPlanck(totalAmount) + potToPlanck(0.003);
        return prev >= cost ? prev - cost : 0n;
      });
      return;
    }

    try {
      onStatusChange("pending");
      const { ApiPromise, WsProvider } = await import("@polkadot/api");
      const { web3FromAddress } = await import("@polkadot/extension-dapp");

      const provider = new WsProvider("wss://mainnet.portaldot.io");
      const api = await ApiPromise.create({ provider });

      const injector = await web3FromAddress(address);
      api.setSigner(injector.signer);

      const txs = transfers.map((t) =>
        api.tx.balances.transferKeepAlive(t.toAddress, potToPlanck(t.amount))
      );
      const batchTx = api.tx.utility.batch(txs);

      const unsub = await batchTx.signAndSend(address, ({ status, dispatchError }) => {
        if (status.isReady) {
          onStatusChange("submitted");
        }
        if (status.isInBlock) {
          const blockHash = status.asInBlock.toString();
          api.rpc.chain
            .getHeader(blockHash)
            .then((header) => {
              const blockNumber = header.number.toNumber();

              if (dispatchError) {
                let errorMsg = "Batch transaction failed";
                if (dispatchError.isModule) {
                  const decoded = api.registry.findMetaError(dispatchError.asModule);
                  errorMsg = `${decoded.section}.${decoded.name}: ${decoded.docs.join(" ")}`;
                }
                onStatusChange("failed", undefined, blockNumber, errorMsg);
              } else {
                onStatusChange("finalized", batchTx.hash.toHex(), blockNumber);
                refreshBalance(address, api);
              }
              unsub();
              api.disconnect();
            })
            .catch((err) => {
              const errStr = err instanceof Error ? err.message : String(err);
              onStatusChange("failed", undefined, undefined, errStr);
              unsub();
              api.disconnect();
            });
        }
      });
    } catch (err) {
      const errStr = err instanceof Error ? err.message : String(err);
      onStatusChange("failed", undefined, undefined, errStr);
    }
  };

  // ── Staking ──────────────────────────────────────────────────

  const executeStake = async (
    amountPot: number,
    _validator: string | undefined,
    onStatusChange: (status: string, txHash?: string, blockNumber?: number, error?: string) => void
  ) => {
    // Demo mode
    onStatusChange("pending");
    await new Promise((r) => setTimeout(r, 800));
    onStatusChange("submitted", "0xdemo_stake_" + Math.random().toString(36).substring(2, 10));
    await new Promise((r) => setTimeout(r, 1200));
    const mockBlock = Math.floor(100000 + Math.random() * 900000);
    onStatusChange("finalized", "0xdemo_stake_finalized", mockBlock);

    setBalance((prev) => {
      const cost = potToPlanck(amountPot) + potToPlanck(0.001);
      return prev >= cost ? prev - cost : 0n;
    });
  };

  const executeUnstake = async (
    amountPot: number,
    onStatusChange: (status: string, txHash?: string, blockNumber?: number, error?: string) => void
  ) => {
    // Demo mode
    onStatusChange("pending");
    await new Promise((r) => setTimeout(r, 800));
    onStatusChange("submitted", "0xdemo_unstake_" + Math.random().toString(36).substring(2, 10));
    await new Promise((r) => setTimeout(r, 1200));
    const mockBlock = Math.floor(100000 + Math.random() * 900000);
    onStatusChange("finalized", "0xdemo_unstake_finalized", mockBlock);

    // Unstaking doesn't immediately return funds
    void amountPot;
  };

  const executeSetIdentity = async (
    _displayName: string,
    onStatusChange: (status: string, txHash?: string, blockNumber?: number, error?: string) => void
  ) => {
    // Demo mode
    onStatusChange("pending");
    await new Promise((r) => setTimeout(r, 800));
    onStatusChange("submitted", "0xdemo_identity_" + Math.random().toString(36).substring(2, 10));
    await new Promise((r) => setTimeout(r, 1200));
    const mockBlock = Math.floor(100000 + Math.random() * 900000);
    onStatusChange("finalized", "0xdemo_identity_finalized", mockBlock);
  };

  const queryStaking = async (): Promise<StakingInfo> => {
    // Demo mode mock data
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
    // Demo mode mock data
    const addr = targetAddress || address || "";
    return {
      display: addr === address ? "Potdo User" : "Alice",
      web: "https://portaldot.io",
      email: "user@portaldot.io",
      isVerified: true,
      address: addr,
    };
  };

  const queryVesting = async (): Promise<VestingSchedule> => {
    // Demo mode mock data
    return {
      locked: planckToPot(200000000000000000n),
      perPeriod: planckToPot(10000000000000000n),
      startingBlock: 100000,
      periodCount: 20,
      alreadyVested: planckToPot(60000000000000000n),
    };
  };

  const estimateFee = async (_command: string): Promise<FeeEstimate> => {
    // Demo mode mock data
    void _command;
    return {
      partialFee: "0.0012",
      weight: "186,423,000",
      class: "Normal",
    };
  };

  const queryChainInfo = async (): Promise<ChainInfo> => {
    // Demo mode mock data
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
