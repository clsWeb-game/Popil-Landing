"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Building2, Mic2, CheckCircle2, Eye, EyeOff, ArrowLeftIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import DarkVeil from "../ui/DarkVeil";
import Stepper, { Step } from "@/components/Stepper";
import ImageDropbox from "@/components/ImageDropbox";
import { useFetch } from "@/hooks/useFetch";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "production" | "artist";

interface CompanyData {
  legalName: string;
  brandName: string;
  companyType: string;
  country: string;
  yearEstablished: string;
  registeredAddress: string;
  sameAddress: boolean;
  operatingAddress: string;
  gstin: string;
  companyPanNumber: string;
  companyCin: string;
  certOfIncorporation: File | null;
  panCardCopy: File | null;
  gstCertificate: File | null;
}

interface ContactData {
  fullName: string;
  designation: string;
  phoneNumber: string;
  panNumber: string;
  cin: string;
  idProof: File | null;
  authLetter: File | null;
}

interface AdminData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface ArtistPersonalData {
  fullName: string;
  phoneNumber: string;
  panNumber: string;
  idProof: File | null;
}

interface RegisterResponse {
  status: string;
  message: string;
  data: { id: string; name: string; email: string; roleName: string };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COMPANY_TYPES = [
  "Private Limited Company",
  "Public Limited Company",
  "One Person Company",
  "Limited Liability Partnership",
  "Partnership Firm",
  "Sole Proprietorship",
  "Section 8 Company (NGO)",
  "Others",
];

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Singapore",
  "UAE",
  "Germany",
  "France",
  "Japan",
  "Others",
];

const YEARS = Array.from({ length: 127 }, (_, i) => String(2026 - i));

// ─── Stepper button classes ───────────────────────────────────────────────────

const NEXT_BTN =
  "flex items-center justify-center rounded-lg bg-linear-to-r from-primary to-secondary px-6 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50";

const BACK_BTN =
  "rounded px-2 py-1 text-sm text-white/40 transition-colors hover:text-white";

// ─── Shared form components ───────────────────────────────────────────────────

