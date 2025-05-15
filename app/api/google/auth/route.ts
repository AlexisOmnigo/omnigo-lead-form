import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// Configuration OAuth 2.0 pour Google API
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Générer une URL d'authentification
export async function GET() {
  try {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });

    return NextResponse.json({ authUrl: authorizationUrl });
  } catch (error) {
    console.error('Erreur lors de la génération de l\'URL d\'authentification:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération de l\'URL d\'authentification' }, { status: 500 });
  }
}

// Traiter le callback après authentification
export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json({ error: 'Code d\'autorisation manquant' }, { status: 400 });
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Dans une implémentation réelle, vous stockeriez ces tokens dans une base de données
    // associée à l'utilisateur pour les utiliser lors de futures requêtes

    return NextResponse.json({ success: true, tokens });
  } catch (error) {
    console.error('Erreur lors de l\'échange du code d\'autorisation:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'échange du code d\'autorisation' }, { status: 500 });
  }
} 