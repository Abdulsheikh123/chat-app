"use client";

import React, { useState, useEffect } from "react";
import { User, Bell, Lock, Eye, Globe, Palette, Shield, CreditCard, ChevronRight, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Account");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme from document class
  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-5xl mx-auto pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and application settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Tabs */}
        <div className="space-y-2">
           <SettingsNav 
            icon={<User className="h-5 w-5" />} 
            label="Account" 
            active={activeTab === "Account"} 
            onClick={() => setActiveTab("Account")} 
           />
           <SettingsNav 
            icon={<Bell className="h-5 w-5" />} 
            label="Notifications" 
            active={activeTab === "Notifications"}
            onClick={() => setActiveTab("Notifications")}
           />
           <SettingsNav 
            icon={<Lock className="h-5 w-5" />} 
            label="Privacy & Security" 
            active={activeTab === "Privacy"}
            onClick={() => setActiveTab("Privacy")}
           />
           <SettingsNav 
            icon={<Palette className="h-5 w-5" />} 
            label="Appearance" 
            active={activeTab === "Appearance"}
            onClick={() => setActiveTab("Appearance")}
           />
           <SettingsNav 
            icon={<Shield className="h-5 w-5" />} 
            label="Accessibility" 
            active={activeTab === "Accessibility"}
            onClick={() => setActiveTab("Accessibility")}
           />
           <SettingsNav 
            icon={<CreditCard className="h-5 w-5" />} 
            label="Billing" 
            active={activeTab === "Billing"}
            onClick={() => setActiveTab("Billing")}
           />
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-8">
           {activeTab === "Account" && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Profile Section */}
                <div className="bg-card/30 border border-border rounded-3xl p-8 space-y-8">
                   <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                      <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 text-3xl font-bold text-primary relative group cursor-pointer overflow-hidden">
                         JD
                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Palette className="h-6 w-6 text-white" />
                         </div>
                      </div>
                      <div className="flex-1 space-y-2">
                         <h3 className="text-xl font-bold">Public Profile</h3>
                         <p className="text-sm text-muted-foreground">Manage how your profile appears to others in the app.</p>
                         <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="outline" className="rounded-lg">Upload Photo</Button>
                            <Button size="sm" variant="ghost" className="rounded-lg text-destructive">Remove</Button>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-sm font-bold px-1">Display Name</label>
                         <input type="text" placeholder="John Doe" className="w-full h-12 bg-background border border-border rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-bold px-1">Username</label>
                         <input type="text" placeholder="johndoe_dev" className="w-full h-12 bg-background border border-border rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                         <label className="text-sm font-bold px-1">Bio</label>
                         <textarea placeholder="Tell us about yourself..." className="w-full h-32 bg-background border border-border rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none" />
                      </div>
                   </div>
                </div>

                {/* Preferences Section */}
                <div className="space-y-4">
                   <h3 className="text-lg font-bold px-1">Security Settings</h3>
                   <div className="bg-card/30 border border-border rounded-3xl overflow-hidden divide-y divide-border">
                      <SettingsToggle icon={<Lock className="h-5 w-5" />} title="Two-Factor Authentication" description="Add an extra layer of security to your account." />
                      <SettingsToggle icon={<Eye className="h-5 w-5" />} title="Profile Visibility" description="Allow others to find your profile via search." enabled />
                   </div>
                </div>
             </div>
           )}

           {activeTab === "Appearance" && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-card/30 border border-border rounded-3xl p-8 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold">Theme</h3>
                    <p className="text-sm text-muted-foreground">Customize how the application looks for you.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      onClick={() => isDarkMode && toggleTheme()}
                      className={cn(
                        "p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all",
                        !isDarkMode ? "border-primary bg-primary/5" : "border-border bg-card/50 hover:border-muted-foreground/30"
                      )}
                    >
                      <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500">
                        <Sun className="h-6 w-6" />
                      </div>
                      <span className="font-bold">Light Mode</span>
                    </button>

                    <button 
                      onClick={() => !isDarkMode && toggleTheme()}
                      className={cn(
                        "p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all",
                        isDarkMode ? "border-primary bg-primary/5" : "border-border bg-card/50 hover:border-muted-foreground/30"
                      )}
                    >
                      <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-500">
                        <Moon className="h-6 w-6" />
                      </div>
                      <span className="font-bold">Dark Mode</span>
                    </button>
                  </div>

                  <div className="bg-card/30 border border-border rounded-3xl overflow-hidden divide-y divide-border mt-8">
                     <SettingsToggle 
                        icon={isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />} 
                        title="Dark Mode" 
                        description="Switch between light and dark themes." 
                        enabled={isDarkMode}
                        onToggle={toggleTheme}
                     />
                  </div>
                </div>
             </div>
           )}

           <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" className="rounded-xl h-12 px-8 font-bold">Discard Changes</Button>
              <Button className="rounded-xl h-12 px-10 font-bold shadow-lg shadow-primary/20">Save Settings</Button>
           </div>
        </div>
      </div>
    </div>
  );
}

function SettingsNav({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-4 rounded-2xl transition-all",
        active ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
      )}
    >
      <div className="flex items-center gap-3 font-bold text-sm">
        {icon}
        {label}
      </div>
      <ChevronRight className={cn("h-4 w-4", active ? "text-primary-foreground" : "text-muted-foreground/50")} />
    </button>
  );
}

function SettingsToggle({ icon, title, description, enabled = false, onToggle }: { icon: React.ReactNode, title: string, description: string, enabled?: boolean, onToggle?: () => void }) {
  return (
    <div className="p-6 flex items-center justify-between">
      <div className="flex gap-4">
        <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
          {icon}
        </div>
        <div>
          <h4 className="font-bold text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <div 
        onClick={onToggle}
        className={cn(
          "h-6 w-11 rounded-full p-1 cursor-pointer transition-colors",
          enabled ? "bg-primary" : "bg-muted"
        )}
      >
        <div className={cn(
          "h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          enabled ? "translate-x-5" : "translate-x-0"
        )} />
      </div>
    </div>
  );
}
