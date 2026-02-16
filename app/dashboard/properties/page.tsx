"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Sidebar from "@/components/Sidebar";

interface Property {
  _id: string;
  title: string;
  slug: string;
  description: string;
  type: string;
  status: string;
  images: string[];
  price: number;
  location: string;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "apartment",
    status: "available",
    price: "",
    location: "",
    images: [] as File[],
  });

  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // ─── FETCH ────────────────────────────────────────
  // Temporary debug – add these lines
  console.log("Current properties state:", properties);
  console.log("properties.length:", properties.length);

  // Inside fetchProperties, replace the try block with:
  const fetchProperties = async () => {
    try {
      const res = await api.get("/properties");
      console.log("API full response:", res);               // ← very important
      console.log("res.data:", res.data);
      console.log("res.data.data:", res.data?.data);
      
      const receivedProperties = res.data.data || res.data || [];  // fallback both ways
      console.log("Setting properties to:", receivedProperties);
      
      setProperties(receivedProperties);
    } catch (err) {
      console.error("Fetch properties failed:", err);
      // Optional: setError("Failed to load properties");
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // ─── FORM HANDLERS ─────────────────────────────────
  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    if (files.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    setError("");
    setForm((prev) => ({ ...prev, images: files }));

    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  // ─── CREATE / UPDATE ───────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("description", form.description);
      payload.append("type", form.type);
      payload.append("status", form.status);
      payload.append("price", form.price);
      payload.append("location", form.location);

      form.images.forEach((img) => payload.append("images", img));

      if (selectedProperty) {
        await api.put(`/properties/${selectedProperty._id}`, payload);
      } else {
        await api.post("/properties/create", payload);
      }

      closeModal();
      fetchProperties();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ─── EDIT / DELETE / MODAL ─────────────────────────
  const openEditModal = (property: Property) => {
    setSelectedProperty(property);
    setForm({
      title: property.title,
      description: property.description,
      type: property.type,
      status: property.status,
      price: property.price.toString(),
      location: property.location,
      images: [],
    });
    setPreviewImages(property.images); // show existing images
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedProperty(null);
    setForm({
      title: "",
      description: "",
      type: "apartment",
      status: "available",
      price: "",
      location: "",
      images: [],
    });
    setPreviewImages([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
    setPreviewImages([]);
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    try {
      await api.delete(`/properties/${id}`);
      fetchProperties();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Could not delete property");
    }
  };

  // ─── RENDER ────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 z-10 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Property Management</h1>
          <button
            onClick={openCreateModal}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium"
          >
            + Add New Property
          </button>
        </div>

        <div className="p-6 max-w-7xl mx-auto">
          {/* PROPERTY GRID */}
          {properties.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              No properties found. Click "Add New Property" to get started.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties.map((property) => (
                <div
                  key={property._id}
                  className="bg-white rounded-xl shadow-sm border hover:shadow-md transition overflow-hidden group"
                >
                  <div className="overflow-hidden aspect-4/3 relative">
                    <img
                      src={property.images?.[0] || "/placeholder-property.jpg"}
                      alt={property.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-lg line-clamp-2">{property.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{property.location}</p>
                    <p className="text-blue-600 font-bold mt-2">
                      ₦{property.price.toLocaleString()}
                    </p>

                    <div className="flex gap-2 mt-5">
                      <button
                        onClick={() => openEditModal(property)}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded font-medium transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(property._id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded font-medium transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ─── MODAL ──────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">
                {selectedProperty ? "Edit Property" : "Create New Property"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
                  {error}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleInput}
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleInput}
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select name="type" value={form.type} onChange={handleInput} className="input">
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="land">Land</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select name="status" value={form.status} onChange={handleInput} className="input">
                    <option value="available">Available</option>
                    <option value="rent">For Rent</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Price (₦)</label>
                  <input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleInput}
                    required
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInput}
                  rows={4}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Images (max 5)</label>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} />
              </div>

              {previewImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-2">
                  {previewImages.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt="preview"
                      className="h-20 w-full object-cover rounded border"
                    />
                  ))}
                </div>
              )}

              <div className="flex gap-4 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                >
                  {loading ? "Saving..." : selectedProperty ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tailwind helper classes */}
      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #d1d5db;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 1rem;
        }
        .input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
      `}</style>
    </div>
  );
}