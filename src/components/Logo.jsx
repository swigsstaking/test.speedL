import { useSiteInfo } from '../hooks/useSiteInfo';

const Logo = ({ className = "h-12" }) => {
  const { siteInfo } = useSiteInfo();

  if (siteInfo?.logo?.url) {
    return (
      <img
        src={siteInfo.logo.url}
        alt={siteInfo.logo.alt || siteInfo.name || 'Logo'}
        className={className}
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
