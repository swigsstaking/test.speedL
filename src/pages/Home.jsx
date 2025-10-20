import { Link } from 'react-router-dom'
import { CheckCircle, Award, MapPin, Car, Users, TrendingUp, Star } from 'lucide-react'
import SEOHead from '../components/SEOHead'

const Home = () => {
  const advantages = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      text: "Entreprise dynamique du Valais"
    },
    {
      icon: <Award className="w-6 h-6" />,
      text: "Qualité d'enseignement reconnue depuis 30 ans"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      text: "Locaux spacieux et centralisés (Place de la Gare 11, Sion)"
    },
    {
      icon: <Car className="w-6 h-6" />,
      text: "Véhicules top classe"
    },
    {
      icon: <Users className="w-6 h-6" />,
      text: "Instructeurs expérimentés et disponibles"
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      text: "Plus rapide donc moins cher !"
    }
  ]

  const testimonials = [
    {
      name: "Sophie M.",
      text: "Excellente auto-école ! J'ai obtenu mon permis du premier coup grâce à des instructeurs patients et professionnels.",
      rating: 5
    },
    {
      name: "Marc D.",
      text: "Speed-L m'a donné confiance au volant. Les cours sont bien structurés et l'ambiance est très agréable.",
      rating: 5
    },
    {
      name: "Laura P.",
      text: "Je recommande vivement ! Locaux modernes, véhicules récents et une équipe vraiment à l'écoute.",
      rating: 5
    }
  ]

  return (
    <div>
      <SEOHead page="home" />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-gray-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Bienvenue chez Speed-L
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-gray-100">
              Votre école de conduite à Sion depuis près de 30 ans
            </p>
            <p className="text-lg md:text-xl mb-10 text-gray-200">
              Fiabilité, modernité et proximité au cœur du Valais
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/cours" className="btn-primary text-lg px-8 py-4 inline-block">
                Voir les prochains cours
              </Link>
              <Link to="/cours" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-md hover:shadow-lg inline-block">
                S'inscrire maintenant
              </Link>
            </div>
          </div>
        </div>
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      {/* Why Speed-L Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Pourquoi choisir Speed-L ?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une auto-école de confiance au service de votre réussite
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advantages.map((advantage, index) => (
              <div key={index} className="card flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                  {advantage.icon}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium leading-relaxed">
                    {advantage.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Info Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-primary-50 to-white rounded-xl border border-primary-100">
              <div className="text-5xl font-bold text-primary-600 mb-2">30</div>
              <div className="text-gray-700 font-semibold">Ans d'expérience</div>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
              <div className="text-5xl font-bold text-gray-800 mb-2">100%</div>
              <div className="text-gray-700 font-semibold">Engagement qualité</div>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-primary-50 to-white rounded-xl border border-primary-100">
              <div className="text-5xl font-bold text-primary-600 mb-2">★★★★★</div>
              <div className="text-gray-700 font-semibold">Satisfaction clients</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">Ce que disent nos élèves</h2>
            <p className="text-xl text-gray-600">Des témoignages authentiques de nos élèves satisfaits</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <p className="font-semibold text-gray-900">— {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à commencer votre formation ?
          </h2>
          <p className="text-xl mb-8 text-gray-100">
            Rejoignez Speed-L et obtenez votre permis en toute confiance
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/cours" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg inline-block">
              Découvrir nos cours
            </Link>
            <Link to="/contact" className="bg-primary-800 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-900 transition-colors duration-200 shadow-lg inline-block">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
