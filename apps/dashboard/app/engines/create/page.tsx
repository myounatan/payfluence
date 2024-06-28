"use client";

import Link from "next/link"
import { format } from "date-fns"
import { Button } from "@repo/ui/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@repo/ui/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@ui/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@ui/components/ui/select";
import { Label } from "@ui/components/ui/label"
import { Switch } from "@ui/components/ui/switch"
import { Badge } from "@repo/ui/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/ui/popover"
import WarningCard from "@/components/WarningCard";
import { Separator } from "@ui/components/ui/separator";
import { ArrowDown, CalendarIcon, ChevronLeft, Copy, Info, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Input } from "@ui/components/ui/input";
import SimpleDialog from "@/components/SimpleDialog";
import { useEffect, useState } from "react";
import { cn } from "@ui/lib/utils";
import { CHAIN_ID_NAME_MAP, CreateTipEngine, CreateTipEngineSchema, SLUG_CHAIN_NAMES } from "@repo/database/types"
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@ui/components/ui/form";
import { Calendar } from "@ui/components/ui/calendar";
import { useAccount } from "wagmi";
import { useAvailableTipEngine, useOwnedTokens, useTipEngine } from "@/app/lib/queries";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import TokenSelectorDialog from "@/components/TokenSelectorDialog";
import SimpleTokenCard from "@/components/SimpleTokenCard";
import { switchChain } from '@wagmi/core';
import { CHAIN_ID_TO_WAGMI_CHAIN_ID, wagmiConfig } from "@/config/web3";
import { useToast } from "@ui/components/ui/use-toast";
import { useRouter } from "next/navigation";


const breadcrumbLinks = [
  { route: "/engines", label: "Tip Engines" },
  { route: "#", label: "Create" },
]


