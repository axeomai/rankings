"use client";

import { useEffect, useRef } from "react";

const VERTEX = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

// Slow domain-warped noise, colored from the palette's four shader tokens: the ground, a mid tone, the accent, and a light.
const FRAGMENT = `
precision mediump float;
uniform vec2 res;
uniform float t;
uniform vec3 base;
uniform vec3 mid;
uniform vec3 tone;
uniform vec3 light;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int k = 0; k < 5; k++) { v += a * noise(p); p = p * 2.03 + 11.7; a *= 0.5; }
  return v;
}
void main() {
  vec2 uv = gl_FragCoord.xy / res;
  vec2 p = uv * vec2(res.x / res.y, 1.0) * 1.4;
  float q = fbm(p + vec2(t * 0.02, -t * 0.015));
  float w = fbm(p + 1.7 * q + vec2(-t * 0.015, t * 0.02));
  vec3 col = mix(base, mid, smoothstep(0.25, 0.85, w));
  col = mix(col, tone, smoothstep(0.5, 0.95, w * (0.6 + q)) * 0.85);
  col = mix(col, light, pow(smoothstep(0.62, 1.0, w), 3.0) * 0.4);
  gl_FragColor = vec4(col, 1.0);
}
`;

const TOKENS = ["--auth-shader-base", "--auth-shader-mid", "--auth-shader-tone", "--auth-shader-light"] as const;

/** A token's color as RGB in 0..1, resolved by the browser (the tokens are color-mix() expressions) and read back from a 1px canvas. */
function readColors(el: HTMLElement): number[][] {
  const probe = document.createElement("canvas");
  probe.width = probe.height = 1;
  const ctx = probe.getContext("2d", { willReadFrequently: true });
  return TOKENS.map((token) => {
    // Used as a color, the token's color-mix() resolves to a concrete color the canvas can paint.
    el.style.color = `var(${token})`;
    const resolved = getComputedStyle(el).color;
    el.style.removeProperty("color");
    if (!ctx) return [0, 0, 0];
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = resolved;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255];
  });
}

/**
 * The home page hero's backdrop: Thry's shader treatment drawn in WebGL from the
 * current palette's --auth-shader-* tokens, recolored when the theme changes.
 * It animates only while on screen and the tab is visible; with reduced motion
 * it draws one still frame. Without WebGL the .auth-shader gradient shows.
 */
export default function HeroShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!canvas || !gl) return;

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const uRes = u("res");
    const uT = u("t");
    const uColors = ["base", "mid", "tone", "light"].map(u);

    const setColors = () => readColors(canvas).forEach((c, i) => gl.uniform3fv(uColors[i], c));
    setColors();

    // Half resolution is plenty for a soft field and keeps it cheap.
    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 2) * 0.5;
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const start = performance.now();
    const draw = (now: number) => {
      gl.uniform1f(uT, reduced.matches ? 12 : (now - start) / 1000 + 12);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    let frame = 0;
    let visible = true;
    const loop = (now: number) => {
      draw(now);
      frame = visible && !reduced.matches && !document.hidden ? requestAnimationFrame(loop) : 0;
    };
    const restart = () => {
      if (!frame) frame = requestAnimationFrame(loop);
    };
    restart();
    canvas.dataset.live = "";

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    resizeObserver.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) restart();
    });
    intersection.observe(canvas);
    const themeObserver = new MutationObserver(() => {
      setColors();
      draw(performance.now());
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    document.addEventListener("visibilitychange", restart);
    reduced.addEventListener("change", restart);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", restart);
      reduced.removeEventListener("change", restart);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="hero-shader auth-shader absolute inset-0 h-full w-full" />;
}
