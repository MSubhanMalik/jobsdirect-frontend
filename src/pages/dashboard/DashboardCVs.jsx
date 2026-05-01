import React, { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import { FileText, Upload, Star, Trash2, Download, Wand2 } from "lucide-react";
import cvService from "@/services/cv";
import ConfirmDialog from "@/components/ui/confirm-dialog";

export default function DashboardCVs() {
  const { user } = useOutletContext();
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const fileRef = useRef(null);

  const refresh = () => {
    cvService.list().then(setCvs).catch(() => setCvs([])).finally(() => setLoading(false));
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

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await cvService.generate();
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
      if (result?.url) {
        window.open(result.url, "_blank");
      }
    } catch (err) {
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
    } catch (err) {
      toast.error("Could not delete CV.");
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading CVs...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">My CVs</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerate} disabled={generating}>
            <Wand2 className="w-4 h-4 mr-2" />
            {generating ? "Generating..." : "Generate Free CV"}
          </Button>
          <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Uploading..." : "Upload CV"}
          </Button>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={handleUpload} className="hidden" />
        </div>
      </div>

      {cvs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No CVs yet. Upload one or generate a free CV from your profile.</p>
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
                      {cv.type === "uploaded" ? cv.fileName : "Generated from profile"}
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
