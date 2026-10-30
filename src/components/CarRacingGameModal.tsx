import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  X,
  Play,
  RotateCcw,
  Trophy,
  Zap,
  Volume2,
  VolumeX,
  Sparkles,
  Flag,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Gauge,
  Bot,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playCorrectSound, playFanfareSound, playSparkleSound, playClickSound, playPopSound } from '../utils/audio';

interface CarRacingGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEarnStars: (amount: number) => void;
}

export const CAR_COLORS = [
  { id: 'red', name: 'أحمر ناري 🏎️', hex: 0xe63946, bgClass: 'bg-red-500' },
  { id: 'blue', name: 'أزرق برقي ⚡', hex: 0x00b4d8, bgClass: 'bg-cyan-500' },
  { id: 'yellow', name: 'أصفر ذهبي ⭐', hex: 0xffb703, bgClass: 'bg-amber-400' },
  { id: 'green', name: 'أخضر نيون 🟢', hex: 0x38b000, bgClass: 'bg-emerald-500' },
  { id: 'pink', name: 'وردي ليان الساحر 🌸', hex: 0xff007f, bgClass: 'bg-pink-500' },
  { id: 'purple', name: 'بنفسجي ملكي 🟣', hex: 0x7209b7, bgClass: 'bg-purple-600' },
  { id: 'gold', name: 'ذهبي أسطوري 👑', hex: 0xffd700, bgClass: 'bg-yellow-500' },
];

