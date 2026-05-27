"use client";

import React, { createContext, useContext, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ConnectWalletModal } from "@/components/ConnectWalletModal";
import { PORTALDOT_RPC, TESTNET_ADDRESS_BOOK, DEMO_ADDRESS_BOOK } from "@/lib/constants";
import { potToPlanck, planckToPot } from "@/lib/format";
import type { StakingInfo, OnChainIdentity, VestingSchedule, FeeEstimate, ChainInfo } from "@/lib/types";
import { potdoClient } from "@/lib/api-client";

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
  isBalanceLoading: boolean;
  extensionInstalled: boolean;
  accounts: InjectedAccount[];
  isProxyActive: boolean;
  proxyType: string;
  agentAddress: string | null;
  checkingProxy: boolean;
  chainName: string;
  targetChainName: string;
  rpcEndpoint: string;
  showConnectModal: boolean;
  setShowConnectModal: (show: boolean) => void;
  connect: (useDemo?: boolean) => Promise<void>;
  connectExtension: () => Promise<void>;
  connectDemo: () => Promise<void>;
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

const generateMockTxHash = (prefix: string): string => {
  return `0xdemo_${prefix}_${Math.random().toString(36).substring(2, 10)}`;
};

const generateMockBlock = (): number => {
  return Math.floor(100000 + Math.random() * 900000);
};

