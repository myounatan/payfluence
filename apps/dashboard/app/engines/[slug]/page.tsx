"use client";

import { CHAIN_IMAGES, PLATFORM_IMAGES } from "@/app/lib/images";
import { TipEngineDisplayParams } from "@repo/database/types";
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
import { AirdropTimelineHeader, AirdropTimelineSection, AirdropTimelineSectionDiamond } from "@/components/AirdropTimeline";
import { useTipEngineContext } from "@/app/context/TipEngineContext";

interface SocialAvatarProps {
  avatarUrl: string;
  username: string;
  displayName: string;
}

function SocialAvatar({ avatarUrl, username, displayName }: SocialAvatarProps) {
  return (
    <div className="flex items-center gap-2">
      <img
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

// rules:
/*
- we show the header only when a new month is found in the next airdrop, starting with airdrop 0
- we show a diamond section before the first airdrop
- we show a diamond section after the last airdrop
- all other sections are normal and coincide with an airdrop
*/
function buildAirdropTimeline(airdrops: TipEngineDisplayParams["airdrops"]) {
  let lastMonth = -1;
  let timeline = []
  let key = 1;

  for (let i = 0; i < airdrops.length; i++) {
    const airdrop = airdrops[i]

    const active = new Date() >= airdrop.startDate && (airdrop.claimStartDate ? new Date() <= airdrop.claimStartDate : true);

    let newMonth = false;
    if (airdrop.claimStartDate.getMonth() !== lastMonth) {
      timeline.push(<AirdropTimelineHeader date={airdrop.claimStartDate} key={key++} />)
      lastMonth = airdrop.claimStartDate.getMonth()
      newMonth = true && i !== 0;
    }

    if (i === 0) {
      timeline.push(<AirdropTimelineSectionDiamond date={airdrop.startDate} title="Engine Start" active={new Date() < airdrop.claimStartDate} includeTopLine={false} includeBottomLine={true} key={key++} />)
    }
    
    timeline.push(<AirdropTimelineSection date={airdrop.claimStartDate} title={`Airdrop ${i+1}`} active={active} includeTopLine={newMonth} key={key++} >
      <span className="text-sm text-muted-foreground">Active: {airdrop.startDate.toDateString()}</span>
      <span className="text-sm text-muted-foreground">{airdrop.pointsToTokenRatio}:1 Points:Tokens</span>
      <br/>
      {/* <span className="text-sm">Requirements</span> */}
      <span className="text-sm text-muted-foreground">{airdrop.minCasts} Min. Casts</span>
      <span className="text-sm text-muted-foreground">{airdrop.minTokens} Min. Token Balance</span>
      {airdrop.requireLegacyAccount && <span className="text-sm text-muted-foreground">Legacy Account Required</span>}
      {airdrop.requirePowerBadge && <span className="text-sm text-muted-foreground">Power Badge Required</span>}
    </AirdropTimelineSection>)

    if (i === airdrops.length - 1) {
      timeline.push(<AirdropTimelineSectionDiamond date={airdrop.claimEndDate || airdrop.claimStartDate} title="Engine Stops" active={false} includeTopLine={false} includeBottomLine={false} key={key++}/>)
    }
  }

  return timeline;
}

export default function Page({ params }: { params: { slug: string } }) {
  const { tipEngines } = useTipEngineContext()

  const tipEngine = tipEngines.find((tipEngine) => tipEngine.id === params.slug)
  if (!tipEngine) {
    return (
      <main className="p-4 sm:px-6 sm:py-0">
        <WarningCard variant="error" title="Tip Engine Not Found" description="The tip engine you are looking for does not exist.">
          <p>Tip engine not found.</p>
        </WarningCard>
      </main>
    )
  }

  return (
    <main className="p-4 sm:px-6 sm:py-0 space-y-4">

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
          <span className="text-sm text-muted-foreground">payfluence.io/tips/{tipEngine.slug}</span>
        </div>


        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="xs">
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              View Public Page
            </span>
          </Button>
          <Button variant="highlight-primary" disabled>
            <Edit className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Edit
            </span>
          </Button>
        </div>
      </div>


      <div className="flex flex-row gap-4 md:gap-8">

        <div className="flex flex-col gap-4 md:gap-8 w-[70%]">


          <div className="grid grid-cols-4 gap-4 md:gap-8">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>
                  Tip String
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className=" font-semibold">
                  {tipEngine.tipString}
                </span>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>
                  Token Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 gap">
                  <div className="grid gap-3">
                    <FundableTokenCard tipEngineId={tipEngine.id} token={{ name: tipEngine.tokenName, symbol: tipEngine.tokenSymbol, balance: tipEngine.tokenBalance, decimals: tipEngine.tokenDecimals }} />
                  </div>
                  {/* <div className="grid gap-3">
                    <span className="font-semibold">Airdrop 1 Participation Requirements</span>
                  </div> */}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>
                  Total Points Tipped
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


            <div className="col-span-2">
              <Tabs defaultValue="recent-tips">
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
                          {tipEngine.tipPosts.map((tipPost) => (
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
                                    avatarUrl={tipPost.receiverAvatarUrl || ""}
                                    displayName={tipPost.receiverDisplayName || ""}
                                    username={tipPost.receiverUsername || ""}
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
                      {tipEngine.tipPosts.length > 0 &&
                        <div className="text-xs text-muted-foreground">
                          Last <strong>{tipEngine.tipPosts.toString()}</strong> tips processed.
                        </div>
                      }
                    </CardFooter>
                  </Card>
                </TabsContent>
                <TabsContent value="participants">
                </TabsContent>
              </Tabs>
            </div>
        </div>

        <div className="flex flex-auto w-[30%] h-auto">
          <div className="flex flex-col w-full">
            <Card>
              <CardHeader>
                <CardTitle>
                  Airdrop Timeline
                </CardTitle>
              </CardHeader>
              <div>
                {buildAirdropTimeline(tipEngine.airdrops)}
              </div>
            </Card>
          </div>
        </div>

      </div>

    </main>
  )
}