import { Card, CardContent } from "@ui/components/ui/card"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@ui/components/ui/tooltip"
import { cn } from "@ui/lib/utils"
import { Info } from "lucide-react"

export interface WarningCardProps {
  title: string
  tooltip?: string
  description?: string
  variant: "warn" | "error" | "success" | "info"
  children?: React.ReactNode
}

function getVariantColor(variant: WarningCardProps["variant"]) {
  switch (variant) {
    case "warn":
      return "bg-[#FFEEB0]"
    case "error":
      return "bg-[#FBC9C9]"
    case "success":
      return "bg-[#B6FFB0]"
    default:
      return "bg-slate-100"
  }
}

export default function WarningCard({ title, tooltip, description, variant, children }: WarningCardProps) {
  return (
    <Card className={cn(getVariantColor(variant), "mb-0 border-0 justify-start items-start my-2")}>
      <CardContent className="p-3">
        <p className="text-xs flex w-full justify-start items-center text-slate-500">
          <b>{title}</b>
          {tooltip &&
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 ml-1" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>}
        </p>
        <p className="text-xs text-slate-500 mb-0">
          {description ? description : children}
        </p>
      </CardContent>
    </Card>
  )
};