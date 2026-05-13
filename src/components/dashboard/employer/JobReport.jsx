import { jsPDF } from "jspdf";

// ── Color palette: formal, restrained ──
const INK = [20, 20, 20];
const DARK = [35, 35, 40];
const MID = [90, 90, 100];
const LIGHT = [140, 140, 150];
const RULE = [200, 200, 205];
const ACCENT = [14, 100, 70]; // deep institutional green
const PAGE_BG = [255, 255, 255];

function fmtDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" });
}

function fmtSalary(min, max, period) {
  if (!min && !max) return "Not disclosed";
  const f = (n) => new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  const p = period ? ` per ${period.replace("annual", "annum")}` : "";
  if (min && max && min !== max) return `${f(min)} – ${f(max)}${p}`;
  return `${f(min || max)}${p}`;
}

function fmtType(val) {
  const m = { full_time: "Full-Time", part_time: "Part-Time", contract: "Contract", temporary: "Temporary", internship: "Internship", on_site: "On-Site", hybrid: "Hybrid", remote: "Remote", blended: "Blended" };
  return m[val] || (val || "—").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function stripHtml(html) {
  if (!html) return "";
  const d = document.createElement("div");
  d.innerHTML = html;
  return (d.textContent || d.innerText || "").trim();
}

function wrappedText(doc, text, x, y, maxW, lh, pageBreakY = 272) {
  const lines = doc.splitTextToSize(text, maxW);
  for (const line of lines) {
    if (y > pageBreakY) { doc.addPage(); y = 32; }
    doc.text(line, x, y);
    y += lh;
  }
  return y;
}

function rule(doc, x1, x2, y, weight = 0.25) {
  doc.setDrawColor(...RULE);
  doc.setLineWidth(weight);
  doc.line(x1, y, x2, y);
}

function heavyRule(doc, x1, x2, y) {
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.6);
  doc.line(x1, y, x2, y);
}

