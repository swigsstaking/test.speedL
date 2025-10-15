import { Link } from 'react-router-dom'
import { Car, Truck, Bike, CheckCircle, ArrowRight, Euro } from 'lucide-react'

const Permits = () => {
  const permits = [
    {
      id: 'cat-b',
      title: 'Permis voiture (Catégorie B)',
      icon: <Car className="w-10 h-10" />,
      color: 'primary',
      description: 'Le permis de conduire standard pour les véhicules automobiles.',
      requirements: [
        'Avoir 18 ans révolus',
        'Cours de premiers secours (10h)',
        'Cours de sensibilisation (8h)',
        'Examen théorique réussi',
        'Minimum 20 heures de conduite recommandées'
      ],
      process: [
        'Inscription au cours de premiers secours',
        'Demande du permis d\'élève conducteur',
        'Passage de l\'examen théorique',
        'Cours de sensibilisation',
        'Leçons de conduite pratiques',
        'Examen pratique'
      ],
      pricing: {
        lesson: 'CHF 90.- / heure',
        exam: 'CHF 150.- (frais d\'examen)',
        package: 'Forfaits disponibles sur demande'
      }
    },
    {
      id: 'cat-be',
      title: 'Permis remorque (Catégorie BE)',
      icon: <Truck className="w-10 h-10" />,
      color: 'gray',
      description: 'Pour conduire une voiture avec une remorque de plus de 750 kg.',
      requirements: [
        'Être titulaire du permis B',
        'Cours de conduite pratique',
        'Examen pratique spécifique'
      ],
      process: [
        'Inscription au cours BE',
        'Leçons de conduite avec remorque',
        'Examen pratique'
      ],
      pricing: {
        lesson: 'CHF 100.- / heure',
        exam: 'CHF 180.- (frais d\'examen)',
        package: 'Forfait 5h : CHF 480.-'
      }
    },
    {
      id: 'moto',
      title: 'Permis moto / scooter',
      icon: <Bike className="w-10 h-10" />,
      color: 'red',
      description: 'Pour la conduite de motos et scooters selon la cylindrée.',
      requirements: [
        'Catégorie A1 : dès 16 ans (125 cm³)',
        'Catégorie A (limité) : dès 18 ans',
        'Catégorie A : dès 25 ans ou après 2 ans de A limité',
        'Cours de base obligatoire (12h)',
        'Examen théorique et pratique'
      ],
      process: [
        'Cours de premiers secours',
        'Demande du permis d\'élève',
        'Examen théorique',
        'Cours de base moto (12h sur 3 jours)',
        'Leçons de conduite',
        'Examen pratique'
      ],
      pricing: {
        lesson: 'CHF 95.- / heure',
        courseBase: 'CHF 350.- (cours de base 12h)',
        exam: 'CHF 150.- (frais d\'examen)'
      }
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Nos permis de conduire</h1>
          <p className="text-xl text-gray-100">
            Découvrez les différentes catégories de permis et leurs conditions d'obtention
          </p>
        </div>
      </section>

      {/* Permits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {permits.map((permit, index) => (
              <div key={permit.id} className="card">
                {/* Header */}
                <div className="flex items-start space-x-4 mb-6 pb-6 border-b border-gray-200">
                  <div className={`flex-shrink-0 w-16 h-16 bg-${permit.color === 'primary' ? 'primary' : permit.color === 'red' ? 'red' : 'gray'}-100 rounded-xl flex items-center justify-center text-${permit.color === 'primary' ? 'primary' : permit.color === 'red' ? 'red' : 'gray'}-600`}>
                    {permit.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{permit.title}</h2>
                    <p className="text-lg text-gray-700">{permit.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Requirements */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <CheckCircle className="w-6 h-6 mr-2 text-primary-600" />
                      Conditions requises
                    </h3>
                    <ul className="space-y-3">
                      {permit.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start">
                          <ArrowRight className="w-5 h-5 mr-2 text-primary-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Process */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <ArrowRight className="w-6 h-6 mr-2 text-primary-600" />
                      Processus d'obtention
                    </h3>
                    <ol className="space-y-3">
                      {permit.process.map((step, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Pricing */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Euro className="w-6 h-6 mr-2 text-primary-600" />
                    Tarifs
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(permit.pricing).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1 capitalize">
                          {key === 'lesson' ? 'Leçon de conduite' : 
                           key === 'exam' ? 'Examen' : 
                           key === 'package' ? 'Forfait' :
                           key === 'courseBase' ? 'Cours de base' : key}
                        </p>
                        <p className="text-lg font-bold text-primary-600">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  <Link to="/cours" className="btn-primary text-center">
                    Voir les cours disponibles
                  </Link>
                  <Link to="/contact" className="btn-secondary text-center">
                    Demander des informations
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card bg-gradient-to-r from-primary-50 to-red-50 border border-primary-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Informations importantes</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Permis d'élève conducteur :</strong> Valable 24 mois. Peut être prolongé une fois pour 12 mois supplémentaires.
              </p>
              <p>
                <strong>Période probatoire :</strong> Dure 3 ans après l'obtention du permis définitif. En cas d'infraction grave, 
                le permis peut être retiré et un cours de rééducation peut être exigé.
              </p>
              <p>
                <strong>Formation complémentaire :</strong> Après l'obtention du permis, vous devez suivre deux cours de formation 
                complémentaire dans les 12 premiers mois pour obtenir le permis définitif.
              </p>
              <p>
                <strong>Nos conseils :</strong> Plus vous pratiquez régulièrement, plus vite vous progressez et moins le coût total 
                sera élevé. Nous recommandons au minimum 2 leçons par semaine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Des questions sur votre permis ?
          </h2>
          <p className="text-xl mb-8 text-gray-100">
            Notre équipe est à votre disposition pour vous conseiller
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg inline-block">
              Nous contacter
            </Link>
            <a href="tel:0792123500" className="bg-primary-800 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-900 transition-colors duration-200 shadow-lg inline-block">
              079 212 3500
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Permits
