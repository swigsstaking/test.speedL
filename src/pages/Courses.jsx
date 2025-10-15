import { useState } from 'react'
import { Calendar, Clock, Users, AlertCircle, CheckCircle, Mail, Phone, User } from 'lucide-react'

const Courses = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    courseType: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const courses = [
    {
      id: 'sensibilisation',
      title: 'Cours de sensibilisation',
      number: 'N°609',
      icon: <AlertCircle className="w-8 h-8" />,
      color: 'primary',
      dates: [
        { day: 'Mercredi', date: '22.10.2025', time: '18h25' },
        { day: 'Jeudi', date: '23.10.2025', time: '18h25' }
      ],
      description: 'Cours obligatoire pour tous les nouveaux conducteurs. Formation complète sur les risques de la route.',
      duration: '2 soirées',
      price: 'CHF 280.-'
    },
    {
      id: 'moto',
      title: 'Cours Moto / Scooter',
      number: 'N°402',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'gray',
      dates: [
        { day: 'Samedi', date: '1 novembre 2025', time: '8h00' },
        { day: 'Dimanche', date: '2 novembre 2025', time: '8h00' },
        { day: 'Samedi', date: '8 novembre 2025', time: '8h00' }
      ],
      description: 'Formation pratique pour la conduite de motos et scooters. Apprentissage des techniques de base.',
      duration: '3 jours',
      price: 'CHF 350.-'
    },
    {
      id: 'secours',
      title: 'Cours de premiers secours',
      number: 'N°141',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      color: 'red',
      dates: [
        { day: 'Vendredi', date: '21 novembre 2025', time: 'Journée complète' },
        { day: 'Samedi', date: '22 novembre 2025', time: 'Journée complète' }
      ],
      description: 'Formation aux gestes de premiers secours. Obligatoire pour l\'obtention du permis de conduire.',
      duration: '2 jours',
      price: 'CHF 150.-'
    }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 5000)
    setFormData({ name: '', email: '', phone: '', courseType: '', message: '' })
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Cours & Inscriptions</h1>
          <p className="text-xl text-gray-100">
            Découvrez nos prochaines sessions de formation et inscrivez-vous en ligne
          </p>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {courses.map((course) => (
              <div key={course.id} className="card">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Course Icon & Title */}
                  <div className="flex-shrink-0">
                    <div className={`w-16 h-16 bg-${course.color === 'primary' ? 'primary' : course.color === 'red' ? 'red' : 'gray'}-100 rounded-xl flex items-center justify-center text-${course.color === 'primary' ? 'primary' : course.color === 'red' ? 'red' : 'gray'}-600`}>
                      {course.icon}
                    </div>
                  </div>

                  {/* Course Details */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{course.title}</h3>
                        <p className="text-primary-600 font-semibold">{course.number}</p>
                      </div>
                      <div className="mt-4 md:mt-0 text-right">
                        <div className="text-2xl font-bold text-primary-600">{course.price}</div>
                        <div className="text-sm text-gray-600">{course.duration}</div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{course.description}</p>

                    {/* Dates */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                        Prochaines dates
                      </h4>
                      <div className="space-y-2">
                        {course.dates.map((date, index) => (
                          <div key={index} className="flex items-center text-gray-700">
                            <Clock className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="font-medium mr-2">{date.day}</span>
                            <span className="mr-2">{date.date}</span>
                            <span className="text-gray-600">à {date.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <a
                      href="#inscription"
                      onClick={() => setFormData({ ...formData, courseType: course.title })}
                      className="btn-primary inline-block"
                    >
                      Je m'inscris
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Theory Course Info */}
          <div className="mt-8 card bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Cours de théorie de la circulation</h3>
                <p className="text-gray-700 mb-4">
                  Préparez-vous efficacement à l'examen théorique avec nos cours complets. 
                  Contactez-nous pour connaître les prochaines dates disponibles.
                </p>
                <a href="#inscription" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                  En savoir plus →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section id="inscription" className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Formulaire d'inscription</h2>
            <p className="text-xl text-gray-600">Réservez votre place en quelques clics</p>
          </div>

          {submitted && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-800">
              <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <p>Merci ! Votre demande d'inscription a été envoyée. Nous vous recontacterons rapidement.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="card">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom complet *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Jean Dupont"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="jean.dupont@email.ch"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Téléphone *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="079 123 45 67"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="courseType" className="block text-sm font-semibold text-gray-700 mb-2">
                  Type de cours *
                </label>
                <select
                  id="courseType"
                  name="courseType"
                  value={formData.courseType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Sélectionnez un cours</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.title}>
                      {course.title} - {course.number}
                    </option>
                  ))}
                  <option value="Cours de théorie">Cours de théorie de la circulation</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Message (optionnel)
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Questions ou informations complémentaires..."
                ></textarea>
              </div>

              <button type="submit" className="btn-primary w-full text-lg">
                Envoyer ma demande d'inscription
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}

export default Courses