export function generateJobReport(data) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const ML = 25; // generous legal margins
  const MR = 25;
  const CW = W - ML - MR;
  let y = 0;

  // ══════════════════════════════════════════════
  // HEADER — Formal letterhead style
  // ══════════════════════════════════════════════

  y = 22;

  // Brand mark — left
  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...INK);
  doc.text("JobsDirect", ML, y);
  doc.setTextColor(...ACCENT);
  doc.text(".ie", ML + doc.getTextWidth("JobsDirect"), y);

  // Document ref — right aligned
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...LIGHT);
  doc.text(`Document Ref: ${data.referenceNumber}`, W - MR, y - 5, { align: "right" });
  doc.text(`Date of Issue: ${fmtDate(data.dateGenerated)}`, W - MR, y, { align: "right" });

  y += 4;

  // Double rule under header
  heavyRule(doc, ML, W - MR, y);
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.3);
  doc.line(ML, y + 1.2, W - MR, y + 1.2);

  y += 12;

  // ══════════════════════════════════════════════
  // TITLE BLOCK
  // ══════════════════════════════════════════════

  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...INK);
  doc.text("Certificate of Job Advertisement", ML, y);

  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MID);
  doc.text("Issued pursuant to the Employment Permits Act 2006 (as amended)", ML, y);

  y += 10;

  rule(doc, ML, W - MR, y);

  y += 8;

  // ══════════════════════════════════════════════
  // SECTION 1 — Advertisement Summary
  // ══════════════════════════════════════════════

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...ACCENT);
  doc.text("SECTION 1", ML, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  doc.text("Advertisement Summary", ML + 24, y);

  y += 8;

  // Summary grid — 2x2
  const colW = CW / 2;
  const summaryItems = [
    ["Date Published", fmtDate(data.datePublished)],
    ["Expiry Date", data.isActive ? "Currently Active" : fmtDate(data.dateExpired)],
    ["Unique Views", String(data.viewsCount || 0)],
    ["Applications Received", String(data.applicationCount || 0)],
  ];

  summaryItems.forEach(([label, value], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const sx = ML + col * colW;
    const sy = y + row * 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...LIGHT);
    doc.text(label.toUpperCase(), sx, sy);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...DARK);
    doc.text(value, sx, sy + 6);
  });

  y += 32;

  rule(doc, ML, W - MR, y);

  y += 8;

  // ══════════════════════════════════════════════
  // SECTION 2 — Position Details
  // ══════════════════════════════════════════════

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...ACCENT);
  doc.text("SECTION 2", ML, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  doc.text("Position Details", ML + 24, y);

  y += 8;

  const fields = [
    ["Position Title", data.title],
    ["Employer", data.companyName],
    ["Location", data.locationFull || data.location],
    ["Sector", data.sector],
    ["Employment Type", fmtType(data.jobType)],
    ["Work Arrangement", fmtType(data.workType)],
    ["Remuneration", fmtSalary(data.salaryMin, data.salaryMax, data.salaryPeriod)],
    ["Application Channel", fmtType(data.applicationMethod)],
  ];

  fields.forEach(([label, value]) => {
    // Label column
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MID);
    doc.text(label, ML, y);

    // Value column
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...DARK);
    doc.text(String(value || "—"), ML + 52, y);

    y += 7;
  });

  y += 3;

  rule(doc, ML, W - MR, y);

  y += 8;

  // ══════════════════════════════════════════════
  // SECTION 3 — Job Description
  // ══════════════════════════════════════════════

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...ACCENT);
  doc.text("SECTION 3", ML, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  doc.text("Advertisement Content", ML + 24, y);

  y += 7;

  const desc = stripHtml(data.description) || "No description provided.";
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK);
  y = wrappedText(doc, desc, ML, y, CW, 4.2);

  y += 6;

  rule(doc, ML, W - MR, y);

  y += 8;

  // ══════════════════════════════════════════════
  // DECLARATION
  // ══════════════════════════════════════════════

  if (y > 235) { doc.addPage(); y = 32; }

  // Accent left bar
  doc.setFillColor(...ACCENT);
  doc.rect(ML, y - 2, 1.5, 32, "F");

  const declX = ML + 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...ACCENT);
  doc.text("DECLARATION", declX, y);

  y += 6;

  doc.setFont("times", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);

  const declaration = "This document certifies that the position described above was advertised on JobsDirect.ie, an independent third-party job advertising platform registered and operating in Ireland. This certificate is issued for the purposes of satisfying the labour market needs test and advertising requirements under the Employment Permits Act 2006 and associated regulations.";

  y = wrappedText(doc, declaration, declX, y, CW - 8, 4.5);

  y += 12;

  // Signature area
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.3);
  doc.line(ML, y, ML + 55, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...MID);
  doc.text("JobsDirect.ie — Automated Verification System", ML, y + 5);
  doc.text(fmtDate(data.dateGenerated), ML, y + 9);

  // ══════════════════════════════════════════════
  // FOOTER — every page
  // ══════════════════════════════════════════════

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    const fy = 286;

    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.2);
    doc.line(ML, fy, W - MR, fy);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...LIGHT);
    doc.text("JobsDirect.ie  ·  Third-Party Job Advertising Platform  ·  Republic of Ireland", ML, fy + 4);
    doc.text(`${data.referenceNumber}  ·  Page ${i} of ${totalPages}`, W - MR, fy + 4, { align: "right" });
  }

  return doc;
}

export async function downloadJobReport(jobId, jobService) {
  const data = await jobService.getReport(jobId);
  const doc = generateJobReport(data);
  doc.save(`JobsDirect-Report-${data.referenceNumber}.pdf`);
}

export async function printJobReport(jobId, jobService) {
  const data = await jobService.getReport(jobId);
  const doc = generateJobReport(data);
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const win = window.open(url);
  if (win) {
    win.onload = () => { win.print(); URL.revokeObjectURL(url); };
  }
}