export default function CreateTipEnginePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { authToken } = useDynamicContext();
  const { address: walletAddress, isConnected, chainId } = useAccount();

  const { createTipEngine } = useTipEngine(authToken)

  const { ownedTokens }  = useOwnedTokens(authToken, walletAddress, chainId);
  const [ selectedTokenAddress, setSelectedTokenAddress ] = useState<string | null>(null);
  const [ selectedToken, setSelectedToken ] = useState<any | null>(null);

  const [ requiredChainId, setRequiredChainId ] = useState<number>(84532);

  const { checkAvailability } = useAvailableTipEngine(authToken);

  const [loadingNext, setLoadingNext] = useState(false);
  const [lastClickedSubmit, setLastClickedSubmit] = useState<"draft" | "publish" | null>(null);

  const [wrongChain, setWrongChain] = useState(false);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const pageForm = useForm<CreateTipEngine>({
    resolver: zodResolver(CreateTipEngineSchema),
    defaultValues: {
      tipEngine: {
        name: "",
        chainId: "84532",
        tokenContract: "",
        ownerAddress: walletAddress,
        tipString: "",
        publicTimeline: false,
      },
      airdrops: [{
        startDate: today,
        claimStartDate: tomorrow,
        claimEndDate: dayAfterTomorrow,
        pointsToTokenRatio: 10,
        requireLegacyAccount: true,
        requirePowerBadge: false,
        minTokens: 10000,
        minCasts: 0,
      }],
    },
  })

  // use effect for setting ownerAddress as walletAddress
  useEffect(() => {
    if (walletAddress) {
      pageForm.setValue("tipEngine.ownerAddress", walletAddress);
      pageForm.clearErrors("tipEngine.ownerAddress");
    } else {
      pageForm.setError("tipEngine.ownerAddress", { message: "Please connect your wallet" });
    }
  }, [walletAddress])

  const requestSwitchChain = async () => {
    try {
      await switchChain(wagmiConfig, { chainId: CHAIN_ID_TO_WAGMI_CHAIN_ID[requiredChainId] });
    } catch (e: any) {
      console.error('Error switching chain:');
      console.error(e);
    }
  }
  
  useEffect(() => {
    if (!isConnected) {
      pageForm.clearErrors("tipEngine.chainId");
      return;
    }

    const isWrongChain = requiredChainId !== chainId
    setWrongChain(isWrongChain);

    if (isWrongChain) {
      pageForm.setError("tipEngine.chainId", { message: `Please switch your wallet to ${CHAIN_ID_NAME_MAP[requiredChainId]}` });

      // clear selected token variables
      setSelectedToken(null);
      setSelectedTokenAddress(null);
    } else {
      pageForm.clearErrors("tipEngine.chainId");
    }

  }, [chainId, requiredChainId, isConnected]);

  useEffect(() => {
    if (wrongChain) {
      requestSwitchChain();
    }
  }, [wrongChain, requiredChainId]);

  useEffect(() => {
    //set selected token when pageForm.tipEngine.tokenContract is set
    if (selectedTokenAddress) {
      setSelectedToken(ownedTokens.find((token) => token.token_address === selectedTokenAddress));
      pageForm.setValue("tipEngine.tokenContract", selectedTokenAddress);
    } else {
      setSelectedToken(null);
      pageForm.setValue("tipEngine.tokenContract", "");
    }
  }, [selectedTokenAddress])

  const [minTokenBalanceEnabled, setMinTokenBalanceEnabled] = useState<Record<number, boolean>>({ 0: pageForm.getValues("airdrops")[0]["minTokens"] > 0 });
  const [minCastsEnabled, setMinCastsEnabled] = useState<Record<number, boolean>>({ 0: pageForm.getValues("airdrops")[0]["minCasts"] > 0 });

  const handleMinTokenBalanceSwitchChange = (airdropIndex: number, checked: boolean) => {
    setMinTokenBalanceEnabled((prev) => ({ ...prev, [airdropIndex]: checked }));

    if (!checked) {
      pageForm.setValue(`airdrops.${airdropIndex}.minTokens`, 0);
    }
  }

  const handleMinCastsRequiredSwitchChange = (airdropIndex: number, checked: boolean) => {
    setMinCastsEnabled((prev) => ({ ...prev, [airdropIndex]: checked }));

    if (!checked) {
      pageForm.setValue(`airdrops.${airdropIndex}.minCasts`, 0);
    }
  }

  const { fields, append, remove } = useFieldArray({
    control: pageForm.control,
    name: "airdrops",
  });

  // airdrop appended must have dates that are after the previous airdrop
  const appendAirdrop = (indexToCopy?: number) => {
    const lastAirdropIndex = fields.length - 1

    const startDate = new Date(pageForm.getValues(`airdrops.${lastAirdropIndex}.startDate`));
    const claimStartDate = new Date(pageForm.getValues(`airdrops.${lastAirdropIndex}.claimEndDate`));
    const claimEndDate = new Date(pageForm.getValues(`airdrops.${lastAirdropIndex}.claimEndDate`));
    claimEndDate.setDate(claimEndDate.getDate() + 1);

    startDate.setDate(startDate.getDate() + 1);
    claimStartDate.setDate(claimStartDate.getDate() + 1);
    claimEndDate.setDate(claimEndDate.getDate() + 1);

    const appendValues = {
      startDate,
      claimStartDate,
      claimEndDate,
      pointsToTokenRatio: indexToCopy !== undefined ? pageForm.getValues(`airdrops.${indexToCopy}.pointsToTokenRatio`) : 10,
      requireLegacyAccount: indexToCopy !== undefined ? pageForm.getValues(`airdrops.${indexToCopy}.requireLegacyAccount`) : true,
      requirePowerBadge: indexToCopy !== undefined ? pageForm.getValues(`airdrops.${indexToCopy}.requirePowerBadge`) : true,
      minTokens: indexToCopy !== undefined ? pageForm.getValues(`airdrops.${indexToCopy}.minTokens`) : 10000,
      minCasts: indexToCopy !== undefined ? pageForm.getValues(`airdrops.${indexToCopy}.minCasts`) : 0,
    }

    // set min token balance and min casts enabled
    setMinTokenBalanceEnabled((prev) => ({ ...prev, [fields.length]: indexToCopy !== undefined ? minTokenBalanceEnabled[indexToCopy] : appendValues.minTokens > 0 }));
    setMinCastsEnabled((prev) => ({ ...prev, [fields.length]: indexToCopy !== undefined ? minCastsEnabled[indexToCopy] : appendValues.minCasts > 0 }));

    append(appendValues);
  }

  const removeAirdrop = (index: number) => {
    if (fields.length === 1) {
      return;
    }

    console.log("removing", index)

    remove(index);

    // remove min token balance and min casts enabled, if we are removing an index that has consecutive indexes after it, we need to shift the enabled state
    const minTokenBalanceEnabledCopy = { ...minTokenBalanceEnabled };
    const minCastsEnabledCopy = { ...minCastsEnabled };

    delete minTokenBalanceEnabledCopy[index];
    delete minCastsEnabledCopy[index];

    const minTokenBalanceEnabledCopyShifted: Record<number, boolean> = {}
    const minCastsEnabledCopyShifted: Record<number, boolean> = {}

    Object.entries(minTokenBalanceEnabledCopy).forEach(([key, value]) => {
      if (parseInt(key) > index) {
        minTokenBalanceEnabledCopyShifted[parseInt(key) - 1] = value;
      } else {
        minTokenBalanceEnabledCopyShifted[parseInt(key)] = value;
      }
    })

    Object.entries(minCastsEnabledCopy).forEach(([key, value]) => {
      if (parseInt(key) > index) {
        minCastsEnabledCopyShifted[parseInt(key) - 1] = value;
      } else {
        minCastsEnabledCopyShifted[parseInt(key)] = value;
      }
    })

    setMinTokenBalanceEnabled(minTokenBalanceEnabledCopyShifted);
    setMinCastsEnabled(minCastsEnabledCopyShifted);


    console.log("current points to token ratio")
    console.log(pageForm.getValues(`airdrops.${index}.pointsToTokenRatio`))
  }

  const onSubmit = async (values: CreateTipEngine) => {
    setLoadingNext(true);
    try {

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

        // toast({title: `Slug ${slug} is already taken`});
      }

      if (!tipStringAvailable) {
        anyErrors = true;
        pageForm.setError("tipEngine.tipString", { message: `${tipString} is already taken` });

        // toast({title: `Tip string ${tipString} is already taken`});
      }

      // check previous airdrop dates are before the next airdrop dates, we dont care about claim end date for any airdrop
      // how it works: airdrop1.startDate < airdrop1.claimStartDate < airdrop2.startDate < airdrop2.claimStartDate < airdrop3.startDate < airdrop3.claimStartDate and so on
      // we probably need a doulbe loop for this
      for (let i = 0; i < values.airdrops.length - 1; i++) {
        for (let j = i + 1; j < values.airdrops.length; j++) {
          const airdrop1 = values.airdrops[i];
          const airdrop2 = values.airdrops[j];

          if (airdrop1.startDate >= airdrop2.startDate) {
            anyErrors = true;
            pageForm.setError(`airdrops.${j}.startDate`, { message: "Start date must be after the previous airdrop's start date" });
          }

          if (airdrop1.claimStartDate >= airdrop2.claimStartDate) {
            anyErrors = true;
            pageForm.setError(`airdrops.${j}.claimStartDate`, { message: "Claim start date must be after the previous airdrop's claim start date" });
          }
        }
      }

      if (anyErrors) {
        setLoadingNext(false);
        return;
      }

      console.log(values);

      console.log("last clicked submit", lastClickedSubmit)

      const { tipEngineId, published } = await createTipEngine(values, lastClickedSubmit === "publish");
      console.log(tipEngineId, published);

      // toast({title: `Tip engine created successfully!`});

      // redirect to the tip engines
      router.push(`/engines`);
      
    } catch (e: any) {
      console.error(e);
      setLoadingNext(false);

      // toast({title: `Error creating tip engine`, description: e.message});
    }
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
                <Button variant="outline" size="xs" type="submit" name="draft" disabled={loadingNext} onClick={() => { setLastClickedSubmit("draft") }}>
                  {loadingNext && <Loader2 className={cn("h-4 w-4", "animate-spin")} />}
                  Safe as Draft
                </Button>
                <Button variant="highlight-primary" type="submit" form="page-form" disabled={loadingNext} name="publish" onClick={() => { setLastClickedSubmit("publish") }}>
                  {loadingNext ? (<Loader2 className={cn("h-4 w-4", "animate-spin")} />) : (<Save className="h-4 w-4" />)}
                  Publish
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
                                  onValueChange={(v: any) => { console.log(v); setRequiredChainId(Number(v)); field.onChange(v) }}
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
                              <FormMessage />
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
                              <SelectItem value="telegram" disabled>
                                Telegram
                                <Badge variant="outline" className="ml-auto sm:ml-0">
                                  Coming Soon
                                </Badge>
                              </SelectItem>
                              <SelectItem className="flex flex-auto" value="twitter" disabled>
                                Twitter
                                <Badge variant="outline" className="ml-auto sm:ml-0">
                                  Coming Soon
                                </Badge>
                              </SelectItem>
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
                                payfluence.io/{SLUG_CHAIN_NAMES[requiredChainId]}/{field.value}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">

                  <Card x-chunk="dashboard-07-chunk-0">
                    <CardHeader className="">
                      <CardTitle className="">
                        Asset Management
                      </CardTitle>
                      <CardDescription>
                        Select the token you want to distribute in airdrops. You can transfer funds later.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 gap">
                        <div className="grid gap-3">
                          {/* <WarningCard variant="warn" title="Owner only tokens">
                            You can only add tokens you have deployed from your connected wallet, or if you own the ERC20 smart contract.
                          </WarningCard> */}
                          {!isConnected && (
                            <WarningCard variant="info" title="No token yet :(">
                              You can select an ERC20 token by connecting your wallet.
                            </WarningCard>
                          )}
                          {isConnected && (
                            <div className="grid grid-cols-1 items-center gap-3">
                              {selectedToken && (<SimpleTokenCard token={selectedToken} />)}
                              <div className="flex flex-auto justify-center">
                                <TokenSelectorDialog
                                  title="Select Token"
                                  description="Select an ERC20 token to use for your tip engine"
                                  tokens={ownedTokens}
                                  callback={(tokenAddress) => { setSelectedTokenAddress(tokenAddress) }}
                                >
                                  <Button variant="outline" size="xs" type="button">
                                    {selectedToken ? "Change" : "Select"} Token
                                  </Button>
                                </TokenSelectorDialog>
                              </div>
                            </div>
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
                          <Button className="" size="xs" variant="outline" type="button" onClick={() => {appendAirdrop()}}>
                            <Plus className="h-3.5 w-3.5" />
                            Add
                          </Button>

                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 gap">

                        {/* <FormField
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
                        /> */}

                        <div className="grid gap-3">
                          {fields.map((airdrop, index) => (
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex flex-auto">
                                  <span className="flex flex-auto">
                                  Airdrop {index + 1}
                                  </span>
                                  <div className="flex flex-row space-x-2">
                                    <Button type="button" size="xs" variant="ghost" className="ml-auto" onClick={() => {appendAirdrop(index)}}>
                                      <Copy className="h-3.5 w-3.5" />
                                      Duplicate
                                    </Button>
                                    <Button type="button" size="xs" variant="ghost" className="ml-auto" disabled={fields.length === 1} onClick={() => removeAirdrop(index)}>
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid gap-6 gap">
                                  <div className="grid gap-3">
                                    <FormField
                                      key={`${airdrop.id}-${index}-1`}
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
                                      key={`${airdrop.id}-${index}-2`}
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
                                      key={`${airdrop.id}-${index}-3`}
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
                                      key={`${airdrop.id}-${index}-4`}
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
                                    Tip allowance is calculated by Payfluence against token total supply and user balance.
                                    </CardDescription>
                                    <WarningCard variant="warn" title="Farcaster linked wallet required">
                                      All participants must have at least one linked wallet that holds your token to be eligible for a daily allowance.
                                    </WarningCard>
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
                                    key={`${airdrop.id}-${index}-5`}
                                    control={pageForm.control}
                                    name={`airdrops.${index}.requireLegacyAccount`}
                                    render={({ field }) => (
                                      <FormItem className="grid gap-0">
                                        <div className="flex flex-row items-center gap-4">
                                          <FormControl>
                                            <Switch id="legacy-account"
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
                                    key={`${airdrop.id}-${index}-6`}
                                    control={pageForm.control}
                                    name={`airdrops.${index}.requirePowerBadge`}
                                    render={({ field }) => (
                                      <FormItem className="grid gap-0">
                                        <div className="flex flex-row items-center gap-4">
                                          <FormControl>
                                            <Switch id="power-badge"
                                              onCheckedChange={field.onChange}
                                              checked={field.value}
                                            />
                                          </FormControl>
                                          <div className={cn("flex flex-col gap-2", !field.value && "opacity-50")}>
                                            <FormLabel>Require Power Badge</FormLabel>
                                            <FormDescription>
                                              Participants must have a Power Badge on their Farcaster account, <Link href="https://warpcast.notion.site/Power-Badge-d81fea2e953e4dafae7c85295ffaf3ae" target="_blank" className="font-semibold underline cursor-pointer">read more</Link>.
                                            </FormDescription>
                                            <FormMessage />
                                          </div>
                                        </div>
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    key={`${airdrop.id}-${index}-7`}
                                    control={pageForm.control}
                                    name={`airdrops.${index}.minTokens`}
                                    render={({ field }) => (
                                      <div className="grid gap-0">
                                        <div className="flex flex-row items-center gap-4">
                                          <Switch id="min-tokens" checked={minTokenBalanceEnabled[index]} onCheckedChange={(checked) => handleMinTokenBalanceSwitchChange(index, checked)} />
                                          <div className={cn("flex flex-col gap-2 w-full", !minTokenBalanceEnabled[index] && "opacity-50")}>
                                            <Label>Min. Token Balance</Label>
                                            <CardDescription>
                                            Participants must hold a minimum balance of the funded token.
                                            </CardDescription>
                                          </div>
                                          <FormItem>
                                          <FormControl>
                                            <Input
                                              type="text"
                                              className="w-[120px]"
                                              disabled={!minTokenBalanceEnabled[index]}
                                              value={field.value}
                                              onChange={field.onChange}
                                            />
                                          </FormControl>
                                          </FormItem>
                                        </div>
                                        <FormMessage />
                                      </div>
                                    )}
                                  />
                                  <FormField
                                    key={`${airdrop.id}-${index}-8`}
                                    control={pageForm.control}
                                    name={`airdrops.${index}.minCasts`}
                                    render={({ field }) => (
                                      <FormItem className="grid gap-0">
                                        <div className="flex flex-auto items-center gap-4">
                                          <Switch id="min-casts" checked={minCastsEnabled[index]} onCheckedChange={(checked) => handleMinCastsRequiredSwitchChange(index, checked)} />
                                          <div className={cn("flex flex-col gap-2 w-full", !minCastsEnabled[index] && "opacity-50")}>
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
                                        <FormMessage />
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
  )
};
