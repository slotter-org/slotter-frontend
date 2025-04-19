// src/pages/LandingPage.tsx

import React from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Check,
  ChevronRight,
  BarChart3,
  TrendingUp,
  Clock,
  Boxes,
  Truck,
} from "lucide-react"

// A standalone landing page component.
// Replace all "href" usage with react-router-dom <Link to="..."> if it's an internal route,
// or <a href="..."> if it’s external.
export function LandingPage() {
  return (
    <ScrollArea>
      <div className="flex items-center min-h-screen flex-col">
        <main className="flex-1">
          {/* Hero Section */}
          <section className="space-y-6 pb-8 pt-10 md:pb-12 md:pt-16 lg:py-32">
            <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
              <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
                Optimize Your Warehouse{" "}
                <span className="text-primary">Slotting</span>
              </h1>
              <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                Slotter helps you maximize warehouse efficiency, reduce picking
                times, and lower operational costs with AI-powered slotting
                optimization.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button size="lg">
                  Request Demo
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="container py-8 md:py-12">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="text-3xl font-bold text-primary md:text-4xl">
                  30%
                </div>
                <p className="mt-2 text-muted-foreground">
                  Reduction in picking time
                </p>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <div className="text-3xl font-bold text-primary md:text-4xl">
                  25%
                </div>
                <p className="mt-2 text-muted-foreground">
                  Increase in warehouse efficiency
                </p>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <div className="text-3xl font-bold text-primary md:text-4xl">
                  20%
                </div>
                <p className="mt-2 text-muted-foreground">
                  Reduction in operational costs
                </p>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section
            id="features"
            className="container space-y-6 bg-slate-50 py-8 dark:bg-slate-900/30 md:py-12 lg:py-24"
          >
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
                Why Choose Slotter
              </h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Our advanced slotting optimization platform delivers measurable
                results for warehouses of all sizes.
              </p>
            </div>
            <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
              <Card>
                <CardHeader>
                  <BarChart3 className="h-10 w-10 text-primary" />
                  <CardTitle>Data-Driven Decisions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Make informed slotting decisions based on real-time data
                    analysis and historical patterns.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <TrendingUp className="h-10 w-10 text-primary" />
                  <CardTitle>Continuous Optimization</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Our AI continuously adapts to changing inventory patterns to
                    maintain peak efficiency.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Clock className="h-10 w-10 text-primary" />
                  <CardTitle>Rapid Implementation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Get up and running quickly with our intuitive platform and
                    expert implementation team.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ... more sections omitted for brevity, same structure ... */}

          {/* CTA Section */}
          <section className="container py-8 md:py-12 lg:py-24">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
                Ready to optimize your warehouse?
              </h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Join hundreds of companies improving their warehouse efficiency
                with Slotter.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button size="lg">
                  Schedule a Demo
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg">
                  View Case Studies
                </Button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t py-6 md:py-0">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              © 2023 Slotter. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {/* Use <Link to="..."> for your internal routes */}
              <Link to="#" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
                Terms
              </Link>
              <Link to="#" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
                Privacy
              </Link>
              <Link to="#" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </ScrollArea>
  )
}

