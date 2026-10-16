import { CalendarOutlined, ReadOutlined, RightOutlined } from "@ant-design/icons";
import { Progress } from "antd";
import { useTheme } from "styled-components";
import { FreePlanUsage, hasFreePlanIndicators, usagePercentage } from "./free-plan-usage.model";
import * as S from "./free-plan-usage.style";

interface FreePlanUsageCardProps {
    usage: FreePlanUsage | null | undefined;
    expired?: boolean;
}

export function FreePlanUsageCard({ usage, expired = false }: FreePlanUsageCardProps) {
    const theme = useTheme();
    if (expired) return (
        <S.Card aria-label="Período gratuito encerrado">
            <S.Header>
                <S.Title><CalendarOutlined aria-hidden />Seu período gratuito terminou</S.Title>
            </S.Header>
            <S.ExpiredDescription>Veja os planos para continuar estudando.</S.ExpiredDescription>
            <S.PlansLink href="/assinatura?tab=planos">Ver planos <RightOutlined aria-hidden /></S.PlansLink>
        </S.Card>
    );
    if (!hasFreePlanIndicators(usage)) return null;

    const showExpiration = usage.hasExpiration && usage.daysRemaining !== null && usage.daysUsed !== null && usage.durationDays !== null;
    const showDailyLimit = usage.hasDailyQuestionLimit && usage.dailyQuestionLimit !== null;
    const daysRemaining = usage.daysRemaining ?? 0;
    const daysUsed = usage.daysUsed ?? 0;
    const durationDays = usage.durationDays ?? 0;
    const dailyLimit = usage.dailyQuestionLimit ?? 0;
    const dailyLimitReached = showDailyLimit && usage.questionsViewedToday >= dailyLimit;
    const expirationDate = usage.expiresAt ? new Date(usage.expiresAt) : null;
    const expiration = expirationDate && Number.isFinite(expirationDate.getTime())
        ? new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo",
        }).format(expirationDate)
        : null;

    return (
        <S.Card aria-label="Seu plano Free">
            <S.Header>
                <S.TitleGroup>
                    <S.Title><CalendarOutlined aria-hidden />Seu plano Free</S.Title>
                    <S.Badge>Gratuito</S.Badge>
                </S.TitleGroup>
                <S.PlansLink href="/subscription">Ver planos <RightOutlined aria-hidden /></S.PlansLink>
            </S.Header>
            <S.Indicators>
                {showExpiration && (
                    <S.Indicator>
                        <S.IndicatorHeader>
                            <S.Label><CalendarOutlined aria-hidden />Validade do plano</S.Label>
                            <S.Value $limitReached={daysRemaining === 0}>
                                {daysRemaining === 0 ? "Prazo encerrado" : `${daysRemaining} ${daysRemaining === 1 ? "dia restante" : "dias restantes"}`}
                            </S.Value>
                        </S.IndicatorHeader>
                        <Progress
                            percent={usagePercentage(daysUsed, durationDays)}
                            showInfo={false}
                            size={{ height: 6 }}
                            strokeColor={theme.colorPrimaryText}
                            trailColor={theme.colorFillSecondary}
                            aria-label="Tempo utilizado do plano Free"
                            aria-valuetext={`${daysUsed} de ${durationDays} dias utilizados; ${daysRemaining} dias restantes`}
                        />
                        {expiration && <S.Expiration>
                            Vencimento: <time dateTime={usage.expiresAt ?? undefined}>{expiration}</time> (horário de Brasília)
                        </S.Expiration>}
                    </S.Indicator>
                )}
                {showDailyLimit && (
                    <S.Indicator>
                        <S.IndicatorHeader>
                            <S.Label><ReadOutlined aria-hidden />Questões visualizadas hoje</S.Label>
                            <S.Value $limitReached={dailyLimitReached}>{usage.questionsViewedToday}/{dailyLimit}</S.Value>
                        </S.IndicatorHeader>
                        <Progress
                            percent={usagePercentage(usage.questionsViewedToday, dailyLimit)}
                            showInfo={false}
                            size={{ height: 6 }}
                            strokeColor={dailyLimitReached ? theme.colorErrorText : theme.colorPrimaryText}
                            trailColor={theme.colorFillSecondary}
                            aria-label="Limite diário de questões visualizadas"
                            aria-valuetext={`${usage.questionsViewedToday} de ${dailyLimit} questões visualizadas hoje`}
                        />
                        <S.Legend>
                            {dailyLimit === 0
                                ? "Nenhuma visualização disponível neste plano"
                                : dailyLimitReached
                                    ? "Limite de hoje atingido"
                                    : `${usage.questionsViewedToday} ${usage.questionsViewedToday === 1 ? "questão visualizada" : "questões visualizadas"} de ${dailyLimit} por dia`}
                        </S.Legend>
                    </S.Indicator>
                )}
            </S.Indicators>
        </S.Card>
    );
}
