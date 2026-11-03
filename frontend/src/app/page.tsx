"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Trash2,
} from "lucide-react";

// ============================================================================
// 1. ZOD VALIDATION SCHEMA (As specified in Proposal Technology Stack)
// ============================================================================
const uploadReportSchema = z.object({
  title: z.string().min(2, "Report title is required (e.g., Annual blood test)"),
  reportType: z.string().min(1, "Please select a document category"),
  reportDate: z.string().optional(),
  privateNotes: z.string().optional(),
});

type UploadReportFormValues = z.infer<typeof uploadReportSchema>;

interface SavedReport {
  id: string;
  title: string;
  fileName: string;
  reportType: string;
  reportDate: string;
  privateNotes?: string;
  consented: boolean;
}

// ============================================================================
// 2. REUSABLE LEFT SIDEBAR COMPONENT (Alex Morgan Private Profile)
// ============================================================================
function CustomerHealthSidebar({
  reportCount,
  activeNav,
  setActiveNav,
}: {
  reportCount: number;
  activeNav: string;
  setActiveNav: (nav: string) => void;
}) {
  return (
    <aside className="w-full md:w-[250px] shrink-0 bg-[#FAF9F5] border-b md:border-b-0 md:border-r border-[#EAE6DF] p-6 flex flex-col justify-between min-h-[640px]">
      <div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs text-[#6E6D68] hover:text-[#1F241F] mb-7 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to marketplace</span>
        </button>

        {/* User Avatar & Name */}
        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 rounded-full bg-[#EBF0EA] text-[#3B5240] font-semibold text-xs flex items-center justify-center border border-[#D8E2D7]">
            AM
          </div>
          <div>
            <div className="text-sm font-bold text-[#1F241F] leading-tight">
              Alex Morgan
            </div>
            <div className="text-[11px] text-[#787670] mt-0.5">
              Private profile
            </div>
          </div>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="space-y-1">
          <button
            type="button"
            onClick={() => setActiveNav("profile")}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              activeNav === "profile"
                ? "bg-[#E2ECE1] text-[#26472E] font-semibold"
                : "text-[#5A5955] hover:bg-[#F1EFEA]"
            }`}
          >
            Health &amp; dietary profile
          </button>

          <button
            type="button"
            onClick={() => setActiveNav("reports")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              activeNav === "reports"
                ? "bg-[#E2ECE1] text-[#26472E]"
                : "text-[#5A5955] hover:bg-[#F1EFEA]"
            }`}
          >
            <span>Medical reports</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2F5E39]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2F5E39]"></span>
              {reportCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveNav("insights")}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              activeNav === "insights"
                ? "bg-[#E2ECE1] text-[#26472E] font-semibold"
                : "text-[#5A5955] hover:bg-[#F1EFEA]"
            }`}
          >
            AI dietary insights
          </button>

          <button
            type="button"
            onClick={() => setActiveNav("privacy")}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              activeNav === "privacy"
                ? "bg-[#E2ECE1] text-[#26472E] font-semibold"
                : "text-[#5A5955] hover:bg-[#F1EFEA]"
            }`}
          >
            Privacy &amp; data settings
          </button>
        </nav>
      </div>

      {/* Bottom Privacy Badge */}
      <div className="mt-10 bg-[#EAEFE8] border border-[#DCE5DA] rounded-xl p-3.5">
        <div className="flex items-center gap-2 text-xs font-bold text-[#253D29]">
          <ShieldCheck className="w-4 h-4 text-[#2F5E39] shrink-0" />
          <span>Private by default</span>
        </div>
        <p className="text-[11px] text-[#5B6B5C] mt-1 leading-relaxed">
          Your reports are never shared with chefs, suppliers, or delivery
          partners.
        </p>
      </div>
    </aside>
  );
}

