"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {

    try {

      setLoading(true);
      setError("");

      await api.post(
        "/users/login",
        { email, password },
        { withCredentials: true }
      );

      router.push("/dashboard/properties");

    } catch (err: any) {

      setError(
        err.response?.data?.message ||
        "Invalid email or password"
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-green-50 to-gray-100">

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border">

        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-green-600 mb-2">
          Kwolity Group Admin
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Login to your dashboard
        </p>


        {/* Email */}
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
        />


        {/* Password */}
        <div className="relative mb-4">

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-green-500 pr-12"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>

        </div>


        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}


        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-medium transition disabled:opacity-70 disabled:cursor-not-allowed"
        >

          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Logging in...
            </>
          ) : (
            "Login"
          )}

        </button>

      </div>

    </div>

  );

}
