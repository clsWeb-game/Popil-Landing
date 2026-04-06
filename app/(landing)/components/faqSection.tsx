"use client";

import { useState } from "react";
import { PlusCircle, MinusCircle } from "lucide-react";
import Image from "next/image";

const faqs = [
  {
    question: "What is Popil?",
    answer:
      "Popil is MOSm (OTT Social Media) Platform, here you can Listen, Sing, Create and Share your musical journey with the world, along with the advantage of finding independent movies and Series from across the globe.",
  },
  {
    question: "How do I sign up?",
    answer:
      "Signing up is quick and free. Download the Popil app or visit our website, tap Sign Up, enter your details, and you're ready to explore the full Popil experience.",
  },
  {
    question: "What devices are supported?",
    answer:
      "Popil is available on iOS, Android, and the web. You can enjoy seamless streaming across smartphones, tablets, and desktop browsers.",
  },
  {
    question: "How much does it cost?",
    answer:
      "Popil offers a free tier with access to a wide range of content. Premium plans are available for an ad-free experience, offline downloads, and exclusive features.",
  },
  {
    question: "Can I watch for free?",
    answer:
      "Yes! Popil provides a generous free tier so you can watch movies, listen to music, and explore content without any subscription. Upgrade anytime for premium perks.",
  },
  {
    question: "Do I need an internet connection?",
    answer:
      "An internet connection is required for streaming. Premium subscribers can download content for offline viewing and listening on the go.",
  },
  {
    question: "Can I share my account?",
    answer:
      "Popil supports multiple profiles under a single account so your family and friends can enjoy personalised recommendations while sharing one subscription.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative w-full py-24 md:py-32">
      <div className="mx-auto w-full max-w-[1280px] px-8">
        <div className="mb-16 flex flex-col items-center gap-5 text-center">
          <h2 className="text-4xl font-semibold leading-[44px] -tracking-[0.72px] text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xl leading-[30px] text-[#8D93A0]">
            General FAQs for an OTT Platform
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {faqs.map((faq, idx) => (
            <div key={idx} className="flex flex-col items-center gap-6">
              {idx !== 0 && (
                <div className="h-px w-full bg-[#2D3036]" />
              )}
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="flex w-full items-start gap-6"
              >
                <div className="flex min-h-0 min-w-0 flex-1 flex-col items-start gap-2 font-medium">
                  <span className="text-left text-xl leading-7 text-white">
                    {faq.question}
                  </span>
                  <div
                    className={`grid w-full transition-all duration-300 ease-in-out ${
                      openIndex === idx
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-left text-base leading-6 text-[#8D93A0]">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 pt-0.5">
                  {openIndex === idx ? (
                    <MinusCircle className="size-6 text-[#8D93A0]" />
                  ) : (
                    <PlusCircle className="size-6 text-[#8D93A0]" />
                  )}
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute top-0 -left-120 z-[-1]">
        <Image
          src="/background/effect.png"
          alt="Store Background"
          width={1920}
          height={1080}
          className="h-auto w-full"
        />
      </div>
    </section>
  );
}
