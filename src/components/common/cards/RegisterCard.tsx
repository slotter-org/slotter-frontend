// src/components/common/cards/RegisterPage.tsx
import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { z } from "zod"

import { AuthLayout } from "@/layouts/AuthLayout"
import { AuthForm, AuthFormStep } from "@/components/common/AuthForm"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"

/**
 * A 2-step wizard:
 *  Step 1 => collect email
 *  Step 2 => has “company” vs “wms” tabs, plus first/last/password
 * On finish => go to /login?prefillEmail=... so they can auto-login
 */
export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  // Step1
  const step1: AuthFormStep = {
    key: "step1",
    title: "Create an account",
    description: "First, enter your email",
    schema: z.object({
      email: z.string().email("Invalid email"),
    }),
    fields: [
      { name: "email", label: "Email", placeholder: "you@example.com", type: "email" },
    ],
    onSubmit: async () => {
      // no server call here
    },
  }

  // Step2 with tabs
  const step2: AuthFormStep = {
    key: "step2",
    title: (allData) => {
      return allData.accountType === "company"
        ? "Finish registering with a Company"
        : "Finish registering with a Wms"
    },
    description: "Fill in these details to complete your account",
    schema: z.object({
      email: z.string().email(),
      accountType: z.enum(["company", "wms"]),
      companyName: z.string().optional(),
      wmsName: z.string().optional(),
      firstName: z.string().min(1, "First name required"),
      lastName: z.string().min(1, "Last name required"),
      password: z.string().min(6, "Password must be at least 6 chars"),
    }).refine((vals) => {
      if (vals.accountType === "company") {
        return !!vals.companyName
      }
      return !!vals.wmsName
    }, {
      message: "Please enter a company or wms name",
      path: ["companyName"], // or wmsName
    }),
    fields: [
      { name: "firstName", label: "First Name" },
      { name: "lastName", label: "Last Name" },
      { name: "password", label: "Password", type: "password" },
    ],
    tabs: {
      fieldName: "accountType",
      items: [
        {
          key: "company",
          label: "Company",
          fields: [
            { name: "companyName", label: "Company Name", placeholder: "Acme Inc." },
          ],
        },
        {
          key: "wms",
          label: "Wms",
          fields: [
            { name: "wmsName", label: "Wms Name", placeholder: "PickMagic 3000" },
          ],
        },
      ],
    },
    onMount: (setVal, allData) => {
      // default to "company"
      setVal("accountType", "company")
      // copy email from step1
      if (allData.email) {
        setVal("email", allData.email)
      }
    },
    onSubmit: async (vals) => {
      const isCompany = vals.accountType === "company";
      const newCompanyName = isCompany ? vals.companyName : "";
      const newWmsName = !isCompany ? vals.wmsName : "";
      try {
        await register(
          vals.email,
          vals.password,
          vals.firstName,
          vals.lastName,
          newCompanyName,
          newWmsName,
          undefined,
          undefined,
        );
      } catch (err) {
        throw new Error("Registration failed")
      }
    },
  }

  function handleFinished(allData: Record<string, any>) {
    const email = allData.email || ""
    const pw = allData.password || ""
    // redirect to /login so it can auto-fill
    navigate(`/login?prefillEmail=${encodeURIComponent(email)}&prefillPw=${encodeURIComponent(pw)}`)
  }

  // We define the steps
  const steps = [step1, step2]

  // Decide what the ghost button does: if we’re on step 0, show “Login” link; if on step1, show “Back”.
  // However, we only know the step index from `onStepChange`.
  let ghostButton
  if (currentStepIndex === 0) {
    // “Login” link
    ghostButton = (
      <Button variant="ghost" asChild>
        <Link to="/login">Login</Link>
      </Button>
    )
  } else {
    // We’re on step2 => “Back” button that goes back a step
    // We'll rely on AuthForm’s internal “goBack” by just faking a click on the back button.
    // One approach: We can store a ref to the form, or we can let the user just use the built-in back button in the form itself.
    // For demonstration, let's show how to do it "manually" using a callback:
    ghostButton = (
      <Button variant="ghost" onClick={() => setCurrentStepIndex(0)}>
        Back
      </Button>
    )
  }

  return (
    <AuthLayout ghostButton={ghostButton} logoSrc="/logo-dark-full-icon.svg">
      <AuthForm
        steps={steps}
        onFinished={handleFinished}
        finalLabel="Register"
        onStepChange={(idx) => setCurrentStepIndex(idx)}
      />
    </AuthLayout>
  )
}

