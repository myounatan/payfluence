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

interface SimpleDialogProps {
  title: string
  description?: string
  buttonLabel?: string
  href?: string
  children: React.ReactNode
}

export default function SimpleDialog({ title, description, buttonLabel, href, children }: SimpleDialogProps) {
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
            <Button variant="ghost">No</Button>
          </DialogClose>
          {href ? <Link href={href}>
            <Button type="submit">{buttonLabel || "Yes"}</Button>
          </Link> : <Button type="submit">{buttonLabel || "Yes"}</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
