import "@repo/ui/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import * as dotenv from 'dotenv';
dotenv.config();

import {
  DynamicContextProvider,
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Docs",
  description: "Generated by create turbo",
};

const dynamicContextLocale = {
  en: {
    dyn_login: {
      title: {
        all: "",
      },
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body className={inter.className}>
          
        <DynamicContextProvider
          locale={dynamicContextLocale}
          settings={{
            // Find your environment id at https://app.dynamic.xyz/dashboard/developer
            environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "sandbox",
            walletConnectors: [EthereumWalletConnectors],
          }}
        >
          {children}
        </DynamicContextProvider>

      </body>
    </html>
  );
}