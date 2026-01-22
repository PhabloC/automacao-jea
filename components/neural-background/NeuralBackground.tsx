"use client";

import { useEffect, useRef } from "react";

export default function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: 0, y: 0, tX: 0, tY: 0 });
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const gl = canvasEl.getContext("webgl") || canvasEl.getContext("experimental-webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    // Shader sources - usando cores vermelhas para combinar com o tema
    const vsSource = `
      precision mediump float;
      attribute vec2 a_position;
      varying vec2 vUv;
      void main() {
        vUv = .5 * (a_position + 1.);
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      varying vec2 vUv;
      uniform float u_time;
      uniform float u_ratio;
      uniform vec2 u_pointer_position;
      uniform float u_scroll_progress;
      
      vec2 rotate(vec2 uv, float th) {
        return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
      }
      
      float neuro_shape(vec2 uv, float t, float p) {
        vec2 sine_acc = vec2(0.);
        vec2 res = vec2(0.);
        float scale = 8.;
        for (int j = 0; j < 15; j++) {
          uv = rotate(uv, 1.);
          sine_acc = rotate(sine_acc, 1.);
          vec2 layer = uv * scale + float(j) + sine_acc - t;
          sine_acc += sin(layer) + 2.4 * p;
          res += (.5 + .5 * cos(layer)) / scale;
          scale *= (1.2);
        }
        return res.x + res.y;
      }
      
      void main() {
        vec2 uv = .5 * vUv;
        uv.x *= u_ratio;
        vec2 pointer = vUv - u_pointer_position;
        pointer.x *= u_ratio;
        float p = clamp(length(pointer), 0., 1.);
        p = .5 * pow(1. - p, 2.);
        float t = .001 * u_time;
        vec3 color = vec3(0.);
        float noise = neuro_shape(uv, t, p);
        noise = 1.2 * pow(noise, 3.);
        noise += pow(noise, 10.);
        noise = max(.0, noise - .5);
        noise *= (1. - length(vUv - .5));
        // Cores vermelhas/laranjas para combinar com o tema J&A
        color = vec3(0.7, 0.1, 0.15);
        color = mix(color, vec3(0.9, 0.2, 0.1), 0.32 + 0.16 * sin(2.0 * u_scroll_progress + 1.2));
        color += vec3(0.4, 0.05, 0.0) * sin(2.0 * u_scroll_progress + 1.5);
        color = color * noise;
        gl_FragColor = vec4(color, noise);
      }
    `;

    // Shader compilation
    const compileShader = (
      glContext: WebGLRenderingContext,
      source: string,
      type: number
    ) => {
      const shader = glContext.createShader(type);
      if (!shader) return null;
      glContext.shaderSource(shader, source);
      glContext.compileShader(shader);
      if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)) {
        console.error("Shader error:", glContext.getShaderInfoLog(shader));
        glContext.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const glContext = gl as WebGLRenderingContext;
    const vertexShader = compileShader(glContext, vsSource, glContext.VERTEX_SHADER);
    const fragmentShader = compileShader(glContext, fsSource, glContext.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) return;

    // Program setup
    const program = glContext.createProgram();
    if (!program) return;
    
    glContext.attachShader(program, vertexShader);
    glContext.attachShader(program, fragmentShader);
    glContext.linkProgram(program);
    
    if (!glContext.getProgramParameter(program, glContext.LINK_STATUS)) {
      console.error("Program link error:", glContext.getProgramInfoLog(program));
      return;
    }
    glContext.useProgram(program);

    // Geometry
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const vertexBuffer = glContext.createBuffer();
    glContext.bindBuffer(glContext.ARRAY_BUFFER, vertexBuffer);
    glContext.bufferData(glContext.ARRAY_BUFFER, vertices, glContext.STATIC_DRAW);

    const positionLocation = glContext.getAttribLocation(program, "a_position");
    glContext.enableVertexAttribArray(positionLocation);
    glContext.bindBuffer(glContext.ARRAY_BUFFER, vertexBuffer);
    glContext.vertexAttribPointer(positionLocation, 2, glContext.FLOAT, false, 0, 0);

    // Uniforms
    const uTime = glContext.getUniformLocation(program, "u_time");
    const uRatio = glContext.getUniformLocation(program, "u_ratio");
    const uPointerPosition = glContext.getUniformLocation(program, "u_pointer_position");
    const uScrollProgress = glContext.getUniformLocation(program, "u_scroll_progress");

    // Resize handler
    const resizeCanvas = () => {
      const devicePixelRatio = Math.min(window.devicePixelRatio, 2);
      canvasEl.width = window.innerWidth * devicePixelRatio;
      canvasEl.height = window.innerHeight * devicePixelRatio;
      glContext.viewport(0, 0, canvasEl.width, canvasEl.height);
      glContext.uniform1f(uRatio, canvasEl.width / canvasEl.height);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Animation loop
    const render = () => {
      const currentTime = performance.now();

      // Smooth pointer movement
      pointer.current.x += (pointer.current.tX - pointer.current.x) * 0.2;
      pointer.current.y += (pointer.current.tY - pointer.current.y) * 0.2;

      glContext.uniform1f(uTime, currentTime);
      glContext.uniform2f(
        uPointerPosition,
        pointer.current.x / window.innerWidth,
        1 - pointer.current.y / window.innerHeight
      );
      glContext.uniform1f(uScrollProgress, window.pageYOffset / (2 * window.innerHeight));

      glContext.drawArrays(glContext.TRIANGLE_STRIP, 0, 4);
      animationRef.current = requestAnimationFrame(render);
    };

    render();

    // Event listeners
    const handleMouseMove = (e: PointerEvent) => {
      pointer.current.tX = e.clientX;
      pointer.current.tY = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        pointer.current.tX = e.touches[0].clientX;
        pointer.current.tY = e.touches[0].clientY;
      }
    };

    window.addEventListener("pointermove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("pointermove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      glContext.deleteProgram(program);
      glContext.deleteShader(vertexShader);
      glContext.deleteShader(fragmentShader);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none opacity-90 z-0"
    />
  );
}
