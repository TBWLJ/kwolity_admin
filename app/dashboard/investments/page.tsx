"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Sidebar from "@/components/Sidebar";

interface Investment {
  _id: string;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  expectedROI: number;
  status: string;
  images: string[];
}

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [editing, setEditing] = useState<Investment | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    goalAmount: 0,
    expectedROI: 0,
    status: "available",
    images: [] as File[],
  });

  const fetchInvestments = async () => {
    try {
      const res = await api.get("/investments");
      setInvestments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchInvestments(); }, []);

  const handleInput = (e: any) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: any) => {
    setForm(prev => ({ ...prev, images: Array.from(e.target.files) }));
  };

  const handleSubmit = async () => {
    try {
      const payload = new FormData();
      for (const key in form) {
        if (key === "images") form.images.forEach(img => payload.append("images", img));
        else payload.append(key, (form as any)[key]);
      }

      if (editing) await api.put(`/investments/${editing._id}`, payload);
      else await api.post("/investments", payload);

      setEditing(null);
      setForm({ title: "", description: "", goalAmount: 0, expectedROI: 0, status: "available", images: [] });
      fetchInvestments();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (inv: Investment) => {
    setEditing(inv);
    setForm({
      title: inv.title,
      description: inv.description,
      goalAmount: inv.goalAmount,
      expectedROI: inv.expectedROI,
      status: inv.status,
      images: [],
    });
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/investments/${id}`);
    fetchInvestments();
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Investments</h1>

        <div className="mb-6 p-4 bg-white rounded shadow">
          <h2 className="font-bold mb-2">{editing ? "Edit Investment" : "Create Investment"}</h2>
          <input name="title" value={form.title} onChange={handleInput} placeholder="Title" className="border p-2 mb-2 w-full"/>
          <input name="description" value={form.description} onChange={handleInput} placeholder="Description" className="border p-2 mb-2 w-full"/>
          <input name="goalAmount" type="number" value={form.goalAmount} onChange={handleInput} placeholder="Goal Amount" className="border p-2 mb-2 w-full"/>
          <input name="expectedROI" type="number" value={form.expectedROI} onChange={handleInput} placeholder="Expected ROI %" className="border p-2 mb-2 w-full"/>
          <select name="status" value={form.status} onChange={handleInput} className="border p-2 mb-2 w-full">
            <option value="available">Available</option>
            <option value="investing">Investing</option>
            <option value="funded">Funded</option>
          </select>
          <input type="file" multiple onChange={handleImageChange} className="mb-2"/>
          <button onClick={handleSubmit} className="bg-blue-600 text-white p-2 rounded">{editing ? "Update" : "Create"}</button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {investments.map(inv => (
            <div key={inv._id} className="bg-white p-4 rounded shadow">
              {inv.images[0] && <img src={inv.images[0]} alt={inv.title} className="h-40 w-full object-cover rounded mb-2"/>}
              <h2 className="font-bold">{inv.title}</h2>
              <p>{inv.description}</p>
              <p>Goal: ₦{inv.goalAmount}</p>
              <p>Current: ₦{inv.currentAmount}</p>
              <p>ROI: {inv.expectedROI}%</p>
              <p>Status: {inv.status}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleEdit(inv)} className="bg-yellow-500 text-white p-1 rounded">Edit</button>
                <button onClick={() => handleDelete(inv._id)} className="bg-red-500 text-white p-1 rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