function FormField({
  label,
  required,
  error,
  className: cls,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground/70">
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      <input
        {...props}
        className={cn(
          "w-full rounded-lg border bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:ring-1 disabled:opacity-40",
          error
            ? "border-red-400/60 focus:border-red-400/80 focus:ring-red-400/20"
            : "border-white/10 focus:border-primary/60 focus:ring-primary/40",
          cls,
        )}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function FormTextarea({
  label,
  required,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground/70">
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      <textarea
        rows={3}
        {...props}
        className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-primary/60 focus:ring-1 focus:ring-primary/40 disabled:opacity-40"
      />
    </div>
  );
}

function FormSelect({
  label,
  required,
  value,
  onValueChange,
  placeholder,
  children,
}: {
  label: string;
  required?: boolean;
  value: string;
  onValueChange: (val: string) => void;
  placeholder?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground/70">
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full h-auto cursor-pointer rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-primary/60 focus:ring-1 focus:ring-primary/40 focus:ring-offset-0">
          <SelectValue placeholder={placeholder ?? "Select an option"} />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={4} style={{ colorScheme: "dark" }} className="bg-zinc-900 border-white/10 text-white z-[60]">
          {children}
        </SelectContent>
      </Select>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground/70">
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "••••••••"}
          autoComplete={autoComplete}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 pr-12 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white/70"
        >
          {show ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function StepHeader({
  step,
  total,
  title,
  description,
}: {
  step: number;
  total: number;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6 border-b border-white/8 pb-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary text-sm font-bold text-primary">
            {step}
          </span>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <span className="mt-0.5 shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-xs text-white/40">
          Step {step} of {total}
        </span>
      </div>
      {description && (
        <p className="mt-2 pl-11 text-sm text-white/45">{description}</p>
      )}
    </div>
  );
}

function PreviewSection({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string }[];
}) {
  const visible = rows.filter((r) => r.value);
  if (!visible.length) return null;
  return (
    <div className="rounded-xl border border-white/8 bg-white/3 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary/70">
        {title}
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {visible.map((r) => (
          <div key={r.label}>
            <p className="text-xs text-white/40">{r.label}</p>
            <p className="text-sm text-white">{r.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoleCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/3 px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
    >
      <span className="text-white/60">{icon}</span>
      <div>
        <p className="font-semibold text-white">{title}</p>
        <p className="mt-0.5 text-xs text-white/40">{description}</p>
      </div>
    </motion.button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const [role, setRole] = useState<Role | null>(null);
  const [registered, setRegistered] = useState(false);

  // Production House form state
  const [company, setCompany] = useState<CompanyData>({
    legalName: "",
    brandName: "",
    companyType: "",
    country: "India",
    yearEstablished: "",
    registeredAddress: "",
    sameAddress: false,
    operatingAddress: "",
    gstin: "",
    companyPanNumber: "",
    companyCin: "",
    certOfIncorporation: null,
    panCardCopy: null,
    gstCertificate: null,
  });
  const [contact, setContact] = useState<ContactData>({
    fullName: "",
    designation: "",
    phoneNumber: "",
    panNumber: "",
    cin: "",
    idProof: null,
    authLetter: null,
  });
  const [phAdmin, setPhAdmin] = useState<AdminData>({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Artist form state
  const [artistPersonal, setArtistPersonal] = useState<ArtistPersonalData>({
    fullName: "",
    phoneNumber: "",
    panNumber: "",
    idProof: null,
  });
  const [artistAccount, setArtistAccount] = useState<AdminData>({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // API hooks — manual, triggered on final step
  const { run: submitPH } = useFetch<RegisterResponse>(
    "/admin/register/production-house",
    "POST",
    { manual: true },
  );
  const { run: submitArtist } = useFetch<RegisterResponse>(
    "/admin/register/artist",
    "POST",
    { manual: true },
  );

  // Build FormData and call PH API — returns true to let Stepper advance, false to stay
  const handlePHSubmit = async (): Promise<boolean> => {
    const toastId = toast.loading("Submitting your registration…");

    const fd = new FormData();
    // Company
    fd.append("legalCompanyName", company.legalName);
    fd.append("brandOrLabelName", company.brandName);
    fd.append("companyType", company.companyType);
    fd.append("countryOfIncorporation", company.country);
    fd.append("yearOfEstablishment", company.yearEstablished);
    fd.append("registeredAddress", company.registeredAddress);
    fd.append("sameAsRegisteredAddress", String(company.sameAddress));
    fd.append(
      "operatingAddress",
      company.sameAddress
        ? company.registeredAddress
        : company.operatingAddress,
    );
    fd.append("gstinOrTaxId", company.gstin);
    fd.append("companyPanNumber", company.companyPanNumber);
    if (company.companyCin) fd.append("companyCin", company.companyCin);
    if (company.certOfIncorporation)
      fd.append("certOfIncorporation", company.certOfIncorporation);
    if (company.panCardCopy) fd.append("panCardCopy", company.panCardCopy);
    if (company.gstCertificate)
      fd.append("gstCertificate", company.gstCertificate);
    // Contact
    fd.append("fullName", contact.fullName);
    fd.append("designation", contact.designation);
    fd.append("phoneNumber", contact.phoneNumber);
    fd.append("panNumber", contact.panNumber);
    if (contact.cin) fd.append("cin", contact.cin);
    if (contact.idProof) fd.append("idProof", contact.idProof);
    if (contact.authLetter)
      fd.append("authorizationLetter", contact.authLetter);
    // Account
    fd.append("email", phAdmin.email);
    fd.append("password", phAdmin.password);
    fd.append("passwordConfirm", phAdmin.confirmPassword);

    const res = await submitPH(fd);

    if (res.ok) {
      toast.success(res.data.message ?? "Registration submitted!", {
        id: toastId,
      });
      setRegistered(true);
      return true;
    } else {
      toast.error(res.error ?? "Registration failed. Please try again.", {
        id: toastId,
      });
      return false;
    }
  };

  // Build FormData and call Artist API
  const handleArtistSubmit = async (): Promise<boolean> => {
    const toastId = toast.loading("Submitting your registration…");

    const fd = new FormData();
    fd.append("fullName", artistPersonal.fullName);
    fd.append("phoneNumber", artistPersonal.phoneNumber);
    fd.append("panNumber", artistPersonal.panNumber);
    if (artistPersonal.idProof) fd.append("idProof", artistPersonal.idProof);
    fd.append("email", artistAccount.email);
    fd.append("password", artistAccount.password);
    fd.append("passwordConfirm", artistAccount.confirmPassword);

    const res = await submitArtist(fd);

    if (res.ok) {
      toast.success(res.data.message ?? "Registration submitted!", {
        id: toastId,
      });
      setRegistered(true);
      return true;
    } else {
      toast.error(res.error ?? "Registration failed. Please try again.", {
        id: toastId,
      });
      return false;
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <DarkVeil
          hueShift={211}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={1}
          scanlineFrequency={0}
          warpAmount={0}
          resolutionScale={1.1}
        />
      </div>

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center px-4 py-10">
        {/* Back to Home */}
        <Link
          href="/"
          aria-label="Back to home"
          title="Back to home"
          className="absolute left-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 backdrop-blur transition-colors hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>

        {/* Logo */}
        <div className="mb-6 flex flex-col items-center">
          <Link
            href="/"
            aria-label="Go to home"
            title="Go to home"
            className="cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <Image
              src="/logo/logo.svg"
              alt="Popil Logo"
              width={100}
              height={100}
              className="h-[100px] w-[100px]"
              loading="eager"
            />
          </Link>
          <p className="-mt-3 text-xs text-foreground/40">
            Create your account
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* ── Role selection ── */}
          {!role && !registered && (
            <motion.div
              key="role"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-lg"
            >
              <div className="rounded-2xl border border-white/10 bg-white/3 p-8 shadow-2xl backdrop-blur">
                <h2 className="mb-1 text-xl font-bold text-white">
                  Who are you registering as?
                </h2>
                <p className="mb-8 text-sm text-white/45">
                  Choose your account type to get started
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <RoleCard
                    icon={<Building2 className="h-8 w-8" />}
                    title="Production House"
                    description="Labels, studios & production companies"
                    onClick={() => setRole("production")}
                  />
                  <RoleCard
                    icon={<Mic2 className="h-8 w-8" />}
                    title="Artist"
                    description="Singers, musicians & performers"
                    onClick={() => setRole("artist")}
                  />
                </div>
                {/* <p className="mt-6 text-center text-sm text-white/40">
                  Already have an account?{" "}
                  <Link href="/login" className="font-medium text-primary/80 hover:text-primary">
                    Sign in
                  </Link>
                </p> */}
              </div>
            </motion.div>
          )}

          {/* ── Production House stepper ── */}
          {role === "production" && !registered && (
            <motion.div
              key="ph"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-3xl"
            >
              <button
                onClick={() => setRole(null)}
                className="mb-4 text-sm text-white/45 transition-colors hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeftIcon className="h-4 w-4" /> Change account type
              </button>

              <Stepper
                outerClassName="w-full"
                cardMaxWidth="max-w-3xl"
                cardStyle={{ border: "1px solid rgba(255,255,255,0.08)" }}
                stepCircleContainerClassName="bg-white/3 backdrop-blur shadow-2xl rounded-2xl"
                lastStepButtonText="Register Now"
                nextButtonProps={{ className: NEXT_BTN }}
                backButtonProps={{ className: BACK_BTN }}
                onBeforeComplete={handlePHSubmit}
                onFinalStepCompleted={() => {}} // handled inside onBeforeComplete
              >
                {/* Step 1 – Company Details */}
                <Step>
                  <StepHeader
                    step={1}
                    total={4}
                    title="Company Details"
                    description="Enter your production house / company information as per legal records"
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      label="Legal Company Name"
                      required
                      placeholder="Enter legal company name as per registration"
                      value={company.legalName}
                      onChange={(e) =>
                        setCompany((c) => ({ ...c, legalName: e.target.value }))
                      }
                    />
                    <FormField
                      label="Brand / Label Name"
                      required
                      placeholder="Enter brand or trade name (public)"
                      value={company.brandName}
                      onChange={(e) =>
                        setCompany((c) => ({ ...c, brandName: e.target.value }))
                      }
                    />
                    <FormSelect
                      label="Company Type"
                      required
                      value={company.companyType}
                      onValueChange={(val) =>
                        setCompany((c) => ({
                          ...c,
                          companyType: val,
                        }))
                      }
                      placeholder="Select company type"
                    >
                      {COMPANY_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="cursor-pointer focus:bg-white/10 focus:text-white">
                          {t}
                        </SelectItem>
                      ))}
                    </FormSelect>
                    <FormSelect
                      label="Country of Incorporation"
                      required
                      value={company.country}
                      onValueChange={(val) =>
                        setCompany((c) => ({ ...c, country: val }))
                      }
                      placeholder="Select country"
                    >
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c} className="cursor-pointer focus:bg-white/10 focus:text-white">
                          {c}
                        </SelectItem>
                      ))}
                    </FormSelect>
                    <FormSelect
                      label="Year of Establishment"
                      required
                      value={company.yearEstablished}
                      onValueChange={(val) =>
                        setCompany((c) => ({
                          ...c,
                          yearEstablished: val,
                        }))
                      }
                      placeholder="Select year"
                    >
                      {YEARS.map((y) => (
                        <SelectItem key={y} value={y} className="cursor-pointer focus:bg-white/10 focus:text-white">
                          {y}
                        </SelectItem>
                      ))}
                    </FormSelect>
                    <FormTextarea
                      label="Registered Address"
                      required
                      placeholder="Enter full registered office address"
                      value={company.registeredAddress}
                      onChange={(e) =>
                        setCompany((c) => ({
                          ...c,
                          registeredAddress: e.target.value,
                        }))
                      }
                    />
                    {/* Operating Address with "Same as Registered" checkbox */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-foreground/70">
                          Operating Address
                        </label>
                        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-white/50">
                          <input
                            type="checkbox"
                            checked={company.sameAddress}
                            onChange={(e) =>
                              setCompany((c) => ({
                                ...c,
                                sameAddress: e.target.checked,
                                operatingAddress: e.target.checked
                                  ? c.registeredAddress
                                  : c.operatingAddress,
                              }))
                            }
                            className="h-3.5 w-3.5 cursor-pointer rounded accent-primary"
                          />
                          Same as Registered Address
                        </label>
                      </div>
                      <textarea
                        rows={3}
                        placeholder="Enter operating address (if different)"
                        disabled={company.sameAddress}
                        value={
                          company.sameAddress
                            ? company.registeredAddress
                            : company.operatingAddress
                        }
                        onChange={(e) =>
                          setCompany((c) => ({
                            ...c,
                            operatingAddress: e.target.value,
                          }))
                        }
                        className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-primary/60 focus:ring-1 focus:ring-primary/40 disabled:opacity-40"
                      />
                    </div>
                    <FormField
                      label="GSTIN / Tax ID"
                      required
                      placeholder="e.g. 22AAAAA0000A1Z5"
                      value={company.gstin}
                      onChange={(e) =>
                        setCompany((c) => ({ ...c, gstin: e.target.value }))
                      }
                    />
                    <FormField
                      label="PAN Number"
                      required
                      placeholder="e.g. AAAAA1234A"
                      value={company.companyPanNumber}
                      onChange={(e) =>
                        setCompany((c) => ({
                          ...c,
                          companyPanNumber: e.target.value.toUpperCase(),
                        }))
                      }
                    />
                    <FormField
                      label="CIN (if applicable)"
                      placeholder="e.g. U74999MH2011PTC123456"
                      value={company.companyCin}
                      onChange={(e) =>
                        setCompany((c) => ({
                          ...c,
                          companyCin: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="mt-5">
                    <p className="mb-3 text-sm font-medium text-foreground/70">
                      Upload Documents <span className="text-red-400">*</span>
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <ImageDropbox
                        label="Certificate of Incorporation"
                        value={company.certOfIncorporation}
                        onChange={(f) =>
                          setCompany((c) => ({ ...c, certOfIncorporation: f }))
                        }
                      />
                      <ImageDropbox
                        label="PAN Card Copy"
                        value={company.panCardCopy}
                        onChange={(f) =>
                          setCompany((c) => ({ ...c, panCardCopy: f }))
                        }
                      />
                      <ImageDropbox
                        label="GST Certificate"
                        value={company.gstCertificate}
                        onChange={(f) =>
                          setCompany((c) => ({ ...c, gstCertificate: f }))
                        }
                      />
                    </div>
                  </div>
                </Step>

                {/* Step 2 – Contact Person */}
                <Step>
                  <StepHeader
                    step={2}
                    total={4}
                    title="Authorized Contact Person"
                    description="Details of the person authorized to manage this account"
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      label="Full Name"
                      required
                      placeholder="Enter full name"
                      value={contact.fullName}
                      onChange={(e) =>
                        setContact((c) => ({ ...c, fullName: e.target.value }))
                      }
                    />
                    <FormField
                      label="Designation"
                      required
                      placeholder="e.g. CEO, Director, Manager"
                      value={contact.designation}
                      onChange={(e) =>
                        setContact((c) => ({
                          ...c,
                          designation: e.target.value,
                        }))
                      }
                    />
                    <FormField
                      label="Phone Number"
                      required
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={contact.phoneNumber}
                      onChange={(e) =>
                        setContact((c) => ({
                          ...c,
                          phoneNumber: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10),
                        }))
                      }
                    />
                    <FormField
                      label="PAN Number"
                      required
                      placeholder="e.g. AAAAA1234A"
                      value={contact.panNumber}
                      onChange={(e) =>
                        setContact((c) => ({
                          ...c,
                          panNumber: e.target.value.toUpperCase(),
                        }))
                      }
                    />
                    <FormField
                      label="CIN (optional)"
                      placeholder="Corporate Identification Number"
                      value={contact.cin}
                      onChange={(e) =>
                        setContact((c) => ({ ...c, cin: e.target.value }))
                      }
                    />
                  </div>
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ImageDropbox
                      label="ID Proof"
                      subtitle="Aadhaar, Passport, PAN — PDF, JPG, PNG (Max 5MB)"
                      value={contact.idProof}
                      onChange={(f) =>
                        setContact((c) => ({ ...c, idProof: f }))
                      }
                    />
                    <ImageDropbox
                      label="Authorization Letter"
                      subtitle="Company letterhead authorizing this person — PDF, JPG, PNG (Max 5MB)"
                      value={contact.authLetter}
                      onChange={(f) =>
                        setContact((c) => ({ ...c, authLetter: f }))
                      }
                    />
                  </div>
                </Step>

                {/* Step 3 – Admin Account */}
                <Step>
                  <StepHeader
                    step={3}
                    total={4}
                    title="Admin Account Setup"
                    description="This will be the main login account for your production house"
                  />
                  <div className="flex flex-col gap-4">
                    <FormField
                      label="Email Address"
                      required
                      type="email"
                      placeholder="admin@yourcompany.com"
                      autoComplete="email"
                      value={phAdmin.email}
                      onChange={(e) =>
                        setPhAdmin((a) => ({ ...a, email: e.target.value }))
                      }
                    />
                    <PasswordField
                      label="Password"
                      required
                      value={phAdmin.password}
                      onChange={(v) =>
                        setPhAdmin((a) => ({ ...a, password: v }))
                      }
                      autoComplete="new-password"
                    />
                    <PasswordField
                      label="Confirm Password"
                      required
                      value={phAdmin.confirmPassword}
                      onChange={(v) =>
                        setPhAdmin((a) => ({ ...a, confirmPassword: v }))
                      }
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                    />
                    {phAdmin.password &&
                      phAdmin.confirmPassword &&
                      phAdmin.password !== phAdmin.confirmPassword && (
                        <p className="text-xs text-red-400">
                          Passwords do not match.
                        </p>
                      )}
                  </div>
                </Step>

                {/* Step 4 – Preview */}
                <Step>
                  <StepHeader
                    step={4}
                    total={4}
                    title="Review & Confirm"
                    description="Please review your details before submitting"
                  />
                  <div className="flex flex-col gap-3">
                    <PreviewSection
                      title="Company Information"
                      rows={[
                        { label: "Legal Name", value: company.legalName },
                        { label: "Brand / Label", value: company.brandName },
                        { label: "Type", value: company.companyType },
                        { label: "Country", value: company.country },
                        {
                          label: "Year Established",
                          value: company.yearEstablished,
                        },
                        {
                          label: "PAN Number",
                          value: company.companyPanNumber,
                        },
                        { label: "GSTIN", value: company.gstin },
                        { label: "CIN", value: company.companyCin },
                      ]}
                    />
                    <PreviewSection
                      title="Authorized Contact Person"
                      rows={[
                        { label: "Full Name", value: contact.fullName },
                        { label: "Designation", value: contact.designation },
                        { label: "Phone", value: contact.phoneNumber },
                        { label: "PAN Number", value: contact.panNumber },
                      ]}
                    />
                    <PreviewSection
                      title="Admin Account"
                      rows={[
                        { label: "Email", value: phAdmin.email },
                        {
                          label: "Password",
                          value: phAdmin.password ? "••••••••" : "",
                        },
                      ]}
                    />
                    <p className="text-center text-xs text-white/30">
                      By registering you agree to our Terms of Service and
                      Privacy Policy. Your account will be active after admin
                      approval.
                    </p>
                  </div>
                </Step>
              </Stepper>
            </motion.div>
          )}

          {/* ── Artist stepper ── */}
          {role === "artist" && !registered && (
            <motion.div
              key="artist"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-xl"
            >
              <button
                onClick={() => setRole(null)}
                className="mb-4 text-sm text-white/45 transition-colors hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeftIcon className="h-4 w-4" /> Change account type
              </button>

              <Stepper
                outerClassName="w-full"
                cardMaxWidth="max-w-xl"
                cardStyle={{ border: "1px solid rgba(255,255,255,0.08)" }}
                stepCircleContainerClassName="bg-white/3 backdrop-blur shadow-2xl rounded-2xl"
                lastStepButtonText="Register Now"
                nextButtonProps={{ className: NEXT_BTN }}
                backButtonProps={{ className: BACK_BTN }}
                onBeforeComplete={handleArtistSubmit}
                onFinalStepCompleted={() => {}}
              >
                {/* Step 1 – Personal Details */}
                <Step>
                  <StepHeader
                    step={1}
                    total={3}
                    title="Personal Details"
                    description="Tell us a bit about yourself"
                  />
                  <div className="flex flex-col gap-4">
                    <FormField
                      label="Full Name"
                      required
                      placeholder="Enter your full name"
                      value={artistPersonal.fullName}
                      onChange={(e) =>
                        setArtistPersonal((p) => ({
                          ...p,
                          fullName: e.target.value,
                        }))
                      }
                    />
                    <FormField
                      label="Phone Number"
                      required
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={artistPersonal.phoneNumber}
                      onChange={(e) =>
                        setArtistPersonal((p) => ({
                          ...p,
                          phoneNumber: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10),
                        }))
                      }
                    />
                    <FormField
                      label="PAN Number"
                      required
                      placeholder="e.g. AAAAA1234A"
                      value={artistPersonal.panNumber}
                      onChange={(e) =>
                        setArtistPersonal((p) => ({
                          ...p,
                          panNumber: e.target.value.toUpperCase(),
                        }))
                      }
                    />
                    <ImageDropbox
                      label="ID Proof"
                      subtitle="Aadhaar, Passport, PAN — PDF, JPG, PNG (Max 5MB)"
                      value={artistPersonal.idProof}
                      onChange={(f) =>
                        setArtistPersonal((p) => ({ ...p, idProof: f }))
                      }
                    />
                  </div>
                </Step>

                {/* Step 2 – Account Setup */}
                <Step>
                  <StepHeader
                    step={2}
                    total={3}
                    title="Account Setup"
                    description="Create your login credentials"
                  />
                  <div className="flex flex-col gap-4">
                    <FormField
                      label="Email Address"
                      required
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      value={artistAccount.email}
                      onChange={(e) =>
                        setArtistAccount((a) => ({
                          ...a,
                          email: e.target.value,
                        }))
                      }
                    />
                    <PasswordField
                      label="Password"
                      required
                      value={artistAccount.password}
                      onChange={(v) =>
                        setArtistAccount((a) => ({ ...a, password: v }))
                      }
                      autoComplete="new-password"
                    />
                    <PasswordField
                      label="Confirm Password"
                      required
                      value={artistAccount.confirmPassword}
                      onChange={(v) =>
                        setArtistAccount((a) => ({ ...a, confirmPassword: v }))
                      }
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                    />
                    {artistAccount.password &&
                      artistAccount.confirmPassword &&
                      artistAccount.password !==
                        artistAccount.confirmPassword && (
                        <p className="text-xs text-red-400">
                          Passwords do not match.
                        </p>
                      )}
                  </div>
                </Step>

                {/* Step 3 – Preview */}
                <Step>
                  <StepHeader
                    step={3}
                    total={3}
                    title="Review & Confirm"
                    description="Please verify your details before registering"
                  />
                  <div className="flex flex-col gap-3">
                    <PreviewSection
                      title="Personal Details"
                      rows={[
                        { label: "Full Name", value: artistPersonal.fullName },
                        { label: "Phone", value: artistPersonal.phoneNumber },
                        {
                          label: "PAN Number",
                          value: artistPersonal.panNumber,
                        },
                        {
                          label: "ID Proof",
                          value: artistPersonal.idProof
                            ? artistPersonal.idProof.name
                            : "",
                        },
                      ]}
                    />
                    <PreviewSection
                      title="Account"
                      rows={[
                        { label: "Email", value: artistAccount.email },
                        {
                          label: "Password",
                          value: artistAccount.password ? "••••••••" : "",
                        },
                      ]}
                    />
                    <p className="text-center text-xs text-white/30">
                      By registering you agree to our Terms of Service and
                      Privacy Policy. Your account will be active after admin
                      approval.
                    </p>
                  </div>
                </Step>
              </Stepper>
            </motion.div>
          )}

          {/* ── Success screen ── */}
          {registered && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md"
            >
              <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/3 p-10 text-center shadow-2xl backdrop-blur">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
                  <CheckCircle2 className="h-9 w-9 text-primary" />
                </div>
                <h2 className="mb-2 text-xl font-bold text-white">
                  Registration Submitted!
                </h2>
                <p className="mb-6 text-sm text-white/50">
                  Your account request is under review. We&apos;ll notify you
                  once it&apos;s approved.
                </p>
                <Link
                  href="/login"
                  className="w-full rounded-lg bg-linear-to-r from-primary to-secondary py-3 text-center text-sm font-semibold text-background transition-opacity hover:opacity-90"
                >
                  Back to Sign In
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
