import "./_group.css";
import { ArrowRight, LogIn, UsersRound } from "lucide-react";
import { BrandMark, StatusBadge, usePreviewRoute } from "./_shared/Primitives";

export function LandingPage() {
  const [route, navigate] = usePreviewRoute("/");
  const destination = route === "/host" || route === "/participant" ? route : null;

  return (
    <div className="live-quiz min-h-[100dvh] overflow-hidden bg-[var(--lq-paper)]">
      <header className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <BrandMark />
        <StatusBadge tone="ready">Preview mode</StatusBadge>
      </header>

      <main className="mx-auto flex min-h-[calc(100dvh-88px)] max-w-[1180px] flex-col justify-center px-5 pb-12 pt-6 sm:px-8 sm:pb-16 lg:px-10">
        <div className="relative">
          <div className="pointer-events-none absolute -right-20 -top-24 hidden h-64 w-64 rounded-full border-[34px] border-[rgba(244,203,104,0.3)] sm:block" />
          <div className="pointer-events-none absolute -left-24 bottom-4 hidden h-44 w-44 rounded-full border-[22px] border-[rgba(183,225,213,0.6)] lg:block" />

          <section className="relative mx-auto max-w-[760px] text-center">
            <div className="lq-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--lq-signal-deep)]">Live rooms, made simple</div>
            <h1 className="lq-display mt-5 text-5xl font-extrabold leading-[0.95] tracking-tight text-[var(--lq-ink)] sm:text-7xl">
              Signalhouse
              <span className="block text-[var(--lq-signal)]">is on air.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-[540px] text-base leading-7 text-[var(--lq-ink-soft)] sm:text-lg">
              A focused live quiz room for the people asking the questions and the people answering them together.
            </p>
          </section>

          <section className="mx-auto mt-12 grid max-w-[920px] gap-4 md:grid-cols-[1.08fr_0.92fr]" aria-label="Choose your Signalhouse view">
            <button
              type="button"
              onClick={() => navigate("/host")}
              className="lq-focus group relative overflow-hidden rounded-[28px] bg-[var(--lq-ink)] p-6 text-left text-[var(--lq-paper)] shadow-[0_18px_40px_rgba(21,36,61,0.16)] transition-transform hover:-translate-y-1 sm:p-8"
            >
              <div className="pointer-events-none absolute -right-12 -top-14 h-44 w-44 rounded-full border-[22px] border-[rgba(244,203,104,0.16)]" />
              <div className="relative flex min-h-[220px] flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--lq-signal)] text-white">
                    <LogIn className="h-5 w-5" />
                  </div>
                  <span className="lq-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#aeb9c9]">For hosts</span>
                </div>
                <div className="mt-auto">
                  <h2 className="lq-display text-3xl font-extrabold">Run the room.</h2>
                  <p className="mt-2 max-w-[330px] text-sm leading-6 text-[#bdc7d3]">Open the host console, cue the next round, and keep the pace with the room.</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[var(--lq-sun)]">
                    Host sign in
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate("/participant")}
              className="lq-focus group rounded-[28px] border border-[var(--lq-line)] bg-[var(--lq-card)] p-6 text-left shadow-[0_12px_30px_rgba(60,62,72,0.07)] transition-transform hover:-translate-y-1 sm:p-8"
            >
              <div className="flex min-h-[220px] flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf8f4] text-[var(--lq-mint-deep)]">
                    <UsersRound className="h-5 w-5" />
                  </div>
                  <span className="lq-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--lq-ink-soft)]">For players</span>
                </div>
                <div className="mt-auto">
                  <h2 className="lq-display text-3xl font-extrabold text-[var(--lq-ink)]">Join the room.</h2>
                  <p className="mt-2 max-w-[310px] text-sm leading-6 text-[var(--lq-ink-soft)]">Bring your team name, find the live room, and stay close to the signal.</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[var(--lq-signal-deep)]">
                    Join as participant
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </button>
          </section>

          <div className="mx-auto mt-7 flex min-h-5 justify-center text-center">
            {destination && (
              <p className="lq-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--lq-mint-deep)]">
                Local route selected · {destination}
              </p>
            )}
          </div>
        </div>
      </main>

      <footer className="pb-6 text-center">
        <span className="lq-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#9299a6]">Signalhouse / live rooms</span>
      </footer>
    </div>
  );
}