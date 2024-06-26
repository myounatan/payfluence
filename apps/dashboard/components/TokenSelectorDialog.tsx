import { Button } from "@ui/components/ui/button"
import { Card } from "@ui/components/ui/card"
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
import { Input } from "@ui/components/ui/input"
import { Label } from "@ui/components/ui/label"
import { ScrollArea } from "@ui/components/ui/scroll-area"
import { cn, truncate } from "@ui/lib/utils"
import { UserIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { formatUnits } from "viem"

interface TokenSelectorDialogProps {
  title: string
  description?: string
  tokens: any[]
  callback: (token: string) => void
  children: React.ReactNode
}

export default function TokenSelectorDialog({ title, description, tokens, callback, children }: TokenSelectorDialogProps) {
  const [selectedToken, setSelectedToken] = useState<string | null>(null)

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
        {tokens.length == 0 ? (
          <div className="p-4 text-center flex flex-col">
            <span className="text-center">No tokens found {":("}</span>
            <span className="text-center">You can try connecting a different wallet.</span>
          </div>
        ) : (
            <ScrollArea className="h-72 w-full rounded-md grid grid-cols-1 gap-2">
              <div className="flex flex-col gap-3">
                {tokens.map((token) => (
                    <Card
                      className={cn(
                        selectedToken === token.token_address ? "bg-slate-300 hover:bg-slate-300" : "bg-slate-50 hover:bg-slate-100",
                        "flex flex-row border-none items-center py-1 px-2 cursor-pointer"
                      )}
                      onClick={() => setSelectedToken(token.token_address)}
                    >
                      {/* <div className="bg-slate-100 rounded-full aspect-square items-center justify-center flex">
                        <UserIcon className="w-6 h-6" />
                      </div> */}
                      <div className="flex flex-col w-full">
                        <span className="font-semibold">{token.name}</span>
                        <span className="text-muted-foreground">{formatUnits(token.balance, token.decimals)} ${token.symbol}</span>
                      </div>
                      <span className="text-muted-foreground">{truncate(token.token_address)}</span>
                    </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
          <Button
            disabled={selectedToken === null}
            onClick={() => {
              callback(selectedToken!)
            }}
          >Confirm</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
