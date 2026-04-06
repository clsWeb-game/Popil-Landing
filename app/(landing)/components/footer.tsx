import Image from "next/image";
import Link from "next/link";
import { facebookIcon, instagramIcon, linkedinIcon, twitterIcon, youtubeIcon } from "@/public/icons";

const navLinks = [
  { label: "HOME", href: "/" },
  { label: "TERMS & CONDITIONS", href: "/terms" },
  { label: "PRIVACY POLICY", href: "/privacy" },
  { label: "CONTACT US", href: "/contact" },
];

const socialLinks = [
  { label: "Facebook", href: "#", Icon: facebookIcon },
  { label: "X", href: "#", Icon: twitterIcon },
  { label: "LinkedIn", href: "#", Icon: linkedinIcon },
  { label: "Instagram", href: "#", Icon: instagramIcon },
  { label: "YouTube", href: "#", Icon: youtubeIcon },
];

export default function Footer() {
  return (
    <footer className="mt-auto w-full bg-black/10 ">
      <div className="mx-auto w-[calc(100%-150px)] py-10">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-center">
          <Link href="/" className="shrink-0">
            <Image
              src="/logo/logo.svg"
              alt="Popil"
              width={300}
              height={300}
              className="h-auto w-[200px] md:w-[289px]"
            />
          </Link>

          <nav aria-label="Footer" className="flex-1">
            <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[10px] font-medium tracking-[0.22em] text-white/70">
              {navLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="shrink-0">
            <ul className="flex items-center justify-center gap-4 text-white/80">
              {socialLinks.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-8 w-8 items-center justify-center transition-colors hover:text-white"
                  >
                    <Image src={Icon} alt={label} width={16} height={16} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-10 text-center text-[11px] text-white/40">
          © Copyright 2025, All Rights Reserved by Popil
        </div>
      </div>
    </footer>
  );
}