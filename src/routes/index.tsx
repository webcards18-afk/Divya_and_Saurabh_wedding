import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SectionOneIntro } from "@/components/sections/SectionOneIntro";
import { WeddingEventVideoSection } from "@/components/wedding-invitation/WeddingEventVideoSection";
import { SectionWeddingCountdown } from "@/components/wedding-invitation/SectionWeddingCountdown";
import { SectionClosingRSVP } from "@/components/wedding-invitation/SectionClosingRSVP";
import { BackgroundMusic } from "@/components/wedding-invitation/BackgroundMusic";
import { RosePetalsShower } from "@/components/wedding-invitation/RosePetalsShower";
import { Navigation } from "@/components/Navigation";
import { weddingData } from "@/config/wedding";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [hasStartedIntro, setHasStartedIntro] = useState(false);
  const [hasFinishedIntro, setHasFinishedIntro] = useState(false);

  // Guarantee that on every fresh load or page refresh, it starts strictly from 0 (1-vid and Tap to Open)
  useEffect(() => {
    // 1. Disable browser's automatic scroll restoration
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // 2. Clear any lingering URL hashes (e.g. #countdown, #rsvp) that cause auto-jump
    if (typeof window !== "undefined" && window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    // 3. Immediately reset scroll position to the top
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });

    // Secondary reset after render to overcome any browser race conditions
    const rafId = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });

    const onBeforeUnload = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  // Strictly lock scrolling from page load until 1-vid finishes playing!
  // User cannot scroll past 1-vid until they tap "Tap to Open" and 1-vid finishes.
  useEffect(() => {
    if (!hasFinishedIntro) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.touchAction = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [hasFinishedIntro]);

  const handleVideoOneFinish = () => {
    setHasFinishedIntro(true);
  };

  const weddingEvent = weddingData.events.find((e) => e.id === "wedding") || weddingData.events[weddingData.events.length - 1];

  return (
    <div className="relative w-full bg-[#0a0205] font-body text-[#f5ebd7] overflow-x-clip selection:bg-[#d4af37]/30 selection:text-white">
      {/* Background Music Player & Floating Music Controller (plays music.mp3 after tap, loops continuously) */}
      <BackgroundMusic hasStarted={hasStartedIntro} />

      {/* Rose Petals Showering Gracefully Across Entire Website — subtle, elegant quantity */}
      <RosePetalsShower active={hasFinishedIntro} count={16} />

      {/* Floating Section Navigation (removed on 1-vid, visible only after scrolling into celebration events) */}
      <Navigation hasFinishedIntro={hasFinishedIntro} />

      <main className="w-full flex flex-col">
        {/* 1. Website Opening – 1-vid with "Tap to Open Invitation" (strictly muted, plays once, never disappears, with Scroll Down prompt) */}
        <SectionOneIntro
          onOpen={() => setHasStartedIntro(true)}
          onFinish={handleVideoOneFinish}
        />

        {/* 2. Wedding Countdown Section with Royal Gold Scratch Card & Party Blast */}
        <SectionWeddingCountdown />

        {/* 3. Main Wedding Ceremony – 6-vid with Map Button (strictly muted, plays once) */}
        {weddingEvent && (
          <WeddingEventVideoSection
            id={weddingEvent.id}
            videoSrc={weddingEvent.videoSrc}
            title={weddingEvent.title}
            date={weddingEvent.date}
            time={weddingEvent.time}
            venueName={weddingEvent.venueName}
            venueAddress={weddingEvent.venueAddress}
            mapUrl={weddingEvent.mapUrl}
            note={weddingEvent.note}
            badgeColor={weddingEvent.badgeColor}
          />
        )}

        {/* 4. Closing Section – 7-vid: Presha's Blessing, Dadke & Nanke RSVP, Call & WhatsApp (strictly muted, plays once) */}
        <SectionClosingRSVP />
      </main>
    </div>
  );
}
