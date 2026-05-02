import React from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

export default function PhoneField({ value, onChange, placeholder = "Phone number", disabled = false, className = "" }) {
  return (
    <div className={`phone-field-wrapper ${className}`}>
      <PhoneInput
        international
        defaultCountry="IE"
        value={value || ""}
        onChange={(val) => onChange(val || "")}
        placeholder={placeholder}
        disabled={disabled}
        className="phone-field"
      />
      <style>{`
        .phone-field-wrapper .PhoneInput {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .phone-field-wrapper .PhoneInputCountry {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .phone-field-wrapper .PhoneInputCountryIcon {
          width: 22px;
          height: 16px;
          border-radius: 2px;
          overflow: hidden;
          box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
        }
        .phone-field-wrapper .PhoneInputCountryIcon--border {
          box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
        }
        .phone-field-wrapper .PhoneInputCountrySelectArrow {
          width: 6px;
          height: 6px;
          border-color: #999;
          opacity: 0.6;
        }
        .phone-field-wrapper .PhoneInputCountrySelect {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          z-index: 1;
          border: 0;
          opacity: 0;
          cursor: pointer;
        }
        .phone-field-wrapper .PhoneInputInput {
          flex: 1;
          height: 36px;
          padding: 0 12px;
          font-size: 14px;
          line-height: 1;
          border-radius: 8px;
          border: 1px solid hsl(var(--border));
          background: hsl(var(--background));
          color: hsl(var(--foreground));
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .phone-field-wrapper .PhoneInputInput::placeholder {
          color: hsl(var(--muted-foreground));
          opacity: 0.6;
        }
        .phone-field-wrapper .PhoneInputInput:focus {
          border-color: hsl(var(--accent));
          box-shadow: 0 0 0 2px hsl(var(--accent) / 0.15);
        }
        .phone-field-wrapper .PhoneInputInput:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
