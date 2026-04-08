export function GradientBubbles() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {/* Burbuja 1 - azul suave, arriba izquierda */}
      <div
        className="absolute -left-20 -top-20 h-72 w-72 rounded-full opacity-20 blur-3xl"
        style={{
          background: "linear-gradient(135deg, hsl(210, 80%, 65%), hsl(220, 70%, 75%))",
          animation: "float 8s ease-in-out infinite",
        }}
      />

      {/* Burbuja 2 - azul medio, arriba derecha */}
      <div
        className="absolute -right-16 top-10 h-80 w-80 rounded-full opacity-15 blur-3xl"
        style={{
          background: "linear-gradient(135deg, hsl(215, 75%, 60%), hsl(205, 65%, 70%))",
          animation: "float-reverse 10s ease-in-out infinite",
        }}
      />

      {/* Burbuja 3 - azul claro, centro */}
      <div
        className="absolute left-1/3 top-1/4 h-64 w-64 rounded-full opacity-15 blur-3xl"
        style={{
          background: "linear-gradient(135deg, hsl(200, 70%, 70%), hsl(215, 60%, 75%))",
          animation: "float-slow 12s ease-in-out infinite",
        }}
      />

      {/* Burbuja 4 - azul acero, abajo izquierda */}
      <div
        className="absolute -bottom-10 left-10 h-60 w-60 rounded-full opacity-20 blur-3xl"
        style={{
          background: "linear-gradient(135deg, hsl(220, 65%, 65%), hsl(210, 75%, 72%))",
          animation: "float 9s ease-in-out infinite 1s",
        }}
      />

      {/* Burbuja 5 - azul profundo, abajo derecha */}
      <div
        className="absolute -bottom-20 -right-10 h-96 w-96 rounded-full opacity-15 blur-3xl"
        style={{
          background: "linear-gradient(135deg, hsl(220, 70%, 58%), hsl(210, 60%, 68%))",
          animation: "float-reverse 11s ease-in-out infinite 0.5s",
        }}
      />

      {/* Burbuja 6 - azul palido, centro derecha */}
      <div
        className="absolute right-1/4 top-1/2 h-44 w-44 rounded-full opacity-12 blur-3xl"
        style={{
          background: "linear-gradient(135deg, hsl(205, 65%, 72%), hsl(218, 70%, 68%))",
          animation: "float-slow 14s ease-in-out infinite 2s",
        }}
      />
    </div>
  )
}