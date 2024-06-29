import React, { createContext, useContext, useEffect, useState } from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { injected, signMessage } from '@wagmi/core';
import { walletConnect } from '@wagmi/connectors';
import dotenv from 'dotenv';
import { wagmiConfig } from '@/config/web3';
import { SignableMessage } from 'viem';
import { CreateTipEngine, TipEngineDisplayParams } from '@repo/database/types';
import { addWalletHeaders } from '../lib/queries';
dotenv.config();
 

// Define the context
interface TipEngineContextProps {
  tipEngines: TipEngineDisplayParams[];
  createTipEngine: (tipEngine: CreateTipEngine, published: boolean) => Promise<{ tipEngineId: string, published: boolean }>
  addFunds: (tipEngineId: string, amount: number) => Promise<boolean>
  withdrawFunds: (tipEngineId: string, amount: number) => Promise<boolean>
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
      fetch(`${process.env.NEXT_PUBLIC_WORKER_PAYFLUENCE}/auth/tipengine/all`, options).then(response => response.json()).then(jsonData => {
        console.log(jsonData);
        // convert dates from string to date objects
        jsonData.data.tipEngines.forEach((tipEngine: any) => {
          tipEngine.airdrops.forEach((airdrop: any) => {
            airdrop.startDate = new Date(airdrop.startDate);
            airdrop.claimStartDate = new Date(airdrop.claimStartDate);
            airdrop.claimEndDate = new Date(airdrop.claimEndDate);
          });
        });
        
        setTipEngines(jsonData.data.tipEngines)
      });
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

  const addFunds = async (tipEngineId: string, amount: number): Promise<boolean> => {
    return true
  }

  const withdrawFunds = async (tipEngineId: string, amount: number): Promise<boolean> => {
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