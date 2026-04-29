import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import authService from "@/services/auth";
import employerService from "@/services/employer";
import employeeService from "@/services/employee";
import { Skeleton } from "@/components/ui/skeleton";
import EmployerDashboard from "../components/dashboard/EmployerDashboard";
import EmployeeDashboard from "../components/dashboard/EmployeeDashboard";
import RoleSelector from "../components/dashboard/RoleSelector";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

  // Redirect unauthenticated users once auth finishes loading
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      authService.redirectToLogin("/dashboard");
    }
    if (!authLoading && user?.role === "admin") {
      navigate("/admin");
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  // Fetch employer and employee profiles in parallel (not waterfall)
  const { data: employerData, isLoading: employerLoading } = useQuery({
    queryKey: ["my-employer", user?.email],
    queryFn: () => employerService.list({ user_email: user.email }),
    enabled: !!user && user.role !== "admin",
  });

  const { data: employeeData, isLoading: employeeLoading } = useQuery({
    queryKey: ["my-employee", user?.email],
    queryFn: () => employeeService.list({ user_email: user.email }),
    enabled: !!user && user.role !== "admin",
  });

  const [employer, setEmployer] = React.useState(null);
  const [employee, setEmployee] = React.useState(null);

  // Sync query results to local state
  React.useEffect(() => {
    const items = employerData?.items || [];
    if (items.length > 0) setEmployer(items[0]);
  }, [employerData]);

  React.useEffect(() => {
    const items = employeeData?.items || [];
    if (items.length > 0) setEmployee(items[0]);
  }, [employeeData]);

  const loading = authLoading || !user || employerLoading || employeeLoading;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // If no profile yet, show role selection
  if (!employer && !employee) {
    return <RoleSelector user={user} onCreated={(type, data) => {
      if (type === "employer") setEmployer(data);
      else setEmployee(data);
    }} />;
  }

  if (employer) {
    return <EmployerDashboard user={user} employer={employer} setEmployer={setEmployer} />;
  }

  return <EmployeeDashboard user={user} employee={employee} setEmployee={setEmployee} />;
}
