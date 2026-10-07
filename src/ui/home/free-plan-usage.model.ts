export interface FreePlanUsage {
    planName: string;
    hasExpiration: boolean;
    expiresAt: string | null;
    durationDays: number | null;
    daysRemaining: number | null;
    daysUsed: number | null;
    hasDailyQuestionLimit: boolean;
    dailyQuestionLimit: number | null;
    questionsViewedToday: number;
    questionsRemainingToday: number | null;
    dailyResetAt: string | null;
}

export function hasFreePlanIndicators(usage: FreePlanUsage | null | undefined): usage is FreePlanUsage {
    return Boolean(usage && (usage.hasExpiration || usage.hasDailyQuestionLimit));
}

export function usagePercentage(used: number, limit: number) {
    if (limit <= 0) return 100;
    return Math.min(100, Math.max(0, used / limit * 100));
}

export function nextUsageRefreshDelay(usage: FreePlanUsage | null | undefined, now = Date.now()) {
    if (!hasFreePlanIndicators(usage)) return null;
    const boundaries: number[] = [];
    if (usage.hasDailyQuestionLimit && usage.dailyResetAt) {
        const reset = Date.parse(usage.dailyResetAt);
        if (Number.isFinite(reset)) boundaries.push(reset);
    }
    if (usage.hasExpiration && usage.expiresAt) {
        const expires = Date.parse(usage.expiresAt);
        if (Number.isFinite(expires)) {
            // The server rounds the remaining time up to whole days.
            const day = 24 * 60 * 60 * 1000;
            const remaining = expires - now;
            boundaries.push(remaining > 0 ? now + (remaining % day || day) : expires);
        }
    }
    if (boundaries.length === 0) return null;
    return Math.max(1000, Math.min(...boundaries) - now + 100);
}
