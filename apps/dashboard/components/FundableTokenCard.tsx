import { useTipEngineContext } from "@/app/context/TipEngineContext";
import { Button } from "@ui/components/ui/button";
import { Card } from "@ui/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/components/ui/tooltip";
import { Download, Info, Upload } from "lucide-react";
import { formatUnits, getAddress } from "viem";
import { useAccount, useSendTransaction } from "wagmi";
import AmountDialog from "./AmountDialog";

interface FundableTokenCardProps {
  token: any
  tipEngineId: string
}

export default function FundableTokenCard({ token, tipEngineId }: FundableTokenCardProps) {
  const { address: walletAddress, isConnected, chainId } = useAccount();
  const { data: addFundsHash, isPending: addFundsPending, sendTransaction: sendAddFunds } = useSendTransaction() 
  const { data: withdrawFundsHash, isPending: withdrawFundsPending, sendTransaction: sendWithdrawFunds } = useSendTransaction() 
  const { addFunds, withdrawFunds } = useTipEngineContext();

  const clickAddFunds = async (amount: bigint) => {
    if (walletAddress === undefined) return;

    addFunds(sendAddFunds, walletAddress, tipEngineId, amount)
  }

  const clickWithdrawFunds = async (amount: bigint) => {
    if (walletAddress === undefined) return;

    withdrawFunds(sendWithdrawFunds, walletAddress, tipEngineId, amount)
  }

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
        <AmountDialog title="Add Funds" description="Enter the amount of funds you would like to add" buttonLabel="Add Funds" execute={clickAddFunds}>
          <Button variant="outline" size="xs" className="flex flex-row gap-2">
            <Download className="h-4 w-4" />
            <span>Fund</span>
          </Button>
        </AmountDialog>
        <AmountDialog title="Withdraw Funds" description="Enter the amount of funds you would like to withdraw" buttonLabel="Withdraw Funds" execute={clickWithdrawFunds}>
          <Button variant="outline" size="xs" className="flex flex-row gap-2">
            <Upload className="h-4 w-4" />
            <span>Withdraw</span>
          </Button>
        </AmountDialog>
      </div>
    </Card>
  );
}