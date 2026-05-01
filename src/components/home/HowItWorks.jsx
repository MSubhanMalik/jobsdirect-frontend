import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserPlus, FileText, Search, Send, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const employerSteps = [
  {
    icon: UserPlus,
    title: "Register & Verify",
    description: "Create your employer account and complete the verification process to get started.",
  },
  {
    icon: FileText,
    title: "Post Jobs",
    description: "Publish job listings with flexible pricing options and powerful add-ons to reach more candidates.",
  },
  {
    icon: Search,
    title: "Find Talent",
    description: "Search our database of qualified candidates across Ireland and connect directly.",
  },
];

const employeeSteps = [
  {
    icon: UserPlus,
    title: "Create Profile",
    description: "Sign up and build a professional profile that showcases your skills and experience.",
  },
  {
    icon: FileText,
    title: "Generate CV",
    description: "Use our templates to create a polished, professional CV instantly from your profile.",
  },
  {
    icon: Send,
    title: "Apply & Get Hired",
    description: "Apply to jobs with one click, track your applications, and land your next role.",
  },
];

function StepTimeline({ steps, delayOffset = 0 }) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: delayOffset + i * 0.1 }}
          className="flex gap-5"
        >
          {/* Timeline line + number */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full border-2 border-accent/20 bg-background flex items-center justify-center shrink-0">
              <span className="text-sm font-display font-bold text-accent">{i + 1}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-px flex-1 bg-border my-1" />
            )}
          </div>

          {/* Content */}
          <div className={`pb-10 ${i === steps.length - 1 ? "pb-0" : ""}`}>
            <div className="flex items-center gap-2.5 mb-1.5">
              <step.icon className="w-4 h-4 text-muted-foreground" />
              <h4 className="text-base font-display font-semibold text-foreground">{step.title}</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section className="py-24 bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            How it works
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Whether you're hiring or searching, we make the process simple and efficient.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Employers */}
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">For Employers</span>
            </motion.div>
            <StepTimeline steps={employerSteps} delayOffset={0} />
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-8 pl-[3.75rem]"
            >
              <Link to="/employers">
                <Button className="bg-foreground hover:bg-foreground/90 text-background rounded-full px-6 h-10 group font-medium">
                  Get Started
                  <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Employees */}
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">For Employees</span>
            </motion.div>
            <StepTimeline steps={employeeSteps} delayOffset={0.15} />
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-8 pl-[3.75rem]"
            >
              <Link to="/employees">
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 h-10 group font-medium">
                  Create Profile
                  <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
