"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@ui/components/ui/dropdown-menu";
import { Breadcrumbs, BreadcrumbLinks } from "./Breadcrumbs";
import { Button } from "@ui/components/ui/button";
import Image from "next/image";
import ConnectWalletDialog from "@/components/ConnectWalletDialog";
import { useAccount } from "wagmi";
import { useWalletContext } from "@/app/context/WalletContext";
import { truncate } from "@ui/lib/utils";
import { LogOut } from "lucide-react";

interface HeaderNavProps {
  breadcrumbLinks: BreadcrumbLinks;
}

export default function HeaderNav({ breadcrumbLinks }: HeaderNavProps) {
  const { disconnectWallet } = useWalletContext();
  const { address: walletAddress, isConnected } = useAccount();

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
            <Image
              src="/metamask.svg"
              width={36}
              height={36}
              alt="Avatar"
              className="overflow-hidden rounded-full"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
};