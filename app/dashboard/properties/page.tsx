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
  const [editing, setEditing] = useState<Property | null>(null);
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

  /* ================= FETCH ================= */

  const fetchProperties = async () => {
    try {
      const res = await api.get("/properties");
      setProperties(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  /* ================= INPUT ================= */

  // const handleInput = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  // ) => {
  const handleInput = (e :any) => {

    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: value,
    }));

  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    if (files.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    setError("");

    setForm(prev => ({
      ...prev,
      images: files,
    }));

    // Preview
    const previews = files.map(file =>
      URL.createObjectURL(file)
    );

    setPreviewImages(previews);

  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {

    try {

      setLoading(true);
      setError("");

      const payload = new FormData();

      payload.append("title", form.title);
      payload.append("description", form.description);
      payload.append("type", form.type);
      payload.append("status", form.status);
      payload.append("price", form.price);
      payload.append("location", form.location);

      form.images.forEach(img => {
        payload.append("images", img);
      });

      if (editing) {
        await api.put(`/properties/${editing._id}`, payload);
      } else {
        await api.post("/properties/create", payload);
      }

      resetForm();
      fetchProperties();

    } catch (err: any) {

      setError(
        err?.response?.data?.message ||
        "Something went wrong"
      );

    } finally {
      setLoading(false);
    }

  };

  const resetForm = () => {

    setEditing(null);

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

  };

  /* ================= EDIT ================= */

  const handleEdit = (property: Property) => {

    setEditing(property);

    setForm({
      title: property.title,
      description: property.description,
      type: property.type,
      status: property.status,
      price: property.price.toString(),
      location: property.location,
      images: [],
    });

    setPreviewImages(property.images);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };

  /* ================= DELETE ================= */

  const handleDelete = async (id: string) => {

    if (!confirm("Delete this property?")) return;

    await api.delete(`/properties/${id}`);

    fetchProperties();

  };

  /* ================= UI ================= */

  return (

    <div className="flex min-h-screen bg-gray-50">

      <Sidebar />

      <main className="flex-1">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">

          <h1 className="text-2xl font-bold text-gray-800">
            Property Management
          </h1>

        </div>

        <div className="p-6 max-w-7xl mx-auto">

          {/* FORM */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">

            <h2 className="text-lg font-semibold mb-4">

              {editing ? "Edit Property" : "Create Property"}

            </h2>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">

              <input
                name="title"
                value={form.title}
                onChange={handleInput}
                placeholder="Property title"
                className="input"
              />

              <input
                name="location"
                value={form.location}
                onChange={handleInput}
                placeholder="Location"
                className="input"
              />

              <select
                name="type"
                value={form.type}
                onChange={handleInput}
                className="input"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="land">Land</option>
                <option value="commercial">Commercial</option>
              </select>

              <select
                name="status"
                value={form.status}
                onChange={handleInput}
                className="input"
              >
                <option value="available">Available</option>
                <option value="rent">Rent</option>
                <option value="sold">Sold</option>
              </select>

              <input
                name="price"
                value={form.price}
                onChange={handleInput}
                placeholder="Price"
                className="input"
              />

            </div>

            <textarea
              name="description"
              value={form.description}
              onChange={handleInput}
              placeholder="Description"
              className="input mt-4 h-24"
            />

            {/* Upload */}
            <div className="mt-4">

              <input
                type="file"
                multiple
                onChange={handleImageChange}
              />

            </div>

            {/* Preview */}
            {previewImages.length > 0 && (

              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-4">

                {previewImages.map((img, i) => (

                  <img
                    key={i}
                    src={img}
                    className="h-20 w-full object-cover rounded-lg border"
                  />

                ))}

              </div>

            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-6">

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
              >

                {loading
                  ? "Saving..."
                  : editing
                  ? "Update Property"
                  : "Create Property"}

              </button>

              {editing && (

                <button
                  onClick={resetForm}
                  className="border px-6 py-2 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>

              )}

            </div>

          </div>

          {/* PROPERTY GRID */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

            {properties.map(property => (

              <div
                key={property._id}
                className="bg-white rounded-xl shadow-sm border hover:shadow-md transition overflow-hidden group"
              >

                <div className="overflow-hidden">

                  <img
                    src={property.images?.[0]}
                    className="h-48 w-full object-cover group-hover:scale-105 transition duration-300"
                  />

                </div>

                <div className="p-4">

                  <h3 className="font-semibold text-lg">
                    {property.title}
                  </h3>

                  <p className="text-gray-500 text-sm">
                    {property.location}
                  </p>

                  <p className="text-blue-600 font-bold mt-2">
                    ₦{property.price.toLocaleString()}
                  </p>

                  <div className="flex gap-2 mt-4">

                    <button
                      onClick={() => handleEdit(property)}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-1 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(property._id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1 rounded"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </main>

      {/* Tailwind helper */}
      <style jsx global>{`

        .input {
          width: 100%;
          border: 1px solid #e5e7eb;
          padding: 10px;
          border-radius: 8px;
          outline: none;
        }

        .input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 1px #2563eb;
        }

      `}</style>

    </div>

  );

}
