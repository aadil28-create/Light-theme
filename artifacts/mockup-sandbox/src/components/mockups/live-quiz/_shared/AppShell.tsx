import { Bell, Menu, PanelLeftClose } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BrandMark, ConnectionStatus, RoleSwitcher, cn, type ConnectionState } from "./Primitives";

export function Header({ role, connection = "connected", onMenu, menuOpen = false, compactBrand = false }: { role: "host" | "participant"; connection?: ConnectionState; onMenu?: () => void; menuOpen?: boolean; compactBrand?: boolean }) {
  return (
    <header className="flex min-h-[72px] items-center justify-between gap-4 border-b border-[var(--lq-line)] bg-[rgba(255,253,250,0.88)] px-5 backdrop-blur-md sm:px-7">
      <div className="flex items-center gap-3">
        {onMenu && <button id="lq-menu-button" type="button" onClick={onMenu} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="lq-navigation" className="lq-focus flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-2 text-[var(--lq-ink-soft)] hover:bg-[#f0ede7] md:hidden"><Menu aria-hidden="true" className="h-5 w-5" /></button>}
        <BrandMark compact={Boolean(onMenu) || compactBrand} />
        {onMenu && <span className="hidden text-xs font-semibold text-[var(--lq-ink-soft)] sm:inline">/ {role === "host" ? "Host console" : "Participant"}</span>}
      </div>
      <div className="flex items-center gap-2.5">
        <ConnectionStatus state={connection} />
        <RoleSwitcher active={role} />
        <button type="button" aria-label="Notifications" className="lq-focus hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[var(--lq-line)] p-2 text-[var(--lq-ink-soft)] hover:bg-[#f0ede7] sm:flex"><Bell aria-hidden="true" className="h-4 w-4" /></button>
      </div>
    </header>
  );
}

export function Navigation({ items, activeRoute, onNavigate, mobileOpen = false, onClose }: { items: Array<{ label: string; route: string; icon: ReactNode; meta?: string }>; activeRoute: string; onNavigate: (route: string) => void; mobileOpen?: boolean; onClose?: () => void }) {
  const navigationRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (mobileOpen) navigationRef.current?.focus();
  }, [mobileOpen]);
  return (
    <aside id="lq-navigation" ref={navigationRef} tabIndex={-1} aria-label="Host navigation" className={cn("border-[var(--lq-line)] bg-[#f4f1ea] md:relative md:block md:w-[242px] md:shrink-0 md:border-r", mobileOpen ? "absolute inset-x-0 top-[72px] z-40 block border-b shadow-xl" : "hidden")}>
      <div className="flex h-full flex-col p-4 md:p-5">
        <div className="mb-7 hidden px-2 md:block"><BrandMark /></div>
        <div className="mb-3 px-2 lq-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#8990a0]">Command center</div>
        <nav aria-label="Host navigation" className="space-y-1">
          {items.map((item) => {
            const active = activeRoute === item.route || (item.route === "/host/dashboard" && activeRoute === "/host") || (item.route === "/host/session/harbor-47" && activeRoute.startsWith("/host/session/harbor-47"));
            return (
              <button key={item.route} type="button" onClick={() => { onNavigate(item.route); onClose?.(); }} className={cn("lq-focus flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-colors", active ? "bg-[var(--lq-ink)] text-[var(--lq-paper)] shadow-sm" : "text-[var(--lq-ink-soft)] hover:bg-[#ebe7de] hover:text-[var(--lq-ink)]")} aria-current={active ? "page" : undefined}>
                <span className={cn("opacity-80", active && "text-[var(--lq-sun)]")}>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.meta && <span className={cn("lq-mono text-[9px]", active ? "text-[#b8c1ce]" : "text-[#9ba1ad]")}>{item.meta}</span>}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto hidden rounded-2xl border border-[#d7d2c8] bg-[#fbfaf7] p-3.5 md:block">
          <div className="flex items-center justify-between"><span className="text-xs font-bold">Friday night room</span><PanelLeftClose className="h-3.5 w-3.5 text-[#9aa0a9]" /></div>
          <p className="mt-1.5 text-[11px] leading-5 text-[var(--lq-ink-soft)]">A quiet place to set the room up before the first question lands.</p>
        </div>
      </div>
    </aside>
  );
}

export function AppShell({ children, role, connection, navigation, activeRoute, onNavigate, footer, participant = false, compactBrand = false }: { children: ReactNode; role: "host" | "participant"; connection?: ConnectionState; navigation?: Array<{ label: string; route: string; icon: ReactNode; meta?: string }>; activeRoute?: string; onNavigate?: (route: string) => void; footer?: ReactNode; participant?: boolean; compactBrand?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    if (activeRoute) window.requestAnimationFrame(() => document.getElementById("lq-main")?.focus());
  }, [activeRoute]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && mobileOpen) setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);
  return (
    <div className="live-quiz min-h-[100dvh] bg-[var(--lq-paper)]">
      <Header role={role} connection={connection} onMenu={navigation ? () => setMobileOpen((open) => !open) : undefined} menuOpen={mobileOpen} compactBrand={compactBrand || (participant && !navigation)} />
      <div className={cn("relative flex min-h-[calc(100dvh-72px)]", participant && "justify-center bg-[#e7f0ed]")}>
        {navigation && activeRoute && onNavigate && <Navigation items={navigation} activeRoute={activeRoute} onNavigate={onNavigate} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />}
        <main id="lq-main" tabIndex={-1} className={cn("min-w-0 flex-1 outline-none", participant ? "w-full max-w-[430px] bg-[var(--lq-paper)] shadow-[0_0_40px_rgba(21,36,61,0.08)]" : "")}>{children}</main>
      </div>
      {activeRoute && <div className="sr-only" aria-live="polite">View updated: {activeRoute}</div>}
      {footer}
    </div>
  );
}