// src/components/common/AuthForm.tsx

import React, { useEffect, useState } from "react"
import { useForm, FormProvider, useFormContext } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** A single field definition. */
export interface AuthFormField {
  name: string
  label: string
  placeholder?: string
  type?: React.InputHTMLAttributes<unknown>["type"]
}

/** A tab definition for a sub-form. */
export interface AuthFormTab {
  key: string
  label: string
  fields: AuthFormField[]
}

/**
 * A single step in the multi-step Auth wizard.
 */
export interface AuthFormStep {
  key: string
  title?: string | ((allDataSoFar: Record<string, any>) => string)
  description?: string | ((allDataSoFar: Record<string, any>) => string)

  /** The Zod schema for the fields in this step (and its tabs, if any). */
  schema: z.ZodObject<any>

  /** Non-tab fields for this step. */
  fields: AuthFormField[]

  /** Optional tab logic. If present, we show a <TabsList> etc. */
  tabs?: {
    fieldName: string
    items: AuthFormTab[]
  }

  /**
   * Called after validation, before proceeding to next step.
   * Throw an error or return { nextStep: "stepKey" } to jump.
   */
  onSubmit?: (
    stepValues: Record<string, any>,
    allDataSoFar: Record<string, any>
  ) => Promise<void | { nextStep?: string }> | void | { nextStep?: string }

  /**
   * Called once when the step is first loaded (e.g. to do auto-fill).
   */
  onMount?: (
    setFieldValue: (fieldName: string, value: any) => void,
    allDataSoFar: Record<string, any>
  ) => Promise<void> | void

  /**
   * If returns true, skip the step entirely.
   */
  shouldSkip?: (allDataSoFar: Record<string, any>) => boolean
}

export interface AuthFormProps {
  className?: string
  steps: AuthFormStep[]
  initialStepKey?: string
  /** Called when finishing the last step. */
  onFinished?: (allData: Record<string, any>) => void

  /** If you want to track the current step index externally. */
  onStepChange?: (stepIndex: number) => void

  // Button labels
  nextLabel?: string
  backLabel?: string
  finalLabel?: string
}

/**
 * The main AuthForm component.
 * - Single or multi-step
 * - Optional tab logic
 * - Uses react-hook-form with Zod
 */
export function AuthForm({
  className,
  steps,
  initialStepKey,
  onFinished,
  onStepChange,
  nextLabel = "Next",
  backLabel = "Back",
  finalLabel = "Submit",
}: AuthFormProps) {
  const [collectedData, setCollectedData] = useState<Record<string, any>>({})
  const [currentStepKey, setCurrentStepKey] = useState<string>(
    initialStepKey || (steps[0]?.key ?? "")
  )
  const [loadingStep, setLoadingStep] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Identify current step
  const currentStepIndex = steps.findIndex((s) => s.key === currentStepKey)
  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null

  // Inform parent if needed
  useEffect(() => {
    onStepChange?.(currentStepIndex)
  }, [currentStepIndex, onStepChange])

  if (!currentStep && steps.length > 0) {
    throw new Error(`[AuthForm] invalid step key: "${currentStepKey}"`)
  }
  if (!currentStep) return null

  // Possibly skip
  useEffect(() => {
    if (currentStep.shouldSkip?.(collectedData)) {
      goForward()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepKey])

  // Create a single form instance for the current step
  const formMethods = useForm({
    resolver: zodResolver(currentStep.schema),
    defaultValues: gatherInitialValues(currentStep, collectedData),
    mode: "onSubmit",
  })

  // onMount
  useEffect(() => {
    let canceled = false
    ;(async () => {
      if (currentStep.onMount) {
        setLoadingStep(true)
        try {
          await currentStep.onMount(
            (fieldName, val) => {
              if (!canceled) {
                formMethods.setValue(fieldName, val)
              }
            },
            collectedData
          )
        } finally {
          if (!canceled) setLoadingStep(false)
        }
      }
    })()
    return () => {
      canceled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepKey])

  async function handleSubmit(values: any) {
    setFormError(null)
    const mergedData = { ...collectedData, ...values }
    setCollectedData(mergedData)

    if (currentStep.onSubmit) {
      try {
        const result = await currentStep.onSubmit(values, mergedData)
        if (result && result.nextStep) {
          // Jump to a specific step
          setCurrentStepKey(result.nextStep)
          return
        }
      } catch (err: any) {
        console.error("[AuthForm] onSubmit error:", err)
        setFormError(err.message || "An unexpected error occurred.")
        return
      }
    }
    // If no custom step jump, proceed normally
    goForward(mergedData)
  }

  function goForward(latestData?: Record<string, any>) {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStepKey(steps[nextIndex].key)
    } else {
      // Done
      onFinished?.(latestData ?? collectedData)
    }
  }

  function goBack() {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStepKey(steps[prevIndex].key)
    }
  }

  // Step title/desc can be dynamic functions
  const stepTitle =
    typeof currentStep.title === "function"
      ? currentStep.title(collectedData)
      : currentStep.title || ""

  const stepDesc =
    typeof currentStep.description === "function"
      ? currentStep.description(collectedData)
      : currentStep.description || ""

  // Does this step have tab logic?
  const hasTabs = !!currentStep.tabs

  return (
    <Form {...formMethods}>
      <form
        onSubmit={formMethods.handleSubmit(handleSubmit)}
        className={cn("w-full", className)}
      >
        {hasTabs ? (
          <TabsLayout
            step={currentStep}
            stepTitle={stepTitle}
            stepDesc={stepDesc}
            formError={formError}
            loadingStep={loadingStep}
            isFirstStep={currentStepIndex === 0}
            isLastStep={currentStepIndex === steps.length - 1}
            backLabel={backLabel}
            nextLabel={nextLabel}
            finalLabel={finalLabel}
            goBack={goBack}
          />
        ) : (
          <SingleLayout
            step={currentStep}
            stepTitle={stepTitle}
            stepDesc={stepDesc}
            formError={formError}
            loadingStep={loadingStep}
            isFirstStep={currentStepIndex === 0}
            isLastStep={currentStepIndex === steps.length - 1}
            backLabel={backLabel}
            nextLabel={nextLabel}
            finalLabel={finalLabel}
            goBack={goBack}
          />
        )}
      </form>
    </Form>
  )
}

