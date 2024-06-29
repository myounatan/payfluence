import { http, createConfig } from '@wagmi/core'
import { base, baseSepolia } from '@wagmi/core/chains'
import { injected, safe, walletConnect } from 'wagmi/connectors'
import { createPublicClient, getAddress } from 'viem'
import dotenv from 'dotenv';
dotenv.config();

export interface Chain {
  name: string;
  explorerURL: string;
  payfluenceContract: `0x${string}`;
}
export type Chains = typeof CHAINS
export const CHAINS: Record<number, Chain> = {
  84532: {
    name: "Base Sepolia",
    explorerURL: "https://sepolia.basescan.org/",
    payfluenceContract: getAddress("0x26213D9c9C889F5902cA43913cB73186A47B6Ed6")
  },
  // 8453: {
  //   name: "Base Mainnet",
  //   explorerURL: "https://basescan.org/",
  //   payfluenceContract: process.env.PAYFLUENCE_CONTRACT_BASE_MAINNET as `0x${string}`
  // }
}

export const CHAIN_ID_TO_WAGMI_CHAIN_ID: Record<number, any> = {
  84532: baseSepolia.id,
  8453: base.id,
}

export const publicClientBaseSepolia = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA)
})

export const publicClientBaseMainnet = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_ALCHEMY_BASE)
})

const projectId = '536c6c7c2d6f08362615d300072646aa'

export const wagmiConfig = createConfig({
  chains: [baseSepolia, base],
  connectors: [
    injected(),
    walletConnect({ projectId }),
    safe(),
  ],
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA),
    [base.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_BASE_MAINNET),
  },
})