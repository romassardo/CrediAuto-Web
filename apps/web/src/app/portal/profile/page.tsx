"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Save, Mail, Phone, Shield } from "lucide-react";
import { authFetch } from "@/lib/authFetch";

interface ApiMeResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    phone?: string | null;
    firstName: string;
    lastName: string;
    role: "ADMIN" | "DEALER" | "EJECUTIVO_CUENTAS";
  };
  error?: string;
}

export default function PortalProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", phone: "" });
  const [userName, setUserName] = useState<{ firstName: string; lastName: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          setError("No se pudo cargar tu perfil");
          setLoading(false);
          return;
        }
        const data: ApiMeResponse = await res.json();
        if (data.success && data.user) {
          setForm({ email: data.user.email || "", phone: data.user.phone || "" });
          setUserName({ firstName: data.user.firstName, lastName: data.user.lastName });
        } else {
          setError("No se pudo cargar tu perfil");
        }
      } catch {
        setError("Error de conexión");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await authFetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: form.email, phone: form.phone || null }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error || "No se pudieron guardar los cambios");
        return;
      }
      setSuccess("Datos actualizados correctamente");
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary-50 to-blue-50">
      {/* Header simple con gradiente de marca */}
      <div className="bg-gradient-to-r from-brand-primary-600 via-brand-primary-700 to-brand-primary-800 shadow-2xl relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
          <div className="py-8 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-accent-500/20 border border-brand-accent-500/30 mb-2">
                <span className="text-xs font-bold text-brand-accent-500">⚙️ Perfil</span>
              </div>
              <h1 className="text-2xl font-bold text-white drop-shadow">Mis datos</h1>
              <p className="text-brand-primary-100 text-sm">
                {userName ? `${userName.firstName} ${userName.lastName}` : "Cargando..."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/portal/dashboard" className="text-white/90 hover:text-white underline underline-offset-4">
                Volver al dashboard
              </Link>
              <Link
                href="/change-password"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg border border-white/30 backdrop-blur-sm"
              >
                <Shield className="w-4 h-4" />
                Cambiar contraseña
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto p-6 sm:p-8">
        <form onSubmit={onSave} className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          {loading ? (
            <div className="text-gray-500">Cargando...</div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm font-medium">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm font-medium">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={onChange}
                      required
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                      placeholder="tu@email.com"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                      placeholder="Ej: +54 9 11 5555-5555"
                    />
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-primary-600 to-brand-primary-700 hover:from-brand-primary-700 hover:to-brand-primary-800 text-white font-semibold px-5 py-3 rounded-lg disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
