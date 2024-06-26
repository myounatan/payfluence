"use client";

import { useState, useEffect } from "react";
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
import { cn } from "@ui/lib/utils";
import { Input } from "@ui/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage, } from "@ui/components/ui/form"

import { Label } from "@ui/components/ui/label";

import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

const breadcrumbLinks = [
  { route: "#", label: "Settings" },
]

const profileFormSchema = z.object({
  first_name: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(30, {
      message: "Username must not be longer than 30 characters.",
    }),
  last_name: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(30, {
      message: "Username must not be longer than 30 characters.",
    }),
  username: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(30, {
      message: "Username must not be longer than 30 characters.",
    }),
  email: z
    .string({
      required_error: "Must be a valid email address.", // update to check for valid email address,
    })
    .email(),
  bio: z.string().max(160).min(4),
  urls: z
    .array(
      z.object({
        value: z.string().url({ message: "Please enter a valid URL." }),
      })
    )
    .optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

// This can come from your database or API.
const defaultValues: Partial<ProfileFormValues> = {
  bio: "I own a computer.",
  urls: [
    { value: "https://shadcn.com" },
    { value: "http://twitter.com/shadcn" },
  ],
}

const products = [
  {
    name: 'Basic',
    description: 'At most one active tip engine',
    productId: '419750',
  },
  {
    name: 'Pro',
    description: 'Many active tip engines',
    productId: '419751',
  },
]

export default function Settings() {

  const { user } = useDynamicContext();

  async function getCheckoutUrl() {
    const res = await fetch("https://lemonsqueezy.matyounatan.workers.dev/checkout/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user?.email,
        productId: "<the product id>?>"
      })
    })
  
    const data = await res.json()
  
    console.log(data)
  
    data.data.checkoutUrl // check how to 
    
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  })

  const { fields, append } = useFieldArray({
    name: "urls",
    control: form.control,
  })

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/lemonsqueezy/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleCheckout = async (productId: string) => {
    try {
      const response = await fetch(`/api/lemonsqueezy/checkout?product_id=${productId}`);
      const { checkout_url } = await response.json();
      window.location.href = checkout_url;
    } catch (error) {
      console.error('Error initiating checkout:', error);
    }
  };

  function onSubmit(data: ProfileFormValues) {
  {/* toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    }) */}
  }
  
  return (
    <div className="grid min-h-screen w-full grid-cols-[220px_1fr] lg:grid-cols-[220px_1fr] bg-slate-100">

      <SidebarNav activeMenu="settings" />

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
              <DropdownMenuLabel>Profile</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
          
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="account">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="subscription">Subscription</TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                {/* <Button size="sm" variant="outline" className="h-8 gap-1">
                  <File className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Export
                  </span>
                </Button> */}
              </div>
            </div>

            {/* account settings */}
            <TabsContent value="account">
              <Card x-chunk="dashboard-06-chunk-0">
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                  <CardDescription>
                    Manage your profile and account settings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                      <div className="grid grid-cols-2 space-x-6">
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="shad" {...field} />
                          </FormControl>
                          <FormDescription>
                            This is your first name.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                        )}
                      />
                    
                      <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="cn" {...field} />
                          </FormControl>
                          <FormDescription>
                            This is your last name.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                        )}
                      />
                      </div>
                  
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="shadcn" {...field} />
                            </FormControl>
                            <FormDescription>
                              This is your public display name.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="shadcn@email.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              This is your email address.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                <Button type="submit">Update Profile</Button>
                      

                      {/*<FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a verified email to display" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="m@example.com">m@example.com</SelectItem>
                                <SelectItem value="m@google.com">m@google.com</SelectItem>
                                <SelectItem value="m@support.com">m@support.com</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              You can manage verified email addresses in your{" "}
                              <Link href="/examples/forms">email settings</Link>.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <div>
                        {fields.map((field, index) => (
                          <FormField
                            control={form.control}
                            key={field.id}
                            name={`urls.${index}.value`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className={cn(index !== 0 && "sr-only")}>
                                  URLs
                                </FormLabel>
                                <FormDescription className={cn(index !== 0 && "sr-only")}>
                                  Add links to your website, blog, or social media profiles.
                                </FormDescription>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => append({ value: "" })}
                        >
                          Add URL
                        </Button>
                      </div> */}
                      
                    </form>
                  </Form>
                </CardContent>
                <CardFooter>
                  <div className="text-xs text-muted-foreground">
                    Made with ♥ by the Payfluence Team.
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* subscription settings */}
            <TabsContent value="subscription">
              <Card x-chunk="dashboard-06-chunk-0">
                <CardHeader>
                  <CardTitle>Subscription</CardTitle>
                  <CardDescription>
                    Manage your subscription and billing information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subscription</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Price
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Billing Cycle
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Renewal Date
                        </TableHead>
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">
                            Basic
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">Active</Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            $9.99
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            Monthly
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            2024-07-12
                          </TableCell>
                        </TableRow>
                      </TableBody>
                  </Table>
                  <Button type="submit" onClick={() => getCheckoutUrl()}>Manage Subscription</Button>
                </CardContent>
                <CardFooter>
                  <div className="text-xs text-muted-foreground">
                    Made with ♥ by the Payfluence Team.
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}