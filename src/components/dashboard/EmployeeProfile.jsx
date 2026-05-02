import React, { useEffect, useMemo, useState } from "react";
import employeeService from "@/services/employee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-toastify";
import { getAdultDateMax, isAtLeast18 } from "@/lib/age";
import { EMPLOYEE_FIELD_GROUPS, hasFieldValue } from "@/lib/siteSettings";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Plus, Trash2 } from "lucide-react";
import PhoneField from "@/components/ui/phone-input";
import SearchableSelect from "@/components/ui/searchable-select";

function normalizeStringArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function normalizeObjectArray(value) {
  return Array.isArray(value) ? value : [];
}

function createFormState(employee) {
  const state = {};
  for (const group of EMPLOYEE_FIELD_GROUPS) {
    for (const f of group.fields) {
      const val = employee[f.key];
      if (f.type === "tags") {
        state[f.key] = normalizeStringArray(val);
      } else if (f.type === "repeater") {
        state[f.key] = normalizeObjectArray(val);
      } else if (f.type === "boolean") {
        state[f.key] = val !== false;
      } else {
        state[f.key] = val || f.defaultValue;
      }
    }
  }
  return state;
}

function FieldRenderer({ field, value, onChange }) {
  const maxDateOfBirth = getAdultDateMax();

  switch (field.type) {
    case "phone":
      return (
        <PhoneField
          value={value || ""}
          onChange={onChange}
          placeholder={field.placeholder}
        />
      );
    case "text":
    case "email":
    case "url":
      return (
        <Input
          type={field.type === "text" ? "text" : field.type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      );
    case "number":
      return (
        <Input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      );
    case "date":
      return (
        <Input
          type="date"
          max={field.key === "date_of_birth" ? maxDateOfBirth : undefined}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "textarea":
      return (
        <Textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[100px]"
          placeholder={field.placeholder}
        />
      );
    case "select":
      if (field.searchable) {
        return (
          <SearchableSelect
            options={field.options || []}
            value={value || ""}
            onValueChange={onChange}
            placeholder={`Select ${field.label.toLowerCase()}`}
            searchPlaceholder={`Search ${field.label.toLowerCase()}...`}
          />
        );
      }
      return (
        <Select value={value || ""} onValueChange={onChange}>
          <SelectTrigger><SelectValue placeholder={`Select ${field.label.toLowerCase()}`} /></SelectTrigger>
          <SelectContent>
            {(field.options || []).map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "boolean":
      return (
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-sm font-medium">{field.label}</p>
            {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
          </div>
          <Switch checked={Boolean(value)} onCheckedChange={onChange} />
        </div>
      );
    default:
      return null;
  }
}

function TagsField({ value = [], onChange }) {
  const [newTag, setNewTag] = useState("");

  const addTag = () => {
    if (newTag.trim()) {
      onChange([...value, newTag.trim()]);
      setNewTag("");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {value.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-sm">
            {tag}
            <button onClick={() => onChange(value.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Add a skill"
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
        />
        <Button variant="outline" onClick={addTag}><Plus className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}

function RepeaterField({ field, value = [], onChange }) {
  const subFields = field.subFields || [];

  const addItem = () => {
    const emptyItem = subFields.reduce((acc, sf) => ({ ...acc, [sf.key]: sf.type === "boolean" ? false : "" }), {});
    onChange([...value, emptyItem]);
  };

  const removeItem = (idx) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const updateItem = (idx, key, val) => {
    const updated = [...value];
    updated[idx] = { ...updated[idx], [key]: val };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {value.map((item, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <p className="text-sm font-medium">{field.label} #{i + 1}</p>
            <Button variant="ghost" size="sm" onClick={() => removeItem(i)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subFields.map((sf) => (
              <div key={sf.key} className={sf.span === 2 ? "sm:col-span-2" : ""}>
                {sf.type === "textarea" ? (
                  <Textarea
                    placeholder={sf.label}
                    value={item[sf.key] || ""}
                    onChange={(e) => updateItem(i, sf.key, e.target.value)}
                  />
                ) : sf.type === "boolean" ? (
                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <Checkbox
                      checked={Boolean(item[sf.key])}
                      onCheckedChange={(v) => updateItem(i, sf.key, Boolean(v))}
                    />
                    <span className="text-sm">{sf.label}</span>
                  </label>
                ) : (
                  <Input
                    type={sf.type === "date" ? "date" : "text"}
                    placeholder={sf.label}
                    value={item[sf.key] || ""}
                    onChange={(e) => updateItem(i, sf.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addItem}>
        <Plus className="w-4 h-4 mr-1" />Add {field.label}
      </Button>
    </div>
  );
}

export default function EmployeeProfile({ employee, setEmployee, excludeGroups = [] }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => createFormState(employee));
  const { settings: appSettings } = useSiteSettings();
  const formConfig = appSettings?.employee_profile_form_config || {};

  useEffect(() => {
    setForm(createFormState(employee));
  }, [employee]);

  const visibleGroups = useMemo(
    () =>
      EMPLOYEE_FIELD_GROUPS
        .filter((g) => !excludeGroups.includes(g.id))
        .map((group) => ({
          ...group,
          fields: group.fields.filter((field) => formConfig?.[field.key]?.visible !== false),
        }))
        .filter((group) => group.fields.length),
    [formConfig, excludeGroups],
  );

  const handleSave = async () => {
    if (form.date_of_birth && !isAtLeast18(form.date_of_birth)) {
      toast.error("Invalid Date of Birth — Employee profile users must be at least 18 years old.");
      return;
    }

    for (const group of visibleGroups) {
      for (const field of group.fields) {
        if (formConfig?.[field.key]?.required && !hasFieldValue(field, form[field.key])) {
          toast.error(`Missing required field — ${field.label} is required before saving.`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      await employeeService.update(employee.id, { ...form, profile_completed: true });
      setEmployee({ ...employee, ...form, profile_completed: true });
      toast.success("Profile Updated");
    } catch (err) {
      toast.error(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {visibleGroups.map((group) => (
        <div key={group.id} className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/40">
            <h3 className="text-base font-display font-semibold text-foreground">{group.title}</h3>
            {group.description && <p className="text-sm text-muted-foreground mt-0.5">{group.description}</p>}
          </div>
          <div className="px-6 py-5">
            {group.fields.length === 1 && group.fields[0].type === "tags" ? (
              <TagsField
                value={form[group.fields[0].key]}
                onChange={(val) => updateField(group.fields[0].key, val)}
              />
            ) : group.fields.length === 1 && group.fields[0].type === "repeater" ? (
              <RepeaterField
                field={group.fields[0]}
                value={form[group.fields[0].key]}
                onChange={(val) => updateField(group.fields[0].key, val)}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {group.fields.map((f) => {
                  if (f.type === "boolean") {
                    return (
                      <div key={f.key} className={f.span === 2 ? "sm:col-span-2" : ""}>
                        <FieldRenderer field={f} value={form[f.key]} onChange={(val) => updateField(f.key, val)} />
                      </div>
                    );
                  }
                  return (
                    <div key={f.key} className={`space-y-2 ${f.span === 2 ? "sm:col-span-2" : ""}`}>
                      <Label className="text-sm font-medium">{f.label}{formConfig?.[f.key]?.required && <span className="text-destructive ml-0.5">*</span>}</Label>
                      <FieldRenderer field={f} value={form[f.key]} onChange={(val) => updateField(f.key, val)} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ))}

      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8 h-11 font-medium"
      >
        {saving ? <><Save className="w-4 h-4 mr-2 animate-pulse" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Profile</>}
      </Button>
    </div>
  );
}
