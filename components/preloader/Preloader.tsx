"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [animationPhase, setAnimationPhase] = useState<
    "split" | "merge" | "complete"
  >("split");

  useEffect(() => {
    // Fase 1: Split (0-1.5s)
    // Fase 2: Merge (1.5s-3s)
    // Fase 3: Complete (3s+)

    const mergeTimer = setTimeout(() => {
      setAnimationPhase("merge");
    }, 1500);

    const completeTimer = setTimeout(() => {
      setAnimationPhase("complete");
    }, 3000);

    const finishTimer = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(mergeTimer);
      clearTimeout(completeTimer);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden transition-opacity duration-500 ${
        animationPhase === "complete" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Background animado com partículas e ondas */}
      <div className="absolute inset-0 bg-black">
        {/* Gradiente radial pulsante */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.15),transparent_50%)] animate-pulse-slow" />

        {/* Grid de fundo */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(220,38,38,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(220,38,38,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            animation: "gridMove 20s linear infinite",
          }}
        />

        {/* Círculos de onda expandindo */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-red-600/20"
              style={{
                width: "100px",
                height: "100px",
                animation: `ripple 3s ease-out infinite`,
                animationDelay: `${i * 0.6}s`,
              }}
            />
          ))}
        </div>

        {/* Partículas flutuantes */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-red-500 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.2,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Linhas de energia */}
        <svg className="absolute inset-0 w-full h-full">
          {[...Array(8)].map((_, i) => (
            <line
              key={i}
              x1="50%"
              y1="50%"
              x2={`${50 + 45 * Math.cos((i * Math.PI) / 4)}%`}
              y2={`${50 + 45 * Math.sin((i * Math.PI) / 4)}%`}
              stroke="rgba(220,38,38,0.2)"
              strokeWidth="1"
              style={{
                animation: `energyLine 2s ease-in-out infinite`,
                animationDelay: `${i * 0.25}s`,
              }}
            />
          ))}
        </svg>

        {/* Aurora boreal effect */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              linear-gradient(45deg, transparent 0%, rgba(220,38,38,0.1) 25%, transparent 50%),
              linear-gradient(-45deg, transparent 0%, rgba(139,0,0,0.1) 25%, transparent 50%)
            `,
            animation: "aurora 8s ease-in-out infinite",
          }}
        />
      </div>

      {/* Container do Logo */}
      <div className="relative z-10 flex items-center justify-center">
        {/* Glow effect atrás do logo */}
        <div
          className={`absolute w-64 h-64 bg-red-600/30 rounded-full blur-3xl transition-all duration-1000 ${
            animationPhase === "merge" ? "scale-150 opacity-50" : "scale-100 opacity-30"
          }`}
        />

        {/* Logo SVG dividido em duas partes */}
        <div className="relative w-72 h-64 flex items-center justify-center">
          {/* Parte esquerda do logo (J) */}
          <svg
            className={`absolute transition-all duration-1000 ease-out ${
              animationPhase === "split"
                ? "-translate-x-20 opacity-70"
                : "translate-x-0 opacity-100"
            }`}
            style={{
              filter:
                animationPhase === "merge"
                  ? "drop-shadow(0 0 20px rgba(220,38,38,0.8))"
                  : "drop-shadow(0 0 10px rgba(220,38,38,0.5))",
            }}
            width="176"
            height="160"
            viewBox="0 0 176 160"
          >
            <defs>
              <linearGradient
                id="gradientLeft"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>
            <g
              transform="translate(0,160) scale(0.1,-0.1)"
              fill="url(#gradientLeft)"
            >
              {/* Parte esquerda - J */}
              <path d="M550 704 c-102 -223 -193 -413 -203 -422 -26 -24 -46 -7 -84 72 -27 55 -37 66 -58 66 -35 0 -195 -108 -195 -132 0 -36 61 -153 102 -195 117 -120 316 -117 430 6 35 37 72 109 191 368 81 177 147 328 147 336 0 14 -136 307 -142 307 -2 0 -86 -183 -188 -406z" />
            </g>
          </svg>

          {/* Parte direita do logo (A) */}
          <svg
            className={`absolute transition-all duration-1000 ease-out ${
              animationPhase === "split"
                ? "translate-x-20 opacity-70"
                : "translate-x-0 opacity-100"
            }`}
            style={{
              filter:
                animationPhase === "merge"
                  ? "drop-shadow(0 0 20px rgba(220,38,38,0.8))"
                  : "drop-shadow(0 0 10px rgba(220,38,38,0.5))",
            }}
            width="176"
            height="160"
            viewBox="0 0 176 160"
          >
            <defs>
              <linearGradient
                id="gradientRight"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#b91c1c" />
              </linearGradient>
            </defs>
            <g
              transform="translate(0,160) scale(0.1,-0.1)"
              fill="url(#gradientRight)"
            >
              {/* Parte direita - A */}
              <path d="M904 1473 c-31 -65 -56 -127 -56 -138 0 -11 73 -176 161 -368 89 -191 161 -353 161 -360 0 -27 -25 -37 -95 -37 -42 0 -78 -5 -87 -12 -14 -11 -118 -226 -118 -243 0 -3 91 -5 203 -5 111 0 212 -3 224 -6 16 -5 37 -40 85 -146 47 -105 69 -142 86 -149 41 -16 205 -11 230 7 12 8 22 20 22 26 0 14 -688 1518 -702 1536 -6 6 -21 12 -35 12 -21 0 -31 -15 -79 -117z" />
            </g>
          </svg>

          {/* Efeito de faísca quando junta */}
          {animationPhase === "merge" && (
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-8 bg-linear-to-t from-transparent via-red-500 to-transparent"
                  style={{
                    transform: `rotate(${i * 30}deg)`,
                    animation: "spark 0.5s ease-out forwards",
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Texto J&A */}
        <div
          className={`absolute -bottom-16 text-center transition-all duration-700 ${
            animationPhase === "merge"
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <Image src="/logo.png" alt="Logo" width={100} height={100} />
          <p className="text-xs text-gray-500 mt-1 tracking-wider">AUTOMAÇÕES</p>
        </div>
      </div>

      {/* Barra de loading */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-0.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-red-700 via-red-500 to-red-700 rounded-full"
          style={{
            animation: "loadingBar 3s ease-in-out forwards",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          100% {
            transform: scale(15);
            opacity: 0;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-10px) translateX(-10px);
          }
          75% {
            transform: translateY(-30px) translateX(5px);
          }
        }

        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }

        @keyframes energyLine {
          0%,
          100% {
            opacity: 0.2;
            stroke-width: 1;
          }
          50% {
            opacity: 0.6;
            stroke-width: 2;
          }
        }

        @keyframes aurora {
          0%,
          100% {
            transform: translateX(-50%) rotate(0deg);
          }
          50% {
            transform: translateX(50%) rotate(180deg);
          }
        }

        @keyframes spark {
          0% {
            transform: rotate(var(--rotation)) scaleY(0);
            opacity: 1;
          }
          50% {
            transform: rotate(var(--rotation)) scaleY(1);
            opacity: 1;
          }
          100% {
            transform: rotate(var(--rotation)) scaleY(0) translateY(-50px);
            opacity: 0;
          }
        }

        @keyframes loadingBar {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}
