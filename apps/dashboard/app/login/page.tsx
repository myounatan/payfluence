"use client";

import { Icons } from "@repo/ui/components/icons"
import Link from "next/link"

import {
  DynamicEmbeddedWidget,
  useIsLoggedIn,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { Separator } from "@ui/components/ui/separator";

export default function Login() {
  // const router = useRouter()

  // const { isLoggedIn, user } = useContext(UserContext) as UserContextType;

  // useEffect(() => {
  //   if (isLoggedIn && user?.email) {
  //     router.push('/dashboard')
  //   }
  // }, [isLoggedIn, router, user?.email])

  const isLoggedIn = useIsLoggedIn();
  const { user } = useDynamicContext();

  // hook to redirect user when logged in
  useEffect(() => {
    if (isLoggedIn && user?.email) {
      redirect('/engines')
    }
  }, [isLoggedIn, user?.email])

  return (
    <>
      <div className="container relative h-screen flex-col items-center justify-center p-20 sm:p-0 sm:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        
        
        <div className="relative hidden h-full flex-col p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-[#C89DFF]" />
          {/* <div className="relative z-20 flex items-center text-lg font-medium">
            Payfluence
          </div> */}
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;This library has saved me countless hours of work and
                helped me deliver stunning designs to my clients faster than
                ever before.&rdquo;
              </p>
              <footer className="text-sm">Sofia Davis</footer>
            </blockquote>
          </div>
        </div>
        <div className="pt-20 lg:p-8 relative">
       
          
          <div className="mx-auto flex w-full flex-col items-center justify-center space-y-6 w-[90%] sm:w-[60%] md:w-[50%]">
            <div className="flex flex-col space-y-2 text-center justify-center items-center">
              <Icons.payfluence className="" />
              <br />
              {/* <h1 className="text-2xl font-semibold tracking-tight">
                Sign in using your social account
              </h1>
              <p className="text-sm text-muted-foreground">
                Everyone who uses CampaignX is required to sign in with an existing Twitter/X&nbsp;account
              </p> */}
            </div>

            {isLoggedIn ? (
              <p className="text-center">Welcome&nbsp;<b>{user?.email}</b>! Redirecting&nbsp;you&nbsp;now...</p>
            ) : (
              <DynamicEmbeddedWidget />
            )}
            <Separator />
            <p className="px-8 text-center text-xs text-muted-foreground">
              By signing in, you agree to our{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy&nbsp;Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  )
}