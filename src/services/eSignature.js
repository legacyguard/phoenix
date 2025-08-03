import { Client } from 'docusign-esign';

const client = new Client({
  basePath: process.env.DOCUSIGN_BASE_PATH,
  auth: {
    clientId: process.env.DOCUSIGN_CLIENT_ID,
    clientSecret: process.env.DOCUSIGN_CLIENT_SECRET,
    accessToken: process.env.DOCUSIGN_ACCESS_TOKEN,
  }
});

export function createSignature(willId) {
  // DocuSign logic
}

