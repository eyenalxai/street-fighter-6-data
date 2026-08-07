import { createFileRoute, Link } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const Home = () => (
  <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
    <Card>
      <CardHeader>
        <CardTitle>Stuff App</CardTitle>
        <CardDescription>Public and authenticated flows with Better Auth.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button render={<Link to="/stuff" />}>View Public Stuff</Button>
        <Button render={<Link to="/upload" />} variant="secondary">
          Upload Stuff
        </Button>
        <Button render={<Link to="/sign-in" />} variant="outline">
          Sign In
        </Button>
        <Button render={<Link to="/sign-up" />} variant="outline">
          Sign Up
        </Button>
      </CardContent>
    </Card>
  </main>
)

export const Route = createFileRoute("/")({
  component: Home,
})
