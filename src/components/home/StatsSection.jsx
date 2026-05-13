import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Briefcase, Building2, Users, TrendingUp } from "lucide-react";
import jobService from "@/services/job";
import employerService from "@/services/employer";
import employeeService from "@/services/employee";

export default function StatsSection() {
  const { data: jobsData } = useQuery({
    queryKey: ["stats-jobs"],
    queryFn: () => jobService.list({ status: "approved", pageSize: 1 }),
    staleTime: 5 * 60 * 1000,
  });
  const { data: employersData } = useQuery({
    queryKey: ["stats-employers"],
    queryFn: () => employerService.list({ pageSize: 1 }),
    staleTime: 5 * 60 * 1000,
  });
  const { data: employeesData } = useQuery({
    queryKey: ["stats-employees"],
    queryFn: () => employeeService.list({ pageSize: 1 }),
    staleTime: 5 * 60 * 1000,
  });

  const stats = [
    { icon: Briefcase, label: "Active Jobs", value: jobsData?.total ?? "—" },
    { icon: Building2, label: "Companies", value: employersData?.total ?? "—" },
    { icon: Users, label: "Job Seekers", value: employeesData?.total ?? "—" },
    { icon: TrendingUp, label: "Applications", value: "—" },
  ];

  return (
    <section className="py-24 bg-[#1a2332]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/[0.05] flex items-center justify-center mx-auto mb-5">
                <stat.icon className="w-5 h-5 text-[#4eca8b]" />
              </div>
              <p className="text-4xl sm:text-5xl font-display font-bold text-white mb-2 tracking-tight">
                {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
              </p>
              <p className="text-sm uppercase tracking-[0.15em] text-white/30 font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
