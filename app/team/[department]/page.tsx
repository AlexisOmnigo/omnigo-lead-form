import CardGrid from "@/components/kokonutui/card-grid"

// Définition des paramètres attendus par la page
type Params = {
  department: string
}

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

// Utilisons la définition exacte de Next.js: export default function Page({ params, searchParams }: Props)
export default function Page({ 
  params 
}: {
  params: Params
}) {
  // Récupérer le paramètre de département
  const department = params.department;
  
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
