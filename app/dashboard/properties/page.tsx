"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Sidebar from "@/components/Sidebar";

interface Property {
  _id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  images: string[];
  price: number;
  location: string;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [editing, setEditing] = useState<Property | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "apartment",
    status: "available",
    price: 0,
    location: "",
    images: [] as File[],
  });
  const [error, setError] = useState("");

  const fetchProperties = async () => {
    try {
      const res = await api.get("/properties");
      setProperties(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchProperties(); }, []);

  const handleInput = (e: any) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: any) => {
    const files = Array.from(e.target.files) as File[];
    if (files.length > 5) {
      setError("You can upload a maximum of 5 images");
      return;
    }
    setError("");
    setForm(prev => ({ ...prev, images: files }));
  };

  const handleSubmit = async () => {
    try {
      if (form.images.length > 5) {
        setError("You can upload a maximum of 5 images");
        return;
      }

      const payload = new FormData();
      for (const key in form) {
        if (key === "images") form.images.forEach(img => payload.append("images", img));
        else payload.append(key, (form as any)[key]);
      }

      if (editing) await api.put(`/properties/${editing._id}`, payload);
      else await api.post("/properties/create", payload);

      setEditing(null);
      setForm({ title: "", description: "", type: "apartment", status: "available", price: 0, location: "", images: [] });
      fetchProperties();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (prop: Property) => {
    setEditing(prop);
    setForm({
      title: prop.title,
      description: prop.description,
      type: prop.type,
      status: prop.status,
      price: prop.price,
      location: prop.location,
      images: [],
    });
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/properties/${id}`);
    fetchProperties();
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Properties</h1>

        <div className="mb-6 p-4 bg-white rounded shadow">
          <h2 className="font-bold mb-2">{editing ? "Edit Property" : "Create Property"}</h2>

          {error && <p className="text-red-500 mb-2">{error}</p>}

          <input name="title" value={form.title} onChange={handleInput} placeholder="Title" className="border p-2 mb-2 w-full"/>
          <input name="description" value={form.description} onChange={handleInput} placeholder="Description" className="border p-2 mb-2 w-full"/>
          
          {/* Type dropdown */}
          <select name="type" value={form.type} onChange={handleInput} className="border p-2 mb-2 w-full">
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="land">Land</option>
            <option value="commercial">Commercial</option>
          </select>

          {/* Status dropdown */}
          <select name="status" value={form.status} onChange={handleInput} className="border p-2 mb-2 w-full">
            <option value="available">Available</option>
            <option value="rent">Rent</option>
            <option value="sold">Sold</option>
          </select>

          <input name="price" type="number" value={form.price} onChange={handleInput} placeholder="Price" className="border p-2 mb-2 w-full"/>
          <input name="location" value={form.location} onChange={handleInput} placeholder="Location" className="border p-2 mb-2 w-full"/>
          <input type="file" multiple onChange={handleImageChange} className="mb-2"/>
          
          <button onClick={handleSubmit} className="bg-blue-600 text-white p-2 rounded">
            {editing ? "Update" : "Create"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {properties.map(prop => (
            <div key={prop._id} className="bg-white p-4 rounded shadow">
              {prop.images[0] && <img src={prop.images[0]} alt={prop.title} className="h-40 w-full object-cover rounded mb-2"/>}
              <h2 className="font-bold">{prop.title}</h2>
              <p>{prop.description}</p>
              <p>Type: {prop.type}</p>
              <p>Status: {prop.status}</p>
              <p>Price: ₦{prop.price}</p>
              <p>Location: {prop.location}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleEdit(prop)} className="bg-yellow-500 text-white p-1 rounded">Edit</button>
                <button onClick={() => handleDelete(prop._id)} className="bg-red-500 text-white p-1 rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
