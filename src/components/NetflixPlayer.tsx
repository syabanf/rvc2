"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Video } from "@/data/content";
import { IconBack, IconPause, IconPlay } from "./icons";

const HIDE_AFTER = 3000; // ms without movement before controls fade out
const noop = () => () => {};

const fmt = (s: number) => {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const mm = h ? String(m).padStart(2, "0") : String(m);
  return `${h ? h + ":" : ""}${mm}:${String(sec).padStart(2, "0")}`;
};

type PlayerProps = { video: Video | null; onClose: () => void };

/* Full-screen player in the style of Netflix: black stage, back arrow + title,
   centre play/pause and ±10s, scrubber with remaining time, volume and
   fullscreen. Controls auto-hide while playing. Uses the Fullscreen API where
   available (desktop, Android); iOS Safari gets a full-viewport overlay. */
export function NetflixPlayer({ video, onClose }: PlayerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const vidRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const idleAtTouch = useRef(false); // were controls hidden when this tap began?
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [chrome, setChrome] = useState(true); // controls visible
  const [isFull, setIsFull] = useState(false);
  const [shownId, setShownId] = useState<string | null>(null);
  const open = video !== null;
  // iPhone Safari has no element fullscreen; the overlay already fills the screen there.
  const canFull = useSyncExternalStore(noop, () => !!document.fullscreenEnabled, () => false);
  const playable = !!video?.src;

  // Reset per video during render (no effect needed).
  if ((video?.id ?? null) !== shownId) {
    setShownId(video?.id ?? null);
    setPlaying(false);
    setTime(0);
    setDuration(0);
    setEnded(false);
    setBuffering(false);
    setChrome(true);
  }

  const poke = useCallback(() => {
    setChrome(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (vidRef.current && !vidRef.current.paused) setChrome(false);
    }, HIDE_AFTER);
  }, []);

  const close = useCallback(() => {
    vidRef.current?.pause();
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    onClose();
  }, [onClose]);

  const toggleFull = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else el.requestFullscreen?.().catch(() => {});
  }, []);

  const togglePlay = useCallback(() => {
    const v = vidRef.current;
    if (!v || !playable) return;
    if (v.paused || v.ended) v.play().catch(() => {});
    else v.pause();
    poke();
  }, [playable, poke]);

  const seekBy = useCallback(
    (d: number) => {
      const v = vidRef.current;
      if (!v || !playable) return;
      v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + d));
      poke();
    },
    [playable, poke],
  );

  // On open: go fullscreen, lock page scroll, start playing.
  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    rootRef.current?.requestFullscreen?.().catch(() => {});
    rootRef.current?.focus();
    vidRef.current?.play().catch(() => {});
    return () => {
      document.documentElement.style.overflow = "";
      clearTimeout(hideTimer.current);
    };
  }, [open, video?.id]);

  useEffect(() => {
    const onFs = () => setIsFull(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // Keyboard: space/k play, ←/→ 10s, f fullscreen, m mute, Esc back.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === " " || k === "k") {
        e.preventDefault();
        togglePlay();
      } else if (k === "arrowright") seekBy(10);
      else if (k === "arrowleft") seekBy(-10);
      else if (k === "f") toggleFull();
      else if (k === "m") setMuted((m) => !m);
      else if (k === "escape" && !document.fullscreenElement) close();
      else return;
      poke();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, togglePlay, seekBy, toggleFull, close, poke]);

  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;
    v.muted = muted;
    v.volume = volume;
  }, [muted, volume, video?.id]);

  if (!video) return null;
  const remaining = duration - time;
  const pct = duration ? (time / duration) * 100 : 0;

  return (
    <div
      ref={rootRef}
      className={chrome || !playing ? "nplayer" : "nplayer is-idle"}
      role="dialog"
      aria-modal="true"
      aria-label={`Playing ${video.title}`}
      tabIndex={-1}
      onMouseMove={poke}
      onTouchStart={() => {
        idleAtTouch.current = !chrome && playing;
        poke();
      }}
    >
      {playable ? (
        <video
          key={video.id}
          ref={vidRef}
          className="nplayer__video"
          src={video.src}
          poster={video.poster}
          playsInline
          autoPlay
          onClick={(e) => {
            // Mouse: click toggles play. Touch: a tap shows the controls,
            // the next tap on the picture hides them again.
            if ((e.nativeEvent as PointerEvent).pointerType === "touch") {
              if (!idleAtTouch.current) {
                clearTimeout(hideTimer.current);
                setChrome(false);
              }
            } else togglePlay();
          }}
          onDoubleClick={toggleFull}
          onPlay={() => {
            setPlaying(true);
            setEnded(false);
            poke();
          }}
          onPause={() => {
            setPlaying(false);
            setChrome(true);
          }}
          onEnded={() => {
            setEnded(true);
            setChrome(true);
          }}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onDurationChange={(e) => setDuration(e.currentTarget.duration)}
          onWaiting={() => setBuffering(true)}
          onPlaying={() => setBuffering(false)}
          onCanPlay={() => setBuffering(false)}
        />
      ) : (
        <div className="nplayer__soon">
          <img src={video.poster} alt="" />
          <div>
            <span className="eyebrow accent">Coming soon</span>
            <p>This video drops on RVC soon. Members get it first.</p>
          </div>
        </div>
      )}

      {buffering && playing && <div className="nplayer__spinner" aria-hidden="true" />}

      <div className="nplayer__top">
        <button type="button" className="nplayer__btn" onClick={close} aria-label="Back to browse">
          <IconBack size={30} />
        </button>
        <div className="nplayer__now">
          <span className="eyebrow">Now playing</span>
          <span className="nplayer__title">{video.title}</span>
        </div>
      </div>

      {playable && (
        <div className="nplayer__center">
          <button type="button" className="nplayer__btn nplayer__skip" onClick={() => seekBy(-10)} aria-label="Back 10 seconds">
            <SkipIcon dir={-1} />
          </button>
          <button
            type="button"
            className="nplayer__btn nplayer__big"
            onClick={togglePlay}
            aria-label={ended ? "Replay" : playing ? "Pause" : "Play"}
          >
            {playing ? <IconPause size={44} /> : <IconPlay size={40} />}
          </button>
          <button type="button" className="nplayer__btn nplayer__skip" onClick={() => seekBy(10)} aria-label="Forward 10 seconds">
            <SkipIcon dir={1} />
          </button>
        </div>
      )}

      <div className="nplayer__bottom">
        {playable && (
          <div className="nplayer__scrub">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={time}
              aria-label="Seek"
              style={{ ["--pct" as string]: `${pct}%` }}
              onChange={(e) => {
                const v = vidRef.current;
                if (v) v.currentTime = Number(e.target.value);
                setTime(Number(e.target.value));
                poke();
              }}
            />
            <span className="nplayer__time">{fmt(remaining)}</span>
          </div>
        )}
        <div className="nplayer__bar">
          {playable && (
            <button type="button" className="nplayer__btn" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
              {playing ? <IconPause size={26} /> : <IconPlay size={22} />}
            </button>
          )}
          {playable && (
            <div className="nplayer__vol">
              <button
                type="button"
                className="nplayer__btn"
                onClick={() => setMuted((m) => !m)}
                aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
              >
                <SpeakerIcon off={muted || volume === 0} />
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                aria-label="Volume"
                style={{ ["--pct" as string]: `${(muted ? 0 : volume) * 100}%` }}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  setMuted(Number(e.target.value) === 0);
                }}
              />
            </div>
          )}
          <span className="nplayer__label">
            {video.title}
            <span className="nplayer__meta"> · {video.meta}</span>
          </span>
          {canFull && (
            <button
              type="button"
              className="nplayer__btn"
              onClick={toggleFull}
              aria-label={isFull ? "Exit full screen" : "Full screen"}
            >
              <FullIcon exit={isFull} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SkipIcon({ dir }: { dir: 1 | -1 }) {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g transform={dir === -1 ? "translate(24 0) scale(-1 1)" : undefined}>
        <path d="M20 12a8 8 0 1 1-2.34-5.66" />
        <path d="M20 4v4h-4" />
      </g>
      <text x="12" y="15.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="currentColor" stroke="none">
        10
      </text>
    </svg>
  );
}

export function SpeakerIcon({ off }: { off: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
      {off ? <path d="M17 9l5 6M22 9l-5 6" /> : <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />}
    </svg>
  );
}

function FullIcon({ exit }: { exit: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {exit ? (
        <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
      ) : (
        <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
      )}
    </svg>
  );
}
