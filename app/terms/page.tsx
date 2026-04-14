"use client";

import { useRef, useState, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import DarkVeil from "../ui/DarkVeil";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const SECTION_COUNT = 15;

const proseClass = cn(
  "text-sm sm:text-base text-white/75 leading-relaxed",
  "[&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold sm:[&_h2]:text-2xl [&_h2]:text-white",
  "[&_p]:mt-2 [&_p:first-of-type]:mt-0",
  "[&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:marker:text-primary [&_li]:mt-1",
);

function TermsSectionRow({
  index,
  isLast,
  isActive,
  sectionRef,
  children,
}: {
  index: number;
  isLast: boolean;
  isActive: boolean;
  sectionRef: (el: HTMLDivElement | null) => void;
  children: ReactNode;
}) {
  return (
    <div ref={sectionRef} className="relative flex w-full gap-6 sm:gap-8">
      <div className="relative flex w-4 shrink-0 flex-col items-center sm:w-6">
        <motion.div
          animate={{ scale: isActive ? 1.3 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className={cn(
            "relative z-10 mt-1.5 h-3 w-3 rounded-full transition-all duration-500 sm:mt-2 sm:h-4 sm:w-4",
            isActive
              ? "bg-primary shadow-[0_0_18px_rgba(254,165,0,0.85)]"
              : "bg-white/20 shadow-none",
          )}
        />
        {!isLast && (
          <div className="absolute bottom-[-2.5rem] left-1/2 top-6 w-[2px] -translate-x-1/2 bg-white/10 md:bottom-[-3rem] sm:top-8" />
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
        transition={{ duration: 0.5 }}
        className={cn("flex-1 text-white!", proseClass)}
      >
        {children}
      </motion.div>
    </div>
  );
}

export default function TermsPage() {
  const router = useRouter();

  const sectionRefs = useRef<(HTMLDivElement | null)[]>(
    Array.from({ length: SECTION_COUNT }, () => null),
  );
  const timelineRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const assignRef = useCallback(
    (i: number) => (el: HTMLDivElement | null) => {
      sectionRefs.current[i] = el;
    },
    [],
  );

  const [beamY, setBeamY] = useState(0);

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 80%", "end 20%"],
  });

  useMotionValueEvent(scrollYProgress, "change", () => {
    const viewportTarget = window.innerHeight * 0.42;
    let closest = 0;
    let closestDist = Infinity;
    sectionRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const dist = Math.abs(center - viewportTarget);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setActiveIndex(closest);

    const container = timelineRef.current;
    const activeEl = sectionRefs.current[closest];
    if (container && activeEl) {
      const containerTop = container.getBoundingClientRect().top;
      const activeTop = activeEl.getBoundingClientRect().top;
      setBeamY(activeTop - containerTop + 8);
    }
  });

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <div className="fixed inset-0 z-0">
        <DarkVeil
          hueShift={211}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={0.5}
          scanlineFrequency={0}
          warpAmount={0}
        />
        <div className="absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-black/35 shadow-2xl backdrop-blur-xl">
          {/* Figma-style warm corner glow */}
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-20 -top-16 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl"
            aria-hidden
          />

          <div className="relative px-5 pt-6 sm:px-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
              Go back
            </button>
          </div>

          <div className="relative px-5 pb-12 ">
            <div className="mb-10 flex flex-col items-center text-center sm:mb-14">
              {/* <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90 sm:text-xs">
                <span className="text-primary" aria-hidden>
                  •
                </span>
                Legal document
              </p> */}
              <Image
                src="/logo/logo.svg"
                alt="Popil Logo"
                width={96}
                height={96}
                className="-mt-5 h-20 w-20 sm:h-32 sm:w-32"
                loading="eager"
              />
              <h1 className="mt-0 max-w-2xl text-balance text-3xl font-bold tracking-tight text-white  sm:text-3xl md:text-4xl">
                Terms and Conditions
              </h1>
              {/* <p className="mt-2 text-sm text-white/55 sm:text-base">Popil</p> */}
              {/* <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/50">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  Last updated: June 15, 2024
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  Estimated reading time: 12 minutes
                </span>
              </div> */}
            </div>

            <div
              ref={timelineRef}
              className="relative mx-auto flex max-w-6xl flex-col gap-10 md:gap-12 text-white!"
            >
              {/* Light beam that tracks the active section dot */}
              <motion.div
                className="pointer-events-none absolute left-[7px] z-20 w-[2px] sm:left-[11px]"
                animate={{ top: beamY - 32 }}
                transition={{ type: "spring", stiffness: 120, damping: 24 }}
                style={{ height: 80 }}
                aria-hidden
              >
                <div className="h-full w-full bg-linear-to-b from-transparent via-primary to-transparent opacity-90 blur-[3px]" />
                <div className="absolute inset-0 h-full w-full bg-linear-to-b from-transparent via-primary to-transparent opacity-60" />
              </motion.div>

              <TermsSectionRow index={0} isLast={false} isActive={activeIndex === 0} sectionRef={assignRef(0)}>
                <section>
                  <h2>1. Introduction</h2>
                  <p >
                    Welcome to Popil. These Terms and Conditions govern your use
                    of the Popil website and services. By accessing or using the
                    platform, you agree to comply with and be bound by these
                    terms.
                  </p>
                  <p>
                    If you do not agree with any part of these terms, you should
                    not use the platform.
                  </p>
                </section>
              </TermsSectionRow>

              <TermsSectionRow index={1} isLast={false} isActive={activeIndex === 1} sectionRef={assignRef(1)}>
                <section>
                  <h2>2. Definitions</h2>
                  <p>
                    “Platform” refers to the Popil website and related services.
                  </p>
                  <p>
                    “User” refers to any individual accessing or using the
                    platform.
                  </p>
                  <p>
                    “Artist / Production House” refers to registered content
                    creators onboarding on the platform.
                  </p>
                  <p>
                    “Content” includes movies, series, videos, images, and any
                    digital media available on Popil.
                  </p>
                  <p>
                    “Membership” refers to subscription plans offered by Popil.
                  </p>
                </section>
              </TermsSectionRow>

              <TermsSectionRow index={2} isLast={false} isActive={activeIndex === 2} sectionRef={assignRef(2)}>
                <section>
                  <h2>3. Eligibility</h2>
                  <p>By using Popil, you confirm that:</p>
                  <ul>
                    <li>
                      You are at least 18 years old, or using the platform under
                      parental supervision.
                    </li>
                    <li>You have the legal capacity to enter into a binding agreement.</li>
                    <li>All information provided by you is accurate and complete.</li>
                  </ul>
                </section>
              </TermsSectionRow>

              <TermsSectionRow index={3} isLast={false} isActive={activeIndex === 3} sectionRef={assignRef(3)}>
                <section>
                  <h2>4. User Account &amp; Registration</h2>
                  <ul>
                    <li>
                      Users may register using OTP or password-based
                      authentication.
                    </li>
                    <li>
                      You are responsible for maintaining the confidentiality of
                      your login credentials.
                    </li>
                    <li>
                      Any activity performed through your account will be
                      considered your responsibility.
                    </li>
                    <li>
                      Popil reserves the right to suspend or terminate accounts in
                      case of misuse or violation of terms.
                    </li>
                  </ul>
                </section>
              </TermsSectionRow>

              <TermsSectionRow index={4} isLast={false} isActive={activeIndex === 4} sectionRef={assignRef(4)}>
                <section>
                  <h2>5. Artist / Production House Onboarding</h2>
                  <ul>
                    <li>
                      Artists and production houses must provide accurate and
                      valid information during registration.
                    </li>
                    <li>Submitted applications are subject to admin approval.</li>
                    <li>
                      Popil reserves the right to accept or reject any application
                      without prior notice.
                    </li>
                    <li>
                      Approved creators are responsible for the authenticity and
                      legality of the content they upload.
                    </li>
                  </ul>
                </section>
              </TermsSectionRow>

              <TermsSectionRow index={5} isLast={false} isActive={activeIndex === 5} sectionRef={assignRef(5)}>
                <section>
                  <h2>6. Membership &amp; Payments</h2>
                  <ul>
                    <li>
                      Popil offers subscription-based memberships and rental-based
                      content access.
                    </li>
                    <li>
                      All payments must be made through approved payment methods
                      available on the platform.
                    </li>
                    <li>
                      Membership fees are non-refundable unless stated otherwise.
                    </li>
                    <li>
                      Popil reserves the right to modify pricing, plans, or
                      features at any time.
                    </li>
                  </ul>
                </section>
              </TermsSectionRow>

              <TermsSectionRow index={6} isLast={false} isActive={activeIndex === 6} sectionRef={assignRef(6)}>
                <section>
                  <h2>7. Content Access &amp; Usage</h2>
                  <ul>
                    <li>Content is provided for personal, non-commercial use only.</li>
                    <li>
                      Users are not allowed to copy, distribute, reproduce, or
                      publicly display content without permission.
                    </li>
                    <li>
                      Unauthorized sharing, screen recording, or piracy is strictly
                      prohibited.
                    </li>
                    <li>
                      Access to rented or subscribed content is limited to the
                      validity period.
                    </li>
                  </ul>
                </section>
              </TermsSectionRow>

              <TermsSectionRow index={7} isLast={false} isActive={activeIndex === 7} sectionRef={assignRef(7)}>
                <section>
                  <h2>8. Intellectual Property</h2>
                  <ul>
                    <li>
                      All content, design, logos, and materials on Popil are owned
                      by Popil or its licensors.
                    </li>
                    <li>
                      Users and creators may not use platform assets without prior
                      written permission.
                    </li>
                    <li>
                      Artists retain rights to their content but grant Popil a
                      license to display and distribute it on the platform.
                    </li>
                  </ul>
                </section>
              </TermsSectionRow>

              <TermsSectionRow index={8} isLast={false} isActive={activeIndex === 8} sectionRef={assignRef(8)}>
                <section>
                  <h2>9. User Conduct</h2>
                  <p>Users agree not to:</p>
                  <ul>
                    <li>Use the platform for illegal or unauthorized purposes</li>
                    <li>Upload harmful, offensive, or misleading content</li>
                    <li>Attempt to hack, disrupt, or damage the platform</li>
                    <li>Violate any applicable laws or regulations</li>
                  </ul>
                </section>
              </TermsSectionRow>

              <TermsSectionRow index={9} isLast={false} isActive={activeIndex === 9} sectionRef={assignRef(9)}>
                <section>
                  <h2>10. Limitation of Liability</h2>
                  <ul>
                    <li>
                      Popil is not responsible for any indirect, incidental, or
                      consequential damages arising from the use of the platform.
                    </li>
                    <li>We do not guarantee uninterrupted or error-free service.</li>
                    <li>Content availability may change without notice.</li>
                  </ul>
                </section>
              </TermsSectionRow>

              <TermsSectionRow index={10} isLast={false} isActive={activeIndex === 10} sectionRef={assignRef(10)}>
                <section>
                  <h2>11. Termination</h2>
                  <p>Popil reserves the right to:</p>
                  <ul>
                    <li>Suspend or terminate accounts for violations</li>
                    <li>Remove content that does not comply with platform policies</li>
                    <li>
                      Restrict access without prior notice in case of misuse
                    </li>
                  </ul>
                </section>
              </TermsSectionRow>

              <TermsSectionRow index={11} isLast={false} isActive={activeIndex === 11} sectionRef={assignRef(11)}>
                <section>
                  <h2>12. Privacy</h2>
                  <p>
                    User data is handled in accordance with our Privacy Policy. By
                    using the platform, you consent to the collection and use of
                    your information as described therein.
                  </p>
                </section>
              </TermsSectionRow>

              <TermsSectionRow index={12} isLast={false} isActive={activeIndex === 12} sectionRef={assignRef(12)}>
                <section>
                  <h2>13. Changes to Terms</h2>
                  <p>
                    Popil may update these Terms and Conditions at any time.
                    Continued use of the platform after changes implies acceptance
                    of the updated terms.
                  </p>
                </section>
              </TermsSectionRow>

              <TermsSectionRow index={13} isLast={false} isActive={activeIndex === 13} sectionRef={assignRef(13)}>
                <section>
                  <h2>14. Governing Law</h2>
                  <p>
                    These terms shall be governed by and interpreted in accordance
                    with the laws of India. Any disputes shall be subject to the
                    jurisdiction of the appropriate courts.
                  </p>
                </section>
              </TermsSectionRow>

              <TermsSectionRow index={14} isLast isActive={activeIndex === 14} sectionRef={assignRef(14)}>
                <section>
                  <h2>15. Contact Us</h2>
                  <p>
                    For any questions, issues, or concerns regarding these Terms
                    and Conditions, users can contact us through the official
                    contact form available on the website.
                  </p>
                  <p>
                    Use the{" "}
                    <Link
                      href="/contact-us"
                      className="font-medium text-primary underline decoration-primary/50 underline-offset-4 transition-colors hover:text-primary/90"
                    >
                      contact form
                    </Link>
                    .
                  </p>
                </section>
              </TermsSectionRow>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
