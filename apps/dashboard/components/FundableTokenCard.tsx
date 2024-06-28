import { Button } from "@ui/components/ui/button";
import { Card } from "@ui/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/components/ui/tooltip";
import { Download, Info, Upload } from "lucide-react";
import { formatUnits } from "viem";

interface FundableTokenCardProps {
  token: any
}

export default function FundableTokenCard({ token }: FundableTokenCardProps) {
  return (
    <Card className="bg-slate-50 flex flex-row border-none items-center py-1 px-2">
      <div className="flex flex-col w-full">
        <span className="font-semibold flex flex-auto gap-0.5 items-center">
          {token.name}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 ml-1" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{token.token_address}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </span>
        <span className="text-muted-foreground">{formatUnits(token.balance, token.decimals)} ${token.symbol}</span>
      </div>
      <div className="flex flex-row gap-2">
        <Button variant="outline" size="xs" className="flex flex-row gap-2">
          <Download className="h-4 w-4" />
          <span>Fund</span>
        </Button>
        <Button variant="outline" size="xs">
          <Upload className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}