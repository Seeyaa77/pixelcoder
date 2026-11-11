/* eslint-disable react/only-export-components -- storage helpers are part of the public API */
import React, { useState } from 'react';
import { Code2, Map, Swords, UserPlus } from 'lucide-react';
import NeoModal from './ui/NeoModal';
import NeoButton from './ui/NeoButton';
import NeoBadge from './ui/NeoBadge';

export const HOWTO_STORAGE_KEY = 'pixelcoder_howto_seen_v1';

/** True when the player already finished/skipped the onboarding with "Don't show again". */
export function hasSeenHowToPlay() {
  try {
    return window.localStorage.getItem(HOWTO_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/** Persist that the player does not want to see the onboarding again. */
export function markHowToPlaySeen() {
  try {
    window.localStorage.setItem(HOWTO_STORAGE_KEY, '1');
  } catch {
    /* storage unavailable (private mode) — silently ignore */
  }
}

/** Clear the persisted flag (useful for "Replay tutorial" actions). */
export function resetHowToPlaySeen() {
  try {
    window.localStorage.removeItem(HOWTO_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

const COPY = {
  en: {
    modalTitle: 'How to Play',
    stepLabel: (n, total) => `Step ${n} of ${total}`,
    skip: 'Skip',
    back: 'Back',
    next: 'Next',
    finish: 'Start Quest',
    remember: "Don't show again",
    requestAuth: 'Create account',
    steps: [
      {
        icon: UserPlus,
        eyebrow: 'Step 1 · Identity',
        title: 'Register or log in first',
        body: 'Your hero account keeps XP, gold, HP, potions and cleared stages safe. Progress is synced to the live Supabase database, so you can continue the quest on any device.',
        points: [
          'Sign up with a username, email and password — it is free.',
          'Log in to restore your saved hero and stage progress.',
          'Your rank also appears on the live leaderboard.',
        ],
      },
      {
        icon: Map,
        eyebrow: 'Step 2 · Loadout',
        title: 'Choose your track & stage',
        body: 'Pick Python, C++ or JavaScript in the top bar, then select a stage from the Dungeon Roadmap. Each track has 15 stages packed with theory and bosses.',
        points: [
          'Clear a stage to unlock the next one.',
          'Switch tracks any time — each keeps its own progress.',
          'Cleared stages can be replayed without extra rewards.',
        ],
      },
      {
        icon: Code2,
        eyebrow: 'Step 3 · Study & Code',
        title: 'Read the theory, then write code',
        body: 'Every stage opens with a short w3schools-style theory box and a coding task. Study the syntax, then type your solution in the code editor on the right.',
        points: [
          'The editor checks the task while you type.',
          'Stuck? Spend gold to unlock a hint.',
          'Run your code as often as you want before submitting.',
        ],
      },
      {
        icon: Swords,
        eyebrow: 'Step 4 · Combat',
        title: 'Run & Submit to defeat the monster',
        body: 'When your solution passes every test case, your hero attacks the monster. Victory grants XP, gold and hints — and unlocks the next stage.',
        points: [
          'A correct submission deals the finishing blow.',
          'Wrong answers cost HP, so keep potions ready.',
          'XP and gold buy weapons, heroes and hints in the Armory.',
        ],
      },
    ],
  },
  id: {
    modalTitle: 'Cara Bermain',
    stepLabel: (n, total) => `Langkah ${n} dari ${total}`,
    skip: 'Lewati',
    back: 'Kembali',
    next: 'Lanjut',
    finish: 'Mulai Quest',
    remember: 'Jangan tampilkan lagi',
    requestAuth: 'Buat akun',
    steps: [
      {
        icon: UserPlus,
        eyebrow: 'Langkah 1 · Identitas',
        title: 'Daftar atau masuk terlebih dahulu',
        body: 'Akun hero menyimpan XP, gold, HP, potion, dan stage yang sudah selesai. Progres disinkronkan ke database Supabase, jadi kamu bisa melanjutkan quest dari perangkat mana pun.',
        points: [
          'Daftar dengan username, email, dan password — gratis.',
          'Masuk untuk memulihkan hero dan progres stage kamu.',
          'Peringkatmu juga tampil di papan peringkat langsung.',
        ],
      },
      {
        icon: Map,
        eyebrow: 'Langkah 2 · Persiapan',
        title: 'Pilih track & stage',
        body: 'Pilih Python, C++, atau JavaScript di bilah atas, lalu pilih stage dari Dungeon Roadmap. Setiap track punya 15 stage berisi teori dan boss.',
        points: [
          'Selesaikan satu stage untuk membuka stage berikutnya.',
          'Ganti track kapan saja — progres tiap track terpisah.',
          'Stage yang sudah selesai bisa dimainkan ulang tanpa hadiah tambahan.',
        ],
      },
      {
        icon: Code2,
        eyebrow: 'Langkah 3 · Belajar & Kode',
        title: 'Baca teori, lalu tulis kode',
        body: 'Setiap stage dibuka dengan teori singkat gaya w3schools dan sebuah tugas coding. Pelajari sintaksnya, lalu tulis solusimu di editor kode di sebelah kanan.',
        points: [
          'Editor memeriksa tugas saat kamu mengetik.',
          'Bingung? Belanjakan gold untuk membuka hint.',
          'Jalankan kode sebanyak yang kamu mau sebelum submit.',
        ],
      },
      {
        icon: Swords,
        eyebrow: 'Langkah 4 · Pertarungan',
        title: 'Run & Submit untuk mengalahkan monster',
        body: 'Saat solusimu lolos semua test case, hero menyerang monster. Kemenangan memberi XP, gold, dan hint — sekaligus membuka stage berikutnya.',
        points: [
          'Submission yang benar memberikan serangan pamungkas.',
          'Jawaban salah mengurangi HP, jadi siapkan potion.',
          'XP dan gold bisa dibelanjakan untuk senjata, hero, dan hint di Armory.',
        ],
      },
    ],
  },
};

/**
 * 4-step bilingual onboarding modal.
 *
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {'en'|'id'} [language]
 * @param {() => void} [onFinish] - called when the player completes the final step
 * @param {() => void} [onRequestAuth] - optional CTA on step 1 (opens the auth modal)
 */
export default function HowToPlay({ isOpen, onClose, language = 'en', onFinish, onRequestAuth }) {
  const [step, setStep] = useState(0);
  const [remember, setRemember] = useState(false);

  const copy = COPY[language] || COPY.en;
  const total = copy.steps.length;

  const finish = () => {
    if (remember) markHowToPlaySeen();
    setStep(0);
    setRemember(false);
    onFinish?.();
    onClose?.();
  };

  const handleSkip = () => {
    if (remember) markHowToPlaySeen();
    setStep(0);
    setRemember(false);
    onClose?.();
  };

  const handleNext = () => {
    if (step >= total - 1) {
      finish();
      return;
    }
    setStep((prev) => Math.min(prev + 1, total - 1));
  };

  const current = copy.steps[step];
  const StepIcon = current.icon;
  const isLast = step === total - 1;

  return (
    <NeoModal
      isOpen={isOpen}
      onClose={handleSkip}
      title={copy.modalTitle}
      description={copy.stepLabel(step + 1, total)}
      icon={<StepIcon className="h-6 w-6 text-[#FDE047]" aria-hidden="true" />}
      size="lg"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex min-h-11 cursor-pointer items-center gap-2 font-mono text-[11px] font-bold text-[#1E2522]">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-4 w-4 accent-[#7D8D39] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7D8D39] focus-visible:ring-offset-2"
            />
            <span>{copy.remember}</span>
          </label>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <NeoButton variant="ghost" size="sm" onClick={handleSkip}>
              {copy.skip}
            </NeoButton>
            <NeoButton
              variant="secondary"
              size="sm"
              onClick={() => setStep((prev) => Math.max(0, prev - 1))}
              disabled={step === 0}
            >
              {copy.back}
            </NeoButton>
            <NeoButton variant="primary" size="sm" onClick={handleNext}>
              {isLast ? copy.finish : copy.next}
            </NeoButton>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4 font-mono text-xs">
        {/* Progress dots */}
        <div className="flex items-center gap-2" aria-label={`Progress: ${copy.stepLabel(step + 1, total)}`}>
          {copy.steps.map((s, index) => {
            const isDone = index < step;
            const isCurrent = index === step;
            return (
              <button
                key={s.title}
                type="button"
                onClick={() => setStep(index)}
                aria-label={`${copy.stepLabel(index + 1, total)}: ${s.title}`}
                aria-current={isCurrent ? 'step' : undefined}
                className="flex h-11 flex-1 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7D8D39] focus-visible:ring-offset-2"
              >
                <span
                  aria-hidden="true"
                  className={[
                    'h-3 w-full border-2 border-[#1E2522] transition-colors',
                    isCurrent ? 'bg-[#7D8D39]' : isDone ? 'bg-[#C4CEB5]' : 'bg-white',
                  ].join(' ')}
                />
              </button>
            );
          })}
        </div>

        <NeoBadge tone="oliveSoft" size="sm" className="self-start">
          {current.eyebrow}
        </NeoBadge>

        <h3 className="font-sans text-lg font-extrabold uppercase leading-tight tracking-tight text-[#1E2522] sm:text-xl">
          {current.title}
        </h3>

        <p className="text-[12px] leading-relaxed text-gray-700 sm:text-sm">{current.body}</p>

        <ul className="flex flex-col gap-1.5">
          {current.points.map((point) => (
            <li
              key={point}
              className="flex items-start gap-2 border-2 border-[#1E2522] bg-[#F3F6F4] p-2 text-[11px] leading-snug text-[#1E2522] sm:text-xs"
            >
              <span aria-hidden="true" className="mt-0.5 font-bold text-[#7D8D39]">
                ▸
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>

        {step === 0 && onRequestAuth ? (
          <NeoButton variant="amber" size="sm" className="self-start" onClick={onRequestAuth}>
            {copy.requestAuth}
          </NeoButton>
        ) : null}

        {step === 2 ? (
          <pre className="overflow-x-auto border-3 border-[#1E2522] bg-[#1E2522] p-3 text-[11px] leading-relaxed text-[#D5E0B5]">
            <code>{`for stage in dungeon:\n    read(theory)\n    solve(stage.code)\n    hero.attack(monster)`}</code>
          </pre>
        ) : null}
      </div>
    </NeoModal>
  );
}
