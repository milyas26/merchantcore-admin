import * as React from "react";
import { AppSidebar } from "./app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface AppLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: {
    title: string;
    href?: string;
  }[];
}

export function AppLayout({ children, breadcrumbs = [] }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur transition-[width,height] ease-linear">
          <div className="flex items-center gap-2">
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((breadcrumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  return (
                    <React.Fragment key={breadcrumb.title}>
                      <BreadcrumbItem>
                        {breadcrumb.href ? (
                          <BreadcrumbLink
                            href={breadcrumb.href}
                            className={isLast ? "font-semibold text-md" : ""}
                          >
                            {breadcrumb.title}
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage
                            className={isLast ? "font-semibold text-md" : ""}
                          >
                            {breadcrumb.title}
                          </BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && (
                        <BreadcrumbSeparator />
                      )}
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
