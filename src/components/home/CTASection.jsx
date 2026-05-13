import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, User } from "lucide-react";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2rem] bg-[#1a2332] p-14 sm:p-20 text-center"
        >
          {/* Subtle decorative rings */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full border border-white/[0.05]" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full border border-white/[0.05]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full border border-[#4eca8b]/[0.06]" />

          <div className="relative">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-5 leading-tight">
              Ready to get started?
            </h2>
            <p className="text-white/50 max-w-lg mx-auto mb-10 text-lg">
              Join thousands of employers and job seekers already connecting on Ireland's premier job platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="bg-[#4eca8b] hover:bg-[#45b87e] text-white font-semibold rounded-full px-8 h-12 group"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Register as Employer
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/5 font-semibold rounded-full px-8 h-12 group"
                >
                  <User className="w-4 h-4 mr-2" />
                  Register as Employee
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
