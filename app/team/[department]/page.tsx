import CardGrid from "@/components/kokonutui/card-grid"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "@radix-ui/react-icons"

interface TeamDepartmentPageProps {
  params: {
    department: string
  }
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

export default async function TeamDepartmentPage({ 
  params 
}: TeamDepartmentPageProps) {
  // Attendre explicitement la résolution des paramètres
  const resolvedParams = await Promise.resolve(params);
  const department = resolvedParams.department;
  
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
            gridDescription="Cliquez sur un membre de l'équipe pour démarrer une session Google Meet"
          />
        </div>
      </div>
    </main>
  )
}
