"use client";

// hooks/auth/use-login.ts
// Encapsulates all login page logic: form state, validation, submission, errors.

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/auth-context";
import { ApiClientError } from "@/lib/api-client";

export interface LoginForm {
  email: string;
  password: string;
}

export function useLogin() {
  const router = useRouter();
  const { login, isActionLoading: isLoading } = useAuth();

  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ── Field change handler ──────────────────────────────────────────────────
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  // ── Toggle password visibility ────────────────────────────────────────────
  function togglePassword() {
    setShowPassword((prev) => !prev);
  }

  // ── Submit handler ────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!form.email || !form.password) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      await login(form.email, form.password);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 401) {
          setError("Correo o contraseña incorrectos.");
        } else if (err.status === 429) {
          setError("Demasiados intentos. Espera un momento.");
        } else {
          setError(err.message || "Error al iniciar sesión.");
        }
      } else {
        setError("Error de conexión. Intenta de nuevo.");
      }
    }
  }

  return {
    form,
    error,
    isLoading,
    showPassword,
    handleChange,
    handleSubmit,
    togglePassword,
  };
}
