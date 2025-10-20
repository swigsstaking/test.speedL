import { useState, useEffect } from 'react'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, User, MessageSquare, Facebook, Instagram, AlertCircle } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'https://swigs.online/api'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [siteId, setSiteId] = useState(null)

  // Récupérer l'ID du site Speed-L
  useEffect(() => {
    const fetchSiteId = async () => {
      try {
        const response = await fetch(`${API_URL}/sites`)
        const data = await response.json()
        const speedLSite = data.data.find(site => site.slug === 'speed-l')
        if (speedLSite) {
          setSiteId(speedLSite._id)
        }
      } catch (err) {
        // Silently handle error
      }
    }
    fetchSiteId()
  }, [])

  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Adresse',
      content: ['Place de la Gare 11', '1950 Sion', 'Valais, Suisse'],
      link: 'https://maps.google.com/?q=Place+de+la+Gare+11+Sion'
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Téléphone',
      content: ['079 212 3500'],
      link: 'tel:0792123500'
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email',
      content: ['info@speed-l.ch'],
      link: 'mailto:info@speed-l.ch'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Horaires',
      content: ['Lundi - Vendredi', '8h00 - 19h00', 'Samedi sur rendez-vous'],
      link: null
    }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!siteId) {
      setError('Erreur de configuration. Veuillez réessayer.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_URL}/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: `Sujet: ${formData.subject}\n\n${formData.message}`,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSubmitted(true)
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
        setTimeout(() => setSubmitted(false), 5000)
      } else {
        setError(data.message || 'Erreur lors de l\'envoi du message')
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contactez-nous</h1>
            <p className="text-xl text-gray-100 max-w-3xl mx-auto">
              Notre équipe est à votre disposition pour répondre à toutes vos questions
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {contactInfo.map((info, index) => (
              <div key={index} className="card text-center hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mx-auto mb-4">
                  {info.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{info.title}</h3>
                <div className="space-y-1">
                  {info.content.map((line, idx) => (
                    <p key={idx} className="text-gray-700">
                      {info.link && idx === 0 ? (
                        <a
                          href={info.link}
                          className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                          target={info.link.startsWith('http') ? '_blank' : undefined}
                          rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                        >
                          {line}
                        </a>
                      ) : (
                        line
                      )}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map and Form Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h2>
              
              {submitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-800">
                  <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  <p>Merci ! Votre message a été envoyé. Nous vous répondrons dans les plus brefs délais.</p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-800">
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
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
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="079 123 45 67"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Sujet *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="inscription">Inscription à un cours</option>
                    <option value="permis">Information sur les permis</option>
                    <option value="tarifs">Questions sur les tarifs</option>
                    <option value="bon-cadeau">Bon cadeau</option>
                    <option value="autre">Autre question</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="5"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Votre message..."
                    ></textarea>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary w-full text-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Envoyer le message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Map */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Où nous trouver</h2>
              <div className="bg-gray-100 rounded-xl overflow-hidden shadow-lg h-[500px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2757.8!2d7.3587!3d46.2304!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x478ea0f0c7b0c0c1%3A0x0!2sPlace%20de%20la%20Gare%2011%2C%201950%20Sion!5e0!3m2!1sfr!2sch!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localisation Speed-L"
                ></iframe>
              </div>
              <div className="mt-6 card">
                <h3 className="font-bold text-gray-900 mb-3">Accès</h3>
                <p className="text-gray-700 mb-4">
                  Notre auto-école est idéalement située en plein centre de Sion, 
                  à proximité immédiate de la gare. Facilement accessible en transports publics 
                  et avec plusieurs parkings à proximité.
                </p>
                <a
                  href="https://maps.google.com/?q=Place+de+la+Gare+11+Sion"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 font-semibold hover:text-primary-700 transition-colors inline-flex items-center"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Ouvrir dans Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Suivez-nous sur les réseaux sociaux</h2>
            <p className="text-xl text-gray-600">
              Restez informés de nos actualités, conseils et promotions
            </p>
          </div>

          <div className="flex justify-center space-x-6">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md group-hover:shadow-xl transition-all group-hover:scale-110">
                <Facebook className="w-10 h-10 text-blue-600" />
              </div>
              <p className="text-center mt-2 text-gray-700 font-medium">Facebook</p>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md group-hover:shadow-xl transition-all group-hover:scale-110">
                <Instagram className="w-10 h-10 text-pink-600" />
              </div>
              <p className="text-center mt-2 text-gray-700 font-medium">Instagram</p>
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md group-hover:shadow-xl transition-all group-hover:scale-110">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </div>
              <p className="text-center mt-2 text-gray-700 font-medium">TikTok</p>
            </a>
          </div>
        </div>
      </section>

      {/* Quick Contact CTA */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Une question urgente ?
          </h2>
          <p className="text-xl mb-8 text-gray-100">
            Appelez-nous directement, nous sommes là pour vous aider
          </p>
          <a
            href="tel:0792123500"
            className="inline-flex items-center bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg text-xl"
          >
            <Phone className="w-6 h-6 mr-3" />
            079 212 3500
          </a>
        </div>
      </section>
    </div>
  )
}

export default Contact
