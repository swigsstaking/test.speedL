import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Phone, Mail, Facebook, Instagram } from 'lucide-react'
import Logo from './Logo'
import { useSiteInfo } from '../hooks/useSiteInfo'

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const { siteInfo } = useSiteInfo()

  const navigation = [
    { name: 'Accueil', path: '/' },
    { name: 'Cours & Inscriptions', path: '/cours' },
    { name: 'Permis', path: '/permis' },
    { name: 'Bons cadeaux', path: '/bons-cadeaux' },
    { name: 'Contact', path: '/contact' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Logo className="h-12" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-primary-600'
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Contact Info Desktop */}
            <div className="hidden lg:flex items-center space-x-4">
              {siteInfo?.contact?.phone && (
                <a href={`tel:${siteInfo.contact.phone.replace(/\s/g, '')}`} className="flex items-center text-gray-700 hover:text-primary-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span className="font-semibold">{siteInfo.contact.phone}</span>
                </a>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden pb-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-2 px-4 rounded-md font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {siteInfo?.contact?.phone && (
                <a
                  href={`tel:${siteInfo.contact.phone.replace(/\s/g, '')}`}
                  className="flex items-center py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {siteInfo.contact.phone}
                </a>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About */}
            <div>
              <div className="mb-4">
                <Logo className="h-10 brightness-0 invert" />
              </div>
              <p className="text-gray-300 mb-4">
                {siteInfo?.description || 'Votre école de conduite à Sion depuis près de 30 ans. Qualité, fiabilité et modernité au service de votre réussite.'}
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <div className="space-y-3 text-gray-300">
                {siteInfo?.contact?.address && (
                  <p>
                    {siteInfo.contact.address}
                    {(siteInfo.contact.postalCode || siteInfo.contact.city) && (
                      <>
                        <br />
                        {siteInfo.contact.postalCode} {siteInfo.contact.city}
                      </>
                    )}
                  </p>
                )}
                {siteInfo?.contact?.phone && (
                  <a href={`tel:${siteInfo.contact.phone.replace(/\s/g, '')}`} className="flex items-center hover:text-primary-400 transition-colors">
                    <Phone className="w-4 h-4 mr-2" />
                    {siteInfo.contact.phone}
                  </a>
                )}
                {siteInfo?.contact?.email && (
                  <a href={`mailto:${siteInfo.contact.email}`} className="flex items-center hover:text-primary-400 transition-colors">
                    <Mail className="w-4 h-4 mr-2" />
                    {siteInfo.contact.email}
                  </a>
                )}
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Suivez-nous</h4>
              <div className="flex space-x-4">
                {siteInfo?.social?.facebook && (
                  <a
                    href={siteInfo.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {siteInfo?.social?.instagram && (
                  <a
                    href={siteInfo.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {siteInfo?.social?.tiktok && (
                  <a
                    href={siteInfo.social.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
                    aria-label="TikTok"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} {siteInfo?.name || 'Speed-L'}. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
