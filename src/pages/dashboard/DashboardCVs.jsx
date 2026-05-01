import React, { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-toastify";
import { FileText, Upload, Star, Trash2, Download, Wand2, Lock, Palette, Crown } from "lucide-react";
import cvService from "@/services/cv";
import ConfirmDialog from "@/components/ui/confirm-dialog";

const TEMPLATE_INFO = {
  basic: { label: "Basic", description: "Clean, minimal — blue accent headers" },
  modern: { label: "Modern", description: "Contemporary with Inter font — blue theme" },
  executive: { label: "Executive", description: "Serif font, dark tones — formal style" },
  creative: { label: "Creative", description: "Poppins font, purple accent — standout design" },
};

const PLAN_INFO = {
  free: { label: "Free", color: "bg-muted text-muted-foreground" },
  professional: { label: "Professional", color: "bg-blue-100 text-blue-800" },
  premium: { label: "Premium", color: "bg-amber-100 text-amber-800" },
};

export default function DashboardCVs() {
  const { user } = useOutletContext();
  const [cvs, setCvs] = useState([]);
  const [plan, setPlan] = useState("free");
  const [limits, setLimits] = useState({ maxCVs: 1, templates: ["basic"], watermark: true });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("basic");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const fileRef = useRef(null);

  const refresh = () => {
    cvService.list().then((data) => {
      setCvs(Array.isArray(data?.cvs) ? data.cvs : (Array.isArray(data) ? data : []));
      if (data?.plan) setPlan(data.plan);
      if (data?.limits) setLimits(data.limits);
    }).catch(() => setCvs([])).finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await cvService.upload(file);
      toast.success("CV uploaded successfully.");
      refresh();
    } catch (err) {
      toast.error(err.message || "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleGenerate = async (cvId) => {
    setGenerating(true);
    try {
      const result = await cvService.generate({ cvId, templateId: selectedTemplate });
      if (result?.url) {
        window.open(result.url, "_blank");
        toast.success("CV generated! Use Print (Ctrl+P) to save as PDF.");
      } else {
        toast.info("CV generated.");
      }
      setTimeout(refresh, 1000);
    } catch (err) {
      toast.error(err.message || "Could not generate CV.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSetDefault = async (id) => {
    await cvService.setDefault(id);
    toast.success("Default CV updated.");
    refresh();
  };

  const handleDownload = async (cv) => {
    try {
      const result = await cvService.download(cv.id);
      if (result?.url) window.open(result.url, "_blank");
    } catch {
      toast.error("Could not download CV.");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await cvService.remove(deleteConfirm.id);
      toast.success("CV deleted.");
      setDeleteConfirm(null);
      refresh();
    } catch {
      toast.error("Could not delete CV.");
    }
  };

  const canAddMore = cvs.length < limits.maxCVs;
  const planInfo = PLAN_INFO[plan] || PLAN_INFO.free;

  if (loading) return <p className="text-sm text-muted-foreground">Loading CVs...</p>;

  return (
    <div className="space-y-6">
      {/* Plan badge + actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">My CVs</h2>
          <Badge className={`text-xs ${planInfo.color}`}>
            <Crown className="w-3 h-3 mr-1" /> {planInfo.label} Plan
          </Badge>
          <span className="text-xs text-muted-foreground">{cvs.length}/{limits.maxCVs} CVs</span>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => fileRef.current?.click()} disabled={uploading || !canAddMore} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Uploading..." : "Upload CV"}
          </Button>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={handleUpload} className="hidden" />
        </div>
      </div>

      {/* Template selector + Generate */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold">Generate CV from Profile</p>
                <p className="text-xs text-muted-foreground">Choose a template and generate a CV from your profile data.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TEMPLATE_INFO).map(([id, tpl]) => {
                    const locked = !limits.templates.includes(id);
                    return (
                      <SelectItem key={id} value={id} disabled={locked}>
                        {tpl.label} {locked ? "(Upgrade)" : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <Button onClick={() => handleGenerate()} disabled={generating || !canAddMore}>
                <Wand2 className="w-4 h-4 mr-2" />
                {generating ? "Generating..." : "Generate"}
              </Button>
            </div>
          </div>
          {limits.watermark && (
            <p className="text-[11px] text-amber-600 mt-3">Free plan CVs include a "Generated by JobsDirect.ie" watermark. Upgrade to remove it.</p>
          )}
        </CardContent>
      </Card>

      {/* CV list */}
      {cvs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No CVs yet. Upload one or generate from your profile.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {cvs.map((cv) => (
            <Card key={cv.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{cv.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {cv.type === "uploaded" ? cv.fileName : `Generated · ${TEMPLATE_INFO[cv.templateId]?.label || "Basic"} template`}
                      {cv.fileSize ? ` · ${(cv.fileSize / 1024).toFixed(0)} KB` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {cv.isDefault && <Badge className="text-xs">Default</Badge>}
                  {!cv.isDefault && (
                    <Button variant="ghost" size="sm" onClick={() => handleSetDefault(cv.id)}>
                      <Star className="w-3.5 h-3.5 mr-1" /> Set Default
                    </Button>
                  )}
                  {cv.type?.startsWith("generated") && (
                    <Button variant="ghost" size="sm" onClick={() => handleGenerate(cv.id)} disabled={generating}>
                      <Wand2 className="w-3.5 h-3.5 mr-1" /> Regenerate
                    </Button>
                  )}
                  {(cv.fileKey || cv.filePath) && (
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(cv)}>
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteConfirm(cv)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upgrade prompt */}
      {plan === "free" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-5 flex items-start gap-4">
            <Lock className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm mb-1">Upgrade Your CV Plan</p>
              <p className="text-xs text-muted-foreground mb-3">
                Get access to premium templates, remove the watermark, and create multiple tailored CVs for different job applications.
              </p>
              <div className="flex gap-3">
                <div className="text-center">
                  <p className="text-sm font-bold">Professional</p>
                  <p className="text-xs text-muted-foreground">1 CV, 3 templates, no watermark</p>
                  <p className="text-lg font-bold mt-1">$5</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold">Premium</p>
                  <p className="text-xs text-muted-foreground">4 CVs, all templates, no watermark</p>
                  <p className="text-lg font-bold mt-1">$10</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete CV"
        description={`Delete "${deleteConfirm?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
