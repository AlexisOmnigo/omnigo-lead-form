import { google } from 'googleapis';

/** Service account credentials loaded from environment variables */
const serviceAccount = {
  client_email: process.env.GOOGLE_CLIENT_EMAIL || '',
  private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  project_id: process.env.GOOGLE_PROJECT_ID || '',
};

/**
 * Create an authenticated Google API client impersonating the provided calendar.
 */
export const getOAuth2Client = (calendarId: string) => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
  ];

  return new google.auth.JWT(
    serviceAccount.client_email,
    undefined,
    serviceAccount.private_key,
    scopes,
    calendarId
  );
};

/**
 * Retrieve available time slots between startDate and endDate for the given calendar.
 */
export const getAvailableTimeSlots = async (
  calendarId: string,
  startDate: Date,
  endDate: Date,
  durationMinutes = 30,
  timeZone = 'America/Montreal'
) => {
  const auth = getOAuth2Client(calendarId);
  const calendar = google.calendar({ version: 'v3', auth });

  const freeBusy = await calendar.freebusy.query({
    requestBody: {
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      timeZone,
      items: [{ id: calendarId }],
    },
  });

  const busy = (freeBusy.data.calendars?.[calendarId]?.busy ?? [])
    .filter((b) => b.start && b.end)
    .map((b) => ({ start: new Date(b.start!), end: new Date(b.end!) }));

  return generateAvailableTimeSlots(startDate, endDate, busy, durationMinutes, timeZone);
};

/**
 * Create an event in Google Calendar including a Meet link.
 */
export const createCalendarEvent = async (
  calendarId: string,
  summary: string,
  description: string,
  startDateTime: string,
  endDateTime: string,
  attendees: string[] = [],
  timeZone = 'America/Montreal'
) => {
  const auth = getOAuth2Client(calendarId);
  const calendar = google.calendar({ version: 'v3', auth });

  const event = {
    summary,
    description,
    start: { dateTime: startDateTime, timeZone },
    end: { dateTime: endDateTime, timeZone },
    attendees: attendees.map((email) => ({ email })),
    reminders: { useDefault: true },
    conferenceData: {
      createRequest: {
        requestId: Date.now().toString(),
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  };

  const res = await calendar.events.insert({
    calendarId,
    requestBody: event,
    conferenceDataVersion: 1,
    sendUpdates: 'all',
  });

  return res.data;
};

/**
 * Convert local time expressed in the given timezone to a UTC Date instance.
 */
function toUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string
): Date {
  const local = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const inv = new Date(local.toLocaleString('en-US', { timeZone }));
  const diff = local.getTime() - inv.getTime();
  return new Date(local.getTime() + diff);
}

/**
 * Check if the proposed slot overlaps with a busy period.
 */
export const isSlotAvailable = (
  start: Date,
  end: Date,
  busyTimes: Array<{ start: Date; end: Date }>
) => {
  return !busyTimes.some((b) => start < b.end && end > b.start);
};

/**
 * Format a date range for display.
 */
export const formatDateRange = (
  start: Date,
  end: Date,
  locale = 'fr-FR',
  timeZone = 'America/Montreal'
) => {
  const date = start.toLocaleDateString(locale, { timeZone });
  const startTime = start.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone });
  const endTime = end.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone });
  return `${date} — ${startTime} - ${endTime}`;
};

/**
 * Generate available time slots from busy periods.
 */
export const generateAvailableTimeSlots = (
  startDate: Date,
  endDate: Date,
  busyTimes: Array<{ start: Date; end: Date }>,
  durationMinutes = 30,
  timeZone = 'America/Montreal'
) => {
  const slots = [] as Array<{ id: string; start: string; end: string; formattedTime: string }>;

  // Iterate day by day in UTC
  const current = new Date(startDate);
  current.setUTCHours(0, 0, 0, 0);

  while (current <= endDate) {
    const local = new Date(current.toLocaleString('en-US', { timeZone }));
    const weekday = local.getDay();
    if (weekday !== 0 && weekday !== 6) {
      const year = local.getFullYear();
      const month = local.getMonth() + 1;
      const day = local.getDate();

      for (let hour = 9; hour < 17; hour++) {
        if (hour >= 12 && hour < 14) continue; // lunch break
        for (let minute = 0; minute < 60; minute += durationMinutes) {
          const slotStart = toUtc(year, month, day, hour, minute, timeZone);
          const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);
          if (slotEnd > endDate) continue;
          if (isSlotAvailable(slotStart, slotEnd, busyTimes)) {
            slots.push({
              id: `slot-${slotStart.getTime()}`,
              start: slotStart.toISOString(),
              end: slotEnd.toISOString(),
              formattedTime: formatDateRange(slotStart, slotEnd, 'fr-FR', timeZone),
            });
          }
        }
      }
    }
    current.setUTCDate(current.getUTCDate() + 1);
    current.setUTCHours(0, 0, 0, 0);
  }

  return slots;
};

/**
 * Generate mock slots for development without calling Google APIs.
 */
export const generateMockTimeSlots = (
  startDate: Date,
  endDate: Date,
  durationMinutes = 30,
  timeZone = 'America/Montreal'
) => {
  const slots = generateAvailableTimeSlots(startDate, endDate, [], durationMinutes, timeZone);
  return slots.filter(() => Math.random() > 0.3);
};
