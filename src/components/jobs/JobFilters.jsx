import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, MapPin, X } from "lucide-react";
import { CATEGORY_OPTIONS, JOB_TYPE_OPTIONS, LOCATION_OPTIONS } from "@/lib/siteSettings";

export default function JobFilters({ filters, onChange, onClear }) {
  const hasFilters = filters.keyword || filters.location || filters.type || filters.category;

  return (
    <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative lg:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Keyword"
            value={filters.keyword}
            onChange={(e) => onChange({ ...filters, keyword: e.target.value })}
            className="pl-9 h-11"
          />
        </div>
        <Select value={filters.location || "all"} onValueChange={(v) => onChange({ ...filters, location: v === "all" ? "" : v })}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {LOCATION_OPTIONS.map((l) => (
              <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.type || "all"} onValueChange={(v) => onChange({ ...filters, type: v === "all" ? "" : v })}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Job Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {JOB_TYPE_OPTIONS.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.category || "all"} onValueChange={(v) => onChange({ ...filters, category: v === "all" ? "" : v })}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORY_OPTIONS.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" onClick={onClear} className="h-11 text-muted-foreground">
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}