"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@ui/components/ui/dropdown-menu";
import { Breadcrumbs, BreadcrumbLinks } from "./Breadcrumbs";
import { Button } from "@ui/components/ui/button";
import Image from "next/image";
import ConnectWalletDialog from "@/components/ConnectWalletDialog";
import { useAccount } from "wagmi";
import { useWalletContext } from "@/app/context/WalletContext";
import { truncate } from "@ui/lib/utils";
import { LogOut, UserIcon } from "lucide-react";
import { getAuthToken, useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "@repo/database/types";
import { useLocalUser } from "@/app/lib/queries";

interface HeaderNavProps {
  breadcrumbLinks: BreadcrumbLinks;
}


export default function HeaderNav({ breadcrumbLinks }: HeaderNavProps) {
  const { handleLogOut: dynamicLogOut, user: dynamicUser, authToken, isAuthenticated } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const { disconnectWallet } = useWalletContext();
  const { address: walletAddress, isConnected } = useAccount();
  const router = useRouter();

  const handleLogOut = async () => {
    await dynamicLogOut();
  }

  const { localUser } = useLocalUser(authToken);

  useEffect(() => {
    if (localUser) {
      console.log("we now have local user!!!!")
      console.log(localUser)
    }
  }, [localUser]);

  return (
    <header className="sticky top-0 z-30 flex h-[50px] items-center gap-4 px-4 py-2 border-0 backdrop-blur-2xl bg-opacity-40 sm:px-6 bg-slate-100">
      <Breadcrumbs links={breadcrumbLinks} />
      <div className="relative ml-auto flex-1 md:grow-0">
        {isConnected ? (
            <Button className="" size="xs" variant="outline" onClick={disconnectWallet}>
              {truncate(walletAddress)}
              <LogOut className="w-4 h-4 ml-2"/>
            </Button>
        ) : (
          <ConnectWalletDialog title="Connect Wallet" description="Connect your wallet via desktop or mobile.">
            <Button className="" size="xs" variant="highlight-secondary">
              Connect Wallet
            </Button>
          </ConnectWalletDialog>
        )}
      </div>
      {(localUser?.email && isLoggedIn) ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              <UserIcon className="w-6 h-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {localUser.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogOut}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          variant="highlight-secondary"
          size="xs"
          onClick={() => router.push("/login")}
        >
          Login
        </Button>
      )}
    </header>
  )
};