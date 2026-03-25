"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type Node = {
  radius: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
};

type ConstellationBackgroundProps = {
  className?: string;
  connectionDistance?: number;
  count?: number;
  glow?: boolean;
  lineColor?: string;
  mouseRadius?: number;
  nodeColor?: string;
  nodeSize?: number;
};

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return prefersReducedMotion;
}

export function ConstellationBackground({
  className,
  connectionDistance = 140,
  count = 26,
  glow = true,
  lineColor = "rgba(191, 219, 254, 0.12)",
  mouseRadius = 96,
  nodeColor = "rgba(191, 219, 254, 0.7)",
  nodeSize = 1.8,
}: ConstellationBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container || prefersReducedMotion) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    let width = 0;
    let height = 0;
    let animationFrameId = 0;
    let mouseX = -1000;
    let mouseY = -1000;

    const applyCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const createNode = (): Node => ({
      radius: Math.random() * nodeSize + nodeSize * 0.55,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      x: Math.random() * width,
      y: Math.random() * height,
    });

    applyCanvasSize();

    const nodes = Array.from({ length: count }, createNode);

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const insideX = event.clientX >= rect.left && event.clientX <= rect.right;
      const insideY = event.clientY >= rect.top && event.clientY <= rect.bottom;

      if (insideX && insideY) {
        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;
        return;
      }

      mouseX = -1000;
      mouseY = -1000;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    const resizeObserver = new ResizeObserver(() => {
      applyCanvasSize();
    });

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    resizeObserver.observe(container);

    const animate = () => {
      context.clearRect(0, 0, width, height);

      for (const node of nodes) {
        const dx = node.x - mouseX;
        const dy = node.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouseRadius && distance > 0) {
          const force = ((mouseRadius - distance) / mouseRadius) * 0.012;
          node.vx += (dx / distance) * force;
          node.vy += (dy / distance) * force;
        }

        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.992;
        node.vy *= 0.992;
        node.vx += (Math.random() - 0.5) * 0.0025;
        node.vy += (Math.random() - 0.5) * 0.0025;

        if (node.x < 0 || node.x > width) {
          node.vx *= -1;
          node.x = Math.max(0, Math.min(width, node.x));
        }

        if (node.y < 0 || node.y > height) {
          node.vy *= -1;
          node.y = Math.max(0, Math.min(height, node.y));
        }
      }

      context.strokeStyle = lineColor;
      context.lineWidth = 1;

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            context.globalAlpha = (1 - distance / connectionDistance) * 0.4;
            context.beginPath();
            context.moveTo(nodes[i].x, nodes[i].y);
            context.lineTo(nodes[j].x, nodes[j].y);
            context.stroke();
          }
        }
      }

      context.globalAlpha = 1;

      for (const node of nodes) {
        if (glow) {
          const gradient = context.createRadialGradient(
            node.x,
            node.y,
            0,
            node.x,
            node.y,
            node.radius * 5
          );
          gradient.addColorStop(0, nodeColor.replace("0.7)", "0.18)"));
          gradient.addColorStop(1, "transparent");
          context.fillStyle = gradient;
          context.beginPath();
          context.arc(node.x, node.y, node.radius * 5, 0, Math.PI * 2);
          context.fill();
        }

        context.fillStyle = nodeColor;
        context.beginPath();
        context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        context.fill();
      }

      animationFrameId = window.requestAnimationFrame(animate);
    };

    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      resizeObserver.disconnect();
    };
  }, [
    connectionDistance,
    count,
    glow,
    lineColor,
    mouseRadius,
    nodeColor,
    nodeSize,
    prefersReducedMotion,
  ]);

  return (
    <div ref={containerRef} className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(96,165,250,0.12),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_38%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_30%,rgba(15,23,42,0.18)_100%)]" />
    </div>
  );
}
