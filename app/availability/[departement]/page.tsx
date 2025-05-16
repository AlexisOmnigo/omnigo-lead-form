"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarClock, ArrowLeft, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"

// Type pour les créneaux horaires
interface TimeSlot {
  id: string;
  start: string;
  end: string;
  formattedTime: string;
}

// Type pour l'employé
interface TeamMember {
  name: string;
  role: string;
  email: string;
  calendarId?: string;
}

// Type des paramètres pour Next.js 15
type ParamsType = Promise<{ departement: string }>;

export default function EmployeeAvailabilityPage({
  params,
}: {
  params: ParamsType
}) {
  // Récupérer les paramètres d'URL et de recherche
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Récupérer les informations du formulaire depuis les paramètres d'URL
  const userName = searchParams.get("name") || "";
  const userEmail = searchParams.get("email") || "";
  const userCompany = searchParams.get("company") || "";
  const userPhone = searchParams.get("phone") || "";
  const userDepartment = searchParams.get("department") || "";
  const additionalInfo = searchParams.get("info") || "";

  // Afficher les informations récupérées dans la console pour débogage
  useEffect(() => {
    console.log("=== INFORMATIONS CLIENT RÉCUPÉRÉES ===");
    console.log(`Nom: ${userName}`);
    console.log(`Email: ${userEmail}`);
    console.log(`Téléphone: ${userPhone}`);
    console.log(`Entreprise: ${userCompany}`);
    console.log(`Département: ${userDepartment}`);
    console.log(`Informations complémentaires: ${additionalInfo}`);
    console.log("=======================================");
    
    // Afficher tous les paramètres d'URL pour vérification
    console.log("=== TOUS LES PARAMÈTRES D'URL ===");
    searchParams.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });
    console.log("=================================");
  }, [searchParams]);

  // État pour les créneaux horaires et le membre de l'équipe sélectionné
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [allTimeSlots, setAllTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  
  // État pour la navigation par date
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<{ start: Date, end: Date }>({
    start: new Date(),
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  // Variable pour suivre si un changement de date est en cours
  const [changingDate, setChangingDate] = useState<boolean>(false);

  useEffect(() => {
    // Fonction pour récupérer le membre de l'équipe
    const getTeamMember = async () => {
      // Exemple de team member basé sur un ID fictif
      // Dans un cas réel, cette information viendrait d'une API ou d'une base de données
      const mockTeamMember: TeamMember = {
        name: searchParams.get("teamMemberName") || "Jean Dupont",
        role: searchParams.get("teamMemberRole") || "Conseiller",
        email: searchParams.get("teamMemberEmail") || "jean.dupont@omnigo.com",
        calendarId: searchParams.get("teamMemberEmail") || "jean.dupont@omnigo.com"
      };
      
      setTeamMember(mockTeamMember);
      fetchAvailability(mockTeamMember);
    };

    getTeamMember();
  }, [searchParams]);

  // Fonction pour récupérer les disponibilités avec des dates spécifiques
  const fetchAvailabilityWithDates = async (member: TeamMember, start: Date, end: Date, targetDate: Date) => {
    setLoading(true);
    
    try {
      // Utiliser l'email de l'employé comme calendarId
      const calendarId = member.email;
      
      // Préparer les dates
      const startDate = start.toISOString();
      const endDate = end.toISOString();
      
      // Mettre à jour l'état dateRange avec les nouvelles dates
      setDateRange({ start, end });
      
      // Créer un tableau des jours qui seront fetchés pour un log visuel
      const daysBeingFetched: Date[] = [];
      const currentDate = new Date(start);
      while (currentDate <= end) {
        daysBeingFetched.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Afficher un log visuel des jours fetchés
      console.log('=== JOURS FETCHÉS ===');
      daysBeingFetched.forEach(day => {
        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
        const formattedDay = day.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        });
        console.log(
          `${isWeekend ? '🔴' : '🟢'} ${formattedDay}${isWeekend ? ' (weekend)' : ''}`
        );
      });
      console.log('====================');
      
      console.log(`Récupération des disponibilités pour ${calendarId} du ${start.toLocaleDateString()} au ${end.toLocaleDateString()}`);
      console.log(`Date cible pour l'affichage: ${targetDate.toLocaleDateString()}`);
      
      // Appeler l'API pour récupérer les disponibilités
      const response = await fetch('/api/google/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calendarId,
          startDate,
          endDate,
          timeZone: 'America/Montreal',
          duration: 30 // durée en minutes
        })
      });
      
      const data = await response.json();
      
      if (data.availableSlots && data.availableSlots.length > 0) {
        console.log(`${data.availableSlots.length} créneaux disponibles reçus`);
        
        // Grouper les créneaux par jour pour le log
        const slotsByDay: Record<string, TimeSlot[]> = {};
        data.availableSlots.forEach((slot: TimeSlot) => {
          const slotDate = new Date(slot.start);
          const dateKey = slotDate.toLocaleDateString('fr-FR');
          if (!slotsByDay[dateKey]) {
            slotsByDay[dateKey] = [];
          }
          slotsByDay[dateKey].push(slot);
        });
        
        // Afficher le nombre de créneaux par jour
        console.log('=== CRÉNEAUX PAR JOUR ===');
        Object.keys(slotsByDay).forEach(dateKey => {
          console.log(`📅 ${dateKey}: ${slotsByDay[dateKey].length} créneaux disponibles`);
        });
        console.log('=======================');
        
        setAllTimeSlots(data.availableSlots);
        
        // Filtrer les créneaux pour la date cible spécifiée
        filterTimeSlotsByDate(data.availableSlots, targetDate);
      } else {
        console.log('❌ Aucun créneau disponible reçu');
        setAllTimeSlots([]);
        setTimeSlots([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des disponibilités:', error);
      setAllTimeSlots([]);
      setTimeSlots([]);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer les disponibilités avec l'état dateRange actuel
  const fetchAvailability = async (member: TeamMember) => {
    await fetchAvailabilityWithDates(member, dateRange.start, dateRange.end, selectedDate);
  };

  // Filtrer les créneaux par date
  const filterTimeSlotsByDate = (slots: TimeSlot[], date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    console.log(`Filtrage des créneaux pour le ${date.toLocaleDateString()} (${slots.length} créneaux au total)`);
    
    const filteredSlots = slots.filter(slot => {
      const slotDate = new Date(slot.start);
      return slotDate >= startOfDay && slotDate <= endOfDay;
    });
    
    console.log(`${filteredSlots.length} créneaux disponibles pour le ${date.toLocaleDateString()}`);
    setTimeSlots(filteredSlots);
  };

  // Changer de date
  const changeDate = async (daysToAdd: number) => {
    // Ignorer si un changement est déjà en cours
    if (changingDate) {
      console.log("Changement de date déjà en cours, ignoré");
      return;
    }
    
    try {
      setChangingDate(true);
      
      // Calculer la nouvelle date
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() + daysToAdd);
      
      // Mettre à jour la date sélectionnée immédiatement
      setSelectedDate(newDate);
      setSelectedSlot(null); // Réinitialiser le créneau sélectionné
      
      // Si la nouvelle date dépasse la plage actuelle, charger plus de dates
      if (newDate > dateRange.end) {
        // Définir une nouvelle plage de 7 jours à partir de la date sélectionnée
        const newStartDate = new Date(newDate);
        newStartDate.setHours(0, 0, 0, 0);
        
        const newEndDate = new Date(newStartDate);
        newEndDate.setDate(newStartDate.getDate() + 7);
        
        console.log(`Chargement de nouveaux créneaux du ${newStartDate.toLocaleDateString()} au ${newEndDate.toLocaleDateString()}`);
        
        // Refetch les disponibilités avec la nouvelle plage
        if (teamMember) {
          // Utiliser directement les nouvelles dates
          await fetchAvailabilityWithDates(teamMember, newStartDate, newEndDate, newDate);
        }
      } else if (newDate < dateRange.start) {
        // Si on va en arrière avant la date de début
        const newStartDate = new Date(newDate);
        newStartDate.setHours(0, 0, 0, 0);
        
        const newEndDate = new Date(newStartDate);
        newEndDate.setDate(newStartDate.getDate() + 7);
        
        console.log(`Chargement de nouveaux créneaux du ${newStartDate.toLocaleDateString()} au ${newEndDate.toLocaleDateString()}`);
        
        // Refetch les disponibilités avec la nouvelle plage
        if (teamMember) {
          // Utiliser directement les nouvelles dates
          await fetchAvailabilityWithDates(teamMember, newStartDate, newEndDate, newDate);
        }
      } else {
        // Sinon, on filtre simplement les créneaux existants
        console.log(`Filtrage des créneaux existants pour ${newDate.toLocaleDateString()}`);
        filterTimeSlotsByDate(allTimeSlots, newDate);
      }
    } catch (error) {
      console.error("Erreur lors du changement de date:", error);
    } finally {
      setChangingDate(false);
    }
  };

  // Formater la date pour l'affichage
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Handler pour la sélection d'un créneau
  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId);
  };

  // Handler pour la confirmation du rendez-vous
  const handleConfirmAppointment = async () => {
    if (!selectedSlot || !teamMember) return;
    
    const selectedTimeSlot = timeSlots.find(slot => slot.id === selectedSlot);
    if (!selectedTimeSlot) return;
    
    setLoading(true);
    
    try {
      // Vérifier si les informations client existent
      if (!userName || !userEmail) {
        console.error("Informations client manquantes");
        console.log("Nom:", userName);
        console.log("Email:", userEmail);
        console.log("Téléphone:", userPhone);
        console.log("Entreprise:", userCompany);
      }
      
      // Préparer la description de l'événement avec les informations du formulaire
      // Utiliser un format plus structuré et visible
      const description = `
INFORMATIONS CLIENT
------------------
Nom: ${userName || "Non spécifié"}
Email: ${userEmail || "Non spécifié"}
Téléphone: ${userPhone || "Non spécifié"}
Entreprise: ${userCompany || "Non spécifié"}
Département: ${userDepartment || "Non spécifié"}

INFORMATIONS COMPLÉMENTAIRES
----------------------------
${additionalInfo || "Aucune information complémentaire"}
      `.trim();
      
      // Afficher la description pour débogage
      console.log("=== DESCRIPTION DE L'ÉVÉNEMENT ===");
      console.log(description);
      console.log("==================================");
      
      // Fonction pour valider un email
      const isValidEmail = (email: string | undefined | null): boolean => {
        if (!email || typeof email !== 'string') return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };
      
      // Préparer la liste des participants
      let attendeesList = [];
      
      // Ajouter l'email du membre de l'équipe s'il est valide
      if (isValidEmail(teamMember.email)) {
        attendeesList.push(teamMember.email);
      }
      
      // Ajouter l'email du client s'il est valide
      if (isValidEmail(userEmail)) {
        attendeesList.push(userEmail);
      }
      
      console.log(`Création d'un rendez-vous avec ${attendeesList.length} participants valides`);
      
      // Créer un titre plus descriptif pour l'événement
      const summary = userCompany 
        ? `Rendez-vous Omnigo avec ${userName} (${userCompany})`
        : `Rendez-vous Omnigo avec ${userName}`;
      
      // Appeler l'API pour créer l'événement dans Google Calendar
      const response = await fetch('/api/google/create-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calendarId: teamMember.email,
          start: selectedTimeSlot.start,
          end: selectedTimeSlot.end,
          summary,
          description,
          attendees: attendeesList,
          timeZone: 'America/Montreal'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Afficher un message de confirmation
        alert(`Rendez-vous confirmé pour le ${selectedTimeSlot.formattedTime}.\n\nUn email de confirmation a été envoyé à ${userEmail}.`);
        
        // Rediriger vers la page d'accueil
        router.push('/');
      } else {
        throw new Error(data.error || data.details || 'Erreur lors de la création du rendez-vous');
      }
    } catch (error) {
      console.error('Erreur lors de la confirmation du rendez-vous:', error);
      alert('Une erreur est survenue lors de la confirmation du rendez-vous. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-gray-50 dark:bg-zinc-950 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/" className="flex items-center mb-6 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l&apos;accueil
        </Link>
        
        <Card className="w-full max-w-4xl mx-auto border-[#7DF9FF] border-2">
          <CardContent className="p-6">
      <header className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-2">
                {teamMember ? `Sélectionnez un créneau avec ${teamMember.name}` : 'Chargement...'}
              </h1>
              {teamMember && (
                <p className="text-muted-foreground">{teamMember.role}</p>
              )}
      </header>

            {/* Navigateur de dates */}
            <div className="flex justify-between items-center mb-6 bg-gray-100 dark:bg-zinc-800 p-4 rounded-lg">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => changeDate(-1)}
                disabled={selectedDate <= new Date() || changingDate}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Jour précédent
              </Button>
              
              <h2 className="text-lg font-medium">
                {formatDate(selectedDate)}
              </h2>
              
              <Button 
                variant="outline"
                size="sm"
                onClick={() => changeDate(1)}
                disabled={changingDate}
              >
                Jour suivant
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7DF9FF]"></div>
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-muted-foreground">Aucun créneau disponible pour cette journée.</p>
                <p className="text-muted-foreground">Essayez un autre jour ou contactez directement notre équipe.</p>
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                  {timeSlots.map((slot) => {
                    // Extraire seulement l'heure et les minutes à partir de formattedTime
                    const timeString = slot.formattedTime.split(" — ")[1];
                    // Si le format est "HH:MM - HH:MM", on prend juste la première partie
                    const startTime = timeString.split(" - ")[0];
                    
                    return (
          <Card
                        key={slot.id}
            className={`cursor-pointer transition-colors ${
                          selectedSlot === slot.id 
                            ? "border-2 border-[#7DF9FF] bg-[#7DF9FF]/5" 
                            : "hover:bg-gray-50 dark:hover:bg-zinc-900"
            }`}
                        onClick={() => handleSlotSelect(slot.id)}
          >
                        <CardContent className="p-4 flex items-center justify-center gap-3">
              <CalendarClock className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm font-medium">{startTime}</span>
            </CardContent>
          </Card>
                    );
                  })}
      </div>

      <div className="flex justify-center mt-8">
                  <Button 
                    className="cursor-pointer bg-[#7DF9FF] hover:bg-[#7DF9FF]/80 text-black"
                    size="lg" 
                    disabled={!selectedSlot || loading} 
                    onClick={handleConfirmAppointment}
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin mr-2 h-4 w-4 border-b-2 border-zinc-950"></span>
                        Veuillez patienter...
                      </>
                    ) : 'Confirmer le rendez-vous'}
        </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Note explicative sur l'intégration */}
        <div className="mt-8 text-sm text-gray-500 max-w-4xl mx-auto">
          <p className="mb-2"><strong>Note sur l&apos;intégration Google Calendar :</strong></p>
          <p>Pour une intégration complète avec Google Calendar, il faudrait:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Configurer l&apos;authentification OAuth 2.0 pour Google Calendar API</li>
            <li>Implémenter le backend pour récupérer les créneaux disponibles</li>
            <li>Créer un endpoint API pour réserver un créneau et créer un événement</li>
            <li>Envoyer des e-mails de confirmation avec les détails du rendez-vous</li>
            <li>Gérer la synchronisation entre les calendriers et les fuseaux horaires</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
