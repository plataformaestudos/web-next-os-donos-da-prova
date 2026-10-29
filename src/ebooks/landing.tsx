"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRightOutlined, CheckOutlined, FilePdfOutlined, CreditCardOutlined, MailOutlined, BookOutlined, QuestionCircleOutlined, ClockCircleOutlined, CustomerServiceOutlined } from "@ant-design/icons";
import { EbookPageContent, EbookPageSections, EbookProduct } from "./types";
import { formatEbookPrice } from "./format";
import { ebookFaqDescription, ebookFaqHeading, ebookFaqItems, ebookFaqTitle } from "./faq";
import styles from "./ebooks.module.css";

export function EbookBrand() {
  return <span className={styles.brand}><span className={styles.logo}><Image src="/images/passaro.png" alt="" width={28} height={38} /></span><span>Os Donos da Prova</span></span>;
}

export function EbookFooter() {
  return <footer className={styles.footer}><div className={styles.container}><EbookBrand /><p>Material digital. Download e envio do link por email após confirmação do pagamento.</p><nav aria-label="Informações legais"><Link href="/termos-de-uso">Termos de uso</Link><Link href="/politica-privacidade">Privacidade</Link><Link href="/ebooks/recuperar">Recuperar ebook</Link></nav><small>© {new Date().getFullYear()} Os Donos da Prova</small></div></footer>;
}

export function EbookCover({ ebook }: { ebook: EbookProduct }) {
  return <div className={styles.coverFrame}><div className={styles.cover}><EbookBrand /><div><span className={styles.coverLine} /><p>MATERIAL PARA ESTUDOS</p><h2>{ebook.title || "Título do ebook"}</h2><p>{ebook.description}</p></div><div className={styles.coverBottom}>Os Donos da Prova <span>Material digital • PDF</span></div></div><div className={styles.caption}>PDF digital <span>Celular e computador</span></div></div>;
}

export interface EbookLandingProps {
  ebook: EbookProduct;
  content: EbookPageContent;
  sections: EbookPageSections;
  path?: string;
  pageId?: string;
  preview?: boolean;
}

/** Public landing and unsaved ADMIN preview deliberately share this renderer. */
export function EbookLanding({ ebook, content, sections, path = "", preview = false }: EbookLandingProps) {
  const checkoutUrl = `/ebooks/checkout?path=${encodeURIComponent(path)}`;
  const cta = content.ctaText || "Comprar ebook";
  const buyButton = (extraClass = "") => preview
    ? <button type="button" className={`${styles.buy} ${extraClass}`} disabled aria-label="Compra desabilitada na prévia">{cta} <ArrowRightOutlined /></button>
    : <a href={checkoutUrl} className={`${styles.buy} ${extraClass}`}>{cta} <ArrowRightOutlined /></a>;
  return <div className={styles.shell} data-ebook-preview={preview || undefined}>
    <header className={styles.header}><div className={styles.headerInner}><EbookBrand /><nav aria-label="Seções do ebook">{sections.benefits && <a href="#beneficios">O material</a>}{sections.contents && <a href="#conteudo">Conteúdo</a>}<a href="#duvidas">Dúvidas</a></nav>{buyButton(styles.headerBuy)}</div></header>
    <main>
      <section className={`${styles.container} ${styles.hero}`}>
        <div><span className={styles.badge}>MATERIAL DIGITAL • PDF</span><p className={styles.eyebrow}>{ebook.title}</p><h1>{content.headline || "Seu próximo passo começa com uma boa preparação."}</h1><p className={styles.intro}>{content.description}</p><div className={styles.priceCard}><div className={styles.priceLine}><strong>{formatEbookPrice(ebook.priceCents)}</strong><span>Pagamento único</span></div>{buyButton()}<div className={styles.assurances}><span><FilePdfOutlined /> PDF digital</span><span><CreditCardOutlined /> Pix ou cartão</span><span><CheckOutlined /> Download após confirmação</span></div></div></div>
        <div className={styles.heroArt}>{content.bannerDesktopUrl || content.bannerMobileUrl ? <picture><source media="(max-width: 700px)" srcSet={content.bannerMobileUrl || content.bannerDesktopUrl} /><img className={styles.banner} src={content.bannerDesktopUrl || content.bannerMobileUrl} alt={`Capa do ebook ${ebook.title}`} /></picture> : <EbookCover ebook={ebook} />}</div>
      </section>
      {sections.benefits && <section id="beneficios" className={`${styles.section} ${styles.softSection}`}><div className={styles.container}><div className={styles.sectionHeading}><p className={styles.eyebrow}>SEUS ESTUDOS COM MAIS DIREÇÃO</p><h2>{content.benefitsTitle || "Um material para estudar com mais direção"}</h2></div><div className={styles.benefitGrid}>{content.benefits.map((item, index) => <article className={styles.card} key={index}><span className={styles.cardIcon}><BookOutlined /></span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div></div></section>}
      {sections.contents && <section id="conteudo" className={styles.section}><div className={styles.container}><div className={styles.sectionHeading}><p className={styles.eyebrow}>CONTEÚDO DO EBOOK</p><h2>{content.contentsTitle || "O que você vai encontrar"}</h2></div><div className={styles.contentsGrid}>{content.contents.map((item, index) => <article className={styles.contentItem} key={index}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{item.title}</h3><p>{item.description}</p></div></article>)}</div></div></section>}
      <section className={`${styles.section} ${styles.howSection}`}><div className={styles.container}><div className={styles.sectionHeading}><p className={styles.eyebrow}>SIMPLES, DO COMEÇO AO ESTUDO</p><h2>Como funciona</h2></div><div className={styles.steps}>{[{ title: "Escolha o pagamento", text: "Pague com Pix ou cartão de crédito à vista.", icon: <CreditCardOutlined /> }, { title: "Aguarde a confirmação", text: "Você acompanha o pagamento na página do pedido.", icon: <CheckOutlined /> }, { title: "Receba seu ebook", text: "Baixe o PDF após a confirmação e receba o link por email.", icon: <MailOutlined /> }].map((step, index) => <article key={step.title}><span className={styles.stepIcon}>{step.icon}</span><h3>{index + 1}. {step.title}</h3><p>{step.text}</p></article>)}</div></div></section>
      <section id="duvidas" className={styles.section}><div className={`${styles.container} ${styles.faq}`}><div className={styles.sectionHeading}><p className={styles.eyebrow}>{ebookFaqTitle}</p><h2>{ebookFaqHeading}</h2><p>{ebookFaqDescription}</p></div>{ebookFaqItems.map((item, index) => { const Icon = [QuestionCircleOutlined, ClockCircleOutlined, FilePdfOutlined, CustomerServiceOutlined][index]; return <article className={styles.faqCard} key={item.question}><h3><Icon aria-hidden="true" />{item.question}</h3><p>{item.answer}</p></article>; })}</div></section>
      <section className={styles.finalCta}><div className={styles.container}><h2>Seu próximo passo começa aqui.</h2><p>{ebook.title}</p><strong>{formatEbookPrice(ebook.priceCents)}</strong><span>Pagamento único • Pix ou cartão à vista</span>{buyButton()}<small>Compra sem conta e sem senha. Acesso após confirmação do pagamento.</small></div></section>
    </main>
    <EbookFooter /><div className={styles.mobileBuy}><div><strong>{formatEbookPrice(ebook.priceCents)}</strong><small>Pagamento único</small></div>{buyButton()}</div>
  </div>;
}
