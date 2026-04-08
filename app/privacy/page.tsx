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

const SECTION_COUNT = 12;

const proseClass = cn(
  "text-sm sm:text-base text-white/75 leading-relaxed",
  "[&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold sm:[&_h2]:text-2xl [&_h2]:text-white",
  "[&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-white/90",
  "[&_p]:mt-2 [&_p:first-of-type]:mt-0",
  "[&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:marker:text-primary [&_li]:mt-1",
);

function SectionRow({
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

export default function PrivacyPage() {
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

          <div className="relative px-5 pb-12">
            <div className="mb-10 flex flex-col items-center text-center sm:mb-14">
              <Image
                src="/logo/logo.svg"
                alt="Popil Logo"
                width={96}
                height={96}
                className="-mt-5 h-20 w-20 sm:h-32 sm:w-32"
                loading="eager"
              />
              <h1 className="mt-0 max-w-2xl text-balance text-3xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
                Privacy Policy
              </h1>
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

              <SectionRow index={0} isLast={false} isActive={activeIndex === 0} sectionRef={assignRef(0)}>
                <section>
                  <h2>1. Introduction</h2>
                  <p>
                    At Popil, we value your privacy and are committed to protecting
                    your personal information. This Privacy Policy explains how we
                    collect, use, store, and protect your data when you use our
                    website and services.
                  </p>
                  <p>
                    By accessing or using the platform, you agree to the terms
                    outlined in this Privacy Policy.
                  </p>
                </section>
              </SectionRow>

              <SectionRow index={1} isLast={false} isActive={activeIndex === 1} sectionRef={assignRef(1)}>
                <section>
                  <h2>2. Information We Collect</h2>
                  <p>We may collect the following types of information:</p>

                  <h3>a. Personal Information</h3>
                  <ul>
                    <li>Full name</li>
                    <li>Email address</li>
                    <li>Mobile number</li>
                    <li>Login credentials</li>
                    <li>Profile details</li>
                  </ul>

                  <h3>b. Artist / Creator Information</h3>
                  <ul>
                    <li>Government ID</li>
                    <li>Portfolio or work details</li>
                    <li>Production house information</li>
                    <li>Bank details (if applicable for payments)</li>
                  </ul>

                  <h3>c. Usage Data</h3>
                  <ul>
                    <li>Pages visited</li>
                    <li>Time spent on platform</li>
                    <li>User interactions</li>
                    <li>Device and browser information</li>
                  </ul>

                  <h3>d. Payment Information</h3>
                  <ul>
                    <li>Transaction details</li>
                    <li>Membership purchases</li>
                    <li>Rental history</li>
                  </ul>
                  <p>
                    (Note: We do not store sensitive payment details like card
                    numbers; these are handled by secure payment gateways.)
                  </p>
                </section>
              </SectionRow>

              <SectionRow index={2} isLast={false} isActive={activeIndex === 2} sectionRef={assignRef(2)}>
                <section>
                  <h2>3. How We Use Your Information</h2>
                  <p>We use your information to:</p>
                  <ul>
                    <li>Create and manage user accounts</li>
                    <li>Provide access to content and services</li>
                    <li>Process payments and subscriptions</li>
                    <li>Enable artist onboarding and approvals</li>
                    <li>Improve platform performance and user experience</li>
                    <li>
                      Communicate updates, offers, or important notifications
                    </li>
                    <li>Ensure security and prevent fraud</li>
                  </ul>
                </section>
              </SectionRow>

              <SectionRow index={3} isLast={false} isActive={activeIndex === 3} sectionRef={assignRef(3)}>
                <section>
                  <h2>4. Sharing of Information</h2>
                  <p>
                    We do not sell your personal data. However, we may share
                    information with:
                  </p>
                  <ul>
                    <li>
                      Payment gateway providers (for processing transactions)
                    </li>
                    <li>
                      Service providers (for hosting, analytics, or technical
                      support)
                    </li>
                    <li>
                      Legal authorities (if required by law or to protect rights
                      and safety)
                    </li>
                  </ul>
                </section>
              </SectionRow>

              <SectionRow index={4} isLast={false} isActive={activeIndex === 4} sectionRef={assignRef(4)}>
                <section>
                  <h2>5. Data Security</h2>
                  <p>
                    We implement appropriate security measures to protect your
                    data, including:
                  </p>
                  <ul>
                    <li>Secure servers and encryption</li>
                    <li>Access control systems</li>
                    <li>Regular monitoring for vulnerabilities</li>
                  </ul>
                  <p>
                    However, no system is completely secure, and we cannot
                    guarantee absolute protection.
                  </p>
                </section>
              </SectionRow>

              <SectionRow index={5} isLast={false} isActive={activeIndex === 5} sectionRef={assignRef(5)}>
                <section>
                  <h2>6. Cookies &amp; Tracking Technologies</h2>
                  <p>Popil may use cookies and similar technologies to:</p>
                  <ul>
                    <li>Improve user experience</li>
                    <li>Remember user preferences</li>
                    <li>Analyze website traffic</li>
                  </ul>
                  <p>
                    Users can choose to disable cookies through browser settings,
                    though some features may not function properly.
                  </p>
                </section>
              </SectionRow>

              <SectionRow index={6} isLast={false} isActive={activeIndex === 6} sectionRef={assignRef(6)}>
                <section>
                  <h2>7. Data Retention</h2>
                  <p>
                    We retain your information only as long as necessary to:
                  </p>
                  <ul>
                    <li>Provide services</li>
                    <li>Comply with legal obligations</li>
                    <li>Resolve disputes</li>
                  </ul>
                  <p>
                    Users may request deletion of their data, subject to
                    applicable laws and platform requirements.
                  </p>
                </section>
              </SectionRow>

              <SectionRow index={7} isLast={false} isActive={activeIndex === 7} sectionRef={assignRef(7)}>
                <section>
                  <h2>8. User Rights</h2>
                  <p>Users have the right to:</p>
                  <ul>
                    <li>Access their personal data</li>
                    <li>Update or correct information</li>
                    <li>Request deletion of their account</li>
                    <li>Withdraw consent (where applicable)</li>
                  </ul>
                  <p>
                    Requests can be made through the contact section of the
                    platform.
                  </p>
                </section>
              </SectionRow>

              <SectionRow index={8} isLast={false} isActive={activeIndex === 8} sectionRef={assignRef(8)}>
                <section>
                  <h2>9. Third-Party Links</h2>
                  <p>
                    The platform may contain links to third-party services. Popil
                    is not responsible for the privacy practices of those external
                    websites.
                  </p>
                </section>
              </SectionRow>

              <SectionRow index={9} isLast={false} isActive={activeIndex === 9} sectionRef={assignRef(9)}>
                <section>
                  <h2>10. Children&apos;s Privacy</h2>
                  <p>
                    Popil does not knowingly collect personal data from children
                    under 18 without parental consent. If such data is identified,
                    it will be removed promptly.
                  </p>
                </section>
              </SectionRow>

              <SectionRow index={10} isLast={false} isActive={activeIndex === 10} sectionRef={assignRef(10)}>
                <section>
                  <h2>11. Changes to Privacy Policy</h2>
                  <p>
                    We may update this Privacy Policy from time to time. Continued
                    use of the platform after updates implies acceptance of the
                    revised policy.
                  </p>
                </section>
              </SectionRow>

              <SectionRow index={11} isLast isActive={activeIndex === 11} sectionRef={assignRef(11)}>
                <section>
                  <h2>12. Contact Us</h2>
                  <p>
                    If you have any questions or concerns about this Privacy
                    Policy, you can contact us through the official contact form
                    available on the website.
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
              </SectionRow>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
