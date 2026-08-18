import { useState, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import {
  OrbitControls,
  PerspectiveCamera,
  Grid,
} from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Eye, EyeOff, Bone, Activity, RotateCcw, ZoomIn, Move } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ToothData {
  number: number;
  status: string;
  position: [number, number, number];
}

const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

function generateToothData(): ToothData[] {
  const teeth: ToothData[] = [];
  UPPER_TEETH.forEach((num, i) => {
    const x = (i - 7.5) * 0.6;
    teeth.push({
      number: num,
      status: num % 4 === 0 ? 'caries' : num % 5 === 0 ? 'filled' : num % 6 === 0 ? 'crown' : 'healthy',
      position: [x, 1.5, 0],
    });
  });

  LOWER_TEETH.forEach((num, i) => {
    const x = (i - 7.5) * 0.6;
    teeth.push({
      number: num,
      status: num % 3 === 0 ? 'caries' : num % 7 === 0 ? 'missing' : 'healthy',
      position: [x, -1.5, 0],
    });
  });

  return teeth;
}

const STATUS_COLORS: Record<string, string> = {
  healthy: '#f5f5f5',
  caries: '#ef4444',
  filled: '#eab308',
  crown: '#a855f7',
  missing: '#333333',
  implant: '#06b6d4',
};

