"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { LogOut } from "lucide-react";
import { ALL_MENU_ITEMS, getMenuItemsByDepartment } from "@/config/navConfig";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      router.push("/");
    } else {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // Phân quyền menu
      const allowedItems = getMenuItemsByDepartment(
        userData.department_code,
        userData.role
      );
      setMenuItems(allowedItems);
    }
  }, [router]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      localStorage.clear();
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      localStorage.clear();
      router.push("/");
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        {/* Sidebar */}
        <Sidebar side="left" variant="sidebar" collapsible="icon">
          <SidebarContent className="flex flex-col h-full">
            {/* Logo cố định trên cùng */}
            <div className="flex items-center justify-center h-22 p-0">
              <img
                src="/logo/pladivo-logo.png"
                alt="Dashboard Logo"
                className="h-16 w-auto"
              />
            </div>

            {/* Menu */}
            <SidebarGroup className="flex-1 overflow-y-auto">
              <SidebarMenu>
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.path}>
                          <IconComponent className="mr-2" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>

            {/* Logout cố định dưới cùng */}
            <SidebarGroup className="mt-auto">
              <SidebarMenu>
                <SidebarMenuItem>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2" />
                    Đăng xuất
                  </Button>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Nội dung trang */}
        <SidebarInset className="flex-1 p-6 overflow-y-auto bg-muted/20">
          {children}
          <Toaster />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
