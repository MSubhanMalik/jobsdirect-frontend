import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Gift, Zap, Loader2 } from "lucide-react";
import AddonSelector from "@/components/products/AddonSelector";
import CostSummary from "@/components/products/CostSummary";
import productService from "@/services/product";
import paymentService from "@/services/payment";
import { useProducts } from "@/hooks/useProducts";

export default function JobPaymentModal({ open, onOpenChange, employer, inputMethod, onConfirm, submitting }) {
  const { addons: addonProducts, listing: listingProduct } = useProducts();
  const [listingType, setListingType] = useState("free");
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [costEstimate, setCostEstimate] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  const creditBalance = employer?.credits || 0;

  useEffect(() => {
    if (open && employer?.id) {
      setLoading(true);
      paymentService.getBalance(employer.id)
        .then(setBalance)
        .finally(() => setLoading(false));
    }
  }, [open, employer?.id]);

  const canPostFree = balance?.canPostFree && inputMethod !== "import";

  useEffect(() => {
    if (inputMethod === "import") setListingType("paid");
  }, [inputMethod]);

  useEffect(() => {
    if (listingType === "free") {
      setCostEstimate(null);
      return;
    }
    const addonIds = [...selectedAddons];
    if (inputMethod === "import") addonIds.push("addon_import");
    productService.getCostEstimate(addonIds).then(setCostEstimate).catch(() => {});
  }, [listingType, selectedAddons, inputMethod]);

  const selectableAddons = addonProducts.filter((a) => a.id !== "addon_import" && a.id !== "addon_duplicate");
  const totalCost = costEstimate?.total || 0;

  const handleConfirm = () => {
    onConfirm({
      listingType,
      selectedAddons,
      totalCost
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Choose Listing Plan
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Checking your balance...</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Your Balance: <span className="font-bold text-foreground">{creditBalance} credits</span>
              </span>
            </div>

            {inputMethod === "import" ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="text-sm font-medium text-amber-800">Imported listings are always paid</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button" 
                  className={`rounded-lg border p-3 text-left transition ${listingType === "free" ? "border-emerald-600 bg-emerald-50 shadow-[0_0_0_1px_theme(colors.emerald.600)]" : "border-slate-200 hover:border-slate-300"} ${!canPostFree ? "opacity-50 cursor-not-allowed" : ""}`} 
                  onClick={() => canPostFree && setListingType("free")} 
                  disabled={!canPostFree}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Gift className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-semibold">Free Listing</span>
                  </div>
                  <p className="text-xs text-muted-foreground">14 days, 1 per month</p>
                  {!canPostFree && <p className="text-xs text-amber-600 mt-1">Used this month</p>}
                </button>
                <button 
                  type="button" 
                  className={`rounded-lg border p-3 text-left transition ${listingType === "paid" ? "border-emerald-600 bg-emerald-50 shadow-[0_0_0_1px_theme(colors.emerald.600)]" : "border-slate-200 hover:border-slate-300"}`} 
                  onClick={() => setListingType("paid")}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-semibold">Paid Listing</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{listingProduct ? `${listingProduct.duration} days` : "30 days"}</p>
                </button>
              </div>
            )}

            {listingType === "paid" && (
              <AddonSelector
                addons={selectableAddons}
                selected={selectedAddons}
                onToggle={(id, checked) => setSelectedAddons(prev => checked ? [...prev, id] : prev.filter(i => i !== id))}
              />
            )}

            {listingType === "paid" && costEstimate && (
              <CostSummary costEstimate={costEstimate} creditBalance={creditBalance} />
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirm} 
            disabled={loading || submitting}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {listingType === "free" ? "Submit Free Listing" : (creditBalance >= totalCost ? "Confirm & Submit" : "Pay & Submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
