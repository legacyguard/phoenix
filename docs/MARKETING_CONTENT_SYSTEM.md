# Marketing Content System Documentation

## Overview

The LegacyGuard application now includes a comprehensive internationalized marketing content system designed specifically for estate planning communications. This system provides compelling yet respectful language appropriate for middle-aged and older users concerned about family protection.

## Features

### 🏠 Landing Page Content
- **Hero sections** - Compelling headlines and value propositions
- **Problem statements** - Real challenges that resonate with target audience
- **Solution features** - Clear benefits and capabilities
- **How it works** - Simple step-by-step process
- **Benefits** - Peace of mind and family protection advantages
- **Testimonials** - Authentic customer stories
- **Security messaging** - Trust and confidence building
- **FAQ sections** - Common concerns and questions
- **Call-to-action** - Clear next steps

### 💰 Pricing Content
- **Plan descriptions** - Clear feature differentiation
- **Pricing transparency** - Monthly and annual options
- **Feature comparisons** - Detailed plan comparisons
- **Trial information** - Risk-free trial messaging
- **Support levels** - Customer service differentiation
- **Security features** - Enterprise-grade security included

### ⚖️ Legal Content
- **Terms of Service** - Comprehensive legal terms
- **Privacy Policy** - GDPR and CCPA compliant
- **Cookie Policy** - Transparent cookie usage
- **Legal disclaimers** - Appropriate legal notices
- **Contact information** - Legal and privacy contacts

## Translation Files

### Landing Page (`/src/i18n/locales/{lang}/landing.json`)
```json
{
  "hero": {
    "headline": "Protect Your Family's Future with Confidence",
    "subheadline": "Organize your life's important information so your loved ones are never left searching for answers during difficult times.",
    "primaryCta": "Start Protecting Your Family"
  },
  "problems": {
    "sectionTitle": "The Problems We Solve",
    "problem1": {
      "title": "Chaos After Loss",
      "description": "When tragedy strikes, grieving families shouldn't have to search for passwords, policies, and important documents."
    }
  }
}
```

### Pricing (`/src/i18n/locales/{lang}/pricing.json`)
```json
{
  "header": {
    "title": "Choose Your Family Protection Plan",
    "subtitle": "Comprehensive protection at a price that makes sense for your family"
  },
  "plans": {
    "essential": {
      "name": "Essential Protection",
      "price": "$9.99",
      "features": ["Secure digital vault", "Asset inventory"]
    }
  }
}
```

### Legal Pages (`/src/i18n/locales/{lang}/legal-pages.json`)
```json
{
  "termsOfService": {
    "title": "Terms of Service",
    "sections": {
      "acceptance": {
        "title": "Acceptance of Terms",
        "content": "By accessing or using LegacyGuard, you agree to be bound by these Terms of Service."
      }
    }
  }
}
```

## Usage Examples

### 1. Using the Landing Page Component

```typescript
import { LandingPage } from '@/components/landing';
import { MetaTags } from '@/components/SEO';

const HomePage = () => {
  return (
    <>
      <MetaTags page="landing" />
      <LandingPage />
    </>
  );
};
```

### 2. Using the Pricing Page Component

```typescript
import { PricingPage } from '@/components/pricing';
import { MetaTags } from '@/components/SEO';

const PricingPageComponent = () => {
  return (
    <>
      <MetaTags page="pricing" />
      <PricingPage />
    </>
  );
};
```

### 3. Using Legal Page Components

```typescript
import { TermsOfService, PrivacyPolicy } from '@/components/legal';
import { MetaTags } from '@/components/SEO';

const TermsPage = () => {
  return (
    <>
      <MetaTags page="terms" />
      <TermsOfService />
    </>
  );
};

const PrivacyPage = () => {
  return (
    <>
      <MetaTags page="privacy" />
      <PrivacyPolicy />
    </>
  );
};
```

### 4. Using SEO Meta Tags

```typescript
import { MetaTags } from '@/components/SEO';

const CustomPage = () => {
  return (
    <>
      <MetaTags
        page="custom"
        customTitle="Custom Page Title"
        customDescription="Custom page description"
        customKeywords="custom, keywords"
        ogImage="/images/custom-og.jpg"
        canonicalUrl="https://legacyguard.com/custom-page"
      />
      {/* Page content */}
    </>
  );
};
```

## Component Structure

### Landing Page Sections

| Section | Purpose | Key Elements |
|---------|---------|--------------|
| Hero | Main value proposition | Headline, subheadline, CTAs, trust indicators |
| Problems | Pain point identification | 3 key problems with impacts |
| Solution | Feature presentation | 4 main features with benefits |
| How It Works | Process explanation | 5-step process with timeframes |
| Benefits | Value demonstration | 6 key benefits with icons |
| Testimonials | Social proof | 3 customer stories |
| Security | Trust building | 4 security features |
| FAQ | Objection handling | 5 common questions |
| Final CTA | Conversion | Strong call-to-action |

### Pricing Page Sections

| Section | Purpose | Key Elements |
|---------|---------|--------------|
| Header | Plan overview | Title, subtitle, description |
| Billing Toggle | Pricing options | Monthly/annual toggle |
| Plans | Plan comparison | 3 plans with features |
| Trial | Risk reduction | Trial features and guarantee |
| Security | Trust building | Security features included |
| Support | Service levels | Support by plan level |
| FAQ | Pricing questions | Common pricing concerns |

### Legal Page Sections