export const CarRacingGameModal: React.FC<CarRacingGameModalProps> = ({
  isOpen,
  onClose,
  onEarnStars,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedColor, setSelectedColor] = useState<string>('pink');
  const [gameState, setGameState] = useState<'menu' | 'racing' | 'finished'>('menu');
  const [speed, setSpeed] = useState<number>(0);
  const [nitro, setNitro] = useState<number>(100);
  const [lap, setLap] = useState<number>(1);
  const [coinsCollected, setCoinsCollected] = useState<number>(0);
  const [isNitroActive, setIsNitroActive] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [autoDrive, setAutoDrive] = useState<boolean>(false);

  // References for Three.js animation & control keys
  const animFrameIdRef = useRef<number>(0);
  const keysRef = useRef<{ forward: boolean; backward: boolean; left: boolean; right: boolean; nitro: boolean }>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    nitro: false,
  });

  const speedRef = useRef<number>(0);
  const angleRef = useRef<number>(Math.PI * 0.5);
  const laneOffsetRef = useRef<number>(0);
  const nitroFuelRef = useRef<number>(100);
  const lapRef = useRef<number>(1);
  const coinsRef = useRef<number>(0);
  const checkpointPassedRef = useRef<boolean>(false);
  const autoDriveRef = useRef<boolean>(false);

  // Web Audio Synthesizer for Engine Sound
  const audioCtxRef = useRef<AudioContext | null>(null);
  const engineOscRef = useRef<OscillatorNode | null>(null);
  const engineGainRef = useRef<GainNode | null>(null);

  // Sync ref with state
  useEffect(() => {
    autoDriveRef.current = autoDrive;
  }, [autoDrive]);

  // Audio engine initializer
  const initEngineSound = useCallback(() => {
    if (soundMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (!engineOscRef.current && audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(65, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        engineOscRef.current = osc;
        engineGainRef.current = gain;
      }
    } catch {
      // AudioContext policy safe fallback
    }
  }, [soundMuted]);

  const stopEngineSound = useCallback(() => {
    try {
      if (engineGainRef.current && audioCtxRef.current) {
        engineGainRef.current.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
      }
      if (engineOscRef.current) {
        engineOscRef.current.stop();
        engineOscRef.current.disconnect();
        engineOscRef.current = null;
      }
    } catch {
      // ignore
    }
  }, []);

  const updateEngineSoundPitch = useCallback((currentKmh: number, isBoosting: boolean) => {
    if (soundMuted || !engineOscRef.current || !engineGainRef.current || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const baseFreq = 65 + (currentKmh / 180) * 160;
      const boostMult = isBoosting ? 1.4 : 1.0;
      engineOscRef.current.frequency.setTargetAtTime(baseFreq * boostMult, ctx.currentTime, 0.08);
      const targetGain = currentKmh > 5 ? (isBoosting ? 0.08 : 0.05) : 0.02;
      engineGainRef.current.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.08);
    } catch {
      // ignore
    }
  }, [soundMuted]);

  const startRace = () => {
    playSparkleSound();
    setGameState('racing');
    setSpeed(0);
    setNitro(100);
    setLap(1);
    setCoinsCollected(0);
    setIsNitroActive(false);

    speedRef.current = 0.2; // Start with gentle engine momentum
    angleRef.current = Math.PI * 0.5;
    laneOffsetRef.current = 0;
    nitroFuelRef.current = 100;
    lapRef.current = 1;
    coinsRef.current = 0;
    checkpointPassedRef.current = false;

    initEngineSound();
  };

  useEffect(() => {
    if (soundMuted) {
      stopEngineSound();
    } else if (gameState === 'racing') {
      initEngineSound();
    }
  }, [soundMuted, gameState, initEngineSound, stopEngineSound]);

  // Main 3D Three.js Racing Engine
  useEffect(() => {
    if (gameState !== 'racing' || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';

    const width = container.clientWidth || 850;
    const height = container.clientHeight || 520;

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e0728);
    scene.fog = new THREE.FogExp2(0x0e0728, 0.012);

    const camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 1000);

    // 2. WebGL Renderer with graceful fallback
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    } catch {
      // In case of WebGL initialization failure
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Lighting (Vibrant & Child-friendly)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5cc, 1.4);
    sunLight.position.set(40, 70, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const hemisphereLight = new THREE.HemisphereLight(0xd9b3ff, 0x112233, 0.6);
    scene.add(hemisphereLight);

    // 4. Ground Terrain (Green rolling grass field)
    const groundGeo = new THREE.PlaneGeometry(350, 350, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x183a24,
      roughness: 0.85,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // 5. Oval Race Track Dimensions
    const trackRadiusX = 58;
    const trackRadiusZ = 36;
    const trackWidth = 14;

    // Guaranteed Render Track Geometry via Ring/Segment construction
    const trackSegments = 90;
    const trackMeshGroup = new THREE.Group();

    // Road segments
    const roadVertices: number[] = [];
    const roadIndices: number[] = [];
    const roadUvs: number[] = [];

    for (let i = 0; i <= trackSegments; i++) {
      const angle = (i / trackSegments) * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Outer point
      const ox = cosA * (trackRadiusX + trackWidth * 0.5);
      const oz = sinA * (trackRadiusZ + trackWidth * 0.5);

      // Inner point
      const ix = cosA * (trackRadiusX - trackWidth * 0.5);
      const iz = sinA * (trackRadiusZ - trackWidth * 0.5);

      roadVertices.push(ox, 0.08, oz);
      roadVertices.push(ix, 0.08, iz);

      roadUvs.push(1, i / 5);
      roadUvs.push(0, i / 5);

      if (i < trackSegments) {
        const base = i * 2;
        roadIndices.push(base, base + 1, base + 2);
        roadIndices.push(base + 1, base + 3, base + 2);
      }
    }

    const roadGeo = new THREE.BufferGeometry();
    roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(roadVertices, 3));
    roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(roadUvs, 2));
    roadGeo.setIndex(roadIndices);
    roadGeo.computeVertexNormals();

    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x22222e,
      roughness: 0.45,
      metalness: 0.1,
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.receiveShadow = true;
    trackMeshGroup.add(roadMesh);

    // Center Dashed Line
    const centerLineGroup = new THREE.Group();
    const dashCount = 45;
    const dashGeo = new THREE.PlaneGeometry(0.5, 2.2);
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });

    for (let i = 0; i < dashCount; i++) {
      const angle = (i / dashCount) * Math.PI * 2;
      const cx = Math.cos(angle) * trackRadiusX;
      const cz = Math.sin(angle) * trackRadiusZ;
      const nextA = angle + 0.02;
      const nx = Math.cos(nextA) * trackRadiusX;
      const nz = Math.sin(nextA) * trackRadiusZ;
      const rotY = Math.atan2(nx - cx, nz - cz);

      const dash = new THREE.Mesh(dashGeo, dashMat);
      dash.rotation.x = -Math.PI / 2;
      dash.rotation.z = -rotY;
      dash.position.set(cx, 0.1, cz);
      centerLineGroup.add(dash);
    }
    trackMeshGroup.add(centerLineGroup);

    // Track Neon Kerbs (Borders)
    const createCurbsLine = (rX: number, rZ: number, color: number) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 80; i++) {
        const a = (i / 80) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * rX, 0.18, Math.sin(a) * rZ));
      }
      const g = new THREE.BufferGeometry().setFromPoints(pts);
      const m = new THREE.LineBasicMaterial({ color, linewidth: 3 });
      return new THREE.Line(g, m);
    };

    trackMeshGroup.add(createCurbsLine(trackRadiusX + trackWidth * 0.5 + 0.3, trackRadiusZ + trackWidth * 0.5 + 0.3, 0x00f5d4));
    trackMeshGroup.add(createCurbsLine(trackRadiusX - trackWidth * 0.5 - 0.3, trackRadiusZ - trackWidth * 0.5 - 0.3, 0xff007f));

    // Checkered Finish Line
    const finishLineGeo = new THREE.PlaneGeometry(trackWidth, 3.2);
    const finishLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const finishLine = new THREE.Mesh(finishLineGeo, finishLineMat);
    finishLine.rotation.x = -Math.PI / 2;
    finishLine.position.set(0, 0.12, trackRadiusZ);
    trackMeshGroup.add(finishLine);

    // Finish Line Arch Gate with Chequered Theme
    const archGroup = new THREE.Group();
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xff0055 });
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 9, 16), pillarMat);
    p1.position.set(-trackWidth * 0.5 - 1.2, 4.5, trackRadiusZ);
    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 9, 16), pillarMat);
    p2.position.set(trackWidth * 0.5 + 1.2, 4.5, trackRadiusZ);

    const bannerMat = new THREE.MeshStandardMaterial({ color: 0xffb703, metalness: 0.3 });
    const banner = new THREE.Mesh(new THREE.BoxGeometry(trackWidth + 3.5, 2.2, 0.8), bannerMat);
    banner.position.set(0, 8.5, trackRadiusZ);
    archGroup.add(p1, p2, banner);
    trackMeshGroup.add(archGroup);

    scene.add(trackMeshGroup);

    // 6. Scenery: Cartoon Trees & Lanterns
    const sceneryGroup = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x582f0e });
    const leavesMat1 = new THREE.MeshStandardMaterial({ color: 0x2d6a4f });
    const leavesMat2 = new THREE.MeshStandardMaterial({ color: 0x52b788 });

    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      const offsetDist = trackRadiusX + trackWidth * 0.5 + 12 + (i % 4) * 5;
      const tx = Math.cos(a) * offsetDist;
      const tz = Math.sin(a) * (offsetDist * 0.65);

      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 4), trunkMat);
      trunk.position.y = 2;
      const foliage = new THREE.Mesh(new THREE.ConeGeometry(3.2, 6, 8), i % 2 === 0 ? leavesMat1 : leavesMat2);
      foliage.position.y = 6.2;
      tree.add(trunk, foliage);
      tree.position.set(tx, 0, tz);
      sceneryGroup.add(tree);
    }
    scene.add(sceneryGroup);

    // 7. Collectible Floating Golden Stars
    const starsGroup = new THREE.Group();
    const starGeom = new THREE.OctahedronGeometry(1.2, 0);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffaa00,
      emissiveIntensity: 0.7,
      metalness: 0.8,
      roughness: 0.2,
    });
    const starMeshes: THREE.Mesh[] = [];

    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const sx = Math.cos(a) * trackRadiusX;
      const sz = Math.sin(a) * trackRadiusZ;
      const star = new THREE.Mesh(starGeom, starMat);
      star.position.set(sx, 1.8, sz);
      starsGroup.add(star);
      starMeshes.push(star);
    }
    scene.add(starsGroup);

    // 8. Build High-Performance 3D Supercar
    const buildCarGroup = (colorHex: number) => {
      const car = new THREE.Group();

      // Main Body Chassis
      const bodyMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.25,
        metalness: 0.65,
      });
      const bodyGeo = new THREE.BoxGeometry(2.4, 0.85, 4.4);
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.8;
      body.castShadow = true;
      car.add(body);

      // Cabin / Tinted Windshield
      const cabinMat = new THREE.MeshStandardMaterial({ color: 0x111625, roughness: 0.1 });
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.75, 2.2), cabinMat);
      cabin.position.set(0, 1.45, -0.2);
      car.add(cabin);

      const windshieldMat = new THREE.MeshStandardMaterial({
        color: 0x70d6ff,
        roughness: 0.1,
        transparent: true,
        opacity: 0.8,
      });
      const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.65, 0.65), windshieldMat);
      windshield.position.set(0, 1.45, 0.92);
      windshield.rotation.x = -Math.PI / 6;
      car.add(windshield);

      // Rotating Wheels
      const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.45, 16);
      const tireMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
      const rimMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.9 });
      const wheels: THREE.Mesh[] = [];

      const addWheel = (x: number, y: number, z: number) => {
        const wGroup = new THREE.Group();
        const tire = new THREE.Mesh(wheelGeo, tireMat);
        tire.rotation.z = Math.PI / 2;
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.46, 8), rimMat);
        rim.rotation.z = Math.PI / 2;
        wGroup.add(tire, rim);
        wGroup.position.set(x, y, z);
        car.add(wGroup);
        wheels.push(tire);
      };

      addWheel(1.3, 0.55, 1.3);
      addWheel(-1.3, 0.55, 1.3);
      addWheel(1.3, 0.55, -1.3);
      addWheel(-1.3, 0.55, -1.3);

      // Rear Racing Spoiler
      const spoiler = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.12, 0.6), bodyMat);
      spoiler.position.set(0, 1.85, -2.1);
      const pPost1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.7), tireMat);
      pPost1.position.set(0.8, 1.45, -2.1);
      const pPost2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.7), tireMat);
      pPost2.position.set(-0.8, 1.45, -2.1);
      car.add(spoiler, pPost1, pPost2);

      // Glowing Headlights
      const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.1), hlMat);
      hl1.position.set(0.8, 0.75, 2.21);
      const hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.1), hlMat);
      hl2.position.set(-0.8, 0.75, 2.21);
      car.add(hl1, hl2);

      // Nitro Thruster Flames (Hidden by default)
      const flameMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });
      const flame1 = new THREE.Mesh(new THREE.ConeGeometry(0.25, 1.2, 8), flameMat);
      flame1.rotation.x = -Math.PI / 2;
      flame1.position.set(0.45, 0.5, -2.7);
      const flame2 = new THREE.Mesh(new THREE.ConeGeometry(0.25, 1.2, 8), flameMat);
      flame2.rotation.x = -Math.PI / 2;
      flame2.position.set(-0.45, 0.5, -2.7);
      flame1.visible = false;
      flame2.visible = false;
      car.add(flame1, flame2);

      return { car, wheels, flame1, flame2 };
    };

    const chosenColorHex = CAR_COLORS.find((c) => c.id === selectedColor)?.hex || 0xff007f;
    const playerCarObj = buildCarGroup(chosenColorHex);
    const playerCar = playerCarObj.car;
    scene.add(playerCar);

    // AI Rival Cars
    const rivalColors = [0x00b4d8, 0xffb703, 0x38b000];
    const rivals = rivalColors.map((col, idx) => {
      const rObj = buildCarGroup(col);
      const startAngle = (Math.PI * 0.5) + (idx + 1) * 0.35;
      const laneOffset = (idx - 1) * 3.5;
      scene.add(rObj.car);
      return {
        obj: rObj,
        angle: startAngle,
        speed: 0.0075 + idx * 0.0012,
        laneOffset,
      };
    });

    // 9. Input Keyboard Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keysRef.current.forward = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keysRef.current.backward = true;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = true;
      if (e.code === 'Space') {
        e.preventDefault();
        keysRef.current.nitro = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keysRef.current.forward = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keysRef.current.backward = false;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = false;
      if (e.code === 'Space') keysRef.current.nitro = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 10. Animation Loop
    let clock = new THREE.Clock();
    let currentAngle = angleRef.current;
    let currentLaneOffset = laneOffsetRef.current;
    let nitroFuel = nitroFuelRef.current;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);

      const keys = keysRef.current;
      const isAuto = autoDriveRef.current;

      // Auto-drive logic (if child activates auto-mode)
      if (isAuto) {
        keys.forward = true;
        // Gently oscillate around center lane
        currentLaneOffset = Math.sin(currentAngle * 2) * 2;
      }

      // Nitro & Acceleration
      const isBoosting = keys.nitro && nitroFuel > 5;
      const maxSpeed = isBoosting ? 1.6 : 1.05;
      const accel = (isBoosting ? 1.8 : 1.1) * delta;
      const friction = 0.985;

      if (keys.forward) {
        speedRef.current = Math.min(maxSpeed, speedRef.current + accel);
      } else if (keys.backward) {
        speedRef.current = Math.max(-0.4, speedRef.current - accel);
      } else {
        speedRef.current *= friction;
      }

      // Nitro consumption & recharge
      if (isBoosting && Math.abs(speedRef.current) > 0.2) {
        nitroFuel = Math.max(0, nitroFuel - 35 * delta);
        playerCarObj.flame1.visible = true;
        playerCarObj.flame2.visible = true;
        setIsNitroActive(true);
      } else {
        nitroFuel = Math.min(100, nitroFuel + 14 * delta);
        playerCarObj.flame1.visible = false;
        playerCarObj.flame2.visible = false;
        setIsNitroActive(false);
      }
      nitroFuelRef.current = nitroFuel;
      setNitro(Math.round(nitroFuel));

      // Steering
      if (!isAuto) {
        if (keys.left) {
          currentLaneOffset = Math.max(-trackWidth * 0.5 + 2, currentLaneOffset - 16 * delta);
        }
        if (keys.right) {
          currentLaneOffset = Math.min(trackWidth * 0.5 - 2, currentLaneOffset + 16 * delta);
        }
      }
      laneOffsetRef.current = currentLaneOffset;

      // Advance car along the oval
      currentAngle += (speedRef.current * 0.55 * delta);
      if (currentAngle > Math.PI * 2) currentAngle -= Math.PI * 2;
      if (currentAngle < 0) currentAngle += Math.PI * 2;
      angleRef.current = currentAngle;

      // Car positioning
      const rX = trackRadiusX + currentLaneOffset;
      const rZ = trackRadiusZ + currentLaneOffset * (trackRadiusZ / trackRadiusX);
      const cx = Math.cos(currentAngle) * rX;
      const cz = Math.sin(currentAngle) * rZ;

      // Tangent Heading direction: front of car (+Z) faces (nx - cx, nz - cz)
      const stepAhead = 0.05 * Math.sign(speedRef.current || 1);
      const nextA = currentAngle + stepAhead;
      const nx = Math.cos(nextA) * rX;
      const nz = Math.sin(nextA) * rZ;
      const heading = Math.atan2(nx - cx, nz - cz);

      playerCar.position.set(cx, 0, cz);
      playerCar.rotation.y = heading;

      // Rotate wheels with movement
      playerCarObj.wheels.forEach((w) => {
        w.rotation.x += speedRef.current * 10 * delta;
      });

      // Update AI Rivals
      rivals.forEach((rival) => {
        rival.angle += rival.speed;
        if (rival.angle > Math.PI * 2) rival.angle -= Math.PI * 2;
        const rx = Math.cos(rival.angle) * (trackRadiusX + rival.laneOffset);
        const rz = Math.sin(rival.angle) * (trackRadiusZ + rival.laneOffset * 0.7);
        rival.obj.car.position.set(rx, 0, rz);

        const rNextA = rival.angle + 0.05;
        const rNx = Math.cos(rNextA) * (trackRadiusX + rival.laneOffset);
        const rNz = Math.sin(rNextA) * (trackRadiusZ + rival.laneOffset * 0.7);
        rival.obj.car.rotation.y = Math.atan2(rNx - rx, rNz - rz);

        rival.obj.wheels.forEach((w) => {
          w.rotation.x += 0.2;
        });
      });

      // Collect Star Pickups
      starMeshes.forEach((star) => {
        star.rotation.y += 0.04;
        const dist = playerCar.position.distanceTo(star.position);
        if (dist < 3.2 && star.visible) {
          star.visible = false;
          coinsRef.current += 1;
          setCoinsCollected(coinsRef.current);
          playSparkleSound();
          onEarnStars(5);
        }
      });

      // Lap Checkpoint System
      if (currentAngle > Math.PI * 0.8 && currentAngle < Math.PI * 1.3) {
        checkpointPassedRef.current = true;
      }
      if (checkpointPassedRef.current && currentAngle > Math.PI * 1.85) {
        checkpointPassedRef.current = false;
        lapRef.current += 1;
        setLap(lapRef.current);
        playCorrectSound();

        // Respawn stars for next lap
        starMeshes.forEach((s) => (s.visible = true));

        if (lapRef.current > 3) {
          // Finished Race!
          setGameState('finished');
          stopEngineSound();
          playFanfareSound();
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          onEarnStars(60);
          return;
        }
      }

      // Dynamic Camera Behind the Car
      const camDist = 13.5;
      const camHeight = 7.0;
      // Camera is positioned BEHIND the car (opposite of heading)
      const targetCamX = cx - Math.sin(heading) * camDist;
      const targetCamZ = cz - Math.cos(heading) * camDist;

      camera.position.lerp(new THREE.Vector3(targetCamX, camHeight, targetCamZ), 0.14);
      camera.lookAt(cx, 1.8, cz);

      // HUD & Sound Speed updates
      const currentKmh = Math.round(Math.abs(speedRef.current) * 135);
      setSpeed(currentKmh);
      updateEngineSoundPitch(currentKmh, isBoosting);

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Resize Handler via ResizeObserver
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth || 800;
      const h = containerRef.current.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      resizeObserver.disconnect();
      stopEngineSound();
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [gameState, selectedColor, onEarnStars, stopEngineSound, updateEngineSoundPitch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md" dir="rtl">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[740px] rounded-3xl overflow-hidden border-2 border-purple-500/50 shadow-2xl bg-gradient-to-b from-[#160a33] via-[#0d061f] to-[#080314] flex flex-col text-white">
        {/* Top Game Bar */}
        <div className="px-4 py-3 border-b border-purple-500/30 flex items-center justify-between bg-purple-950/50">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl animate-bounce">🏎️</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-amber-300">سباق سيارات الأبطال 3D</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black">
                  جاهز للسباق ✨
                </span>
              </div>
              <p className="text-[11px] text-purple-200/80">حلبة سباق مجسمة ثلاثية الأبعاد وسيارات بألوان زاهية للأطفال</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sound Toggle */}
            <button
              onClick={() => {
                playPopSound();
                setSoundMuted((m) => !m);
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white transition-all cursor-pointer"
              title={soundMuted ? 'تشغيل صوت المحرك' : 'كتم الصوت'}
            >
              {soundMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-amber-300" />}
            </button>

            {/* Close Modal */}
            <button
              onClick={() => {
                playClickSound();
                stopEngineSound();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-purple-200 hover:text-white transition-all cursor-pointer"
              title="إغلاق اللعبة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Game Main Area */}
        <div className="relative flex-1 w-full min-h-0 flex flex-col items-center justify-center overflow-hidden">
          {/* MENU SCREEN: Color Selection */}
          {gameState === 'menu' && (
            <div className="max-w-md w-full mx-auto p-6 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 p-1 shadow-2xl shadow-pink-500/30 flex items-center justify-center">
                <div className="w-full h-full rounded-[22px] bg-[#120826] flex items-center justify-center text-5xl">
                  🏎️
                </div>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">اختر لون سيارتك المفضلة!</h3>
                <p className="text-xs text-purple-200/90 mt-1.5 leading-relaxed">
                  انطلق في حلبة النجوم ثلاثية الأبعاد، واستخدم النيترو للفوز بالمركز الأول 🏆
                </p>
              </div>

              {/* Color Picker Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {CAR_COLORS.map((car) => {
                  const isSelected = selectedColor === car.id;
                  return (
                    <button
                      key={car.id}
                      onClick={() => {
                        playPopSound();
                        setSelectedColor(car.id);
                      }}
                      className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'border-amber-400 bg-purple-900/80 ring-4 ring-amber-400/40 scale-105 shadow-lg'
                          : 'border-white/15 bg-white/5 hover:bg-white/15 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full ${car.bgClass} shadow-md border-2 border-white`} />
                      <span className="text-xs font-black truncate">{car.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Start Race Button */}
              <button
                onClick={startRace}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-amber-950 font-black text-lg shadow-xl shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-6 h-6 fill-current" />
                <span>ابدأ السباق الآن 🏁🏎️</span>
              </button>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-purple-200 leading-relaxed text-right space-y-1">
                <p className="font-bold text-amber-300">🎮 أزرار التحكم السهلة:</p>
                <p>• من الكمبيوتر: الأسهم (↑ تسارع | ↓ فرامل | ← → انعطاف | مسافة نيترو)</p>
                <p>• من شاشة اللمس: أزرار الانطلاق والانعطاف التفاعلية أسفل الشاشة</p>
              </div>
            </div>
          )}

          {/* RACING STAGE */}
          {gameState === 'racing' && (
            <div className="relative w-full h-full flex-1 flex flex-col">
              {/* Three.js 3D Canvas Mount Point */}
              <div ref={containerRef} className="w-full h-full flex-1 min-h-[380px]" />

              {/* HUD OVERLAYS: Top Bar */}
              <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none z-10">
                {/* Speedometer */}
                <div className="px-4 py-2 rounded-2xl bg-black/75 backdrop-blur-md border border-white/20 shadow-xl flex items-center gap-3">
                  <Gauge className="w-6 h-6 text-amber-400 animate-pulse" />
                  <div className="text-right">
                    <div className="text-[10px] text-purple-300 font-bold">السرعة</div>
                    <div className="text-2xl font-black text-amber-400 flex items-baseline gap-1">
                      <span>{speed}</span>
                      <span className="text-[10px] text-white">كم/س</span>
                    </div>
                  </div>
                </div>

                {/* Lap & Star Counts & Auto Drive Button */}
                <div className="flex items-center gap-2 pointer-events-auto">
                  <button
                    onClick={() => {
                      playClickSound();
                      setAutoDrive((a) => !a);
                    }}
                    className={`px-3 py-2 rounded-2xl border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-lg ${
                      autoDrive
                        ? 'bg-emerald-500 text-emerald-950 border-emerald-300 shadow-emerald-500/40 animate-pulse'
                        : 'bg-black/75 text-purple-200 border-white/20 hover:bg-white/20'
                    }`}
                    title="القيادة التلقائية للأطفال الصغار"
                  >
                    {autoDrive ? <Bot className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    <span>{autoDrive ? 'قيادة تلقائية: مفعّلة 🤖' : 'قيادة يدوية 🎮'}</span>
                  </button>

                  <div className="px-3.5 py-2 rounded-2xl bg-black/75 backdrop-blur-md border border-white/20 text-center">
                    <span className="text-[10px] text-purple-300 block font-bold">اللفة</span>
                    <span className="text-base font-black text-yellow-300">{lap} / 3</span>
                  </div>

                  <div className="px-3.5 py-2 rounded-2xl bg-black/75 backdrop-blur-md border border-amber-400/40 text-center">
                    <span className="text-[10px] text-amber-300 block font-bold">النجوم</span>
                    <span className="text-base font-black text-amber-400">⭐ {coinsCollected}</span>
                  </div>
                </div>
              </div>

              {/* Nitro Gauge */}
              <div className="absolute top-20 right-4 w-40 sm:w-48 bg-black/75 backdrop-blur-md p-2.5 rounded-2xl border border-cyan-400/40 shadow-xl pointer-events-none z-10">
                <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300 mb-1">
                  <span>نيترو توربو 🚀</span>
                  <span>{nitro}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-cyan-950 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-150 ${
                      isNitroActive ? 'bg-gradient-to-r from-cyan-400 via-pink-500 to-amber-300 animate-pulse' : 'bg-cyan-400'
                    }`}
                    style={{ width: `${nitro}%` }}
                  />
                </div>
              </div>

              {/* ON-SCREEN RESPONSIVE TOUCH & CLICK CONTROLS (ALWAYS VISIBLE FOR BOTH DESKTOP & MOBILE!) */}
              <div className="absolute bottom-4 inset-x-4 flex items-center justify-between z-20 pointer-events-auto">
                {/* Steering: Left & Right Buttons */}
                <div className="flex gap-2.5">
                  <button
                    onMouseDown={() => (keysRef.current.left = true)}
                    onMouseUp={() => (keysRef.current.left = false)}
                    onMouseLeave={() => (keysRef.current.left = false)}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      keysRef.current.left = true;
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      keysRef.current.left = false;
                    }}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-purple-950/80 active:bg-amber-400 active:text-amber-950 text-white flex flex-col items-center justify-center font-black shadow-2xl backdrop-blur-md border-2 border-purple-400/50 cursor-pointer select-none transition-transform active:scale-90"
                    title="انعطاف يسار"
                  >
                    <ArrowLeft className="w-7 h-7" />
                    <span className="text-[10px]">يسار</span>
                  </button>

                  <button
                    onMouseDown={() => (keysRef.current.right = true)}
                    onMouseUp={() => (keysRef.current.right = false)}
                    onMouseLeave={() => (keysRef.current.right = false)}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      keysRef.current.right = true;
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      keysRef.current.right = false;
                    }}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-purple-950/80 active:bg-amber-400 active:text-amber-950 text-white flex flex-col items-center justify-center font-black shadow-2xl backdrop-blur-md border-2 border-purple-400/50 cursor-pointer select-none transition-transform active:scale-90"
                    title="انعطاف يمين"
                  >
                    <ArrowRight className="w-7 h-7" />
                    <span className="text-[10px]">يمين</span>
                  </button>
                </div>

                {/* Center Quick Tip */}
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur border border-white/15 text-xs text-purple-200">
                  <span>⌨️ يمكنك اللعب بأسهم لوحة المفاتيح والمسافة!</span>
                </div>

                {/* Pedals: Brake, Nitro & Gas Pedal */}
                <div className="flex gap-2.5">
                  {/* Brake Button */}
                  <button
                    onMouseDown={() => (keysRef.current.backward = true)}
                    onMouseUp={() => (keysRef.current.backward = false)}
                    onMouseLeave={() => (keysRef.current.backward = false)}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      keysRef.current.backward = true;
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      keysRef.current.backward = false;
                    }}
                    className="w-13 h-14 sm:w-14 sm:h-16 rounded-2xl bg-rose-950/80 active:bg-rose-500 text-rose-200 active:text-white flex flex-col items-center justify-center font-black shadow-2xl backdrop-blur-md border-2 border-rose-500/50 cursor-pointer select-none transition-transform active:scale-90"
                    title="فرامل وتراجع"
                  >
                    <ArrowDown className="w-6 h-6" />
                    <span className="text-[10px]">فرامل</span>
                  </button>

                  {/* Nitro Boost Button */}
                  <button
                    onMouseDown={() => (keysRef.current.nitro = true)}
                    onMouseUp={() => (keysRef.current.nitro = false)}
                    onMouseLeave={() => (keysRef.current.nitro = false)}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      keysRef.current.nitro = true;
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      keysRef.current.nitro = false;
                    }}
                    className="w-13 h-14 sm:w-14 sm:h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 active:from-cyan-400 active:to-yellow-300 text-white font-black flex flex-col items-center justify-center shadow-2xl border-2 border-cyan-300 cursor-pointer select-none transition-transform active:scale-95"
                    title="نيترو توربو خارق"
                  >
                    <Zap className="w-6 h-6 fill-current text-yellow-300" />
                    <span className="text-[10px]">نيترو</span>
                  </button>

                  {/* Gas / Accelerate Pedal */}
                  <button
                    onMouseDown={() => (keysRef.current.forward = true)}
                    onMouseUp={() => (keysRef.current.forward = false)}
                    onMouseLeave={() => (keysRef.current.forward = false)}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      keysRef.current.forward = true;
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      keysRef.current.forward = false;
                    }}
                    className="w-20 h-14 sm:w-24 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-green-500 to-teal-400 active:from-emerald-400 active:to-yellow-300 text-emerald-950 font-black flex flex-col items-center justify-center shadow-2xl border-2 border-emerald-200 cursor-pointer select-none transition-transform active:scale-95"
                    title="دواسة الوقود - انطلق!"
                  >
                    <ArrowUp className="w-6 h-6 stroke-[3]" />
                    <span className="text-xs font-black">انطلق! 🏎️</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VICTORY & FINISHED SCREEN */}
          {gameState === 'finished' && (
            <div className="max-w-md w-full mx-auto p-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-amber-950 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/40 animate-bounce">
                🏆
              </div>

              <div>
                <h3 className="text-3xl font-black text-amber-300">ألف مبروك! المركز الأول! 🌟</h3>
                <p className="text-xs text-purple-200 mt-1">
                  أنهيت السباق وحققت 3 لفات رائعة وحصلت على وسام بطل الحلبة الخارق!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-around">
                <div>
                  <span className="text-[11px] text-purple-300 block font-bold">النجوم المكتسبة</span>
                  <span className="text-xl font-black text-amber-400">+60 ⭐</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <span className="text-[11px] text-purple-300 block font-bold">النجوم المجمعة بالحلبة</span>
                  <span className="text-xl font-black text-yellow-300">{coinsCollected} ⭐</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setGameState('menu')}
                  className="flex-1 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>تغيير لون السيارة</span>
                </button>
                <button
                  onClick={startRace}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-amber-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>سباق جديد 🏎️💨</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
