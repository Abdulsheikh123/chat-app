"use client";

import React, { use } from "react";
import VideoRoom from "@/components/video-call/VideoRoom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function VideoCallPage({ params }: { params: Promise<{ roomID: string }> }) {
  const { roomID } = use(params);
  const [user, setUser] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.data.success) {
          setUser(res.data.data.user || res.data.data);
        }
      } catch (error) {
        toast.error("Please login to join the call");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white gap-4">
        <p className="text-xl font-bold">Authentication Required</p>
        <Link href="/login">
          <Button>Go to Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-black">
      <div className="absolute top-4 left-4 z-50">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="bg-black/20 text-white backdrop-blur-md hover:bg-black/40">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Exit Room
          </Button>
        </Link>
      </div>
      
      <VideoRoom 
        roomID={roomID} 
        userID={user.id} 
        userName={user.name} 
      />
    </div>
  );
}
