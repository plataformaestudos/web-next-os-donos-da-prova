"use client";

import { Button } from 'antd';
import { FreePlanUpgradeOffer } from './upgrade-offer.component';
import { formatUpgradeReset } from './upgrade-offer.model';
import * as Styled from './upgrade-modal.style';
import type { StudyAccess } from './study-access.model';

export interface FreePlanUpgradeModalProps {
  upgradeOffer?: StudyAccess['upgradeOffer'];
  open: boolean;
  reason: 'FREE_DAILY_LIMIT_REACHED' | 'FREE_TRIAL_EXPIRED';
  dailyResetAt: string | null;
  onClose: () => void;
  onViewPlans: () => void;
}

export function FreePlanUpgradeModal({ open, reason, dailyResetAt, upgradeOffer, onClose, onViewPlans }: FreePlanUpgradeModalProps) {
  const reset = reason === 'FREE_DAILY_LIMIT_REACHED' ? formatUpgradeReset(dailyResetAt) : null;
  return <Styled.UpgradeModal
    open={open}
    centered
    width={520}
    onCancel={onClose}
    closeIcon={<span aria-label="Fechar">×</span>}
    title={reason === 'FREE_DAILY_LIMIT_REACHED' ? 'Você atingiu seu limite de questões de hoje.' : 'Seu período gratuito terminou.'}
    footer={<Styled.Actions>
      <Button onClick={onClose}>Agora não</Button>
      <Button type="primary" onClick={onViewPlans}>Ver planos</Button>
    </Styled.Actions>}
  >
    <Styled.Intro>Contrate um plano para continuar estudando.</Styled.Intro>
    {open && <FreePlanUpgradeOffer preference={upgradeOffer} />}
    {reset && <Styled.ResetNotice>Seu limite diário será renovado em {reset} (horário de Brasília).</Styled.ResetNotice>}
  </Styled.UpgradeModal>;
}
