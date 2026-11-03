/* eslint-disable @next/next/no-img-element -- Uploaded images have dynamic sizes and public storage URLs. */
"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRightOutlined, CheckOutlined, FilePdfOutlined, CreditCardOutlined, MailOutlined, BookOutlined, SafetyCertificateOutlined, AimOutlined, ReadOutlined, TeamOutlined, PlusOutlined } from "@ant-design/icons";
import { EbookPageContent, EbookPageSections, EbookProduct } from "./types";
import { formatEbookPrice } from "./format";
import { ebookFaqDescription, ebookFaqTitle } from "./faq";
import styles from "./ebooks.module.css";
import pageStyles from "./landing.module.css";

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
  const highlights = content.showHighlights === false ? [] : content.highlights || [];
  const strategy = content.showStrategy === false ? [] : content.strategy || [];
  const samples = content.showSamples === false ? [] : content.samples || [];
  const audience = content.showAudience === false ? [] : content.audience || [];
  const buyButton = (extraClass = "") => preview
    ? <button type="button" className={`${pageStyles.buy} ${extraClass}`} disabled aria-label="Compra desabilitada na prévia">{cta}<ArrowRightOutlined /></button>
    : <a href={checkoutUrl} className={`${pageStyles.buy} ${extraClass}`}>{cta}<ArrowRightOutlined /></a>;
  const heading = (eyebrow: string, title: string, description?: string, left = false) =>
    <div className={`${pageStyles.sectionHeading} ${left ? pageStyles.alignLeft : ""}`}><p className={pageStyles.eyebrow}>{eyebrow}</p><h2>{title}</h2>{description && <p>{description}</p>}</div>;

  return <div className={`${styles.shell} ${pageStyles.landing}`} data-ebook-preview={preview || undefined}>
    <header className={pageStyles.header}><div className={pageStyles.headerInner}>
      <EbookBrand />
      <nav aria-label="Seções do ebook">
        {sections.contents && <a href="#conteudo">Conteúdo</a>}
        {sections.benefits && <a href="#beneficios">Diferenciais</a>}
        {samples.length > 0 && <a href="#amostras">Amostras</a>}
        {audience.length > 0 && <a href="#publico">Para quem é</a>}
        {sections.faq && <a href="#duvidas">Dúvidas</a>}
      </nav>
      {buyButton(pageStyles.headerBuy)}
    </div></header>
    <main>
      <section className={pageStyles.heroSection}><div className={`${pageStyles.container} ${pageStyles.hero}`}>
        <div className={pageStyles.heroCopy}>
          <span className={pageStyles.badge}><BookOutlined />{content.heroLabel || ebook.title || "Ebook • Os Donos da Prova"}</span>
          <h1>{content.headline || "Seu próximo passo começa com uma boa preparação."}{content.headlineHighlight && <> <span>{content.headlineHighlight}</span></>}</h1>
          <p className={pageStyles.intro}>{content.description}</p>
          {highlights.length > 0 && <div className={pageStyles.pills}>{highlights.slice(0, 3).map((item, index) => <span key={index}><CheckOutlined />{item.title} {item.description}</span>)}</div>}
          <div className={pageStyles.priceCard}>
            <span className={pageStyles.priceLabel}>Material digital completo</span>
            <div className={pageStyles.priceLine}><strong>{formatEbookPrice(ebook.priceCents)}</strong><span>Pagamento único</span></div>
            {buyButton()}
            <div className={pageStyles.assurances}><span><FilePdfOutlined /> PDF digital</span><span><CreditCardOutlined /> Pix ou cartão à vista</span></div>
            <p className={pageStyles.deliveryNote}>Download liberado após a confirmação do pagamento.</p>
          </div>
        </div>
        <div className={pageStyles.heroArt}>{content.bannerDesktopUrl || content.bannerMobileUrl
          ? <picture><source media="(max-width: 700px)" srcSet={content.bannerMobileUrl || content.bannerDesktopUrl} /><img className={pageStyles.banner} src={content.bannerDesktopUrl || content.bannerMobileUrl} alt={`Apresentação do ebook ${ebook.title}`} fetchPriority="high" /></picture>
          : <EbookCover ebook={ebook} />}</div>
      </div></section>

      {highlights.length > 0 && <section className={pageStyles.highlights} aria-label="Destaques do material"><div className={`${pageStyles.container} ${pageStyles.highlightsGrid}`}>{highlights.map((item, index) => <div key={index}><strong>{item.title}</strong><span>{item.description}</span></div>)}</div></section>}

      {sections.benefits && <section id="beneficios" className={`${pageStyles.section} ${pageStyles.softSection}`}><div className={pageStyles.container}>
        {heading("Preparação com propósito", content.benefitsTitle || "Ler é importante. Saber aplicar é essencial.", content.benefitsDescription, true)}
        <div className={pageStyles.cardGrid}>{content.benefits.map((item, index) => <article className={pageStyles.card} key={index}><span className={pageStyles.cardIcon}><AimOutlined /></span><span className={pageStyles.itemLabel}>Diferencial {String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div>
      </div></section>}

      {sections.contents && <section id="conteudo" className={pageStyles.section}><div className={pageStyles.container}>
        {heading("Por dentro do material", content.contentsTitle || "O que você encontra no ebook?", content.contentsDescription)}
        <div className={content.coverUrl ? pageStyles.contentsWithCover : undefined}>
          {content.coverUrl && <div className={pageStyles.contentCover}><img src={content.coverUrl} alt={`Capa do ebook ${ebook.title}`} loading="lazy" /></div>}
          <div className={pageStyles.contentsGrid}>{content.contents.map((item, index) => <article className={pageStyles.contentCard} key={index}><span className={pageStyles.cardIcon}><ReadOutlined /></span><span className={pageStyles.itemLabel}>Conteúdo {String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div>
        </div>
      </div></section>}

      {strategy.length > 0 && <section id="estrategia" className={`${pageStyles.section} ${pageStyles.softSection}`}><div className={pageStyles.container}>
        {heading("Estratégia de estudo", content.strategyTitle || "Vá além da memorização.", content.strategyDescription, true)}
        <div className={pageStyles.strategyLayout}><div className={pageStyles.strategyList}>{strategy.map((item, index) => <article key={index}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{item.title}</h3><p>{item.description}</p></div></article>)}</div>
          <aside className={pageStyles.mascot}><Image src="/images/mascote-celular.png" alt="Zé das Provas, mascote do Os Donos da Prova" width={280} height={300} /><span>OS DONOS DA PROVA</span><p>Seu próximo passo começa com uma boa preparação.</p></aside>
        </div>
      </div></section>}

      {samples.length > 0 && <section id="amostras" className={pageStyles.section}><div className={pageStyles.container}>
        {heading("Uma prévia dos seus estudos", content.samplesTitle || "Conheça o material antes de começar.", content.samplesDescription)}
        <div className={pageStyles.samplesGrid}>{samples.map((item, index) => <figure className={pageStyles.sample} key={index}><div className={pageStyles.sampleHeading}><FilePdfOutlined /><span>{item.title}</span><span>{String(index + 1).padStart(2, "0")}</span></div>{item.imageUrl ? <img src={item.imageUrl} alt={item.title} loading="lazy" /> : preview && <div className={pageStyles.imagePlaceholder}>Escolha uma imagem da amostra</div>}<figcaption>{item.description}</figcaption></figure>)}</div>
      </div></section>}

      {audience.length > 0 && <section id="publico" className={`${pageStyles.section} ${pageStyles.softSection}`}><div className={pageStyles.container}>
        {heading("Foco na sua preparação", content.audienceTitle || "Para quem é este ebook?", content.audienceDescription)}
        <div className={pageStyles.cardGrid}>{audience.map((item, index) => <article className={pageStyles.card} key={index}><span className={pageStyles.cardIcon}><TeamOutlined /></span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div>
      </div></section>}

      <section id="comprar" className={pageStyles.offerSection}><div className={pageStyles.container}>
        {heading("Material digital completo • Pagamento único", content.finalTitle || "Sua preparação merece o próximo passo.", content.finalDescription || ebook.title)}
        <div className={pageStyles.offerCard}>
          {(content.coverUrl || content.bannerDesktopUrl) && <img className={pageStyles.offerCover} src={content.coverUrl || content.bannerDesktopUrl} alt={`Ebook ${ebook.title}`} loading="lazy" />}
          <p className={pageStyles.offerTitle}>{ebook.title}</p><span className={pageStyles.priceLabel}>Investimento único</span><strong className={pageStyles.offerPrice}>{formatEbookPrice(ebook.priceCents)}</strong><p className={pageStyles.offerTerms}>Sem mensalidades • Pix ou cartão à vista</p>
          {buyButton()}
          <ul className={pageStyles.offerDetails}><li><SafetyCertificateOutlined /> Compra sem conta e sem senha</li><li><FilePdfOutlined /> Download após confirmação do pagamento</li><li><MailOutlined /> Link de acesso enviado por email</li></ul>
        </div>
      </div></section>

      {sections.faq && <section id="duvidas" className={`${pageStyles.section} ${pageStyles.softSection}`}><div className={`${pageStyles.container} ${pageStyles.faq}`}>
        {heading("Dúvidas sobre a compra", content.faqTitle || ebookFaqTitle, ebookFaqDescription)}
        {content.faq.map((item, index) => <details key={index}><summary>{item.question}<PlusOutlined /></summary><p>{item.answer}</p></details>)}
      </div></section>}
    </main>
    <EbookFooter />
    <div className={pageStyles.mobileBuy}><div><strong>{formatEbookPrice(ebook.priceCents)}</strong><small>Pagamento único</small></div>{buyButton()}</div>
  </div>;
}
