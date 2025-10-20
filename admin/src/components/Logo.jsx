const Logo = ({ className = "h-8" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      {/* SWIGS Text uniquement */}
      <span className="text-2xl font-bold tracking-wider text-white">
        SWIGS
      </span>
    </div>
  );
};

export default Logo;
