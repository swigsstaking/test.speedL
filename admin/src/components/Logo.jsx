const Logo = ({ className = "h-8" }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* SWIGS Logo Icon - Cercle rouge divisé en 4 quartiers */}
      <div className="relative w-10 h-10">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Quartier haut-gauche */}
          <path d="M 50 50 L 50 15 A 35 35 0 0 0 15 50 Z" fill="#dc2626" />
          
          {/* Quartier haut-droit */}
          <path d="M 50 50 L 85 50 A 35 35 0 0 0 50 15 Z" fill="#dc2626" />
          
          {/* Quartier bas-gauche */}
          <path d="M 50 50 L 15 50 A 35 35 0 0 0 50 85 Z" fill="#dc2626" />
          
          {/* Quartier bas-droit */}
          <path d="M 50 50 L 50 85 A 35 35 0 0 0 85 50 Z" fill="#dc2626" />
          
          {/* Lignes blanches de séparation */}
          <line x1="50" y1="15" x2="50" y2="85" stroke="#1f2937" strokeWidth="3" />
          <line x1="15" y1="50" x2="85" y2="50" stroke="#1f2937" strokeWidth="3" />
        </svg>
      </div>
      
      {/* SWIGS Text */}
      <span className="text-2xl font-bold tracking-wider text-white">
        SWIGS
      </span>
    </div>
  );
};

export default Logo;