| Section | Purpose | Key Elements |
|---------|---------|--------------|
| Header | Page identification | Title, last updated date |
| Introduction | Context setting | Policy overview |
| Sections | Legal content | Structured legal information |
| Compliance | Regulatory info | GDPR, CCPA compliance |
| Contact | Legal contacts | Contact information |

## SEO and Meta Tags

### Meta Tag Structure

```typescript
<MetaTags
  page="landing"                    // Page identifier
  customTitle="Custom Title"        // Override default title
  customDescription="Custom desc"   // Override default description
  customKeywords="custom, keywords" // Override default keywords
  ogImage="/path/to/image.jpg"      // Open Graph image
  ogType="website"                  // Open Graph type
  canonicalUrl="https://..."        // Canonical URL
/>
```

### Supported Page Types

| Page Type | Default Title | Default Description |
|-----------|---------------|-------------------|
| `landing` | Hero headline | Hero subheadline |
| `pricing` | Header title | Header subtitle |
| `terms` | Terms title | Terms description |
| `privacy` | Privacy title | Privacy description |
| `cookies` | Cookie title | Cookie description |

### Structured Data

The system automatically generates structured data for:
- **Organization** - Company information
- **WebSite** - Landing page search functionality
- **Product** - Pricing page product information

## Content Guidelines

### 1. Language and Tone
- Use formal, respectful language appropriate for estate planning
- Maintain cultural sensitivity across all communications
- Ensure professional tone for serious family protection matters
- Use clear, actionable language for CTAs
- Avoid pushy or aggressive marketing language

### 2. Target Audience
- **Primary**: Middle-aged and older adults (40+)
- **Secondary**: Families with children and assets
- **Tertiary**: High-net-worth individuals
- **Focus**: Responsible adults concerned about family protection

### 3. Value Proposition
- **Primary**: Peace of mind through organization
- **Secondary**: Time and money savings
- **Tertiary**: Professional guidance and support
- **Emotional**: Family protection and legacy preservation

### 4. Trust Building
- Security certifications and compliance
- Customer testimonials and social proof
- Transparent pricing and policies
- Professional legal disclaimers
- Clear contact information

## Best Practices

### 1. Content Strategy
- Lead with problems, not features
- Use specific, relatable examples
- Include clear next steps and CTAs
- Address common objections in FAQ
- Provide multiple conversion opportunities

### 2. User Experience
- Clear navigation and information hierarchy
- Mobile-responsive design
- Fast loading times
- Accessible content and design
- Clear contact and support information

### 3. Legal Compliance
- Comprehensive terms and conditions
- GDPR and CCPA compliant privacy policy
- Clear cookie usage information
- Appropriate legal disclaimers
- Jurisdiction-specific requirements

### 4. SEO Optimization
- Relevant meta tags and descriptions
- Structured data markup
- Optimized page titles and headings
- Internal linking strategy
- Mobile-friendly design

## Testing

### Content Testing
```typescript
// Test landing page rendering
const testLanding = (
  <LandingPage />
);

// Test pricing page with different billing cycles
const testPricing = (
  <PricingPage />
);

// Test legal pages
const testTerms = (
  <TermsOfService />
);
```

### Translation Testing
```typescript
// Test translation loading
const { t } = useTranslation('landing');
const headline = t('hero.headline');
console.log(headline); // Should output: "Protect Your Family's Future with Confidence"

// Test interpolation
const greeting = t('hero.greeting', { name: 'John' });
console.log(greeting); // Should output: "Dear John"
```

## Troubleshooting

### Common Issues

1. **Translation not found**
   - Ensure namespace is loaded: `useTranslation(['landing', 'pricing', 'legal-pages'])`
   - Check translation key exists in JSON file
   - Verify language is supported

2. **Component not rendering**
   - Check component imports are correct
   - Verify translation files are loaded
   - Check for console errors

3. **SEO meta tags not updating**
   - Verify MetaTags component is included
   - Check page prop is correct
   - Ensure custom overrides are properly formatted

4. **Legal content not compliant**
   - Review jurisdiction-specific requirements
   - Update legal disclaimers as needed
   - Verify GDPR/CCPA compliance

### Debug Mode

Enable debug logging:
```typescript
// In i18n configuration
debug: true
```

## Maintenance

### Adding New Content

1. **New Landing Page Section**
   - Add translation keys to `/src/i18n/locales/en/landing.json`
   - Update `LandingPage` component
   - Copy translations to all language directories

2. **New Pricing Plan**
   - Add plan to `/src/i18n/locales/en/pricing.json`
   - Update `PricingPage` component
   - Update comparison table

3. **New Legal Page**
   - Add content to `/src/i18n/locales/en/legal-pages.json`
   - Create new component
   - Update routing and navigation

### Updating Content

1. **Marketing Copy Updates**
   - Edit English translation files
   - Run copy script to update all languages
   - Test components with new content

2. **Legal Content Updates**
   - Review with legal team
   - Update translation files
   - Update last modified dates
   - Test legal page components

3. **SEO Updates**
   - Update meta tag content
   - Review structured data
   - Test search engine previews

## Support

For questions or issues with the marketing content system:

1. Check the troubleshooting section above
2. Review translation files for accuracy
3. Test components in different languages
4. Verify legal compliance requirements
5. Contact the development team for assistance

## Future Enhancements

- **A/B Testing** - Test different content variations
- **Analytics** - Track content performance and conversions
- **Personalization** - Dynamic content based on user segments
- **Localization** - Jurisdiction-specific legal requirements
- **Content Management** - Visual content editor
- **Performance** - Content optimization and caching 