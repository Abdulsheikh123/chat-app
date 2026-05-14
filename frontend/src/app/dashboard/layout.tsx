"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  LogOut, 
  User, 
  Video, 
  MessageSquare, 
  Settings, 
  Menu, 
  X, 
  Bell, 
  Search, 
  Loader2, 
  LogIn,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import GlobalAIAssistant from "@/components/AIAssistant";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.data.success) {
          setUser(res.data.data.user || res.data.data);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAction = (actionName: string, href: string) => {
    if (!user) {
      toast.error(`Please login to access ${actionName}`, {
        description: "You need an account to use this feature.",
        action: {
          label: "Login",
          onClick: () => router.push("/login")
        }
      });
      return;
    }
    router.push(href);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      toast.success("Logged out successfully");
      setUser(null);
      router.push("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005").replace(/\/api$/, "");
  const profileImageUrl = user?.profileImage 
    ? `${apiBaseUrl}${user.profileImage}`
    : null;

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 p-6 flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between mb-10 px-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold tracking-tight">ChatApp</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarItem 
            icon={<Home className="h-5 w-5" />} 
            label="Home" 
            active={pathname === "/dashboard"} 
            onClick={() => router.push("/dashboard")} 
          />
          <SidebarItem 
            icon={<MessageSquare className="h-5 w-5" />} 
            label="Chats" 
            active={pathname === "/dashboard/chats"} 
            onClick={() => handleAction("Chats", "/dashboard/chats")} 
          />
          <SidebarItem 
            icon={<Video className="h-5 w-5" />} 
            label="Video Calls" 
            active={pathname === "/dashboard/video-calls"} 
            onClick={() => handleAction("Video Calls", "/dashboard/video-calls")} 
          />
          <SidebarItem 
            icon={<User className="h-5 w-5" />} 
            label="Contacts" 
            active={pathname === "/dashboard/contacts"} 
            onClick={() => handleAction("Contacts", "/dashboard/contacts")} 
          />
          <SidebarItem 
            icon={<Settings className="h-5 w-5" />} 
            label="Settings" 
            active={pathname === "/dashboard/settings"} 
            onClick={() => handleAction("Settings", "/dashboard/settings")} 
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-border">
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user ? user.name : "Guest User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user ? user.email : "login to sync data"}</p>
            </div>
          </div>
          
          {user ? (
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 text-destructive border-destructive/20 hover:bg-destructive/10 rounded-xl"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" /> Logout
            </Button>
          ) : (
            <Button 
              variant="default" 
              className="w-full justify-start gap-3 rounded-xl shadow-lg shadow-primary/20"
              onClick={() => router.push("/login")}
            >
              <LogIn className="h-5 w-5" /> Sign In
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-20 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            <div className="flex items-center gap-2 lg:hidden">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold tracking-tight">ChatApp</span>
            </div>

            <div className="hidden md:flex items-center relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search chats..." 
                className="pl-10 h-10 bg-background/50"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {user && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />}
            </Button>
            
            <div className="hidden lg:flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user ? user.name : "Guest"}</p>
                <p className="text-xs text-muted-foreground">{user ? user.email : "Not signed in"}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden shadow-sm">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-6 w-6 text-primary" />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto relative">
          {children}
        </div>
        
        {/* Global AI Help Assistant */}
        <GlobalAIAssistant />
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <Button 
      variant={active ? "secondary" : "ghost"} 
      className={cn(
        "w-full justify-start gap-3 rounded-xl h-12",
        active ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground hover:text-foreground"
      )}
      onClick={onClick}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Button>
  );
}
