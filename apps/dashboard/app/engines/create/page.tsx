"use client";

import Link from "next/link"
import { format } from "date-fns"
import SidebarNav from "@/components/SidebarNav";
import { Button } from "@repo/ui/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuCheckboxItem } from "@repo/ui/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@ui/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@ui/components/ui/select";
import { Label } from "@ui/components/ui/label"
import { Switch } from "@ui/components/ui/switch"
import { Badge } from "@repo/ui/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/ui/popover"
import WarningCard from "@/components/WarningCard";
import { Separator } from "@ui/components/ui/separator";
import { ArrowDown, CalendarIcon, ChevronLeft, Copy, Info, Plus, Trash2 } from "lucide-react";
import { Input } from "@ui/components/ui/input";
import HeaderNav from "@/components/HeaderNav";
import SimpleDialog from "@/components/SimpleDialog";
import { useEffect, useState } from "react";
import { cn } from "@ui/lib/utils";
import { AirdropSchema, CHAIN_ID_NAME_MAP, TipEngineSchema } from "@repo/database/types"
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@ui/components/ui/form";
import { Calendar } from "@ui/components/ui/calendar";
import { useAccount } from "wagmi";
import ConnectWalletDialog from "@/components/ConnectWalletDialog";
import { useAvailableTipEngine } from "@/app/lib/queries";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

const breadcrumbLinks = [
  { route: "/engines", label: "Tip Engines" },
  { route: "#", label: "Create" },
]

const PageSchema = z.object({
  tipEngine: TipEngineSchema,
  airdrops: z.array(AirdropSchema).min(1),
})

