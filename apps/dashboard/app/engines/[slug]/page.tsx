import { CHAIN_IMAGES, PLATFORM_IMAGES } from "@/app/lib/images";
import { TipEngineDisplayParams, TipPostDisplayParams } from "@repo/database/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@ui/components/ui/card";
import { Badge } from "@ui/components/ui/badge";
import Image from "next/image";
import FundableTokenCard from "@/components/FundableTokenCard";
import WarningCard from "@/components/WarningCard";
import { Button } from "@ui/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuItem } from "@ui/components/ui/dropdown-menu";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@ui/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@ui/components/ui/tabs";
import { Edit, ExternalLink, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/components/ui/tooltip";

const tipEngine: TipEngineDisplayParams = {
  id: "1",
  name: "Laser Lemonade Machine",
  chainId: 84532,
  userId: "1",
  webhookActive: true,
  slug: "laser-lemonade-machine",
  ownerAddress: "0x1234",
  tokenContract: "0x1234",
  tipString: "Laser Lemonade Machine",
  publicTimeline: true,
  createdAt: new Date(),
  
  status: "Draft",
  totalPointsGiven: 1000,
  totalTokensClaimed: 1000,
  totalClaimableTokens: 1000,
  totalParticipants: 1000,
  tokenBalance: 1000,

  airdrops: [
    {
      startDate: new Date(),
      claimStartDate: new Date(),
      claimEndDate: new Date(),
      pointsToTokenRatio: 10,
      requireLegacyAccount: true,
      requirePowerBadge: true,
      minTokens: 0,
      minCasts: 0,
    }
  ]
}

const tipPosts: TipPostDisplayParams[] = [
  {
    providerType: "Farcaster",
    airdropId: "1",
    amountTipped: 1000,
    receiverId: "1",
    senderId: "1",
    receiverAvatarUrl: "/metamask.svg",
    senderAvatarUrl: "/metamask.svg",
    receiverUsername: "user1",
    senderUsername: "user1",
    receiverDisplayName: "User 1",
    senderDisplayName: "User 1",
    approved: true,
    rejectedReason: "",
    createdAt: new Date(),
  },
  {
    providerType: "Farcaster",
    airdropId: "1",
    amountTipped: 1000,
    receiverId: "1",
    senderId: "1",
    receiverAvatarUrl: "/metamask.svg",
    senderAvatarUrl: "/metamask.svg",
    receiverUsername: "user1",
    senderUsername: "user1",
    receiverDisplayName: "User 1",
    senderDisplayName: "User 1",
    approved: false,
    rejectedReason: "Exceeds daily allowance",
    createdAt: new Date(),
  },
]

interface SocialAvatarProps {
  avatarUrl: string;
  username: string;
  displayName: string;
}

function SocialAvatar({ avatarUrl, username, displayName }: SocialAvatarProps) {
  return (
    <div className="flex items-center gap-2">
      <Image
        alt={`${displayName}'s avatar`}
        className="rounded-full"
        height="36"
        src={avatarUrl}
        width="36"
      />
      <div className="flex flex-col">
        <span className="font-semibold">{displayName}</span>
        <span className="text-sm text-muted-foreground">@{username}</span>
      </div>
    </div>
  )
}

export default function Page({ params }: { params: { slug: string } }) {


  return (
    <main className="grid grid-cols-3 gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="col-span-full flex flex-auto">
        <div className="flex flex-auto gap-2 items-center">
          <Image
            alt="Product image"
            className="aspect-square rounded-md object-cover"
            height="26"
            src={CHAIN_IMAGES[tipEngine.chainId]}
            width="26"
          />
          <span className="text-2xl font-semibold">{tipEngine.name}</span>
          <Badge variant="outline">{tipEngine.status}</Badge>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="xs">
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              View Public Page
            </span>
          </Button>
          <Button variant="highlight-primary">
            <Edit className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Edit
            </span>
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            Token Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 gap">
            <div className="grid gap-3">
              <FundableTokenCard token={{ name: "Token", balance: 432876000000000000000, decimals: 18, symbol: "TOK", token_address: "0x1234" }} />
            </div>
            <div className="grid gap-3">
              <span className="font-semibold">Airdrop 1 Participation Requirements</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 grid-rows-2 gap-4 md:gap-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>
              Total Points Given
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-semibold">
              {tipEngine.totalPointsGiven}
            </span>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>
              Total Tokens Claimed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-semibold">
              {tipEngine.totalTokensClaimed}
            </span>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>
              Total Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-semibold">
              {tipEngine.totalParticipants}
            </span>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>
              Total Claimable Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-semibold">
              {tipEngine.totalClaimableTokens}
            </span>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            Airdrop Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
        </CardContent>
      </Card>
      <Tabs defaultValue="recent-tips" className="col-span-2">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="recent-tips">Recent Tips</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="recent-tips">
          <Card>
            <CardHeader>
              <CardTitle>Recent Tips</CardTitle>
              <CardDescription>
                The most recent tips processed by your tip engine.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Platform</TableHead>
                    <TableHead className="hidden md:table-cell text-center">Sender</TableHead>
                    <TableHead className="hidden md:table-cell text-center">Receiver</TableHead>
                    <TableHead className="hidden md:table-cell text-center">
                      Status
                    </TableHead>
                    <TableHead className="hidden md:table-cell text-center">
                      Date Submitted
                    </TableHead>
                    <TableHead className="hidden md:table-cell text-end">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tipPosts.map((tipPost) => (
                    <TableRow>
                      <TableCell className="hidden sm:table-cell">
                        <Image
                          alt="Product image"
                          className="aspect-square object-cover"
                          height="36"
                          src={PLATFORM_IMAGES[tipPost.providerType]}
                          width="36"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-auto justify-center items-center">
                          <SocialAvatar
                            avatarUrl={tipPost.senderAvatarUrl || ""}
                            displayName={tipPost.senderDisplayName || ""}
                            username={tipPost.senderUsername || ""}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-auto justify-center items-center">
                          <SocialAvatar
                            avatarUrl={tipPost.senderAvatarUrl || ""}
                            displayName={tipPost.senderDisplayName || ""}
                            username={tipPost.senderUsername || ""}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-auto justify-center items-center">
                          <Badge variant={tipPost.approved ? "outline" : "destructive"} className="select-none hover:bg-none">
                            {tipPost.approved ? "Success" : (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex flex-auto gap-1 items-center">
                                        <span>Rejected</span>
                                        <Info className="h-4 w-4 ml-0.5" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{tipPost.rejectedReason}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                            )}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-auto justify-center items-center">
                          {tipPost.createdAt?.toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-auto justify-end items-center">
                          {tipPost.amountTipped}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              {tipPosts.length > 0 &&
                <div className="text-xs text-muted-foreground">
                  Last <strong>{tipPosts.length.toString()}</strong> tips processed.
                </div>
              }
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}