"use client";

import { useEffect, useRef, useState } from "react";

export function ScrollProgressIndicator() {
  const barRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(scrollPercent);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.width = `${progress}%`;
    }
  }, [progress]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-0.5 bg-border/30">
      <div
        ref={barRef}
        className="h-full bg-primary"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}