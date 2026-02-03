"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // call backend to verify session (cookie-based)
        await api.get("/users/profile"); // endpoint that returns user info if logged in
        router.replace("/dashboard/properties"); // logged in → go dashboard
      } catch (err) {
        router.replace("/login"); // not logged in → go login
      }
    };

    checkAuth();
  }, [router]);

  return null;
}
