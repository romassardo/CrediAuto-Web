"use client";

import React, { useState } from "react";

interface SubmitResult {
  success: boolean;
  error?: string;
  details?: string[];
}

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    // Validaciones rápidas en cliente (además de las del servidor)
    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg("Por favor ingresá tu nombre (mínimo 2 caracteres).");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Ingresá un email válido.");
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setErrorMsg("Ingresá un número de teléfono válido (mínimo 8 dígitos).");
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setErrorMsg("Contanos un poco más sobre tu consulta (mínimo 10 caracteres).");
      return;
    }
    if (!consent) {
      setErrorMsg("Debés aceptar los términos y condiciones.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name, email, phone, message, consent }),
      });

      let data: (SubmitResult & { providerError?: string; details?: unknown }) | null = null;
      try {
        data = (await res.json()) as SubmitResult;
      } catch {
        // Si la respuesta no es JSON válido
        data = null;
      }

      if (!res.ok || !data || !data.success) {
        // Construir mensaje enriquecido con detalles en dev
        const extra = data?.details
          ? Array.isArray(data.details)
            ? ` - ${data.details.join(", ")}`
            : ` - ${String(data.details)}`
          : "";
        const provider = data && (data as any).providerError ? ` (${(data as any).providerError})` : "";
        const message =
          (data?.error ||
            "No pudimos enviar tu consulta en este momento. Intentalo nuevamente más tarde.") +
          extra +
          provider;

        setErrorMsg(message);
        try {
          // Loguear en consola para debugging en dev
          // eslint-disable-next-line no-console
          console.error("[ContactForm] Error response", { status: res.status, data });
        } catch {}
        return;
      }

      setSuccessMsg(
        "¡Gracias! Recibimos tu consulta y te responderemos a la brevedad."
      );
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setConsent(false);
    } catch (err) {
      setErrorMsg(
        "Ocurrió un error inesperado al enviar tu consulta. Revisá tu conexión e intentá nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit} noValidate>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="text-lg font-sans font-medium text-gray-700">
            Nombre completo
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Ingresá tu nombre"
              className="w-full px-6 py-4 text-lg font-sans font-medium border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
              aria-required="true"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <svg
                className="w-7 h-7 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-lg font-sans font-medium text-gray-700">
            Email
          </label>
          <div className="relative">
            <input
              type="email"
              placeholder="tu@email.com"
              className="w-full px-6 py-4 text-lg font-sans font-medium border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              aria-required="true"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <svg
                className="w-7 h-7 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-lg font-sans font-medium text-gray-700">
          Número de teléfono
        </label>
        <div className="relative">
          <input
            type="tel"
            placeholder="Ej: 11 5555-5555"
            className="w-full px-6 py-4 text-lg font-sans font-medium border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-lg"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isLoading}
            required
            aria-required="true"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <svg
              className="w-7 h-7 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-lg font-sans font-medium text-gray-700">
          Consulta
        </label>
        <textarea
          rows={4}
          placeholder="Contanos en qué podemos ayudarte..."
          className="w-full px-6 py-4 text-lg font-sans font-normal border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none shadow-lg"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isLoading}
          required
          aria-required="true"
        ></textarea>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="inline-flex items-start gap-4 max-w-3xl">
            <input
              type="checkbox"
              id="aceptaContactoTerminos"
              name="aceptaContactoTerminos"
              className="mt-1.5 w-6 h-6 text-brand-primary-600 border-gray-300 rounded focus:ring-brand-primary-600"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              disabled={isLoading}
              required
              aria-required="true"
            />
            <label
              htmlFor="aceptaContactoTerminos"
              className="text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed"
            >
              Acepto los <a href="#" className="text-brand-primary-600 hover:underline font-semibold">términos y condiciones</a> y autorizo el tratamiento de mis datos personales según la <a href="#" className="text-brand-primary-600 hover:underline font-semibold">política de privacidad</a>.
            </label>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 p-4">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 p-4">
          {successMsg}
        </div>
      )}

      <div className="flex justify-end pt-6">
        <button
          type="submit"
          className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-sans font-medium py-4 px-12 text-lg rounded-lg transition-all duration-200 transform hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            boxShadow:
              "0 6px 12px rgba(0, 0, 0, 0.2), 0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
          }}
          disabled={isLoading}
        >
          {isLoading ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </form>
  );
}
