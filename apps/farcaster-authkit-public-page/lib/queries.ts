import { useEffect, useState } from 'react';
import { TipEnginePublicDisplayParams } from '@repo/database';
import dotenv from 'dotenv'
dotenv.config()

export const addWalletHeaders = (walletAddress: string) => {
  return {
    "X-Wallet-Address": walletAddress,
    "X-Wallet-Signature": localStorage.getItem("X-Wallet-Signature") || ""
  }
}

export const usePublicTipEngine = (slug: string | undefined, walletAddress: string | undefined, farcasterId: number | undefined): {
  dailyAllowance: number,
  allowanceRemaining: number,
  totalPointsSentToday: number,
  totalPointsReceivedForAirdrop: number,
  tipEngine: TipEnginePublicDisplayParams | undefined
} => {
  const [dailyAllowance, setDailyAllowance] = useState(0)
  const [allowanceRemaining, setAllowanceRemaining] = useState(0)
  const [totalPointsSentToday, setTotalPointsSentToday] = useState(0)
  const [totalPointsReceivedForAirdrop, setTotalPointsReceivedForAirdrop] = useState(0)
  const [tipEngine, setTipEngine] = useState<TipEnginePublicDisplayParams>()

  useEffect(() => {
    if (slug == undefined || !walletAddress) return;

    const fetchApi = async () => {
      const options = {method: 'GET', headers: {
        "Content-Type": "application/json",
        ...addWalletHeaders(walletAddress)
      }};
      fetch(`${process.env.NEXT_PUBLIC_WORKER_PAYFLUENCE}/public/slug/${slug}/profile/${farcasterId}`, options).then(response => response.json()).then(
        jsonData => {
          console.log(jsonData.data);

          setDailyAllowance(jsonData.data.dailyAllowance)
          setAllowanceRemaining(jsonData.data.allowanceRemaining)
          setTotalPointsSentToday(jsonData.data.amountLeft)
          setTotalPointsReceivedForAirdrop(jsonData.data.totalPointsReceivedForAirdrop)
          setTipEngine(jsonData.data.tipEngine)
        });
    }

    fetchApi()
  }, [slug, walletAddress, farcasterId])

  return { dailyAllowance, allowanceRemaining, totalPointsSentToday, tipEngine, totalPointsReceivedForAirdrop };
}

export const useRequestAirdropSignature = (walletAddress: string | undefined, farcasterId: number | undefined, airdropId: string | undefined): {
  requestSignature: () => Promise<{ signature: string, message: any }>
} => {
  const requestSignature = async () => {
    if (!walletAddress || !farcasterId || !airdropId) return { signature: "", message: null };

    const options = {method: 'POST', headers: {
      "Content-Type": "application/json",
      ...addWalletHeaders(walletAddress)
    }};
    const response = await fetch(`${process.env.NEXT_PUBLIC_WORKER_PAYFLUENCE}/public/airdrop/${airdropId}/signature/${farcasterId}`, options);
    const data = await response.json();
    console.log(data)
    return { signature: data.data.signature, message: data.data.message }
  }

  return { requestSignature }
}

