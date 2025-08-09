import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export default function SEO({ 
  title, 
  description = "Discover authentic Latin American products and connect with trusted suppliers. Paisán bridges the gap between Latin American suppliers and global markets.",
  keywords = "Latin American products, wholesale, suppliers, marketplace, Mexico, Colombia, Brazil, import, export, B2B",
  image = "https://paisan.net/social-preview.jpg",
  url = typeof window !== 'undefined' ? window.location.href : 'https://paisan.net',
  type = "website"
}: SEOProps) {
  const fullTitle = `${title} | Paisán`;
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
}