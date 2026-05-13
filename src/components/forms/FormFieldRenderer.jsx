import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import PhoneField from "@/components/ui/phone-input";
import SearchableSelect from "@/components/ui/searchable-select";

export default function FormFieldRenderer({ field, value, onChange, required = false, disabled = false, inputRef = null }) {
  const wrapperClassName = field.span === 2 ? "sm:col-span-2" : "";

  if (field.type === "boolean") {
    return (
      <div className={`flex items-center justify-between rounded-lg border p-3 ${wrapperClassName}`}>
        <div className="pr-4">
          <Label>{field.label}</Label>
          {field.description ? <p className="mt-1 text-xs text-muted-foreground">{field.description}</p> : null}
        </div>
        <Switch checked={Boolean(value)} onCheckedChange={onChange} disabled={disabled} />
      </div>
    );
  }

  const label = required && field.supportsRequired !== false ? `${field.label} *` : field.label;

  return (
    <div className={`space-y-2 ${wrapperClassName}`}>
      <Label>{label}</Label>

      {field.type === "textarea" ? (
        <Textarea
          ref={inputRef}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          className={field.rows ? undefined : "min-h-[120px]"}
          rows={field.rows}
          disabled={disabled}
          required={required}
          {...field.inputProps}
        />
      ) : null}

      {field.type === "select" && field.searchable ? (
        <SearchableSelect
          options={field.options || []}
          value={value || ""}
          onValueChange={onChange}
          placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`}
          searchPlaceholder={`Search ${field.label.toLowerCase()}...`}
          disabled={disabled}
        />
      ) : field.type === "select" ? (
        <Select
          value={value || undefined}
          onValueChange={onChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {(field.options || []).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      {field.type === "phone" ? (
        <PhoneField
          value={value ?? ""}
          onChange={onChange}
          placeholder={field.placeholder}
          disabled={disabled}
        />
      ) : null}

      {field.type === "tags" ? (
        <TagsInput value={value} onChange={onChange} placeholder={field.placeholder} disabled={disabled} />
      ) : field.type !== "textarea" && field.type !== "select" && field.type !== "phone" ? (
        <Input
          ref={inputRef}
          type={field.type === "email" || field.type === "number" || field.type === "date" || field.type === "url" ? field.type : "text"}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          disabled={disabled}
          required={required}
          {...field.inputProps}
        />
      ) : null}

      {field.description ? <p className="text-xs text-muted-foreground">{field.description}</p> : null}
    </div>
  );
}

function TagsInput({ value, onChange, placeholder, disabled }) {
  const [input, setInput] = useState("");
  const tags = Array.isArray(value) ? value : (typeof value === "string" && value ? value.split(",").map(s => s.trim()).filter(Boolean) : []);

  const addTag = () => {
    const tag = input.trim();
    if (!tag || tags.includes(tag)) return;
    const updated = [...tags, tag];
    onChange(updated);
    setInput("");
  };

  const removeTag = (idx) => {
    onChange(tags.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-muted text-sm px-2.5 py-1 rounded-md">
            {tag}
            <button type="button" onClick={() => removeTag(i)} className="text-muted-foreground hover:text-destructive ml-0.5" disabled={disabled}>
              &times;
            </button>
          </span>
        ))}
      </div>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addTag();
          }
        }}
        placeholder={placeholder || "Type and press Enter to add"}
        disabled={disabled}
      />
    </div>
  );
}