function Tooth({ data, selected, onSelect, showNerves }: {
  data: ToothData;
  selected: boolean;
  onSelect: (n: number) => void;
  showNerves: boolean;
}) {
  const isMolar = data.number % 10 >= 6;
  const isPremolar = data.number % 10 >= 4 && data.number % 10 <= 5;
  const radius = isMolar ? 0.22 : isPremolar ? 0.18 : 0.14;
  const height = data.status === 'missing' ? 0.02 : 0.5;

  const color = STATUS_COLORS[data.status] ?? STATUS_COLORS.healthy;
  const isUpper = data.position[1] > 0;
  const rootY = isUpper ? -0.3 : 0.3;

  return (
    <group position={data.position}>
      {/* Crown */}
      {data.status !== 'missing' && (
        <mesh
          onClick={(e) => { e.stopPropagation(); onSelect(data.number); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
          <cylinderGeometry args={[radius, radius * 0.85, height, 16]} />
          <meshStandardMaterial
            color={selected ? '#0ea5e9' : color}
            roughness={0.3}
            metalness={0.1}
            emissive={selected ? '#0ea5e9' : '#000'}
            emissiveIntensity={selected ? 0.3 : 0}
          />
        </mesh>
      )}

      {/* Root */}
      {data.status !== 'missing' && data.status !== 'crown' && (
        <mesh position={[0, rootY, 0]}>
          <coneGeometry args={[radius * 0.6, 0.4, 12]} />
          <meshStandardMaterial color="#e8e8e8" roughness={0.5} />
        </mesh>
      )}

      {/* Nerve */}
      {showNerves && data.status !== 'missing' && (
        <mesh position={[0, rootY * 0.3, 0]}>
          <cylinderGeometry args={[radius * 0.2, radius * 0.1, 0.3, 8]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} transparent opacity={0.7} />
        </mesh>
      )}

      {/* Missing tooth marker */}
      {data.status === 'missing' && (
        <mesh
          onClick={(e) => { e.stopPropagation(); onSelect(data.number); }}
        >
          <torusGeometry args={[radius, 0.02, 8, 24]} />
          <meshStandardMaterial color="#666" transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
}

function JawArch({ upper, showBone }: { upper: boolean; showBone: boolean }) {
  const y = upper ? 1.5 : -1.5;

  return (
    <group>
      {/* Jaw bone arch */}
      {showBone && (
        <mesh position={[0, y, 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[4.5, 0.3, 12, 48, Math.PI]} />
          <meshStandardMaterial color="#e8d5c4" roughness={0.8} />
        </mesh>
      )}
      {/* Gum line */}
      <mesh position={[0, y * 0.95, 0]}>
        <torusGeometry args={[4.5, 0.15, 8, 48, Math.PI]} />
        <meshStandardMaterial color="#f87171" roughness={0.6} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function Scene({ selectedTooth, onSelectTooth, showUpper, showLower, showNerves, showBone }: {
  selectedTooth: number | null;
  onSelectTooth: (n: number) => void;
  showUpper: boolean;
  showLower: boolean;
  showNerves: boolean;
  showBone: boolean;
}) {
  const allTeeth = generateToothData();

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 3, 10]} fov={45} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={20}
      />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />

      {showUpper && (
        <>
          <JawArch upper={true} showBone={showBone} />
          {allTeeth.filter((t) => t.position[1] > 0).map((t) => (
            <Tooth key={t.number} data={t} selected={selectedTooth === t.number} onSelect={onSelectTooth} showNerves={showNerves} />
          ))}
        </>
      )}

      {showLower && (
        <>
          <JawArch upper={false} showBone={showBone} />
          {allTeeth.filter((t) => t.position[1] < 0).map((t) => (
            <Tooth key={t.number} data={t} selected={selectedTooth === t.number} onSelect={onSelectTooth} showNerves={showNerves} />
          ))}
        </>
      )}

      <Grid
        args={[20, 20]}
        position={[0, -3, 0]}
        cellColor="#333"
        sectionColor="#666"
        fadeDistance={20}
        fadeStrength={1}
        infiniteGrid
      />
    </>
  );
}

export function DentalViewer3D() {
  useTranslation();
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [showUpper, setShowUpper] = useState(true);
  const [showLower, setShowLower] = useState(true);
  const [showNerves, setShowNerves] = useState(false);
  const [showBone, setShowBone] = useState(false);
  const allTeeth = generateToothData();
  const selectedData = allTeeth.find((t) => t.number === selectedTooth);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-5 w-5 text-primary" /> 3D Dental Viewer
        </CardTitle>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <RotateCcw className="h-3.5 w-3.5" /> Drag to rotate
          <ZoomIn className="ml-2 h-3.5 w-3.5" /> Scroll to zoom
          <Move className="ml-2 h-3.5 w-3.5" /> Right-click to pan
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 3D Canvas */}
        <div className="h-[400px] overflow-hidden rounded-xl border bg-gradient-to-b from-slate-900 to-slate-800">
          <Canvas shadows>
            <Suspense fallback={null}>
              <Scene
                selectedTooth={selectedTooth}
                onSelectTooth={setSelectedTooth}
                showUpper={showUpper}
                showLower={showLower}
                showNerves={showNerves}
                showBone={showBone}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <ToggleButton active={showUpper} onClick={() => setShowUpper(!showUpper)} label="Upper Jaw" />
          <ToggleButton active={showLower} onClick={() => setShowLower(!showLower)} label="Lower Jaw" />
          <ToggleButton active={showNerves} onClick={() => setShowNerves(!showNerves)} label="Nerves" icon={Activity} />
          <ToggleButton active={showBone} onClick={() => setShowBone(!showBone)} label="Bone" icon={Bone} />
        </div>

        {/* Selected tooth info */}
        {selectedData && (
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div
              className="h-8 w-8 rounded-lg"
              style={{ background: STATUS_COLORS[selectedData.status] + '40', border: `2px solid ${STATUS_COLORS[selectedData.status]}` }}
            />
            <div>
              <p className="text-sm font-semibold">Tooth #{selectedData.number}</p>
              <p className="text-xs text-muted-foreground capitalize">Status: {selectedData.status}</p>
            </div>
            <Badge variant="outline" className="ml-auto">
              {selectedData.position[1] > 0 ? 'Upper' : 'Lower'}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ToggleButton({ active, onClick, label, icon: Icon }: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: typeof Eye;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
        active ? 'border-primary bg-primary/10 text-primary' : 'border-muted text-muted-foreground hover:border-primary/40',
      )}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}
