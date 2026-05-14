"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

// Replace these with your ZegoCloud credentials
const APP_ID = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID) || 0;
const SERVER_SECRET = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || "";

export default function ZegoVideoCall() {
  const { roomId } = useParams();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const hasJoined = useRef(false);

  useEffect(() => {
    if (!roomId || !containerRef.current || APP_ID === 0 || hasJoined.current) return;
    hasJoined.current = true;

    const myMeeting = async () => {
      // Generate Kit Token
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        APP_ID,
        SERVER_SECRET,
        roomId as string,
        Date.now().toString(), // Random User ID
        "User_" + Math.floor(Math.random() * 1000) // Random Name
      );

      // Create instance object from Kit Token
      const zp = ZegoUIKitPrebuilt.create(kitToken);

      // Start the call
      zp.joinRoom({
        container: containerRef.current,
        sharedLinks: [
          {
            name: "Personal link",
            url: window.location.protocol + "//" + window.location.host + window.location.pathname,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.GroupCall,
        },
        showPreJoinView: false, // Turn off pre-join to avoid hardware check on entry
        turnOnMicrophoneWhenJoining: false, // Don't force mic
        turnOnCameraWhenJoining: false, // Don't force camera
        showScreenSharingButton: true,
        showMyCameraToggleButton: true,
        showAudioVideoSettingsButton: true,
        showUserList: true,
        onLeaveRoom: () => {
          router.push("/dashboard/video-calls");
        },
      });
    };

    myMeeting();

    return () => {
      // Cleanup happens automatically by Zego
    };
  }, [roomId]);

  if (APP_ID === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-[#0a0a0a]">
        <div className="bg-primary/10 text-primary p-8 rounded-3xl max-w-md border border-primary/20 shadow-2xl">
          <h2 className="text-2xl font-bold mb-2 text-white">ZegoCloud Setup Required</h2>
          <p className="text-zinc-400 text-sm mb-6">Please add your Zego AppID and ServerSecret to <code className="text-primary">.env.local</code>.</p>
          <div className="bg-black/40 p-4 rounded-xl text-left border border-white/5 space-y-2">
             <code className="text-xs text-zinc-500 font-mono">NEXT_PUBLIC_ZEGO_APP_ID=123456789</code>
             <code className="text-xs text-zinc-500 font-mono block">NEXT_PUBLIC_ZEGO_SERVER_SECRET=a1b2c3...</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
