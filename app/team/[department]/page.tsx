import CardGrid from "@/components/kokonutui/card-grid"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "@radix-ui/react-icons"

interface TeamDepartmentPageProps {
  params: {
    department: string
  }
}

export default async function TeamDepartmentPage({ params }: TeamDepartmentPageProps) {
  const department = params.department

  // Capitalize first letter for display
  const displayDepartment = department.charAt(0).toUpperCase() + department.slice(1)

  return (
    <main className="bg-gray-50 dark:bg-zinc-950 min-h-screen relative">
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-10">
        <Link href="/">
          <Button variant="outline" size="sm" className="flex items-center gap-2 cursor-pointer">
            <ArrowLeftIcon className="h-4 w-4" />
            Revenir au début
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-4 py-12">
        <CardGrid
          departmentFilter={department}
          gridTitle={`Équipe ${displayDepartment}`}
          gridDescription="Cliquez sur un membre de l'équipe pour démarrer une session Google Meet"
        />
      </div>
    </main>
  )
}