export default function CreateTipEngine() {
  const { authToken } = useDynamicContext();
  const { address: walletAddress, isConnected } = useAccount();

  const [ownedERC20Contracts, setOwnedERC20Contracts] = useState<string[]>([]);

  const { checkAvailability } = useAvailableTipEngine(authToken);

  useEffect(
    () => {
      if (!isConnected) {
        console.log("Not connected")
        return
      }

      // fetch owned ERC20 tokens from 
    },
    [isConnected]
  )


  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const pageForm = useForm<z.infer<typeof PageSchema>>({
    resolver: zodResolver(PageSchema),
    defaultValues: {
      tipEngine: {
        name: "",
        chainId: "84532",
        tokenContract: "",
        tipString: "",
        publicTimeline: false,
      },
      airdrops: [{
        startDate: today,
        claimStartDate: tomorrow,
        claimEndDate: dayAfterTomorrow,
        pointsToTokenRatio: 10,
        requireLegacyAccount: true,
        minTokens: 10000,
        minCasts: 0,
      }],
    },
  })

  const [minTokenBalanceEnabled, setMinTokenBalanceEnabled] = useState(pageForm.getValues("airdrops")[0]["minTokens"] > 0);
  const [minCastsEnabled, setMinCastsEnabled] = useState(false);

  const handleMinTokenBalanceSwitchChange = (airdropIndex: number, checked: boolean) => {
    setMinTokenBalanceEnabled(checked);

    if (!checked) {
      pageForm.setValue(`airdrops.${airdropIndex}.minTokens`, 0);
    }
  }

  const handleMinCastsRequiredSwitchChange = (airdropIndex: number, checked: boolean) => {
    setMinCastsEnabled(checked);

    if (!checked) {
      pageForm.setValue(`airdrops.${airdropIndex}.minCasts`, 0);
    }
  }

  const { fields, append, remove } = useFieldArray({
    control: pageForm.control,
    name: "airdrops",
  });

  const addAirdrop = () => append({ startDate: new Date(), claimStartDate: new Date(), claimEndDate: new Date(), pointsToTokenRatio: 10, requireLegacyAccount: false, minTokens: 0, minCasts: 0 });
  const removeAirdrop = (index: number) => remove(index);


  const onSubmit = async (values: z.infer<typeof PageSchema>) => {

    // check uniqueness of tip string and slug in the database
    const slug = values.tipEngine.slug;
    const tipString = values.tipEngine.tipString;

    const { slugAvailable, tipStringAvailable } = await checkAvailability(slug, tipString);

    console.log("slugAvailable", slugAvailable);
    console.log("tipStringAvailable", tipStringAvailable);

    let anyErrors = false;

    if (!slugAvailable) {
      anyErrors = true;
      pageForm.setError("tipEngine.slug", { message: `${slug} is already taken` });
    }

    if (!tipStringAvailable) {
      anyErrors = true;
      pageForm.setError("tipEngine.tipString", { message: `${tipString} is already taken` });
    }

    if (anyErrors) {
      return;
    }

    console.log(values);
  }

  // const setAirdropSchemaKeyValue = (index: number, key: string, value: any) => {
  //   setAirdropSchemas({
  //     ...airdropSchemas,
  //     [index]: {
  //       ...airdropSchemas[index],
  //       [key]: value,
  //     }
  //   })
  // }


  return (
    <div className="grid min-h-screen w-full grid-cols-[220px_1fr] lg:grid-cols-[220px_1fr] bg-slate-100">

      <SidebarNav activeMenu="engines" />

      <div className="flex flex-col sm:gap-4 sm:py-4">
        <HeaderNav breadcrumbLinks={breadcrumbLinks} />

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 mb-[120px]">
          <Form {...pageForm}>
            <form id="page-form" onSubmit={pageForm.handleSubmit(onSubmit, (errors) => console.log(errors))}>
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
                    <Button variant="highlight-primary" type="submit" form="page-form">
                      Next
                    </Button>
                  </div>
                </div>

                  <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">

                    <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                      <Card x-chunk="dashboard-07-chunk-3">
                        <CardHeader>
                          <CardTitle>Engine Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-6">
                            <FormField
                              control={pageForm.control}
                              name="tipEngine.name"
                              render={({ field }) => (
                                <FormItem className="grid gap-0">
                                  <FormLabel>Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="text"
                                      className="w-full"
                                      placeholder="Memecoin Season 1"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid gap-3">
                            <FormField
                              control={pageForm.control}
                              name="tipEngine.chainId"
                              render={({ field }) => (
                                <FormItem className="grid gap-0">
                                  <FormLabel>Blockchain</FormLabel>
                                  <FormControl>
                                    <Select
                                      {...field}
                                      onValueChange={field.onChange}
                                      value={field.value}
                                    >
                                      <SelectTrigger id="chainId" aria-label="Blockchain">
                                        <SelectValue placeholder="Select a chain" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectGroup>
                                          {Object.entries(CHAIN_ID_NAME_MAP).map(([value, name]) => (
                                            <SelectItem key={value.toString()} value={value.toString()}>
                                              {name}
                                            </SelectItem>
                                          ))}
                                          <SelectItem key="1" value="1" disabled>Mainnet</SelectItem>
                                        </SelectGroup>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormDescription>
                                    You cannot change this later.
                                  </FormDescription>
                                </FormItem>
                              )}
                            />
                            </div>
                            <div className="grid gap-2">
                              <Label>Social Platform</Label>
                              <Select value="farcaster">
                                <SelectTrigger id="status" aria-label="Select platform">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="farcaster">Farcaster</SelectItem>
                                  <SelectItem value="twitter" disabled>Twitter</SelectItem>
                                </SelectContent>
                              </Select>
                              <CardDescription>
                                You cannot change this later.
                              </CardDescription>
                            </div>
                            <FormField
                              control={pageForm.control}
                              name="tipEngine.slug"
                              render={({ field }) => (
                                <FormItem className="grid gap-0">
                                  <FormLabel>Public Page URL</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="text"
                                      className="w-full"
                                      placeholder="memecoin-s1"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription className="text-xs text-muted-foreground">
                                    payfluence.io/tips/{field.value}
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                      {/* <Card x-chunk="dashboard-07-chunk-5">
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
                      </Card> */}
                    </div>
                    <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">

                      <Card x-chunk="dashboard-07-chunk-0">
                        <CardHeader className="flex flex-row">
                          <CardTitle className="flex flex-auto">
                            <span className="flex flex-auto">
                            Asset Management
                            </span>
                          </CardTitle>
                          
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-6 gap">
                            <div className="grid gap-3">
                              <WarningCard variant="warn" title="Owner only tokens">
                                You can only add tokens you have deployed from your connected wallet, or if you own the ERC20 smart contract.
                              </WarningCard>
                              {!isConnected && (
                                <WarningCard variant="info" title="No token yet :(">
                                  You can select an ERC20 token by connecting your wallet.
                                </WarningCard>
                              )}
                              {isConnected && (
                                <Button variant="outline" size="xs" type="button">
                                  Select Token
                                </Button>
                              )}

                              <FormField
                                control={pageForm.control}
                                name="tipEngine.tokenContract"
                                render={({ field }) => (
                                  <FormItem className="grid gap-0">
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
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
                                <Button className="" size="xs" variant="outline" type="button">
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

                          <FormField
                              control={pageForm.control}
                              name="tipEngine.tipString"
                              render={({ field }) => (
                                <FormItem className="grid gap-0">
                                  <FormLabel>Cast Tip String</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="text"
                                      className="w-full"
                                      placeholder="$MEMECOIN"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Must be a globally unique string. For example, you cannot use $DEGEN.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card x-chunk="dashboard-07-chunk-0">
                        <CardHeader className="flex flex-row">
                          <CardTitle className="flex flex-auto">
                            <span className="flex flex-auto">
                              Airdrop Timeline
                            </span>
                              <Button className="" size="xs" variant="outline" type="button">
                                <Plus className="h-3.5 w-3.5" />
                                Add
                              </Button>

                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-6 gap">

                            <FormField
                              control={pageForm.control}
                              name="tipEngine.publicTimeline"
                              render={({ field }) => (
                                <FormItem className="grid gap-0">
                                  <div className="flex flex-row items-center gap-4">
                                    <FormControl>
                                      <Switch id="public-timeline"
                                        onCheckedChange={field.onChange}
                                        checked={field.value}
                                      />
                                    </FormControl>

                                    <div className={cn("flex flex-col gap-2", !field.value && "opacity-50")}>
                                      <FormLabel>Public Timeline</FormLabel>
                                      <FormDescription>
                                      If activated, participants will be able to see your timeline.
                                      </FormDescription>
                                      <FormMessage />
                                    </div>
                                  </div>
                                </FormItem>
                              )}
                            />

                            <div className="grid gap-3">
                              {fields.map((field, index) => (
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
                                        <FormField
                                          control={pageForm.control}
                                          name={`airdrops.${index}.startDate`}
                                          render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                              <FormLabel>Start Date</FormLabel>
                                              <Popover>
                                                <PopoverTrigger asChild>
                                                  <FormControl>
                                                    <Button
                                                      variant={"secondary"}
                                                      className={cn(
                                                        "w-full pl-3 border bg-white text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                      )}
                                                    >
                                                      {field.value ? (
                                                        format(field.value, "PPP")
                                                      ) : (
                                                        <span>Pick a date</span>
                                                      )}
                                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                  </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                  <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                      date < today
                                                    }
                                                    initialFocus
                                                  />
                                                </PopoverContent>
                                              </Popover>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                        <div className="flex flex-auto justify-center">
                                          <ArrowDown className="h-5 w-5" />
                                        </div>
                                        <FormField
                                          control={pageForm.control}
                                          name={`airdrops.${index}.claimStartDate`}
                                          render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                              <FormLabel>End Date (Airdrop Claim Starts)</FormLabel>
                                              <Popover>
                                                <PopoverTrigger asChild>
                                                  <FormControl>
                                                    <Button
                                                      variant={"secondary"}
                                                      className={cn(
                                                        "w-full pl-3 border bg-white text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                      )}
                                                    >
                                                      {field.value ? (
                                                        format(field.value, "PPP")
                                                      ) : (
                                                        <span>Pick a date</span>
                                                      )}
                                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                  </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                  <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                      date <= pageForm.getValues(`airdrops.${index}.startDate`)
                                                    }
                                                    initialFocus
                                                  />
                                                </PopoverContent>
                                              </Popover>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                        <div className="flex flex-auto justify-center">
                                          <ArrowDown className="h-5 w-5" />
                                        </div>
                                        <FormField
                                          control={pageForm.control}
                                          name={`airdrops.${index}.claimEndDate`}
                                          render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                              <FormLabel>Airdrop Claim End Date</FormLabel>
                                              <Popover>
                                                <PopoverTrigger asChild>
                                                  <FormControl>
                                                    <Button
                                                      variant={"secondary"}
                                                      className={cn(
                                                        "w-full pl-3 border bg-white text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                      )}
                                                    >
                                                      {field.value ? (
                                                        format(field.value, "PPP")
                                                      ) : (
                                                        <span>Pick a date</span>
                                                      )}
                                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                  </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                  <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                      date <= pageForm.getValues(`airdrops.${index}.claimStartDate`)
                                                    }
                                                    initialFocus
                                                  />
                                                </PopoverContent>
                                              </Popover>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                      </div>
                                      <FormField
                                          control={pageForm.control}
                                          name={`airdrops.${index}.pointsToTokenRatio`}
                                          render={({ field }) => (
                                            <FormItem className="grid gap-0">
                                              <FormLabel>Points to Token Ratio</FormLabel>
                                              <FormControl>
                                                <Input
                                                  type="number"
                                                  className="w-full"
                                                  placeholder="10"
                                                  value={field.value}
                                                  onChange={field.onChange}
                                                />
                                              </FormControl>
                                              <FormDescription>
                                              Enter an amount of points to convert into <b>1 Token</b> at the end of the airdrop. You can always change this before the End Date (Airdrop Claim Date).
                                              </FormDescription>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
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
                                      <FormField
                                        control={pageForm.control}
                                        name={`airdrops.${index}.requireLegacyAccount`}
                                        render={({ field }) => (
                                          <FormItem className="grid gap-0">
                                            <div className="flex flex-row items-center gap-4">
                                              <FormControl>
                                                <Switch id="public-timeline"
                                                  onCheckedChange={field.onChange}
                                                  checked={field.value}
                                                />
                                              </FormControl>

                                              <div className={cn("flex flex-col gap-2", !field.value && "opacity-50")}>
                                                <FormLabel>Legacy Account</FormLabel>
                                                <FormDescription>
                                                Participants must have created their social accounts before the airdrop start date.
                                                </FormDescription>
                                                <FormMessage />
                                              </div>
                                            </div>
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={pageForm.control}
                                        name={`airdrops.${index}.minTokens`}
                                        render={({ field }) => (
                                          <div className="grid gap-0">
                                            <div className="flex flex-row items-center gap-4">
                                              <Switch id="public-timeline" checked={minTokenBalanceEnabled} onCheckedChange={(checked) => handleMinTokenBalanceSwitchChange(index, checked)} />
                                              <div className={cn("flex flex-col gap-2 w-full", !minTokenBalanceEnabled && "opacity-50")}>
                                                <Label>Min. Token Balance</Label>
                                                <CardDescription>
                                                Also enables Farcaster linked wallet requirement. Participants must hold a minimum balance of the funded token.
                                                </CardDescription>
                                              </div>
                                              <FormItem>
                                              <FormControl>
                                                <Input
                                                  type="text"
                                                  className="w-[120px]"
                                                  disabled={!minTokenBalanceEnabled}
                                                  value={field.value}
                                                  onChange={field.onChange}
                                                />
                                              </FormControl>
                                              </FormItem>
                                            </div>
                                          </div>
                                        )}
                                      />
                                      <FormField
                                        control={pageForm.control}
                                        name={`airdrops.${index}.minCasts`}
                                        render={({ field }) => (
                                          <FormItem className="grid gap-0">
                                            <div className="flex flex-auto items-center gap-4">
                                              <Switch id="public-timeline" checked={minCastsEnabled} onCheckedChange={(checked) => handleMinCastsRequiredSwitchChange(index, checked)} />
                                              <div className={cn("flex flex-col gap-2 w-full", !minCastsEnabled && "opacity-50")}>
                                                <Label>Min. Casts</Label>
                                                <CardDescription>
                                                Participants are required to have posted to Farcaster.
                                                </CardDescription>
                                              </div>
                                              <FormControl>
                                                <Input
                                                  type="text"
                                                  className="w-[120px]"
                                                  disabled={!minCastsEnabled}
                                                  value={field.value}
                                                  onChange={field.onChange}
                                                />
                                              </FormControl>
                                            </div>
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
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
            </form>
          </Form>
        </main>

      </div>

    </div>
  )
};
