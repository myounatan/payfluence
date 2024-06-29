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
import { Input } from "@ui/components/ui/input"
import { Label } from "@ui/components/ui/label"
import Link from "next/link"
import { useState } from "react"

interface AmountDialogProps {
  title: string
  description: string
  buttonLabel: string
  execute: (amount: bigint) => void
  children: React.ReactNode
}

export default function AmountDialog({ title, description, buttonLabel, execute, children }: AmountDialogProps) {
  const [amount, setAmount] = useState<bigint>(BigInt(0))

  return (
    <Dialog>
      <DialogTrigger asChild>
      {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
          <Input
            type="text"
            className="w-full"
            value={amount.toString()}
            onChange={(e) => setAmount(BigInt(e.target.value))}
          />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">No</Button>
          </DialogClose>
          <Button type="submit" onClick={() => execute(amount)}>{buttonLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
