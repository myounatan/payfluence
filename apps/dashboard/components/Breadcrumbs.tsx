import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@ui/components/ui/breadcrumb"
import Link from "next/link"

export interface BreadcrumbsProps {
  links: {
    route: string
    label: string
  }[]
}

export default function Breadcrumbs({ links }: BreadcrumbsProps) {

  if (links.length < 2) {
    return null
  }

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        {links.map((link, index) => (
          <>
            {index < links.length - 1 ? (
              <>
                <BreadcrumbItem key={index}>
                  <BreadcrumbLink asChild>
                    <Link href={link.route}>{link.label}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator/>
              </>
            ) : (
              <BreadcrumbItem key={index}>
                <BreadcrumbPage>{link.label}</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}