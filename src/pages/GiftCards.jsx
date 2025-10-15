import { useState } from 'react'
import { Gift, Heart, Star, CheckCircle, Mail, Phone, User, CreditCard } from 'lucide-react'

const GiftCards = () => {
  const [formData, setFormData] = useState({
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    recipientName: '',
    amount: '',
    customAmount: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const giftAmounts = [
    { value: '100', label: 'CHF 100.-', description: '1 leçon de conduite' },
    { value: '200', label: 'CHF 200.-', description: '2 leçons de conduite' },
    { value: '300', label: 'CHF 300.-', description: '3 leçons + contribution cours' },
    { value: '500', label: 'CHF 500.-', description: 'Forfait découverte' },
    { value: 'custom', label: 'Montant libre', description: 'Choisissez votre montant' }
  ]

  const giftIdeas = [
    {
      icon: <Gift className="w-8 h-8" />,
      title: 'Anniversaire',
      description: 'Le cadeau parfait pour un jeune qui rêve de liberté et d\'indépendance.'
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Réussite scolaire',
      description: 'Récompensez un diplôme ou une réussite avec un cadeau utile et apprécié.'
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: 'Noël / Fêtes',
      description: 'Un cadeau original qui fera vraiment plaisir et sera utilisé avec joie.'
    }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 5000)
    setFormData({
      buyerName: '',
      buyerEmail: '',
      buyerPhone: '',
      recipientName: '',
      amount: '',
      customAmount: '',
      message: ''
    })
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
            <Gift className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Bons cadeaux Speed-L</h1>
            <p className="text-xl text-gray-100 max-w-3xl mx-auto">
              Offrez le cadeau de la liberté ! Un bon cadeau Speed-L est le présent idéal 
              pour tous les futurs conducteurs.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Pourquoi offrir un bon cadeau ?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {giftIdeas.map((idea, index) => (
              <div key={index} className="card text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mx-auto mb-4">
                  {idea.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{idea.title}</h3>
                <p className="text-gray-700">{idea.description}</p>
              </div>
            ))}
          </div>

          <div className="card bg-gradient-to-r from-primary-50 to-white border border-primary-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Avantages</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="w-6 h-6 mr-3 text-primary-600 flex-shrink-0" />
                    <span className="text-gray-700">Valable 2 ans sans limitation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-6 h-6 mr-3 text-primary-600 flex-shrink-0" />
                    <span className="text-gray-700">Montant au choix, selon votre budget</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-6 h-6 mr-3 text-primary-600 flex-shrink-0" />
                    <span className="text-gray-700">Utilisable pour tous nos cours et leçons</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-6 h-6 mr-3 text-primary-600 flex-shrink-0" />
                    <span className="text-gray-700">Livraison rapide par email ou courrier</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Comment ça marche ?</h3>
                <ol className="space-y-3">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                    <span className="text-gray-700 pt-1">Choisissez le montant de votre bon cadeau</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                    <span className="text-gray-700 pt-1">Remplissez le formulaire de commande</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                    <span className="text-gray-700 pt-1">Recevez votre bon par email ou courrier</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">4</span>
                    <span className="text-gray-700 pt-1">Offrez-le et faites plaisir !</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Order Form Section */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Commander un bon cadeau</h2>
            <p className="text-xl text-gray-600">Remplissez le formulaire ci-dessous</p>
          </div>

          {submitted && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-800">
              <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <p>Merci ! Votre commande a été enregistrée. Nous vous contacterons rapidement pour finaliser le paiement.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="card">
            <div className="space-y-6">
              {/* Buyer Information */}
              <div className="pb-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Vos coordonnées</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="buyerName" className="block text-sm font-semibold text-gray-700 mb-2">
                      Votre nom complet *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="buyerName"
                        name="buyerName"
                        value={formData.buyerName}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Jean Dupont"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="buyerEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                      Votre email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        id="buyerEmail"
                        name="buyerEmail"
                        value={formData.buyerEmail}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="jean.dupont@email.ch"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="buyerPhone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Votre téléphone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        id="buyerPhone"
                        name="buyerPhone"
                        value={formData.buyerPhone}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="079 123 45 67"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Gift Details */}
              <div className="pb-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Détails du bon cadeau</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="recipientName" className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom du bénéficiaire (optionnel)
                    </label>
                    <input
                      type="text"
                      id="recipientName"
                      name="recipientName"
                      value={formData.recipientName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Marie Dupont"
                    />
                    <p className="text-sm text-gray-500 mt-1">Laissez vide pour un bon sans nom</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Montant du bon cadeau *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {giftAmounts.map((amount) => (
                        <label
                          key={amount.value}
                          className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            formData.amount === amount.value
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-300 hover:border-primary-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="amount"
                            value={amount.value}
                            checked={formData.amount === amount.value}
                            onChange={handleChange}
                            required
                            className="sr-only"
                          />
                          <div className="flex-1">
                            <div className="font-bold text-gray-900">{amount.label}</div>
                            <div className="text-sm text-gray-600">{amount.description}</div>
                          </div>
                          {formData.amount === amount.value && (
                            <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 ml-2" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  {formData.amount === 'custom' && (
                    <div>
                      <label htmlFor="customAmount" className="block text-sm font-semibold text-gray-700 mb-2">
                        Montant personnalisé (CHF) *
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          id="customAmount"
                          name="customAmount"
                          value={formData.customAmount}
                          onChange={handleChange}
                          required={formData.amount === 'custom'}
                          min="50"
                          step="10"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="150"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Montant minimum : CHF 50.-</p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      Message personnel (optionnel)
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Ajoutez un message qui apparaîtra sur le bon cadeau..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full text-lg">
                Commander ce bon cadeau
              </button>

              <p className="text-sm text-gray-600 text-center">
                Après validation de votre commande, nous vous contacterons pour finaliser le paiement 
                et l'envoi de votre bon cadeau.
              </p>
            </div>
          </form>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card bg-blue-50 border border-blue-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Informations pratiques</h3>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Validité :</strong> Les bons cadeaux sont valables 2 ans à partir de la date d'émission.
              </p>
              <p>
                <strong>Utilisation :</strong> Le bon peut être utilisé pour tous nos cours et leçons de conduite.
              </p>
              <p>
                <strong>Livraison :</strong> Vous recevrez votre bon par email (PDF) dans les 24h ou par courrier postal (3-5 jours).
              </p>
              <p>
                <strong>Paiement :</strong> Par virement bancaire, TWINT ou sur place à notre auto-école.
              </p>
              <p>
                <strong>Questions ?</strong> Contactez-nous au 079 212 3500 ou par email à info@speed-l.ch
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default GiftCards
