'use client';

/* oxlint-disable next/no-img-element -- local user photos need deliberate crop behavior */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Expand,
  MapPin,
  Music2,
  Pause,
  Play,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';

import { story, type GalleryImage, type StoryEvent } from '@/src/data/story';

const eventById = (id: string) => {
  const event = story.events.find((item) => item.id === id);
  if (!event) throw new Error(`Unknown story event: ${id}`);
  return event;
};

const slideIds = [
  'cover',
  'beginning',
  'first-meeting',
  'summer',
  'birthday',
  'october',
  'official',
  'disco',
  'closer',
  'kostya-birthday',
  'final-bell',
  'compliments',
  'counter',
  'final',
] as const;

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
        className={`grid place-items-center bg-[#111113] p-6 text-center text-xs text-white/38 ${className}`}
      >
        Это воспоминание пока осталось за кадром
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
        const progress = Math.min((time - startedAt) / 1600, 1);
        audio.volume = progress * 0.24;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    })
    .catch(() => onPlaying(false));
}

function Background({
  image,
  alt = '',
  contain = false,
  children,
  dim = 'bg-gradient-to-r from-black via-black/66 to-black/22',
}: {
  image?: string;
  alt?: string;
  contain?: boolean;
  children: ReactNode;
  dim?: string;
}) {
  return (
    <section className="relative isolate h-full overflow-hidden">
      {image ? (
        <>
          {contain && (
            <MemoryImage
              src={image}
              alt=""
              eager
              className="absolute inset-0 -z-30 h-full w-full scale-110 blur-2xl"
            />
          )}
          <MemoryImage
            src={image}
            alt={alt}
            contain={contain}
            eager
            className="absolute inset-0 -z-20 h-full w-full"
          />
        </>
      ) : (
        <div className="hero-glow absolute inset-0 -z-20" />
      )}
      <div className={`absolute inset-0 -z-10 ${dim}`} />
      {children}
    </section>
  );
}

function EventCopy({
  event,
  compact = false,
}: {
  event: StoryEvent;
  compact?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      {event.date && (
        <p className="mb-2 text-[9px] uppercase tracking-[0.25em] text-accent sm:mb-4 sm:text-[11px]">
          {event.date}
        </p>
      )}
      <h2
        className={`${
          compact
            ? 'text-[clamp(2.15rem,8.5vw,6rem)]'
            : 'text-[clamp(2.55rem,11vw,7.5rem)]'
        } font-light leading-[0.88] tracking-[-0.065em] text-white`}
      >
        {event.title}
      </h2>
      {event.text.length > 0 && (
        <div className="mt-4 max-w-xl space-y-2 text-[12px] leading-5 text-white/66 sm:mt-7 sm:space-y-3 sm:text-base sm:leading-7">
          {event.text.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      )}
      {event.quote && (
        <blockquote className="mt-4 max-w-xl border-l border-accent/55 pl-4 font-serif text-lg italic leading-snug text-white sm:mt-7 sm:text-3xl">
          {event.quote}
        </blockquote>
      )}
    </div>
  );
}

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const formatDate = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
      .filter(Boolean)
      .join('.');
  };

  const submit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (value === story.access.code) {
      setError(false);
      onUnlock();
      return;
    }
    setError(true);
    setAttempt((current) => current + 1);
  };

  return (
    <motion.section
      key="gate"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: 'blur(12px)' }}
      transition={{ duration: 0.7 }}
      className="hero-glow relative grid h-[100svh] place-items-center overflow-hidden px-5"
    >
      <div className="absolute left-5 top-6 flex items-center gap-3 text-[9px] uppercase tracking-[0.25em] text-white/35 sm:left-8 sm:top-8">
        <span className="size-1.5 rounded-full bg-accent shadow-[0_0_16px_var(--accent)]" />
        Только для нас
      </div>
      <motion.form
        key={attempt}
        onSubmit={submit}
        animate={error ? { x: [0, -12, 10, -6, 0] } : undefined}
        transition={{ duration: 0.42 }}
        className="w-full max-w-xl text-center"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-accent">
          Пароль
        </p>
        <h1 className="mt-5 text-[clamp(2.5rem,11vw,5.5rem)] font-light leading-[0.94] tracking-[-0.06em]">
          {story.access.prompt}
        </h1>
        <label htmlFor="story-code" className="sr-only">
          Дата знакомства
        </label>
        <input
          id="story-code"
          value={value}
          onChange={(event) => {
            setValue(formatDate(event.target.value));
            setError(false);
          }}
          inputMode="numeric"
          autoComplete="off"
          maxLength={10}
          placeholder={story.access.hint}
          className="mt-9 h-16 w-full border-x-0 border-b border-t-0 border-white/18 bg-transparent px-2 text-center text-3xl font-light tracking-[0.16em] text-white outline-none transition placeholder:text-white/18 focus:border-accent sm:h-20 sm:text-5xl"
        />
        <p
          aria-live="polite"
          className={`mt-4 min-h-5 text-xs transition ${error ? 'text-[#d8a08f]' : 'text-white/28'}`}
        >
          {error ? story.access.error : 'Та самая дата, с которой всё началось'}
        </p>
        <button
          type="submit"
          className="mx-auto mt-7 flex h-13 items-center gap-4 rounded-full bg-white px-7 text-sm font-medium text-black transition hover:bg-[#ece7dc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {story.access.button}
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </motion.form>
    </motion.section>
  );
}

