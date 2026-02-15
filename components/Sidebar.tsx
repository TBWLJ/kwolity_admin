"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api"; // your axios instance

export default function Sidebar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4 justify-between">
      <div>
        <h1 className="text-2xl font-bold mb-6">Kwolity Admin</h1>
        <Link href="/dashboard/properties" className="mb-2 hover:bg-gray-700 p-2 rounded block">Properties</Link>
        <Link href="/dashboard/investments" className="mb-2 hover:bg-gray-700 p-2 rounded block">Investments</Link>
        <Link href="/dashboard/payments" className="mb-2 hover:bg-gray-700 p-2 rounded block">Payments</Link>
        <Link href="/dashboard/bookings" className="mb-2 hover:bg-gray-700 p-2 rounded block">Bookings</Link>
      </div>

      <button
        onClick={handleLogout}
        className="mb-2 hover:bg-gray-700 p-2 rounded mt-4 w-full text-left"
      >
        Logout
      </button>
    </div>
  );
}
