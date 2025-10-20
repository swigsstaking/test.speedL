const Logo = ({ className = "h-8" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo SWIGS original */}
      <img 
        src="/swigs-logo.png" 
        alt="SWIGS" 
        className="h-10 w-auto object-contain"
      />
    </div>
  );
};

export default Logo;
