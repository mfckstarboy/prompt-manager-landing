"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const AI_TOOLS = [
  {
    name: "ChatGPT",
    href: "https://chatgpt.com/",
    icon: "/icons/chatgpt.svg",
  },
  {
    name: "Claude",
    href: "https://claude.ai/",
    icon: "/icons/claude.svg",
  },
  {
    name: "Gemini",
    href: "https://gemini.google.com/app",
    icon: "/icons/gemini.svg",
  },
  {
    name: "Perplexity",
    href: "https://www.perplexity.ai/",
    icon: "/icons/perplexity.svg",
  },
];

export function GuestModeLauncher() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        className="landing-ui h-12 w-full gap-2 bg-slate-100 text-slate-950 hover:bg-slate-200"
        onClick={() => setIsOpen(true)}
      >
        Continue as guest
      </Button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="guest-mode-title"
        >
          <div className="w-full max-w-[460px] rounded-[30px] border border-slate-200 bg-white p-6 text-slate-950 shadow-[0_30px_100px_-40px_rgba(15,23,42,0.6)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="guest-mode-title" className="text-[26px] leading-8 tracking-[-0.02em]">
                  Start locally
                </h2>
                <p className="mt-2 text-[15px] leading-6 text-slate-600">
                  Open an AI tool and use PromptTray without an account. Your prompts stay on this device until you choose to sync.
                </p>
              </div>
              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
                aria-label="Close guest app picker"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {AI_TOOLS.map((tool) => (
                <a
                  key={tool.name}
                  href={tool.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col items-center gap-3 rounded-[22px] border border-slate-200 bg-slate-50 px-3 py-4 text-center transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white bg-white shadow-[0_12px_26px_-18px_rgba(15,23,42,0.5)]">
                    <Image src={tool.icon} alt="" width={28} height={28} className="object-contain" />
                  </span>
                  <span className="text-[13px] font-semibold leading-4 text-slate-800">
                    {tool.name}
                  </span>
                </a>
              ))}
            </div>

            <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[12px] leading-5 text-slate-500">
              <ExternalLink className="h-3.5 w-3.5" />
              You can create an account later from the extension settings.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
