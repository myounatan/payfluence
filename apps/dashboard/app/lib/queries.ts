import { BreadcrumbLinks } from '@/components/Breadcrumbs';
import { CHAIN_NAMES, CreateTipEngine, MORALIS_CHAIN_NAMES, OmittedAirdrop, TipEngine, TipEngineDisplayParams, User } from '@repo/database/types'
import dotenv from 'dotenv'
import { useEffect, useState } from 'react';
dotenv.config()

export const addWalletHeaders = (walletAddress: string) => {
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

// export const useTipEngine = (authToken: string | undefined): {
//   tipEngines: TipEngineDisplayParams[],
//   createTipEngine: (tipEngine: CreateTipEngine, published: boolean) => Promise<{ tipEngineId: string, published: boolean }>,
//   addFunds: (tipEngineId: string, amount: number) => Promise<boolean>,
//   withdrawFunds: (tipEngineId: string, amount: number) => Promise<boolean>,
//   setPublished: (tipEngineId: string, published: boolean) => Promise<boolean>
// } => {
//   const [tipEngines, setTipEngines] = useState<TipEngineDisplayParams[]>([]);

//   useEffect(() => {
//     const fetchApi = async () => {
//       const options = {method: 'GET', headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${authToken}`
//       }};
//       fetch(`${process.env.NEXT_PUBLIC_WORKER_PAYFLUENCE}/auth/tipengine/all`, options).then(response => response.json()).then(jsonData => {
//         console.log(jsonData);
//         // convert dates from string to date objects
//         jsonData.data.tipEngines.forEach((tipEngine: any) => {
//           tipEngine.airdrops.forEach((airdrop: any) => {
//             airdrop.startDate = new Date(airdrop.startDate);
//             airdrop.claimStartDate = new Date(airdrop.claimStartDate);
//             airdrop.claimEndDate = new Date(airdrop.claimEndDate);
//           });
//         });
        
//         setTipEngines(jsonData.data.tipEngines)
//       });
//     }

//     fetchApi()
//   }, [authToken]);

//   const createTipEngine = async (createParams: CreateTipEngine, published: boolean): Promise<{ tipEngineId: string, published: boolean }> => {
//     const options = {method: 'POST', headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer ${authToken}`,
//       ...addWalletHeaders(createParams.tipEngine.ownerAddress)
//     }, body: JSON.stringify({ ...createParams })};
//     const response = await fetch(`${process.env.NEXT_PUBLIC_WORKER_PAYFLUENCE}/auth/tipengine/create?publish=${published === true ? "true" : "false"}`, options)
//     const jsonData = await response.json()

//     // TODO: get tip engine in result and add to tipEngines

//     return { tipEngineId: jsonData.data.tipEngineId, published: jsonData.data.published };
//   }

//   const addFunds = async (tipEngineId: string, amount: number): Promise<boolean> => {
//     return true
//   }

//   const withdrawFunds = async (tipEngineId: string, amount: number): Promise<boolean> => {
//     return true
//   }

//   const setPublished = async (tipEngineId: string, published: boolean): Promise<boolean> => {
//     const options = {method: 'POST', headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer ${authToken}`
//     }, body: JSON.stringify({})};
//     const response = await fetch(`${process.env.NEXT_PUBLIC_WORKER_PAYFLUENCE}/auth/tipengine/setpublish/:${tipEngineId}/${published}`, options)
//     const jsonData = await response.json()

//     return jsonData.data.published;
//   }

//   return { tipEngines, createTipEngine, addFunds, withdrawFunds, setPublished };
// }

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
        jsonData => {
          console.log(jsonData.data);
          // sort alphabetically
          jsonData.data.sort((a: any, b: any) => a.name.localeCompare(b.name));
          return setOwnedTokens(jsonData.data)
        });
    }

    fetchApi()
  }, [authToken, address, chainId]);

  return { ownedTokens };
}
