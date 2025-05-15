import CardGrid from "@/components/kokonutui/card-grid"

// Fonction pour normaliser une chaîne de caractères (enlever les accents)
const normalizeString = (str: string) => {
  return str.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

// Dictionnaire pour retrouver les vrais noms des départements avec accents
const departmentNames: Record<string, string> = {
  'developpement': 'Développement',
  'marketing': 'Marketing',
  'ventes': 'Ventes'
};

// Définir le type des paramètres comme une Promise pour Next.js 15
type ParamsType = Promise<{ department: string }>;

// Suivre le modèle de Next.js 15 pour les composants de page
export default async function Page({
  params,
}: {
  params: ParamsType
}) {
  // Attend la résolution de la Promise params
  const { department } = await params;
  
  // Récupérer le nom d'affichage correct avec accents si disponible
  const normalizedDept = normalizeString(department);
  const displayDepartment = departmentNames[normalizedDept] || 
    (department.charAt(0).toUpperCase() + department.slice(1));

  return (
    <main className="bg-gray-50 dark:bg-zinc-950 min-h-screen relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
        <CardGrid
          departmentFilter={department}
          gridTitle={`Équipe ${displayDepartment}`}
            gridDescription="Cliquez sur un membre de l&apos;équipe pour démarrer une session Google Meet"
        />
        </div>
      </div>
    </main>
  )
}
