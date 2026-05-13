import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Search, X, MapPin, Filter } from "lucide-react";
import { CATEGORY_OPTIONS, JOB_TYPE_OPTIONS, LOCATION_OPTIONS } from "@/lib/siteSettings";
import SearchableSelect from "@/components/ui/searchable-select";

const WORK_TYPE_OPTIONS = [
  { value: "on_site", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
];

const DATE_POSTED_OPTIONS = [
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

export default function JobFilters({ filters, onChange, onClear, variant = "light" }) {
  const hasFilters = filters.keyword || filters.location || filters.type || filters.category || filters.work_type || filters.date_posted || filters.is_highlighted || filters.is_urgent;
  const isDark = variant === "dark";

  return (
    <div className={`rounded-2xl p-2.5 ${
      isDark
        ? "bg-white/[0.06] backdrop-blur-md border border-white/[0.08] shadow-[0_8px_40px_rgba(0,0,0,0.3)]"
        : "bg-card border border-border/60 shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
    }`}>
      <div className="flex flex-col sm:flex-row items-stretch gap-0">
        {/* Keyword */}
        <div className="relative flex-1 flex items-center">
          <Search className={`absolute left-4 w-[1.1rem] h-[1.1rem] ${isDark ? "text-white/30" : "text-muted-foreground/50"}`} />
          <Input
            placeholder="Job title or keyword"
            value={filters.keyword}
            onChange={(e) => onChange({ ...filters, keyword: e.target.value })}
            className={`border-0 bg-transparent shadow-none focus-visible:ring-0 h-12 pl-11 text-[0.95rem] ${
              isDark ? "text-white placeholder:text-white/30" : "placeholder:text-muted-foreground/50"
            }`}
          />
        </div>

        <div className="hidden sm:flex items-center">
          <div className={`w-px h-7 ${isDark ? "bg-white/10" : "bg-border"}`} />
        </div>

        {/* Location */}
        <div className="flex-1">
          <SearchableSelect
            options={[{ value: "", label: "All Locations" }, ...LOCATION_OPTIONS]}
            value={filters.location || ""}
            onValueChange={(v) => onChange({ ...filters, location: v })}
            placeholder="All Locations"
            searchPlaceholder="Search location..."
            className={`border-0 bg-transparent shadow-none focus:ring-0 h-12 text-[0.95rem] ${isDark ? "text-white/70" : ""}`}
          />
        </div>

        <div className="hidden sm:flex items-center">
          <div className={`w-px h-7 ${isDark ? "bg-white/10" : "bg-border"}`} />
        </div>

        {/* Job Type */}
        <div className="flex-1 hidden sm:block">
          <Select value={filters.type || "all"} onValueChange={(v) => onChange({ ...filters, type: v === "all" ? "" : v })}>
            <SelectTrigger className={`border-0 bg-transparent shadow-none focus:ring-0 h-12 text-[0.95rem] ${isDark ? "text-white/40" : "text-muted-foreground/70"}`}>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {JOB_TYPE_OPTIONS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pl-1">
          {hasFilters && (
            <Button variant="ghost" size="icon" onClick={onClear} className={`h-10 w-10 rounded-xl shrink-0 ${isDark ? "text-white/40 hover:text-white hover:bg-white/10" : "text-muted-foreground hover:text-foreground"}`}>
              <X className="w-4 h-4" />
            </Button>
          )}
          <Button className="bg-[#4eca8b] hover:bg-[#45b87e] text-white h-12 px-6 rounded-xl font-semibold text-[0.95rem] shrink-0">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Extended filters row */}
      <div className={`flex flex-wrap items-center gap-3 px-3 pt-2 pb-1 mt-2 ${isDark ? "border-t border-white/[0.06]" : "border-t border-border/30"}`}>
        <Select value={filters.work_type || "all"} onValueChange={(v) => onChange({ ...filters, work_type: v === "all" ? "" : v })}>
          <SelectTrigger className={`h-8 w-auto min-w-[100px] rounded-lg text-xs ${isDark ? "border-white/10 text-white/50" : "border-border/50"}`}>
            <SelectValue placeholder="Work Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Work Types</SelectItem>
            {WORK_TYPE_OPTIONS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.date_posted || "all"} onValueChange={(v) => onChange({ ...filters, date_posted: v === "all" ? "" : v })}>
          <SelectTrigger className={`h-8 w-auto min-w-[120px] rounded-lg text-xs ${isDark ? "border-white/10 text-white/50" : "border-border/50"}`}>
            <SelectValue placeholder="Date Posted" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Time</SelectItem>
            {DATE_POSTED_OPTIONS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <label className="flex items-center gap-1.5 cursor-pointer">
          <Checkbox checked={filters.is_highlighted} onCheckedChange={(v) => onChange({ ...filters, is_highlighted: Boolean(v) })} />
          <span className={`text-xs ${isDark ? "text-white/40" : "text-muted-foreground"}`}>Highlighted</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <Checkbox checked={filters.is_urgent} onCheckedChange={(v) => onChange({ ...filters, is_urgent: Boolean(v) })} />
          <span className={`text-xs ${isDark ? "text-white/40" : "text-muted-foreground"}`}>Urgent</span>
        </label>
      </div>
    </div>
  );
}
