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
const quote = body => {
  const plan=plans.find(p=>p.id===body.planId)||plans[0];
  const values={MONTHLY:plan.monthValue,QUARTERLY:plan.quarterlyValue,SEMIANNUALLY:plan.semiannualValue,YEARLY:plan.annualValue};
  const baseAmountCents=Math.round((values[body.cycle]||59.9)*100);const discountAmountCents=Math.round(baseAmountCents*.2);
  return {quoteToken:'fixture.'+'a'.repeat(64),quoteId:'22222222-2222-4222-8222-222222222222',expiresAt:new Date(Date.now()+900000).toISOString(),campaign:{title:'Campanha de teste',slug:'checkout20'},discount:{type:'PERCENTAGE',value:2000,duration:'PERMANENT'},planId:body.planId,cycle:body.cycle,baseAmountCents,discountAmountCents,finalAmountCents:baseAmountCents-discountAmountCents,currency:'BRL',eligibility:'PRELIMINARY'};
};
const server=http.createServer(async(req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','http://localhost:3137');
  res.setHeader('Access-Control-Allow-Credentials','true');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,DELETE,OPTIONS');
  if(req.method==='OPTIONS'){res.writeHead(204);return res.end();}
  let raw='';for await(const c of req)raw+=c;
  const body=raw?JSON.parse(raw):{};const path=new URL(req.url,'http://fixture').pathname;
  let status=200,result={data:[]};
  if(path==='/public/plans')result={data:plans};
  else if(path==='/subscription-plans/availables')result={data:plans.filter(p=>!p.isFree)};
  else if(path==='/auth/me')result={id:'fixture-student',email:'student@example.test'};
  else if(path==='/profiles/me')result={data:{id:'fixture-profile',user_id:'fixture-student',role_id:'8f36e1ce-e12e-4237-b16b-4ad7723d8f2b',name:'Aluno de teste',nickname:'Aluno'}};
  else if(path==='/terms')result={data:{termsOfUse:{id:'terms',version:'1',title:'Termos de teste',content:'Fixture local'},privacyPolicy:{id:'privacy',version:'1',title:'Privacidade de teste',content:'Fixture local'}}};
  else if(path==='/affiliate-links/public/code'){
    await new Promise(r=>setTimeout(r,350));
    if(body.code==='checkout20')result={...quote(body),referralToken:'r'.repeat(43),referralExpiresAt:new Date(Date.now()+86400000).toISOString()};
    else {status=404;result={message:'Código de desconto não encontrado.'};}
  }else if(path==='/affiliate-links/public/quote'){
    await new Promise(r=>setTimeout(r,250));
    if(body.cycle==='QUARTERLY'){status=409;result={message:'Esta oferta não está disponível para o ciclo selecionado.'};}
    else result=quote(body);
  }else if(path==='/subscription/new-user'||path==='/subscription'){
    writes.push({kind:path,planId:body.planId,billingType:body.billingType,cycle:body.cycle,saveCard:body.saveCard,termsAccepted:body.termsAccepted,privacyAccepted:body.privacyAccepted,autoChargeAccepted:body.autoChargeAccepted,cancellationPolicyAccepted:body.cancellationPolicyAccepted,hasQuote:!!body.quoteToken,hasReferral:!!body.referralToken,cardEmpty:body.creditCard?.number===''});
    await new Promise(r=>setTimeout(r,500));
    if(body.billingType==='FREE')result={data:{id:'fixture-free-subscription',value:0}};
    else {status=409;result={message:'Falha de teste: nenhuma cobrança foi realizada.'};}
  }else if(path==='/auth/login')result={id:'fixture-student'};
  else if(path==='/__fixture/state')result={writes};
  res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(result));
});
server.listen(fixturePort,'127.0.0.1',()=>console.log('Fixture checkout local em 4029; sem banco ou provedor de cobrança.'));
process.on('SIGTERM',()=>server.close());
