"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otp-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [number, setNumber] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState("");

  useEffect(() => {
    const storedNumber = sessionStorage.getItem("verify_number");
    if (!storedNumber) {
      toast.error("No phone number found for verification. Please register again.");
      router.push("/register");
      return;
    }
    setNumber(storedNumber);
  }, [router]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleVerify = async (otpValue: string) => {
    const code = otpValue || otp;
    if (code.length !== 6) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await api.post("/otp/verify-otp", {
        number,
        otp: code,
      });

      if (res.data.success) {
        toast.success("Account verified successfully!");
        setIsVerified(true);
        sessionStorage.removeItem("verify_number");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Verification failed. Please check the code.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const res = await api.post("/otp/send-otp", { number });
      toast.success(`New verification code: ${res.data.otp}`);
      setTimeLeft(60);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-[450px] shadow-2xl text-center border-green-100 dark:border-green-900/30">
          <CardContent className="pt-12 pb-12">
            <div className="mb-6 flex justify-center">
              <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-10 w-10" />
              </div>
            </div>
            <CardTitle className="text-3xl mb-2">Account Verified!</CardTitle>
            <CardDescription className="text-base mb-8">
              Your phone number ({number}) has been successfully verified. You can now start using ChatApp.
            </CardDescription>
            <Link href="/login">
              <Button className="w-full h-12 text-base font-semibold">
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />

      <Card className="w-full max-w-[450px] shadow-2xl transition-all hover:shadow-primary/5">
        <CardHeader className="space-y-1">
          <div className="flex items-center mb-4">
            <Link href="/register" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </div>
          <CardTitle className="text-3xl text-center">Verify Number</CardTitle>
          <CardDescription className="text-center text-base">
            We&apos;ve sent a verification code to <span className="font-semibold text-foreground">{number}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <OtpInput 
            length={6} 
            onComplete={(val) => {
              setOtp(val);
              handleVerify(val);
            }} 
          />
          
          <div className="text-center space-y-4">
            <div className="text-sm text-muted-foreground">
              Didn&apos;t receive the code?{" "}
              {timeLeft > 0 ? (
                <span className="font-medium text-foreground">
                  Resend in <span className="text-primary font-bold">{timeLeft}s</span>
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="font-bold text-primary hover:underline underline-offset-4 disabled:opacity-50 inline-flex items-center gap-1"
                >
                  {isResending ? <RefreshCw className="h-3 w-3 animate-spin" /> : null}
                  Resend Now
                </button>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            className="w-full h-12 text-base font-semibold" 
            onClick={() => handleVerify(otp)}
            disabled={isVerifying || otp.length !== 6}
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...
              </>
            ) : (
              "Verify Account"
            )}
          </Button>
          <div className="text-center w-full">
            <Link href="/register" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Use a different phone number
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
