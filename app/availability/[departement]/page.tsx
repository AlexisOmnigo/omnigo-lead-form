"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarClock, ArrowLeft, Calendar } from "lucide-react"
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

  // État pour les créneaux horaires et le membre de l'équipe sélectionné
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);

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

    // Simuler une requête à l'API Google Calendar pour les disponibilités
    const fetchAvailability = async (member: TeamMember) => {
      setLoading(true);
      
      try {
        // Utiliser l'email de l'employé comme calendarId
        const calendarId = member.email;
        
        // Préparer les dates (pour les 7 prochains jours)
        const startDate = new Date().toISOString();
        const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        
        // Appeler l'API pour récupérer les disponibilités
        const response = await fetch('/api/google/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            calendarId,
            startDate,
            endDate,
            timeZone: 'Europe/Paris',
            duration: 30 // durée en minutes
          })
        });
        
        const data = await response.json();
        
        if (data.availableSlots && data.availableSlots.length > 0) {
          setTimeSlots(data.availableSlots);
        } else {
          setTimeSlots([]);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des disponibilités:', error);
        setTimeSlots([]);
      } finally {
        setLoading(false);
      }
    };

    getTeamMember();
  }, [searchParams]);

  // Fonction pour générer des créneaux fictifs (à remplacer par des données réelles)
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const today = new Date();
    
    // Générer des créneaux pour les 5 prochains jours ouvrables
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Sauter les weekends
      if (date.getDay() === 0 || date.getDay() === 6) {
        continue;
      }
      
      // Créneaux du matin
      for (let hour = 9; hour < 12; hour++) {
        const startTime = new Date(date);
        startTime.setHours(hour, 0, 0);
        
        const endTime = new Date(date);
        endTime.setHours(hour, 30, 0);
        
        if (Math.random() > 0.3) { // Simuler des créneaux disponibles (70% de chance)
          const id = `slot-${startTime.getTime()}`;
          const formattedDate = startTime.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          });
          const formattedStartTime = startTime.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          const formattedEndTime = endTime.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          
          slots.push({
            id,
            start: startTime.toISOString(),
            end: endTime.toISOString(),
            formattedTime: `${formattedDate} — ${formattedStartTime} - ${formattedEndTime}`
          });
        }
      }
      
      // Créneaux de l'après-midi
      for (let hour = 14; hour < 17; hour++) {
        const startTime = new Date(date);
        startTime.setHours(hour, 0, 0);
        
        const endTime = new Date(date);
        endTime.setHours(hour, 30, 0);
        
        if (Math.random() > 0.3) { // Simuler des créneaux disponibles (70% de chance)
          const id = `slot-${startTime.getTime()}`;
          const formattedDate = startTime.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          });
          const formattedStartTime = startTime.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          const formattedEndTime = endTime.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          
          slots.push({
            id,
            start: startTime.toISOString(),
            end: endTime.toISOString(),
            formattedTime: `${formattedDate} — ${formattedStartTime} - ${formattedEndTime}`
          });
        }
      }
    }
    
    // Trier les créneaux par date/heure
    return slots.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
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
      // Préparer la description de l'événement avec les informations du formulaire
      const description = `
        Informations client :
        Nom : ${userName}
        Email : ${userEmail}
        Téléphone : ${userPhone}
        Entreprise : ${userCompany}
        Département : ${userDepartment}
        
        Informations complémentaires :
        ${additionalInfo}
      `;
      
      // Appeler l'API pour créer l'événement dans Google Calendar
      const response = await fetch('/api/google/create-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calendarId: teamMember.email,
          start: selectedTimeSlot.start,
          end: selectedTimeSlot.end,
          summary: `Rendez-vous Omnigo avec ${userName} (${userCompany})`,
          description,
          attendees: [userEmail, teamMember.email],
          timeZone: 'Europe/Paris'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Afficher un message de confirmation
        alert(`Rendez-vous confirmé pour le ${selectedTimeSlot.formattedTime}.\n\nUn email de confirmation a été envoyé à ${userEmail}.`);
        
        // Rediriger vers la page d'accueil
        router.push('/');
      } else {
        throw new Error(data.error || 'Erreur lors de la création du rendez-vous');
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

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7DF9FF]"></div>
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-muted-foreground">Aucun créneau disponible pour le moment.</p>
                <p className="text-muted-foreground">Veuillez réessayer ultérieurement ou contacter directement notre équipe.</p>
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                  {timeSlots.map((slot) => (
                    <Card
                      key={slot.id}
                      className={`cursor-pointer transition-colors ${
                        selectedSlot === slot.id 
                          ? "border-2 border-[#7DF9FF] bg-[#7DF9FF]/5" 
                          : "hover:bg-gray-50 dark:hover:bg-zinc-900"
                      }`}
                      onClick={() => handleSlotSelect(slot.id)}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <CalendarClock className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">{slot.formattedTime}</span>
                      </CardContent>
                    </Card>
                  ))}
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
