import React, { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import jobAlertService from "@/services/jobAlert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";
import { Bell, Plus, Trash2, Pause, Play, MapPin, Search, Briefcase, ArrowRight, Loader2 } from "lucide-react";
import { LOCATION_OPTIONS } from "@/lib/siteSettings";

const categoryOptions = [
  { value: "technology", label: "Technology" }, { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" }, { value: "education", label: "Education" },
  { value: "engineering", label: "Engineering" }, { value: "sales", label: "Sales" },
  { value: "marketing", label: "Marketing" }, { value: "hospitality", label: "Hospitality" },
  { value: "retail", label: "Retail" }, { value: "construction", label: "Construction" },
  { value: "transport", label: "Transport" }, { value: "admin", label: "Admin" },
  { value: "legal", label: "Legal" }, { value: "manufacturing", label: "Manufacturing" },
  { value: "other", label: "Other" },
];

const jobTypeOptions = [
  { value: "full_time", label: "Full Time" }, { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" }, { value: "temporary", label: "Temporary" },
  { value: "internship", label: "Internship" }, { value: "remote", label: "Remote" },
];

export default function DashboardJobAlerts() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ keyword: "", location: "any", category: "any", job_type: "any", frequency: "daily" });

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["job-alerts"],
    queryFn: () => jobAlertService.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => jobAlertService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-alerts"] });
      toast.success("Job alert created");
      setShowCreate(false);
      setForm({ keyword: "", location: "any", category: "any", job_type: "any", frequency: "daily" });
    },
    onError: (err) => toast.error(err.message || "Failed to create alert"),
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => jobAlertService.toggle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["job-alerts"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => jobAlertService.remove(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["job-alerts"] }); toast.success("Alert deleted"); },
  });

  const handleCreate = () => {
    const payload = {
      ...form,
      location: form.location === "any" ? null : form.location,
      category: form.category === "any" ? null : form.category,
      job_type: form.job_type === "any" ? null : form.job_type,
    };
    if (!payload.keyword && !payload.location && !payload.category && !payload.job_type) {
      toast.error("Add at least one filter");
      return;
    }
    createMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-32 mb-6" />
        {[1, 2].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">Job Alerts</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{alerts.length} active alert{alerts.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-5 h-9 text-sm font-medium">
          <Plus className="w-4 h-4 mr-1.5" /> Create Alert
        </Button>
      </div>

      {alerts.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Bell className="w-6 h-6 text-muted-foreground/25" />
          </div>
          <h3 className="font-display font-semibold text-foreground mb-1">No alerts yet</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">Create an alert and we'll notify you when matching jobs are posted.</p>
          <Button onClick={() => setShowCreate(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 h-10 font-medium">
            <Plus className="w-4 h-4 mr-1.5" /> Create Your First Alert
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden divide-y divide-border/30">
          {alerts.map((alert) => (
            <div key={alert.id} className={`flex items-center justify-between gap-4 px-5 py-4 ${!alert.is_active ? "opacity-50" : ""}`}>
              <div className="flex items-center gap-3 flex-wrap min-w-0">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${alert.is_active ? "bg-accent/[0.08]" : "bg-muted"}`}>
                  <Bell className={`w-4 h-4 ${alert.is_active ? "text-accent" : "text-muted-foreground"}`} />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {alert.keyword && (
                    <Badge variant="secondary" className="text-[0.7rem] font-medium rounded-md px-2.5 py-1">
                      <Search className="w-3 h-3 mr-1" /> {alert.keyword}
                    </Badge>
                  )}
                  {alert.location && (
                    <Badge variant="secondary" className="text-[0.7rem] font-medium rounded-md px-2.5 py-1">
                      <MapPin className="w-3 h-3 mr-1" /> {alert.location}
                    </Badge>
                  )}
                  {alert.category && (
                    <Badge variant="outline" className="text-[0.7rem] rounded-md px-2.5 py-1">
                      {categoryOptions.find((c) => c.value === alert.category)?.label || alert.category}
                    </Badge>
                  )}
                  {alert.job_type && (
                    <Badge variant="outline" className="text-[0.7rem] rounded-md px-2.5 py-1">
                      {jobTypeOptions.find((j) => j.value === alert.job_type)?.label || alert.job_type}
                    </Badge>
                  )}
                  <span className="text-[0.65rem] text-muted-foreground capitalize font-medium">{alert.frequency}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost" size="icon" className="h-8 w-8 rounded-lg"
                  onClick={() => toggleMutation.mutate(alert.id)}
                  title={alert.is_active ? "Pause" : "Resume"}
                >
                  {alert.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline" size="sm" className="h-8 text-xs px-3 rounded-lg font-medium"
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (alert.keyword) params.set("keyword", alert.keyword);
                    if (alert.location) params.set("location", alert.location);
                    if (alert.category) params.set("category", alert.category);
                    if (alert.job_type) params.set("type", alert.job_type);
                    navigate(`/jobs?${params.toString()}`);
                  }}
                >
                  View Jobs
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                  onClick={() => deleteMutation.mutate(alert.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Create Job Alert</DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">Get notified when new jobs match your criteria.</p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Keyword</Label>
              <Input value={form.keyword} onChange={(e) => setForm({ ...form, keyword: e.target.value })} placeholder="e.g. Software Engineer, Marketing" className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Location</Label>
              <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v })}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Any location" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any location</SelectItem>
                  {LOCATION_OPTIONS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Any" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any category</SelectItem>
                    {categoryOptions.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Job Type</Label>
                <Select value={form.job_type} onValueChange={(v) => setForm({ ...form, job_type: v })}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Any" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any type</SelectItem>
                    {jobTypeOptions.map((j) => <SelectItem key={j.value} value={j.value}>{j.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Frequency</Label>
              <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)} className="rounded-lg">Cancel</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-medium">
              {createMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : "Create Alert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
