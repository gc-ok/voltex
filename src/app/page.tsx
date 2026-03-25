import { LandingClient } from '@/components/landing/LandingClient';

// Schema.org structured data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'GC Volley',
  applicationCategory: 'SportsApplication',
  operatingSystem: 'Web',
  description: 'Interactive volleyball playbook with animated plays, rotation validation, custom formations, coverage strategies, rally builder, and team quiz mode.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Animated volleyball play diagrams',
    'Serve receive formation builder for 5-1, 6-2, and 4-2 systems',
    'Rotation validation with rule checking',
    'Custom team formations with drag-and-drop positioning',
    'Coverage strategy configuration (perimeter, rotational, man-up)',
    'Rally sequence builder',
    'Interactive quiz mode for player training',
    'Defense type templates',
  ],
};

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'GC Volley',
  description: 'Visual volleyball coaching platform',
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <LandingClient />
    </>
  );
}
