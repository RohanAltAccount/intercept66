import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Earth3D from "@/components/Earth3D";
import { Satellite, Target, Shield, Zap, Globe, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Suspense } from "react";
const features = [{
  icon: Globe,
  title: "Orbital Path Planner",
  description: "Simulate satellite orbits, schedule launches, and visualize potential debris intersections in real-time."
}, {
  icon: Target,
  title: "Debris Tracker",
  description: "Live space object data with automated avoidance maneuver recommendations."
}, {
  icon: Satellite,
  title: "Asset Management",
  description: "Track real satellites, find collision points, and organize your astronomical ideas."
}, {
  icon: Shield,
  title: "Collision Prevention",
  description: "Mathematical algorithm predicts orbital intersections and provides early warnings for future intercepts."
}];
const stats = [{
  value: "23,000+",
  label: "Debris Objects Tracked"
}, {
  value: "99.9%",
  label: "Prediction Accuracy"
}, {
  value: "< 1s",
  label: "Alert Response Time"
}, {
  value: "66",
  label: "Satellites Supported"
}];
export default function Index() {
  return <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Background grid */}
        <div className="absolute inset-0 grid-overlay opacity-30" />
        
        {/* Radial gradient */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8
          }} className="space-y-8">
              <div className="space-y-4">
                <Badge variant="glow" className="px-4 py-1.5">
                  <Sparkles className="w-3 h-3 mr-2" />
                  Now in Beta
                </Badge>
                
                <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight">
                  Plan, Track &
                  <span className="block text-primary text-glow">Protect</span>
                  Satellites
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-xl">
                  The mission control platform for modern space operations. 
                  Real-time debris tracking, collision prediction, and orbital planning 
                  in one unified interface.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/dashboard">
                  <Button variant="hero" size="xl" className="group">
                    Launch Dashboard
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/tracker">
                  <Button variant="glass" size="xl">
                    View Live Tracker
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>Real-time data</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>TLE integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>API access</span>
                </div>
              </div>
            </motion.div>
            
            {/* Right - 3D Earth */}
            <motion.div initial={{
            opacity: 0,
            scale: 0.9
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            duration: 1,
            delay: 0.3
          }} className="relative h-[500px] lg:h-[600px]">
              <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>}>
                <Earth3D />
              </Suspense>
              
              {/* Floating stats */}
              <motion.div initial={{
              opacity: 0,
              x: -20
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              delay: 1
            }} className="absolute top-10 -left-4 glass-panel px-4 py-3 rounded-lg">
                <p className="text-xs text-muted-foreground">actively tracking satellites</p>
                <p className="text-2xl font-display font-bold text-success">4,532</p>
              </motion.div>
              
              <motion.div initial={{
              opacity: 0,
              x: 20
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              delay: 1.2
            }} className="absolute bottom-20 -right-4 glass-panel px-4 py-3 rounded-lg">
                <p className="text-xs text-muted-foreground">collisions predicted </p>
                <p className="text-2xl font-display font-bold text-warning">​60+ </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-primary rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => <motion.div key={stat.label} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.1
          }} viewport={{
            once: true
          }} className="text-center">
                <p className="text-4xl md:text-5xl font-display font-bold text-primary text-glow">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
              </motion.div>)}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-center mb-16">
            <Badge variant="orbital" className="mb-4">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Mission Control for
              <span className="text-primary"> Modern Space</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to monitor, manage, and protect your satellite constellation 
              from space debris and orbital hazards.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
            const Icon = feature.icon;
            return <motion.div key={feature.title} initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: index * 0.1
            }} viewport={{
              once: true
            }}>
                  <Card variant="glass" className="h-full hover:border-primary/50 transition-all duration-300 group">
                    <CardContent className="p-6 space-y-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-display font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>;
          })}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <Card variant="glow" className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
            <CardContent className="p-12 md:p-16 text-center relative z-10">
              <Zap className="w-12 h-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Ready for Launch?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Join space agencies, satellite operators, and enthusiasts using Intercept66 
                to keep their assets safe in orbit.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/auth?mode=signup">
                  <Button variant="hero" size="xl">
                    Start Free Trial
                  </Button>
                </Link>
                <Button variant="glass" size="xl">
                  Schedule Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Satellite className="w-6 h-6 text-primary" />
              <span className="font-display font-bold text-lg">
                INTERCEPT<span className="text-primary">66</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Intercept66. Protecting satellites, preserving orbits.
            </p>
          </div>
        </div>
      </footer>
    </div>;
}