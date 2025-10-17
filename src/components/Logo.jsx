import { useSiteInfo } from '../hooks/useSiteInfo';

const Logo = ({ className = "h-12" }) => {
  const { siteInfo } = useSiteInfo();

  if (siteInfo?.logo?.url) {
    // Gérer les URLs relatives et absolues
    const logoUrl = siteInfo.logo.url.startsWith('http') 
      ? siteInfo.logo.url 
      : `${window.location.origin}${siteInfo.logo.url}`;

    return (
      <img
        src={logoUrl}
        alt={siteInfo.logo.alt || siteInfo.name || 'Logo'}
        className={className}
        onError={(e) => {
          // En cas d'erreur, afficher le nom
          e.target.style.display = 'none';
          e.target.parentElement.innerHTML = `<span class="text-2xl font-bold text-primary-600">${siteInfo.name || 'Speed-L'}</span>`;
        }}
      />
    );
  }

  // Logo par défaut si aucun logo n'est uploadé
  return (
    <div className={`${className} flex items-center`}>
      <span className="text-2xl font-bold text-primary-600">
        {siteInfo?.name || 'Speed-L'}
      </span>
    </div>
  );
};

export default Logo;
