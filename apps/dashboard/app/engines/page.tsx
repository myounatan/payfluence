"use client";

import Link from "next/link"
import Image from "next/image";
import SidebarNav from "@/components/SidebarNav";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@repo/ui/components/ui/breadcrumb";
import { Button } from "@repo/ui/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuCheckboxItem } from "@repo/ui/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@ui/components/ui/card";
import { ListFilter, PlusCircle, MoreHorizontal, File, Plus, Filter, Info, Users, View, Edit, StopCircle, Upload, UploadCloud, Download } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@ui/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table"
import { Badge } from "@repo/ui/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/components/ui/tooltip";
import WarningCard from "@/components/WarningCard";
import { useRouter } from "next/navigation";
import HeaderNav from "@/components/HeaderNav";
import { useTipEngine } from "../lib/queries";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { TipEngineDisplayParams } from "@repo/database/types";
import { formatUnits } from "viem";
import { truncate } from "@ui/lib/utils";
import { CHAIN_IMAGES } from "../lib/images";
import FundableTokenCard from "@/components/FundableTokenCard";

const breadcrumbLinks = [
  // { route: "#", label: "Dashboard" },
  { route: "#", label: "Tip Engines" },
]

const mockTipEngines: TipEngineDisplayParams[] = [
  {
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
]

export default function TipEngines() {
  const { authToken } = useDynamicContext()
  // const { tipEngines } = useTipEngine(authToken)
  const tipEngines = mockTipEngines

  const router = useRouter();

  const onClickNewTipEngine = () => {
    router.push("/engines/create");
  }

  return (
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="all">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="archived" className="hidden sm:flex">
                  Archived
                </TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="xs">
                      <Filter className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filter
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>
                      Active
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Archived
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* <Button size="sm" variant="outline" className="h-8 gap-1">
                  <File className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Export
                  </span>
                </Button> */}
                <Button variant="highlight-primary" onClick={onClickNewTipEngine}>
                  <Plus className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    New Tip Engine
                  </span>
                </Button>
              </div>
            </div>
            <TabsContent value="all">
              <Card x-chunk="dashboard-06-chunk-0">
                <CardHeader>
                  <CardTitle>Tip Engines</CardTitle>
                  <CardDescription>
                    Manage your tip engines and their performance.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WarningCard variant="warn" title="Tip Engine Limit" tooltip="Your plan has a maximum of 1 active engine.">
                    You have reached your limit of <b>1/1 engine(s)</b>, you can <Link className="underline font-bold" href="#">upgrade now</Link> to deploy more active engines!
                  </WarningCard>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Chain</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Status
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Total Points Given
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Total Tokens Claimed
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Participants
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Token Balance
                        </TableHead>
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tipEngines.map((tipEngine) => (
                        <TableRow>
                          <TableCell className="hidden sm:table-cell">
                            <Image
                              alt="Product image"
                              className="aspect-square rounded-md object-cover"
                              height="36"
                              src={CHAIN_IMAGES[tipEngine.chainId]}
                              width="36"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {tipEngine.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{tipEngine.status}</Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            $499.99
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            25
                          </TableCell>  
                          <TableCell className="hidden md:table-cell">
                            <div className="flex flex-auto items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>25</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <FundableTokenCard token={{ name: "Token", balance: 432876000000000000000, decimals: 18, symbol: "TOK", token_address: "0x1234" }} />
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  aria-haspopup="true"
                                  size="icon"
                                  variant="ghost"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem className="flex flex-auto gap-2 pr-12">
                                  <View className="h-4 w-4" />
                                  <span>View Details</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex flex-auto gap-2">
                                  <Edit className="h-4 w-4" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                {tipEngine.webhookActive ? (
                                  <DropdownMenuItem className="flex flex-auto gap-2">
                                    <StopCircle className="h-4 w-4" />
                                    <span>Stop</span>
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem className="flex flex-auto gap-2">
                                    <UploadCloud className="h-4 w-4" />
                                    <span>Publish</span>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  {tipEngines.length > 0 &&
                    <div className="text-xs text-muted-foreground">
                      Showing <strong>1-{tipEngines.length.toString()}</strong> of <strong>{tipEngines.length.toString()}</strong>{" "}
                      tip engines
                    </div>
                  }
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
  )
}