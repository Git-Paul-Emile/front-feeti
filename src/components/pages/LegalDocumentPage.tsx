import { Fragment, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../SEO';
import {
  LEGAL_DOCUMENTS, LEGAL_ORDER, LEGAL_VERSION, LEGAL_EFFECTIVE_DATE,
  type LegalBlock, type LegalSlug,
} from '../../data/legalPack';
import './LegalDocumentPage.css';

// Rend les adresses e-mail cliquables dans le texte juridique
function withMailLinks(text: string) {
  const parts = text.split(/([\w.+-]+@[\w-]+\.[\w.]+)/g);
  return parts.map((part, i) =>
    /^[\w.+-]+@[\w-]+\.[\w.]+$/.test(part)
      ? <a key={i} href={`mailto:${part}`}>{part}</a>
      : <Fragment key={i}>{part}</Fragment>
  );
}

function Block({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case 'h2': return <h2>{block.text}</h2>;
    case 'h3': return <h3>{block.text}</h3>;
    case 'p': return <p>{withMailLinks(block.text)}</p>;
    case 'note': return <p className="legal-doc__note">{withMailLinks(block.text)}</p>;
    case 'list':
      return <ul>{block.items.map((item, i) => <li key={i}>{withMailLinks(item)}</li>)}</ul>;
  }
}

export function LegalDocumentPage({ slug }: { slug: LegalSlug }) {
  const doc = LEGAL_DOCUMENTS[slug];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  return (
    <div className="legal-doc">
      <SEO title={doc.title} description={doc.description} url={`https://feeti.io/legal/${slug}`} />

      <header className="legal-doc__hero">
        <p className="legal-doc__eyebrow">Pack juridique &amp; conformité</p>
        <h1>{doc.title}</h1>
        <p className="legal-doc__meta">{LEGAL_VERSION} · Entrée en vigueur : {LEGAL_EFFECTIVE_DATE}</p>
      </header>

      <div className="legal-doc__layout">
        <nav className="legal-doc__nav" aria-label="Documents légaux">
          <p className="legal-doc__nav-title">Documents</p>
          {LEGAL_ORDER.map((s) => (
            <Link key={s} to={`/legal/${s}`} className={s === slug ? 'is-active' : undefined} aria-current={s === slug ? 'page' : undefined}>
              <span>{LEGAL_DOCUMENTS[s].letter}</span>
              {LEGAL_DOCUMENTS[s].shortTitle}
            </Link>
          ))}
          <Link to="/contact" className="legal-doc__nav-contact">Une question ? Nous contacter</Link>
        </nav>

        <article className="legal-doc__content">
          {doc.intro && <p className="legal-doc__intro">{withMailLinks(doc.intro)}</p>}
          {doc.blocks.map((block, i) => <Block key={i} block={block} />)}
        </article>
      </div>
    </div>
  );
}

export default LegalDocumentPage;
