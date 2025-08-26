import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Mic,
  Brain,
  Users,
  Star,
  ArrowRight,
  Play,
  Github,
  Twitter,
  Linkedin,
  Clock,
  AlertTriangle,
  Zap,
  Shield,
  Network,
  Headphones,
} from "lucide-react"

export default function StreamLineLanding() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-xl items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">StreamLine</span>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="#story"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Our Story
            </a>
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
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

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Try Now - Free
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background py-20 sm:py-32">
        <div className="container max-w-screen-xl">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Mic className="mr-2 h-3 w-3" />
              Where Human Expertise Meets Neural Intelligence
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Transform Your Standard Operating Procedures with <span className="text-primary">AI</span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Upload documents, ask questions, get instant answers. Your intelligent SOP assistant powered by advanced
              neural computation and voice technology that understands procedures like your best employee.
            </p>

            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Start Your Neural Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-x-8 text-sm text-muted-foreground">
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-accent" />
                No signup required
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-accent" />
                Process documents instantly
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-accent" />
                Voice-enabled
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section id="story" className="py-20 bg-muted/30">
        <div className="container max-w-screen-xl">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">The 3 AM Crisis</h2>
              <p className="text-lg text-muted-foreground">
                In the fast-paced world of modern operations, your team's knowledge is your greatest asset. But what
                happens when that knowledge is trapped?
              </p>
            </div>

            <Card className="bg-gradient-to-r from-destructive/5 to-destructive/10 border-destructive/20 mb-12">
              <CardContent className="pt-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-lg bg-destructive/20 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-destructive" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Picture this: It's 3 AM</h3>
                    <p className="text-muted-foreground mb-4">
                      A critical system failure occurs. Your best technician is off-duty. The junior engineer on call
                      frantically searches through 200+ pages of SOPs, knowing that one missed step could cost
                      thousands.
                    </p>
                    <p className="text-sm font-medium text-destructive">Sound familiar?</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-8 sm:grid-cols-3 mb-12">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-lg bg-chart-1/10 flex items-center justify-center mb-4">
                  <AlertTriangle className="h-8 w-8 text-chart-1" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">67% of workplace errors</h4>
                <p className="text-sm text-muted-foreground">stem from information accessibility issues</p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-lg bg-chart-2/10 flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-chart-2" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">40% of time wasted</h4>
                <p className="text-sm text-muted-foreground">searching for procedural information</p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-lg bg-chart-3/10 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-chart-3" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Critical knowledge</h4>
                <p className="text-sm text-muted-foreground">walks out when experienced employees leave</p>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-bold text-primary mb-4">
                "What if machines could think like your best employee?"
              </h3>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                StreamLine was born from this revolutionary question. Our neural networks don't just store
                documents—they understand procedures the way humans do, as living knowledge graphs of relationships,
                dependencies, and contexts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20">
        <div className="container max-w-screen-xl">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              We Witnessed This Across Industries
            </h2>
            <p className="text-lg text-muted-foreground mb-12">
              The same scenario playing out everywhere, costing time, money, and safety
            </p>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="text-left hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-chart-1/10 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-chart-1" />
                  </div>
                  <CardTitle className="text-lg">Manufacturing Floors</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Workers juggling heavy machinery while trying to read procedure manuals, losing precious time and
                    risking safety
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-left hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-chart-2" />
                  </div>
                  <CardTitle className="text-lg">Operating Rooms</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Nurses needing instant access to protocols but unable to touch contaminated devices during critical
                    procedures
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-left hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-chart-3/10 flex items-center justify-center mb-4">
                    <Network className="h-6 w-6 text-chart-3" />
                  </div>
                  <CardTitle className="text-lg">Server Rooms</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Engineers losing precious minutes scrolling through documentation during system outages and
                    emergencies
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container max-w-screen-xl">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How Neural Computation Changes Everything
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Beyond simple search. StreamLine understands your procedures like a knowledgeable colleague.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-16">
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Deep Document Understanding</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Advanced transformer models parse document structure, preserve procedural flow, and handle text,
                  diagrams, and tables
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <Network className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Knowledge Graph Neural Networks</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Understands relationships between procedures, tools, and materials with dynamic context building and
                  predictive assistance
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-chart-1/10 flex items-center justify-center mb-4 group-hover:bg-chart-1/20 transition-colors">
                  <Headphones className="h-6 w-6 text-chart-1" />
                </div>
                <CardTitle>Conversational Neural Interface</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Natural language understanding in technical contexts with voice synthesis optimized for noisy
                  environments
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 max-w-4xl mx-auto">
              <CardContent className="pt-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">The Voice Revolution</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  When your hands are full, your eyes are focused, or your environment is challenging, your voice
                  becomes your interface. StreamLine's neural speech processing understands context, intent, and
                  urgency—responding like a knowledgeable colleague, not a robotic assistant.
                </p>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Experience Voice AI
                  <Mic className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="container max-w-screen-xl">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Real Stories, Real Impact</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              See how StreamLine transforms operations across industries
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <Card className="bg-card hover:bg-card/80 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <blockquote className="text-sm text-muted-foreground mb-4">
                  "During code blue situations, I can't touch my tablet. Now I just ask StreamLine 'What's the protocol
                  for cardiac arrest with diabetes complications?' and get instant voice guidance. It's like having our
                  most experienced attending physician whispering in my ear."
                </blockquote>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-primary">SJ</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Sarah Johnson</p>
                    <p className="text-xs text-muted-foreground">ICU Nurse, Metro Hospital</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card hover:bg-card/80 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <blockquote className="text-sm text-muted-foreground mb-4">
                  "Working 40 feet up on wind turbines, I need both hands free. StreamLine talks me through complex
                  repairs step-by-step. Last month, it helped me spot a potential safety issue that wasn't obvious from
                  the manual. Neural computation doesn't just follow procedures—it thinks ahead."
                </blockquote>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-primary">MR</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Marcus Rodriguez</p>
                    <p className="text-xs text-muted-foreground">Maintenance Technician, WindTech</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card hover:bg-card/80 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <blockquote className="text-sm text-muted-foreground mb-4">
                  "Training new PhD students used to take months. Now they interact with our SOPs like they're having a
                  conversation with a senior researcher. StreamLine understands the 'why' behind procedures, not just
                  the 'what'."
                </blockquote>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-primary">DC</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Dr. Lisa Chen</p>
                    <p className="text-xs text-muted-foreground">Research Lab Director, BioTech Institute</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Impact Metrics Section */}
          <div className="mt-16 grid gap-8 sm:grid-cols-3 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">90%</div>
              <p className="text-sm text-muted-foreground">Reduction in procedure lookup time</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">94.8%</div>
              <p className="text-sm text-muted-foreground">Accuracy rate in responses</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">75%</div>
              <p className="text-sm text-muted-foreground">Faster employee training</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="container max-w-screen-xl">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Replace expensive SaaS solutions with self-hosted neural intelligence
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="relative">
              <CardHeader>
                <CardTitle>Community</CardTitle>
                <CardDescription>Perfect for trying out StreamLine</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">Free</span>
                  <span className="text-muted-foreground"> forever</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-accent" />
                    Open source community edition
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-accent" />
                    Up to 5 documents
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-accent" />
                    Basic voice commands
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-accent" />
                    Community support
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-transparent" variant="outline">
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            <Card className="relative border-primary shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle>Professional</CardTitle>
                <CardDescription>For growing teams and businesses</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">$29</span>
                  <span className="text-muted-foreground">/month per team</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-accent" />
                    Unlimited documents
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-accent" />
                    Advanced neural features
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-accent" />
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-accent" />
                    Team collaboration
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-accent" />
                    Usage analytics
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-primary hover:bg-primary/90">Start Free Trial</Button>
              </CardContent>
            </Card>

            <Card className="relative">
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>Complete control and customization</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">Custom</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-accent" />
                    Self-hosted deployment
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-accent" />
                    Custom neural models
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-accent" />
                    Dedicated support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-accent" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-accent" />
                    No vendor lock-in
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-transparent" variant="outline">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary">
        <div className="container max-w-screen-xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl mb-4">
              Join the Neural Revolution
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-6">
              This isn't just about better software—it's about amplifying human potential. Where every question becomes
              insight, every procedure becomes conversation, and every team becomes unstoppable.
            </p>
            <p className="text-primary-foreground/90 mb-8">
              Your procedures. Your knowledge. Enhanced by neural computation.
            </p>
            <div className="flex items-center justify-center gap-x-6">
              <Button size="lg" variant="secondary">
                Start Your Neural Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
              >
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </Button>
            </div>
            <p className="text-sm text-primary-foreground/70 mt-6">
              Ready to experience how neural computation transforms operational excellence?
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container max-w-screen-xl py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Brain className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">StreamLine</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Transform your standard operating procedures with AI-powered voice assistance.
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
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">© 2024 StreamLine. All rights reserved.</p>
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
    </div>
  )
}