/** Single-step layout (no tabs). Uses form context from parent. */
function SingleLayout({
  step,
  stepTitle,
  stepDesc,
  formError,
  loadingStep,
  isFirstStep,
  isLastStep,
  backLabel,
  nextLabel,
  finalLabel,
  goBack,
}: {
  step: AuthFormStep
  stepTitle: string
  stepDesc: string
  formError: string | null
  loadingStep: boolean
  isFirstStep: boolean
  isLastStep: boolean
  backLabel: string
  nextLabel: string
  finalLabel: string
  goBack: () => void
}) {
  // Use the parent's form context
  const { formState } = useFormContext()

  return (
    <Card className="bg-card animate-in fade-in-50 zoom-in-75 duration-300">
      <CardHeader>
        <CardTitle className="text-2xl">{stepTitle}</CardTitle>
        {stepDesc && <CardDescription>{stepDesc}</CardDescription>}
      </CardHeader>
      <CardContent>
        {formError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        {loadingStep ? (
          <div className="text-sm">Loading...</div>
        ) : (
          <>
            <StepFields fields={step.fields} />

            <div className="mt-6 flex items-center justify-between">
              {!isFirstStep && (
                <Button variant="ghost" type="button" onClick={goBack}>
                  {backLabel}
                </Button>
              )}
              <Button type="submit">
                {isLastStep ? finalLabel : nextLabel}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

/** Step layout if using tabs. Entire step is wrapped in <Tabs>. */
function TabsLayout({
  step,
  stepTitle,
  stepDesc,
  formError,
  loadingStep,
  isFirstStep,
  isLastStep,
  backLabel,
  nextLabel,
  finalLabel,
  goBack,
}: {
  step: AuthFormStep
  stepTitle: string
  stepDesc: string
  formError: string | null
  loadingStep: boolean
  isFirstStep: boolean
  isLastStep: boolean
  backLabel: string
  nextLabel: string
  finalLabel: string
  goBack: () => void
}) {
  const { watch, setValue } = useFormContext()
  const tabFieldName = step.tabs!.fieldName
  const tabValue = watch(tabFieldName)

  // If user hasn’t selected a tab, default to first tab
  useEffect(() => {
    if (!tabValue && step.tabs?.items.length) {
      setValue(tabFieldName, step.tabs.items[0].key)
    }
  }, [tabValue, setValue, step.tabs])

  function onTabChange(value: string) {
    setValue(tabFieldName, value)
  }

  return (
    <Card className="bg-card text-foreground animate-in fade-in-50 zoom-in-75 duration-300">
      <CardHeader>
        <CardTitle className="text-2xl">{stepTitle}</CardTitle>
        {stepDesc && <CardDescription>{stepDesc}</CardDescription>}
      </CardHeader>
      <CardContent>
        {formError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        {loadingStep ? (
          <div className="text-sm">Loading...</div>
        ) : (
          <Tabs
            value={tabValue || ""}
            onValueChange={onTabChange}
            className="animate-in fade-in-50 zoom-in-75 duration-300"
          >
            {/* If there's more than one tab item, show the tab list */}
            {step.tabs?.items.length! > 1 && (
              <TabsList className="mb-4">
                {step.tabs?.items.map((t) => (
                  <TabsTrigger key={t.key} value={t.key}>
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            )}

            {/* Render each tab's fields */}
            {step.tabs?.items.map((tab) => (
              <TabsContent key={tab.key} value={tab.key}>
                <StepFields fields={tab.fields} />
              </TabsContent>
            ))}

            {/* Also render any non-tab fields */}
            {step.fields.length > 0 && (
              <div className="mt-4">
                <StepFields fields={step.fields} />
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              {!isFirstStep && (
                <Button variant="ghost" type="button" onClick={goBack}>
                  {backLabel}
                </Button>
              )}
              <Button type="submit">
                {isLastStep ? finalLabel : nextLabel}
              </Button>
            </div>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

/** Renders a list of fields with <FormField> => <Controller>. */
function StepFields({ fields }: { fields: AuthFormField[] }) {
  // Use parent's form context
  const { control } = useFormContext()

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field) => (
        <FormField
          key={field.name}
          control={control}
          name={field.name}
          render={({ field: rhfField }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>{field.label}</FormLabel>
              </div>
              <FormControl>
                <Input
                  {...rhfField}
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  )
}

/**
 * Fills initial values from big "collectedData" so
 * each step's form doesn't start undefined -> becomes controlled.
 */
function gatherInitialValues(
  step: AuthFormStep,
  allData: Record<string, any>
) {
  const obj: Record<string, any> = {}

  // For each field, if we have a value, use it; else use ''
  step.fields.forEach((f) => {
    obj[f.name] = allData[f.name] ?? ""
  })

  // Tab fields
  if (step.tabs) {
    const tabFieldName = step.tabs.fieldName
    // might be e.g. "accountType"
    obj[tabFieldName] = allData[tabFieldName] ?? ""

    for (const tab of step.tabs.items) {
      for (const f of tab.fields) {
        obj[f.name] = allData[f.name] ?? ""
      }
    }
  }

  return obj
}

