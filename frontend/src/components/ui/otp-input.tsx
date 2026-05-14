"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
  className?: string;
}

export function OtpInput({ length = 6, onComplete, className }: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto focus next
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    const combinedOtp = newOtp.join("");
    if (combinedOtp.length === length && onComplete) {
      onComplete(combinedOtp);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").substring(0, length);
    if (isNaN(Number(data))) return;

    const newOtp = [...otp];
    for (let i = 0; i < data.length; i++) {
      newOtp[i] = data[i];
    }
    setOtp(newOtp);

    if (onComplete && data.length === length) {
      onComplete(data);
    }

    // Focus last or appropriate
    const nextIndex = data.length < length ? data.length : length - 1;
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className={cn("flex justify-center gap-2 sm:gap-4", className)}>
      {otp.map((digit, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          value={digit}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="h-12 w-10 sm:h-14 sm:w-12 rounded-xl border-2 border-input bg-background text-center text-xl font-bold shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-2xl"
        />
      ))}
    </div>
  );
}
