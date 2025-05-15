import { NextResponse } from 'next/server';
import { createCalendarEvent } from '@/lib/googleCalendar';

export async function POST(request: Request) {
  try {
    const { 
      calendarId, 
      start, 
      end, 
      summary = "Rendez-vous Omnigo",
      description,
      attendees = [],
      location = "",
      timeZone = "Europe/Paris"
    } = await request.json();

    if (!calendarId || !start || !end) {
      return NextResponse.json({ 
        error: 'Paramètres manquants: calendarId, start et end sont requis' 
      }, { status: 400 });
    }

    // Utiliser la fonction mise à jour pour créer l'événement
    const result = await createCalendarEvent(
      calendarId,
      summary,
      description,
      start,
      end,
      attendees,
      timeZone
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la création de l\'événement dans le calendrier',
      details: error.message
    }, { status: 500 });
  }
} 