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

export function HeroDemoPlayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovering, setIsHovering] = useState(false);

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
      <div className="flex items-center gap-2 border-b border-border bg-white px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="flex flex-1 justify-center">
          <div className="landing-label rounded-full border border-border bg-background px-4 py-1 text-muted-foreground">
            chatgpt.com
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
