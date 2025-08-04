import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NotarizeService } from '@/services/NotarizeService';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { documentId, signatureData } = body;

    if (!documentId || !signatureData) {
      return new Response('Missing required fields', { status: 400 });
    }

    const notarizeService = new NotarizeService();
    const result = await notarizeService.notarizeDocument({
      documentId,
      userId: session.user.id,
      signatureData
    });

    return Response.json(result);
  } catch (error) {
    console.error('Notarization error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to notarize document' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
