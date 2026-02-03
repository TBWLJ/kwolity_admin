"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Sidebar from "@/components/Sidebar";

interface Booking {
  _id: string;
  propertyId: { title: string };
  userId: { name: string };
  startDate: string;
  endDate: string;
  totalAmount: number;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings");
      setBookings(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleDelete = async (id: string) => {
    await api.delete(`/bookings/${id}`);
    fetchBookings();
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Bookings</h1>
        <div className="grid grid-cols-3 gap-4">
          {bookings.map(b => (
            <div key={b._id} className="bg-white p-4 rounded shadow">
              <p>User: {b.userId.name}</p>
              <p>Property: {b.propertyId.title}</p>
              <p>Start: {new Date(b.startDate).toLocaleDateString()}</p>
              <p>End: {new Date(b.endDate).toLocaleDateString()}</p>
              <p>Total: ₦{b.totalAmount}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleDelete(b._id)} className="bg-red-500 text-white p-1 rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
