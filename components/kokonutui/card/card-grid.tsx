"use client"

import { cn } from "@/lib/utils"
import { ArrowUpRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState } from "react"

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
  email?: string
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
  email = "contact@omnigo.com"
}: CardGridItemProps) {
  // Récupérer les paramètres d'URL pour les informations client
  const searchParams = useSearchParams();
  
  // Préparer les offsets pour l'image
  const positionX = typeof imageOffsetX === 'number' ? `${imageOffsetX}px` : imageOffsetX;
  const positionY = typeof imageOffsetY === 'number' ? `${imageOffsetY}px` : imageOffsetY;
  
  // Déterminer le département à afficher si c'est un tableau
  const displayDepartment = Array.isArray(department) ? department[0] : department;
  
  // Fonction pour construire l'URL de la page de disponibilité
  const buildAvailabilityUrl = () => {
    // Créer une nouvelle URLSearchParams
    const params = new URLSearchParams();
    
    // Ajouter les informations du membre de l'équipe
    params.append("teamMemberName", name || "");
    params.append("teamMemberRole", role || "");
    params.append("teamMemberEmail", email || "");
    
    // Récupérer et transmettre les informations du client depuis les paramètres d'URL
    const clientParams = [
      "name", "email", "phone", "company", "department", "info"
    ];
    
    clientParams.forEach(param => {
      const value = searchParams.get(param);
      if (value) {
        params.append(param, value);
      }
    });
    
    // Déterminer le département pour l'URL
    let deptParam = "";
    if (typeof department === "string") {
      deptParam = department.toLowerCase();
    } else if (Array.isArray(department) && department.length > 0) {
      deptParam = department[0].toLowerCase();
    }
    
    // Normaliser le département (enlever les accents)
    deptParam = deptParam
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    
    // Construire et retourner l'URL complète
    return `/availability/${deptParam}?${params.toString()}`;
  };
  
  return (
    <Link
      href={buildAvailabilityUrl()}
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
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            style={{
              objectPosition: `${positionX} ${positionY}`,
              transform: `scale(${imageZoom})`,
            }}
          />
        </div>

        <div className={cn("absolute inset-0", "bg-linear-to-t from-black/90 via-black/40 to-transparent")} />

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
              
              {/* Afficher l'email */}
              <div className="flex items-center text-xs text-zinc-300/80 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span className="truncate">{email}</span>
              </div>
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
