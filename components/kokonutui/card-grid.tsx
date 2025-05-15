import CardGridItem, { type CardGridItemProps } from "./card/card-grid"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "@radix-ui/react-icons"
import Link from "next/link"

interface CardGridProps {
  items?: CardGridItemProps[]
  gridTitle?: string
  gridDescription?: string
  departmentFilter?: string
}

const teamMembers: CardGridItemProps[] = [
  {
    name: "Samuel Béland",
    role: "CEO",
    department: ["Ventes", "Marketing", "Développement"],
    image: "/photos/samuel.jpg",
    imageOffsetX: "50%",
    imageOffsetY: "10%",
    imageZoom: 1.7,
    meetLink: "https://meet.google.com/abc-defg-hij",
  },
  {
    name: "Xavier Champoux",
    role: "Directeur Marketing",
    department: "Marketing",
    image: "/photos/xavier.jpg",
    imageOffsetX: "65%",
    imageOffsetY: "0%",
    imageZoom: 1.1,
    meetLink: "https://meet.google.com/klm-nopq-rst",
  },
  {
    name: "Alexis Potvin",
    role: "Responsable des Opérations de développement",
    department: ["Développement", "Ventes"],
    image: "/photos/alexis.jpg",
    imageOffsetX: "55%",
    imageOffsetY: "6%",
    imageZoom: 1.7,
    meetLink: "https://meet.google.com/uvw-xyz1-234",
  },
  {
    name: "Gabriel Joubert",
    role: "Responsable des Opérations de Marketing",
    department: "Marketing",
    image: "/photos/gabriel.jpg",
    imageOffsetX: "35%",
    imageOffsetY: "10%",
    imageZoom: 1.8,
    meetLink: "https://meet.google.com/567-89ab-cde",
  }
]

export default function CardGrid({
  items = teamMembers,
  gridTitle = "Rencontrez Notre Équipe",
  gridDescription = "Cliquez sur un membre de l'équipe pour démarrer une session Google Meet",
  departmentFilter,
}: CardGridProps) {
  // Fonction utilitaire pour normaliser les chaînes (enlever les accents)
  const normalizeString = (str: string) => {
    return str.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Filter items by department if a filter is provided and is not empty
  const filteredItems = departmentFilter && departmentFilter.trim() !== ""
    ? items.filter((item) => {
        if (!item.department) return false;
        
        const normalizedFilter = normalizeString(departmentFilter);
        
        if (Array.isArray(item.department)) {
          return item.department.some(
            dept => normalizeString(dept) === normalizedFilter
          );
        }
        
        return normalizeString(item.department) === normalizedFilter;
      })
    : items

  if (!filteredItems || filteredItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-zinc-500 dark:text-zinc-400">Aucun membre d'équipe à afficher.</p>
      </div>
    )
  }

  return (
    <section className="w-full md:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {gridTitle && (
          <h2 className="mb-2 tracking-tighter text-3xl font-bold text-left text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            {departmentFilter
              ? `Équipe ${departmentFilter.charAt(0).toUpperCase() + departmentFilter.slice(1)}`
              : gridTitle}
          </h2>
        )}
        <p className="mb-8 text-lg text-left text-zinc-900 dark:text-zinc-100 tracking-tight">{gridDescription}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
          {filteredItems.map((item, index) => (
            <CardGridItem
              key={`${item.meetLink}-${item.name}-${index}`}
              name={item.name}
              role={item.role}
              department={item.department}
              image={item.image}
              imageOffsetX={item.imageOffsetX}
              imageOffsetY={item.imageOffsetY}
              imageZoom={item.imageZoom}
              meetLink={item.meetLink}
            />
          ))}
        </div>
        <Link href="/">
          <Button variant="outline" size="sm" className="flex items-center gap-2 cursor-pointer">
            <ArrowLeftIcon className="h-4 w-4" />
            Revenir au début
          </Button>
        </Link> 
        
      </div>
      
    </section>
  )
}
