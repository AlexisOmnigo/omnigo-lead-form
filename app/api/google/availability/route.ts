import { NextResponse } from 'next/server';
import { getAvailableTimeSlots } from '@/lib/googleCalendar';

export async function POST(request: Request) {
  try {
    const { calendarId, startDate, endDate, timeZone = '/Paris', duration = 30 } = await request.json();
    
    if (!calendarId || !startDate || !endDate) {
      return NextResponse.json({ 
        error: 'Paramètres manquants: calendarId, startDate et endDate sont requis' 
      }, { status: 400 });
    }

    try {
      // Utiliser la fonction mise à jour pour récupérer les créneaux disponibles
      const availableSlots = await getAvailableTimeSlots(
        calendarId,
        new Date(startDate),
        new Date(endDate),
        duration,
        timeZone
      );
      
      return NextResponse.json({ availableSlots });
    } catch (serviceError) {
      console.error(`Erreur du service Calendar: ${serviceError.message}`);
      throw serviceError;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des disponibilités:', error);
    
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération des disponibilités',
      details: error.message,
      statusCode: error.status || 500
    }, { status: error.status || 500 });
  }
} 