function CoverSlide({ onStart }: { onStart: () => void }) {
  return (
    <section className="hero-glow relative flex h-full items-end overflow-hidden px-5 pb-20 pt-20 sm:px-10 sm:pb-24 lg:items-center lg:px-20">
      <motion.div
        aria-hidden="true"
        className="absolute -right-24 top-[15%] size-80 rounded-full border border-white/8"
        animate={{ rotate: 360 }}
        transition={{ duration: 42, repeat: Infinity, ease: 'linear' }}
      />
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1fr_0.68fr] lg:items-end">
        <div>
          <p className="mb-6 text-[9px] uppercase tracking-[0.36em] text-white/45 sm:text-[11px]">
            {story.hero.since}
          </p>
          <h1 className="text-[clamp(3.5rem,18vw,10rem)] font-light leading-[0.78] tracking-[-0.08em]">
            {story.people.first.toUpperCase()}
            <span className="block font-serif italic text-accent">
              &amp; {story.people.second.toUpperCase()}
            </span>
          </h1>
        </div>
        <div className="border-l border-white/14 pl-5 lg:pl-8">
          <p className="max-w-sm text-sm leading-6 text-white/58 sm:text-base sm:leading-7">
            {story.hero.lead}
          </p>
          <button
            type="button"
            onClick={onStart}
            className="mt-6 flex h-13 w-full items-center justify-between rounded-full bg-white px-6 text-sm font-medium text-black transition hover:bg-[#ece7dc] sm:w-72"
          >
            {story.hero.button}
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

function BeginningSlide() {
  return (
    <section className="relative isolate h-full overflow-hidden">
      <video
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
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/72 to-black/28" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/68 via-transparent to-black/22" />
      <div className="mx-auto flex h-full max-w-7xl items-end px-5 pb-24 pt-20 sm:px-10 sm:pb-28 lg:px-20">
        <div className="max-w-2xl">
          <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.3em] text-accent">
            {story.intro.date}
          </p>
          <h2 className="text-[clamp(2.7rem,11vw,7rem)] font-light leading-[0.88] tracking-[-0.065em]">
            {story.intro.title}
          </h2>
          <p className="mt-4 max-w-lg text-[12px] leading-5 text-white/68 sm:mt-7 sm:text-base sm:leading-7">
            {story.intro.text}
          </p>
          <blockquote className="mt-4 border-l border-accent/55 pl-4 font-serif text-lg italic text-white sm:mt-7 sm:text-3xl">
            {story.intro.after}
          </blockquote>
        </div>
      </div>
    </section>
  );
}

