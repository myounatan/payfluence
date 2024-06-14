
import { Icons } from "@repo/ui/components/icons";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@repo/ui/components/ui/card";
import { Coins, Key, PlusCircleIcon, Settings } from "lucide-react";
import Link from "next/link";

export interface SidebarNavProps {
  activeMenu: string
  activeSubMenu?: string
}

export default function SidebarNav({ activeMenu, activeSubMenu }: SidebarNavProps) {
  return (
    <div className="grid min-h-screen w-full grid-cols-[220px_1fr] lg:grid-cols-[220px_1fr] bg-slate-100">
      <div className="hidden border-r bg-slate-50 md:block border-slate-200">
        <div className="flex h-full max-h-screen flex-col">
          <div className="flex h-14 items-center px-4 lg:h-[60px] lg:px-6 justify-center">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Icons.payfluence className="h-24 w-24" />
            </Link>
            {/* <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button> */}
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Button className="flex items-center gap-2" variant="highlight-primary">
                <PlusCircleIcon className="h-4 w-4" />
                New Tip Engine
              </Button>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Coins className="h-4 w-4" />
                Tip Engines
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 pointer-events-none"
              >
                <Key className="h-4 w-4" />
                API Keys
                <p className="ml-auto text-xs flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                  coming soon
                </p>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg bg-slate-700 px-3 py-2 text-slate-50 transition-all hover:text-slate-50"
              >
                <Settings className="h-4 w-4" />
                Settings{" "}
              </Link>
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Card x-chunk="dashboard-02-chunk-0">
              <CardHeader className="p-2 pt-0 md:p-4">
                <CardTitle>Upgrade to Pro</CardTitle>
                <CardDescription>
                  Unlock all features and get unlimited access to our support
                  team.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                <Button size="sm" className="w-full">
                  Upgrade
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}