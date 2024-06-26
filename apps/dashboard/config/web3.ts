import { http, createConfig } from '@wagmi/core'
import { base, baseSepolia } from '@wagmi/core/chains'
import { injected, safe, walletConnect } from 'wagmi/connectors'
import { createPublicClient } from 'viem'
import dotenv from 'dotenv';
dotenv.config();

export interface Chain {
  name: string;
  explorerURL: string;
  openseaTokenURL: string;
}
export type Chains = typeof chains
export const chains: Record<number, Chain> = {
  84532: {
    name: "Base Sepolia",
    explorerURL: "https://sepolia.basescan.org/",
    openseaTokenURL: "https://testnets.opensea.io/assets/base-sepolia/"
  }
}

export const CHAIN_ID_TO_WAGMI_CHAIN_ID: Record<number, any> = {
  84532: baseSepolia.id,
  8453: base.id,
}

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA)
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
    [base.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_BASE),
  },
})