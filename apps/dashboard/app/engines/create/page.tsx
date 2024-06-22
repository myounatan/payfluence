"use client";

import Link from "next/link"
import Image from "next/image";
import SidebarNav from "@/components/SidebarNav";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@repo/ui/components/ui/breadcrumb";
import { Button } from "@repo/ui/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuCheckboxItem } from "@repo/ui/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@ui/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@ui/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@ui/components/ui/tabs"
import { Label } from "@ui/components/ui/label"
import { Switch } from "@ui/components/ui/switch"
import { Textarea } from "@ui/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table"
import { Badge } from "@repo/ui/components/ui/badge"
import { Popover, PopoverTrigger } from "@repo/ui/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/components/ui/tooltip";
import WarningCard from "@/components/WarningCard";
import { Separator } from "@ui/components/ui/separator";
import { ArrowDown, ArrowDownWideNarrow, ChevronLeft, Copy, Info, Plus, PlusCircle, Trash, Trash2, Upload } from "lucide-react";
import { Input } from "@ui/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@ui/components/ui/toggle-group";
import { Toggle } from "@ui/components/ui/toggle";
import HeaderNav from "@/components/HeaderNav";
import SimpleDialog from "@/components/SimpleDialog";
import { useState } from "react";
import { cn } from "@ui/lib/utils";

const breadcrumbLinks = [
  { route: "/engines", label: "Tip Engines" },
  { route: "#", label: "Create" },
]

interface TipEngineSchema {
  
}

interface AirdropSchema {
  startDate: Date
  endDate: Date
}

