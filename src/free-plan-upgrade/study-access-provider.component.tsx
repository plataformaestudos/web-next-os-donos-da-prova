"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/app/context/user.context";
import { hasStaffAccess } from "@/util/roles";
import HttpClient from "@/util/http-client/fetch-client.util";
import { FreePlanUpgradeModal } from "./upgrade-modal.component";
import { expirationNoticeKey, isUpgradeRouteSuppressed, parseStudyAccess, StudyAccess, STUDY_ACCESS_BLOCKED_EVENT } from "./study-access.model";

type StudyAccessContextValue = {
    access: StudyAccess | null;
    showBlocked: (access: StudyAccess, options?: { automatic?: boolean }) => void;
};
const StudyAccessContext = createContext<StudyAccessContextValue | null>(null);

export function useStudyAccess() {
    const context = useContext(StudyAccessContext);
    if (!context) throw new Error("useStudyAccess requires StudyAccessProvider");
    return context;
}

export function StudyAccessProvider({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const pathname = usePathname();
    const router = useRouter();
    const userId = user?.id;
    const eligible = Boolean(user?.profile) && !hasStaffAccess(user);
    const [access, setAccess] = useState<StudyAccess | null>(null);
    const [open, setOpen] = useState(false);
    const currentPath = useRef(pathname);
    currentPath.current = pathname;
    const controller = useRef<AbortController | null>(null);
    const lastCheck = useRef(0);
    const shown = useRef(new Set<string>());
    const alive = useRef(true);

    const markExpiration = useCallback((next: StudyAccess, automatic: boolean) => {
        if (!userId) return false;
        const key = expirationNoticeKey(userId, next);
        if (!key) return true;
        let seen = shown.current.has(key);
        try { seen ||= window.sessionStorage.getItem(key) === "shown"; } catch { /* Use memory when storage is unavailable. */ }
        if (automatic && seen) return false;
        shown.current.add(key);
        try { window.sessionStorage.setItem(key, "shown"); } catch { /* The notice still works without storage. */ }
        return true;
    }, [userId]);

    const showBlocked = useCallback((next: StudyAccess, options: { automatic?: boolean } = {}) => {
        if (!alive.current || !eligible || !next.reason || isUpgradeRouteSuppressed(currentPath.current)) return;
        // A delivery failure is newer evidence than an in-flight optional lookup.
        controller.current?.abort();
        controller.current = null;
        setAccess(next);
        if (markExpiration(next, options.automatic ?? false)) setOpen(true);
    }, [eligible, markExpiration]);

    const revalidate = useCallback(async () => {
        if (!userId || !eligible) return;
        controller.current?.abort();
        const request = new AbortController();
        controller.current = request;
        lastCheck.current = Date.now();
        try {
            const response = await HttpClient.fetch<{ data: unknown }>("/question-books/user/study-access", {
                method: "GET", cache: "no-store", signal: request.signal,
            }, false, { suppressGlobalError: true });
            if (request.signal.aborted || !alive.current) return;
            const next = parseStudyAccess(response.data);
            if (!next) return;
            setAccess(next);
            if (!next.reason) setOpen(false);
            if (next.reason === "FREE_TRIAL_EXPIRED" && !isUpgradeRouteSuppressed(currentPath.current) && markExpiration(next, true)) {
                setOpen(true);
            }
        } catch {
            // Optional state lookup must never navigate away or show a generic error.
            // Question delivery and the existing auth flow still enforce access.
        } finally {
            if (controller.current === request) controller.current = null;
        }
    }, [userId, eligible, markExpiration]);

    useEffect(() => {
        alive.current = true;
        void revalidate();
        const blocked = (event: Event) => {
            const next = parseStudyAccess((event as CustomEvent<unknown>).detail);
            if (next) showBlocked(next);
        };
        const focus = () => {
            if (document.visibilityState === "visible" && Date.now() - lastCheck.current >= 60_000) void revalidate();
        };
        const pageShow = (event: PageTransitionEvent) => { if (event.persisted) void revalidate(); };
        window.addEventListener(STUDY_ACCESS_BLOCKED_EVENT, blocked);
        window.addEventListener("focus", focus);
        window.addEventListener("pageshow", pageShow);
        document.addEventListener("visibilitychange", focus);
        return () => {
            alive.current = false;
            controller.current?.abort();
            window.removeEventListener(STUDY_ACCESS_BLOCKED_EVENT, blocked);
            window.removeEventListener("focus", focus);
            window.removeEventListener("pageshow", pageShow);
            document.removeEventListener("visibilitychange", focus);
        };
    }, [revalidate, showBlocked]);

    const previousPath = useRef(pathname);
    useEffect(() => {
        const wasSuppressed = isUpgradeRouteSuppressed(previousPath.current);
        previousPath.current = pathname;
        if (isUpgradeRouteSuppressed(pathname)) setOpen(false);
        else if (wasSuppressed) void revalidate();
    }, [pathname, revalidate]);

    useEffect(() => {
        if (!access) return;
        const deadlines = [access.expiresAt, access.dailyResetAt]
            .filter((value): value is string => value !== null)
            .map(value => Date.parse(value))
            .filter(value => value > Date.now());
        if (!deadlines.length) return;
        const timeout = window.setTimeout(() => void revalidate(), Math.min(Math.min(...deadlines) - Date.now() + 100, 2_147_483_647));
        return () => window.clearTimeout(timeout);
    }, [access, revalidate]);

    return (
        <StudyAccessContext.Provider value={{ access, showBlocked }}>
            {children}
            {eligible && access?.reason && <FreePlanUpgradeModal
                open={open && !isUpgradeRouteSuppressed(pathname)}
                reason={access.reason}
                dailyResetAt={access.dailyResetAt}
                upgradeOffer={access.upgradeOffer}
                onClose={() => setOpen(false)}
                onViewPlans={() => { setOpen(false); router.push("/assinatura?tab=planos"); }}
            />}
        </StudyAccessContext.Provider>
    );
}
