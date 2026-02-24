"use client";

import { useState, useCallback } from "react";
import Preloader from "@/components/preloader/Preloader";
import FormularioEstrategico from "@/components/formulario-estrategico/FormularioEstrategico";
import NeuralBackground from "@/components/neural-background/NeuralBackground";

export default function FormularioPage() {
  const [showPreloader, setShowPreloader] = useState(true);

  const handlePreloaderComplete = useCallback(() => {
    setShowPreloader(false);
  }, []);

  if (showPreloader) {
    return <Preloader onComplete={handlePreloaderComplete} />;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center relative overflow-hidden">
      <NeuralBackground />
      <div className="relative z-10 w-full flex flex-col items-center py-8">
        <FormularioEstrategico />
      </div>
    </div>
  );
}
