"use client";

import DarkVeil from "../ui/DarkVeil";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/** Basic RFC-style email check (client-side). */
const EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function isValidEmail(value: string): boolean {
  const t = value.trim();
  return t.length > 0 && EMAIL_REGEX.test(t);
}

/** India mobile: exactly 10 digits, starting with 6–9. */
function isValidIndianMobile(digits: string): boolean {
  return /^[6-9]\d{9}$/.test(digits);
}

function onlyDigits(s: string): string {
  return s.replace(/\D/g, "");
}

type ContactUsCreateResponse = {
  status: string;
  message?: string;
  data: unknown;
};

export default function ContactUsPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const [nameFieldError, setNameFieldError] = useState<string | null>(null);
  const [phoneFieldError, setPhoneFieldError] = useState<string | null>(null);
  const [emailFieldError, setEmailFieldError] = useState<string | null>(null);
  const [descriptionFieldError, setDescriptionFieldError] = useState<string | null>(
    null,
  );

  const { run: createContactUs, loading: submitting } =
    useFetch<ContactUsCreateResponse>("/user/contact-us", "POST", {
      manual: true,
    });

  const validateName = (value: string): string | null => {
    const t = value.trim();
    if (!t) return "Please enter your name.";
    if (t.length < 2) return "Name must be at least 2 characters.";
    return null;
  };

  const validatePhone = (value: string): string | null => {
    const digits = onlyDigits(value);
    if (!digits) return "Please enter your phone number.";
    if (!isValidIndianMobile(digits)) {
      return "Enter a valid 10-digit Indian mobile number (starts with 6–9).";
    }
    return null;
  };

  const validateEmailOptional = (value: string): string | null => {
    const t = value.trim();
    if (!t) return null;
    if (!isValidEmail(t)) return "Enter a valid email address.";
    return null;
  };

  const validateDescription = (value: string): string | null => {
    const t = value.trim();
    if (!t) return "Please describe your query.";
    if (t.length < 10) return "Description must be at least 10 characters.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const nameErr = validateName(name);
    const phoneErr = validatePhone(phone);
    const emailErr = validateEmailOptional(email);
    const descErr = validateDescription(description);

    setNameFieldError(nameErr);
    setPhoneFieldError(phoneErr);
    setEmailFieldError(emailErr);
    setDescriptionFieldError(descErr);

    if (nameErr || phoneErr || emailErr || descErr) {
      setFormError("Please fix the highlighted fields.");
      return;
    }

    const res = await createContactUs({
      name: name.trim(),
      phone: onlyDigits(phone),
      email: email.trim(),
      description: description.trim(),
    });

    if (!res.ok) {
      setFormError(res.error);
      return;
    }

    setFormSuccess(res.data.message || "Thanks! We received your message.");
    setName("");
    setPhone("");
    setEmail("");
    setDescription("");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Dark veil background */}
      <div className="fixed inset-0 z-0">
        <DarkVeil
          hueShift={211}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={0.5}
          scanlineFrequency={0}
          warpAmount={0}
        />
        <div className="absolute inset-0 " />
      </div>

      {/* Contact Card */}
      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-4">
        <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-white/3 px-8 pb-8 shadow-2xl backdrop-blur">
          <div className="pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={submitting}
              className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft className="h-5 w-5" />
              Go back
            </button>
          </div>

          {/* Logo / Brand */}
          <div className="mb-8 flex flex-col items-center justify-center text-center">
            <Image
              src="/logo/logo.svg"
              alt="Popil Logo"
              width={150}
              height={150}
              className="h-[150px] w-[150px]"
              loading="eager"
            />

            <p className="-mt-5 text-sm text-foreground/50">Get in touch</p>
          </div>

          {(formError || formSuccess) && (
            <div className="mb-4 space-y-1 text-center text-sm">
              {formError && (
                <p className="text-red-400" role="alert">
                  {formError}
                </p>
              )}
              {formSuccess && !formError && (
                <p className="text-primary/90">{formSuccess}</p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-foreground/70"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameFieldError(null);
                  setFormError(null);
                }}
                onBlur={() => setNameFieldError(validateName(name))}
                placeholder="your name"
                autoComplete="name"
                disabled={submitting}
                aria-invalid={nameFieldError ? true : undefined}
                className={cn(
                  "w-full rounded-lg border bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:ring-1 disabled:opacity-50",
                  nameFieldError
                    ? "border-red-400/80 focus:border-red-400 focus:ring-red-400/30"
                    : "border-white/10 focus:border-primary/60 focus:ring-primary/40",
                )}
              />
              {nameFieldError && (
                <p className="text-xs text-red-400" role="alert">
                  {nameFieldError}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-foreground/70"
              >
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => {
                  const d = onlyDigits(e.target.value).slice(0, 10);
                  setPhone(d);
                  setPhoneFieldError(null);
                  setFormError(null);
                }}
                onBlur={() => setPhoneFieldError(validatePhone(phone))}
                placeholder="enter your phone number"
                autoComplete="tel"
                disabled={submitting}
                maxLength={10}
                aria-invalid={phoneFieldError ? true : undefined}
                className={cn(
                  "w-full rounded-lg border bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:ring-1 disabled:opacity-50",
                  phoneFieldError
                    ? "border-red-400/80 focus:border-red-400 focus:ring-red-400/30"
                    : "border-white/10 focus:border-primary/60 focus:ring-primary/40",
                )}
              />
              {phoneFieldError && (
                <p className="text-xs text-red-400" role="alert">
                  {phoneFieldError}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground/70"
              >
                Email address (optional)
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailFieldError(null);
                  setFormError(null);
                }}
                onBlur={() => setEmailFieldError(validateEmailOptional(email))}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={submitting}
                aria-invalid={emailFieldError ? true : undefined}
                className={cn(
                  "w-full rounded-lg border bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:ring-1 disabled:opacity-50",
                  emailFieldError
                    ? "border-red-400/80 focus:border-red-400 focus:ring-red-400/30"
                    : "border-white/10 focus:border-primary/60 focus:ring-primary/40",
                )}
              />
              {emailFieldError && (
                <p className="text-xs text-red-400" role="alert">
                  {emailFieldError}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-foreground/70"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setDescriptionFieldError(null);
                  setFormError(null);
                }}
                onBlur={() =>
                  setDescriptionFieldError(validateDescription(description))
                }
                placeholder="Tell us what you need help with…"
                disabled={submitting}
                rows={4}
                aria-invalid={descriptionFieldError ? true : undefined}
                className={cn(
                  "w-full resize-none rounded-lg border bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:ring-1 disabled:opacity-50",
                  descriptionFieldError
                    ? "border-red-400/80 focus:border-red-400 focus:ring-red-400/30"
                    : "border-white/10 focus:border-primary/60 focus:ring-primary/40",
                )}
              />
              {descriptionFieldError && (
                <p className="text-xs text-red-400" role="alert">
                  {descriptionFieldError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-linear-to-r from-primary to-secondary py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
