"use client";

import { Maximize2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void>;
};

type FullscreenVideoElement = HTMLVideoElement & {
  webkitRequestFullscreen?: () => Promise<void>;
  webkitEnterFullscreen?: () => void;
};

type TabId = "chatgpt" | "claude" | "gemini" | "perplexity";

const TABS: { id: TabId; label: string; url: string }[] = [
  { id: "chatgpt", label: "ChatGPT", url: "chatgpt.com" },
  { id: "claude", label: "Claude", url: "claude.ai" },
  { id: "gemini", label: "Gemini", url: "gemini.google.com" },
  { id: "perplexity", label: "Perplexity", url: "perplexity.ai" },
];

function ChatGPTIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 41 41" fill="none" aria-hidden="true">
      <path
        d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-6.99-3.393 10.078 10.078 0 0 0-9.612 6.879 9.964 9.964 0 0 0-6.69 4.834 10.079 10.079 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 6.99 3.393 10.078 10.078 0 0 0 9.617-6.879 9.967 9.967 0 0 0 6.69-4.834 10.079 10.079 0 0 0-1.243-11.818zM22.498 37.886a7.474 7.474 0 0 1-4.799-1.735c.061-.033.168-.091.237-.134l7.964-4.6a1.294 1.294 0 0 0 .655-1.134V19.054l3.366 1.944a.12.12 0 0 1 .066.092v9.299a7.505 7.505 0 0 1-7.49 7.496zM6.392 31.006a7.471 7.471 0 0 1-.894-5.023c.06.036.162.099.237.141l7.964 4.6a1.297 1.297 0 0 0 1.308 0l9.724-5.614v3.888a.12.12 0 0 1-.048.103l-8.051 4.649a7.504 7.504 0 0 1-10.24-2.744zM4.297 13.62A7.469 7.469 0 0 1 8.2 10.333c0 .068-.004.19-.004.274v9.201a1.294 1.294 0 0 0 .654 1.132l9.723 5.614-3.366 1.944a.12.12 0 0 1-.114.012L7.044 23.86a7.504 7.504 0 0 1-2.747-10.24zm27.658 6.437l-9.724-5.615 3.367-1.943a.121.121 0 0 1 .114-.012l8.048 4.648a7.498 7.498 0 0 1-1.158 13.528v-9.476a1.293 1.293 0 0 0-.647-1.13zm3.35-5.043c-.059-.037-.162-.099-.236-.141l-7.965-4.6a1.298 1.298 0 0 0-1.308 0l-9.723 5.614v-3.888a.12.12 0 0 1 .048-.103l8.05-4.645a7.497 7.497 0 0 1 11.135 7.763zm-21.063 6.929l-3.367-1.944a.12.12 0 0 1-.065-.092v-9.299a7.497 7.497 0 0 1 12.293-5.756 6.94 6.94 0 0 0-.236.134l-7.965 4.6a1.294 1.294 0 0 0-.654 1.132l-.006 11.225zm1.829-3.943l4.33-2.501 4.332 2.5v4.998l-4.331 2.5-4.331-2.5V18z"
        fill="currentColor"
      />
    </svg>
  );
}

function ClaudeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#D97706" />
      <path
        d="M8.5 15.5l3.5-7 3.5 7M9.8 13h4.4"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GeminiIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2C12 2 12 9.5 4 12C12 14.5 12 22 12 22C12 22 12 14.5 20 12C12 9.5 12 2 12 2Z"
        fill="url(#gem-g)"
      />
      <defs>
        <linearGradient id="gem-g" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4285F4" />
          <stop offset="0.5" stopColor="#9C27B0" />
          <stop offset="1" stopColor="#4285F4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function PerplexityIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect width="24" height="24" rx="5" fill="#1A1A2E" />
      <path d="M7 7h4l3 5-3 5H7l3-5-3-5z" fill="white" opacity="0.9" />
      <path d="M17 7h-4l-3 5 3 5h4l-3-5 3-5z" fill="white" opacity="0.5" />
    </svg>
  );
}

const TAB_ICONS: Record<TabId, React.ReactNode> = {
  chatgpt: <ChatGPTIcon />,
  claude: <ClaudeIcon />,
  gemini: <GeminiIcon />,
  perplexity: <PerplexityIcon />,
};

export function HeroDemoPlayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("chatgpt");

  const activeTabData = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  const enterFullscreen = useCallback(async () => {
    const video = videoRef.current as FullscreenVideoElement | null;
    const container = containerRef.current as FullscreenElement | null;
    const target = container ?? video;
    if (!target) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      if (target.requestFullscreen) {
        await target.requestFullscreen();
      } else if (target.webkitRequestFullscreen) {
        await target.webkitRequestFullscreen();
      } else if (video?.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      }
      if (video) {
        try {
          video.muted = false;
          await video.play();
        } catch {
          // Autoplay may still require muted on some browsers; leave as-is.
        }
      }
    } catch {
      // Silently ignore — fullscreen is a best-effort enhancement.
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        void enterFullscreen();
      }
    },
    [enterFullscreen],
  );

  const handleTabClick = useCallback((e: React.MouseEvent, tabId: TabId) => {
    e.stopPropagation();
    setActiveTab(tabId);
  }, []);

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent, tabId: TabId) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        setActiveTab(tabId);
      }
    },
    [],
  );

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      aria-label="Play PromptTray demo in full screen"
      onClick={enterFullscreen}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="group relative cursor-pointer overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_42px_90px_-54px_rgba(15,23,42,0.32)] outline-none transition-shadow duration-300 hover:shadow-[0_56px_110px_-56px_rgba(15,23,42,0.4)] focus-visible:ring-4 focus-visible:ring-primary/30"
    >
      {/* Tab bar */}
      <div className="flex items-end bg-[#DEE1E6] px-3 pt-2.5">
        <div className="flex shrink-0 items-center gap-1.5 pb-2.5 pr-4">
          <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
          <div className="h-3 w-3 rounded-full bg-[#28C840]" />
        </div>
        <div className="flex items-end gap-0.5 overflow-hidden" role="tablist" aria-label="Browser tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                tabIndex={0}
                onClick={(e) => handleTabClick(e, tab.id)}
                onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
                className={[
                  "relative flex shrink-0 items-center gap-1.5 rounded-t-[8px] px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "z-10 bg-white text-gray-800"
                    : "bg-[#C8CBD0] text-gray-500 hover:bg-[#D4D7DC] hover:text-gray-700",
                ].join(" ")}
              >
                <span className="flex-shrink-0">{TAB_ICONS[tab.id]}</span>
                <span className="hidden max-w-[72px] truncate sm:block">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation / address bar */}
      <div className="flex items-center gap-2 border-b border-border bg-white px-4 py-2">
        <div className="flex flex-1 justify-center">
          <div className="landing-label rounded-full border border-border bg-background px-4 py-1 text-muted-foreground">
            {activeTabData.url}
          </div>
        </div>
      </div>

      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          src="/prompttray-demo.webm"
          poster="/prompttray-demo-poster.png"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className="h-full w-full object-cover"
        />

        <div
          className={`pointer-events-none absolute right-4 top-4 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-white shadow-lg backdrop-blur transition-opacity duration-200 ${
            isHovering ? "opacity-100" : "opacity-0"
          }`}
        >
          <Maximize2 className="h-3.5 w-3.5" />
          <span className="landing-label">Click to expand</span>
        </div>
      </div>
    </div>
  );
}
