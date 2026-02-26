"use client";

// hooks/auth/use-register.ts
// Encapsulates all register page logic: form state, validation, submission, errors.

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/auth-context";
import { ApiClientError } from "@/lib/api-client";

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function useRegister() {
  const router = useRouter();
  const { register: registerUser, isActionLoading: isLoading } = useAuth();

  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
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

    // Client-side validations
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      await registerUser(form.email, form.password, form.name);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 409) {
          setError("Ya existe una cuenta con ese correo.");
        } else if (err.status === 429) {
          setError("Demasiados intentos. Espera un momento.");
        } else {
          setError(err.message || "No se pudo crear la cuenta.");
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
