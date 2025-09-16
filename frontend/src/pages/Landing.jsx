import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ThemeToggle } from "../components/theme-toggle";
import { ScrollToTop } from "../components/scroll-to-top";
import {
  CheckCircle,
  Mic,
  Brain,
  Star,
  ArrowRight,
  Play,
  Github,
  Twitter,
  Linkedin,
  Shield,
  Menu,
  X,
} from "lucide-react";

const Landing = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleDashboardNavigate = () => {
    navigate("/dashboard");
  };

  const handleMobileDashboardNavigate = () => {
    setIsMobileMenuOpen(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Neucom</span>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#impact"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Impact
            </a>
            <a
              href="#testimonials"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Success Stories
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </a>
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={handleDashboardNavigate}
            >
              Sign In
            </Button>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-xs sm:text-sm px-3 sm:px-4"
              onClick={handleDashboardNavigate}
            >
              Try Now - Free
            </Button>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden h-8 w-8 p-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur">
            <nav className="container mx-auto max-w-screen-xl px-4 py-4 space-y-4">
              <a
                href="#features"
                className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#impact"
                className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Impact
              </a>
              <a
                href="#testimonials"
                className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Success Stories
              </a>
              <a
                href="#pricing"
                className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <div className="pt-2 border-t border-border/40">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleMobileDashboardNavigate}
                >
                  Sign In
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-6 sm:py-10 lg:py-14">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl" aria-hidden="true" />
          {/* <div className="absolute inset-y-0 left-1/2 hidden w-px bg-border/60 lg:block" aria-hidden="true" /> */}
        </div>
        <div className="container mx-auto relative z-10 max-w-screen-xl px-4">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center">
            <div className="">
              <Badge variant="secondary" className="mb-4 w-fit text-xs sm:text-sm">
                <Mic className="mr-2 h-3 w-3" />
                Where Human Expertise Meets Neural Intelligence
              </Badge>

              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-foreground">
                Neural Computation for <span className="text-primary">Human Excellence</span>
              </h1>

              <p className="mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground lg:max-w-xl">
                Neucom blends advanced neural interfaces with human insight to orchestrate precision operations at scale.
                Empower every frontline specialist with a conversational co-pilot that understands your procedures and makes
                decision-ready knowledge available in seconds.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                  onClick={handleDashboardNavigate}
                >
                  Start Your Neural Journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => window.open("https://drive.google.com/file/d/1auGDbQ-zIBk2MXbOHSJF_mHvIa3YUk7j/view", "_blank")}>
                  <Play className="mr-2 h-4 w-4" />
                  Watch Vision Film
                </Button>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-amber-500/10 p-2">
                    <CheckCircle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Hands-free workflows</p>
                    <p>Voice-first assistance tuned for high-stakes environments.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-amber-500/10 p-2">
                    <CheckCircle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Neural-grade security</p>
                    <p>Air-gapped deployment aligned to Fortune 500 compliance.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-amber-500/10 p-2">
                    <CheckCircle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Insight acceleration</p>
                    <p>Surface critical knowledge in under three seconds.</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 hidden flex-wrap items-center gap-6 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground sm:flex">
                <span className="text-foreground/70">Trusted by innovators at</span>
                <img
                  src="https://miditasindia.com/wp-content/uploads/2024/05/cropped-Add-a-heading-scaled-1.jpg"
                  alt="Miditas logo"
                  className="h-7 w-auto opacity-70 transition-opacity hover:opacity-100"
                />
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-primary/10 via-transparent to-amber-500/20 blur-3xl" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-[32px] border border-border/50 bg-card/80 shadow-2xl backdrop-blur">
                <img
                  src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80"
                  alt="Operations experts collaborating in a mission control room"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" aria-hidden="true" />
                <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-4 rounded-2xl border border-border/60 bg-background/90 p-6 shadow-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-muted-foreground">Live procedure session</span>
                    <span className="text-xs text-muted-foreground">Neucom Control • Secured</span>
                  </div>
                  <div className="grid grid-cols-3 gap-6 text-center text-sm">
                    <div>
                      <p className="text-2xl font-semibold text-foreground">98%</p>
                      <p className="text-muted-foreground">Guidance accuracy</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-foreground"><span className="text-amber-500">-47%</span></p>
                      <p className="text-muted-foreground">Incident response time</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-foreground">190+</p>
                      <p className="text-muted-foreground">Global deployments</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section id="features" className="py-16 sm:py-20 bg-gradient-to-br from-primary/5 via-background to-muted/20">
        <div className="container mx-auto max-w-screen-xl px-4">
          <div className="mx-auto max-w-3xl text-center mb-12 sm:mb-16">
            <Badge variant="secondary" className="mb-4 text-xs sm:text-sm uppercase tracking-[0.3em]">
              Core Capabilities
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Everything operations teams need in one neural workspace
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground px-4 sm:px-0">
              Upload SOPs, surface answers, and execute procedures without digging through static documents.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center">
            <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-2">
              <Card className="flex h-full flex-col p-6">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">SOP intelligence engine</CardTitle>
                <CardDescription className="mt-3 text-sm text-muted-foreground">
                  Parse procedures, diagrams, and tacit know-how into a single, trusted knowledge graph that stays current.
                </CardDescription>
              </Card>

              <Card className="flex h-full flex-col p-6">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Mic className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Conversational copilots</CardTitle>
                <CardDescription className="mt-3 text-sm text-muted-foreground">
                  Voice and chat guidance delivers precise, step-by-step instructions with citations and escalation paths.
                </CardDescription>
              </Card>

              <Card className="flex h-full flex-col p-6">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Operational control room</CardTitle>
                <CardDescription className="mt-3 text-sm text-muted-foreground">
                  Live dashboards, audit logs, and readiness alerts keep compliance teams and field operators aligned.
                </CardDescription>
              </Card>

              <Card className="flex h-full flex-col p-6">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Actionable insights</CardTitle>
                <CardDescription className="mt-3 text-sm text-muted-foreground">
                  Surface trends, risks, and opportunities for leaders with instant executive-ready summaries.
                </CardDescription>
              </Card>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-tr from-primary/20 via-primary/5 to-amber-400/15 blur-3xl" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-[36px] border border-border/60 bg-background/80 shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1100&q=80"
                  alt="Operations team reviewing live analytics"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/10 to-transparent" aria-hidden="true" />
                {/* <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3 rounded-2xl border border-border/50 bg-background/90 p-5 shadow-lg">
                  <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                    <span>Ops Console • Live</span>
                    <span>Neural Sync</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center text-xs">
                    <div>
                      <p className="text-lg font-semibold text-foreground">312</p>
                      <p className="text-muted-foreground">Procedures tracked</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground">28</p>
                      <p className="text-muted-foreground">Active alerts</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground">4</p>
                      <p className="text-muted-foreground">Sites in sync</p>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Operational Outcomes */}
      <section id="impact" className="py-16 sm:py-20 bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="container mx-auto max-w-screen-xl px-4">
          <div className="rounded-3xl border border-border/60 bg-background/80 p-6 sm:p-10 shadow-sm">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center">
              <div>
                <div className="grid gap-6 sm:grid-cols-3">
                  <div>
                    <p className="text-3xl font-bold text-foreground">-47%</p>
                    <p className="text-sm text-muted-foreground">Mean reduction in response time for incidents</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">+3x</p>
                    <p className="text-sm text-muted-foreground">Faster onboarding for new frontline specialists</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">99.8%</p>
                    <p className="text-sm text-muted-foreground">Procedure adherence with automatic audit trails</p>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Secure by default</p>
                      <p className="text-sm text-muted-foreground">Deployed in your cloud or on-prem with full data ownership.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Built for live operations</p>
                      <p className="text-sm text-muted-foreground">Hands-free workflows, offline continuity, and multi-language support.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-tr from-primary/15 via-primary/5 to-cyan-400/20 blur-xl" aria-hidden="true" />
                <div className="relative overflow-hidden rounded-[32px] border border-border/60 bg-background/80 shadow-xl">
                  <img
                    src="https://www.microsoft.com/en-us/research/wp-content/uploads/2020/05/prose-team-1024x683.jpg"
                    alt="Field engineer using Neucom guidance"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" aria-hidden="true" />
                  <div className="absolute top-6 right-6 flex flex-col gap-3 text-xs font-medium text-muted-foreground">
                    <div className="rounded-full border border-border/60 bg-background/80 px-4 py-2 shadow">
                      Faster Onboarding
                    </div>
                    {/* <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3 shadow">
                      <p className="text-foreground">Procedure in progress</p>
                      <p>Step 3 • Cooling system recalibration</p>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tailored Plans */}
      <section id="pricing" className="py-16 sm:py-20 bg-gradient-to-br from-primary/5 via-background to-muted/20">
        <div className="container mx-auto max-w-screen-xl px-4">
          <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Choose the runway that fits your rollout
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground px-4 sm:px-0">
              Start small with a focused pilot or standardize guidance across every site.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
            <Card className="relative flex h-full flex-col border border-border/60 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Pilot Squad</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Perfect for validating live SOP assistance with a single team.
                </CardDescription>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">$0</span>
                  <span className="text-sm text-muted-foreground">per seat / month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-primary" />
                    Unlimited SOP uploads & smart search
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-primary" />
                    Voice + chat guidance for frontline teams
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-primary" />
                    Activity logs with exportable transcripts
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="mt-auto pt-2">
                <Button variant="outline" className="w-full">Start Free</Button>
              </CardFooter>
            </Card>

            <Card className="relative flex h-full flex-col border border-primary/60 bg-card shadow-lg shadow-primary/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground text-xs sm:text-sm">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Scale Ops</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Roll out conversational SOP orchestration across multiple locations.
                </CardDescription>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">$79</span>
                  <span className="text-sm text-muted-foreground">per seat / month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-primary" />
                    Predictive workflow routing & alerts
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-primary" />
                    Secure deployment in your VPC or on-prem
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-primary" />
                    Dedicated success architect and training hub
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="mt-auto pt-2">
                <Button className="w-full">Book a Demo</Button>
              </CardFooter>
            </Card>

            <Card className="relative flex h-full flex-col border border-border/60 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Enterprise Command</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Tailored governance, hybrid deployments, and expert copilots for global operations.
                </CardDescription>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">Custom</span>
                  <span className="text-sm text-muted-foreground">engagement</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-primary" />
                    Federated knowledge graph with RBAC controls
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-primary" />
                    AI safety, compliance, and audit specialists
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-primary" />
                    24/7 global response with command center views
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="mt-auto pt-2">
                <Button variant="outline" className="w-full">Talk to Sales</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
      {/* Testimonials */}
      <section id="testimonials" className="py-16 sm:py-20 bg-gradient-to-br from-background via-primary/5 to-muted/20">
        <div className="container mx-auto max-w-screen-xl px-4">
          <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">Trusted by mission-critical teams</h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground px-4 sm:px-0">
              Neucom becomes the voice of experience for operators where seconds matter.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
            <Card className="bg-card/90 p-4 sm:p-6 shadow-sm">
              <CardContent className="p-0 space-y-4">
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <blockquote className="text-sm sm:text-base text-muted-foreground">
                  "Neucom cuts through the noise during overnight incidents. Engineers ask a question and get verified next
                  steps instantly—no more paging through binders while alarms are blaring."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">SG</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Sonia Gupta</p>
                    <p className="text-xs text-muted-foreground">Director of Operations, GridCo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/90 p-4 sm:p-6 shadow-sm">
              <CardContent className="p-0 space-y-4">
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <blockquote className="text-sm sm:text-base text-muted-foreground">
                  "Training a new cohort of technicians used to take quarters. With Neucom's conversational SOPs, we hit
                  proficiency in weeks and can certify everyone with full audit trails."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">MT</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Marcos Tanaka</p>
                    <p className="text-xs text-muted-foreground">Reliability Lead, AeroLogix</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-primary via-primary/90 to-primary/80">
        <div className="container mx-auto max-w-screen-xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-primary-foreground mb-4">
              Join the Neural Revolution
            </h2>
            <p className="text-base sm:text-lg text-primary-foreground/80 mb-6 px-4 sm:px-0">
              Every day teams struggle with information overload, critical knowledge gaps, and the challenge of maintaining excellence under pressure. Neucom represents a fundamental shift: from information systems to intelligence systems.
            </p>
            <p className="text-sm sm:text-base text-primary-foreground/90 mb-6 sm:mb-8">
              Your procedures. Your knowledge. Enhanced by neural computation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={handleDashboardNavigate}
              >
                Start Your Neural Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent w-full sm:w-auto"
                onClick={() => window.open('https://github.com/NamanSingh24/NeuCom')} 
              >
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-primary-foreground/70 mt-6 px-4 sm:px-0">
              Upload your first SOP. Ask your first question. Hear the difference neural intelligence makes.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto max-w-screen-xl py-8 sm:py-12 px-4">
          <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Brain className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">Neucom</span>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xs">
                Neural Computation for Human Excellence. Where every question becomes insight, every procedure becomes conversation.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://github.com/NamanSingh24/NeuCom" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left">© 2024 Neucom. All rights reserved.</p>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      <ScrollToTop />
    </div>
  );
};

export default Landing;
