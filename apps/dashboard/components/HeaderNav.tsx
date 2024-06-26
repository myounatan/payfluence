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
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "@repo/database/types";
import { useLocalUser } from "@/app/lib/queries";

interface HeaderNavProps {
  breadcrumbLinks: BreadcrumbLinks;
}


export default function HeaderNav({ breadcrumbLinks }: HeaderNavProps) {
  const { handleLogOut: dynamicLogOut, user: dynamicUser, authToken } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const { disconnectWallet } = useWalletContext();
  const { address: walletAddress, isConnected } = useAccount();

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
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
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
            {localUser ? localUser.email : "My Account"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogOut}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
};