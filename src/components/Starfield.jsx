function Starfield() {
  const stars = Array.from({ length: 40 }, (_, i) => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    animation: Math.random() > 0.5 ? 'animate-ping' : 'animate-pulse',
  }));

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {stars.map((star, i) => (
        <div
          key={i}
          className={`w-1 h-1 bg-white rounded-full ${star.animation} opacity-70`}
          style={{ position: 'absolute', top: star.top, left: star.left }}
        />
      ))}
    </div>
  );
}

export default Starfield;
