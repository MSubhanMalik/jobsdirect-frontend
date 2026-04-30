import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import ProductIcon from "./ProductIcon";

function formatCredits(n) {
  return `${n} credit${n !== 1 ? "s" : ""}`;
}

export default function AddonSelector({ addons, selected, onToggle, disabled = false }) {
  if (!addons.length) return null;

  return (
    <div className="space-y-2 pt-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Add-ons</p>
      {addons.map((addon) => (
        <label key={addon.id} className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            checked={selected.includes(addon.id)}
            disabled={disabled}
            onCheckedChange={(v) => onToggle(addon.id, Boolean(v))}
          />
          <div className="flex-1">
            <span className="text-sm font-medium flex items-center gap-1">
              <ProductIcon name={addon.icon} /> {addon.name}
            </span>
            <span className="text-xs text-muted-foreground">{addon.description}</span>
          </div>
          <span className="text-xs font-semibold">{formatCredits(addon.creditCost)}</span>
        </label>
      ))}
    </div>
  );
}
