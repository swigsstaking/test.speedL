const Logo = ({ className = "h-8" }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* SWIGS Logo Icon */}
      <div className="relative w-10 h-10">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Red cross segments */}
          <path d="M 30 10 L 45 10 L 45 45 L 30 45 Z" fill="#dc2626" />
          <path d="M 55 10 L 70 10 L 70 45 L 55 45 Z" fill="#dc2626" />
          <path d="M 30 55 L 45 55 L 45 90 L 30 90 Z" fill="#dc2626" />
          <path d="M 55 55 L 70 55 L 70 90 L 55 90 Z" fill="#dc2626" />
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
