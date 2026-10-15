const http = require('node:http');
const fixturePort = 4029;
const basePlan = { isFree: false, allowLifetime: false, monthValue: 59.9, quarterlyValue: 140, semiannualValue: 255, annualValue: 466.8, cardDisplayCycle: 'YEARLY', cardDisplayMode: 'MONTHLY_EQUIVALENT', uniqueValue: null, lifetimeValue: null, questionLimit: 1000, durationDays: null, modules: [{id:'matematica',name:'Matemática'}, {id:'portugues',name:'Português'}] };
const plans = [
  {...basePlan,id:'11111111-1111-4111-8111-111111111111',name:'Plano Essencial',description:'Prepare-se com questões, comentários e módulos para organizar seus estudos.'},
  {...basePlan,id:'33333333-3333-4333-8333-333333333333',name:'Plano Semestral',description:'Questões e módulos para estudar no seu ritmo.',monthValue:null,quarterlyValue:null,annualValue:null,cardDisplayCycle:'SEMIANNUALLY'},
  {...basePlan,id:'44444444-4444-4444-8444-444444444444',name:'Plano Free',description:'Comece seus estudos com o plano gratuito.',isFree:true,monthValue:null,quarterlyValue:null,semiannualValue:null,annualValue:null,modules:[]},
  {...basePlan,id:'55555555-5555-4555-8555-555555555555',name:'Plano indisponível',description:'Sem ciclos contratáveis',monthValue:null,quarterlyValue:null,semiannualValue:null,annualValue:null},
];
const writes=[];
const study = { mode: 'free', viewed: new Set(), answered: new Set(), usageReads: 0, questionDeliveries: 0, lastOrder: 1 };
const bookStats = () => ({ totalQuestions: 12, correctAnswers: study.answered.size, totalAnswers: study.answered.size, firstQuestion: 1, wrongAnswers: 0 });
const cycleFields = { MONTHLY: 'monthValue', QUARTERLY: 'quarterlyValue', SEMIANNUALLY: 'semiannualValue', YEARLY: 'annualValue' };
const isFixed = body => body.referralToken === 'f'.repeat(43) || body.code === 'fixed20';
const campaign = body => ({ title: 'Campanha de teste', slug: isFixed(body) ? 'fixed20' : 'checkout20' });
const amounts = (body, plan, cycle) => {
  const baseAmountCents = Math.round(plan[cycleFields[cycle]] * 100);
  const discountAmountCents = isFixed(body) ? Math.min(2000, baseAmountCents) : Math.round(baseAmountCents * .2);
  return { baseAmountCents, discountAmountCents, finalAmountCents: baseAmountCents - discountAmountCents };
};
const preview = body => ({
  campaign: campaign(body),
  prices: plans.filter(plan => !plan.isFree).flatMap(plan => Object.keys(cycleFields).filter(cycle => plan[cycleFields[cycle]] > 0).map(cycle => ({
    planId: plan.id, cycle,
    ...(plan.id === plans[0].id && cycle !== 'QUARTERLY' ? { available: true, ...amounts(body, plan, cycle) } : { available: false }),
  }))),
  expiresAt: new Date(Date.now() + 900000).toISOString(), currency: 'BRL', eligibility: 'PRELIMINARY',
});
const question = (bookId, order = 1) => ({
  ...(study.mode === 'error' ? {} : { dailyUsage: dailyUsage() }),
  id: `${bookId}-entry-${order}`, questionId: `question-${order}`, text: `<p>Questão de teste ${order}: quanto é 2 + 2?</p>`,
  comment: null, type: 'MULTIPLE_CHOICE', module: { id: 'matematica', name: 'Matemática' },
  alternatives: [{ id: 'alternative-a', text: '<p>4</p>', isCorrect: true }, { id: 'alternative-b', text: '<p>5</p>', isCorrect: false }],
  userAnswer: null,
  orderDetails: { questionOrder: order, previousOrder: order > 1 ? order - 1 : null, nextOrder: order < 12 ? order + 1 : null, nextUnansweredOrder: order < 12 ? order + 1 : null, previousUnansweredOrder: order > 1 ? order - 1 : null },
});
const dailyUsage = () => ['paid', 'staff', 'unlimited'].includes(study.mode) ? null : ({
  planName: 'Free', hasDailyQuestionLimit: true, dailyQuestionLimit: study.mode === 'zero' ? 0 : 3,
  questionsViewedToday: study.viewed.size, questionsRemainingToday: Math.max(0, (study.mode === 'zero' ? 0 : 3) - study.viewed.size),
  dailyResetAt: new Date(Date.now() + 86400000).toISOString(),
});
const quote = body => {
  const plan=plans.find(p=>p.id===body.planId)||plans[0];
  const values={MONTHLY:plan.monthValue,QUARTERLY:plan.quarterlyValue,SEMIANNUALLY:plan.semiannualValue,YEARLY:plan.annualValue};
  const baseAmountCents=Math.round((values[body.cycle]||59.9)*100);const discountAmountCents=isFixed(body)?2000:Math.round(baseAmountCents*.2);
  return {quoteToken:'fixture.'+'a'.repeat(64),quoteId:'22222222-2222-4222-8222-222222222222',expiresAt:new Date(Date.now()+900000).toISOString(),campaign:campaign(body),discount:{type:isFixed(body)?'FIXED':'PERCENTAGE',value:2000,duration:'PERMANENT'},planId:body.planId,cycle:body.cycle,baseAmountCents,discountAmountCents,finalAmountCents:baseAmountCents-discountAmountCents,currency:'BRL',eligibility:'PRELIMINARY'};
};
const server=http.createServer(async(req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','http://localhost:3137');
  res.setHeader('Access-Control-Allow-Credentials','true');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,DELETE,OPTIONS');
  if(req.method==='OPTIONS'){res.writeHead(204);return res.end();}
  let raw='';for await(const c of req)raw+=c;
  const body=raw?JSON.parse(raw):{};const url=new URL(req.url,'http://fixture');const path=url.pathname;
  let status=200,result={data:[]};
  if(path==='/public/plans')result={data:plans};
  else if(path==='/subscription-plans/availables')result={data:plans.filter(p=>!p.isFree)};
  else if(path==='/auth/me')result={id:'fixture-student',email:'student@example.test'};
  else if(path==='/profiles/me')result={data:{id:'fixture-profile',user_id:'fixture-student',role_id:study.mode==='staff'?'ebacbfdf-547f-46c7-a31d-8e83225994b7':'8f36e1ce-e12e-4237-b16b-4ad7723d8f2b',name:'Aluno de teste',nickname:'Aluno'}};
  else if(path==='/terms')result={data:{termsOfUse:{id:'terms',version:'1',title:'Termos de teste',content:'Fixture local'},privacyPolicy:{id:'privacy',version:'1',title:'Privacidade de teste',content:'Fixture local'}}};
  else if(path==='/affiliate-links/public/preview')result=preview(body);
  else if(path==='/affiliate-links/public/apply-code'){
    await new Promise(r=>setTimeout(r,100));
    if(['checkout20','fixed20'].includes(body.code))result={...preview(body),referralToken:(isFixed(body)?'f':'r').repeat(43),referralExpiresAt:new Date(Date.now()+86400000).toISOString()};
    else {status=404;result={message:'Código de desconto não encontrado.'};}
  }
  else if(path==='/affiliate-links/public/code'){
    await new Promise(r=>setTimeout(r,350));
    if(body.code==='checkout20')result={...quote(body),referralToken:'r'.repeat(43),referralExpiresAt:new Date(Date.now()+86400000).toISOString()};
    else {status=404;result={message:'Código de desconto não encontrado.'};}
  }else if(path==='/affiliate-links/public/quote'){
    await new Promise(r=>setTimeout(r,250));
    if(body.cycle==='QUARTERLY'||body.planId===plans[1].id){status=400;result={code:'AFFILIATE_SELECTION_EXCLUDED',message:'Este plano e ciclo não participam da oferta.'};}
    else result=quote(body);
  }else if(path==='/subscription/new-user'||path==='/subscription'){
    writes.push({kind:path,planId:body.planId,billingType:body.billingType,cycle:body.cycle,saveCard:body.saveCard,termsAccepted:body.termsAccepted,privacyAccepted:body.privacyAccepted,autoChargeAccepted:body.autoChargeAccepted,cancellationPolicyAccepted:body.cancellationPolicyAccepted,hasQuote:!!body.quoteToken,hasReferral:!!body.referralToken,cardEmpty:body.creditCard?.number===''});
    await new Promise(r=>setTimeout(r,500));
    if(body.billingType==='FREE')result={data:{id:'fixture-free-subscription',value:0}};
    else {status=409;result={message:'Falha de teste: nenhuma cobrança foi realizada.'};}
  }else if(path==='/auth/login')result={id:'fixture-student'};
  else if(path==='/__fixture/config'){
    study.mode=body.mode||'free';study.viewed.clear();study.answered.clear();study.usageReads=0;study.questionDeliveries=0;study.lastOrder=1;
    result={ok:true};
  }
  else if(path==='/question-books/user/daily-usage'){
    study.usageReads++;
    if(study.mode==='error'){status=503;result={message:'Consumo temporariamente indisponível.'};}
    else result={data:dailyUsage()};
  }
  else if(/^\/question-books\/[^/]+\/timer$/.test(path))result={data:{questionBookId:path.split('/')[2],elapsedTimeMs:0,lastUpdated:new Date().toISOString()}};
  else if(/^\/question-books\/[^/]+\/stats$/.test(path))result={data:bookStats()};
  else if(path==='/user-answers'){
    study.answered.add(body.questionBookQuestionId);
    result={data:{isCorrect:true,correctAlternativeId:'alternative-a'}};
  }
  else if(/^\/questions\/[^/]+\/general-stats$/.test(path))result={data:{totalAnswers:0,correctAnswers:0,incorrectAnswers:0,accuracyPercentage:0,difficulty:0}};
  else if(/^\/question-books\/[^/]+\/next-question$/.test(path)){
    const order=url.searchParams.get('seqRandom')==='true'?(study.lastOrder%12)+1:Number(url.searchParams.get('seq'))||1;
    study.viewed.add(`question-${order}`);study.questionDeliveries++;
    study.lastOrder=order;
    await new Promise(resolve=>setTimeout(resolve,150));
    result={data:question(path.split('/')[2],order)};
  }
  else if(/^\/question-books\/[^/]+$/.test(path)){
    const id=path.split('/')[2];const order=Math.min(12,Number(url.searchParams.get('seq'))||1);study.viewed.add(`question-${order}`);study.questionDeliveries++;study.lastOrder=order;
    result={data:{id,name:'Caderno de teste',questionsCount:12,folder:null,questionBookStats:bookStats(),nextQuestion:question(id,order)}};
  }
  else if(path==='/__fixture/state')result={writes,study:{mode:study.mode,views:study.viewed.size,usageReads:study.usageReads,questionDeliveries:study.questionDeliveries}};
  res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(result));
});
server.listen(fixturePort,'127.0.0.1',()=>console.log('Fixture checkout local em 4029; sem banco ou provedor de cobrança.'));
process.on('SIGTERM',()=>server.close());
