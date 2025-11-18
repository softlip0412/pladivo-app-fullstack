"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

import {
  Home,
  UserCircle,
  UserCog,
  Settings2,
  ClipboardList,
  CalendarRange,
  Stamp,
  Handshake,
  FileSignature,
  BadgeCheck,
  Ticket,
  TicketCheck,
  ChartBar,
  LogOut,
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      router.push("/");
    } else {
      setUser(JSON.parse(savedUser));
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
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard">
                      <Home className="mr-2" />
                      <span>Trang chủ</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/users">
                      <UserCircle className="mr-2" />
                      <span>Người dùng</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/staffs">
                      <UserCog className="mr-2" />
                      <span>Nhân sự</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/services">
                      <Settings2 className="mr-2" />
                      <span>Dịch vụ</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/bookings">
                      <ClipboardList className="mr-2" />
                      <span>Đơn đặt</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/event-plans">
                      <CalendarRange className="mr-2" />
                      <span>Kế hoạch</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/event-approvals">
                      <Stamp className="mr-2" />
                      <span>Phê duyệt Kế hoạch</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/customers">
                      <FileSignature className="mr-2" />
                      <span>Khách Hàng & Hợp Đồng</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/partners">
                      <Handshake className="mr-2" />
                      <span>Đối tác</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/task-evaluation">
                      <BadgeCheck className="mr-2" />
                      <span>Đánh giá công việc</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/ticket-management">
                      <Ticket className="mr-2" />
                      <span>Quản lý bán vé</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/ticket-sales">
                      <TicketCheck className="mr-2" />
                      <span>Bán vé</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard/ticket-reports">
                      <ChartBar className="mr-2" />
                      <span>Thống kê bán vé</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
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
