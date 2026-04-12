import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";

/* ─────────────────────────────────────────────────────────────
   Supabase Auth Login Gate (email + password)
───────────────────────────────────────────────────────────── */
const LoginGate = ({ onUnlock }) => {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if already logged in on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.app_metadata?.role === "admin") {
        onUnlock();
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email,
          password: pw,
        },
      );
      if (authError) throw authError;
      // Check admin role
      if (data.user?.app_metadata?.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("Access denied. Admin privileges required.");
      }
      onUnlock();
    } catch (err) {
      setError(err.message || "Login failed");
      setPw("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-sm border border-gray-100">
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="material-icons text-primary text-3xl">
              admin_panel_settings
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Admin Login</h1>
          <p className="text-sm text-gray-400">Tours management dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="admin@tukinlisbon.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/30 focus:border-primary"
              autoFocus
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              value={pw}
              onChange={(e) => {
                setPw(e.target.value);
                setError("");
              }}
              placeholder="Enter admin password"
              className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/30 ${
                error
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200 focus:border-primary"
              }`}
              required
            />
            {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="material-icons animate-spin text-base">
                sync
              </span>
            )}
            {loading ? "Signing in…" : "Enter Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default LoginGate;
