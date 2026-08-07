import { useForm } from "@tanstack/react-form"
import { createFileRoute, getRouteApi, Link, useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { authClient } from "@/lib/auth/auth-client"
import { signUpCredentialsSchema } from "@/lib/auth/forms"
import { authRedirectSearchSchema, getSafeRedirect } from "@/lib/auth/redirect"
import { getFormErrorMessage } from "@/lib/form-errors"

const deriveNameFromEmail = (email: string) => {
  const [localPart] = email.split("@")
  const trimmed = localPart?.trim()
  return trimmed !== undefined && trimmed !== null && trimmed.length > 0 ? trimmed : "user"
}

const signUpRouteApi = getRouteApi("/sign-up")

const SignUpPage = () => {
  const navigate = useNavigate()
  const search = signUpRouteApi.useSearch()

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: signUpCredentialsSchema,
    },
    onSubmit: async ({ value }) => {
      const derivedName = deriveNameFromEmail(value.email)
      const result = await authClient.signUp.email({
        email: value.email,
        name: derivedName,
        password: value.password,
      })

      if (result.error) {
        toast.add({
          type: "error",
          title: "Sign up failed",
          description: result.error.message ?? "Could not create account.",
          priority: "high",
        })
        return
      }

      const redirectTo = getSafeRedirect(search.redirect, "/upload")
      if (redirectTo.startsWith("/")) {
        await navigate({ to: redirectTo })
      }
    },
  })

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create an account with email and password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              if (form.state.isSubmitting) {
                return
              }
              void form.handleSubmit()
            }}
          >
            <FieldGroup>
              <form.Field name="email">
                {(field) => {
                  const fieldError = getFormErrorMessage(field.state.meta.errors[0])
                  const isInvalid = fieldError !== null

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        aria-invalid={isInvalid}
                        autoComplete="email"
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) => {
                          field.handleChange(event.target.value)
                        }}
                        placeholder="you@example.com"
                        type="email"
                        value={field.state.value}
                      />
                      {isInvalid ? <FieldError>{fieldError}</FieldError> : null}
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field name="password">
                {(field) => {
                  const fieldError = getFormErrorMessage(field.state.meta.errors[0])
                  const isInvalid = fieldError !== null

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <Input
                        aria-invalid={isInvalid}
                        autoComplete="new-password"
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(event) => {
                          field.handleChange(event.target.value)
                        }}
                        placeholder="At least 8 characters"
                        type="password"
                        value={field.state.value}
                      />
                      {isInvalid ? <FieldError>{fieldError}</FieldError> : null}
                    </Field>
                  )
                }}
              </form.Field>
            </FieldGroup>

            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? (
                    <>
                      <Spinner data-icon="inline-start" />
                      Creating account...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm">
            Already have an account?{" "}
            <Link className="underline underline-offset-4" to="/sign-in">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  )
}

export const Route = createFileRoute("/sign-up")({
  validateSearch: authRedirectSearchSchema,
  component: SignUpPage,
})
