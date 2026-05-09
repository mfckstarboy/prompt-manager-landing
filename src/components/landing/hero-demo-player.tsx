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

const TAB_ICONS: Record<TabId, React.ReactNode> = {
  chatgpt: <img src="/logos/chatgpt.svg" width={14} height={14} alt="ChatGPT" aria-hidden="true" />,
  claude: <img src="/logos/claude.svg" width={14} height={14} alt="Claude" aria-hidden="true" />,
  gemini: <img src="/logos/gemini.svg" width={14} height={14} alt="Gemini" aria-hidden="true" />,
  perplexity: <img src="/logos/perplexity.svg" width={14} height={14} alt="Perplexity" aria-hidden="true" />,
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
