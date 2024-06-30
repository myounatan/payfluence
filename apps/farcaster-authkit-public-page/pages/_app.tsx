import "@repo/ui/globals.css";

import { WalletContextProvider } from "@/context/WalletContext";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig } from '@/config/web3';

const queryClient = new QueryClient()

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>

      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}> 
          <WalletContextProvider>

            <Component {...pageProps} />

          </WalletContextProvider>
        </QueryClientProvider>
      </WagmiProvider>
      
    </SessionProvider>
  );
}
