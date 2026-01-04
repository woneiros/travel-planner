"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Intercom from "@intercom/messenger-js-sdk";

export default function IntercomProvider() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [intercomInitialized, setIntercomInitialized] = useState(false);

  useEffect(() => {
    // Reset initialization state when user changes
    setIntercomInitialized(false);
  }, [user?.id]);

  useEffect(() => {
    const initializeIntercom = async () => {
      if (isLoaded && isSignedIn && user && !intercomInitialized) {
        try {
          // Fetch JWT from backend for Identity Verification via Next.js API route
          const response = await fetch("/api/intercom/user-hash");

          if (!response.ok) {
            throw new Error("Failed to fetch Intercom user hash");
          }

          const { user_hash } = await response.json();

          Intercom({
            app_id: "m10gpkxg",
            name: user.fullName || user.firstName || "User",
            created_at: user.createdAt
              ? Math.floor(new Date(user.createdAt).getTime() / 1000)
              : undefined,
            intercom_user_jwt: user_hash, // JWT from backend for Identity Verification
            session_duration: 86400000, // 24 hours in milliseconds
          });

          setIntercomInitialized(true);
        } catch (error) {
          console.error(
            "Failed to initialize Intercom with Identity Verification:",
            error
          );
          // Fallback: Initialize without user_hash
          Intercom({
            app_id: "m10gpkxg",
            user_id: user.id,
            name: user.fullName || user.firstName || "User",
            email: user.primaryEmailAddress?.emailAddress || "",
            created_at: user.createdAt
              ? Math.floor(new Date(user.createdAt).getTime() / 1000)
              : undefined,
          });
          setIntercomInitialized(true);
        }
      } else if (isLoaded && !isSignedIn && !intercomInitialized) {
        // Initialize Intercom for non-authenticated users
        Intercom({
          app_id: "m10gpkxg",
        });
        setIntercomInitialized(true);
      }
    };

    initializeIntercom();
  }, [isLoaded, isSignedIn, user, intercomInitialized]);

  return null;
}
