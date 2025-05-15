"use client"

import { cn } from "@/lib/utils"
import { ArrowUpRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export interface CardGridItemProps {
  name: string
  role: string
  department: string | string[]
  image: string
  imageOffsetX?: string
  imageOffsetY?: string
  imageZoom?: number
  badge?: {
    text: string
    variant: "pink" | "indigo" | "orange" | "green" | "cyan"
  }
  meetLink?: string
  email?: string
}

export default function CardGridItem({
  name,
  role,
  department,
  image,
  imageOffsetX = "50%",
  imageOffsetY = "50%",
  imageZoom = 1,
  badge = { text: "Développement", variant: "cyan" },
  meetLink,
  email = "contact@omnigo.com"
}: CardGridItemProps) {
  // État pour l'URL d'image par défaut en cas d'erreur
  const [imgSrc, setImgSrc] = useState(image)
  const [clientInfo, setClientInfo] = useState<Record<string, string>>({})

  // Récupérer les paramètres d'URL pour les informations client
  const searchParams = useSearchParams()

  useEffect(() => {
    // Récupérer les informations du client depuis les paramètres d'URL si disponibles
    const params = {
      name: searchParams.get("name") || "",
      email: searchParams.get("email") || "",
      phone: searchParams.get("phone") || "",
      company: searchParams.get("company") || "",
      department: searchParams.get("department") || "",
      info: searchParams.get("additionalInfo") || "",
    }
    
    setClientInfo(params)
  }, [searchParams])

  // Fonction pour construire l'URL de la page de disponibilité
  const buildAvailabilityUrl = () => {
    // Créer une nouvelle URLSearchParams
    const params = new URLSearchParams()
    
    // Ajouter les informations du membre de l'équipe
    params.append("teamMemberName", name)
    params.append("teamMemberRole", role)
    params.append("teamMemberEmail", email)
    
    // Ajouter les informations du client si disponibles
    Object.entries(clientInfo).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    
    // Déterminer le département à partir du rôle ou du département
    let deptParam = ""
    if (typeof department === "string") {
      deptParam = department.toLowerCase()
    } else if (Array.isArray(department) && department.length > 0) {
      deptParam = department[0].toLowerCase()
    }
    
    // Normaliser le département (enlever les accents)
    deptParam = deptParam
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
    
    // Construire et retourner l'URL complète
    return `/availability/${deptParam}?${params.toString()}`
  }

  // Determine what to display in the badge
  const displayDepartment = Array.isArray(department) ? department[0] : department;
  
  // Préparer les offsets
  const positionX = typeof imageOffsetX === 'number' ? `${imageOffsetX}px` : imageOffsetX;
  const positionY = typeof imageOffsetY === 'number' ? `${imageOffsetY}px` : imageOffsetY;
  
  return (
    <Link
      href={buildAvailabilityUrl()}
      className="block w-full group transition-transform duration-300 hover:scale-105 hover:z-10"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Card className="group overflow-hidden h-full transition-all duration-200 hover:shadow-md cursor-pointer">
        <div className="relative h-44 w-full overflow-hidden">
          <Image
            src={imgSrc}
            alt={name}
            fill
            style={{
              objectFit: "cover",
              objectPosition: `${positionX} ${positionY}`,
              transform: `scale(${imageZoom})`,
              transition: "transform 0.3s ease-in-out",
            }}
            onError={() => setImgSrc("/placeholder-user.jpg")}
            className="group-hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-xl tracking-tight">{name}</h3>
          <p className="text-sm text-muted-foreground">{role}</p>
          
          {/* Afficher l'email du membre d'équipe */}
          <div className="mt-2 text-xs text-muted-foreground flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <span className="truncate">{email}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