export default function CreateTipEngine() {

  const [airdropSchemas, setAirdropSchemas] = useState<Record<number, AirdropSchema>>({})

  const setAirdropSchemaKeyValue = (index: number, key: string, value: any) => {
    setAirdropSchemas({
      ...airdropSchemas,
      [index]: {
        ...airdropSchemas[index],
        [key]: value,
      }
    })
  }


  return (
    <div className="grid min-h-screen w-full grid-cols-[220px_1fr] lg:grid-cols-[220px_1fr] bg-slate-100">

      <SidebarNav activeMenu="engines" />

      <div className="flex flex-col sm:gap-4 sm:py-4">
        <HeaderNav breadcrumbLinks={breadcrumbLinks} />

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4">
            <div className="flex items-center gap-4">
              <SimpleDialog title="Discard changes" description="Are your sure you want to discard your changes?" href="/engines">
                <Button variant="outline" size="icon" className="h-7 w-7">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
                </Button>
              </SimpleDialog>

              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                New tip engine
              </h1>
              {/* <Badge variant="outline" className="ml-auto sm:ml-0">
                Settings
              </Badge> */}
              <div className="hidden items-center gap-2 md:ml-auto md:flex">
                <Button variant="outline" size="xs">
                  Safe as Draft
                </Button>
                <Button variant="highlight-primary" disabled>Next</Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
              <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">

                <Card x-chunk="dashboard-07-chunk-0">
                  <CardHeader className="flex flex-row">
                    <CardTitle className="flex flex-auto">
                      <span className="flex flex-auto">
                      Asset Management
                      </span>
                      <Button className="" size="xs" variant="outline">
                        Connect Wallet
                      </Button>
                    </CardTitle>
                    
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 gap">
                      <div className="grid gap-3">
                        <WarningCard variant="warn" title="Owner only tokens">
                          You can only add tokens you have deployed from your connected wallet, or if you own the ERC20 smart contract.
                        </WarningCard>
                        <WarningCard variant="info" title="No token yet :(">
                          You can select an ERC20 token by <span onClick={() => {}} className="f font-bold underline cursor-pointer select-none">connecting your wallet</span>.
                        </WarningCard>
                      </div>
                      {/* <div className="grid gap-3">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl nec ultricies ultricies, nunc nisl ultricies nunc, nec ultricies nunc nisl nec nunc."
                          className="min-h-32"
                        />
                      </div> */}
                    </div>
                  </CardContent>
                </Card>

                <Card x-chunk="dashboard-07-chunk-0">
                  <CardHeader className="flex flex-row">
                    <CardTitle className="flex flex-auto">
                      <span className="flex flex-auto">
                      Tip Distribution Methods
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="" size="xs" variant="outline">
                            <Plus className="h-3.5 w-3.5" />
                            Add
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem disabled className="flex flex-row gap-2">
                            <p className="flex flex-auto">Cast Tip String</p>
                            <Badge variant="outline" className="ml-auto sm:ml-0">
                              Used
                            </Badge>
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled className="flex flex-row gap-2">
                            <p className="flex flex-auto">API Key</p>
                            <Badge variant="outline" className="ml-auto sm:ml-0">
                              Coming Soon
                            </Badge>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
      
                      </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 gap">
                      <div className="grid gap-3">
                        <Label htmlFor="name">Cast Tip String</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          placeholder="$MEMECOIN"
                        />
                        <CardDescription>
                        Must be a globally unique string. For example, you cannot use $DEGEN.
                        </CardDescription>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card x-chunk="dashboard-07-chunk-0">
                  <CardHeader className="flex flex-row">
                    <CardTitle className="flex flex-auto">
                      <span className="flex flex-auto">
                        Airdrop Timeline
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="" size="xs" variant="outline">
                            <Plus className="h-3.5 w-3.5" />
                            Add
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem disabled className="flex flex-row gap-2">
                            <p className="flex flex-auto">Cast Tip String</p>
                            <Badge variant="outline" className="ml-auto sm:ml-0">
                              Used
                            </Badge>
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled className="flex flex-row gap-2">
                            <p className="flex flex-auto">API Key</p>
                            <Badge variant="outline" className="ml-auto sm:ml-0">
                              Coming Soon
                            </Badge>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 gap">
                      <div className="grid gap-3">

                        <div className="flex flex-row items-center gap-4">
                          <Switch id="public-timeline" />

                          <div className="flex flex-col gap-2">
                            <Label htmlFor="public-timeline">Public Timeline</Label>
                            <CardDescription>
                              If activated, participants will be able to see your timeline.
                            </CardDescription>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex flex-auto">
                              <span className="flex flex-auto">
                              Airdrop 1
                              </span>
                              <div className="flex flex-row space-x-2">
                                <Button size="xs" variant="ghost" className="ml-auto">
                                  <Copy className="h-3.5 w-3.5" />
                                  Duplicate
                                </Button>
                                <Button size="xs" variant="ghost" className="ml-auto" disabled>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-6 gap">
                              <div className="grid gap-3">
                                <Input
                                  id="start-date"
                                  type="date"
                                  className="w-full"
                                />
                                <div className="flex flex-auto justify-center">
                                  <ArrowDown className="h-5 w-5" />
                                </div>
                                <Input
                                  id="start-date"
                                  type="date"
                                  className="w-full"
                                />
                                {/* <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-[280px] justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      mode="single"
                                      selected={date}
                                      onSelect={setDate}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover> */}
                              </div>
                              <div className="grid gap-3">
                                <Label htmlFor="name">Points to Token Ratio</Label>
                                <Input
                                  id="name"
                                  type="text"
                                  className="w-full"
                                  placeholder="10"
                                />
                                <CardDescription>
                                Enter an amount of points to convert into <b>1 Token</b> at the end of the airdrop. You can always change this later.
                                </CardDescription>
                              </div>
                              <div className="grid gap-3">
                                <Separator />
                              </div>
                              <div className="grid gap-3">
                                <Label className="flex flex-row gap-2 items-center">
                                  Daily Tip Allowance Calculation
                                  <Info className="h-4 w-4" />
                                </Label>
                                <CardDescription>
                                Tip allowance is calculated by Payfluence against token total supply, <Link href="#"><u><b>read more</b></u></Link>.
                                </CardDescription>
                              </div>
                              <div className="grid gap-3">
                                <Separator />
                              </div>
                              <div className="grid gap-3">
                                <Label className="flex flex-row gap-2 items-center">
                                  Security Requirements
                                  <Info className="h-4 w-4" />
                                </Label>
                              </div>
                              <div className="grid gap-3">
                                <div className="flex flex-row items-center gap-4">
                                  <Switch id="public-timeline" checked={true} />
                                  <div className="flex flex-col gap-2">
                                    <Label htmlFor="public-timeline">Legacy Account</Label>
                                    <CardDescription>
                                      Participants must have created their social accounts before the airdrop start date.
                                    </CardDescription>
                                  </div>
                                </div>
                              </div>
                              <div className="grid gap-3">
                                <div className="flex flex-row items-center gap-4">
                                  <Switch id="public-timeline" />
                                  <div className="flex flex-col gap-2">
                                    <Label htmlFor="public-timeline">Min. Token Balance</Label>
                                    <CardDescription>
                                      Participants must hold a minimum balance of the funded token.
                                    </CardDescription>
                                  </div>
                                  <Input
                                    id="name"
                                    type="text"
                                    className="w-[50%]"
                                    placeholder="10,000"
                                    disabled
                                  />
                                </div>
                              </div>
                              <div className="grid gap-3">
                                <div className="flex flex-row items-center gap-4">
                                  <Switch id="public-timeline" />
                                  <div className="flex flex-col gap-2">
                                    <Label htmlFor="public-timeline">Min. Casts</Label>
                                    <CardDescription>
                                      Participants are required to have posted to Farcaster.
                                    </CardDescription>
                                  </div>
                                  <Input
                                    id="name"
                                    type="text"
                                    className="w-[50%]"
                                    placeholder="10,000"
                                    disabled
                                  />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card x-chunk="dashboard-07-chunk-1">
                  <CardHeader>
                    <CardTitle>Stock</CardTitle>
                    <CardDescription>
                      Lipsum dolor sit amet, consectetur adipiscing elit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">SKU</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead className="w-[100px]">Size</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-semibold">
                            GGPC-001
                          </TableCell>
                          <TableCell>
                            <Label htmlFor="stock-1" className="sr-only">
                              Stock
                            </Label>
                            <Input
                              id="stock-1"
                              type="number"
                              defaultValue="100"
                            />
                          </TableCell>
                          <TableCell>
                            <Label htmlFor="price-1" className="sr-only">
                              Price
                            </Label>
                            <Input
                              id="price-1"
                              type="number"
                              defaultValue="99.99"
                            />
                          </TableCell>
                          <TableCell>
                            <ToggleGroup
                              type="single"
                              defaultValue="s"
                              variant="outline"
                            >
                              <ToggleGroupItem value="s">S</ToggleGroupItem>
                              <ToggleGroupItem value="m">M</ToggleGroupItem>
                              <ToggleGroupItem value="l">L</ToggleGroupItem>
                            </ToggleGroup>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold">
                            GGPC-002
                          </TableCell>
                          <TableCell>
                            <Label htmlFor="stock-2" className="sr-only">
                              Stock
                            </Label>
                            <Input
                              id="stock-2"
                              type="number"
                              defaultValue="143"
                            />
                          </TableCell>
                          <TableCell>
                            <Label htmlFor="price-2" className="sr-only">
                              Price
                            </Label>
                            <Input
                              id="price-2"
                              type="number"
                              defaultValue="99.99"
                            />
                          </TableCell>
                          <TableCell>
                            <ToggleGroup
                              type="single"
                              defaultValue="m"
                              variant="outline"
                            >
                              <ToggleGroupItem value="s">S</ToggleGroupItem>
                              <ToggleGroupItem value="m">M</ToggleGroupItem>
                              <ToggleGroupItem value="l">L</ToggleGroupItem>
                            </ToggleGroup>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-semibold">
                            GGPC-003
                          </TableCell>
                          <TableCell>
                            <Label htmlFor="stock-3" className="sr-only">
                              Stock
                            </Label>
                            <Input
                              id="stock-3"
                              type="number"
                              defaultValue="32"
                            />
                          </TableCell>
                          <TableCell>
                            <Label htmlFor="price-3" className="sr-only">
                              Stock
                            </Label>
                            <Input
                              id="price-3"
                              type="number"
                              defaultValue="99.99"
                            />
                          </TableCell>
                          <TableCell>
                            <ToggleGroup
                              type="single"
                              defaultValue="s"
                              variant="outline"
                            >
                              <ToggleGroupItem value="s">S</ToggleGroupItem>
                              <ToggleGroupItem value="m">M</ToggleGroupItem>
                              <ToggleGroupItem value="l">L</ToggleGroupItem>
                            </ToggleGroup>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="justify-center border-t p-4">
                    <Button size="sm" variant="ghost" className="gap-1">
                      <PlusCircle className="h-3.5 w-3.5" />
                      Add Variant
                    </Button>
                  </CardFooter>
                </Card>
                <Card x-chunk="dashboard-07-chunk-2">
                  <CardHeader>
                    <CardTitle>Product Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 sm:grid-cols-3">
                      <div className="grid gap-3">
                        <Label htmlFor="category">Category</Label>
                        <Select>
                          <SelectTrigger
                            id="category"
                            aria-label="Select category"
                          >
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="clothing">Clothing</SelectItem>
                            <SelectItem value="electronics">
                              Electronics
                            </SelectItem>
                            <SelectItem value="accessories">
                              Accessories
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="subcategory">
                          Subcategory (optional)
                        </Label>
                        <Select>
                          <SelectTrigger
                            id="subcategory"
                            aria-label="Select subcategory"
                          >
                            <SelectValue placeholder="Select subcategory" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="t-shirts">T-Shirts</SelectItem>
                            <SelectItem value="hoodies">Hoodies</SelectItem>
                            <SelectItem value="sweatshirts">
                              Sweatshirts
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                <Card x-chunk="dashboard-07-chunk-3">
                  <CardHeader>
                    <CardTitle>Engine Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          placeholder="Memecoin Season 1"
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="status">Blockchain</Label>
                        <Select value="sepolia">
                          <SelectTrigger id="status" aria-label="Select chain">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="base">Base L2</SelectItem>
                            <SelectItem value="sepolia">Base Sepolia</SelectItem>
                            <SelectItem value="mainnet" disabled>Mainnet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="status">Social Platform</Label>
                        <Select value="farcaster">
                          <SelectTrigger id="status" aria-label="Select platform">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="farcaster">Farcaster</SelectItem>
                            <SelectItem value="twitter" disabled>Twitter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card
                  className="overflow-hidden" x-chunk="dashboard-07-chunk-4"
                >
                  <CardHeader>
                    <CardTitle>Product Images</CardTitle>
                    <CardDescription>
                      Lipsum dolor sit amet, consectetur adipiscing elit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      <Image
                        alt="Product image"
                        className="aspect-square w-full rounded-md object-cover"
                        height="300"
                        src="/placeholder.svg"
                        width="300"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <button>
                          <Image
                            alt="Product image"
                            className="aspect-square w-full rounded-md object-cover"
                            height="84"
                            src="/placeholder.svg"
                            width="84"
                          />
                        </button>
                        <button>
                          <Image
                            alt="Product image"
                            className="aspect-square w-full rounded-md object-cover"
                            height="84"
                            src="/placeholder.svg"
                            width="84"
                          />
                        </button>
                        <button className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed">
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          <span className="sr-only">Upload</span>
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card x-chunk="dashboard-07-chunk-5">
                  <CardHeader>
                    <CardTitle>Archive Product</CardTitle>
                    <CardDescription>
                      Lipsum dolor sit amet, consectetur adipiscing elit.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div></div>
                    <Button size="sm" variant="secondary">
                      Archive Product
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 md:hidden">
              <Button variant="outline" size="sm">
                Discard
              </Button>
              <Button size="sm">Save Product</Button>
            </div>
          </div>
        </main>

      </div>

    </div>
  )
};