export const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint>(0n);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
  const [chainName, setChainName] = useState<string>("Demo Network");
  const [targetChainName, setTargetChainName] = useState<string>("Portaldot Network");
  const [rpcEndpoint, setRpcEndpoint] = useState<string>(PORTALDOT_RPC);
  const [showConnectModal, setShowConnectModal] = useState(false);
  
  const [isProxyActive, setIsProxyActive] = useState(false);
  const [proxyType, setProxyType] = useState("Any");
  const [agentAddress, setAgentAddress] = useState<string | null>(null);
  const [checkingProxy, setCheckingProxy] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);



  const [mockBalances, setMockBalances] = useState<Record<string, bigint>>({
    // Testnet default dev accounts
    "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY": 100000000000000000n, // Alice: 1000 POT
    "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty": 50000000000000000n,  // Bob: 500 POT
    "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y": 1500000000000000n,   // Charlie: 15 POT
    "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYUM3aUNew": 7500000000000000n,    // Dave: 75 POT
    // Demo accounts
    "5DRcc5Jf3rvuLQHEbuvDZtXMfmS9WS3NETFP2h1W8r2j1KUm": 100000000000000000n, // Alpha: 1000 POT
    "5FBjUb4p6yzvcWsCDHxoeeppJjJ7vZW675sPgrNFK3acMQ5o": 50000000000000000n,  // Beta: 500 POT
    "5E1oSt5YAdzq6RdEHt1UyMFcLqQVQMq9TiF3TAfxDvsDjp3P": 1500000000000000n,   // Gamma: 15 POT
    "5CfPKgVHzzi7thpNYf5kKRDQ676mVmsYtAQsTWaRqoaX4eQX": 7500000000000000n,    // Delta: 75 POT
  });

  const [mockStaking, setMockStaking] = useState<Record<string, { bonded: bigint; active: bigint; unlocking: bigint }>>({
    // Testnet default dev accounts
    "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY": {
      bonded: 50000000000000000n,
      active: 45000000000000000n,
      unlocking: 5000000000000000n,
    },
    "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty": {
      bonded: 20000000000000000n,
      active: 20000000000000000n,
      unlocking: 0n,
    },
    // Demo accounts
    "5DRcc5Jf3rvuLQHEbuvDZtXMfmS9WS3NETFP2h1W8r2j1KUm": {
      bonded: 50000000000000000n,
      active: 45000000000000000n,
      unlocking: 5000000000000000n,
    },
    "5FBjUb4p6yzvcWsCDHxoeeppJjJ7vZW675sPgrNFK3acMQ5o": {
      bonded: 20000000000000000n,
      active: 20000000000000000n,
      unlocking: 0n,
    },
  });

  // Check if extension is installed (mocked/simulated)
  const extensionInstalled = typeof window !== "undefined" && !!(window as unknown as { injectedWeb3?: unknown }).injectedWeb3;

  React.useEffect(() => {
    potdoClient.setDemoMode(isDemoMode);
  }, [isDemoMode]);

  const checkProxyStatus = async (addr?: string) => {
    const targetAddr = addr || address;
    if (!targetAddr) return;
    setCheckingProxy(true);
    
    const data = await potdoClient.getProxyStatus(targetAddr);
    if (data) {
      setIsProxyActive(data.isProxyActive);
      setProxyType(data.proxyType);
      setAgentAddress(data.delegate);
      setCheckingProxy(false);
      return;
    }
    // Fallback/Demo mode
    const isAliceOrAlpha = targetAddr === "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" || targetAddr === "5DRcc5Jf3rvuLQHEbuvDZtXMfmS9WS3NETFP2h1W8r2j1KUm";
    setIsProxyActive(isAliceOrAlpha);
    setProxyType("Any");
    setAgentAddress(targetAddr === "5DRcc5Jf3rvuLQHEbuvDZtXMfmS9WS3NETFP2h1W8r2j1KUm" ? "5FBjUb4p6yzvcWsCDHxoeeppJjJ7vZW675sPgrNFK3acMQ5o" : "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty");
    setCheckingProxy(false);
  };

  const refreshBalance = async (addr: string) => {
    setIsBalanceLoading(true);
    const data = await potdoClient.getBalance(addr);
    if (data) {
      setBalance(BigInt(data.balancePlanck));
      setIsBalanceLoading(false);
      return;
    }

    setBalance(mockBalances[addr] || 100000000000000000n);
    setIsBalanceLoading(false);
  };

  const connectExtension = async () => {
    if (connected) return;
    setConnecting(true);
    try {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      if (typeof window !== "undefined" && (window as any).injectedWeb3) {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const injectedWeb3 = (window as any).injectedWeb3;
        const extensionNames = Object.keys(injectedWeb3);
        if (extensionNames.length > 0) {
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
            setShowConnectModal(false);
            await refreshBalance(formattedAccounts[0].address);
            await checkProxyStatus(formattedAccounts[0].address);
            await fetchOnChainIdentities(formattedAccounts);
            return;
          }
        }
      }
      throw new Error("No Substrate extension accounts found");
    } catch (err) {
      console.warn("Substrate extension connection failed, falling back to simulated testnet dev accounts:", err);
      
      const isTestnet =
        rpcEndpoint.includes("127.0.0.1") ||
        rpcEndpoint.includes("localhost") ||
        rpcEndpoint.includes("testnet") ||
        rpcEndpoint.includes("dev") ||
        targetChainName.toLowerCase().includes("testnet") ||
        targetChainName.toLowerCase().includes("dev") ||
        targetChainName.toLowerCase().includes("local");

      if (isTestnet) {
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
        setBalance(mockBalances[formattedAccounts[0].address] || 100000000000000000n);
        setIsDemoMode(false);
        setConnected(true);
        setConnecting(false);
        setShowConnectModal(false);
        await refreshBalance(formattedAccounts[0].address);
        await checkProxyStatus(formattedAccounts[0].address);
        await fetchOnChainIdentities(formattedAccounts);
      } else {
        await connectDemo();
      }
    }
  };

  const connectDemo = async () => {
    setConnecting(true);
    await new Promise((r) => setTimeout(r, 600));

    const formattedAccounts: InjectedAccount[] = [
      {
        address: "5DRcc5Jf3rvuLQHEbuvDZtXMfmS9WS3NETFP2h1W8r2j1KUm",
        meta: { name: "Alpha", source: "portaldotjs" },
      },
      {
        address: "5FBjUb4p6yzvcWsCDHxoeeppJjJ7vZW675sPgrNFK3acMQ5o",
        meta: { name: "Beta", source: "portaldotjs" },
      },
      {
        address: "5E1oSt5YAdzq6RdEHt1UyMFcLqQVQMq9TiF3TAfxDvsDjp3P",
        meta: { name: "Gamma", source: "portaldotjs" },
      },
      {
        address: "5CfPKgVHzzi7thpNYf5kKRDQ676mVmsYtAQsTWaRqoaX4eQX",
        meta: { name: "Delta", source: "portaldotjs" },
      },
    ];

    setAccounts(formattedAccounts);
    setAddress(formattedAccounts[0].address);
    setBalance(mockBalances[formattedAccounts[0].address] || 100000000000000000n);
    setIsDemoMode(true);
    setConnected(true);
    setConnecting(false);
    setShowConnectModal(false);
    await checkProxyStatus(formattedAccounts[0].address);
    await fetchOnChainIdentities(formattedAccounts);
  };

  const connect = async (useDemo = false) => {
    if (connected || connecting) return;
    if (useDemo) {
      await connectDemo();
    } else {
      setShowConnectModal(true);
    }
  };

  const disconnect = () => {
    setConnected(false);
    setAddress(null);
    setBalance(0n);
    setIsDemoMode(true);
    setAccounts([]);
    setIsProxyActive(false);
    setProxyType("Any");
    setIsBalanceLoading(false);
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
    
    try {
      const data = await potdoClient.addProxy(address || "", delegate, pType);
      if (data) {
        statusCallback("submitted", data.txHash);
        statusCallback("finalized", data.txHash, data.blockNumber);
        await checkProxyStatus();
        return;
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to add proxy";
      statusCallback("failed", undefined, undefined, errMsg);
      return;
    }
    // Fallback/Simulated
    await new Promise((r) => setTimeout(r, 800));
    const txHash = generateMockTxHash("add_proxy");
    statusCallback("submitted", txHash);
    await new Promise((r) => setTimeout(r, 1200));
    const mockBlock = 142857;
    statusCallback("finalized", txHash, mockBlock);
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
    
    try {
      const data = await potdoClient.removeProxy(address || "", delegate, pType);
      if (data) {
        statusCallback("submitted", data.txHash);
        statusCallback("finalized", data.txHash, data.blockNumber);
        await checkProxyStatus();
        return;
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to remove proxy";
      statusCallback("failed", undefined, undefined, errMsg);
      return;
    }
    // Fallback/Simulated
    await new Promise((r) => setTimeout(r, 800));
    const txHash = generateMockTxHash("remove_proxy");
    statusCallback("submitted", txHash);
    await new Promise((r) => setTimeout(r, 1200));
    const mockBlock = 142857;
    statusCallback("finalized", txHash, mockBlock);
    setIsProxyActive(false);
  };

  const signAndSubmit = async (
    prepareEndpoint: string,
    submitEndpoint: string,
    prepareBody: Record<string, unknown>,
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
        const payload = await potdoClient.prepareTx(prepareEndpoint, address || "", prepareBody);
        if (!payload) {
          throw new Error(`Failed to prepare transaction`);
        }
        
        // 2. Request signature from the wallet extension
        const signResult = await signer.signPayload(payload);
        const signature = signResult.signature;
        
        // 3. Submit transaction with the signature
        const submitRes = await potdoClient.submitTx(submitEndpoint, address || "", signature, prepareBody);
        if (!submitRes) {
          throw new Error(`Failed to submit signed transaction`);
        }
        const data = submitRes;
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
      try {
        const data = await potdoClient.executeTransfer(toAddress, amountPot, true, address || undefined);
        if (data) {
          onStatusChange("submitted", data.txHash);
          onStatusChange("finalized", data.txHash, data.blockNumber);
          await refreshBalance(address || "");
          return;
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Transaction failed";
        onStatusChange("failed", undefined, undefined, errMsg);
        return;
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

    try {
      const data = await potdoClient.executeTransfer(toAddress, amountPot, false, address || undefined);
      if (data) {
        onStatusChange("submitted", data.txHash);
        onStatusChange("finalized", data.txHash, data.blockNumber);
        await refreshBalance(address || "");
        return;
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Transaction failed";
      onStatusChange("failed", undefined, undefined, errMsg);
      return;
    }

    await new Promise((r) => setTimeout(r, 800));
    const txHash = generateMockTxHash("tx_hash");
    onStatusChange("submitted", txHash);
    await new Promise((r) => setTimeout(r, 1200));

    const mockBlock = generateMockBlock();
    onStatusChange("finalized", txHash, mockBlock);

    const amtPlanck = potToPlanck(amountPot);
    const gasPlanck = potToPlanck(0.0012);
    const totalCost = amtPlanck + gasPlanck;

    if (address) {
      setMockBalances((prev) => ({
        ...prev,
        [address]: prev[address] >= totalCost ? prev[address] - totalCost : 0n,
        ...(prev[toAddress] !== undefined ? {
          [toAddress]: prev[toAddress] + amtPlanck
        } : {})
      }));
    }

    setBalance((prev) => (prev >= totalCost ? prev - totalCost : 0n));
  };

  const executeBatch = async (
    transfers: Array<{ toAddress: string; amount: number }>,
    onStatusChange: (status: string, txHash?: string, blockNumber?: number, error?: string) => void
  ) => {
    const totalAmount = transfers.reduce((sum, t) => sum + t.amount, 0);
    onStatusChange("pending");

    if (isProxyActive) {
      try {
        const data = await potdoClient.executeBatch(transfers, true, address || undefined);
        if (data) {
          onStatusChange("submitted", data.txHash);
          onStatusChange("finalized", data.txHash, data.blockNumber);
          await refreshBalance(address || "");
          return;
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Batch failed";
        onStatusChange("failed", undefined, undefined, errMsg);
        return;
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

    try {
      const data = await potdoClient.executeBatch(transfers, false, address || undefined);
      if (data) {
        onStatusChange("submitted", data.txHash);
        onStatusChange("finalized", data.txHash, data.blockNumber);
        await refreshBalance(address || "");
        return;
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Batch failed";
      onStatusChange("failed", undefined, undefined, errMsg);
      return;
    }

    await new Promise((r) => setTimeout(r, 800));
    const txHash = generateMockTxHash("batch_hash");
    onStatusChange("submitted", txHash);
    await new Promise((r) => setTimeout(r, 1200));

    const mockBlock = generateMockBlock();
    onStatusChange("finalized", txHash, mockBlock);

    const totalAmtPlanck = potToPlanck(totalAmount);
    const gasPlanck = potToPlanck(0.0036);
    const totalCost = totalAmtPlanck + gasPlanck;

    if (address) {
      setMockBalances((prev) => {
        const nextBalances = { ...prev };
        nextBalances[address] = nextBalances[address] >= totalCost ? nextBalances[address] - totalCost : 0n;
        for (const t of transfers) {
          if (nextBalances[t.toAddress] !== undefined) {
            nextBalances[t.toAddress] += potToPlanck(t.amount);
          }
        }
        return nextBalances;
      });
    }

    setBalance((prev) => (prev >= totalCost ? prev - totalCost : 0n));
  };

  const executeStake = async (
    amountPot: number,
    validator: string | undefined,
    onStatusChange: (status: string, txHash?: string, blockNumber?: number, error?: string) => void
  ) => {
    onStatusChange("pending");

    if (isProxyActive) {
      try {
        const data = await potdoClient.executeStake(amountPot, validator, true, address || undefined);
        if (data) {
          onStatusChange("submitted", data.txHash);
          onStatusChange("finalized", data.txHash, data.blockNumber);
          await refreshBalance(address || "");
          return;
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Staking failed";
        onStatusChange("failed", undefined, undefined, errMsg);
        return;
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

    try {
      const data = await potdoClient.executeStake(amountPot, validator, false, address || undefined);
      if (data) {
        onStatusChange("submitted", data.txHash);
        onStatusChange("finalized", data.txHash, data.blockNumber);
        await refreshBalance(address || "");
        return;
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Staking failed";
      onStatusChange("failed", undefined, undefined, errMsg);
      return;
    }

    await new Promise((r) => setTimeout(r, 800));
    const txHash = generateMockTxHash("stake");
    onStatusChange("submitted", txHash);
    await new Promise((r) => setTimeout(r, 1200));
    const mockBlock = generateMockBlock();
    onStatusChange("finalized", txHash, mockBlock);

    const stakePlanck = potToPlanck(amountPot);
    const gasPlanck = potToPlanck(0.0012);
    const totalCost = stakePlanck + gasPlanck;

    if (address) {
      setMockBalances((prev) => ({
        ...prev,
        [address]: prev[address] >= totalCost ? prev[address] - totalCost : 0n
      }));
      setMockStaking((prev) => {
        const current = prev[address] || { bonded: 0n, active: 0n, unlocking: 0n };
        return {
          ...prev,
          [address]: {
            bonded: current.bonded + stakePlanck,
            active: current.active + stakePlanck,
            unlocking: current.unlocking
          }
        };
      });
    }

    setBalance((prev) => (prev >= totalCost ? prev - totalCost : 0n));
  };

  const executeUnstake = async (
    amountPot: number,
    onStatusChange: (status: string, txHash?: string, blockNumber?: number, error?: string) => void
  ) => {
    onStatusChange("pending");

    if (isProxyActive) {
      try {
        const data = await potdoClient.executeUnstake(amountPot, true, address || undefined);
        if (data) {
          onStatusChange("submitted", data.txHash);
          onStatusChange("finalized", data.txHash, data.blockNumber);
          await refreshBalance(address || "");
          return;
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Unstaking failed";
        onStatusChange("failed", undefined, undefined, errMsg);
        return;
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

    try {
      const data = await potdoClient.executeUnstake(amountPot, false, address || undefined);
      if (data) {
        onStatusChange("submitted", data.txHash);
        onStatusChange("finalized", data.txHash, data.blockNumber);
        await refreshBalance(address || "");
        return;
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unstaking failed";
      onStatusChange("failed", undefined, undefined, errMsg);
      return;
    }

    await new Promise((r) => setTimeout(r, 800));
    const txHash = generateMockTxHash("unstake");
    onStatusChange("submitted", txHash);
    await new Promise((r) => setTimeout(r, 1200));
    const mockBlock = generateMockBlock();
    onStatusChange("finalized", txHash, mockBlock);

    const unstakePlanck = potToPlanck(amountPot);
    const gasPlanck = potToPlanck(0.0012);

    if (address) {
      setMockBalances((prev) => ({
        ...prev,
        [address]: prev[address] >= gasPlanck ? prev[address] - gasPlanck : 0n
      }));
      setMockStaking((prev) => {
        const current = prev[address] || { bonded: 0n, active: 0n, unlocking: 0n };
        const toUnstake = current.active >= unstakePlanck ? unstakePlanck : current.active;
        return {
          ...prev,
          [address]: {
            bonded: current.bonded,
            active: current.active - toUnstake,
            unlocking: current.unlocking + toUnstake
          }
        };
      });
    }

    setBalance((prev) => (prev >= gasPlanck ? prev - gasPlanck : 0n));
  };

  const executeSetIdentity = async (
    displayName: string,
    onStatusChange: (status: string, txHash?: string, blockNumber?: number, error?: string) => void
  ) => {
    onStatusChange("pending");

    if (isProxyActive) {
      try {
        const data = await potdoClient.executeSetIdentity(displayName, true, address || undefined);
        if (data) {
          onStatusChange("submitted", data.txHash);
          onStatusChange("finalized", data.txHash, data.blockNumber);
          await refreshBalance(address || "");
          return;
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Identity setup failed";
        onStatusChange("failed", undefined, undefined, errMsg);
        return;
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

    try {
      const data = await potdoClient.executeSetIdentity(displayName, false, address || undefined);
      if (data) {
        onStatusChange("submitted", data.txHash);
        onStatusChange("finalized", data.txHash, data.blockNumber);
        await refreshBalance(address || "");
        return;
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Identity setup failed";
      onStatusChange("failed", undefined, undefined, errMsg);
      return;
    }

    await new Promise((r) => setTimeout(r, 800));
    const txHash = generateMockTxHash("identity");
    onStatusChange("submitted", txHash);
    await new Promise((r) => setTimeout(r, 1200));
    const mockBlock = generateMockBlock();
    onStatusChange("finalized", txHash, mockBlock);
  };

  const queryStaking = async (): Promise<StakingInfo> => {
    const data = await potdoClient.getStakingInfo(address || "");
    if (data) return data;

    const current = mockStaking[address || ""] || { bonded: 0n, active: 0n, unlocking: 0n };

    return {
      bonded: planckToPot(current.bonded),
      active: planckToPot(current.active),
      unlocking: planckToPot(current.unlocking),
      nominations: [
        "5GNJqTPyNqANBkUVMN1LPPrxXnFouWA2MR5A4H7vz6NM4Jk",
        "5HpG9w8EBLe5XCrbczpwq5TSXvedjrBGCwqxK1iQ7qUsSWFc",
      ],
      rewardDestination: "Staked",
    };
  };

  async function queryIdentity(targetAddress?: string): Promise<OnChainIdentity> {
    const target = targetAddress || address || "";
    if (!target) {
      return {
        display: "Not Connected",
        isVerified: false,
        address: "",
      };
    }

    const data = await potdoClient.getIdentity(target);
    if (data) return data;

    const testnetName = TESTNET_ADDRESS_BOOK[target];
    if (testnetName) {
      return {
        display: testnetName,
        web: "https://portaldot.io",
        email: `${testnetName.toLowerCase()}@portaldot.io`,
        isVerified: true,
        address: target,
      };
    }
    const demoName = DEMO_ADDRESS_BOOK[target];
    if (demoName) {
      return {
        display: demoName,
        web: "https://portaldot.io",
        email: `${demoName.toLowerCase()}@portaldot.io`,
        isVerified: true,
        address: target,
      };
    }

    return {
      display: target === address ? "Potdo User" : target.slice(0, 8) + "...",
      web: "https://portaldot.io",
      email: "user@portaldot.io",
      isVerified: true,
      address: target,
    };
  }

  async function fetchOnChainIdentities(accs: InjectedAccount[]) {
    try {
      const updated = await Promise.all(
        accs.map(async (acc) => {
          try {
            const identity = await queryIdentity(acc.address);
            if (
              identity &&
              identity.display &&
              identity.display !== "Not Connected" &&
              identity.display !== "Potdo User" &&
              !identity.display.includes("...")
            ) {
              return {
                ...acc,
                meta: {
                  ...acc.meta,
                  name: identity.display,
                },
              };
            }
          } catch (e) {
            console.warn("Failed to fetch on-chain identity for", acc.address, e);
          }
          return acc;
        })
      );
      setAccounts(updated);
    } catch (err) {
      console.warn("fetchOnChainIdentities failed:", err);
    }
  }

  const queryVesting = async (): Promise<VestingSchedule> => {
    const data = await potdoClient.getVesting(address || "");
    if (data) return data;

    return {
      locked: planckToPot(200000000000000000n),
      perPeriod: planckToPot(10000000000000000n),
      startingBlock: 100000,
      periodCount: 20,
      alreadyVested: planckToPot(60000000000000000n),
    };
  };

  const estimateFee = async (command: string): Promise<FeeEstimate> => {
    const data = await potdoClient.estimateFee(command);
    if (data) return data;

    return {
      partialFee: "0.0012",
      weight: "186,423,000",
      class: "Normal",
    };
  };

  const queryChainInfo = async (): Promise<ChainInfo> => {
    const data = await potdoClient.getChainInfo();
    if (data) return data;

    return {
      chainName: "Portaldot",
      blockNumber: 142857 + Math.floor(Math.random() * 1000),
      runtimeVersion: 100,
      peerCount: 24 + Math.floor(Math.random() * 10),
      isSyncing: false,
      nodeVersion: "1.0.0",
    };
  };

  React.useEffect(() => {
    let active = true;
    const updateChain = async () => {
      if (connected && !isDemoMode) {
        try {
          const info = await queryChainInfo();
          if (active) setChainName(info.chainName);
        } catch {
          if (active) setChainName("Portaldot Network");
        }
      } else {
        if (active) setChainName("Demo Network");
      }
    };
    updateChain();
    return () => {
      active = false;
    };
  }, [connected, isDemoMode]);

  React.useEffect(() => {
    let active = true;
    const fetchTarget = async () => {
      try {
        const info = await queryChainInfo();
        if (active) setTargetChainName(info.chainName);
      } catch {
        if (active) setTargetChainName("Portaldot Network");
      }
      
      try {
        const health = await potdoClient.checkHealth();
        if (health && health.rpc_endpoint && active) {
          setRpcEndpoint(health.rpc_endpoint);
        }
      } catch (err) {
        console.warn("Failed to fetch backend health/RPC:", err);
      }
    };
    fetchTarget();
    return () => {
      active = false;
    };
  }, []);

  return (
    <WalletContext.Provider
      value={{
        connected,
        address,
        balance,
        isDemoMode,
        connecting,
        isBalanceLoading,
        extensionInstalled,
        accounts,
        isProxyActive,
        proxyType,
        agentAddress,
        checkingProxy,
        chainName,
        targetChainName,
        rpcEndpoint,
        showConnectModal,
        setShowConnectModal,
        connect,
        connectExtension,
        connectDemo,
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
      <AnimatePresence>
        {showConnectModal && <ConnectWalletModal />}
      </AnimatePresence>
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
