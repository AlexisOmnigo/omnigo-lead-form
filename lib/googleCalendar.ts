import { google } from 'googleapis';
import * as fs from 'fs';
import path from 'path';

// Configurer le client OAuth avec le compte de service pour Google Calendar
export const getOAuth2Client = (calendarId: string) => {
  try {
    // Utiliser un chemin relatif au lieu d'un chemin absolu
    const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), '.key.json');
    
    console.log(`Tentative de lecture du fichier de clé: ${keyPath}`);
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(keyPath)) {
      console.error(`Le fichier de clé n'existe pas à l'emplacement: ${keyPath}`);
      throw new Error(`Fichier de clé introuvable: ${keyPath}`);
    }
    
    // Lire le fichier de clé JSON
    const keyContent = fs.readFileSync(keyPath, 'utf8');
    const credentials = JSON.parse(keyContent);
    
    // Utiliser directement l'email de l'employé (calendarId)
    console.log(`Accès au calendrier de: ${calendarId}`);
    
    // S'assurer que les scopes sont correctement formatés
    const scopes = (process.env.GCALENDAR_SCOPES || '').split(',').map(scope => scope.trim());
    
    // Créer un client JWT avec le compte de service
    const jwtClient = new google.auth.JWT(
      credentials.client_email,
      undefined,
      credentials.private_key,
      scopes,
      calendarId // Utilisateur à impersonifier = email de l'employé
    );
    
    return jwtClient;
  } catch (error) {
    console.error('Erreur lors de la configuration du client OAuth:', error);
    throw error;
  }
};

