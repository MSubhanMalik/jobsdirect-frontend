import React from "react";
import { useOutletContext } from "react-router-dom";
import EmployerProfile from "@/components/dashboard/EmployerProfile";
import EmployeeProfile from "@/components/dashboard/EmployeeProfile";

export default function DashboardProfile() {
  const { employer, employee, setEmployer, setEmployee, isEmployer } = useOutletContext();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground">
          {isEmployer ? "Company Profile" : "My Profile"}
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isEmployer
            ? "Manage your company verification and details."
            : "Your personal details, skills, experience, education, and job preferences."}
        </p>
      </div>

      {isEmployer ? (
        <EmployerProfile employer={employer} setEmployer={setEmployer} />
      ) : (
        <EmployeeProfile
          employee={employee}
          setEmployee={setEmployee}
        />
      )}
    </div>
  );
}
