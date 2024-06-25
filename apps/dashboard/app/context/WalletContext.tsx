import React, { createContext, useContext } from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { injected } from '@wagmi/core';
import { walletConnect } from '@wagmi/connectors';
import dotenv from 'dotenv';
dotenv.config();
 
export type WalletType = "metamask" | "walletConnect";

export type ConnectionStatus = "connected" | "disconnected" | "connecting";

// Define the context
interface WalletContextProps {
  connectWallet: (walletType: WalletType) => void;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined);

interface WalletContextProviderProps {
  children: React.ReactNode;
}

// Define the WalletContext provider component
const WalletContextProvider = ({ children }: WalletContextProviderProps) => {
  const { connect } = useConnect()
  const { address, isConnected, chainId } = useAccount()
  const { disconnect } = useDisconnect()

  const connectWallet = async (walletType: WalletType) => {
    try {

      if (walletType == "metamask") {
        await connect({ connector: injected() })
      } else if (walletType == "walletConnect") {
        await connect({ connector: walletConnect({ projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "", showQrModal: true }) })
      } else {
        throw new Error("Invalid wallet type");
      }


    } catch (e) {

      console.error("failed to connect", e);

      // show error UI or close modal using props.close()
    }
  };

  const disconnectWallet = () => {
    disconnect();
  };

  

  return (
    <WalletContext.Provider value={{ connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to access the WalletContext
const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletContextProvider');
  }
  return context;
};

export { WalletContextProvider, useWalletContext };