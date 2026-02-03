"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Sidebar from "@/components/Sidebar";

interface Payment {
  _id: string;
  bookingId: { _id: string; propertyId: { title: string }; userId: { name: string } };
  amount: number;
  paymentMethod: string;
  verified: boolean;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);

  const fetchPayments = async () => {
    try {
      const res = await api.get("/payment");
      setPayments(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleVerify = async (id: string) => {
    try {
      await api.put(`/payment/${id}`, { verified: true });
      fetchPayments();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/payment/${id}`);
    fetchPayments();
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Payments</h1>
        <div className="grid grid-cols-3 gap-4">
          {payments.map(p => (
            <div key={p._id} className="bg-white p-4 rounded shadow">
              <p>User: {p.bookingId.userId.name}</p>
              <p>Property: {p.bookingId.propertyId.title}</p>
              <p>Amount: ₦{p.amount}</p>
              <p>Method: {p.paymentMethod}</p>
              <p>Status: {p.verified ? "Verified" : "Pending"}</p>
              <div className="flex gap-2 mt-2">
                {!p.verified && <button onClick={() => handleVerify(p._id)} className="bg-green-500 text-white p-1 rounded">Verify</button>}
                <button onClick={() => handleDelete(p._id)} className="bg-red-500 text-white p-1 rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
