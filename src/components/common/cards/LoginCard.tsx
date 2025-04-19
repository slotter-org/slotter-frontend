// src/components/common/cards/LoginPage.tsx
import React, { useState } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { z } from "zod"

import { AuthLayout } from "@/layouts/AuthLayout"
import { AuthForm, AuthFormStep } from "@/components/common/AuthForm"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()

  // Single-step definition
  const loginStep: AuthFormStep = {
    key: "login",
    title: "Login",
    description: "Enter your email/password to sign in",
    schema: z.object({
      email: z.string().email("Invalid email"),
      password: z.string().min(1, "Password required"),
    }),
    fields: [
      { name: "email", label: "Email", placeholder: "someone@example.com", type: "email" },
      { name: "password", label: "Password", type: "password" },
    ],
    onMount: async (setValue) => {
      // If we have ?prefillEmail=... & ?prefillPw=..., attempt auto-login
      const autoEmail = searchParams.get("prefillEmail")
      const autoPw = searchParams.get("prefillPw")

      if (autoEmail && autoPw) {
        // Fill the fields so user sees them
        setValue("email", autoEmail)
        setValue("password", autoPw)
        // Attempt login
        try {
          await login(autoEmail, autoPw)
          navigate("/dashboard")
        } catch {
          // If it fails, we let the user try manually
        }
      }
    },
    onSubmit: async (vals) => {
      // Manual submit
      try {
        await login(vals.email, vals.password)
      } catch (err) {
        console.log(vals.email, vals.password)
        throw new Error("Login failed. Check your credentials.")
      }
    },
  }

  function handleFinished() {
    // Called after the single step completes successfully => go to dash
    navigate("/dashboard")
  }

  return (
    <AuthLayout
      logoSrc="/logo-dark-full-icon.svg"
      ghostButton={
        <Link to="/register">
          <Button variant="ghost">Register</Button>
        </Link>
      }
    >
      <AuthForm
        steps={[loginStep]}
        onFinished={handleFinished}
        finalLabel="Login"
      />
    </AuthLayout>
  )
}

