"use client";

import React, { useEffect, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

interface VideoRoomProps {
  roomID: string;
  userID: string;
  userName: string;
}

export default function VideoRoom({ roomID, userID, userName }: VideoRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const myMeeting = async () => {
      const appID = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || "";

      if (!appID || !serverSecret) {
        console.error("ZegoCloud App ID or Server Secret is missing!");
        return;
      }

      // Generate Kit Token
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        userID,
        userName
      );

      // Create instance object from Kit Token.
      const zp = ZegoUIKitPrebuilt.create(kitToken);

      // start the call
      zp.joinRoom({
        container: containerRef.current,
        sharedLinks: [
          {
            name: "Personal link",
            url: window.location.protocol + "//" + window.location.host + window.location.pathname + "?roomID=" + roomID,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.GroupCall, // To implement 1-on-1 calls, modify as ZegoUIKitPrebuilt.OneONoneCall
        },
        showScreenSharingButton: true,
      });
    };

    if (containerRef.current) {
      myMeeting();
    }

    return () => {
      // Cleanup logic if needed (Zego usually handles internal cleanup on unmount)
    };
  }, [roomID, userID, userName]);

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <div 
        ref={containerRef} 
        className="flex-1 h-full w-full overflow-hidden rounded-2xl shadow-2xl"
        style={{ height: '100vh', width: '100%' }}
      />
    </div>
  );
}
