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
      timeZone = "America/Montreal"
    } = await request.json();

    if (!calendarId || !start || !end) {
      return NextResponse.json({ 
        error: 'Paramètres manquants: calendarId, start et end sont requis' 
      }, { status: 400 });
    }

    // Log des informations reçues pour débogage
    console.log("=== CRÉATION D'ÉVÉNEMENT ===");
    console.log(`CalendarID: ${calendarId}`);
    console.log(`Summary: ${summary}`);
    console.log(`Attendees: ${JSON.stringify(attendees)}`);
    console.log(`Description: ${description ? description.substring(0, 100) + '...' : 'Non fournie'}`);
    console.log("===========================");

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

    return NextResponse.json({ success: true, event: result });
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la création de l\'événement dans le calendrier',
      details: error.message
    }, { status: 500 });
  }
} 