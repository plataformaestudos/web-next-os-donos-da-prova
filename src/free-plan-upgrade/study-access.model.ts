export type StudyAccessReason = "FREE_DAILY_LIMIT_REACHED" | "FREE_TRIAL_EXPIRED";

export interface StudyAccess {
    upgradeOffer?: { planId: string; cycle: "MONTHLY" | "QUARTERLY" | "SEMIANNUALLY" | "YEARLY" };
    reason: StudyAccessReason | null;
    expiresAt: string | null;
    dailyResetAt: string | null;
    dailyQuestionLimit: number | null;
    questionsViewedToday: number | null;
}

export const STUDY_ACCESS_BLOCKED_EVENT = "studyAccessBlocked";
const NOTICE_PREFIX = "odp:study-access:";

function record(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function reason(value: unknown): value is StudyAccessReason {
    return value === "FREE_DAILY_LIMIT_REACHED" || value === "FREE_TRIAL_EXPIRED";
}

function nullableDate(value: unknown): value is string | null {
    return value === null || (typeof value === "string" && Number.isFinite(Date.parse(value)));
}

function nullableCount(value: unknown): value is number | null {
    return value === null || (typeof value === "number" && Number.isInteger(value) && value >= 0);
}

function upgradePreference(value: unknown): value is NonNullable<StudyAccess["upgradeOffer"]> {
    return record(value) && typeof value.planId === "string" && value.planId.length > 0 &&
        (value.cycle === "MONTHLY" || value.cycle === "QUARTERLY" || value.cycle === "SEMIANNUALLY" || value.cycle === "YEARLY");
}

/** Accept only the backend contract, never infer a block from the displayed counter. */
export function parseStudyAccess(value: unknown): StudyAccess | null {
    if (!record(value) || !(value.reason === null || reason(value.reason)) ||
        !nullableDate(value.expiresAt) || !nullableDate(value.dailyResetAt) ||
        !nullableCount(value.dailyQuestionLimit) || !nullableCount(value.questionsViewedToday)) return null;
    const upgrade = value.upgradeOffer;
    if (upgrade !== undefined && !upgradePreference(upgrade)) return null;
    return {
        ...(upgrade === undefined ? {} : { upgradeOffer: { planId: upgrade.planId, cycle: upgrade.cycle } }),
        reason: value.reason,
        expiresAt: value.expiresAt,
        dailyResetAt: value.dailyResetAt,
        dailyQuestionLimit: value.dailyQuestionLimit,
        questionsViewedToday: value.questionsViewedToday,
    };
}

export function parseStudyAccessBlock(status: unknown, body: unknown): StudyAccess | null {
    if (status !== 403 || !record(body) || !reason(body.code)) return null;
    if (body.reason !== undefined && body.reason !== body.code) return null;
    return parseStudyAccess({ ...body, reason: body.code });
}

export function isUpgradeRouteSuppressed(pathname: string): boolean {
    return /^\/(assinatura|subscription|checkout|payment|pagamento|auth|login|cadastro|signup|accept-invitation|reset-password)(\/|$)/.test(pathname);
}

export function expirationNoticeKey(userId: string, access: StudyAccess): string | null {
    if (access.reason !== "FREE_TRIAL_EXPIRED") return null;
    return `${NOTICE_PREFIX}${userId}:${access.reason}:${access.expiresAt ?? "expired"}`;
}

export function resetStudyAccessNotices(): void {
    if (typeof window === "undefined") return;
    try {
        const keys: string[] = [];
        for (let index = 0; index < window.sessionStorage.length; index++) {
            const key = window.sessionStorage.key(index);
            if (key?.startsWith(NOTICE_PREFIX)) keys.push(key);
        }
        keys.forEach(key => window.sessionStorage.removeItem(key));
    } catch { /* A blocked storage must not prevent authentication. */ }
}