function FirstMeetingSlide() {
  const event = eventById('first-meeting');

  return (
    <section className="hero-glow h-full overflow-hidden px-5 pb-20 pt-16 sm:px-10 sm:pb-24 sm:pt-20 lg:px-20">
      <div className="mx-auto grid h-full max-w-7xl gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14">
        <EventCopy event={event} compact />
        {event.mapUrl ? (
          <a
            href={event.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="group relative block h-[28svh] min-h-44 overflow-hidden rounded-2xl border border-white/12 bg-black transition hover:border-accent/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:h-[38svh] lg:h-[56svh]"
          >
            <MemoryImage
              src={event.image ?? ''}
              alt={event.imageAlt ?? ''}
              contain
              eager
              className="h-full w-full transition duration-700 group-hover:scale-[1.025]"
            />
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/90 to-transparent px-4 pb-4 pt-12 text-[9px] uppercase tracking-[0.2em] text-white/82">
              <span className="flex items-center gap-2">
                <MapPin className="size-3.5 text-accent" aria-hidden="true" />
                Открыть место на карте
              </span>
              <ChevronRight className="size-4 text-accent" aria-hidden="true" />
            </span>
          </a>
        ) : null}
      </div>
    </section>
  );
}

function AutoPhotoSlide({
  images,
  title,
  text,
}: {
  images: readonly GalleryImage[];
  title: string;
  text?: string;
}) {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || images.length < 2) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % images.length),
      3300,
    );
    return () => window.clearInterval(timer);
  }, [images.length, reduceMotion]);

  const active = images[index];

  return (
    <section className="relative isolate h-full overflow-hidden bg-black">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={active.src}
          initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.035 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 1 }}
          className="absolute inset-0 -z-20"
        >
          <MemoryImage
            src={active.src}
            alt={active.alt}
            eager
            className="h-full w-full"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/78 via-black/8 to-black/34" />
      <div className="flex h-full items-end px-5 pb-24 pt-20 sm:px-10 sm:pb-28 lg:px-20">
        <div className="max-w-3xl">
          <h2 className="text-[clamp(2.8rem,12vw,7.5rem)] font-light leading-[0.87] tracking-[-0.07em]">
            {title}
          </h2>
          {text && (
            <p className="mt-4 max-w-lg text-xs leading-5 text-white/66 sm:mt-6 sm:text-base sm:leading-7">
              {text}
            </p>
          )}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-16 flex justify-center gap-1.5 sm:bottom-20">
        {images.map((image, dotIndex) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setIndex(dotIndex)}
            aria-label={`Показать фотографию ${dotIndex + 1}`}
            className={`h-1 rounded-full transition-all ${
              dotIndex === index ? 'w-7 bg-accent' : 'w-2.5 bg-white/42'
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function CinematicEventSlide({
  event,
  contain = false,
}: {
  event: StoryEvent;
  contain?: boolean;
}) {
  if (event.video) {
    return (
      <section className="relative isolate h-full overflow-hidden">
        <video
          src={event.video}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          aria-label={event.imageAlt ?? event.title}
        >
          <track
            kind="captions"
            src="/captions/her-birthday.vtt"
            srcLang="ru"
            label="Русские субтитры"
          />
        </video>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/68 to-black/20" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/72 via-transparent to-black/20" />
        <div className="mx-auto flex h-full max-w-7xl items-end px-5 pb-24 pt-20 sm:px-10 sm:pb-28 lg:px-20">
          <EventCopy event={event} />
        </div>
      </section>
    );
  }

  return (
    <Background image={event.image} alt={event.imageAlt} contain={contain}>
      <div className="mx-auto flex h-full max-w-7xl items-end px-5 pb-24 pt-20 sm:px-10 sm:pb-28 lg:px-20">
        <EventCopy event={event} />
      </div>
    </Background>
  );
}

function OfficialSlide() {
  const event = eventById('official');

  return (
    <section className="hero-glow h-full overflow-hidden px-5 pb-20 pt-16 sm:px-10 sm:pb-24 sm:pt-20 lg:px-20">
      <div className="mx-auto grid h-full max-w-7xl items-center gap-3 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <EventCopy event={event} compact />
        <motion.div
          initial={{ opacity: 0, scale: 0.84, filter: 'blur(18px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <span className="block text-[clamp(6rem,29vw,22rem)] font-extralight leading-[0.68] tracking-[-0.11em] text-accent">
            22
          </span>
          <span className="mt-3 block text-[9px] font-semibold uppercase tracking-[0.42em] text-white/62 sm:mt-6 sm:text-[11px]">
            октября 2025
          </span>
        </motion.div>
      </div>
    </section>
  );
}

function LetterDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.dialog
          open
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] m-0 grid h-full max-h-none w-full max-w-none place-items-center overflow-y-auto border-0 bg-black/94 p-2 text-inherit backdrop-blur-xl sm:p-5"
          aria-label={story.letter.alt}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 24, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 12, scale: 0.98 }}
            onClick={(event) => event.stopPropagation()}
            className="relative max-h-[96svh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[#111112] p-2 sm:p-4"
          >
            <button
              type="button"
              onClick={onClose}
              className="sticky right-3 top-3 z-10 ml-auto grid size-10 place-items-center rounded-full bg-black/75 text-white/72"
              aria-label="Закрыть письмо"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
            <MemoryImage
              src={story.letter.image}
              alt={story.letter.alt}
              contain
              eager
              className="-mt-10 h-auto w-full rounded-xl bg-white"
            />
          </motion.div>
        </motion.dialog>
      )}
    </AnimatePresence>
  );
}

function KostyaBirthdaySlide() {
  const event = eventById('kostya-birthday');
  const [letterOpen, setLetterOpen] = useState(false);
  const closeLetter = useCallback(() => setLetterOpen(false), []);

  return (
    <>
      <Background image={event.image} alt={event.imageAlt}>
        <div className="mx-auto flex h-full max-w-7xl items-end px-5 pb-24 pt-20 sm:px-10 sm:pb-28 lg:px-20">
          <div>
            <EventCopy event={event} />
            <button
              type="button"
              onClick={() => setLetterOpen(true)}
              className="mt-5 flex h-11 items-center gap-3 rounded-full bg-white px-5 text-xs font-medium text-black transition hover:bg-[#ece7dc] sm:mt-7 sm:h-12 sm:text-sm"
            >
              <Expand className="size-4" aria-hidden="true" />
              Открыть письмо
            </button>
          </div>
        </div>
      </Background>
      <LetterDialog open={letterOpen} onClose={closeLetter} />
    </>
  );
}

function ComplimentsSlide() {
  const paths = [
    {
      x: ['4vw', '40vw', '18vw', '44vw', '4vw'],
      y: ['10vh', '18vh', '68vh', '48vh', '10vh'],
    },
    {
      x: ['42vw', '14vw', '46vw', '28vw', '42vw'],
      y: ['12vh', '56vh', '72vh', '22vh', '12vh'],
    },
    {
      x: ['18vw', '44vw', '38vw', '6vw', '18vw'],
      y: ['72vh', '56vh', '8vh', '34vh', '72vh'],
    },
    {
      x: ['44vw', '38vw', '8vw', '46vw', '44vw'],
      y: ['68vh', '12vh', '62vh', '38vh', '68vh'],
    },
    {
      x: ['34vw', '6vw', '44vw', '40vw', '34vw'],
      y: ['8vh', '44vh', '22vh', '74vh', '8vh'],
    },
    {
      x: ['8vw', '42vw', '46vw', '22vw', '8vw'],
      y: ['48vh', '72vh', '16vh', '24vh', '48vh'],
    },
    {
      x: ['40vw', '46vw', '12vw', '44vw', '40vw'],
      y: ['74vh', '34vh', '16vh', '58vh', '74vh'],
    },
    {
      x: ['46vw', '28vw', '4vw', '42vw', '46vw'],
      y: ['32vh', '70vh', '26vh', '10vh', '32vh'],
    },
  ];

  return (
    <section className="hero-glow relative h-full overflow-hidden px-5 pb-20 pt-16 sm:px-10 sm:pb-24 lg:px-20">
      {story.compliments.map((compliment, index) => {
        const path = paths[index % paths.length];
        return (
          <motion.span
            key={compliment}
            initial={{ opacity: 0, x: path.x[0], y: path.y[0] }}
            animate={{
              opacity: [0.55, 0.92, 0.72, 0.88, 0.55],
              x: path.x,
              y: path.y,
            }}
            transition={{
              duration: 24 + (index % 6) * 2.5,
              delay: -(index * 2.1),
              repeat: Infinity,
              ease: 'linear',
            }}
            className="pointer-events-none absolute left-0 top-0 max-w-[48vw] rounded-2xl border border-white/10 bg-black/58 px-3 py-1.5 text-center font-serif text-xs italic leading-snug text-white/82 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm will-change-transform sm:max-w-sm sm:rounded-full sm:px-4 sm:py-2 sm:text-xl"
          >
            {compliment}
          </motion.span>
        );
      })}
      <div className="relative z-10 mx-auto grid h-full max-w-5xl place-items-center text-center">
        <div className="rounded-[2rem] border border-white/8 bg-black/64 px-5 py-7 shadow-2xl backdrop-blur-md sm:px-12 sm:py-10">
          <h2 className="text-[clamp(2.8rem,11vw,7rem)] font-light leading-[0.88] tracking-[-0.065em]">
            {story.complimentsSection.title}
          </h2>
          <p className="mx-auto mt-5 max-w-lg font-serif text-lg italic text-accent sm:text-2xl">
            {story.complimentsSection.text}
          </p>
        </div>
      </div>
    </section>
  );
}

function CounterSlide() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const values = useMemo(() => {
    const start = new Date(story.dates.relationship).getTime();
    const totalSeconds = Math.max(0, Math.floor((now - start) / 1000));
    return {
      days: Math.floor(totalSeconds / 86_400),
      hours: Math.floor((totalSeconds % 86_400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    };
  }, [now]);

  return (
    <section className="hero-glow grid h-full place-items-center overflow-hidden px-5 pb-20 pt-16 sm:px-10 sm:pb-24 lg:px-20">
      <div className="w-full max-w-5xl text-center">
        <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-accent">
          {story.counter.eyebrow}
        </p>
        <h2 className="mt-4 text-3xl font-light tracking-[-0.05em] sm:text-6xl">
          {story.counter.title}
        </h2>
        <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-3xl border border-white/9 bg-white/[0.025] px-3 py-8 sm:py-12">
            <strong className="block text-[clamp(3.5rem,16vw,8rem)] font-light leading-none tracking-[-0.08em]">
              {values.days}
            </strong>
            <span className="mt-3 block text-[9px] uppercase tracking-[0.25em] text-white/38">
              дней
            </span>
          </div>
          <div className="rounded-3xl border border-white/9 bg-white/[0.025] px-3 py-8 sm:py-12">
            <strong className="block text-[clamp(3.5rem,16vw,7rem)] font-light leading-none tracking-[-0.08em] text-accent">
              {String(values.hours).padStart(2, '0')}
            </strong>
            <span className="mt-3 block text-[9px] uppercase tracking-[0.25em] text-white/38">
              часов
            </span>
          </div>
          <div className="rounded-3xl border border-white/9 bg-white/[0.025] px-3 py-8 sm:py-12">
            <strong className="block text-[clamp(3.5rem,16vw,7rem)] font-light leading-none tracking-[-0.08em]">
              {String(values.minutes).padStart(2, '0')}
            </strong>
            <span className="mt-3 block text-[9px] uppercase tracking-[0.25em] text-white/38">
              минут
            </span>
          </div>
          <div className="rounded-3xl border border-white/9 bg-white/[0.025] px-3 py-8 sm:py-12">
            <strong className="block text-[clamp(3.5rem,16vw,7rem)] font-light leading-none tracking-[-0.08em] text-accent">
              {String(values.seconds).padStart(2, '0')}
            </strong>
            <span className="mt-3 block text-[9px] uppercase tracking-[0.25em] text-white/38">
              секунд
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalSlide() {
  return (
    <Background image={story.final.image} alt={story.final.imageAlt} contain>
      <div className="mx-auto flex h-full max-w-7xl items-end px-5 pb-20 pt-16 sm:px-10 sm:pb-24 lg:px-20">
        <div className="max-w-3xl">
          <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-accent">
            {story.final.eyebrow}
          </p>
          <h2 className="mt-3 text-[clamp(2.55rem,10vw,7rem)] font-light leading-[0.88] tracking-[-0.065em]">
            {story.final.title}
          </h2>
          <div className="mt-4 max-w-2xl space-y-2 text-[11px] leading-4 text-white/68 sm:mt-7 sm:space-y-3 sm:text-base sm:leading-7">
            {story.final.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-4 sm:mt-7">
            <div>
              <p className="font-serif text-xl italic text-white sm:text-4xl">
                {story.final.signature}
              </p>
              <p className="mt-1 text-[8px] uppercase tracking-[0.22em] text-accent">
                {story.final.author}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
}

function renderSlide(index: number, onStart: () => void) {
  const birthday = eventById('birthday');
  const october = eventById('october');
  const disco = eventById('disco');
  const finalBell = eventById('final-bell');

  switch (slideIds[index]) {
    case 'cover':
      return <CoverSlide onStart={onStart} />;
    case 'beginning':
      return <BeginningSlide />;
    case 'first-meeting':
      return <FirstMeetingSlide />;
    case 'summer':
      return (
        <AutoPhotoSlide
          images={story.gallery.slice(0, 7)}
          title={story.summer.title}
          text={story.summer.text}
        />
      );
    case 'birthday':
      return <CinematicEventSlide event={birthday} />;
    case 'october':
      return <CinematicEventSlide event={october} />;
    case 'official':
      return <OfficialSlide />;
    case 'disco':
      return <CinematicEventSlide event={disco} contain />;
    case 'closer':
      return (
        <AutoPhotoSlide
          images={story.gallery.slice(3)}
          title={story.everyday.title}
          text={story.everyday.text}
        />
      );
    case 'kostya-birthday':
      return <KostyaBirthdaySlide />;
    case 'final-bell':
      return <CinematicEventSlide event={finalBell} contain />;
    case 'compliments':
      return <ComplimentsSlide />;
    case 'counter':
      return <CounterSlide />;
    case 'final':
      return <FinalSlide />;
    default:
      return null;
  }
}

function Presentation({
  current,
  direction,
  goTo,
}: {
  current: number;
  direction: number;
  goTo: (target: number) => void;
}) {
  const reduceMotion = useReducedMotion();
  const isCover = current === 0;
  const isLast = current === slideIds.length - 1;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (document.querySelector('dialog[open]')) return;
      if (event.key === 'ArrowRight' && current < slideIds.length - 1) {
        goTo(current + 1);
      }
      if (event.key === 'ArrowLeft' && current > 0) {
        goTo(current - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [current, goTo]);

  const variants = {
    enter: (move: number) => ({
      x: reduceMotion ? 0 : move > 0 ? '11%' : '-11%',
      opacity: 0,
      scale: reduceMotion ? 1 : 0.975,
      filter: reduceMotion ? 'none' : 'blur(12px)',
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
    },
    exit: (move: number) => ({
      x: reduceMotion ? 0 : move > 0 ? '-8%' : '8%',
      opacity: 0,
      scale: reduceMotion ? 1 : 1.015,
      filter: reduceMotion ? 'none' : 'blur(9px)',
    }),
  };

  return (
    <div className="relative h-[100svh] overflow-hidden bg-background">
      {!isCover && (
        <>
          <div className="fixed inset-x-0 top-0 z-[70] h-0.5 bg-white/8">
            <motion.div
              className="h-full origin-left bg-accent"
              animate={{ scaleX: current / (slideIds.length - 1) }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <div className="fixed right-5 top-5 z-[70] text-[9px] uppercase tracking-[0.24em] text-white/38 sm:right-8 sm:top-8">
            {String(current).padStart(2, '0')} /{' '}
            {String(slideIds.length - 1).padStart(2, '0')}
          </div>
        </>
      )}

      <AnimatePresence initial={false} mode="wait" custom={direction}>
        <motion.div
          key={slideIds[current]}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            duration: reduceMotion ? 0 : 0.72,
            ease: [0.22, 1, 0.36, 1],
          }}
          drag={isCover ? false : 'x'}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.08}
          onDragEnd={(_, info) => {
            if (info.offset.x < -65 && !isLast) goTo(current + 1);
            if (info.offset.x > 65 && current > 0) goTo(current - 1);
          }}
          className="absolute inset-0"
        >
          {renderSlide(current, () => goTo(1))}
        </motion.div>
      </AnimatePresence>

      {!isCover && (
        <nav
          aria-label="Навигация по истории"
          className="fixed bottom-[max(0.8rem,env(safe-area-inset-bottom))] right-4 z-[75] flex gap-2 sm:bottom-6 sm:right-8"
        >
          <button
            type="button"
            onClick={() => goTo(current - 1)}
            disabled={current === 0}
            className="grid size-11 place-items-center rounded-full border border-white/14 bg-black/50 text-white/72 backdrop-blur-md transition hover:border-accent/45 hover:text-white disabled:opacity-20 sm:size-12"
            aria-label="Предыдущая глава"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => goTo(current + 1)}
            disabled={isLast}
            className="grid size-11 place-items-center rounded-full bg-white text-black transition hover:bg-[#ece7dc] disabled:opacity-20 sm:size-12"
            aria-label="Следующая глава"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  );
}

export function StoryExperience() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  const activeTrack = story.soundtrack.intro;
  const hasSoundtrack = Boolean(activeTrack.file);

  const goTo = useCallback(
    (target: number) => {
      const bounded = Math.max(0, Math.min(target, slideIds.length - 1));
      if (bounded === current) return;
      setDirection(bounded > current ? 1 : -1);
      setCurrent(bounded);
    },
    [current],
  );

  const unlock = () => {
    setUnlocked(true);
    const audio = audioRef.current;
    if (audio && story.soundtrack.intro.file) {
      playWithFade(audio, setAudioPlaying);
    }
  };

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      playWithFade(audio, setAudioPlaying);
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

  return (
    <main className="h-[100svh] overflow-hidden bg-background text-foreground">
      {hasSoundtrack && (
        <audio
          ref={audioRef}
          src={activeTrack.file ?? undefined}
          preload="auto"
          loop
        >
          <track
            kind="captions"
            src="/captions/song.vtt"
            srcLang="ru"
            label="Описание аудио"
          />
        </audio>
      )}

      <AnimatePresence mode="wait">
        {unlocked ? (
          <motion.div
            key="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="h-full"
          >
            <Presentation current={current} direction={direction} goTo={goTo} />
          </motion.div>
        ) : (
          <PasswordGate onUnlock={unlock} />
        )}
      </AnimatePresence>

      {unlocked && hasSoundtrack && activeTrack.file && (
        <div className="fixed left-3 top-3 z-[80] flex items-center gap-1 rounded-full border border-white/12 bg-black/60 p-1 backdrop-blur-md sm:left-5 sm:top-5">
          <span className="grid size-8 place-items-center rounded-full text-accent">
            <Music2 className="size-3.5" aria-hidden="true" />
          </span>
          <button
            type="button"
            onClick={toggleAudio}
            className="grid size-8 place-items-center rounded-full text-white/68 hover:bg-white/8"
            aria-label={
              audioPlaying ? 'Поставить музыку на паузу' : 'Включить музыку'
            }
          >
            {audioPlaying ? (
              <Pause className="size-3.5" aria-hidden="true" />
            ) : (
              <Play className="size-3.5" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            className="grid size-8 place-items-center rounded-full text-white/68 hover:bg-white/8"
            aria-label={muted ? 'Включить звук' : 'Выключить звук'}
          >
            {muted ? (
              <VolumeX className="size-3.5" aria-hidden="true" />
            ) : (
              <Volume2 className="size-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
      )}
    </main>
  );
}
