
import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Sphere, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';

const EARTH_URL = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg';

// Defining intrinsic elements as any to bypass JSX type errors for Three.js tags in the current environment
const MeshPhongMaterial = 'meshPhongMaterial' as any;
const ShaderMaterial = 'shaderMaterial' as any;
const AmbientLight = 'ambientLight' as any;
const DirectionalLight = 'directionalLight' as any;

interface GlobeProps {
  targetLocation: { lat: number; lon: number } | null;
  autoRotate: boolean;
}

const Globe: React.FC<GlobeProps> = ({ targetLocation, autoRotate }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, EARTH_URL);

  const atmosphereShader = useMemo(() => ({
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
        gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
      }
    `
  }), []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (autoRotate && !targetLocation) {
      meshRef.current.rotation.y += delta * 0.1;
    }

    if (targetLocation) {
      const phi = (90 - targetLocation.lat) * (Math.PI / 180);
      const theta = (targetLocation.lon + 180) * (Math.PI / 180);
      
      const targetQuat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(-phi + Math.PI / 2, theta - Math.PI / 2, 0, 'YXZ')
      );
      meshRef.current.quaternion.slerp(targetQuat, delta * 4);
    }
  });

  return (
    <>
      <Sphere ref={meshRef} args={[100, 64, 64]}>
        {/* Fix: use MeshPhongMaterial constant to avoid JSX intrinsic element error */}
        <MeshPhongMaterial 
          map={texture} 
          shininess={15} 
          specular={new THREE.Color(0x333333)} 
        />
      </Sphere>
      
      <Sphere args={[103, 64, 64]}>
        {/* Fix: use ShaderMaterial constant to avoid JSX intrinsic element error */}
        <ShaderMaterial
          args={[atmosphereShader]}
          transparent
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
    </>
  );
};

export const GlobeScene: React.FC<GlobeProps> = (props) => {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 300]} fov={45} />
        {/* Fix: use AmbientLight constant to avoid JSX intrinsic element error */}
        <AmbientLight intensity={0.7} />
        {/* Fix: use DirectionalLight constant to avoid JSX intrinsic element error */}
        <DirectionalLight position={[10, 10, 10]} intensity={1.5} />
        <React.Suspense fallback={null}>
          <Globe {...props} />
        </React.Suspense>
      </Canvas>
    </div>
  );
};
