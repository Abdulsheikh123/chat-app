"use client";

import React, { useEffect, useState } from "react";
import { 
  Video, 
  MessageSquare, 
  User, 
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function OverviewPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.data.success) {
          setUser(res.data.data.user || res.data.data);
        }
      } catch (error) {
        setUser(null);
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

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <section>
        <h1 className="text-2xl sm:text-3xl font-bold">
          {user ? `Good morning, ${user.name}!` : "Welcome to ChatApp!"}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          {user ? "Check your recent activities and messages." : "Sign in to connect with your friends and start chatting."}
        </p>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatsCard label="Total Contacts" value={user ? "12" : "0"} />
        <StatsCard label="Active Chats" value={user ? "4" : "0"} primary />
        <StatsCard label="Pending Invites" value={user ? "2" : "0"} />
      </div>

      {/* Recent Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Recent Conversations</h2>
              <Button variant="link" className="text-primary font-semibold" onClick={() => handleAction("Recent Conversations", "/dashboard/chats")}>View all</Button>
           </div>
           <div className="p-10 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center text-center bg-card/30">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No active messages</h3>
              <p className="text-muted-foreground text-sm max-w-xs">Once you start a conversation, they will appear here.</p>
              <Button 
                className="mt-6 px-8 rounded-full shadow-lg shadow-primary/20"
                onClick={() => handleAction("Start New Chat", "/dashboard/chats")}
              >
                Start New Chat
              </Button>
          </div>
        </div>

        <div className="space-y-6">
           <h2 className="text-xl font-bold">Quick Actions</h2>
           <div className="grid grid-cols-1 gap-3">
              <ActionButton 
                icon={<Video className="text-blue-500" />} 
                label="New Meeting" 
                onClick={() => handleAction("New Meeting", "/dashboard/video-calls")}
              />
              <ActionButton 
                icon={<User className="text-purple-500" />} 
                label="Add Friend" 
                onClick={() => handleAction("Add Friend", "/dashboard/contacts")}
              />
              <ActionButton 
                icon={<Bell className="text-orange-500" />} 
                label="Announcements" 
                onClick={() => handleAction("Announcements", "/dashboard")}
              />
           </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, primary = false }: { label: string, value: string, primary?: boolean }) {
  return (
    <div className={cn(
      "p-6 rounded-3xl border transition-all hover:shadow-xl hover:-translate-y-1",
      primary ? "bg-primary text-primary-foreground border-primary/20" : "bg-card border-border"
    )}>
      <h3 className={cn("text-sm font-medium mb-2", primary ? "text-primary-foreground/80" : "text-muted-foreground")}>{label}</h3>
      <p className="text-4xl font-bold">{value}</p>
    </div>
  );
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <Button 
      variant="outline" 
      className="w-full h-16 justify-start gap-4 p-4 rounded-2xl border-border bg-card/50 hover:bg-accent transition-all text-base font-semibold"
      onClick={onClick}
    >
      <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center shadow-sm">
        {icon}
      </div>
      {label}
    </Button>
  );
}
