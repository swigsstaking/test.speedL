import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, AlertCircle, CheckCircle, Mail, Phone, User } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const Courses = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    courseType: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  // Récupérer les cours depuis l'API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Récupérer l'ID du site Speed-L (slug: speed-l)
        const sitesResponse = await fetch(`${API_URL}/sites`)
        const sitesData = await sitesResponse.json()
        const speedLSite = sitesData.data.find(site => site.slug === 'speed-l')
        
        if (speedLSite) {
          // Récupérer les cours actifs pour Speed-L
          const coursesResponse = await fetch(`${API_URL}/courses?siteId=${speedLSite._id}&status=active`)
          const coursesData = await coursesResponse.json()
          setCourses(coursesData.data || [])
        }
      } catch (error) {
        // Silently handle error - keep default courses
        setCourses([])
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

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
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Aucun cours disponible pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {courses.map((course) => (
                <div key={course._id} className="card">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Course Icon & Title */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                        <AlertCircle className="w-8 h-8" />
                      </div>
                    </div>

                    {/* Course Details */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-1">{course.title}</h3>
                          <p className="text-primary-600 font-semibold">{course.number}</p>
                          {course.category && (
                            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                              {course.category}
                            </span>
                          )}
                        </div>
                        <div className="mt-4 md:mt-0 text-right">
                          <div className="text-2xl font-bold text-primary-600">
                            {course.price?.display || `CHF ${course.price?.amount || 0}.-`}
                          </div>
                          {course.duration && (
                            <div className="text-sm text-gray-600">{course.duration}</div>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">{course.description}</p>

                      {/* Dates */}
                      {course.dates && course.dates.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                            Prochaines dates
                          </h4>
                          <div className="space-y-2">
                            {course.dates.map((dateObj, index) => (
                              <div key={index} className="flex items-center text-gray-700">
                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                <span className="mr-2">
                                  {dateObj.day} - {new Date(dateObj.date).toLocaleDateString('fr-FR', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })} à {dateObj.time}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Location & Instructor */}
                      {(course.location || course.instructor) && (
                        <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                          {course.location && (
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-2" />
                              {course.location}
                            </div>
                          )}
                          {course.instructor && (
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              {course.instructor}
                            </div>
                          )}
                        </div>
                      )}

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
          )}

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
