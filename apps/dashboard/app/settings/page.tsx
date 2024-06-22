"use client";

import Link from "next/link"
import Image from "next/image";
import SidebarNav from "@/components/SidebarNav";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@repo/ui/components/ui/breadcrumb";
import { Button } from "@repo/ui/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuCheckboxItem } from "@repo/ui/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@ui/components/ui/card";
import { ListFilter, PlusCircle, MoreHorizontal, File, Plus, Filter, Info } from "lucide-react";
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
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/components/ui/tooltip";
import WarningCard from "@/components/WarningCard";

const breadcrumbLinks = [
  { route: "#", label: "Settings" },
]

export default function TipEngines() {
  return (
    <div className="grid min-h-screen w-full grid-cols-[220px_1fr] lg:grid-cols-[220px_1fr] bg-slate-100">

      <SidebarNav activeMenu="settings" activeSubMenu="profile" />

      <div className="flex flex-col sm:gap-4 sm:py-4">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Breadcrumbs links={breadcrumbLinks} />
          <div className="relative ml-auto flex-1 md:grow-0">
            {/* <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            /> */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <Image
                  src="/placeholder-user.jpg"
                  width={36}
                  height={36}
                  alt="Avatar"
                  className="overflow-hidden rounded-full"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>


        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          
        </main>
      </div>

    </div>
  )
}