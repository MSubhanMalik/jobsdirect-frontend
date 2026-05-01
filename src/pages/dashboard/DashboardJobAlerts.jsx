import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import jobAlertService from "@/services/jobAlert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { Bell, Plus, Trash2, Pause, Play, MapPin, Search, Briefcase } from "lucide-react";
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
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ keyword: "", location: "", category: "", jobType: "", frequency: "daily" });

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
      setForm({ keyword: "", location: "", category: "", jobType: "", frequency: "daily" });
    },
    onError: (err) => toast.error(err.message || "Failed to create alert"),
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => jobAlertService.toggle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["job-alerts"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => jobAlertService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-alerts"] });
      toast.success("Alert deleted");
    },
  });

  const handleCreate = () => {
    if (!form.keyword && !form.location && !form.category && !form.jobType) {
      toast.error("Add at least one filter");
      return;
    }
    createMutation.mutate(form);
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading alerts...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Job Alerts</h2>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" /> Create Alert
        </Button>
      </div>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No job alerts yet. Create one to get notified when matching jobs are posted.</p>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-2" /> Create Your First Alert
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card key={alert.id} className={!alert.isActive ? "opacity-60" : ""}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap min-w-0">
                  <Bell className={`w-5 h-5 shrink-0 ${alert.isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="flex items-center gap-2 flex-wrap">
                    {alert.keyword && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Search className="w-3 h-3" /> {alert.keyword}
                      </Badge>
                    )}
                    {alert.location && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <MapPin className="w-3 h-3" /> {alert.location}
                      </Badge>
                    )}
                    {alert.category && (
                      <Badge variant="outline" className="text-xs">
                        {categoryOptions.find((c) => c.value === alert.category)?.label || alert.category}
                      </Badge>
                    )}
                    {alert.jobType && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Briefcase className="w-3 h-3" />
                        {jobTypeOptions.find((j) => j.value === alert.jobType)?.label || alert.jobType}
                      </Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground capitalize">{alert.frequency}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleMutation.mutate(alert.id)}
                    title={alert.isActive ? "Pause" : "Resume"}
                  >
                    {alert.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => deleteMutation.mutate(alert.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Job Alert</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1">
              <Label>Keyword</Label>
              <Input
                value={form.keyword}
                onChange={(e) => setForm({ ...form, keyword: e.target.value })}
                placeholder="e.g. Software Engineer, Marketing"
              />
            </div>
            <div className="space-y-1">
              <Label>Location</Label>
              <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v })}>
                <SelectTrigger><SelectValue placeholder="Any location" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any location</SelectItem>
                  {LOCATION_OPTIONS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue placeholder="Any category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any category</SelectItem>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Job Type</Label>
              <Select value={form.jobType} onValueChange={(v) => setForm({ ...form, jobType: v })}>
                <SelectTrigger><SelectValue placeholder="Any type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any type</SelectItem>
                  {jobTypeOptions.map((j) => (
                    <SelectItem key={j.value} value={j.value}>{j.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Frequency</Label>
              <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Alert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
