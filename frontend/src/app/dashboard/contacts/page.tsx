"use client";

import React, { useEffect, useState } from "react";
import { UserPlus, Search, Mail, Phone, MoreHorizontal, Filter, Grid, List, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ContactsPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/auth/users");
        if (res.data.success) {
          setUsers(res.data.data);
        }
      } catch (error) {
        toast.error("Failed to load contacts");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.number?.includes(searchQuery)
  );

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground mt-1">Manage and connect with your registered users.</p>
        </div>
        <Button className="h-12 px-6 rounded-xl shadow-lg shadow-primary/20 gap-2">
          <UserPlus className="h-5 w-5" /> Add New Contact
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/30 p-4 rounded-2xl border border-border">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email or phone..." 
            className="pl-10 bg-background border-border rounded-xl" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" size="icon" className="rounded-xl"><Filter className="h-4 w-4" /></Button>
          <div className="h-8 w-px bg-border mx-1" />
          <Button variant="secondary" size="icon" className="rounded-xl"><Grid className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="rounded-xl"><List className="h-4 w-4" /></Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <ContactCard 
              key={user.id} 
              user={user} 
              onChat={() => router.push(`/dashboard/chats?userId=${user.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-60 text-center">
           <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
           </div>
           <h3 className="text-lg font-bold">No contacts found</h3>
           <p className="text-muted-foreground">Try searching for someone else or invite them to the app.</p>
        </div>
      )}
    </div>
  );
}

function ContactCard({ user, onChat }: { user: any, onChat: () => void }) {
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005").replace(/\/api$/, "");
  const profileImageUrl = user.profileImage 
    ? `${baseUrl}${user.profileImage}`
    : null;

  return (
    <div className="bg-card border border-border rounded-3xl p-6 transition-all hover:shadow-xl hover:border-primary/20 group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="h-5 w-5" /></Button>
      </div>
      
      <div className="flex items-start gap-4 mb-6">
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden text-xl font-bold text-primary">
            {profileImageUrl ? (
              <img src={profileImageUrl} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user.name.split(' ').map((n: string) => n[0]).join('')
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card bg-green-500" />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-lg truncate">{user.name}</h3>
          <p className="text-sm text-primary font-medium">Chat User</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span className="truncate">{user.email}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span>{user.number || "No number provided"}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
         <Button 
          variant="secondary" 
          className="rounded-xl h-10 font-bold text-xs uppercase tracking-wider gap-2"
          onClick={onChat}
         >
           <MessageSquare className="h-3 w-3" /> Message
         </Button>
         <Button variant="outline" className="rounded-xl h-10 font-bold text-xs uppercase tracking-wider">Profile</Button>
      </div>
    </div>
  );
}
