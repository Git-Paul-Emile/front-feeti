import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  url?: string
  image?: string
  type?: 'website' | 'article'
  keywords?: string
}

const SITE_NAME = 'Feeti'
const BASE_URL = 'https://feeti.io'
const DEFAULT_IMAGE = `${BASE_URL}/logo.png`
const FB_PAGE = 'https://www.facebook.com/profile.php?id=61577081093854'

const DEFAULT_DESCRIPTION =
  `Feeti, plateforme tout-en-un de billetterie digitale, contrôle d’accès, loisirs et streaming live en Afrique. Sécurisé, data-driven, conçu pour les promoteurs, artistes et marques.`

export const SEO = ({
  title = `${SITE_NAME} | Tickets · Accès · Loisirs · Streaming`,
  description = DEFAULT_DESCRIPTION,
  url = BASE_URL,
  image = DEFAULT_IMAGE,
  type = 'website',
  keywords,
}: SEOProps) => {
  const fullTitle =
    title === `${SITE_NAME} | Tickets · Accès · Loisirs · Streaming`
      ? title
      : `${title} — ${SITE_NAME}`

  return (
    <Helmet>
      <html lang="fr" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content="Feeti" />
      <link rel="canonical" href={url} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="fr_FR" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      <meta property="article:publisher" content={FB_PAGE} />
    </Helmet>
  )
}
