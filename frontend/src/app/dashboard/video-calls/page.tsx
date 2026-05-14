"use client";

import React, { useState } from "react";
import { Video, Phone, Plus, Search, Calendar, MoreVertical, Shield, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function VideoCallsPage() {
  const router = useRouter();
  const [meetingCode, setMeetingCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMeetingId = () => {
    return Math.random().toString(36).substring(2, 7) + "-" + 
           Math.random().toString(36).substring(2, 7);
  };

  const handleNewMeeting = () => {
    const id = generateMeetingId();
    router.push(`/dashboard/video-calls/${id}`);
  };

  const [isJoining, setIsJoining] = useState(false);

  const handleJoinMeeting = (e?: React.FormEvent) => {
    e?.preventDefault();
    const input = meetingCode.trim();
    
    if (!input) {
      toast.error("Please enter a meeting code or link");
      return;
    }

    setIsJoining(true);

    try {
      let id = input;
      // If it's a full URL, extract the last path segment
      if (input.includes("://") || input.includes("/")) {
        const urlParts = input.split("/").filter(Boolean);
        id = urlParts[urlParts.length - 1];
      }

      // Final check to ensure we have an ID
      if (!id) throw new Error("Invalid ID");

      toast.success("Joining meeting...");
      router.push(`/dashboard/video-calls/${id}`);
    } catch (err) {
      toast.error("Invalid meeting link or code");
      setIsJoining(false);
    }
  };

  const handleCreateLink = () => {
    setIsGenerating(true);
    const id = generateMeetingId();
    const link = `${window.location.origin}/dashboard/video-calls/${id}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(link);
    toast.success("Meeting link copied to clipboard!");
    
    setTimeout(() => {
      setIsGenerating(false);
      router.push(`/dashboard/video-calls/${id}`);
    }, 1500);
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Video Conferencing</h1>
          <p className="text-muted-foreground mt-2">Start a new meeting or join an existing one.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button 
            onClick={handleNewMeeting}
            className="h-12 px-6 rounded-xl shadow-lg shadow-primary/20 gap-2"
           >
             <Plus className="h-5 w-5" /> New Meeting
           </Button>
           <Button variant="outline" className="h-12 px-6 rounded-xl gap-2">
             <Calendar className="h-5 w-5" /> Schedule
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active/Upcoming Meetings */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleJoinMeeting} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
              placeholder="Enter meeting code or link..." 
              className="pl-12 h-14 bg-card border-border rounded-2xl text-lg" 
            />
            <Button 
              type="submit" 
              disabled={isJoining}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 rounded-xl"
            >
              {isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join"}
            </Button>
          </form>

          <div className="bg-card/50 rounded-3xl border border-border overflow-hidden">
             <div className="p-6 border-b border-border bg-card/30">
                <h2 className="font-bold">Recent History</h2>
             </div>
             <div className="divide-y divide-border">
                <MeetingItem title="Project Kickoff" date="May 10, 2024" time="10:00 AM" participants={5} />
                <MeetingItem title="Design Review" date="May 09, 2024" time="03:30 PM" participants={3} />
                <MeetingItem title="Weekly Sync" date="May 08, 2024" time="09:00 AM" participants={12} />
                <MeetingItem title="Client Demo" date="May 07, 2024" time="11:00 AM" participants={2} />
             </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
           <div className="p-6 rounded-3xl bg-primary text-primary-foreground space-y-4 shadow-xl shadow-primary/10">
              <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Video className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Instant Meeting</h3>
                <p className="text-primary-foreground/80 text-sm mt-1">Get a link to share with others for an instant call.</p>
              </div>
              <Button 
                onClick={handleCreateLink}
                disabled={isGenerating}
                variant="secondary" 
                className="w-full h-11 rounded-xl font-bold"
              >
                {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Link"}
              </Button>
           </div>

           <div className="p-6 rounded-3xl border border-border bg-card/30 space-y-6">
              <h3 className="font-bold flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Security Features</h3>
              <div className="space-y-4">
                 <SecurityInfo icon={<Shield className="h-4 w-4" />} title="End-to-end encrypted" />
                 <SecurityInfo icon={<Globe className="h-4 w-4" />} title="Global low-latency" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function MeetingItem({ title, date, time, participants }: { title: string, date: string, time: string, participants: number }) {
  return (
    <div className="p-6 flex items-center justify-between hover:bg-accent/30 transition-colors">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
          <Video className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <h4 className="font-bold">{title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{date} • {time}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex -space-x-2">
          {[1,2,3].map(i => (
            <div key={i} className="h-8 w-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold">
              U{i}
            </div>
          ))}
          <div className="h-8 w-8 rounded-full border-2 border-card bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
            +{participants - 3}
          </div>
        </div>
        <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5 text-muted-foreground" /></Button>
      </div>
    </div>
  );
}

function SecurityInfo({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <div className="flex items-center gap-3 text-sm font-medium">
      <div className="h-7 w-7 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
        {icon}
      </div>
      {title}
    </div>
  );
}
