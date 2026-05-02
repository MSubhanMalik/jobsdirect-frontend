import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { CATEGORY_OPTIONS, JOB_TYPE_OPTIONS, LOCATION_OPTIONS } from "@/lib/siteSettings";
import SearchableSelect from "@/components/ui/searchable-select";

export default function JobFilters({ filters, onChange, onClear }) {
  const hasFilters = filters.keyword || filters.location || filters.type || filters.category || filters.is_featured || filters.is_highlighted || filters.is_urgent;

  return (
    <div className="bg-card rounded-2xl border border-border/60 p-3 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      <div className="flex flex-col sm:flex-row items-stretch gap-0">

        {/* Keyword */}
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-4 w-[1.1rem] h-[1.1rem] text-muted-foreground/50" />
          <Input
            placeholder="Job title or keyword"
            value={filters.keyword}
            onChange={(e) => onChange({ ...filters, keyword: e.target.value })}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-12 pl-11 text-[0.95rem] placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Divider */}
        <div className="hidden sm:flex items-center">
          <div className="w-px h-7 bg-border" />
        </div>

        {/* Location */}
        <div className="flex-1">
          <SearchableSelect
            options={[{ value: "", label: "All Locations" }, ...LOCATION_OPTIONS]}
            value={filters.location || ""}
            onValueChange={(v) => onChange({ ...filters, location: v })}
            placeholder="All Locations"
            searchPlaceholder="Search location..."
            className="border-0 bg-transparent shadow-none focus:ring-0 h-12 text-[0.95rem]"
          />
        </div>

        {/* Divider */}
        <div className="hidden sm:flex items-center">
          <div className="w-px h-7 bg-border" />
        </div>

        {/* Job Type */}
        <div className="flex-1">
          <Select value={filters.type || "all"} onValueChange={(v) => onChange({ ...filters, type: v === "all" ? "" : v })}>
            <SelectTrigger className="border-0 bg-transparent shadow-none focus:ring-0 h-12 text-[0.95rem] text-muted-foreground/70">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {JOB_TYPE_OPTIONS.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Divider */}
        <div className="hidden sm:flex items-center">
          <div className="w-px h-7 bg-border" />
        </div>

        {/* Category */}
        <div className="flex-1">
          <Select value={filters.category || "all"} onValueChange={(v) => onChange({ ...filters, category: v === "all" ? "" : v })}>
            <SelectTrigger className="border-0 bg-transparent shadow-none focus:ring-0 h-12 text-[0.95rem] text-muted-foreground/70">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORY_OPTIONS.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pl-1">
          {hasFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground h-12 px-6 rounded-xl font-semibold text-[0.95rem] shrink-0">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Badge filters */}
      <div className="flex items-center gap-5 px-3 pt-2 pb-1 border-t border-border/30 mt-2">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <Checkbox checked={filters.is_featured} onCheckedChange={(v) => onChange({ ...filters, is_featured: Boolean(v) })} />
          <span className="text-xs text-muted-foreground">Featured</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <Checkbox checked={filters.is_highlighted} onCheckedChange={(v) => onChange({ ...filters, is_highlighted: Boolean(v) })} />
          <span className="text-xs text-muted-foreground">Highlighted</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <Checkbox checked={filters.is_urgent} onCheckedChange={(v) => onChange({ ...filters, is_urgent: Boolean(v) })} />
          <span className="text-xs text-muted-foreground">Urgent Hiring</span>
        </label>
      </div>
    </div>
  );
}
