import React, { createContext, useContext, useEffect, useState } from 'react';
import { Config } from '@wagmi/core';
import dotenv from 'dotenv';
import { CHAINS, CHAIN_ID_TO_WAGMI_CHAIN_ID, publicClientBaseMainnet, publicClientBaseSepolia } from '@/config/web3';
import { getAddress } from 'viem';
import { CreateTipEngine, OmittedAirdrop, TipEngineDisplayParams } from '@repo/database/types';
import { addWalletHeaders } from '../lib/queries';
import { ERC20__factory, Payfluence__factory } from '@repo/contracts';
import { SendTransactionMutate } from 'wagmi/query';

dotenv.config();
 

// Define the context
interface TipEngineContextProps {
  tipEngines: TipEngineDisplayParams[];
  createTipEngine: (tipEngine: CreateTipEngine, published: boolean) => Promise<{ tipEngineId: string, published: boolean }>
  addFunds: (sendTransaction: SendTransactionMutate<Config, unknown>, connectedWallet: string, tipEngineId: string, amount: bigint) => Promise<boolean>
  withdrawFunds: (sendTransaction: SendTransactionMutate<Config, unknown>, connectedWallet: string, tipEngineId: string, amount: bigint) => Promise<boolean>
  setPublished: (tipEngineId: string, published: boolean) => Promise<boolean>
}

const TipEngineContext = createContext<TipEngineContextProps | undefined>(undefined);

interface TipEngineContextProviderProps {
  authToken: string | undefined;
  children: React.ReactNode;
}

// Define the TipEngine provider component
const TipEngineContextProvider = ({ children, authToken }: TipEngineContextProviderProps) => {
  const [tipEngines, setTipEngines] = useState<TipEngineDisplayParams[]>([]);

  useEffect(() => {
    const fetchApi = async () => {
      const options = {method: 'GET', headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }};
      const response = await fetch(`${process.env.NEXT_PUBLIC_WORKER_PAYFLUENCE}/auth/tipengine/all`, options);
      const jsonData = await response.json();

      console.log(jsonData);
      // convert dates from string to date objects
      for (let i = 0; i < jsonData.data.tipEngines.length; i++) {
        const tipEngine: TipEngineDisplayParams = jsonData.data.tipEngines[i];

        try {
          const publicClient = tipEngine.chainId === 84532 ? publicClientBaseSepolia : publicClientBaseMainnet;

          const payfluenceBalance = await publicClient.readContract({
            address: CHAINS[tipEngine.chainId].payfluenceContract,
            abi: Payfluence__factory.abi,
            functionName: 'getBalance',
            args: [tipEngine.id, getAddress(tipEngine.tokenContract)]
          })

          console.log("payfluenceBalance", payfluenceBalance);

          jsonData.data.tipEngines[i].tokenBalance = payfluenceBalance;
        } catch (e: any) {
          console.error("Error getting payfluence balance", e.message)
        }

        tipEngine.airdrops.forEach((airdrop: OmittedAirdrop) => {
          airdrop.startDate = new Date(airdrop.startDate);
          airdrop.claimStartDate = new Date(airdrop.claimStartDate);
          airdrop.claimEndDate = airdrop.claimEndDate && new Date(airdrop.claimEndDate);
        });
      }
      
      setTipEngines(jsonData.data.tipEngines);
    }

    fetchApi()
  }, [authToken]);

  const createTipEngine = async (createParams: CreateTipEngine, published: boolean): Promise<{ tipEngineId: string, published: boolean }> => {
    const options = {method: 'POST', headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${authToken}`,
      ...addWalletHeaders(createParams.tipEngine.ownerAddress)
    }, body: JSON.stringify({ ...createParams })};
    const response = await fetch(`${process.env.NEXT_PUBLIC_WORKER_PAYFLUENCE}/auth/tipengine/create?publish=${published === true ? "true" : "false"}`, options)
    const jsonData = await response.json()

    // TODO: get tip engine in result and add to tipEngines

    return { tipEngineId: jsonData.data.tipEngineId, published: jsonData.data.published };
  }

  const addFunds = async (sendTransaction: SendTransactionMutate<Config, unknown>, connectedWallet: string, tipEngineId: string, amount: bigint): Promise<boolean> => {
    const tipEngine = tipEngines.find((tipEngine) => tipEngine.id === tipEngineId);
    if (!tipEngine) {
      throw new Error('Tip engine not found');
    }

    amount = amount * BigInt(10 ** tipEngine.tokenDecimals)

    // const publicClient = tipEngine.chainId === 84532 ? publicClientBaseSepolia : publicClientBaseMainnet;

    // console.log("connectedWallet", connectedWallet)
    // console.log("tipEngine", tipEngine);
    // console.log("tipEngine.chainId", tipEngine.chainId);
    // console.log("tipEngine.tokenContract", tipEngine.tokenContract);
    // console.log("tipEngine.ownerAddress", tipEngine.ownerAddress);
    // console.log("CHAINS[tipEngine.chainId].payfluenceContract", CHAINS[tipEngine.chainId].payfluenceContract);
    sendTransaction({
      chainId: CHAIN_ID_TO_WAGMI_CHAIN_ID[tipEngine.chainId],
      to: getAddress(tipEngine.tokenContract),
      data: ERC20__factory.createInterface().encodeFunctionData('approve', [CHAINS[tipEngine.chainId].payfluenceContract, amount]) as `0x${string}`,
    })

    sendTransaction({
      chainId: CHAIN_ID_TO_WAGMI_CHAIN_ID[tipEngine.chainId],
      to: CHAINS[tipEngine.chainId].payfluenceContract,
      data: Payfluence__factory.createInterface().encodeFunctionData('fundERC20', [tipEngine.id, getAddress(connectedWallet), getAddress(tipEngine.tokenContract), amount]) as `0x${string}`,
    })

    return true
  }

  const withdrawFunds = async (sendTransaction: SendTransactionMutate<Config, unknown>, connectedWallet: string, tipEngineId: string, amount: bigint): Promise<boolean> => {
    const tipEngine = tipEngines.find((tipEngine) => tipEngine.id === tipEngineId);
    if (!tipEngine) {
      throw new Error('Tip engine not found');
    }

    amount = amount * BigInt(10 ** tipEngine.tokenDecimals)

    sendTransaction({
      chainId: CHAIN_ID_TO_WAGMI_CHAIN_ID[tipEngine.chainId],
      to: CHAINS[tipEngine.chainId].payfluenceContract,
      data: Payfluence__factory.createInterface().encodeFunctionData('withdrawERC20', [tipEngine.id, getAddress(connectedWallet), getAddress(tipEngine.tokenContract), amount]) as `0x${string}`,
    })

    return true
  }

  const setPublished = async (tipEngineId: string, published: boolean): Promise<boolean> => {
    const options = {method: 'POST', headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${authToken}`
    }, body: JSON.stringify({})};
    const response = await fetch(`${process.env.NEXT_PUBLIC_WORKER_PAYFLUENCE}/auth/tipengine/setpublish/:${tipEngineId}/${published}`, options)
    const jsonData = await response.json()

    return jsonData.data.published;
  }

  return (
    <TipEngineContext.Provider value={{ tipEngines, createTipEngine, addFunds, withdrawFunds, setPublished }}>
      {children}
    </TipEngineContext.Provider>
  );
};

// Custom hook to access the WalletContext
const useTipEngineContext = () => {
  const context = useContext(TipEngineContext);
  if (!context) {
    throw new Error('useTipEngineContext must be used within a TipEngineContextProvider');
  }
  return context;
};

export { TipEngineContextProvider, useTipEngineContext };