import LeadQualificationForm from "@/components/lead-qualification/lead-form"

export default function Page() {
  return (
    <main className="bg-gray-50 dark:bg-zinc-950 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-4">
            Parlez-nous de votre projet
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Quelques informations nous permettront de vous orienter vers les experts les plus adaptés à vos besoins.
          </p>
          <LeadQualificationForm />
        </div>
      </div>
    </main>
  )
}
