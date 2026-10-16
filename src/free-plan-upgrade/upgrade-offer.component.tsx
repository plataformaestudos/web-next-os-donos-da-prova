"use client";

import { Spin, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { ReferralPlanPrice, ReferralPlansProvider } from '@/affiliates/referral-plans.component';
import type { ResponseModel } from '@/model/common.model';
import type { NewPlanModel } from '@/model/plan.model';
import HttpClient from '@/util/http-client/fetch-client.util';
import { recurringCycles } from '@/plans/plan-price-display';
import { selectUpgradeOffer } from './upgrade-offer.model';
import type { StudyAccess } from './study-access.model';
import * as Styled from './upgrade-modal.style';

export function FreePlanUpgradeOffer({ preference }: { preference?: StudyAccess['upgradeOffer'] }) {
  const [offer, setOffer] = useState<NewPlanModel | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    setStatus('loading');
    setOffer(null);
    let active = true;
    const controller = new AbortController();
    void HttpClient.fetch<ResponseModel<NewPlanModel[]>>('/subscription-plans/availables', {
      method: 'GET', cache: 'no-store', signal: controller.signal,
    }, false, { suppressGlobalError: true }).then(response => {
      if (!Array.isArray(response.data)) throw new Error('Catálogo indisponível');
      if (!active) return;
      setOffer(selectUpgradeOffer(response.data, preference));
      setStatus('ready');
    }).catch(() => { if (active) setStatus('error'); });
    return () => { active = false; controller.abort(); };
  }, [preference]);

  if (status === 'loading') return <Styled.Status role="status"><Spin size="small" /> Consultando planos disponíveis...</Styled.Status>;
  if (status === 'error') return <Styled.Status role="status">Não foi possível carregar a sugestão de plano. Você ainda pode conferir os planos disponíveis.</Styled.Status>;
  if (!offer) return <Styled.Status role="status">Confira os planos e as opções disponíveis para sua conta.</Styled.Status>;

  const cycle = recurringCycles.find(item => item.value === offer.cardDisplayCycle);
  return <ReferralPlansProvider>
    <Styled.OfferCard $selected={false} as="article" aria-label={`Sugestão de plano: ${offer.name}`}>
      {cycle && <Tag color="blue">Assinatura {cycle.label.toLocaleLowerCase('pt-BR')}</Tag>}
      <h3>{offer.name}</h3>
      {offer.description && <p>{offer.description}</p>}
      <Styled.Price><ReferralPlanPrice plan={offer} /></Styled.Price>
      <Styled.Modules>
        <summary>Ver módulos</summary>
        {offer.modules?.length ? <ul>{offer.modules.map(module => <li key={module.id}>{module.name}</li>)}</ul> : <p>Nenhum módulo informado para este plano.</p>}
      </Styled.Modules>
    </Styled.OfferCard>
  </ReferralPlansProvider>;
}
