import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2, FileText, Users, CreditCard, Search, Shield,
  ArrowRight, Star, Check, Package
} from "lucide-react";
import { motion } from "framer-motion";
import authService from "@/services/auth";
import paymentService from "@/services/payment";

const benefits = [
  { icon: FileText, title: "Flexible Job Posting", description: "Post jobs with 14-day free listings or 28-day premium placements to reach thousands." },
  { icon: CreditCard, title: "Credit System", description: "Buy credits in bulk and use them for jobs, add-ons, and duplicates — no subscription required." },
  { icon: Users, title: "Talent Search", description: "Subscribe to search our database of qualified Irish professionals and contact them directly." },
  { icon: Search, title: "Import from JobsIreland.ie", description: "Import job details directly from JobsIreland.ie with one click — save hours of re-typing." },
  { icon: Star, title: "Featured Listings", description: "Highlight your jobs at the top of search results to attract more qualified candidates." },
  { icon: Shield, title: "Verified Employer Badge", description: "Build trust with candidates through a verified employer badge on all your listings." },
];

function formatPrice(amountInCents) {
  if (amountInCents === null || amountInCents === undefined) return "—";
  if (amountInCents === 0) return "Free";
  const euros = amountInCents / 100;
  return `€${euros % 1 === 0 ? euros : euros.toFixed(2)}`;
}

function formatPlanPrice(plan) {
  const amount = Number(plan.amount || 0);
  if (amount === 0) return "Contact us";
  return formatPrice(amount);
}

export default function Employers() {
  // Fetch live pricing from Stripe
  const { data: pricingData } = useQuery({
    queryKey: ["pricing"],
    queryFn: () => paymentService.getPricing(),
    staleTime: 10 * 60 * 1000,
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["payment-plans"],
    queryFn: () => paymentService.listPlans(),
    staleTime: 10 * 60 * 1000,
  });

  const creditBundles = plans.filter((p) => p.kind === "credits");
  const subscriptions = plans.filter((p) => p.kind === "candidate_database");

  // Build pricing rows from live data
  const pricingRows = [
    { label: "14-Day Free Listing", price: "Free", note: "1 per month", highlight: true },
    {
      label: "Job Listing",
      price: pricingData?.JOB_LISTING ? `${formatPrice(pricingData.JOB_LISTING)} + VAT` : "—",
      note: "or 1 credit",
    },
    {
      label: "Duplicate Job",
      price: pricingData?.DUPLICATE_JOB ? formatPrice(pricingData.DUPLICATE_JOB) : "—",
      note: "or fractional credit",
    },
    {
      label: "Import from JobsIreland.ie",
      price: pricingData?.IMPORT_JOB ? formatPrice(pricingData.IMPORT_JOB) : "—",
      note: "or fractional credit",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden pt-16 sm:pt-24 pb-24 sm:pb-32">
        {/* Decorative */}
        <motion.div
          animate={{ y: [0, -16, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="hidden lg:block absolute right-[8%] top-[10%] w-64 h-64 rounded-full border border-accent/[0.07]"
        />
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="hidden lg:block absolute right-[18%] top-[40%] w-32 h-32 rounded-full bg-accent/[0.04]"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 text-accent text-sm font-medium mb-8">
                <Building2 className="w-3.5 h-3.5" />
                For Employers
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-[0.95] text-foreground mb-6"
            >
              Hire top talent{" "}
              <span className="text-accent">in Ireland.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 max-w-lg"
            >
              Post jobs, search candidates, and build your team with Ireland's fastest-growing job platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full px-8 h-12 group"
                onClick={() => authService.redirectToLogin()}
              >
                Register as Employer
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-foreground font-medium h-12 group"
                onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
              >
                View Pricing
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-6 mb-16"
          >
            <div className="h-px flex-1 bg-border" />
            <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap">
              Why JobsDirect.ie
            </h2>
            <div className="h-px flex-1 bg-border" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <Card className="h-full border-border/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-11 h-11 rounded-xl bg-accent/[0.08] flex items-center justify-center mb-5">
                      <b.icon className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="font-display font-semibold text-foreground mb-2">{b.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-background scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-3">
              Simple pricing
            </h2>
            <p className="text-muted-foreground">No hidden fees. Pay only for what you need.</p>
          </motion.div>

          {/* Job posting costs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-4">Job Posting</p>
            <Card className="border-border/60 overflow-hidden">
              <CardContent className="p-0">
                {pricingRows.map((item, i) => (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between px-6 py-5 ${
                      i !== pricingRows.length - 1 ? "border-b border-border/50" : ""
                    } ${item.highlight ? "bg-accent/[0.04]" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      {item.highlight && (
                        <span className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-accent" />
                        </span>
                      )}
                      <div>
                        <p className="font-medium text-foreground text-[0.95rem]">{item.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.note}</p>
                      </div>
                    </div>
                    <span className={`font-display font-bold text-lg ${item.highlight ? "text-accent" : "text-foreground"}`}>
                      {item.price}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Credit Bundles */}
          {creditBundles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-4">Credit Bundles</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {creditBundles.map((plan) => (
                  <Card key={plan.id} className="border-border/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="w-10 h-10 rounded-xl bg-accent/[0.08] flex items-center justify-center mb-4">
                        <Package className="w-5 h-5 text-accent" />
                      </div>
                      <h3 className="font-display font-bold text-foreground text-lg mb-1">{plan.name}</h3>
                      {plan.description && (
                        <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-display font-bold text-foreground">{formatPlanPrice(plan)}</span>
                        {plan.credits && (
                          <span className="text-sm text-muted-foreground">/ {plan.credits} credits</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Subscriptions */}
          {subscriptions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-4">Subscriptions</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subscriptions.map((plan) => (
                  <Card key={plan.id} className="border-border/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="w-10 h-10 rounded-xl bg-accent/[0.08] flex items-center justify-center mb-4">
                        <Users className="w-5 h-5 text-accent" />
                      </div>
                      <h3 className="font-display font-bold text-foreground text-lg mb-1">{plan.name}</h3>
                      {plan.description && (
                        <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-display font-bold text-foreground">{formatPlanPrice(plan)}</span>
                        {plan.interval && (
                          <span className="text-sm text-muted-foreground">/{plan.interval}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[2rem] bg-foreground p-14 sm:p-20 text-center"
          >
            <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full border border-primary-foreground/[0.06]" />
            <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full border border-primary-foreground/[0.06]" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-primary-foreground mb-4">
                Ready to start hiring?
              </h2>
              <p className="text-primary-foreground/45 max-w-md mx-auto mb-10 text-lg">
                Create your employer account in minutes and post your first job today.
              </p>
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full px-8 h-12 group"
                onClick={() => authService.redirectToLogin()}
              >
                Get Started Now
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
