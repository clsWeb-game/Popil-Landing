"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is Popil?",
    answer:
      "Experience 24/7 with Popil, listen and share your favourite music, create content clips, explore interactive videos, sing karaoke, and enjoy watching movies. All in one app. Content-first platform for artists, creators, and fans.",
  },
  {
    question: "Can I sing out?",
    answer:
      "Absolutely! With Popil's Karaoke feature, you can sing along to your favourite tracks, record your performances, and share them with the community. Express yourself and let your voice be heard.",
  },
  {
    question: "What exclusive suggestions?",
    answer:
      "Popil uses smart AI-powered recommendations to curate personalised playlists, suggest trending content, and help you discover new artists that match your taste and listening habits.",
  },
  {
    question: "Can I monetise free?",
    answer:
      "Yes! Popil's ecosystem empowers creators and artists to monetize their content through multiple channels including direct sales, subscriptions, tips, and our unique revenue-sharing model.",
  },
  {
    question: "Do I need to sign up?",
    answer:
      "Signing up is quick and free. Create your Popil account to unlock the full experience — save favourites, create playlists, follow artists, and join the growing Popil community.",
  },
  {
    question: "Is Popil available?",
    answer:
      "Popil is expanding globally. The platform is currently available as a web app and we're rolling out native mobile apps for iOS and Android. Stay tuned for updates!",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative w-full py-24 md:py-32">
      <div className="mx-auto w-full max-w-3xl px-6">
        <h2 className="mb-4 text-center font-heading text-3xl font-bold text-white md:text-4xl">
          Frequently Asked Questions
        </h2>
        <p className="mb-12 text-center text-sm text-white/40">
          www.FAQ@POPIL.Themes
        </p>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm transition-colors duration-200 hover:border-white/15"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
              >
                <span className="text-sm font-medium text-white/80 md:text-base">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-white/40 transition-transform duration-300 ${
                    openIndex === idx ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openIndex === idx
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-4 text-sm leading-relaxed text-white/40">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
