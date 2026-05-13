import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  UserPlus, FileText, Send, Eye, ArrowRight,
  CheckCircle, User, Sparkles, Search, BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import authService from "@/services/auth";

const steps = [
  { icon: UserPlus, title: "Create Your Account", description: "Sign up with your email and verify your identity in seconds." },
  { icon: User, title: "Build Your Profile", description: "Add your work experience, education, skills, and certifications." },
  { icon: FileText, title: "Generate a CV", description: "Use our professional templates to create a polished CV instantly." },
  { icon: Send, title: "Apply to Jobs", description: "Browse jobs and apply with one click — your profile is pre-filled." },
  { icon: Eye, title: "Get Discovered", description: "Employers with subscriptions can find and reach out to you directly." },
  { icon: BarChart3, title: "Track Applications", description: "Monitor your application status from your personal dashboard." },
];

const perks = [
  "100% free to use — no hidden costs",
  "One-click job applications",
  "Professional CV builder",
  "Real-time application tracking",
  "Direct messages from employers",
  "Job alert notifications",
];

export default function Employees() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden pt-16 sm:pt-24 pb-24 sm:pb-32 bg-[#1a2332]">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4eca8b]/10 border border-[#4eca8b]/20 text-[#4eca8b] text-sm font-medium mb-8">
                <Sparkles className="w-3.5 h-3.5" />
                For Job Seekers
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight leading-[1.1] text-white mb-6"
            >
              Your next career move{" "}
              <span className="text-[#4eca8b]">starts here.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-white/50 leading-relaxed mb-10 max-w-lg"
            >
              Create your profile, build your CV, and apply to hundreds of opportunities across Ireland — completely free.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              <Button
                size="lg"
                className="bg-[#4eca8b] hover:bg-[#45b87e] text-white font-semibold rounded-full px-8 h-12 group"
                onClick={() => authService.redirectToLogin()}
              >
                Create Free Account
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-white/70 hover:text-white font-medium h-12 group"
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              >
                Learn More
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Perks strip */}
      <section className="py-16 bg-foreground text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-5">
            {perks.map((perk, i) => (
              <motion.div
                key={perk}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-center gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3 h-3 text-accent" />
                </div>
                <p className="text-sm text-primary-foreground/70">{perk}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps — How It Works */}
      <section id="how-it-works" className="py-24 bg-background scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Getting started is quick, easy, and completely free.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="relative"
              >
                <div className="flex items-start gap-4">
                  {/* Number */}
                  <div className="w-10 h-10 rounded-full border-2 border-accent/20 bg-background flex items-center justify-center shrink-0">
                    <span className="text-sm font-display font-bold text-accent">{i + 1}</span>
                  </div>

                  {/* Content */}
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <step.icon className="w-4 h-4 text-muted-foreground" />
                      <h3 className="font-display font-semibold text-foreground">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[2rem] bg-accent p-14 sm:p-20 text-center"
          >
            <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full border border-accent-foreground/[0.08]" />
            <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full border border-accent-foreground/[0.08]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] rounded-full border border-accent-foreground/[0.04]" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-accent-foreground mb-5 leading-tight">
                Start your journey today
              </h2>
              <p className="text-accent-foreground/70 max-w-md mx-auto mb-10 text-lg">
                Join thousands of job seekers finding their dream roles across Ireland.
              </p>
              <Button
                size="lg"
                className="bg-accent-foreground text-accent hover:bg-accent-foreground/90 font-semibold rounded-full px-8 h-12 group"
                onClick={() => authService.redirectToLogin()}
              >
                Create Free Account
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
