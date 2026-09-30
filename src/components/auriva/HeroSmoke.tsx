import { useEffect, useRef } from "react";

/**
 * Animated incense smoke drawn with a WebGL shader over the hero photo.
 *
 * Positions are in "image units": 0–1 across the square hero photo, y down.
 * The canvas covers REGION of the photo; --d (the photo's rendered size under
 * object-cover) keeps it aligned at any viewport. Needs a size container
 * (the hero section) as its nearest container.
 */
const REGION = { x: 0.56, y: 0, w: 0.44, h: 0.5 };
/** Where the smoke rises from: the base of the wisps in the photo. */
const SOURCE = { x: 0.79, y: 0.43 };
/** Overall animation speed (1 = original tuning). */
const SPEED = 0.8;

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec4 u_region;
uniform vec2 u_source;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

// One rising ribbon of smoke. Noise terms scroll with (h - speed * t), so
// every sway, curl and filament travels upward like real smoke.
float strand(vec2 img, float seed, float t) {
  float h = u_source.y - img.y;
  if (h < 0.0) return 0.0;
  float dx = img.x - u_source.x;

  float grow = smoothstep(0.0, 0.25, h);
  float sway = (fbm(vec2(h * 6.0 - t * 0.22, seed * 7.0)) - 0.5) * 0.26 * grow;
  float cx = 0.4 * h + sway;

  vec2 wp = vec2(dx * 8.0, h * 8.0 - t * 0.3) + seed * 5.0;
  float curl = (fbm(wp + fbm(wp * 1.3 + t * 0.05)) - 0.5) * 0.14 * smoothstep(0.02, 0.3, h);

  float d = dx - cx - curl;
  float width = 0.006 + 0.024 * pow(h, 1.1);
  float core = exp(-(d * d) / (width * width));

  // Thin bright filaments inside the ribbon, streaming upward.
  float fil = fbm(vec2(d * 90.0, h * 10.0 - t * 0.45) + seed * 3.0);
  float dens = core * (0.5 + 0.8 * smoothstep(0.3, 0.85, fil));
  // Fade in slowly from the source so it grows out of the photo's smoke.
  return dens * smoothstep(0.0, 0.09, h) * (1.0 - smoothstep(0.16, 0.42, h));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  uv.y = 1.0 - uv.y;
  vec2 img = u_region.xy + uv * u_region.zw;

  float dens = strand(img, 0.0, u_time)
    + 0.8 * strand(img, 1.0, u_time * 0.87 + 11.0)
    + 0.6 * strand(img, 2.0, u_time * 1.13 + 23.0);

  vec2 edge = smoothstep(0.0, 0.2, uv) * smoothstep(0.0, 0.2, 1.0 - uv);
  float a = clamp(dens, 0.0, 1.0) * 0.6 * edge.x * edge.y;
  gl_FragColor = vec4(vec3(1.0, 0.996, 0.988) * a, a);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function HeroSmoke() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");
    gl.uniform4f(
      gl.getUniformLocation(program, "u_region"),
      REGION.x,
      REGION.y,
      REGION.w,
      REGION.h,
    );
    gl.uniform2f(gl.getUniformLocation(program, "u_source"), SOURCE.x, SOURCE.y);

    const resize = () => {
      // Soft smoke gains nothing from retina resolution; 1x keeps the shader cheap.
      canvas.width = Math.max(1, Math.round(canvas.clientWidth));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();

    let raf = 0;
    let visible = true;
    // Draw only while the hero is on screen and the canvas is shown (CSS hides it
    // on narrow screens, where the photo's smoke is cropped out of frame).
    const shouldRun = () => visible && canvas.clientWidth > 0;
    const start = performance.now();
    const frame = (now: number) => {
      gl.uniform1f(uTime, ((now - start) / 1000) * SPEED);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = shouldRun() ? requestAnimationFrame(frame) : 0;
    };
    const wake = () => {
      if (shouldRun() && !raf) raf = requestAnimationFrame(frame);
    };
    wake();

    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      wake();
    });
    io.observe(canvas);
    const ro = new ResizeObserver(() => {
      resize();
      wake();
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      // Free resources but keep the context: a canvas has one WebGL context for
      // life, so losing it here would break a remount (e.g. React dev double-effects).
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="hero-smoke-canvas pointer-events-none absolute blur-[1.5px]"
      style={{
        ["--d" as string]: "max(100cqw, 100cqh)",
        left: `calc(50cqw + ${REGION.x - 0.5} * var(--d))`,
        top: `calc(50cqh + ${REGION.y - 0.5} * var(--d))`,
        width: `calc(${REGION.w} * var(--d))`,
        height: `calc(${REGION.h} * var(--d))`,
      }}
    />
  );
}
