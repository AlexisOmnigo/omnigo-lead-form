import { google } from 'googleapis';
import * as fs from 'fs';
import path from 'path';

// Configurer le client OAuth avec le compte de service pour Google Calendar
export const getOAuth2Client = (calendarId: string) => {
  try {
    // Utiliser les variables d'environnement directement
    console.log(`Configuration du client OAuth pour: ${calendarId}`);
    
    // Vérifier si les variables d'environnement nécessaires sont présentes
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.error('Variables d\'environnement Google manquantes');
      throw new Error('Configuration Google incomplète. Vérifiez les variables d\'environnement.');
    }
    
    // S'assurer que les scopes sont correctement formatés
    const scopes = (process.env.GCALENDAR_SCOPES || 'https://www.googleapis.com/auth/calendar').split(',').map(scope => scope.trim());
    
    // Créer un client JWT avec le compte de service
    const jwtClient = new google.auth.JWT(
      serviceAccount.client_email,
      undefined,
      serviceAccount.private_key,
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
  timeZone: string = 'America/Montreal'
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
      
      // Convertir les périodes occupées au format attendu et s'assurer qu'elles ont des valeurs non-null
      const busyTimes = busySlots
        .filter(slot => slot.start && slot.end) // Filtrer les slots avec valeurs nulles
        .map(slot => ({
          start: slot.start!,
          end: slot.end!
        }));
      
      // Générer les créneaux disponibles
      return generateAvailableTimeSlots(startDate, endDate, busyTimes, durationMinutes, timeZone);
    } catch (apiError: any) {
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

// Fonction pour s'assurer qu'une chaîne de date est correctement formatée avec le fuseau horaire
function ensureTimezone(dateString: string, timeZone: string): string {
  try {
    // Si la date contient déjà un fuseau horaire, ne rien changer
    if (dateString.includes('Z') || dateString.includes('+')) {
      return dateString;
    }

    // Convertir la date en UTC en tenant compte du fuseau souhaité
    const localDate = new Date(dateString);
    const tzDate = new Date(localDate.toLocaleString('en-US', { timeZone }));
    const offsetMs = localDate.getTime() - tzDate.getTime();
    const utcDate = new Date(localDate.getTime() + offsetMs);

    return utcDate.toISOString();
  } catch (e) {
    console.error(`Erreur lors de la conversion de la date: ${dateString}`, e);
    return dateString;
  }
}

// Créer un événement dans Google Calendar avec une visioconférence
export const createCalendarEvent = async (
  calendarId: string,
  summary: string,
  description: string,
  startDateTime: string,
  endDateTime: string,
  attendees: string[] = [],
  timeZone: string = 'America/Montreal'
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
    console.log(`Fuseau horaire utilisé: ${timeZone}`);
    console.log(`Date de début (originale): ${startDateTime}`);
    console.log(`Date de fin (originale): ${endDateTime}`);
    
    // Vérifier si la description est définie
    if (!description) {
      console.warn("Description non fournie pour l'événement");
    } else {
      console.log(`Description reçue (${description.length} caractères)`);
      // Afficher un extrait pour débogage
      console.log("Extrait de la description:", description.substring(0, 100) + "...");
    }
    
    // S'assurer que les dates sont correctement formatées
    const start = ensureTimezone(startDateTime, timeZone);
    const end = ensureTimezone(endDateTime, timeZone);
    
    console.log(`ENVIRONNEMENT: ${process.env.NODE_ENV || 'development'}`);
    
    // Créer l'événement
    const event = {
      summary: summary || "Rendez-vous Omnigo",
      description: description || "Aucune description fournie",
      start: {
        dateTime: start,
        timeZone,
      },
      end: {
        dateTime: end,
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
    
    // Afficher l'objet événement complet pour débogage
    console.log("Événement à créer:", JSON.stringify({
      ...event,
      description: event.description.substring(0, 50) + "...",
    }, null, 2));
    
    const result = await calendar.events.insert({
      calendarId,
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all'
    });
    
    console.log("Événement créé avec succès, ID:", result.data.id);
    if (result.data.start) {
      console.log("Horaire confirmé par Google:", 
        JSON.stringify({ 
          start: result.data.start, 
          end: result.data.end 
        }, null, 2)
      );
    }
    
    return {
      success: true,
      eventId: result.data.id,
      meetLink: result.data.conferenceData?.entryPoints?.[0]?.uri || null,
      eventDetails: {
        summary,
        description: description ? "Description fournie" : "Aucune description",
        startDateTime: start,
        endDateTime: end,
        timeZone,
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
  timeZone: string = 'America/Montreal'
) => {
  console.log(`Génération des créneaux disponibles avec fuseau horaire: ${timeZone}`);
  console.log(`Date de début: ${startDate.toISOString()}`);
  console.log(`Date de fin: ${endDate.toISOString()}`);
  console.log(`Environnement: ${process.env.NODE_ENV || 'development'}`);
  
  // Convertir les périodes occupées en objets Date
  const busyTimesParsed = busyTimes.map(slot => ({
    start: new Date(slot.start),
    end: new Date(slot.end)
  }));
  
  console.log(`Périodes occupées: ${busyTimesParsed.length}`);
  if (busyTimesParsed.length > 0) {
    console.log(`Exemple - Première période occupée: ${busyTimesParsed[0].start.toLocaleString()} - ${busyTimesParsed[0].end.toLocaleString()}`);
  }
  
  const slots = [];
  let currentDate = new Date(startDate);

  // S'assurer que currentDate commence au début de la journée dans le fuseau demandé
  const offsetMinStart = getTimeZoneOffset(currentDate, timeZone);
  currentDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate(), 0, 0));
  currentDate = new Date(currentDate.getTime() + offsetMinStart * 60000);
  
  while (currentDate < endDate) {
    const offsetMin = getTimeZoneOffset(currentDate, timeZone);
    const localDay = new Date(currentDate.toLocaleString('en-US', { timeZone })).getDay();

    // Ignorer les weekends selon le fuseau horaire demandé
    if (localDay !== 0 && localDay !== 6) {
      const workingHours = [
        { start: 9, end: 12 },
        { start: 14, end: 17 }
      ];

      for (const period of workingHours) {
        console.log(`Génération des créneaux pour la période ${period.start}h-${period.end}h le ${currentDate.toLocaleDateString()}`);
        for (let hour = period.start; hour < period.end; hour++) {
          for (let minute = 0; minute < 60; minute += durationMinutes) {
            const slotStart = makeSlotDate(currentDate, hour, minute, offsetMin);
            const slotEnd = makeSlotDate(currentDate, hour, minute + durationMinutes, offsetMin);

            // Ne pas dépasser l'heure de fin de période
            if ((hour === period.end - 1) && (minute + durationMinutes > 60)) {
              continue;
            }

            const slotStartISO = slotStart.toISOString();
            const slotEndISO = slotEnd.toISOString();

            if (isSlotAvailable(slotStart, slotEnd, busyTimesParsed)) {
              const formattedTime = formatDateRange(slotStart, slotEnd);
              console.log(`Créneau disponible trouvé: ${formattedTime}`);

              slots.push({
                id: `slot-${slotStart.getTime()}`,
                start: slotStartISO,
                end: slotEndISO,
                formattedTime,
                timeZone,
                rawStartTime: `${hour}:${minute.toString().padStart(2, '0')}`,
                startHour: hour,
                startMinute: minute
              });
            }
          }
        }
      }
    }

    // Passer au jour suivant
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }
  
  console.log(`Nombre total de créneaux disponibles générés: ${slots.length}`);
  if (slots.length > 0) {
    console.log(`Premier créneau disponible: ${slots[0].formattedTime}`);
    console.log(`Heure brute du premier créneau: ${slots[0].rawStartTime}`);
  }
  
  return slots;
};


// Obtenir l'offset en minutes pour un fuseau horaire donné à une date précise
function getTimeZoneOffset(date: Date, timeZone: string): number {
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' });
  const parts = fmt.formatToParts(date);
  const tzPart = parts.find(p => p.type === 'timeZoneName');
  if (!tzPart) return 0;
  const match = tzPart.value.match(/GMT([+-])(\d{2})(?::?(\d{2}))?/);
  if (!match) return 0;
  const sign = match[1] === '-' ? -1 : 1;
  const hours = parseInt(match[2], 10);
  const minutes = match[3] ? parseInt(match[3], 10) : 0;
  return sign * (hours * 60 + minutes);
}

// Créer une date UTC correspondant à l'heure locale souhaitée
function makeSlotDate(base: Date, hour: number, minute: number, offsetMin: number): Date {
  const utc = Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), hour, minute);
  return new Date(utc - offsetMin * 60000);
}

// Vérifier si un créneau horaire est disponible
export const isSlotAvailable = (
  slotStart: Date,
  slotEnd: Date,
  busyTimes: Array<{ start: Date, end: Date }>
) => {
  for (const busy of busyTimes) {
    // Comparer les timestamps pour éviter les problèmes de fuseau horaire
    const busyStartTime = busy.start.getTime();
    const busyEndTime = busy.end.getTime();
    const slotStartTime = slotStart.getTime();
    const slotEndTime = slotEnd.getTime();
    
    // Si le créneau chevauche une période occupée, il n'est pas disponible
    if (
      (slotStartTime < busyEndTime && slotEndTime > busyStartTime) ||
      (slotStartTime === busyStartTime) ||
      (slotEndTime === busyEndTime)
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
  timeZone: string = 'America/Montreal'
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

// Définition de l'objet serviceAccount à partir des variables d'environnement
const serviceAccount = {
  type: process.env.GOOGLE_SERVICE_ACCOUNT_TYPE || "service_account",
  project_id: process.env.GOOGLE_PROJECT_ID || "",
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID || "",
  private_key: process.env.GOOGLE_PRIVATE_KEY || "",
  client_email: process.env.GOOGLE_CLIENT_EMAIL || "",
  client_id: process.env.GOOGLE_CLIENT_ID || "",
  auth_uri: process.env.GOOGLE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
  token_uri: process.env.GOOGLE_TOKEN_URI || "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL || "",
  universe_domain: "googleapis.com"
}; 