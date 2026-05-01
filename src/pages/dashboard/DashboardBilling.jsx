import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import paymentService from "@/services/payment";
import { toast } from "react-toastify";
import BillingTab from "@/components/dashboard/employer/BillingTab";

export default function DashboardBilling() {
  const { user, employer, setEmployer } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [checkoutPlanId, setCheckoutPlanId] = useState(null);

  // Handle payment redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const payment = params.get("payment");
    const sessionId = params.get("session_id");

    if (payment === "cancelled") {
      toast.info("Payment cancelled — No charge was made.");
      navigate("/dashboard/billing", { replace: true });
      return;
    }
    if (payment !== "success" || !sessionId) return;

    setCheckoutPlanId("syncing");
    paymentService.syncCheckoutSession(sessionId)
      .then((result) => {
        if (result.employer) setEmployer((prev) => ({ ...prev, ...result.employer }));
        queryClient.invalidateQueries({ queryKey: ["employer-jobs", user.email] });
        toast.success(result.success ? "Payment complete — Your account has been updated." : "Payment received — confirming with Stripe.");
      })
      .catch((error) => {
        toast.error(`Could not confirm payment — ${error.message || "Please refresh."}`);
      })
      .finally(() => {
        setCheckoutPlanId(null);
        navigate("/dashboard/billing", { replace: true });
      });
  }, [location.search]);

  const handleCheckout = async (planId) => {
    setCheckoutPlanId(planId);
    try {
      const session = await paymentService.createCheckoutSession({ plan_id: planId, employer_id: employer.id });
      window.location.assign(session.url);
    } catch (error) {
      toast.error(`Checkout unavailable — ${error.message}`);
      setCheckoutPlanId(null);
    }
  };

  const handleBillingPortal = async () => {
    setCheckoutPlanId("portal");
    try {
      const session = await paymentService.createPortalSession({ employer_id: employer.id });
      window.location.assign(session.url);
    } catch (error) {
      toast.error(`Billing portal unavailable — ${error.message}`);
      setCheckoutPlanId(null);
    }
  };

  return (
    <BillingTab
      employer={employer}
      checkoutPlanId={checkoutPlanId}
      onCheckout={handleCheckout}
      onBillingPortal={handleBillingPortal}
    />
  );
}
