import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ 
  title = 'Dispersed - Find Dispersed Camping Sites',
  description = 'Explore National Forest dispersed camping locations with interactive maps, weather forecasts, and user reviews. Find your perfect backcountry camping spot.',
  keywords = 'dispersed camping, national forest, camping, backcountry, outdoor recreation, camping sites, forest service',
  author = 'Dispersed Camping Community',
  image = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200',
  url = window.location.href,
  type = 'website'
}) {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Dispersed" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
}
