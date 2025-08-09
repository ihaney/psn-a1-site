import React from 'react';
import SEO from '../components/SEO';

export default function AboutPage() {
  return (
    <>
      <SEO 
        title="About Us"
        description="Learn about Paisán's mission to connect Latin American suppliers with global markets. Discover how we're bridging the gap in international trade."
        keywords="About Paisán, Latin American trade, B2B marketplace, supplier network, international trade"
      />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Central Title Section */}
          <div className="text-center">
            <h1
              style={{ color: '#F4A024' }}
              className="text-6xl font-bold mb-4 paisan-text"
            >
              Paisán
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Connecting Latin American Suppliers to global markets
            </p>
          </div>

          {/* Mission Section */}
          <div className="text-center">
            <h2 style={{ color: '#F4A024' }} className="text-2xl font-bold mb-4">
              Our Mission
            </h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Our mission is to unlock global opportunities for Latin American suppliers by increasing their visibility and access to international markets. We believe that Latin America is rich in high-quality products, entrepreneurial talent, and untapped potential — and Paisán exists to amplify those strengths. By connecting verified suppliers with buyers around the world, we aim to reduce friction in cross-border trade and help businesses of all sizes thrive through trusted relationships and transparent commerce.
            </p>
          </div>

          {/* Vision Section */}
          <div className="text-center">
            <h2 style={{ color: '#F4A024' }} className="text-2xl font-bold mb-4">
              Our Vision
            </h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Our vision is to establish Paisán as the most trusted and innovative platform for discovering and sourcing Latin American products. We aspire to build a future where global supply chains are more inclusive, resilient, and diverse — powered by seamless B2B integrations and localized expertise. Through technology, transparency, and community, we envision a marketplace that not only bridges geographic gaps but also empowers sustainable economic growth across Latin America.
            </p>
          </div>

        </div>
      </div>
    </>
  );
}