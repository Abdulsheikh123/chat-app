"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { 
  Search, 
  Plus, 
  MessageSquare, 
  MoreVertical, 
  Send, 
  Smile, 
  Paperclip, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  FileText,
  Loader2,
  X,
  FileIcon,
  ArrowLeft,
  Heart,
  Bookmark,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const receiverId = searchParams.get("userId");

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const emojis = [
    "😀", "😂", "🤣", "😊", "😍", "🥰", "😎", "🤔", "🤫", "😴",
    "😭", "😱", "😤", "😡", "🔥", "✨", "💯", "❤️", "🧡", "💛",
    "💚", "💙", "💜", "🖤", "👍", "👎", "👏", "🙌", "🙏", "🤝",
    "🎉", "🎈", "🎁", "🌈", "⭐", "🌙", "🍕", "🍔", "☕", "🍺"
  ];

  const handleEmojiClick = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleClearChat = async () => {
    console.log("Attempting to clear chat for receiverId:", receiverId);
    if (!receiverId) {
      console.warn("Clear Chat failed: No receiverId found");
      return;
    }
    
    if (!confirm("Are you sure you want to clear this entire chat for both sides? This cannot be undone.")) return;
    
    try {
      const res = await api.delete(`/chat/clear/${receiverId}`);
      console.log("Clear Chat response:", res.data);
      if (res.data.success) {
        setMessages([]);
        toast.success("Chat cleared");
        setShowMenu(false);
      }
    } catch (error) {
      console.error("Clear Chat error:", error);
      toast.error("Failed to clear chat");
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. Initial Setup: Fetch Profile and Recent Users
  useEffect(() => {
    const init = async () => {
      try {
        const [profileRes, usersRes] = await Promise.all([
          api.get("/auth/me"),
          api.get("/auth/users")
        ]);

        if (profileRes.data.success) {
          const user = profileRes.data.data.user || profileRes.data.data;
          setCurrentUser(user);
          
          // Connect Socket
          socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005");
          socketRef.current.emit("join_room", user.id);

          socketRef.current.on("receive_message", (data) => {
            // Only add if it's from the currently selected user
            if (data.senderId === receiverId) {
              setMessages(prev => [...prev, data]);
            } else {
              toast.info(`New message from ${data.senderName || 'someone'}`);
            }
          });

          socketRef.current.on("message_updated", (data) => {
            setMessages(prev => prev.map(m => m.id === data.id ? data : m));
          });
        }

        if (usersRes.data.success) {
          const aiUser = {
            id: "ai_assistant",
            name: "AI Help Assistant",
            email: "ai@assistant.com",
            profilePic: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png", // Robot icon
            isAI: true
          };
          setRecentUsers([aiUser, ...usersRes.data.data]);
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    init();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // 2. Fetch Selected User and Chat History when receiverId changes
  useEffect(() => {
    if (!receiverId) return;

    const fetchChatData = async () => {
      try {
        const [userRes, historyRes] = await Promise.all([
          api.get(`/auth/users`),
          receiverId !== "ai_assistant" ? api.get(`/chat/history/${receiverId}`) : Promise.resolve({ data: { data: [] } })
        ]);

        if (userRes.data.success) {
          const aiUser = {
            id: "ai_assistant",
            name: "AI Help Assistant",
            isAI: true,
            profilePic: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
          };
          const allUsers = [aiUser, ...userRes.data.data];
          const target = allUsers.find((u: any) => u.id === receiverId);
          setSelectedUser(target);
        }

        if (receiverId === "ai_assistant") {
          setMessages([]);
        } else if (historyRes.data.success) {
          setMessages(historyRes.data.data);
        }
      } catch (error) {
        console.error("Error fetching chat data:", error);
      }
    };
    fetchChatData();
  }, [receiverId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu, showEmojiPicker]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("video/") && file.size > 20 * 1024 * 1024) {
      toast.error("Video size exceeds 20MB limit.");
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!receiverId || (!inputText.trim() && !selectedFile)) return;

    if (receiverId === "ai_assistant") {
      const userMsg = {
        id: Date.now().toString(),
        content: inputText,
        senderId: currentUser?.id,
        receiverId: "ai_assistant",
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMsg]);
      const prompt = inputText;
      setInputText("");

      try {
        const res = await api.post("/ai/chat", { prompt });
        if (res.data.success) {
          const aiMsg = {
            id: (Date.now() + 1).toString(),
            content: res.data.data,
            senderId: "ai_assistant",
            receiverId: currentUser?.id,
            createdAt: new Date().toISOString(),
            isAI: true
          };
          setMessages(prev => [...prev, aiMsg]);
        }
      } catch (err) {
        toast.error("AI is currently unavailable");
      }
      return;
    }

    setIsSending(true);
    const formData = new FormData();
    formData.append("receiverId", receiverId);
    if (inputText) formData.append("content", inputText);
    if (selectedFile) {
      let fileType = "DOCUMENT";
      if (selectedFile.type.startsWith("image/")) fileType = "IMAGE";
      else if (selectedFile.type.startsWith("video/")) fileType = "VIDEO";
      
      formData.append("fileType", fileType);
      formData.append("file", selectedFile);
    }

    try {
      const res = await api.post("/chat/send", formData);
      if (res.data.success) {
        const newMessage = res.data.data;
        setMessages(prev => [...prev, newMessage]);
        
        // Emit via socket for real-time
        if (socketRef.current) {
          socketRef.current.emit("send_message", {
            ...newMessage,
            receiverId,
            senderName: currentUser.name
          });
        }

        setInputText("");
        setSelectedFile(null);
        setFilePreview(null);
      }
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    try {
      const res = await api.patch(`/chat/${messageId}/react`, { emoji });
      if (res.data.success) {
        setMessages(prev => prev.map(m => m.id === messageId ? res.data.data : m));
        socketRef.current?.emit("update_message", { ...res.data.data, receiverId });
      }
    } catch (err) {
      console.error("Error reacting to message:", err);
    }
  };

  const handleLike = async (messageId: string) => {
    console.log("Handling Like for message:", messageId);
    try {
      const res = await api.patch(`/chat/${messageId}/like`);
      console.log("Like response:", res.data);
      if (res.data.success) {
        setMessages(prev => prev.map(m => m.id === messageId ? res.data.data : m));
        socketRef.current?.emit("update_message", { ...res.data.data, receiverId });
      }
    } catch (error) {
      console.error("Like error:", error);
      toast.error("Error liking message");
    }
  };

  const handleSave = async (messageId: string) => {
    console.log("Handling Save for message:", messageId);
    try {
      const res = await api.patch(`/chat/${messageId}/save`);
      console.log("Save response:", res.data);
      if (res.data.success) {
        setMessages(prev => prev.map(m => m.id === messageId ? res.data.data : m));
        socketRef.current?.emit("update_message", { ...res.data.data, receiverId });
        const isSaved = res.data.data.savedBy.includes(currentUser?.id);
        toast.success(isSaved ? "Saved to bookmarks" : "Removed from bookmarks");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Error saving message");
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm("Delete this message for everyone?")) return;
    try {
      const res = await api.delete(`/chat/${messageId}`);
      if (res.data.success) {
        setMessages(prev => prev.filter(m => m.id !== messageId));
        toast.success("Message deleted");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error deleting message");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-background">
      {/* Sidebar - Recent Chats */}
      <div className={cn(
        "w-full md:w-80 lg:w-96 border-r border-border flex flex-col bg-card/30 transition-all",
        receiverId ? "hidden md:flex" : "flex"
      )}>
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold mb-6">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search chats..." className="pl-10 bg-background/50 rounded-xl" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {recentUsers.map((user) => (
            <ChatItem 
              key={user.id} 
              user={user} 
              active={user.id === receiverId} 
              onClick={() => router.push(`/dashboard/chats?userId=${user.id}`)}
            />
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col bg-background relative transition-all",
        !receiverId ? "hidden md:flex items-center justify-center" : "flex"
      )}>
        {!receiverId ? (
          <div className="text-center space-y-4">
            <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto">
              <MessageSquare className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Select a contact to start chatting</h2>
            <p className="text-muted-foreground max-w-xs mx-auto">Pick someone from the left sidebar or go to your Contacts page.</p>
            <Button onClick={() => router.push("/dashboard/contacts")}>View Contacts</Button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="h-20 border-b border-border px-4 sm:px-8 flex items-center justify-between shrink-0 bg-card/20 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.push("/dashboard/chats")}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
                  {selectedUser?.profileImage ? (
                    <img src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005"}${selectedUser.profileImage}`} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-bold text-primary">{selectedUser?.name?.[0]}</span>
                  )}
                </div>
                <div>
                  <h2 className="font-bold">{selectedUser?.name || "Loading..."}</h2>
                  <p className="text-xs text-green-500 font-medium">Online</p>
                </div>
              </div>
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MoreVertical className="h-5 w-5 text-muted-foreground" />
                </Button>
                
                {showMenu && (
                  <div 
                    ref={menuRef}
                    className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden py-1"
                  >
                    <button 
                      onClick={handleClearChat}
                      className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear Chat
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
              {messages.map((msg, i) => (
                <Message 
                  key={msg.id || i} 
                  message={msg} 
                  sent={msg.senderId === currentUser?.id} 
                  currentUser={currentUser}
                  onLike={() => handleLike(msg.id)}
                  onSave={() => handleSave(msg.id)}
                  onDelete={() => handleDelete(msg.id)}
                  onReact={(emoji) => handleReact(msg.id, emoji)}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* File Preview */}
            {selectedFile && (
              <div className="px-6 py-3 bg-muted/30 border-t border-border flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-xl border border-border bg-background overflow-hidden flex items-center justify-center">
                  {filePreview ? (
                    <img src={filePreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : <FileText className="h-8 w-8 text-primary" />}
                  <button onClick={() => { setSelectedFile(null); setFilePreview(null); }} className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5"><X className="h-3 w-3" /></button>
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-sm font-bold truncate">{selectedFile.name}</p>
                   <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 sm:p-6 bg-card/30 border-t border-border">
              <div className="flex items-center gap-2 sm:gap-4 bg-background border border-border p-2 rounded-2xl shadow-sm">
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}><Paperclip className="h-5 w-5 text-muted-foreground" /></Button>
                <Input value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type a message..." className="border-none focus-visible:ring-0 bg-transparent text-base" />
                
                <div className="relative">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile className="h-5 w-5 text-muted-foreground" />
                  </Button>

                  {showEmojiPicker && (
                    <div 
                      ref={emojiPickerRef}
                      className="absolute bottom-full right-0 mb-4 w-64 bg-card border border-border rounded-2xl shadow-2xl p-4 grid grid-cols-5 gap-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
                    >
                      {emojis.map((emoji, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleEmojiClick(emoji)}
                          className="h-10 w-10 flex items-center justify-center text-xl hover:bg-accent rounded-xl transition-colors active:scale-90"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={isSending || (!inputText.trim() && !selectedFile)} size="icon" className="rounded-xl h-10 w-10">
                  {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function ChatItem({ user, active, onClick }: { user: any, active: boolean, onClick: () => void }) {
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005").replace(/\/api$/, "");
  const profileImageUrl = user.profileImage ? `${baseUrl}${user.profileImage}` : null;
  return (
    <div onClick={onClick} className={cn(
      "p-4 mx-2 rounded-2xl cursor-pointer transition-all flex gap-4 hover:bg-accent/50 mb-1",
      active ? "bg-primary/5 border border-primary/10 shadow-sm" : "border border-transparent"
    )}>
      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 overflow-hidden">
        {profileImageUrl ? (
          <img src={profileImageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="font-bold text-primary">{user.name[0]}</span>
        )}
      </div>
      <div className="flex-1 min-w-0 py-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-sm truncate">{user.name}</h3>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Today</span>
        </div>
        <p className="text-xs text-muted-foreground truncate font-medium">Click to start chatting</p>
      </div>
    </div>
  );
}

function Message({ 
  message, 
  sent, 
  currentUser, 
  onLike, 
  onSave, 
  onDelete,
  onReact
}: { 
  message: any, 
  sent: boolean, 
  currentUser: any,
  onLike: () => void,
  onSave: () => void,
  onDelete: () => void,
  onReact: (emoji: string) => void
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const isImage = message.fileType === "IMAGE";
  const isVideo = message.fileType === "VIDEO";
  const isDoc = message.fileType === "DOCUMENT";
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005").replace(/\/api$/, "");
  
  const isLiked = message.likedBy?.includes(currentUser?.id);
  const isSaved = message.savedBy?.includes(currentUser?.id);

  const reactions = Array.isArray(message.reactions) ? message.reactions : [];
  
  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc: any, r: any) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  const quickEmojis = ["❤️", "😂", "😮", "😢", "🔥", "👍"];

  return (
    <div className={cn("flex group", sent ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[75%] space-y-1", sent ? "items-end" : "items-start")}>
        <div className={cn(
          "rounded-2xl text-sm font-medium shadow-sm overflow-hidden transition-all relative",
          sent ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card border border-border rounded-tl-none"
        )}>
          {isImage && <img src={`${baseUrl}${message.fileUrl}`} alt="" className="max-w-full h-auto max-h-60 object-cover" />}
          {isVideo && <video src={`${baseUrl}${message.fileUrl}`} controls className="max-w-full max-h-60" />}
          {isDoc && (
            <div className="p-4 flex items-center gap-3 bg-muted/20">
               <FileIcon className="h-5 w-5 text-primary" />
               <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{message.fileName}</p>
                  <a href={`${baseUrl}${message.fileUrl}`} target="_blank" className="text-[10px] text-primary hover:underline">Download</a>
               </div>
            </div>
          )}
          {message.content && <div className="px-4 py-3">{message.content}</div>}
        </div>

        {/* Reaction Display */}
        {Object.keys(groupedReactions).length > 0 && (
          <div className={cn("flex flex-wrap gap-1 mt-1", sent ? "justify-end" : "justify-start")}>
            {Object.entries(groupedReactions).map(([emoji, count]: [any, any]) => (
              <div 
                key={emoji} 
                onClick={() => onReact(emoji)}
                className="bg-card border border-border rounded-full px-1.5 py-0.5 text-[10px] flex items-center gap-1 cursor-pointer hover:bg-accent transition-colors shadow-sm"
              >
                <span>{emoji}</span>
                <span className="font-bold text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Action Bar */}
        <div className={cn(
          "flex items-center gap-3 px-1 transition-all mt-1",
          sent ? "flex-row-reverse" : "flex-row"
        )}>
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          
          <div className="flex items-center gap-2 relative">
            <div className="relative">
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={cn(
                  "transition-all hover:scale-125 text-muted-foreground opacity-0 group-hover:opacity-100",
                  showEmojiPicker && "opacity-100 text-primary"
                )}
              >
                <Smile className="h-3.5 w-3.5" />
              </button>

              {showEmojiPicker && (
                <div className={cn(
                  "absolute bottom-full mb-2 bg-card border border-border rounded-full shadow-xl p-1 flex items-center gap-1 z-50 animate-in fade-in zoom-in-95 duration-200",
                  sent ? "right-0" : "left-0"
                )}>
                  {quickEmojis.map(emoji => (
                    <button 
                      key={emoji}
                      onClick={() => {
                        onReact(emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="hover:bg-accent rounded-full p-1 transition-all active:scale-90 text-sm"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={onLike}
              className={cn(
                "transition-all hover:scale-125", 
                isLiked ? "text-red-500 opacity-100" : "text-muted-foreground opacity-0 group-hover:opacity-100"
              )}
            >
              <Heart className={cn("h-3.5 w-3.5", isLiked && "fill-current")} />
            </button>
            <button 
              onClick={onSave}
              className={cn(
                "transition-all hover:scale-125", 
                isSaved ? "text-primary opacity-100" : "text-muted-foreground opacity-0 group-hover:opacity-100"
              )}
            >
              <Bookmark className={cn("h-3.5 w-3.5", isSaved && "fill-current")} />
            </button>
            {sent && (
              <button 
                onClick={onDelete}
                className="transition-all hover:scale-125 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatsPage() {
  return (
    <Suspense fallback={<Loader2 className="h-10 w-10 animate-spin text-primary" />}>
      <ChatContent />
    </Suspense>
  );
}
