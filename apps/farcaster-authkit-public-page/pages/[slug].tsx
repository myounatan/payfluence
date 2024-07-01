"use client";

import { useRouter } from 'next/router'
import "@farcaster/auth-kit/styles.css";

import Head from "next/head";
import { useSession, signIn, signOut, getCsrfToken } from "next-auth/react";
import {
  SignInButton,
  AuthKitProvider,
  StatusAPIResponse,
} from "@farcaster/auth-kit";
import { useCallback, useState } from "react";
import { useWalletContext } from "@/context/WalletContext";
import { useAccount, useSendTransaction } from "wagmi";
import { Button } from "@ui/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@ui/components/ui/card";
import { truncate } from "@ui/lib/utils";
import { LogIn, LogOut } from "lucide-react";
import ConnectWalletDialog from "@/components/ConnectWalletDialog";
import { usePublicTipEngine, useRequestAirdropSignature } from '@/lib/queries';
import { Payfluence, Payfluence__factory } from '@repo/contracts';
import { CHAINS, CHAIN_ID_TO_WAGMI_CHAIN_ID } from '@/config/web3';
import { getAddress } from 'viem';
import WarningCard from '@/components/WarningCard';

const config = {
  relay: "https://relay.farcaster.xyz",
  rpcUrl: "https://mainnet.optimism.io",
  siweUri: "http://tips.payfluence.io/login",
  domain: "tips.payfluence.io",
};

function NoTipEngine() {
  return (
    <div>
      <h1>No Tip Engine</h1>
      <p>
        This page does not have a tip engine associated with it. Please check back later.
      </p>
    </div>
  );

}

