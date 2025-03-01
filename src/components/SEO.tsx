import React from 'react';
import Head from '@docusaurus/Head';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  canonical?: string;
}

export function SEO({
  title,
  description,
  keywords,
  image,
  canonical,
}: SEOProps): JSX.Element {
  return (
    <Head>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords.join(', ')} />}
      {image && <meta property="og:image" content={image} />}
      {canonical && <link rel="canonical" href={canonical} />}
    </Head>
  );
} 