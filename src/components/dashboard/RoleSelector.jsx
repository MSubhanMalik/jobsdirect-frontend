import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import employerService from "@/services/employer";
import employeeService from "@/services/employee";
import { Building2, User } from "lucide-react";
import { motion } from "framer-motion";

export default function RoleSelector({ user, onCreated }) {
  const [creating, setCreating] = useState(false);

  const firstName = user?.firstName || user?.first_name || "";
  const lastName = user?.lastName || user?.last_name || "";

  const handleSelect = async (role) => {
    setCreating(true);
    try {
      if (role === "employer") {
        const employer = await employerService.create({
          first_name: firstName,
          last_name: lastName,
          company_name: "",
          verification_status: "draft",
        });
        onCreated("employer", employer);
      } else {
        const employee = await employeeService.create({
          first_name: firstName,
          last_name: lastName,
        });
        onCreated("employee", employee);
      }
    } catch (err) {
      console.error("Failed to create profile:", err);
      setCreating(false);
    }
  };

  if (creating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">
            Welcome{firstName ? `, ${firstName}` : ''}!
          </h1>
          <p className="text-muted-foreground">How would you like to use the platform?</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card
              className="cursor-pointer hover:shadow-lg hover:border-primary transition-all"
              onClick={() => handleSelect("employer")}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">I'm an Employer</h3>
                <p className="text-sm text-muted-foreground">Post jobs, search candidates, and grow your team.</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card
              className="cursor-pointer hover:shadow-lg hover:border-accent transition-all"
              onClick={() => handleSelect("employee")}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <User className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-lg font-semibold mb-2">I'm a Job Seeker</h3>
                <p className="text-sm text-muted-foreground">Create your profile, apply to jobs, and get hired.</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