// ============================================================================
// 3. MAIN PAGE COMPONENT (Connected to Django Backend at 127.0.0.1:8000)
// ============================================================================
export default function MedicalReportsCustomerPage() {
  const [displayMode, setDisplayMode] = useState<
    "stacked" | "consent" | "upload"
  >("stacked");
  const [activeNav, setActiveNav] = useState<string>("reports");

  // State for saved medical reports
  const [reports, setReports] = useState<SavedReport[]>([
    {
      id: "rep-1",
      title: "Annual blood test",
      fileName: "Annual blood test.pdf",
      reportType: "Blood Test",
      reportDate: "14 May 2025",
      consented: false,
    },
    {
      id: "rep-2",
      title: "Lipid profile",
      fileName: "Lipid profile.pdf",
      reportType: "Lipid Panel",
      reportDate: "18 Feb 2025",
      consented: true,
    },
  ]);

  // State for Screen 1: Before AI processing begins (Consent)
  const [activeReport, setActiveReport] = useState<SavedReport>(reports[0]);
  const [isConsentChecked, setIsConsentChecked] = useState<boolean>(false);
  const [aiStatusBanner, setAiStatusBanner] = useState<string | null>(null);

  // State for Screen 2: Upload a medical report
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadSuccessBanner, setUploadSuccessBanner] = useState<string | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UploadReportFormValues>({
    resolver: zodResolver(uploadReportSchema),
    defaultValues: {
      title: "",
      reportType: "",
      reportDate: "",
      privateNotes: "",
    },
  });

  // File Selection & Validation (PDF, JPG, or PNG - Max 10 MB)
  const handleFileValidation = (file: File) => {
    setFileError(null);
    const validTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setFileError("Only PDF, JPG, or PNG files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError("File size exceeds the 10 MB maximum limit.");
      return;
    }
    setSelectedFile(file);
  };

  // Submit Handler for Screen 2: Upload a medical report (Connected to Django API)
  const onSubmitUpload = async (data: UploadReportFormValues) => {
    const fileNameToSave = selectedFile
      ? selectedFile.name
      : `${data.title.trim()}.pdf`;

    const formattedDate = data.reportDate
      ? new Date(data.reportDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "02 Nov 2026";

    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("report_type", data.reportType);
      if (data.reportDate) {
        formData.append("report_date", data.reportDate);
      }
      if (data.privateNotes) {
        formData.append("private_notes", data.privateNotes);
      }
      formData.append("supabase_file_path", `medical-reports/${fileNameToSave}`);

      const response = await fetch("http://127.0.0.1:8000/api/medical-reports/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to save report to Django backend");
      }

      const savedDbRecord = await response.json();

      const newReport: SavedReport = {
        id: savedDbRecord.id,
        title: savedDbRecord.title,
        fileName: fileNameToSave,
        reportType: savedDbRecord.report_type,
        reportDate: formattedDate,
        privateNotes: savedDbRecord.private_notes,
        consented: false,
      };

      setReports((prev) => [newReport, ...prev]);
      setActiveReport(newReport);
      setIsConsentChecked(false);
      setUploadSuccessBanner(
        `Saved "${newReport.fileName}" to Django Database (ID: ${savedDbRecord.id.slice(0, 8)}...). Ready for AI consent above!`
      );
      reset();
      setSelectedFile(null);
    } catch (error) {
      console.error("Backend error:", error);
      setFileError(
        "Could not connect to Django at http://127.0.0.1:8000. Make sure python manage.py runserver is running."
      );
    }
  };

  // Consent Handler for Screen 1: Before AI processing begins (Connected to Django API)
  const handleConsentAndBegin = async () => {
    if (!isConsentChecked) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/medical-reports/${activeReport.id}/consent-ai/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            explicitly_consented: true,
            policy_version: "v1.0-2026",
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setReports((prev) =>
          prev.map((r) =>
            r.id === activeReport.id ? { ...r, consented: true } : r
          )
        );
        setAiStatusBanner(
          `Django recorded consent at ${new Date(result.consented_at).toLocaleTimeString()}! AI Dietary Insight: "${result.ai_insights.educational_summary}"`
        );
      } else {
        setAiStatusBanner(
          `Explicit consent recorded for "${activeReport.fileName}". Tip: Upload a new report below first to test Consent with a real database UUID!`
        );
      }
    } catch (error) {
      console.error("Consent API error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#ECEBE6] py-8 px-4 sm:px-6 font-sans text-[#1F241F]">
      {/* Top Helper Toolbar for Demoing in Class */}
      <div className="max-w-[1040px] mx-auto mb-6 bg-white border border-[#E2DFD7] rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#2F5E39]">
          <Sparkles className="w-4 h-4" />
          <span>
            CSE 327 Customer Module: Medical Reports &amp; AI Processing Consent
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#F5F4EE] p-1 rounded-lg border border-[#E5E2DA]">
          <button
            type="button"
            onClick={() => setDisplayMode("stacked")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              displayMode === "stacked"
                ? "bg-[#3E6B48] text-white"
                : "text-[#5A5955] hover:text-[#1F241F]"
            }`}
          >
            Show Both Screens (Full Assignment View)
          </button>
          <button
            type="button"
            onClick={() => setDisplayMode("consent")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              displayMode === "consent"
                ? "bg-[#3E6B48] text-white"
                : "text-[#5A5955] hover:text-[#1F241F]"
            }`}
          >
            1. AI Consent Screen Only
          </button>
          <button
            type="button"
            onClick={() => setDisplayMode("upload")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              displayMode === "upload"
                ? "bg-[#3E6B48] text-white"
                : "text-[#5A5955] hover:text-[#1F241F]"
            }`}
          >
            2. Upload Report Screen Only
          </button>
        </div>
      </div>

      <div className="max-w-[1040px] mx-auto space-y-10">
        {/* =====================================================================
            SCREEN 1: BEFORE AI PROCESSING BEGINS (TOP SCREEN IN SCREENSHOT)
           ===================================================================== */}
        {(displayMode === "stacked" || displayMode === "consent") && (
          <div className="bg-[#F6F5F0] border border-[#E5E2DA] rounded-none sm:rounded-lg shadow-sm overflow-hidden flex flex-col md:flex-row">
            <CustomerHealthSidebar
              reportCount={reports.length}
              activeNav={activeNav}
              setActiveNav={setActiveNav}
            />

            <main className="flex-1 p-6 sm:p-10">
              {/* Top Breadcrumb + Consent Required Badge */}
              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs text-[#6E6D68] hover:text-[#1F241F]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{activeReport.title}</span>
                </button>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FBEAE3] text-[#B84A27]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B84A27]"></span>
                  Consent required
                </span>
              </div>

              {/* Serif Heading */}
              <h1 className="font-serif text-2xl sm:text-[32px] font-bold text-[#1D221D] tracking-tight leading-snug">
                Before AI processing begins
              </h1>
              <p className="text-xs sm:text-[13px] text-[#6B6A65] mt-1.5 leading-relaxed">
                Review how your selected document will be used. This optional
                feature provides general dietary information, not medical
                advice.
              </p>

              {/* Feedback Banner when Consent is Confirmed */}
              {aiStatusBanner && (
                <div className="mt-4 p-3.5 rounded-lg bg-[#E6F2E8] border border-[#BBD8C0] flex items-center gap-2.5 text-xs text-[#22522B] font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2E6B38]" />
                  <span>{aiStatusBanner}</span>
                </div>
              )}

              {/* Selected PDF Document Summary Card */}
              <div className="mt-6 bg-white border border-[#E6E3DC] rounded-xl p-4 flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-[#EAEFE8] text-[#355E3C] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#1F241F] truncate">
                    {activeReport.fileName}
                  </div>
                  <div className="text-[11px] text-[#7A7872] mt-0.5">
                    {activeReport.reportType} &middot; Uploaded{" "}
                    {activeReport.reportDate}
                  </div>
                </div>
              </div>

              {/* 2x2 Disclosure Grid: Purpose, Data shared, Limits, Your choice */}
              <div className="mt-4 bg-white border border-[#E6E3DC] rounded-xl grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#EAE7E0] overflow-hidden">
                <div className="divide-y divide-[#EAE7E0]">
                  <div className="p-4 sm:p-5">
                    <h2 className="text-xs font-bold text-[#1F241F]">
                      Purpose
                    </h2>
                    <p className="text-[11px] text-[#6E6D68] mt-1 leading-relaxed">
                      Extract readable report values and offer cautious, general
                      food-related context.
                    </p>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h2 className="text-xs font-bold text-[#1F241F]">Limits</h2>
                    <p className="text-[11px] text-[#6E6D68] mt-1 leading-relaxed">
                      AI output may be incomplete or inaccurate and is not a
                      diagnosis. Provider retention and deletion limits may
                      apply.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-[#EAE7E0]">
                  <div className="p-4 sm:p-5">
                    <h2 className="text-xs font-bold text-[#1F241F]">
                      Data shared
                    </h2>
                    <p className="text-[11px] text-[#6E6D68] mt-1 leading-relaxed">
                      The selected report and your saved dietary preferences may
                      be sent to an external AI provider. Chefs and delivery
                      partners cannot access it.
                    </p>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h2 className="text-xs font-bold text-[#1F241F]">
                      Your choice
                    </h2>
                    <p className="text-[11px] text-[#6E6D68] mt-1 leading-relaxed">
                      You can decline and continue using the marketplace. Revoke
                      future processing in Privacy &amp; Data Settings.
                    </p>
                  </div>
                </div>
              </div>

              {/* Explicit Consent Checkbox Box */}
              <label className="mt-4 block bg-[#FDF1EB] border border-[#F3D5C8] rounded-xl p-4 cursor-pointer select-none">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isConsentChecked}
                    onChange={(e) => {
                      setIsConsentChecked(e.target.checked);
                      setAiStatusBanner(null);
                    }}
                    className="mt-0.5 h-4 w-4 rounded border-[#C8B2A6] text-[#3E6B48] focus:ring-[#3E6B48]"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#23201E]">
                      I explicitly consent to AI processing of this selected
                      report for general dietary insights.
                    </div>
                    <div className="text-[11px] text-[#8C6D60] mt-0.5">
                      Consent scope, policy version, timestamp, and revocation
                      status should be recorded by a future backend.
                    </div>
                  </div>
                </div>
              </label>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsConsentChecked(false);
                    setAiStatusBanner(
                      "You declined AI processing. Your report remains private."
                    );
                  }}
                  className="px-4 py-2 rounded-lg bg-white border border-[#DCD9D0] text-xs font-semibold text-[#2B2B28] hover:bg-[#F2F0EA] transition-colors"
                >
                  Decline and return
                </button>
                <button
                  type="button"
                  disabled={!isConsentChecked}
                  onClick={handleConsentAndBegin}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors ${
                    isConsentChecked
                      ? "bg-[#3B6243] hover:bg-[#2F5036] cursor-pointer"
                      : "bg-[#9BB09D] cursor-not-allowed"
                  }`}
                >
                  Consent and begin
                </button>
              </div>
            </main>
          </div>
        )}

        {/* Peach Divider Bar (Matches Capture1_2.PNG when stacked) */}
        {displayMode === "stacked" && (
          <div className="h-6 bg-[#FCEEE9] rounded-sm" />
        )}

        {/* =====================================================================
            SCREEN 2: UPLOAD A MEDICAL REPORT (BOTTOM SCREEN IN SCREENSHOT)
           ===================================================================== */}
        {(displayMode === "stacked" || displayMode === "upload") && (
          <div className="bg-[#F6F5F0] border border-[#E5E2DA] rounded-none sm:rounded-lg shadow-sm overflow-hidden flex flex-col md:flex-row">
            <CustomerHealthSidebar
              reportCount={reports.length}
              activeNav={activeNav}
              setActiveNav={setActiveNav}
            />

            <main className="flex-1 p-6 sm:p-10">
              {/* Top Breadcrumb */}
              <div className="mb-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs text-[#6E6D68] hover:text-[#1F241F]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Medical reports</span>
                </button>
              </div>

              {/* Serif Heading */}
              <h1 className="font-serif text-2xl sm:text-[32px] font-bold text-[#1D221D] tracking-tight leading-snug">
                Upload a medical report
              </h1>
              <p className="text-xs sm:text-[13px] text-[#6B6A65] mt-1.5">
                Save a private document to your account. This does not request
                AI analysis.
              </p>

              {/* Upload Confirmation Banner */}
              {uploadSuccessBanner && (
                <div className="mt-4 p-3.5 rounded-lg bg-[#E6F2E8] border border-[#BBD8C0] flex items-center gap-2.5 text-xs text-[#22522B] font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2E6B38]" />
                  <span>{uploadSuccessBanner}</span>
                </div>
              )}

              <form
                onSubmit={handleSubmit(onSubmitUpload)}
                className="mt-6 space-y-5"
              >
                {/* Drag and Drop Upload Box */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileValidation(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`bg-white border rounded-xl p-8 text-center transition-colors ${
                    isDragging
                      ? "border-[#3B6243] bg-[#F2F7F2]"
                      : "border-[#E6E3DC]"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileValidation(e.target.files[0]);
                      }
                    }}
                  />

                  <div className="w-9 h-9 rounded-full bg-[#EAEFE8] text-[#355E3C] flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-4 h-4" />
                  </div>

                  <div className="text-xs font-bold text-[#1F241F]">
                    Drag and drop your report here
                  </div>
                  <div className="text-[11px] text-[#85837D] mt-1">
                    or choose a file from your device
                  </div>

                  <div className="mt-3.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-1.5 rounded-md bg-white border border-[#DCD9D0] text-xs font-semibold text-[#2B2B28] hover:bg-[#F5F4EE] transition-colors"
                    >
                      Choose file
                    </button>
                  </div>

                  {selectedFile ? (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAEFE8] text-[#26472E] text-xs font-medium">
                      <span>
                        {selectedFile.name} (
                        {(selectedFile.size / 1024).toFixed(0)} KB)
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="text-[#787670] hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#8E8C85] mt-3">
                      PDF, JPG, or PNG &middot; Maximum 10 MB
                    </div>
                  )}

                  {fileError && (
                    <div className="mt-2 flex items-center justify-center gap-1 text-xs text-red-600">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{fileError}</span>
                    </div>
                  )}
                </div>

                {/* Form Fields Row 1: Report title * & Report type * */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1F241F] mb-1.5">
                      Report title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Annual blood test"
                      {...register("title")}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E2DFD7] text-xs text-[#1F241F] placeholder-[#A3A19A] focus:outline-none focus:border-[#3B6243]"
                    />
                    {errors.title && (
                      <p className="text-[11px] text-red-600 mt-1">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1F241F] mb-1.5">
                      Report type *
                    </label>
                    <select
                      {...register("reportType")}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E2DFD7] text-xs text-[#1F241F] focus:outline-none focus:border-[#3B6243]"
                    >
                      <option value="">Select document category</option>
                      <option value="Blood Test">Blood Test</option>
                      <option value="Lipid Panel">Lipid Panel</option>
                      <option value="Metabolic Panel">Metabolic Panel</option>
                      <option value="Allergy & Intolerance Report">
                        Allergy &amp; Intolerance Report
                      </option>
                      <option value="Nutritionist Prescription">
                        Nutritionist Prescription
                      </option>
                    </select>
                    {errors.reportType && (
                      <p className="text-[11px] text-red-600 mt-1">
                        {errors.reportType.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Form Field Row 2: Report date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1F241F] mb-1.5">
                      Report date
                    </label>
                    <input
                      type="date"
                      {...register("reportDate")}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E2DFD7] text-xs text-[#1F241F] focus:outline-none focus:border-[#3B6243]"
                    />
                  </div>
                </div>

                {/* Form Field Row 3: Private notes */}
                <div>
                  <label className="block text-xs font-bold text-[#1F241F] mb-1.5">
                    Private notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Optional note only you can see"
                    {...register("privateNotes")}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#F0EFEA] border border-[#E2DFD7] text-xs text-[#1F241F] placeholder-[#9A9891] focus:outline-none focus:bg-white focus:border-[#3B6243]"
                  />
                </div>

                {/* Bottom Action Buttons: Cancel & Save report */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      reset();
                      setSelectedFile(null);
                      setFileError(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-white border border-[#DCD9D0] text-xs font-semibold text-[#2B2B28] hover:bg-[#F2F0EA] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#3B6243] hover:bg-[#2F5036] text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    Save report
                  </button>
                </div>
              </form>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}       //http://localhost:3000  forfrd   django rest frame work http://127.0.0.1:8000/api/medical-reports/  or  http://127.0.0.1:8000/     for bkd
        //(cd frontend  npm run dev  )   ( cd Backend  venv\Scripts\activate   python manage.py runserver )