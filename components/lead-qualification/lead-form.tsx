"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { ArrowRightIcon } from "@radix-ui/react-icons"

interface FormData {
  clientType: "existing" | "new" | ""
  department: "Marketing" | "Ventes" | "Développement" | ""
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  companySize: "1-10" | "11-50" | "51-200" | "201-500" | "500+" | ""
  industry: "Tech" | "Finance" | "Santé" | "Éducation" | "E-commerce" | "Autre" | ""
  currentWebsite: string
  budget: "< 5K$" | "5K$ - 20K$" | "20K$ - 50K$" | "> 50K$" | ""
  timeline: "Immédiat" | "1-3 mois" | "3-6 mois" | "> 6 mois" | ""
  marketingGoals: string[]
  salesGoals: string[]
  developmentType: "Site vitrine" | "E-commerce" | "Application web" | "Application mobile" | "Autre" | ""
  developmentTech: string
  additionalInfo: string
}

export default function LeadQualificationForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    clientType: "",
    department: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    companySize: "",
    industry: "",
    currentWebsite: "",
    budget: "",
    timeline: "",
    marketingGoals: [],
    salesGoals: [],
    developmentType: "",
    developmentTech: "",
    additionalInfo: "",
  })

  const calculateProgress = () => {
    if (formData.clientType === "existing") {
      return (currentStep / 3) * 100
    } else {
      return (currentStep / 5) * 100
    }
  }

  const calculateLeadScore = () => {
    let score = 0

    // Base score for new leads
    if (formData.clientType === "new") {
      score += 20

      // Contact information completeness
      if (formData.firstName && formData.lastName) score += 10
      if (formData.email) score += 10
      if (formData.phone) score += 5
      if (formData.company) score += 5

      // Budget scoring
      switch (formData.budget) {
        case "< 5K$":
          score += 5
          break
        case "5K$ - 20K$":
          score += 10
          break
        case "20K$ - 50K$":
          score += 15
          break
        case "> 50K$":
          score += 20
          break
      }

      // Timeline scoring
      switch (formData.timeline) {
        case "Immédiat":
          score += 20
          break
        case "1-3 mois":
          score += 15
          break
        case "3-6 mois":
          score += 10
          break
        case "> 6 mois":
          score += 5
          break
      }

      // Additional information bonus
      if (formData.additionalInfo.length > 50) score += 10
    } else {
      // Existing clients start with a higher base score
      score += 60

      // Department selection
      if (formData.department) score += 20

      // Additional information bonus
      if (formData.additionalInfo.length > 0) score += 20
    }

    return Math.min(score, 100)
  }

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCheckboxChange = (field: keyof FormData, value: string, checked: boolean) => {
    if (!Array.isArray(formData[field])) return;
    
    setFormData((prev) => {
      const currentValues = [...prev[field] as string[]];
      
      if (checked && !currentValues.includes(value)) {
        return {
          ...prev,
          [field]: [...currentValues, value]
        };
      } else if (!checked && currentValues.includes(value)) {
        return {
          ...prev,
          [field]: currentValues.filter(item => item !== value)
        };
      }
      
      return prev;
    });
  }

  const nextStep = () => {
    if (formData.clientType === "existing" && currentStep === 3) {
      // Calculate score for analytics/backend but don't show to user
      const score = calculateLeadScore()

      // Store score in localStorage or send to backend
      localStorage.setItem("leadScore", score.toString())

      // Normaliser le nom du département (enlever les accents) pour l'URL
      const normalizedDepartment = formData.department.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      // Créer des paramètres d'URL avec les informations client
      const params = new URLSearchParams();
      if (formData.firstName && formData.lastName) {
        params.append('name', `${formData.firstName} ${formData.lastName}`);
      }
      if (formData.email) params.append('email', formData.email);
      if (formData.phone) params.append('phone', formData.phone);
      if (formData.company) params.append('company', formData.company);
      if (formData.department) params.append('department', formData.department);
      if (formData.additionalInfo) params.append('info', formData.additionalInfo);

      // Redirect to team page with department filter and client info
      router.push(`/team/${normalizedDepartment}?${params.toString()}`);
      return
    }

    if (formData.clientType === "new" && currentStep === 5) {
      // Calculate score for analytics/backend but don't show to user
      const score = calculateLeadScore()

      // Store score in localStorage or send to backend
      localStorage.setItem("leadScore", score.toString())

      // Afficher le score dans la console pour les nouveaux clients
      console.log("----------------------------------");
      console.log(`Score du prospect: ${score}/100`);
      console.log("Informations du prospect:", {
        nom: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        téléphone: formData.phone || "Non renseigné",
        entreprise: formData.company || "Non renseignée",
        département: formData.department,
        budget: formData.budget,
        délai: formData.timeline,
        informations_complémentaires: formData.additionalInfo || "Aucune"
      });
      console.log("----------------------------------");

      // Normaliser le nom du département (enlever les accents) pour l'URL
      const normalizedDepartment = formData.department.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      // Créer des paramètres d'URL avec les informations client
      const params = new URLSearchParams();
      if (formData.firstName && formData.lastName) {
        params.append('name', `${formData.firstName} ${formData.lastName}`);
      }
      if (formData.email) params.append('email', formData.email);
      if (formData.phone) params.append('phone', formData.phone);
      if (formData.company) params.append('company', formData.company);
      if (formData.department) params.append('department', formData.department);
      if (formData.additionalInfo) params.append('info', formData.additionalInfo);

      // Redirect to team page with department filter and client info
      router.push(`/team/${normalizedDepartment}?${params.toString()}`);
      return
    }

    setCurrentStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const isNextDisabled = () => {
    switch (currentStep) {
      case 1:
        return !formData.clientType
      case 2:
        if (formData.clientType === "existing") {
          return !formData.department || !formData.firstName || !formData.lastName || !formData.email || !formData.company || !formData.phone
        } else {
          return !formData.firstName || !formData.lastName || !formData.email
        }
      case 3:
        if (formData.clientType === "existing") {
          // Simplifier l'étape pour les clients existants - suppression des questions par département
          return false // Le champ additionalInfo est facultatif
        } else {
          // Pour les nouveaux clients
          return !formData.department || !formData.company || !formData.companySize || !formData.industry
        }
      case 4:
        // Pour les nouveaux clients - questions spécifiques au département
        if (formData.department === "Marketing") {
          return formData.marketingGoals.length === 0
        } else if (formData.department === "Ventes") {
          return formData.salesGoals.length === 0
        } else if (formData.department === "Développement") {
          return !formData.developmentType
        }
        return false
      case 5:
        return !formData.budget || !formData.timeline
      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <CardTitle>Êtes-vous déjà client ?</CardTitle>
            <CardDescription>
              Votre réponse nous permettra de vous orienter vers le parcours le plus adapté à votre situation.
            </CardDescription>
            <RadioGroup
              value={formData.clientType}
              onValueChange={(value) => handleInputChange("clientType", value)}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2"
            >
              <div>
                <RadioGroupItem value="existing" id="existing" className="peer sr-only" />
                <Label
                  htmlFor="existing"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-[#7DF9FF]/10 hover:border-[#7DF9FF] dark:hover:bg-[#1c7f82] peer-data-[state=checked]:hover:bg-[#7DF9FF] peer-data-[state=checked]:border-[#7DF9FF] peer-data-[state=checked]:bg-[#7DF9FF] dark:peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-[#7DF9FF] cursor-pointer"
                >
                  <span className="text-sm font-medium dark:text-zinc-900 dark:peer-data-[state=checked]:text-white">Oui, je suis déjà client</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="new" id="new" className="peer sr-only" />
                <Label
                  htmlFor="new"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-[#7DF9FF]/10 hover:border-[#7DF9FF] dark:hover:bg-[#1c7f82] peer-data-[state=checked]:hover:bg-[#7DF9FF] peer-data-[state=checked]:border-[#7DF9FF] peer-data-[state=checked]:bg-[#7DF9FF] dark:peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-[#7DF9FF] cursor-pointer"
                >
                  <span className="text-sm font-medium dark:text-zinc-900 dark:peer-data-[state=checked]:text-white">Non, je suis un nouveau client</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        )
      case 2:
        if (formData.clientType === "existing") {
          return (
            <div className="space-y-4">
              <CardTitle>Vos informations de contact</CardTitle>
              <CardDescription>
                Merci de nous fournir vos informations de contact pour que nous puissions vous inclure dans le rendez-vous.
              </CardDescription>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    placeholder="Prénom"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    placeholder="Nom"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemple.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Entreprise *</Label>
                  <Input
                    id="company"
                    placeholder="Nom de votre entreprise"
                    value={formData.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    placeholder="+33 6 12 34 56 78"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="department">Département à contacter *</Label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                    <SelectTrigger className="dark:bg-zinc-950 bg-white hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
                    <SelectValue placeholder="Sélectionnez un département" />
                  </SelectTrigger>
                    <SelectContent className="dark:bg-zinc-950 bg-white">
                      <SelectItem value="Marketing" className="dark:text-white dark:hover:bg-zinc-800 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800" >Marketing</SelectItem>
                      <SelectItem value="Ventes" className="dark:text-white dark:hover:bg-zinc-800 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800">Ventes</SelectItem>
                      <SelectItem value="Développement" className="dark:text-white dark:hover:bg-zinc-800 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800">Développement</SelectItem>
                  </SelectContent>
                </Select>
                </div>
              </div>
            </div>
          )
        } else {
          return (
            <div className="space-y-4">
              <CardTitle>Vos coordonnées</CardTitle>
              <CardDescription>
                Merci de nous fournir vos informations de contact pour que nous puissions vous recontacter.
              </CardDescription>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    placeholder="Prénom"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    placeholder="Nom"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemple.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    placeholder="+33 6 12 34 56 78"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Entreprise</Label>
                  <Input
                    id="company"
                    placeholder="Nom de votre entreprise"
                    value={formData.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )
        }
      case 3:
        if (formData.clientType === "existing") {
          // Simplifier l'étape pour les clients existants - suppression des questions par département
          return (
            <div className="space-y-4">
              <CardTitle>Informations sur le rendez-vous</CardTitle>
              <CardDescription>
                Parlez-nous brièvement du sujet que vous souhaitez aborder lors de ce rendez-vous.
              </CardDescription>
              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Sujet du rendez-vous</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="Décrivez le sujet que vous souhaitez aborder, vos questions ou besoins spécifiques..."
                  value={formData.additionalInfo}
                  onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                  rows={6}
                />
              </div>
            </div>
          );
        } else {
          // Informations sur l'entreprise pour les nouveaux clients
        return (
          <div className="space-y-4">
              <CardTitle>Votre entreprise</CardTitle>
            <CardDescription>
                Parlez-nous un peu plus de votre entreprise pour que nous puissions mieux comprendre vos besoins.
            </CardDescription>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Nom de l&apos;entreprise *</Label>
                  <Input
                    id="company"
                    placeholder="Nom de votre entreprise"
                    value={formData.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Taille de l&apos;entreprise *</Label>
                  <RadioGroup
                    value={formData.companySize}
                    onValueChange={(value) => handleInputChange("companySize", value)}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2"
                  >
                    {(["1-10", "11-50", "51-200", "201-500", "500+"] as const).map((size) => (
                      <div key={size}>
                        <RadioGroupItem value={size} id={`size-${size}`} className="peer sr-only" />
                        <Label
                          htmlFor={`size-${size}`}
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-2 hover:bg-[#7DF9FF]/10 hover:border-[#7DF9FF] dark:hover:bg-[#1c7f82] peer-data-[state=checked]:hover:bg-[#7DF9FF] peer-data-[state=checked]:border-[#7DF9FF] peer-data-[state=checked]:bg-[#7DF9FF] dark:peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-[#7DF9FF] cursor-pointer"
                        >
                          <span className="text-sm font-medium dark:text-zinc-900 dark:peer-data-[state=checked]:text-white">{size}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label>Secteur d&apos;activité *</Label>
                  <RadioGroup
                    value={formData.industry}
                    onValueChange={(value) => handleInputChange("industry", value)}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2"
                  >
                    {(["Tech", "Finance", "Santé", "Éducation", "E-commerce", "Autre"] as const).map((industry) => (
                      <div key={industry}>
                        <RadioGroupItem value={industry} id={`industry-${industry}`} className="peer sr-only" />
                        <Label
                          htmlFor={`industry-${industry}`}
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-2 hover:bg-[#7DF9FF]/10 hover:border-[#7DF9FF] dark:hover:bg-[#1c7f82] peer-data-[state=checked]:hover:bg-[#7DF9FF] peer-data-[state=checked]:border-[#7DF9FF] peer-data-[state=checked]:bg-[#7DF9FF] dark:peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-[#7DF9FF] cursor-pointer"
                        >
                          <span className="text-sm font-medium dark:text-zinc-900 dark:peer-data-[state=checked]:text-white">{industry}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currentWebsite">Site web actuel (optionnel)</Label>
                  <Input
                    id="currentWebsite"
                    placeholder="https://www.votresite.com"
                    value={formData.currentWebsite}
                    onChange={(e) => handleInputChange("currentWebsite", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Département à contacter *</Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                    <SelectTrigger className="dark:bg-zinc-950 bg-white hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
                  <SelectValue placeholder="Sélectionnez un département" />
                </SelectTrigger>
                    <SelectContent className="dark:bg-zinc-950 bg-white">
                      <SelectItem value="Marketing" className="dark:text-white dark:hover:bg-zinc-800 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800">Marketing</SelectItem>
                      <SelectItem value="Ventes" className="dark:text-white dark:hover:bg-zinc-800 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800">Ventes</SelectItem>
                      <SelectItem value="Développement" className="dark:text-white dark:hover:bg-zinc-800 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800">Développement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
            </div>
          );
        }
        
      case 4:
        // Questions spécifiques au département pour les nouveaux clients
        if (formData.department === "Marketing") {
          return (
            <div className="space-y-4">
              <CardTitle>Vos objectifs marketing</CardTitle>
              <CardDescription>
                Quels sont vos principaux objectifs en termes de marketing digital ?
              </CardDescription>
              <div className="grid grid-cols-1 gap-2 pt-2">
                {["Augmenter la notoriété de marque", "Générer des leads", "Booster les ventes en ligne", "Améliorer l&apos;engagement sur les réseaux", "Refonte de stratégie", "Création de contenu"].map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={goal.replace(/\s+/g, '-').toLowerCase()}
                      checked={formData.marketingGoals.includes(goal)}
                      onChange={(e) => handleCheckboxChange("marketingGoals", goal, e.target.checked)}
                      className="h-4 w-4 border-gray-300 rounded text-[#7DF9FF] focus:ring-[#7DF9FF]"
                    />
                    <Label htmlFor={goal.replace(/\s+/g, '-').toLowerCase()} className="cursor-pointer">{goal}</Label>
                  </div>
                ))}
              </div>
            </div>
          );
        } else if (formData.department === "Ventes") {
          return (
            <div className="space-y-4">
              <CardTitle>Vos objectifs commerciaux</CardTitle>
              <CardDescription>
                Quels sont vos principaux objectifs en termes de ventes ?
              </CardDescription>
              <div className="grid grid-cols-1 gap-2 pt-2">
                {["Augmenter le CA", "Diversifier la clientèle", "Accélérer le cycle de vente", "Former l&apos;équipe commerciale", "Optimiser la prospection", "Améliorer le CRM"].map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={goal.replace(/\s+/g, '-').toLowerCase()}
                      checked={formData.salesGoals.includes(goal)}
                      onChange={(e) => handleCheckboxChange("salesGoals", goal, e.target.checked)}
                      className="h-4 w-4 border-gray-300 rounded text-[#7DF9FF] focus:ring-[#7DF9FF]"
                    />
                    <Label htmlFor={goal.replace(/\s+/g, '-').toLowerCase()} className="cursor-pointer">{goal}</Label>
                  </div>
                ))}
              </div>
            </div>
          );
        } else if (formData.department === "Développement") {
          return (
            <div className="space-y-4">
              <CardTitle>Votre projet de développement</CardTitle>
              <CardDescription>
                Quel type de développement vous intéresse ?
              </CardDescription>
              <RadioGroup
                value={formData.developmentType}
                onValueChange={(value) => handleInputChange("developmentType", value)}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2"
              >
                {(["Site vitrine", "E-commerce", "Application web", "Application mobile", "Autre"] as const).map((type) => (
                  <div key={type}>
                    <RadioGroupItem value={type} id={type.replace(/\s+/g, '-').toLowerCase()} className="peer sr-only" />
                    <Label
                      htmlFor={type.replace(/\s+/g, '-').toLowerCase()}
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-2 hover:bg-[#7DF9FF]/10 hover:border-[#7DF9FF] dark:hover:bg-[#1c7f82] peer-data-[state=checked]:hover:bg-[#7DF9FF] peer-data-[state=checked]:border-[#7DF9FF] peer-data-[state=checked]:bg-[#7DF9FF] dark:peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-[#7DF9FF] cursor-pointer"
                    >
                      <span className="text-sm font-medium dark:text-zinc-900 dark:peer-data-[state=checked]:text-white">{type}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              
              <div className="space-y-2 mt-4">
                <Label htmlFor="developmentTech">Technologies préférées (optionnel)</Label>
                <Input
                  id="developmentTech"
                  placeholder="Ex: React, Node.js, WordPress..."
                  value={formData.developmentTech}
                  onChange={(e) => handleInputChange("developmentTech", e.target.value)}
                />
              </div>
            </div>
          );
        }
        
      case 5:
        return (
          <div className="space-y-4">
            <CardTitle>Informations sur votre projet</CardTitle>
            <CardDescription>
              Ces informations nous aideront à mieux comprendre vos besoins et à vous proposer une solution adaptée.
            </CardDescription>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Budget estimé *</Label>
                <RadioGroup
                  value={formData.budget}
                  onValueChange={(value) => handleInputChange("budget", value)}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                >
                  <div>
                    <RadioGroupItem value="< 5K$" id="budget1" className="peer sr-only" />
                    <Label
                      htmlFor="budget1"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-2 hover:bg-[#7DF9FF]/10 hover:border-[#7DF9FF] dark:hover:bg-[#1c7f82] peer-data-[state=checked]:hover:bg-[#7DF9FF] peer-data-[state=checked]:border-[#7DF9FF] peer-data-[state=checked]:bg-[#7DF9FF] dark:peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-[#7DF9FF] cursor-pointer"
                    >
                      <span className="text-sm font-medium dark:text-zinc-900 dark:peer-data-[state=checked]:text-white">{"< 5K$"}</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="5K$ - 20K$" id="budget2" className="peer sr-only" />
                    <Label
                      htmlFor="budget2"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-2 hover:bg-[#7DF9FF]/10 hover:border-[#7DF9FF] dark:hover:bg-[#1c7f82] peer-data-[state=checked]:hover:bg-[#7DF9FF] peer-data-[state=checked]:border-[#7DF9FF] peer-data-[state=checked]:bg-[#7DF9FF] dark:peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-[#7DF9FF] cursor-pointer"
                    >
                      <span className="text-sm font-medium dark:text-zinc-900 dark:peer-data-[state=checked]:text-white">5K$ - 20K$</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="20K$ - 50K$" id="budget3" className="peer sr-only" />
                    <Label
                      htmlFor="budget3"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-2 hover:bg-[#7DF9FF]/10 hover:border-[#7DF9FF] dark:hover:bg-[#1c7f82] peer-data-[state=checked]:hover:bg-[#7DF9FF] peer-data-[state=checked]:border-[#7DF9FF] peer-data-[state=checked]:bg-[#7DF9FF] dark:peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-[#7DF9FF] cursor-pointer"
                    >
                      <span className="text-sm font-medium dark:text-zinc-900 dark:peer-data-[state=checked]:text-white">20K$ - 50K$</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="> 50K$" id="budget4" className="peer sr-only" />
                    <Label
                      htmlFor="budget4"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-2 hover:bg-[#7DF9FF]/10 hover:border-[#7DF9FF] dark:hover:bg-[#1c7f82] peer-data-[state=checked]:hover:bg-[#7DF9FF] peer-data-[state=checked]:border-[#7DF9FF] peer-data-[state=checked]:bg-[#7DF9FF] dark:peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-[#7DF9FF] cursor-pointer"
                    >
                      <span className="text-sm font-medium dark:text-zinc-900 dark:peer-data-[state=checked]:text-white">{"> 50K$"}</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Délai de réalisation souhaité *</Label>
                <RadioGroup
                  value={formData.timeline}
                  onValueChange={(value) => handleInputChange("timeline", value)}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                >
                  <div>
                    <RadioGroupItem value="Immédiat" id="timeline1" className="peer sr-only" />
                    <Label
                      htmlFor="timeline1"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-2 hover:bg-[#7DF9FF]/10 hover:border-[#7DF9FF] dark:hover:bg-[#1c7f82] peer-data-[state=checked]:hover:bg-[#7DF9FF] peer-data-[state=checked]:border-[#7DF9FF] peer-data-[state=checked]:bg-[#7DF9FF] dark:peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-[#7DF9FF] cursor-pointer"
                    >
                      <span className="text-sm font-medium dark:text-zinc-900 dark:peer-data-[state=checked]:text-white">Immédiat</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="1-3 mois" id="timeline2" className="peer sr-only" />
                    <Label
                      htmlFor="timeline2"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-2 hover:bg-[#7DF9FF]/10 hover:border-[#7DF9FF] dark:hover:bg-[#1c7f82] peer-data-[state=checked]:hover:bg-[#7DF9FF] peer-data-[state=checked]:border-[#7DF9FF] peer-data-[state=checked]:bg-[#7DF9FF] dark:peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-[#7DF9FF] cursor-pointer"
                    >
                      <span className="text-sm font-medium dark:text-zinc-900 dark:peer-data-[state=checked]:text-white">1-3 mois</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="3-6 mois" id="timeline3" className="peer sr-only" />
                    <Label
                      htmlFor="timeline3"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-2 hover:bg-[#7DF9FF]/10 hover:border-[#7DF9FF] dark:hover:bg-[#1c7f82] peer-data-[state=checked]:hover:bg-[#7DF9FF] peer-data-[state=checked]:border-[#7DF9FF] peer-data-[state=checked]:bg-[#7DF9FF] dark:peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-[#7DF9FF] cursor-pointer"
                    >
                      <span className="text-sm font-medium dark:text-zinc-900 dark:peer-data-[state=checked]:text-white">3-6 mois</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="> 6 mois" id="timeline4" className="peer sr-only" />
                    <Label
                      htmlFor="timeline4"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-2 hover:bg-[#7DF9FF]/10 hover:border-[#7DF9FF] dark:hover:bg-[#1c7f82] peer-data-[state=checked]:hover:bg-[#7DF9FF] peer-data-[state=checked]:border-[#7DF9FF] peer-data-[state=checked]:bg-[#7DF9FF] dark:peer-data-[state=checked]:text-white [&:has([data-state=checked])]:border-[#7DF9FF] cursor-pointer"
                    >
                      <span className="text-sm font-medium dark:text-zinc-900 dark:peer-data-[state=checked]:text-white">{"> 6 mois"}</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Informations complémentaires (optionnel)</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="Décrivez votre projet ou vos besoins spécifiques..."
                  value={formData.additionalInfo}
                  onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-[#7DF9FF] border-2">
      <CardHeader>
        <div className="w-full mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span>
              Étape {currentStep} / {formData.clientType === "existing" ? 3 : 5}
            </span>
            <span>{Math.round(calculateProgress())}%</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>{renderStepContent()}</CardContent>
      <CardFooter className="flex justify-between">
        {currentStep > 1 ? (
          <Button variant="outline" onClick={prevStep} className="cursor-pointer">
            Retour
          </Button>
        ) : (
          <div></div>
        )}
        <Button onClick={nextStep} disabled={isNextDisabled()} className="cursor-pointer">
          {(formData.clientType === "existing" && currentStep === 3) ||
           (formData.clientType === "new" && currentStep === 5)
              ? "Soumettre"
              : "Suivant"}
          {(formData.clientType === "existing" && currentStep === 3) ||
           (formData.clientType === "new" && currentStep === 5) ? null : (
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
