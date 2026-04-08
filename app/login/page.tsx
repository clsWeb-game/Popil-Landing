"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import DarkVeil from "../ui/DarkVeil";
import Image from "next/image";
import { googleIcon, appleIcon, phoneIcon } from "@/public/icons";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useFetch } from "@/hooks/useFetch";
import { saveAuth } from "@/utils/auth";
import { decodeGoogleCredentialJwt } from "@/utils/googleCredential";
import { cn } from "@/lib/utils";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type LoginSuccessResponse = {
  status: string;
  token: string;
  expiresIn?: number;
  data: Record<string, unknown>;
};

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

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<"email" | "phone">("email");
  const [phoneStep, setPhoneStep] = useState<"enterPhone" | "enterOtp">(
    "enterPhone",
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [emailFieldError, setEmailFieldError] = useState<string | null>(null);
  const [phoneFieldError, setPhoneFieldError] = useState<string | null>(null);
  const [otpFieldError, setOtpFieldError] = useState<string | null>(null);

  const { run: loginEmail, loading: loginLoading } = useFetch<LoginSuccessResponse>(
    "/user/login",
    "POST",
    { manual: true },
  );
  const { run: phoneLoginReq, loading: phoneLoginLoading } = useFetch<unknown>(
    "/user/phoneLogin",
    "POST",
    { manual: true },
  );
  const { run: verifyOtpReq, loading: otpLoading } = useFetch<LoginSuccessResponse>(
    "/user/otp_verification",
    "POST",
    { manual: true },
  );
  const { run: socialLogin, loading: googleLoading } = useFetch<LoginSuccessResponse>(
    "/user/social_login",
    "POST",
    { manual: true },
  );

  const [gsiLoaded, setGsiLoaded] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const socialLoginRunRef = useRef(socialLogin);
  socialLoginRunRef.current = socialLogin;

  const busy =
    loginLoading || phoneLoginLoading || otpLoading || googleLoading;

  useEffect(() => {
    if (!googleClientId || !gsiLoaded || !googleBtnRef.current) return;
    const el = googleBtnRef.current;
    const g = window.google;
    if (!g?.accounts?.id) return;

    const callback = (response: { credential: string }) => {
      void (async () => {
        setFormError(null);
        const decoded = decodeGoogleCredentialJwt(response.credential);
        if (!decoded) {
          setFormError("Could not read Google account. Try again.");
          return;
        }
        const res = await socialLoginRunRef.current({
          email: decoded.email,
          name: decoded.name,
          image: decoded.picture,
          socialId: decoded.sub,
        });
        if (!res.ok) {
          setFormError(res.error);
          return;
        }
        saveAuth(res.data.data, res.data.token);
        window.location.href = "/store";
      })();
    };

    g.accounts.id.initialize({
      client_id: googleClientId,
      callback,
    });
    // Render the official GIS button into an invisible overlay.
    // The visible UI remains our custom Google icon underneath.
    g.accounts.id.renderButton(el, {
      type: "icon",
      theme: "filled_black",
      size: "large",
      shape: "circle",
      width: 55,
    });

    return () => {
      g.accounts.id.cancel();
      el.innerHTML = "";
    };
  }, [googleClientId, gsiLoaded, router]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setEmailFieldError(null);
    if (!password) {
      setFormError("Please enter your password.");
      return;
    }
    if (!isValidEmail(email)) {
      setEmailFieldError("Enter a valid email address.");
      return;
    }
    const res = await loginEmail({ email: email.trim(), password });
    if (!res.ok) {
      setFormError(res.error);
      return;
    }
    saveAuth(res.data.data, res.data.token);
    window.location.href = "/store";
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setPhoneFieldError(null);
    const digits = onlyDigits(phone);
    if (!isValidIndianMobile(digits)) {
      setPhoneFieldError(
        "Enter a valid 10-digit Indian mobile number (starts with 6–9).",
      );
      return;
    }
    const res = await phoneLoginReq({ phone: digits });
    if (!res.ok) {
      setFormError(res.error);
      return;
    }
    setFormSuccess("OTP sent. Check your phone.");
    setPhoneStep("enterOtp");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setOtpFieldError(null);
    const digits = onlyDigits(phone);
    const otpDigits = onlyDigits(otp);
    if (otpDigits.length !== 6 || !/^\d{6}$/.test(otpDigits)) {
      setOtpFieldError("Enter the 6-digit code (numbers only).");
      return;
    }
    const res = await verifyOtpReq({ phone: digits, otp: otpDigits });
    if (!res.ok) {
      setFormError(res.error);
      return;
    }
    saveAuth(res.data.data, res.data.token);
    window.location.href = "/store";
  };

  const switchToPhone = () => {
    setLoginMode("phone");
    setPhoneStep("enterPhone");
    setFormError(null);
    setFormSuccess(null);
    setEmailFieldError(null);
    setPhoneFieldError(null);
    setOtpFieldError(null);
    setOtp("");
  };

  const backToEmail = () => {
    setLoginMode("email");
    setPhoneStep("enterPhone");
    setFormError(null);
    setFormSuccess(null);
    setPhoneFieldError(null);
    setOtpFieldError(null);
    setOtp("");
  };

  const backToPhoneEntry = () => {
    setPhoneStep("enterPhone");
    setOtp("");
    setFormError(null);
    setFormSuccess(null);
    setOtpFieldError(null);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {googleClientId ? (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => setGsiLoaded(true)}
        />
      ) : null}

      {/* Dark veil background */}
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
        <div className="absolute inset-0 " />
      </div>

      {/* Login Card */}
      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/3 px-8 pb-8 shadow-2xl backdrop-blur">
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

            <p className="-mt-5 text-sm text-foreground/50">
              Sign in to your account
            </p>
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

          {loginMode === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground/70"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailFieldError(null);
                  }}
                  onBlur={() => {
                    if (email.trim() && !isValidEmail(email)) {
                      setEmailFieldError("Enter a valid email address.");
                    }
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={busy}
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
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground/70"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={busy}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 pr-12 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-primary/60 focus:ring-1 focus:ring-primary/40 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white/70"
                  >
                    {showPassword ? (
                      <Eye className="h-5 w-5" />
                    ) : (
                      <EyeOff className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm font-medium text-white transition-colors hover:text-white/80"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-linear-to-r from-primary to-secondary py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50"
              >
                {loginLoading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          )}

          {loginMode === "phone" && phoneStep === "enterPhone" && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <button
                type="button"
                onClick={backToEmail}
                className="text-sm text-white/60 hover:text-white flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" /> Back to email
              </button>
              <div className="space-y-1.5">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-foreground/70"
                >
                  Mobile number
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
                  }}
                  onBlur={() => {
                    const d = onlyDigits(phone);
                    if (d.length > 0 && !isValidIndianMobile(d)) {
                      setPhoneFieldError(
                        "Enter a valid 10-digit Indian mobile number (starts with 6–9).",
                      );
                    }
                  }}
                  placeholder="enter your phone number"
                  autoComplete="tel"
                  disabled={busy}
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
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-linear-to-r from-primary to-secondary py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50"
              >
                {phoneLoginLoading ? "Sending…" : "Send OTP"}
              </button>
            </form>
          )}

          {loginMode === "phone" && phoneStep === "enterOtp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <button
                type="button"
                onClick={backToPhoneEntry}
                className="text-sm text-white/60 hover:text-white flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" /> Change number
              </button>
              {/* <p className="text-center text-sm text-foreground/50">
                OTP sent to {onlyDigits(phone)}
              </p> */}
              <div className="space-y-3">
                {/* <label className="block text-center text-sm font-medium text-foreground/70">
                  Enter 6-digit OTP
                </label> */}
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => {
                      setOtp(value);
                      setOtpFieldError(null);
                    }}
                    pattern={REGEXP_ONLY_DIGITS}
                    disabled={busy}
                    autoComplete="one-time-code"
                    containerClassName="gap-0"
                  >
                    <InputOTPGroup
                      aria-invalid={otpFieldError ? true : undefined}
                      className="rounded-lg border border-white/10 bg-white/5 shadow-none [&_[data-slot=input-otp-slot]]:size-10 [&_[data-slot=input-otp-slot]]:border-white/15 [&_[data-slot=input-otp-slot]]:bg-white/5 [&_[data-slot=input-otp-slot]]:text-base [&_[data-slot=input-otp-slot]]:text-white [&_[data-slot=input-otp-slot]]:first:border-l"
                    >
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                    </InputOTPGroup>
                    <InputOTPSeparator className="text-white/40" />
                    <InputOTPGroup
                      aria-invalid={otpFieldError ? true : undefined}
                      className="rounded-lg border border-white/10 bg-white/5 shadow-none [&_[data-slot=input-otp-slot]]:size-10 [&_[data-slot=input-otp-slot]]:border-white/15 [&_[data-slot=input-otp-slot]]:bg-white/5 [&_[data-slot=input-otp-slot]]:text-base [&_[data-slot=input-otp-slot]]:text-white"
                    >
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                    <InputOTPSeparator className="text-white/40" />
                    <InputOTPGroup
                      aria-invalid={otpFieldError ? true : undefined}
                      className="rounded-lg border border-white/10 bg-white/5 shadow-none [&_[data-slot=input-otp-slot]]:size-10 [&_[data-slot=input-otp-slot]]:border-white/15 [&_[data-slot=input-otp-slot]]:bg-white/5 [&_[data-slot=input-otp-slot]]:text-base [&_[data-slot=input-otp-slot]]:text-white [&_[data-slot=input-otp-slot]]:last:rounded-r-lg"
                    >
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {otpFieldError && (
                  <p className="text-center text-xs text-red-400" role="alert">
                    {otpFieldError}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-linear-to-r from-primary to-secondary py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50"
              >
                {otpLoading ? "Verifying…" : "Verify & sign in"}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-foreground/30">or</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <div className="flex items-center justify-center gap-4">
            {googleClientId ? (
              <div
                className={cn(
                  "relative flex h-[55px] w-[55px] shrink-0 items-center justify-center",
                  googleLoading && "pointer-events-none opacity-50",
                )}
              >
                {/* Visible custom icon */}
                <Image src={googleIcon} alt="Google" width={55} height={55} />

                {/* Invisible GIS button overlay (captures clicks) */}
                <div
                  ref={googleBtnRef}
                  aria-label="Sign in with Google"
                  className={cn(
                    "absolute inset-0 z-10 flex items-center justify-center rounded-full",
                    // keep nearly invisible but still clickable
                    "opacity-[0.001]",
                    // force GIS iframe to fill our 55x55 hit target
                    "[&>div]:m-0! [&>div]:h-full [&>div]:w-full [&_iframe]:h-full [&_iframe]:w-full",
                  )}
                />
              </div>
            ) : (
              <button
                type="button"
                disabled
                aria-disabled
                title="Google sign-in unavailable"
                className="cursor-not-allowed opacity-40"
              >
                <Image src={googleIcon} alt="Google" width={55} height={55} />
              </button>
            )}
            <button
              type="button"
              disabled
              aria-disabled
              title="Coming soon"
              className="cursor-not-allowed opacity-40"
            >
              <Image src={appleIcon} alt="Apple" width={55} height={55} />
            </button>
            <button
              type="button"
              onClick={switchToPhone}
              disabled={loginMode === "phone" || busy}
              className="transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              title="Sign in with phone"
            >
              <Image src={phoneIcon} alt="Phone" width={55} height={55} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
