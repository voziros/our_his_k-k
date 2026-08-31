'use client';

/* oxlint-disable next/no-img-element -- local user photos need deliberate contain/crop behavior */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'framer-motion';
import {
  ArrowDown,
  ChevronRight,
  Expand,
  MapPin,
  Music2,
  Pause,
  Play,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { story, type GalleryImage, type StoryEvent } from '@/src/data/story';

const eventById = (id: string) => {
  const event = story.events.find((item) => item.id === id);
  if (!event) throw new Error(`Unknown story event: ${id}`);
  return event;
};

function playWithFade(
  audio: HTMLAudioElement,
  onPlaying: (playing: boolean) => void,
) {
  audio.volume = 0;
  void audio
    .play()
    .then(() => {
      onPlaying(true);
      const startedAt = performance.now();
      const tick = (time: number) => {
        const progress = Math.min((time - startedAt) / 2200, 1);
        audio.volume = progress * 0.22;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    })
    .catch(() => onPlaying(false));
}

function Reveal({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: reduceMotion ? 0 : 28,
        filter: reduceMotion ? 'none' : 'blur(7px)',
      }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{
        duration: reduceMotion ? 0 : 0.85,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function MemoryImage({
  src,
  alt,
  className = '',
  contain = false,
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  contain?: boolean;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`grid place-items-center bg-[#171719] p-6 text-center text-xs text-white/38 ${className}`}
      >
        <span>Это воспоминание пока осталось за кадром</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={`${contain ? 'object-contain' : 'object-cover'} ${className}`}
    />
  );
}

function ChapterMark({ event }: { event: StoryEvent }) {
  return (
    <div className="mb-7 flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/42">
      <span className="text-accent">{event.chapter}</span>
      <span className="h-px w-8 bg-white/15" />
      <span>{event.eyebrow}</span>
    </div>
  );
}

function EventCopy({ event }: { event: StoryEvent }) {
  return (
    <div>
      <ChapterMark event={event} />
      {event.date && (
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.28em] text-accent/90">
          {event.date}
        </p>
      )}
      <h2 className="text-[clamp(2.7rem,11vw,6.7rem)] font-light leading-[0.91] tracking-[-0.06em]">
        {event.title}
      </h2>
      <div className="mt-7 max-w-xl space-y-4 text-[15px] leading-7 text-white/57 sm:text-base">
        {event.text.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {event.quote && (
        <blockquote className="mt-9 max-w-xl border-l border-accent/45 pl-5 font-serif text-2xl italic leading-snug text-[#eee9df] sm:text-3xl">
          {event.quote}
        </blockquote>
      )}
    </div>
  );
}

function EditorialEvent({
  event,
  reverse = false,
}: {
  event: StoryEvent;
  reverse?: boolean;
}) {
  const media = (
    <div className="group relative overflow-hidden bg-[#151517] shadow-[0_28px_90px_rgb(0_0_0/45%)]">
      {event.image && (
        <MemoryImage
          src={event.image}
          alt={event.imageAlt ?? ''}
          contain={event.layout === 'map'}
          className={`${event.layout === 'map' ? 'aspect-[2.25/1]' : 'aspect-[3/4]'} w-full bg-[#0e0e0f] transition duration-700 group-hover:scale-[1.025]`}
        />
      )}
      {event.layout === 'map' && event.mapUrl && (
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/85 to-transparent px-5 pb-5 pt-12 text-[10px] uppercase tracking-[0.22em] text-white/80">
          Открыть место на карте
          <ChevronRight className="size-4 text-accent" aria-hidden="true" />
        </span>
      )}
    </div>
  );

  return (
    <section
      id={event.id}
      className="relative px-5 py-24 sm:px-8 lg:px-16 lg:py-36"
    >
      <div
        className={`mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}
      >
        <Reveal>
          <EventCopy event={event} />
        </Reveal>
        <Reveal className="relative">
          <div className="absolute -inset-7 -z-10 rounded-full bg-accent/7 blur-3xl" />
          {event.mapUrl ? (
            <a
              href={event.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-[1.7rem] border border-white/10 p-2 transition hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:p-3"
            >
              {media}
            </a>
          ) : (
            media
          )}
          {event.layout === 'map' && (
            <div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/36">
              <MapPin className="size-3.5 text-accent" aria-hidden="true" />
              {event.mediaCaption}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}

function AutoSlideshow({
  images,
  label,
}: {
  images: readonly GalleryImage[];
  label: string;
}) {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || images.length < 2) return;
    const timer = window.setInterval(
      () => setIndex((value) => (value + 1) % images.length),
      3600,
    );
    return () => window.clearInterval(timer);
  }, [images.length, reduceMotion]);

  const active = images[index];

  return (
    <div
      aria-label={label}
      className="relative -mx-5 h-[62svh] min-h-[480px] overflow-hidden bg-black sm:-mx-8 sm:h-[72svh] lg:-mx-16"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.figure
          key={active.src}
          initial={{ opacity: 0, x: reduceMotion ? 0 : '4%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: reduceMotion ? 0 : '-3%' }}
          transition={{
            duration: reduceMotion ? 0 : 1.05,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute inset-0"
        >
          <MemoryImage
            src={active.src}
            alt={active.alt}
            className="h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/38 via-transparent to-black/18" />
        </motion.figure>
      </AnimatePresence>
      <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center gap-2">
        {images.map((image, dotIndex) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setIndex(dotIndex)}
            className={`h-1 rounded-full transition-all ${dotIndex === index ? 'w-8 bg-accent' : 'w-3 bg-white/35 hover:bg-white/65'}`}
            aria-label={`Показать фотографию ${dotIndex + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function FullscreenPhotoEvent({ event }: { event: StoryEvent }) {
  return (
    <section
      id={event.id}
      className="relative isolate min-h-[100svh] overflow-hidden"
    >
      {event.image && (
        <>
          <MemoryImage
            src={event.image}
            alt=""
            className="absolute inset-0 -z-20 h-full w-full scale-110 blur-xl"
          />
          <MemoryImage
            src={event.image}
            alt={event.imageAlt ?? ''}
            contain
            className="absolute inset-0 -z-10 h-full w-full bg-black/20"
          />
        </>
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/20 to-black/35" />
      <div className="mx-auto flex min-h-[100svh] max-w-7xl items-end px-5 pb-14 pt-28 sm:px-8 lg:px-16 lg:pb-20">
        <Reveal className="max-w-3xl">
          <ChapterMark event={event} />
          {event.date && (
            <p className="mb-4 text-[11px] tracking-[0.28em] text-accent">
              {event.date}
            </p>
          )}
          <h2 className="text-[clamp(3.1rem,12vw,8.4rem)] font-light leading-[0.87] tracking-[-0.07em] text-white">
            {event.title}
          </h2>
          <p className="mt-7 max-w-xl text-[15px] leading-7 text-white/65 sm:text-base">
            {event.text[0]}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function ChapterTransition({
  chapter,
  label,
}: {
  chapter: string;
  label: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative grid min-h-52 place-items-center overflow-hidden border-y border-white/5 px-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgb(213_164_95/7%),transparent_58%)]" />
      <motion.div
        initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.7 }}
        transition={{ duration: reduceMotion ? 0 : 0.8 }}
        className="relative flex items-center gap-5"
      >
        <span className="font-serif text-5xl italic text-accent/75">
          {chapter}
        </span>
        <motion.span
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: reduceMotion ? 0 : 0.9, delay: 0.15 }}
          className="h-px w-12 origin-left bg-white/25 sm:w-24"
        />
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/38">
          {label}
        </span>
      </motion.div>
    </div>
  );
}

function BackgroundEvent({ event }: { event: StoryEvent }) {
  return (
    <section
      id={event.id}
      className="relative isolate min-h-[92svh] overflow-hidden"
    >
      {event.image ? (
        <MemoryImage
          src={event.image}
          alt={event.imageAlt ?? ''}
          className="absolute inset-0 -z-20 h-full w-full"
        />
      ) : (
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_80%_25%,rgb(213_164_95/12%),transparent_38%),#09090a]" />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/74 to-black/28" />
      <div className="mx-auto flex min-h-[92svh] max-w-7xl items-end px-5 pb-16 pt-28 sm:px-8 lg:px-16 lg:pb-24">
        <Reveal className="max-w-3xl">
          <EventCopy event={event} />
        </Reveal>
      </div>
    </section>
  );
}

function OfficialRelationshipEvent({ event }: { event: StoryEvent }) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id={event.id}
      className="relative isolate min-h-[100svh] overflow-hidden border-y border-white/7 px-5 py-24 sm:px-8 lg:px-16"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_45%,rgb(213_164_95/13%),transparent_38%)]" />
      <div className="mx-auto grid min-h-[calc(100svh-12rem)] max-w-7xl items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
        <Reveal>
          <ChapterMark event={event} />
          <h2 className="max-w-3xl text-[clamp(3rem,11vw,7rem)] font-light leading-[0.89] tracking-[-0.065em]">
            {event.title}
          </h2>
          <div className="mt-8 max-w-xl space-y-4 text-[15px] leading-7 text-white/58 sm:text-base">
            {event.text.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {event.quote && (
            <p className="mt-8 max-w-xl font-serif text-2xl italic leading-snug text-white sm:text-3xl">
              {event.quote}
            </p>
          )}
        </Reveal>
        <motion.div
          initial={{
            opacity: 0,
            scale: reduceMotion ? 1 : 0.82,
            filter: reduceMotion ? 'none' : 'blur(18px)',
          }}
          whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.55 }}
          transition={{
            duration: reduceMotion ? 0 : 1.15,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative text-center"
        >
          <span className="block text-[clamp(8rem,34vw,25rem)] font-extralight leading-[0.72] tracking-[-0.1em] text-accent">
            22
          </span>
          <span className="mt-5 block text-[11px] font-semibold uppercase tracking-[0.48em] text-white/62">
            октября 2025
          </span>
          <motion.span
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: reduceMotion ? 0 : 1.1, delay: 0.35 }}
            className="mx-auto mt-8 block h-px w-40 bg-gradient-to-r from-transparent via-accent to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}

function RelationshipCounter() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const values = useMemo(() => {
    const start = new Date(story.dates.relationship);
    const totalDays = Math.max(
      0,
      Math.floor((now.getTime() - start.getTime()) / 86_400_000),
    );
    let months =
      (now.getFullYear() - start.getFullYear()) * 12 +
      now.getMonth() -
      start.getMonth();
    if (now.getDate() < start.getDate()) months -= 1;
    return { totalDays, months: Math.max(0, months) };
  }, [now]);

  return (
    <section className="border-y border-white/7 px-5 py-28 text-center sm:px-8 lg:px-16 lg:py-40">
      <Reveal className="mx-auto max-w-5xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-accent">
          {story.counter.eyebrow}
        </p>
        <h2 className="mt-5 text-4xl font-light tracking-[-0.05em] sm:text-6xl">
          {story.counter.title}
        </h2>
        <div className="mt-14 grid grid-cols-2 gap-4">
          <div className="rounded-[1.6rem] border border-white/9 bg-white/[0.025] px-4 py-10">
            <strong className="block text-[clamp(3rem,15vw,8rem)] font-light leading-none tracking-[-0.08em] text-white">
              {values.totalDays}
            </strong>
            <span className="mt-4 block text-[10px] uppercase tracking-[0.26em] text-white/38">
              дней
            </span>
          </div>
          <div className="rounded-[1.6rem] border border-white/9 bg-white/[0.025] px-4 py-10">
            <strong className="block text-[clamp(3rem,15vw,8rem)] font-light leading-none tracking-[-0.08em] text-accent">
              {values.months}
            </strong>
            <span className="mt-4 block text-[10px] uppercase tracking-[0.26em] text-white/38">
              месяцев
            </span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function BirthdayLetter() {
  const event = eventById('kostya-birthday');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <>
      <section
        id={event.id}
        className="relative isolate min-h-[100svh] overflow-hidden"
      >
        {event.image && (
          <MemoryImage
            src={event.image}
            alt={event.imageAlt ?? ''}
            className="absolute inset-0 -z-20 h-full w-full"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/68 to-black/22" />
        <div className="mx-auto flex min-h-[100svh] max-w-7xl items-end px-5 pb-16 pt-28 sm:px-8 lg:px-16 lg:pb-24">
          <Reveal className="max-w-2xl">
            <EventCopy event={event} />
            <p className="mt-7 font-serif text-xl italic text-accent">
              {story.letter.quote}
            </p>
            <Button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-8 h-12 rounded-full bg-white px-6 text-black shadow-xl hover:bg-[#eee9df]"
            >
              <Expand className="size-4" aria-hidden="true" />
              Открыть письмо
            </Button>
          </Reveal>
        </div>
      </section>

      <AnimatePresence>
        {open && (
          <motion.dialog
            open
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] m-0 grid h-full max-h-none w-full max-w-none place-items-center overflow-y-auto border-0 bg-black/92 p-2 text-inherit backdrop-blur-lg sm:p-5"
            aria-label={story.letter.alt}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 20, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 15, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
              className="relative max-h-[96svh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#111112] p-2 sm:p-4"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="sticky right-3 top-3 z-10 ml-auto grid size-10 place-items-center rounded-full bg-black/70 text-white/70 backdrop-blur hover:text-white"
                aria-label="Закрыть письмо"
              >
                ×
              </button>
              <MemoryImage
                src={story.letter.image}
                alt={story.letter.alt}
                contain
                className="-mt-10 h-auto w-full rounded-xl bg-white"
              />
            </motion.div>
          </motion.dialog>
        )}
      </AnimatePresence>
    </>
  );
}

export function StoryExperience() {
  const storyStartRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [started, setStarted] = useState(false);
  const [secretOpen, setSecretOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [activeTrackKey, setActiveTrackKey] = useState<'intro' | 'disco'>(
    'intro',
  );
  const [nextOpen, setNextOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    restDelta: 0.001,
  });
  const activeTrack = story.soundtrack[activeTrackKey];
  const hasSoundtrack = Boolean(
    story.soundtrack.intro.file || story.soundtrack.disco.file,
  );

  useEffect(() => {
    const updateTrack = () => {
      const discoSection = document.getElementById('disco');
      if (!discoSection) return;
      const switchPoint = discoSection.offsetTop - window.innerHeight * 0.58;
      setActiveTrackKey(window.scrollY >= switchPoint ? 'disco' : 'intro');
    };
    updateTrack();
    window.addEventListener('scroll', updateTrack, { passive: true });
    window.addEventListener('resize', updateTrack);
    return () => {
      window.removeEventListener('scroll', updateTrack);
      window.removeEventListener('resize', updateTrack);
    };
  }, []);

  useEffect(() => {
    if (!started || !activeTrack.file) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    const timeout = window.setTimeout(
      () => playWithFade(audio, setAudioPlaying),
      80,
    );
    return () => window.clearTimeout(timeout);
  }, [activeTrack.file, started]);

  const startStory = () => {
    setStarted(true);
    storyStartRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
    window.setTimeout(
      () => void videoRef.current?.play().catch(() => undefined),
      reduceMotion ? 0 : 650,
    );
  };

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play().then(() => setAudioPlaying(true));
    } else {
      audio.pause();
      setAudioPlaying(false);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  };

  const firstMeeting = eventById('first-meeting');
  const birthday = eventById('birthday');
  const october = eventById('october');
  const official = eventById('official');
  const disco = eventById('disco');
  const finalBell = eventById('final-bell');

  return (
    <main className="min-h-screen overflow-x-clip bg-background text-foreground">
      <motion.div
        className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-accent"
        style={{ scaleX: smoothProgress }}
      />

      {hasSoundtrack && (
        <audio
          ref={audioRef}
          src={activeTrack.file ?? undefined}
          preload="auto"
          loop
          onEnded={() => setAudioPlaying(false)}
        >
          <track
            kind="captions"
            src="/captions/song.vtt"
            srcLang="ru"
            label="Описание аудио"
          />
        </audio>
      )}

      <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden px-5 pb-8 pt-24 sm:px-8 sm:pb-10 lg:items-center lg:px-16">
        <div className="hero-glow absolute inset-0 -z-20" />
        <motion.div
          aria-hidden="true"
          className="absolute -right-24 top-[18%] -z-10 h-80 w-80 rounded-full border border-white/8"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
        />
        <div className="mx-auto grid w-full max-w-7xl gap-16 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="mb-8 text-[11px] font-medium uppercase tracking-[0.38em] text-white/48"
            >
              {story.hero.since}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, filter: 'blur(12px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.4, delay: 0.35 }}
              className="max-w-5xl text-[clamp(3.5rem,17vw,9rem)] font-light leading-[0.79] tracking-[-0.075em] text-white"
            >
              {story.people.first.toUpperCase()}
              <span className="block font-serif italic text-accent">
                &amp; {story.people.second.toUpperCase()}
              </span>
            </motion.h1>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="border-l border-white/12 pl-5 lg:mb-2 lg:pl-8"
          >
            <p className="mb-6 max-w-sm text-base leading-relaxed text-white/56">
              {story.hero.lead}
            </p>
            <Button
              type="button"
              onClick={startStory}
              className="h-14 w-full justify-between rounded-full border border-white/18 bg-white px-6 text-[13px] font-medium text-black hover:bg-[#eee9df] sm:w-auto sm:min-w-72"
            >
              {started ? 'Продолжить историю' : story.hero.button}
              <ArrowDown className="size-4" aria-hidden="true" />
            </Button>
          </motion.div>
        </div>
        <div className="absolute left-5 top-7 flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-white/38 sm:left-8 lg:left-16">
          <span className="inline-block size-1.5 rounded-full bg-accent shadow-[0_0_18px_var(--accent)]" />
          {story.hero.kicker}
        </div>
      </section>

      <section
        ref={storyStartRef}
        id="story-start"
        className="relative isolate min-h-[100svh] scroll-mt-0 overflow-hidden border-t border-white/7"
      >
        <video
          ref={videoRef}
          src={story.intro.video}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          aria-label={story.intro.videoAlt}
        >
          <track
            kind="captions"
            src="/captions/daivinchik.vtt"
            srcLang="ru"
            label="Русские субтитры"
            default
          />
        </video>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/74 to-black/32" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/72 via-transparent to-black/28" />
        <div className="mx-auto flex min-h-[100svh] max-w-7xl items-end px-5 pb-16 pt-28 sm:px-8 lg:px-16 lg:pb-24">
          <div>
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.34em] text-accent">
              {story.intro.chapter} · {story.intro.date}
            </p>
            <h2 className="max-w-xl text-5xl font-light leading-[0.96] tracking-[-0.055em] sm:text-7xl">
              {story.intro.title}
            </h2>
            <p className="mt-7 max-w-lg text-[15px] leading-7 text-white/68 sm:text-base">
              {story.intro.text}
            </p>
            <blockquote className="mt-10 border-l border-accent/50 pl-5 font-serif text-2xl italic leading-snug text-[#eee9df] sm:text-3xl">
              {story.intro.after}
            </blockquote>
            <button
              type="button"
              onClick={() => setSecretOpen((value) => !value)}
              className="mt-9 flex items-center gap-2 text-[9px] uppercase tracking-[0.24em] text-white/24 transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Sparkles className="size-3" aria-hidden="true" />
              {secretOpen ? 'Закрыть секрет' : 'Открыть секрет первой недели'}
            </button>
            <AnimatePresence>
              {secretOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 rounded-2xl border border-accent/20 bg-accent/[0.045] p-5">
                    <p className="text-[9px] font-semibold tracking-[0.26em] text-accent">
                      {story.intro.secret.label}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-white/55">
                      {story.intro.secret.text}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <ChapterTransition chapter="02" label="Первая встреча" />
      <EditorialEvent event={firstMeeting} />

      <section className="overflow-hidden px-5 py-24 sm:px-8 lg:px-16 lg:py-36">
        <Reveal className="mx-auto max-w-7xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-accent">
            {story.summer.eyebrow}
          </p>
          <h2 className="mt-5 max-w-4xl text-[clamp(2.9rem,11vw,7rem)] font-light leading-[0.91] tracking-[-0.065em]">
            {story.summer.title}
          </h2>
          <p className="mt-7 max-w-xl text-[15px] leading-7 text-white/55 sm:text-base">
            {story.summer.text}
          </p>
        </Reveal>
        <div className="mx-auto mt-12 max-w-7xl">
          <AutoSlideshow
            images={story.gallery.slice(0, 6)}
            label={story.summer.galleryLabel}
          />
        </div>
      </section>

      <ChapterTransition chapter="03" label="Твой день рождения" />
      <BackgroundEvent event={birthday} />
      <ChapterTransition chapter="04" label="Октябрь" />
      <BackgroundEvent event={october} />
      <ChapterTransition chapter="05" label="22 октября" />
      <OfficialRelationshipEvent event={official} />
      <ChapterTransition chapter="06" label="Первый медленный танец" />
      <FullscreenPhotoEvent event={disco} />

      <ChapterTransition chapter="07" label="Сближение" />
      <section className="overflow-hidden px-5 py-24 sm:px-8 lg:px-16 lg:py-36">
        <Reveal className="mx-auto max-w-7xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-accent">
            {story.everyday.chapter} · {story.everyday.eyebrow}
          </p>
          <h2 className="mt-5 max-w-4xl text-[clamp(3rem,12vw,7.5rem)] font-light leading-[0.89] tracking-[-0.065em]">
            {story.everyday.title}
          </h2>
          <p className="mt-7 max-w-xl text-[15px] leading-7 text-white/55 sm:text-base">
            {story.everyday.text}
          </p>
        </Reveal>
        <div className="mx-auto mt-12 max-w-7xl">
          <AutoSlideshow
            images={story.gallery.slice(4)}
            label={story.everyday.galleryLabel}
          />
        </div>
      </section>

      <ChapterTransition chapter="08" label="Мой день рождения" />
      <BirthdayLetter />
      <ChapterTransition chapter="09" label="Твой последний звонок" />
      <FullscreenPhotoEvent event={finalBell} />

      <section className="px-5 py-24 sm:px-8 lg:px-16 lg:py-36">
        <Reveal className="mx-auto max-w-7xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-accent">
            {story.littleThingsSection.eyebrow}
          </p>
          <h2 className="mt-5 max-w-4xl text-[clamp(3rem,12vw,7.5rem)] font-light leading-[0.89] tracking-[-0.065em]">
            {story.littleThingsSection.title}
          </h2>
          <div className="mt-14 grid gap-3 sm:grid-cols-3">
            {story.littleThings.map((thing) => (
              <article
                key={thing.index}
                className="group min-h-56 rounded-[1.6rem] border border-white/8 bg-white/[0.025] p-6 transition hover:border-accent/30 hover:bg-accent/[0.035]"
              >
                <span className="text-[10px] tracking-[0.25em] text-accent">
                  {thing.index}
                </span>
                <h3 className="mt-12 font-serif text-3xl italic text-white">
                  {thing.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-white/47">
                  {thing.text}
                </p>
              </article>
            ))}
          </div>
        </Reveal>
      </section>

      <RelationshipCounter />

      <section className="relative isolate min-h-[100svh] overflow-hidden px-5 py-24 sm:px-8 lg:px-16 lg:py-36">
        <div className="absolute inset-0 -z-20 opacity-18">
          <MemoryImage
            src={story.final.image}
            alt=""
            className="h-full w-full scale-110 blur-2xl"
          />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background/90 to-black" />
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-accent">
              {story.final.eyebrow}
            </p>
            <h2 className="mt-6 max-w-5xl text-[clamp(3.2rem,13vw,8.7rem)] font-light leading-[0.87] tracking-[-0.07em]">
              {story.final.title}
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <Reveal>
              <div className="overflow-hidden rounded-[1.7rem] border border-white/10 bg-black p-2">
                <MemoryImage
                  src={story.final.image}
                  alt={story.final.imageAlt}
                  contain
                  className="aspect-[4/3] w-full rounded-[1.25rem]"
                />
              </div>
            </Reveal>
            <Reveal className="space-y-5 text-lg leading-8 text-white/66 sm:text-xl sm:leading-9">
              {story.final.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <div className="pt-7">
                <p className="font-serif text-3xl italic text-white sm:text-4xl">
                  {story.final.signature}
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.24em] text-accent">
                  {story.final.author}
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setNextOpen((value) => !value)}
                variant="outline"
                className="mt-8 h-12 rounded-full border-white/14 bg-transparent px-6 text-white hover:bg-white/8"
              >
                {story.final.nextQuestion}
                <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
              <AnimatePresence>
                {nextOpen && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="font-serif text-4xl italic text-accent sm:text-5xl"
                  >
                    {story.final.nextAnswer}
                  </motion.p>
                )}
              </AnimatePresence>
            </Reveal>
          </div>
        </div>
      </section>

      <footer className="flex items-center justify-between border-t border-white/7 px-5 py-7 text-[9px] uppercase tracking-[0.22em] text-white/27 sm:px-8 lg:px-16">
        <span>{story.footer.timeline}</span>
        <span>{story.footer.note}</span>
      </footer>

      {hasSoundtrack && activeTrack.file && started && (
        <div className="fixed left-3 top-4 z-40 flex max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-2xl border border-white/12 bg-black/72 p-2 pr-3 shadow-2xl backdrop-blur-md sm:left-5 sm:top-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/14 text-accent">
            <Music2 className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 pr-1">
            <p className="truncate text-xs font-medium text-white">
              {activeTrack.title}
            </p>
            <p className="truncate text-[9px] uppercase tracking-[0.14em] text-white/40">
              {activeTrack.artist}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleAudio}
            className="grid size-9 place-items-center rounded-full text-white/65 hover:bg-white/8 hover:text-white"
            aria-label={
              audioPlaying ? 'Поставить музыку на паузу' : 'Включить музыку'
            }
          >
            {audioPlaying ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            className="grid size-9 place-items-center rounded-full text-white/65 hover:bg-white/8 hover:text-white"
            aria-label={muted ? 'Включить звук' : 'Выключить звук'}
          >
            {muted ? (
              <VolumeX className="size-4" />
            ) : (
              <Volume2 className="size-4" />
            )}
          </button>
        </div>
      )}
    </main>
  );
}
