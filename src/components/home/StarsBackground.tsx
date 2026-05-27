export default function StarsBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: (i % 3) + 1 + 'px',
            height: (i % 3) + 1 + 'px',
            left: ((i * 137.5) % 100) + '%',
            top: ((i * 97.3) % 100) + '%',
            opacity: 0.15 + (i % 4) * 0.1,
            animation: `twinkle ${2 + (i % 3)}s ease-in-out ${(i % 5) * 0.6}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
