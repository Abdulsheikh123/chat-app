"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Loader2, Minus, Maximize2, GripHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";

export default function GlobalAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: -24, y: -24 }); // Relative to bottom-right
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([
    { role: "ai", content: "Hello! I'm your AI Help Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Draggable Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isOpen && !isMinimized) return; // Don't drag when open/maximized
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsLoading(true);
    try {
      const res = await api.post("/ai/chat", { prompt: userMsg });
      if (res.data.success) {
        setMessages(prev => [...prev, { role: "ai", content: res.data.data }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "ai", content: "I'm sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const dynamicStyle = !isOpen || isMinimized 
    ? { right: `${-position.x}px`, bottom: `${-position.y}px`, position: 'fixed' as const }
    : { right: '24px', bottom: '24px', position: 'fixed' as const };

  return (
    <div 
      className="z-[9999] flex flex-col items-end gap-4 transition-none"
      style={dynamicStyle}
    >
      {/* Chat Window */}
      {isOpen && !isMinimized && (
        <div className="w-[320px] sm:w-[350px] h-[450px] bg-background/80 backdrop-blur-xl border border-white/10 rounded-[1.5rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-3 bg-primary flex items-center justify-between text-white shadow-lg cursor-default">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-white/20 rounded-lg flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs">AI Help Assistant</h3>
                <p className="text-[8px] opacity-80 uppercase tracking-widest font-bold">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-white/10" onClick={() => setIsMinimized(true)}>
                <Minus className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-white/10" onClick={() => setIsOpen(false)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 scroll-smooth">
            {messages.map((msg, i) => (
              <div key={i} className={cn(
                "flex items-start gap-2 max-w-[90%]",
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}>
                <div className={cn(
                  "h-5 w-5 rounded-md flex items-center justify-center shrink-0 mt-1",
                  msg.role === "ai" ? "bg-primary text-white" : "bg-zinc-200 text-zinc-600"
                )}>
                  {msg.role === "ai" ? <Bot className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
                </div>
                <div className={cn(
                  "p-2.5 rounded-xl text-[13px] leading-relaxed shadow-sm",
                  msg.role === "ai" ? "bg-white border border-zinc-100 text-zinc-800 rounded-tl-none" : "bg-primary text-white rounded-tr-none"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-zinc-400 italic text-[11px] animate-pulse">
                <Loader2 className="h-2.5 w-2.5 animate-spin" /> Thinking...
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-zinc-100 bg-white/50">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Ask anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="w-full bg-white border border-zinc-200 rounded-full py-2 pl-3 pr-10 text-xs focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
              <Button 
                size="icon" 
                className="absolute right-1 h-7 w-7 rounded-full shadow-lg"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Minimized Bar */}
      {isOpen && isMinimized && (
        <div 
          className="bg-primary text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 cursor-move animate-in fade-in zoom-in duration-300 active:scale-95"
          onMouseDown={handleMouseDown}
          onClick={(e) => { if(!isDragging) setIsMinimized(false); }}
        >
          <GripHorizontal className="h-3 w-3 opacity-50" />
          <Bot className="h-4 w-4 animate-bounce" />
          <span className="text-xs font-bold">AI Active</span>
        </div>
      )}

      {/* Main Toggle Button */}
      {!isOpen && (
        <div
          onMouseDown={handleMouseDown}
          className={cn(
            "h-14 w-14 rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center cursor-move transition-transform active:scale-90 bg-primary text-white",
            isDragging ? "scale-110 opacity-80" : "hover:scale-105"
          )}
          onClick={(e) => { if(!isDragging) setIsOpen(true); }}
        >
          <Bot className="h-7 w-7" />
        </div>
      )}
    </div>
  );
}
