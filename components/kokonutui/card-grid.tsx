import CardGridItem, { type CardGridItemProps } from "./card/card-grid"

interface CardGridProps {
  items?: CardGridItemProps[]
  gridTitle?: string
  gridDescription?: string
  departmentFilter?: string
}

const teamMembers: CardGridItemProps[] = [
  {
    name: "Emma Johnson",
    role: "Chef de Produit",
    department: "Marketing",
    image: "/professional-woman-diverse.png",
    meetLink: "https://meet.google.com/abc-defg-hij",
  },
  {
    name: "Michael Chen",
    role: "Designer UX",
    department: "Développement",
    image: "/asian-professional-man.png",
    meetLink: "https://meet.google.com/klm-nopq-rst",
  },
  {
    name: "Sarah Williams",
    role: "Directrice Marketing",
    department: "Marketing",
    image: "/black-woman-professional.png",
    meetLink: "https://meet.google.com/uvw-xyz1-234",
  },
  {
    name: "David Rodriguez",
    role: "Ingénieur Logiciel",
    department: "Développement",
    image: "/placeholder-sllf5.png",
    meetLink: "https://meet.google.com/567-89ab-cde",
  },
  {
    name: "Aisha Patel",
    role: "Responsable Commercial",
    department: "Ventes",
    image: "/indian-woman-professional.png",
    meetLink: "https://meet.google.com/fgh-ijkl-mno",
  },
  {
    name: "Thomas Dubois",
    role: "Représentant Commercial",
    department: "Ventes",
    image: "/placeholder-8k604.png",
    meetLink: "https://meet.google.com/pqr-stuv-wxy",
  },
]

export default function CardGrid({
  items = teamMembers,
  gridTitle = "Rencontrez Notre Équipe",
  gridDescription = "Cliquez sur un membre de l'équipe pour démarrer une session Google Meet",
  departmentFilter,
}: CardGridProps) {
  // Filter items by department if a filter is provided
  const filteredItems = departmentFilter
    ? items.filter((item) => item.department && item.department.toLowerCase() === departmentFilter.toLowerCase())
    : items

  if (!filteredItems || filteredItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-zinc-500 dark:text-zinc-400">Aucun membre d'équipe à afficher.</p>
      </div>
    )
  }

  return (
    <section className="w-full py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4 md:px-6">
        {gridTitle && (
          <h2 className="mb-2 tracking-tighter text-3xl font-bold text-left text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            {departmentFilter
              ? `Équipe ${departmentFilter.charAt(0).toUpperCase() + departmentFilter.slice(1)}`
              : gridTitle}
          </h2>
        )}
        <p className="mb-8 text-lg text-left text-zinc-900 dark:text-zinc-100 tracking-tight">{gridDescription}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item, index) => (
            <CardGridItem
              key={`${item.meetLink}-${item.name}-${index}`}
              name={item.name}
              role={item.role}
              department={item.department}
              image={item.image}
              meetLink={item.meetLink}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