export default function TipEnginePage() {
  const router = useRouter();

  const { disconnectWallet } = useWalletContext();
  const { address: walletAddress, isConnected, chainId } = useAccount();
  const [error, setError] = useState(false);

  const { data: claimAirdropHash, isPending: claimAirdropPending, sendTransaction: sendClaimAirdrop } = useSendTransaction() 
  

  const [farcasterId, setFarcasterId] = useState<number | undefined>(undefined);
  const [farcasterUsername, setFarcasterUsername] = useState<string | undefined>(undefined);
  const [farcasterPfp, setFarcasterPfp] = useState<string | undefined>(undefined);

  // get slug from URL
  let slug = router.query.slug;

  if (typeof slug === "object") {
    slug = slug[0];
  }

  console.log("slug", slug);
  console.log("fid", farcasterId);

  const { dailyAllowance, allowanceRemaining, tipEngine, totalPointsSentToday } = usePublicTipEngine(slug, walletAddress, farcasterId);

  const { requestSignature } = useRequestAirdropSignature(walletAddress, farcasterId, tipEngine?.airdrop?.id);

  const getNonce = useCallback(async () => {
    const nonce = await getCsrfToken();
    if (!nonce) throw new Error("Unable to generate nonce");
    return nonce;
  }, []);

  const handleSuccess = useCallback(
    (res: StatusAPIResponse) => {
      signIn("credentials", {
        message: res.message,
        signature: res.signature,
        name: res.username,
        pfp: res.pfpUrl,
        redirect: false,
      });

      setFarcasterId(res.fid);
      setFarcasterUsername(res.username);
      setFarcasterPfp(res.pfpUrl);
    },
    []
  );

  const claimAirdrop = async () => {
    if (tipEngine === undefined || walletAddress === undefined || claimAirdropPending === true || claimAirdropHash !== undefined) {
      return;
    }

    const {signature, message} = await requestSignature();

    if (message === null) {
      console.error("Error getting signature");
      return;
    }

    // const transformedMessage = {
    //   ...message,
    //   amountClaimable: BigInt(message.amountClaimable),
    //   token: getAddress(message.token),
    // }
    // console.log("transformedMessage", transformedMessage)

    sendClaimAirdrop({
      chainId: CHAIN_ID_TO_WAGMI_CHAIN_ID[tipEngine.chainId],
      to: CHAINS[tipEngine.chainId].payfluenceContract,
      data: Payfluence__factory.createInterface().encodeFunctionData('claimAirdrop', [Buffer.from(signature.substring(2), "hex"), message]) as `0x${string}`,
    })
  }

  const today = new Date();
  console.log(today.toString())

  return (    <>
    <Head>
      <title>Public Page Demo</title>
    </Head>
    <main className='flex flex-auto w-screen h-screen justify-center'>
      <AuthKitProvider config={config}>
    <div className='flex'>
      {/* HEADER */}
      <div className="fixed top-[12px] right-[12px] flex flex-auto items-center gap-2">
        {isConnected ? (
            <Button className="" variant="outline" onClick={disconnectWallet} suppressHydrationWarning>
              <span suppressHydrationWarning>{truncate(walletAddress)}</span>
              <LogOut className="w-4 h-4 ml-2" suppressHydrationWarning/>
            </Button>
        ) : (
          <ConnectWalletDialog title="Connect Wallet" description="Connect your wallet via desktop or mobile.">
            <Button className="" variant="highlight-primary" suppressHydrationWarning>
              <span suppressHydrationWarning>Connect Wallet</span>
              <LogIn className="w-4 h-4 ml-2" suppressHydrationWarning/>
            </Button>
          </ConnectWalletDialog>
        )}
        {farcasterId ? (
          <Button className="" variant="highlight-primary" suppressHydrationWarning onClick={() => signOut()}>
            <span suppressHydrationWarning>{farcasterUsername}</span>
            <LogOut className="w-4 h-4 ml-2" suppressHydrationWarning/>
          </Button>
        ) : (
          <SignInButton
            nonce={getNonce}
            onSuccess={handleSuccess}
            onError={() => setError(true)}
            onSignOut={() => signOut()}
          />
        )}
        {error && <div>Unable to sign in at this time.</div>}
      </div>

      {/* MAIN CONTENT */}
      <div className='flex flex-col items-center justify-center gap-4'>
        {tipEngine && (
          <>
            <span className='text-2xl font-semibold'>
              {tipEngine.name}
            </span>
            <span className='text-2xl'>
              {tipEngine.tipString}
            </span>
          </>
        )}
        {tipEngine?.airdrop && (
          <>
            <div>
              <p>Airdrop start date: {tipEngine.airdrop?.startDate.toString()}</p>
            </div>
            <div>
              <p>Airdrop claim start date: {tipEngine.airdrop?.claimStartDate.toString()}</p>
            </div>
            <div className='flex flex-col'>
              <span className='text-lg font-semibold'>Participation Requirements</span>
              <p>Min. Casts: {tipEngine.airdrop?.minCasts}</p>
              <p>Account created before Airdrop start date: {tipEngine.airdrop?.requireLegacyAccount === true ? "Yes" : "No"}</p>
              <p>Must have a power badge: {tipEngine.airdrop?.requirePowerBadge === true ? "Yes" : "No"}</p>
            </div>
          </>
        )}
        {!tipEngine && <NoTipEngine />}
        <div className='flex flex-row items-center justify-center gap-2'>
          <Card>
            <CardHeader>
              Daily Allowance
              <CardDescription>
                The total amount of points you can tip today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>{dailyAllowance}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              Allowance Remaining Today
              <CardDescription>
                The amount of points remaining for you to tip today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>{allowanceRemaining}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              Total Points Received
              <CardDescription>
                The total amount of points you have received during the current airdrop
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>{allowanceRemaining}</p>
            </CardContent>
          </Card>
        </div>

        {farcasterId ? (
          tipEngine?.airdrop && (
            <>
              {new Date(tipEngine.airdrop?.claimStartDate.toString()) > today ? (
                <Button disabled>
                  Airdrop Claim Not Started
                </Button>
              ) : (
                <Button onClick={claimAirdrop}>
                Claim Airdrop
                </Button>
              )}
            </>
          )
        ) : (
          <>
            <WarningCard variant="warn" title='Sign In Required' description='Sign in to Farcaster and your Wallet to claim airdrops and view stats.' />
          </>
        )}

        {/* {(tipEngine?.airdrop?.claimStartDate !== undefined && tipEngine.airdrop.claimStartDate < today) && (
          <Button>
            Check Eligibility
          </Button>
        )}

        {(tipEngine.airdrop.claimStartDate > today) && (
          <Button disabled>
            Airdrop Claim Not Started
          </Button>
        )} */}
        
        {/* <Profile /> */}
        
      </div>
    </div>
        
      </AuthKitProvider>
    </main>
  </>
  );
}

function Profile() {
  const { data: session } = useSession();

  return session ? (
    <div style={{ fontFamily: "sans-serif" }}>
      <p>Signed in as {session.user?.name}</p>
      <p>
        <button
          type="button"
          style={{ padding: "6px 12px", cursor: "pointer" }}
          onClick={() => signOut()}
        >
          Click here to sign out
        </button>
      </p>
    </div>
  ) : (
    <p>
      Click the &quot;Sign in with Farcaster&quote; button above, then scan the QR code to
      sign in.
    </p>
  );
}
