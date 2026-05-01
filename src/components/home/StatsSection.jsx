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
    { icon: Briefcase, label: "Active Jobs", value: jobsData?.total ?? "—", color: "text-accent" },
    { icon: Building2, label: "Companies", value: employersData?.total ?? "—", color: "text-primary" },
    { icon: Users, label: "Job Seekers", value: employeesData?.total ?? "—", color: "text-accent" },
    { icon: TrendingUp, label: "Applications", value: "—", color: "text-primary" },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
