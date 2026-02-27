"use client"

import * as React from "react"
import {
    LayoutDashboard,
    Users,
    Briefcase,
    CircleDollarSign,
    FileText,
    FileCode,
    Settings,
    Plus,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarFooter,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const data = {
    navMain: [
        {
            title: "Overview",
            url: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Clients",
            url: "/clients",
            icon: Users,
        },
        {
            title: "Projects",
            url: "/projects",
            icon: Briefcase,
        },
        {
            title: "Finance",
            url: "/finance",
            icon: CircleDollarSign,
        },
    ],
    secondary: [
        {
            title: "Reports",
            url: "/reports",
            icon: FileText,
        },
        {
            title: "Templates",
            url: "/templates",
            icon: FileCode,
        },
        {
            title: "Users",
            url: "/users",
            icon: Users,
        },
    ],
    settings: [
        {
            title: "Settings",
            url: "/settings",
            icon: Settings,
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <CircleDollarSign className="h-5 w-5" />
                    </div>
                    <span className="group-data-[collapsible=icon]:hidden">Creo AI OS</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Management</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {data.navMain.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title}>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Resources</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {data.secondary.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title}>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <a href="/settings">
                                <Settings />
                                <span>Settings</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem className="px-2 py-4">
                        <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                            <Avatar className="h-8 w-8 border">
                                <AvatarImage src="" />
                                <AvatarFallback>AD</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col text-sm truncate">
                                <span className="font-medium text-foreground">Admin User</span>
                                <span className="text-muted-foreground text-xs">admin@creoai.studio</span>
                            </div>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