// Récupérer les créneaux disponibles en utilisant freebusy.query
export const getAvailableTimeSlots = async (
  calendarId: string,
  startDate: Date,
  endDate: Date,
  durationMinutes: number = 30,
  timeZone: string = 'Europe/Paris'
) => {
  try {
    console.log(`Récupération des disponibilités pour: ${calendarId}`);
    
    // Utiliser le compte de service pour se faire passer pour l'utilisateur du calendrier
    const auth = getOAuth2Client(calendarId);
    
    // Initialiser la connexion au calendrier
    const calendar = google.calendar({ version: 'v3', auth });
    
    try {
      // Utiliser l'API freebusy pour obtenir les périodes occupées
      const freeBusyResponse = await calendar.freebusy.query({
        requestBody: {
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
          timeZone,
          items: [{ id: calendarId }]
        }
      });
      
      // Extraire les périodes occupées
      const busySlots = freeBusyResponse.data.calendars?.[calendarId]?.busy || [];
      console.log(`${busySlots.length} périodes occupées trouvées pour ${calendarId}`);
      
      // Convertir les périodes occupées au format attendu
      const busyTimes = busySlots.map(slot => ({
        start: slot.start,
        end: slot.end
      }));
      
      // Générer les créneaux disponibles
      return generateAvailableTimeSlots(startDate, endDate, busyTimes, durationMinutes, timeZone);
    } catch (apiError) {
      console.error(`Erreur API Google Calendar: ${apiError.message}`, apiError);
      throw apiError;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des disponibilités:', error);
    throw error;
  }
};

// Fonction utilitaire pour valider les adresses email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Créer un événement dans Google Calendar avec une visioconférence
export const createCalendarEvent = async (
  calendarId: string,
  summary: string,
  description: string,
  startDateTime: string,
  endDateTime: string,
  attendees: string[] = [],
  timeZone: string = 'Europe/Paris'
) => {
  try {
    // Utiliser le compte de service pour se faire passer pour l'utilisateur du calendrier
    const auth = getOAuth2Client(calendarId);
    
    // Initialiser la connexion au calendrier
    const calendar = google.calendar({ version: 'v3', auth });
    
    // Filtrer les participants pour ne garder que les emails valides
    const validAttendees = attendees
      .filter(email => email && typeof email === 'string' && isValidEmail(email))
      .map(email => ({ email }));
    
    console.log(`Participants valides: ${validAttendees.length}/${attendees.length}`);
    
    // Vérifier si la description est définie
    if (!description) {
      console.warn("Description non fournie pour l'événement");
    } else {
      console.log(`Description reçue (${description.length} caractères)`);
      // Afficher un extrait pour débogage
      console.log("Extrait de la description:", description.substring(0, 100) + "...");
    }
    
    // Créer l'événement
    const event = {
      summary: summary || "Rendez-vous Omnigo",
      description: description || "Aucune description fournie",
      start: {
        dateTime: startDateTime,
        timeZone,
      },
      end: {
        dateTime: endDateTime,
        timeZone,
      },
      attendees: validAttendees,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
      conferenceData: {
        createRequest: {
          requestId: Date.now().toString(),
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    };
    
    // Afficher l'objet événement à créer (sans la description complète)
    const eventForLog = { ...event, description: event.description.substring(0, 50) + "..." };
    console.log("Création de l'événement:", JSON.stringify(eventForLog, null, 2));
    
    const result = await calendar.events.insert({
      calendarId,
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all'
    });
    
    console.log("Événement créé avec succès, ID:", result.data.id);
    
    return {
      success: true,
      eventId: result.data.id,
      meetLink: result.data.conferenceData?.entryPoints?.[0]?.uri || null,
      eventDetails: {
        summary,
        description: description ? "Description fournie" : "Aucune description",
        startDateTime,
        endDateTime,
        attendees: validAttendees.map(att => att.email)
      }
    };
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    throw error;
  }
};

// Fonction pour générer des créneaux disponibles à partir des périodes occupées
export const generateAvailableTimeSlots = (
  startDate: Date,
  endDate: Date,
  busyTimes: Array<{ start: string, end: string }>,
  durationMinutes: number = 30,
  timeZone: string = 'Europe/Paris'
) => {
  const slots = [];
  const currentDate = new Date(startDate);
  
  while (currentDate < endDate) {
    // Ignorer les weekends
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      // Heures de travail : 9h-12h et 14h-17h
      const workingHours = [
        { start: 9, end: 12 },
        { start: 14, end: 17 }
      ];
      
      for (const period of workingHours) {
        for (let hour = period.start; hour < period.end; hour++) {
          for (let minute = 0; minute < 60; minute += durationMinutes) {
            const slotStart = new Date(currentDate);
            slotStart.setHours(hour, minute, 0, 0);
            
            const slotEnd = new Date(slotStart);
            slotEnd.setMinutes(slotStart.getMinutes() + durationMinutes);
            
            // Ne pas dépasser l'heure de fin de période
            if ((hour === period.end - 1) && (minute + durationMinutes > 60)) {
              continue;
            }
            
            // Vérifier si le créneau est disponible (non occupé)
            if (isSlotAvailable(slotStart, slotEnd, busyTimes)) {
              slots.push({
                id: `slot-${slotStart.getTime()}`,
                start: slotStart.toISOString(),
                end: slotEnd.toISOString(),
                formattedTime: formatDateRange(slotStart, slotEnd)
              });
            }
          }
        }
      }
    }
    
    // Passer au jour suivant
    currentDate.setDate(currentDate.getDate() + 1);
    currentDate.setHours(0, 0, 0, 0);
  }
  
  return slots;
};

// Vérifier si un créneau horaire est disponible
export const isSlotAvailable = (
  slotStart: Date,
  slotEnd: Date,
  busyTimes: Array<{ start: string, end: string }>
) => {
  for (const busy of busyTimes) {
    const busyStart = new Date(busy.start);
    const busyEnd = new Date(busy.end);
    
    // Si le créneau chevauche une période occupée, il n'est pas disponible
    if (
      (slotStart < busyEnd && slotEnd > busyStart) ||
      (slotStart.getTime() === busyStart.getTime()) ||
      (slotEnd.getTime() === busyEnd.getTime())
    ) {
      return false;
    }
  }
  
  return true;
};

// Formatter une plage de dates pour l'affichage
export const formatDateRange = (start: Date, end: Date, locale: string = 'fr-FR') => {
  const formattedDate = start.toLocaleDateString(locale, { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
  
  const formattedStartTime = start.toLocaleTimeString(locale, { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  const formattedEndTime = end.toLocaleTimeString(locale, { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  return `${formattedDate} — ${formattedStartTime} - ${formattedEndTime}`;
};

// Fonction qui génère des créneaux horaires fictifs pour le développement
export const generateMockTimeSlots = (
  startDate: Date,
  endDate: Date,
  durationMinutes: number = 30,
  timeZone: string = 'Europe/Paris'
) => {
  const slots = [];
  const currentDate = new Date(startDate);
  
  while (currentDate < endDate) {
    // Ignorer les weekends
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      // Heures de travail : 9h-12h et 14h-17h
      for (let hour = 9; hour < 17; hour++) {
        // Sauter la pause déjeuner
        if (hour >= 12 && hour < 14) continue;
        
        // Pour chaque heure, générer des créneaux de la durée spécifiée
        for (let minute = 0; minute < 60; minute += durationMinutes) {
          const slotStart = new Date(currentDate);
          slotStart.setHours(hour, minute, 0, 0);
          
          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotStart.getMinutes() + durationMinutes);
          
          // Ne pas dépasser l'heure de fin de journée
          if ((hour === 11 && minute + durationMinutes > 60) || 
              (hour === 16 && minute + durationMinutes > 60) ||
              slotEnd > endDate) {
            continue;
          }
          
          // Simuler des indisponibilités aléatoires (30% des créneaux sont occupés)
          if (Math.random() > 0.3) {
            slots.push({
              id: `slot-${slotStart.getTime()}`,
              start: slotStart.toISOString(),
              end: slotEnd.toISOString(),
              formattedTime: formatDateRange(slotStart, slotEnd)
            });
          }
        }
      }
    }
    
    // Passer au jour suivant
    currentDate.setDate(currentDate.getDate() + 1);
    currentDate.setHours(0, 0, 0, 0);
  }
  
  return slots;
}; 