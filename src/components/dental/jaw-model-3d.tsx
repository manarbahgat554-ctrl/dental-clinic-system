import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { PERMANENT_TEETH } from '@/lib/dental-data';
import { getToothColor } from '@/lib/format';
import type { ToothRecord } from '@/types';

interface Tooth3DProps {
  position: [number, number, number];
  number: number;
  color: string;
  selected: boolean;
  onSelect: (num: number) => void;
}

function Tooth3D({ position, number, color, selected, onSelect }: Tooth3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      const targetScale = selected ? 1.25 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(number);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Tooth crown */}
        <boxGeometry args={[0.35, 0.45, 0.35]} />
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.1}
          emissive={selected ? color : '#000000'}
          emissiveIntensity={selected ? 0.3 : 0}
        />
      </mesh>
      {/* Root */}
      <mesh position={[0, -0.4, 0]}>
        <coneGeometry args={[0.12, 0.35, 6]} />
        <meshStandardMaterial color={color} roughness={0.4} opacity={0.8} transparent />
      </mesh>
      {selected && (
        <Html distanceFactor={8} position={[0, 0.6, 0]} center>
          <div className="rounded-md bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground shadow-lg">
            {number}
          </div>
        </Html>
      )}
    </group>
  );
}

interface JawModelProps {
  teethRecords: ToothRecord[];
  selectedTooth: number | null;
  onSelectTooth: (num: number) => void;
}

function JawArch({
  teethNumbers,
  y,
  isUpper,
  records,
  selected,
  onSelect,
}: {
  teethNumbers: number[];
  y: number;
  isUpper: boolean;
  records: ToothRecord[];
  selected: number | null;
  onSelect: (num: number) => void;
}) {
  const recordMap = useMemo(() => new Map(records.map((t) => [t.tooth_number, t])), [records]);

  // Arrange teeth along a curved arch
  const positions = useMemo(() => {
    const total = teethNumbers.length;
    const archRadius = 2.2;
    return teethNumbers.map((_, i) => {
      const t = i / (total - 1);
      const angle = Math.PI * (1 - t) - Math.PI / 2; // arch from right to left
      const x = Math.cos(angle) * archRadius;
      const z = Math.sin(angle) * archRadius * 0.7;
      return [x, y, z] as [number, number, number];
    });
  }, [teethNumbers]);

  return (
    <group>
      {/* Gum arch */}
      <mesh position={[0, y - (isUpper ? 0.25 : -0.25), 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[2.1, 0.18, 8, 32, Math.PI]} />
        <meshStandardMaterial color="#e8907a" roughness={0.6} />
      </mesh>
      {teethNumbers.map((num, i) => {
        const record = recordMap.get(num);
        const status = record?.status ?? 'healthy';
        const color = getToothColor(status);
        return (
          <Tooth3D
            key={num}
            position={positions[i]}
            number={num}
            color={color}
            selected={selected === num}
            onSelect={onSelect}
          />
        );
      })}
    </group>
  );
}

export function JawModel3D({ teethRecords, selectedTooth, onSelectTooth }: JawModelProps) {
  return (
    <div className="h-[420px] w-full overflow-hidden rounded-xl border bg-gradient-to-b from-background to-muted/30">
      <Canvas camera={{ position: [0, 3, 6], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
        <Environment preset="studio" />

        <JawArch
          teethNumbers={[...PERMANENT_TEETH.upperRight, ...PERMANENT_TEETH.upperLeft]}
          y={0.5}
          isUpper
          records={teethRecords}
          selected={selectedTooth}
          onSelect={onSelectTooth}
        />
        <JawArch
          teethNumbers={[...PERMANENT_TEETH.lowerRight, ...PERMANENT_TEETH.lowerLeft]}
          y={-0.7}
          isUpper={false}
          records={teethRecords}
          selected={selectedTooth}
          onSelect={onSelectTooth}
        />

        <ContactShadows position={[0, -1.5, 0]} opacity={0.3} scale={10} blur={2} far={4} />
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={3}
          maxDistance={12}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
