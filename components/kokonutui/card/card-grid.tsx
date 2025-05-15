import { cn } from "@/lib/utils"
import { ArrowUpRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export interface CardGridItemProps {
  name?: string
  role?: string
  department?: string | string[]
  image?: string
  imageOffsetX?: string | number
  imageOffsetY?: string | number
  imageZoom?: number
  badge?: {
    text: string
    variant: "pink" | "indigo" | "orange" | "green" | "cyan"
  }
  href?: string
  meetLink?: string
}

export default function CardGrid({
  name = "John Doe",
  role = "Chef de Produit",
  department = "Développement",
  image = "/professional-person.png",
  imageOffsetX = "50%",
  imageOffsetY = "50%",
  imageZoom = 1,
  badge = { text: "Développement", variant: "cyan" },
  href = "#",
  meetLink = "https://meet.google.com/abc-defg-hij",
}: CardGridItemProps) {
  // Determine what to display in the badge
  const displayDepartment = Array.isArray(department) ? department[0] : department;
  
  // Préparer les offsets
  const positionX = typeof imageOffsetX === 'number' ? `${imageOffsetX}px` : imageOffsetX;
  const positionY = typeof imageOffsetY === 'number' ? `${imageOffsetY}px` : imageOffsetY;
  
  return (
    <Link
      href={meetLink || href}
      className="block w-full group transition-transform duration-300 hover:scale-105 hover:z-10"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl aspect-square w-full",
          "bg-white/80 dark:bg-zinc-900/80",
          "backdrop-blur-xl",
          "border border-zinc-200/50 dark:border-zinc-800/50",
          "shadow-xs",
          "transition-all duration-300",
          "hover:shadow-lg",
          "hover:border-zinc-300/50 dark:hover:border-zinc-700/50",
        )}
      >
        <div className="relative w-full h-full overflow-hidden">
          <div 
            className="absolute inset-0"
            style={{
              transform: `scale(${imageZoom})`,
              transformOrigin: `${positionX} ${positionY}`
            }}
          >
            <Image
              src={image || "/placeholder.svg"}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              style={{ objectPosition: `${positionX} ${positionY}` }}
            />
          </div>
        </div>

        <div className={cn("absolute inset-0", "bg-linear-to-t from-black/90 via-black/0 to-transparent")} />

        <div className="absolute top-3 right-3">
          <span
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-medium",
              "bg-white/70 text-black",
              "backdrop-blur-md",
              "shadow-xs",
            )}
          >
            {displayDepartment || badge.text}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1.5">
              <h3 className="text-lg font-semibold text-white dark:text-zinc-100 leading-snug tracking-tighter">
                {name}
              </h3>
              <p className="text-sm text-zinc-200 dark:text-zinc-300 line-clamp-2 tracking-tight">{role}</p>
            </div>
            <div
              className={cn("p-2 rounded-full", "bg-[#7DF9FF]", "transition-all duration-300", "group-hover:rotate-12")}
            >
              <ArrowUpRight className="w-4 h-4 text-black group-hover:-rotate-12 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
