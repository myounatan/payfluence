"use client";

import { useWalletContext } from "@/context/WalletContext"
import { Button } from "@ui/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ui/components/ui/dialog"
import Image from "next/image"

interface ConnectWalletDialogProps {
  title: string
  description?: string
  children: React.ReactNode
}

export default function ConnectWalletDialog({ title, description, children }: ConnectWalletDialogProps) {
  const { connectWallet } = useWalletContext();

  const connectMetamask = async () => {
    connectWallet("metamask")
  }

  const connectWalletConnect = async () => {
    connectWallet("walletConnect")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
      {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>
            {description}
          </DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit" variant="secondary" onClick={connectMetamask}>
              <Image src="/metamask.svg" alt="" height={16} width={16} className="mr-1.5"/>
              Metamask
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit" variant="secondary" onClick={connectWalletConnect}>
              <Image src="/walletconnect.svg" alt="" height={16} width={16} className="mr-1.5"/>
              WalletConnect
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
