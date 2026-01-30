"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vert = `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const frag = `
  precision highp float;
  uniform vec3 iResolution;
  uniform float iTime;
  uniform float uLineThickness;
  uniform vec3 uLinesColor;
  uniform vec3 uScanColor;
  uniform float uGridScale;
  uniform float uScanOpacity;
  uniform float uScanGlow;
  uniform float uScanDuration;
  uniform float uScanDelay;
  uniform float uTilt;
  uniform float uYaw;
  varying vec2 vUv;

  void main() {
    vec2 p = (2.0 * vUv - 1.0) * vec2(iResolution.x/iResolution.y, 1.0);
    
    // Camera setup for deep 3D perspective
    vec3 ro = vec3(0.0, 0.0, iTime * 0.5); // Moving camera forward
    vec3 rd = normalize(vec3(p, 1.0));

    // Perspective distortion / Tilt
    float cT = cos(uTilt), sT = sin(uTilt);
    rd.yz = mat2(cT, -sT, sT, cT) * rd.yz;
    
    float cY = cos(uYaw), sY = sin(uYaw);
    rd.xz = mat2(cY, -sY, sY, cY) * rd.xz;

    vec3 color = vec3(0.01); // Very dark base
    
    // Infinite Tunnel Intersection (4 planes)
    // We treat it as 4 planes: x=+/-0.5 and y=+/-0.5
    vec3 planes = abs(rd);
    float t = 0.0;
    vec2 uv = vec2(0.0);
    
    if (planes.x > planes.y) {
        t = (0.5 - abs(ro.x)) / abs(rd.x);
        uv = ro.yz + rd.yz * t;
    } else {
        t = (0.5 - abs(ro.y)) / abs(rd.y);
        uv = ro.xz + rd.xz * t;
    }

    if(t > 0.0) {
        vec3 hit = ro + rd * t;
        
        // Grid setup
        float scale = uGridScale * 8.0;
        vec2 gv = abs(fract(uv * scale) - 0.5) / (fwidth(uv * scale) * uLineThickness);
        float line = 1.0 - smoothstep(0.0, 1.0, min(gv.x, gv.y));
        
        // Depth fading (Tunnel effect)
        float depth = exp(-t * 0.3);
        
        // Neon Glow Grid
        vec3 neon = mix(uLinesColor, uScanColor, 0.3);
        color = neon * line * depth;
        
        // Dynamic scan line moving forward
        float cycle = uScanDuration + uScanDelay;
        float phase = mod(iTime * 0.5, 1.0);
        float scanPos = mod(iTime * 1.5, 10.0);
        float distZ = abs(hit.z - (ro.z + scanPos));
        
        float scanGlow = exp(-distZ * 2.0 / uScanGlow) * uScanOpacity;
        color += uScanColor * scanGlow * depth;
        
        // Atmosphere / Vignette
        color *= smoothstep(4.0, 0.5, length(p));
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;

export const GridScan = ({
    lineThickness = 1.2,
    linesColor = '#4facfe', // Aurora Blue
    scanColor = '#ff0080',  // Aurora Rose
    scanOpacity = 0.6,
    gridScale = 0.6,
    scanGlow = 2.0,
    scanDuration = 4.0,
    scanDelay = 0.5,
    uTilt = -0.3,
    uYaw = 0.0,
    className = "",
    style = {}
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current = renderer;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        const uniforms = {
            iResolution: { value: new THREE.Vector3(container.clientWidth, container.clientHeight, 1) },
            iTime: { value: 0 },
            uLineThickness: { value: lineThickness },
            uLinesColor: { value: new THREE.Color(linesColor) },
            uScanColor: { value: new THREE.Color(scanColor) },
            uGridScale: { value: gridScale },
            uScanOpacity: { value: scanOpacity },
            uScanGlow: { value: scanGlow },
            uScanDuration: { value: scanDuration },
            uScanDelay: { value: scanDelay },
            uTilt: { value: uTilt },
            uYaw: { value: uYaw }
        };

        const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader: vert,
            fragmentShader: frag,
        });

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
        scene.add(quad);

        const animate = () => {
            uniforms.iTime.value = performance.now() / 1000;
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };
        animate();

        const handleResize = () => {
            if (!container) return;
            renderer.setSize(container.clientWidth, container.clientHeight);
            uniforms.iResolution.value.set(container.clientWidth, container.clientHeight, 1);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
            material.dispose();
            quad.geometry.dispose();
            container.removeChild(renderer.domElement);
        };
    }, [lineThickness, linesColor, scanColor, gridScale, scanOpacity, scanGlow, scanDuration, scanDelay, uTilt, uYaw]);

    return <div ref={containerRef} className={`fixed inset-0 z-[-1] pointer-events-none ${className}`} style={style} />;
};