import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchableSelect({
  options = [],
  value,
  onValueChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedLabel = options.find((o) => o.value === value)?.label || "";

  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch(""); }}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal h-9 text-sm",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">{selectedLabel || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 overflow-hidden"
        align="start"
        sideOffset={4}
      >
        {/* Search input */}
        <div className="flex items-center border-b px-3 py-2">
          <Search className="mr-2 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Options list */}
        <div className="max-h-[220px] overflow-y-auto overscroll-contain">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{emptyText}</p>
          ) : (
            filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onValueChange(option.value === value ? "" : option.value);
                  setOpen(false);
                  setSearch("");
                }}
                className={cn(
                  "flex w-full items-center px-3 py-2 text-sm cursor-pointer transition-colors",
                  option.value === value
                    ? "bg-accent/[0.06] text-accent font-medium"
                    : "text-foreground hover:bg-muted/50",
                )}
              >
                <span className="flex-1 truncate text-left">{option.label}</span>
                {value === option.value && (
                  <Check className="ml-2 h-3.5 w-3.5 text-accent shrink-0" />
                )}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
