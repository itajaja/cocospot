import { useCallback, useEffect, useRef } from "react";
import { useSyncedLyrics } from "../lyrics/useSyncedLyrics";
import { usePlayer } from "../spotify/PlayerProvider";

/** How long a manual scroll wins over the follow-along scrolling. */
const MANUAL_SCROLL_GRACE_MS = 5000;

function Message({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid h-full place-items-center px-6 text-center">
      <p className="text-lg font-bold text-zinc-500">{children}</p>
    </div>
  );
}

export default function Lyrics({
  playing,
  className = "",
}: {
  /** True when the player is on this album, so lyrics match what is audible. */
  playing: boolean;
  className?: string;
}) {
  const { seek } = usePlayer();
  const { status, lines, plain, activeIndex } = useSyncedLyrics(playing);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLElement | null)[]>([]);
  const lastManualScroll = useRef(0);

  const noteManualScroll = useCallback(() => {
    lastManualScroll.current = Date.now();
  }, []);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: 0 });
    lastManualScroll.current = 0;
  }, [lines]);

  useEffect(() => {
    if (activeIndex < 0) return;
    if (Date.now() - lastManualScroll.current < MANUAL_SCROLL_GRACE_MS) return;

    const scroller = scrollerRef.current;
    const line = lineRefs.current[activeIndex];
    if (!scroller || !line) return;

    // Scrolling the container directly, rather than scrollIntoView, keeps the
    // page itself still on phones.
    scroller.scrollTo({
      top: line.offsetTop - scroller.clientHeight / 2 + line.clientHeight / 2,
      behavior: "smooth",
    });
  }, [activeIndex]);

  const shell = `panel-fade relative overflow-y-auto overscroll-contain rounded-2xl bg-zinc-900/60 ${className}`;

  if (!playing) {
    return (
      <div className={shell}>
        <Message>Press play to sing along</Message>
      </div>
    );
  }

  let body: React.ReactNode;

  if (status === "loading") {
    body = <Message>Finding the words&hellip;</Message>;
  } else if (status === "instrumental") {
    body = <Message>No words in this one &mdash; just music!</Message>;
  } else if (status === "unavailable" || status === "idle") {
    body = <Message>No lyrics for this song yet</Message>;
  } else if (status === "error") {
    body = <Message>Couldn&rsquo;t load the lyrics. Check the connection.</Message>;
  } else if (status === "unsynced" && plain) {
    body = (
      <div className="px-6 py-10">
        <p className="mb-4 text-sm font-bold uppercase tracking-wide text-zinc-600">
          Not synced
        </p>
        {plain.map((text, index) => (
          <p key={index} className="text-xl font-bold leading-relaxed text-zinc-400">
            {text || " "}
          </p>
        ))}
      </div>
    );
  } else {
    body = (
      // Deep padding so the first and last lines can still sit mid-panel.
      <div className="space-y-3 px-4 py-[45%] sm:px-6 lg:py-[35%]">
        {lines.map((line, index) => {
          const isActive = index === activeIndex;
          const isPast = index < activeIndex;
          return (
            <button
              key={`${line.startMs}-${index}`}
              ref={(node) => {
                lineRefs.current[index] = node;
              }}
              onClick={() => void seek(line.startMs)}
              aria-current={isActive ? "true" : undefined}
              className={`block w-full rounded-xl px-3 py-1 text-left text-xl font-bold leading-snug transition-colors duration-300 sm:text-2xl ${
                isActive
                  ? "scale-[1.01] text-white"
                  : isPast
                    ? "text-zinc-600 hover:text-zinc-400"
                    : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {line.text || "♪"}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      ref={scrollerRef}
      onWheel={noteManualScroll}
      onTouchMove={noteManualScroll}
      className={shell}
    >
      {body}
    </div>
  );
}
