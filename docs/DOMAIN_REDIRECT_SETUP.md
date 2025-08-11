# Domain Redirect Setup Guide

## Overview

The LegacyGuard application supports automatic domain redirection based on user's country selection. This feature can operate in two modes:

1. **Production Mode**: Performs actual redirects to country-specific domains
2. **Development/Staging Mode**: Shows redirect simulations without actually redirecting

## Configuration

### Environment Variable

Set the `VITE_IS_PRODUCTION` environment variable in your `.env` file:

```bash
# For production (enables actual redirects)
VITE_IS_PRODUCTION=true

# For development/staging (shows redirect simulations)
VITE_IS_PRODUCTION=false
```

## Supported Domains

The application supports the following country-to-domain mappings:

| Country                | Domain         |
| ---------------------- | -------------- |
| Germany                | legacyguard.eu |
| France                 | legacyguard.fr |
| Spain                  | legacyguard.es |
| Italy                  | legacyguard.it |
| Netherlands            | legacyguard.nl |
| Belgium                | legacyguard.be |
| Luxembourg             | legacyguard.lu |
| Switzerland            | legacyguard.ch |
| Liechtenstein          | legacyguard.li |
| Austria                | legacyguard.at |
| United Kingdom         | legacyguard.uk |
| Denmark                | legacyguard.dk |
| Sweden                 | legacyguard.se |
| Finland                | legacyguard.fi |
| Czech Republic         | legacyguard.cz |
| Slovakia               | legacyguard.sk |
| Poland                 | legacyguard.pl |
| Hungary                | legacyguard.hu |
| Slovenia               | legacyguard.si |
| Estonia                | legacyguard.ee |
| Latvia                 | legacyguard.lv |
| Lithuania              | legacyguard.lt |
| Portugal               | legacyguard.pt |
| Greece                 | legacyguard.gr |
| Malta                  | legacyguard.mt |
| Cyprus                 | legacyguard.cy |
| Ireland                | legacyguard.ie |
| Norway                 | legacyguard.no |
| Iceland                | legacyguard.is |
| Romania                | legacyguard.ro |
| Bulgaria               | legacyguard.bg |
| Croatia                | legacyguard.hr |
| Serbia                 | legacyguard.rs |
| Albania                | legacyguard.al |
| North Macedonia        | legacyguard.mk |
| Montenegro             | legacyguard.me |
| Moldova                | legacyguard.md |
| Ukraine                | legacyguard.ua |
| Bosnia and Herzegovina | legacyguard.ba |

## How It Works

### Production Mode (`VITE_IS_PRODUCTION=true`)

When a user:

- Registers with a country selection
- Logs in and has a country preference
- Manually selects a country from the country/language modal

The application will:

1. Determine the appropriate domain based on the country
2. Preserve the current path and query parameters
3. Preserve session tokens if available
4. Perform an actual redirect to the country-specific domain

### Development/Staging Mode (`VITE_IS_PRODUCTION=false`)

In non-production environments, instead of redirecting, the application will:

1. Show a toast notification with the message:

   ```
   V produkci by jste byli přesměrováni na: https://[target-domain]
   ```

2. Display a modal dialog with:
   - The target domain that would be used in production
   - A note that this is a simulation
   - The current environment configuration

3. Log the redirect simulation to the browser console

## Usage in Code

The domain redirect functionality is centralized in the `domainRedirectService`:

```typescript
import { domainRedirectService } from "@/utils/domainRedirect";

// Redirect to a country-specific domain
domainRedirectService.redirectToDomain("CZ", {
  preserveSession: true,
  preservePath: true,
});

// Check if current domain matches expected domain
const isCorrect = domainRedirectService.isCorrectDomain("CZ");

// Get target domain for a country
const domain = domainRedirectService.getTargetDomain("CZ");
```

## Testing

To test the redirect functionality:

1. Set `VITE_IS_PRODUCTION=false` in your `.env` file
2. Run the application
3. Trigger a country selection (via registration, login, or country modal)
4. Verify that:
   - A toast notification appears
   - A modal dialog shows the redirect simulation
   - Console logs show the redirect information
   - No actual redirect occurs

5. To test production behavior, set `VITE_IS_PRODUCTION=true` and verify actual redirects occur

## Security Considerations

- Session tokens are preserved during redirects to maintain user authentication
- The redirect service only redirects to predefined, trusted domains
- Cross-domain session handling should be implemented on the backend for seamless authentication
