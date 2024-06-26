import { BreadcrumbLinks } from '@/components/Breadcrumbs';
import { CHAIN_NAMES, MORALIS_CHAIN_NAMES, User } from '@repo/database/types'
import dotenv from 'dotenv'
import { useEffect, useState } from 'react';
dotenv.config()

const addWalletHeaders = (walletAddress: string) => {
  return {
    "X-Wallet-Address": walletAddress,
    "X-Wallet-Signature": localStorage.getItem("X-Wallet-Signature") || ""
  }
}

export const useLocalUser = (authToken: string | undefined): { localUser: User | undefined } => {
  const [localUser, setLocalUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    const fetchApi = async () => {
      console.log("authToken", authToken)
      const options = {method: 'GET', headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }};
      fetch(`${process.env.NEXT_PUBLIC_WORKER_PAYFLUENCE}/auth/user/local`, options).then(response => response.json()).then(
        jsonData => { return setLocalUser(jsonData.data.user) });
    }

    fetchApi()
  }, [authToken]);

  return { localUser };
};

export const useAvailableTipEngine = (authToken: string | undefined): { checkAvailability: (slug: string, tipstring: string) => Promise<{ slugAvailable: boolean, tipStringAvailable: boolean }> } => {
  const checkAvailability = async (slug: string, tipstring: string): Promise<{ slugAvailable: boolean, tipStringAvailable: boolean }> => {
    const options = {method: 'GET', headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${authToken}`
    }};
    const response = await fetch(`${process.env.NEXT_PUBLIC_WORKER_PAYFLUENCE}/auth/tipengine/available?slug=${slug}&tipstring=${tipstring}`, options)
    const jsonData = await response.json()

    console.log(jsonData)
    
    return { slugAvailable: jsonData.data.availableSlug, tipStringAvailable: jsonData.data.availableTipString };
  }

  return { checkAvailability };
}

export const useOwnedTokens = (
  authToken: string | undefined,
  address: string | undefined,
  chainId: number | undefined
): { ownedTokens: any[] } => {
  const [ownedTokens, setOwnedTokens] = useState<any[]>([]);

  useEffect(() => {
    if (!authToken || !address || !chainId) return;

    const fetchApi = async () => {
      const options = {method: 'GET', headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
        ...addWalletHeaders(address)
      }};
      fetch(`${process.env.NEXT_PUBLIC_WORKER_PAYFLUENCE}/auth/web3/erc20/${address}/${MORALIS_CHAIN_NAMES[chainId]}`, options).then(response => response.json()).then(
        jsonData => { console.log(jsonData.data); return setOwnedTokens(jsonData.data) });
    }

    fetchApi()
  }, [authToken, address, chainId]);

  return { ownedTokens };
}
