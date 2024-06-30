import { Card } from "@ui/components/ui/card"
import { truncate } from "@ui/lib/utils";
import { formatUnits } from "viem";

interface SimpleTokenCardProps {
  token: any
}

export default function SimpleTokenCard({ token }: SimpleTokenCardProps) {
  return (
    <Card className="bg-slate-50 flex flex-row border-none items-center py-1 px-2">
      <div className="flex flex-col w-full">
        <span className="font-semibold">{token.name}</span>
        <span className="text-muted-foreground">{formatUnits(token.balance, token.decimals)} ${token.symbol}</span>
      </div>
      <span className="text-muted-foreground">{truncate(token.token_address)}</span>
    </Card>
  );
};
