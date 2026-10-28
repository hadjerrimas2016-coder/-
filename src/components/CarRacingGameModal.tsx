import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { X, Play, RotateCcw, Trophy, Zap, Volume2, VolumeX, Sparkles, Flag, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playCorrectSound, playFanfareSound, playSparkleSound, playClickSound, playPopSound } from '../utils/audio';

interface CarRacingGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEarnStars: (amount: number) => void;
}

const CAR_COLORS = [
  { id: 'red', name: 'أحمر ناري 🏎️', hex: 0xe63946, bgClass: 'bg-red-500' },
  { id: 'blue', name: 'أزرق برقي ⚡', hex: 0x00b4d8, bgClass: 'bg-cyan-500' },
  { id: 'yellow', name: 'أصفر ذهبي ⭐', hex: 0xffb703, bgClass: 'bg-amber-400' },
  { id: 'green', name: 'أخضر نيون 🟢', hex: 0x38b000, bgClass: 'bg-emerald-500' },
  { id: 'pink', name: 'وردي ليان الساحر 🌸', hex: 0xff007f, bgClass: 'bg-pink-500' },
  { id: 'purple', name: 'بنفسجي ملكي 🟣', hex: 0x7209b7, bgClass: 'bg-purple-600' },
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
  const [position, setPosition] = useState<number>(1);
  const [coinsCollected, setCoinsCollected] = useState<number>(0);
  const [raceTime, setRaceTime] = useState<number>(0);
  const [isNitroActive, setIsNitroActive] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  // References for Three.js animation
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const carMeshRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number>(0);
  const keysRef = useRef<{ forward: boolean; backward: boolean; left: boolean; right: boolean; nitro: boolean }>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    nitro: false,
  });

  const speedRef = useRef<number>(0);
  const carPosRef = useRef<{ x: number; z: number; rotation: number }>({ x: 0, z: 20, rotation: 0 });
  const lapRef = useRef<number>(1);
  const coinsRef = useRef<number>(0);
  const checkpointPassedRef = useRef<boolean>(false);

  if (!isOpen) return null;

  const startRace = () => {
    playSparkleSound();
    setGameState('racing');
    setSpeed(0);
    setNitro(100);
    setLap(1);
    setPosition(2);
    setCoinsCollected(0);
    setRaceTime(0);
    speedRef.current = 0;
    carPosRef.current = { x: 0, z: 20, rotation: 0 };
    lapRef.current = 1;
    coinsRef.current = 0;
    checkpointPassedRef.current = false;
  };

  useEffect(() => {
    if (gameState !== 'racing' || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 500;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0d0824);
    scene.fog = new THREE.FogExp2(0x0d0824, 0.015);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 10, 35);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // 3. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff3d1, 1.2);
    dirLight.position.set(40, 60, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // 4. Ground & Race Track
    const groundGeo = new THREE.PlaneGeometry(300, 300);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a2e1d, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Oval Race Track
    const trackRadiusX = 55;
    const trackRadiusZ = 35;
    const trackWidth = 14;

    const trackShape = new THREE.Shape();
    trackShape.absellipse(0, 0, trackRadiusX + trackWidth / 2, trackRadiusZ + trackWidth / 2, 0, Math.PI * 2, false, 0);
    const trackHole = new THREE.Path();
    trackHole.absellipse(0, 0, trackRadiusX - trackWidth / 2, trackRadiusZ - trackWidth / 2, 0, Math.PI * 2, true, 0);
    trackShape.holes.push(trackHole);

    const trackGeo = new THREE.ShapeGeometry(trackShape, 64);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x24242e, roughness: 0.5 });
    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.rotation.x = -Math.PI / 2;
    trackMesh.position.y = 0.05;
    trackMesh.receiveShadow = true;
    scene.add(trackMesh);

    // Checkered Finish Line
    const finishLineGeo = new THREE.PlaneGeometry(trackWidth, 3);
    const finishLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const finishLine = new THREE.Mesh(finishLineGeo, finishLineMat);
    finishLine.rotation.x = -Math.PI / 2;
    finishLine.position.set(0, 0.08, trackRadiusZ);
    scene.add(finishLine);

    // Chequered Arch / Banner
    const archMat = new THREE.MeshStandardMaterial({ color: 0xff0055 });
    const archPillar1 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 9), archMat);
    archPillar1.position.set(-trackWidth / 2 - 1, 4.5, trackRadiusZ);
    const archPillar2 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 9), archMat);
    archPillar2.position.set(trackWidth / 2 + 1, 4.5, trackRadiusZ);
    const archBanner = new THREE.Mesh(new THREE.BoxGeometry(trackWidth + 3, 2, 0.8), new THREE.MeshStandardMaterial({ color: 0xffd166 }));
    archBanner.position.set(0, 8.5, trackRadiusZ);
    scene.add(archPillar1, archPillar2, archBanner);

    // Track Neon Borders
    const createCurbs = (radius: number, color: number) => {
      const curve = new THREE.EllipseCurve(0, 0, radius, radius * (trackRadiusZ / trackRadiusX), 0, 2 * Math.PI, false, 0);
      const points = curve.getPoints(100);
      const geometry = new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(p.x, 0.2, p.y)));
      const material = new THREE.LineBasicMaterial({ color, linewidth: 3 });
      return new THREE.Line(geometry, material);
    };
    scene.add(createCurbs(trackRadiusX + trackWidth / 2 + 0.2, 0x00f5d4));
    scene.add(createCurbs(trackRadiusX - trackWidth / 2 - 0.2, 0x7209b7));

    // Trees & Nature around the track
    for (let i = 0; i < 35; i++) {
      const angle = (i / 35) * Math.PI * 2;
      const dist = trackRadiusX + trackWidth / 2 + 10 + (i % 3) * 6;
      const tx = Math.cos(angle) * dist;
      const tz = Math.sin(angle) * (dist * 0.7);

      const treeGroup = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 4), new THREE.MeshStandardMaterial({ color: 0x582f0e }));
      trunk.position.y = 2;
      const foliage = new THREE.Mesh(new THREE.ConeGeometry(3, 6, 8), new THREE.MeshStandardMaterial({ color: 0x2d6a4f }));
      foliage.position.y = 6;
      treeGroup.add(trunk, foliage);
      treeGroup.position.set(tx, 0, tz);
      scene.add(treeGroup);
    }

    // Collectible Floating Stars
    const starsGroup = new THREE.Group();
    const starGeom = new THREE.OctahedronGeometry(1.2, 0);
    const starMat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffaa00, emissiveIntensity: 0.6 });
    const starItems: THREE.Mesh[] = [];

    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const sx = Math.cos(angle) * trackRadiusX;
      const sz = Math.sin(angle) * trackRadiusZ;
      const starMesh = new THREE.Mesh(starGeom, starMat);
      starMesh.position.set(sx, 1.8, sz);
      starsGroup.add(starMesh);
      starItems.push(starMesh);
    }
    scene.add(starsGroup);

    // 5. Build 3D Car
    const chosenColorHex = CAR_COLORS.find((c) => c.id === selectedColor)?.hex || 0xff007f;
    const carGroup = new THREE.Group();
    carMeshRef.current = carGroup;

    // Chassis / Body
    const bodyGeo = new THREE.BoxGeometry(2.4, 0.9, 4.4);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: chosenColorHex,
      roughness: 0.2,
      metalness: 0.6,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.8;
    body.castShadow = true;
    carGroup.add(body);

    // Cockpit / Cabin
    const cabinGeo = new THREE.BoxGeometry(1.9, 0.75, 2.2);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.1 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.5, -0.2);
    carGroup.add(cabin);

    // Front Windshield
    const windshieldMat = new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.7 });
    const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.65), windshieldMat);
    windshield.position.set(0, 1.5, 0.92);
    windshield.rotation.x = -Math.PI / 6;
    carGroup.add(windshield);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.45, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    const wheelRimMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9 });

    const createWheel = (x: number, y: number, z: number) => {
      const wGroup = new THREE.Group();
      const tire = new THREE.Mesh(wheelGeo, wheelMat);
      tire.rotation.z = Math.PI / 2;
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.46, 8), wheelRimMat);
      rim.rotation.z = Math.PI / 2;
      wGroup.add(tire, rim);
      wGroup.position.set(x, y, z);
      return wGroup;
    };

    carGroup.add(createWheel(1.3, 0.55, 1.3));
    carGroup.add(createWheel(-1.3, 0.55, 1.3));
    carGroup.add(createWheel(1.3, 0.55, -1.3));
    carGroup.add(createWheel(-1.3, 0.55, -1.3));

    // Rear Spoiler
    const spoilerWing = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.12, 0.6), bodyMat);
    spoilerWing.position.set(0, 1.9, -2.1);
    const spoilerPost1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.7), wheelMat);
    spoilerPost1.position.set(0.8, 1.5, -2.1);
    const spoilerPost2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.7), wheelMat);
    spoilerPost2.position.set(-0.8, 1.5, -2.1);
    carGroup.add(spoilerWing, spoilerPost1, spoilerPost2);

    // Headlights
    const lightGeo = new THREE.BoxGeometry(0.4, 0.2, 0.1);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const hl1 = new THREE.Mesh(lightGeo, lightMat);
    hl1.position.set(0.8, 0.8, 2.21);
    const hl2 = new THREE.Mesh(lightGeo, lightMat);
    hl2.position.set(-0.8, 0.8, 2.21);
    carGroup.add(hl1, hl2);

    // Nitro Thruster Flames (Hidden by default)
    const flameGeo = new THREE.ConeGeometry(0.25, 1.2, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });
    const flame1 = new THREE.Mesh(flameGeo, flameMat);
    flame1.rotation.x = -Math.PI / 2;
    flame1.position.set(0.45, 0.5, -2.7);
    const flame2 = new THREE.Mesh(flameGeo, flameMat);
    flame2.rotation.x = -Math.PI / 2;
    flame2.position.set(-0.45, 0.5, -2.7);
    flame1.visible = false;
    flame2.visible = false;
    carGroup.add(flame1, flame2);

    carGroup.position.set(0, 0, trackRadiusZ);
    scene.add(carGroup);

    // AI Rival Cars
    const rivalColors = [0x00b4d8, 0xffb703, 0x38b000];
    const rivals = rivalColors.map((col, idx) => {
      const rGroup = carGroup.clone();
      rGroup.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material === bodyMat) {
          child.material = new THREE.MeshStandardMaterial({ color: col, metalness: 0.5 });
        }
      });
      const startAngle = (idx + 1) * 0.45;
      rGroup.position.set(Math.cos(startAngle) * (trackRadiusX + (idx - 1) * 3), 0, Math.sin(startAngle) * (trackRadiusZ + (idx - 1) * 2));
      scene.add(rGroup);
      return { group: rGroup, angle: startAngle, speed: 0.007 + idx * 0.0015, laneOffset: (idx - 1) * 3.5 };
    });

    // 6. Event Listeners for Controls
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

    // 7. Animation Loop
    let clock = new THREE.Clock();
    let currentAngle = Math.PI / 2; // Start on track at finish line
    let currentRadiusOffset = 0;
    let nitroFuel = 100;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Controls & Physics
      const keys = keysRef.current;
      const maxSpeed = keys.nitro && nitroFuel > 5 ? 1.5 : 1.0;
      const accel = 0.8 * delta;
      const friction = 0.97;

      if (keys.forward) {
        speedRef.current = Math.min(maxSpeed, speedRef.current + accel);
      } else if (keys.backward) {
        speedRef.current = Math.max(-0.4, speedRef.current - accel);
      } else {
        speedRef.current *= friction;
      }

      // Nitro consumption & regeneration
      if (keys.nitro && nitroFuel > 0 && Math.abs(speedRef.current) > 0.2) {
        nitroFuel = Math.max(0, nitroFuel - 30 * delta);
        flame1.visible = true;
        flame2.visible = true;
        setIsNitroActive(true);
      } else {
        nitroFuel = Math.min(100, nitroFuel + 12 * delta);
        flame1.visible = false;
        flame2.visible = false;
        setIsNitroActive(false);
      }
      setNitro(Math.round(nitroFuel));

      // Steering
      const turnSpeed = 2.4 * delta * Math.min(1, Math.abs(speedRef.current) + 0.2);
      if (keys.left) {
        currentRadiusOffset = Math.max(-trackWidth / 2 + 1.5, currentRadiusOffset - 15 * delta);
      }
      if (keys.right) {
        currentRadiusOffset = Math.min(trackWidth / 2 - 1.5, currentRadiusOffset + 15 * delta);
      }

      // Advance car along the oval
      currentAngle += (speedRef.current * 0.45 * delta);
      if (currentAngle > Math.PI * 2) currentAngle -= Math.PI * 2;
      if (currentAngle < 0) currentAngle += Math.PI * 2;

      // Position along ellipse
      const rX = trackRadiusX + currentRadiusOffset;
      const rZ = trackRadiusZ + currentRadiusOffset * (trackRadiusZ / trackRadiusX);
      const cx = Math.cos(currentAngle) * rX;
      const cz = Math.sin(currentAngle) * rZ;

      // Tangent direction for smooth car heading
      const nextAngle = currentAngle + 0.05 * Math.sign(speedRef.current || 1);
      const nx = Math.cos(nextAngle) * rX;
      const nz = Math.sin(nextAngle) * rZ;
      const heading = Math.atan2(cx - nx, cz - nz);

      carGroup.position.set(cx, 0, cz);
      carGroup.rotation.y = heading;

      // Checkpoint and Lap Counting
      if (currentAngle > Math.PI * 0.8 && currentAngle < Math.PI * 1.2) {
        checkpointPassedRef.current = true;
      }
      if (checkpointPassedRef.current && currentAngle > Math.PI * 1.8) {
        checkpointPassedRef.current = false;
        lapRef.current += 1;
        setLap(lapRef.current);
        playCorrectSound();

        if (lapRef.current > 3) {
          // Race finished!
          setGameState('finished');
          playFanfareSound();
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          onEarnStars(50);
          return;
        }
      }

      // Rotate and collect stars
      starItems.forEach((star) => {
        star.rotation.y += 0.03;
        const dist = carGroup.position.distanceTo(star.position);
        if (dist < 3.2 && star.visible) {
          star.visible = false;
          coinsRef.current += 1;
          setCoinsCollected(coinsRef.current);
          playSparkleSound();
          onEarnStars(5);
        }
      });

      // Update AI Rivals
      rivals.forEach((rival, i) => {
        rival.angle += rival.speed;
        if (rival.angle > Math.PI * 2) rival.angle -= Math.PI * 2;
        const rx = Math.cos(rival.angle) * (trackRadiusX + rival.laneOffset);
        const rz = Math.sin(rival.angle) * (trackRadiusZ + rival.laneOffset * 0.7);
        rival.group.position.set(rx, 0, rz);

        const rNextAngle = rival.angle + 0.05;
        const rNx = Math.cos(rNextAngle) * (trackRadiusX + rival.laneOffset);
        const rNz = Math.sin(rNextAngle) * (trackRadiusZ + rival.laneOffset * 0.7);
        rival.group.rotation.y = Math.atan2(rx - rNx, rz - rNz);
      });

      // Camera Follow Behind the Car
      const camDist = 12;
      const camHeight = 6.5;
      const camX = cx + Math.sin(heading) * camDist;
      const camZ = cz + Math.cos(heading) * camDist;
      camera.position.lerp(new THREE.Vector3(camX, camHeight, camZ), 0.12);
      camera.lookAt(cx, 1.5, cz);

      // HUD values
      const kmh = Math.round(Math.abs(speedRef.current) * 160);
      setSpeed(kmh);
      setRaceTime((t) => t + delta);

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [gameState, selectedColor]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md" dir="rtl">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[720px] rounded-3xl overflow-hidden border-2 border-purple-500/50 shadow-2xl bg-gradient-to-b from-[#160a33] via-[#0d061f] to-[#080314] flex flex-col text-white">
        {/* Top Game Bar */}
        <div className="px-4 py-3 border-b border-purple-500/30 flex items-center justify-between bg-purple-950/40">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏎️</span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-300">سباق سيارات الأبطال 3D</h2>
              <p className="text-[10px] sm:text-xs text-purple-200/80">حلبة سباق مجسمة وسيارات بألوان زاهية للأطفال</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white transition-all cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Game Main Stage */}
        <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center">
          {/* Menu / Car Color Selector Screen */}
          {gameState === 'menu' && (
            <div className="max-w-md w-full mx-auto p-6 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 p-1 shadow-2xl shadow-pink-500/30 flex items-center justify-center">
                <div className="w-full h-full rounded-[22px] bg-[#120826] flex items-center justify-center text-5xl">
                  🏎️
                </div>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">اختر لون سيارتك المفضلة!</h3>
                <p className="text-xs text-purple-200/90 mt-1.5">
                  انطلق في حلبة النجوم ثلاثية الأبعاد، واستخدم النيترو للفوز بالمركز الأول 🏆
                </p>
              </div>

              {/* Color Picker Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
                          ? 'border-amber-400 bg-purple-900/60 ring-4 ring-amber-400/30 scale-105 shadow-lg'
                          : 'border-white/15 bg-white/5 hover:bg-white/10 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full ${car.bgClass} shadow-md border-2 border-white`} />
                      <span className="text-xs font-black">{car.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Start Race Button */}
              <button
                onClick={startRace}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-amber-950 font-black text-lg shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-6 h-6 fill-current" />
                <span>ابدأ السباق الآن 🏁</span>
              </button>

              <div className="text-[11px] text-purple-300/80">
                التحكم: الأسهم (↑ تسارع | ↓ فرامل | ← → انعطاف) | زر المسافة للتوربو النيترو 🚀
              </div>
            </div>
          )}

          {/* 3D Canvas Container */}
          {gameState === 'racing' && (
            <div className="relative w-full h-full">
              <div ref={containerRef} className="w-full h-full" />

              {/* HUD Overlays */}
              <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none">
                {/* Speedometer */}
                <div className="px-4 py-2.5 rounded-2xl bg-black/70 backdrop-blur-md border border-white/20 shadow-lg text-right">
                  <div className="text-[10px] text-purple-300 font-bold">السرعة</div>
                  <div className="text-2xl font-black text-amber-400 flex items-baseline gap-1">
                    <span>{speed}</span>
                    <span className="text-[10px] text-white">كم/س</span>
                  </div>
                </div>

                {/* Lap & Stars */}
                <div className="flex items-center gap-2">
                  <div className="px-3.5 py-2 rounded-2xl bg-black/70 backdrop-blur-md border border-white/20 text-center">
                    <span className="text-[10px] text-purple-300 block font-bold">اللفة</span>
                    <span className="text-base font-black text-yellow-300">{lap} / 3</span>
                  </div>
                  <div className="px-3.5 py-2 rounded-2xl bg-black/70 backdrop-blur-md border border-amber-400/40 text-center">
                    <span className="text-[10px] text-amber-300 block font-bold">النجوم</span>
                    <span className="text-base font-black text-amber-400">⭐ {coinsCollected}</span>
                  </div>
                </div>
              </div>

              {/* Nitro Gauge */}
              <div className="absolute bottom-20 sm:bottom-6 left-6 w-36 sm:w-48 bg-black/70 backdrop-blur-md p-2.5 rounded-2xl border border-cyan-400/40 shadow-lg pointer-events-none">
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

              {/* Mobile / Touch Controls */}
              <div className="sm:hidden absolute bottom-3 inset-x-3 flex items-center justify-between">
                {/* Steering */}
                <div className="flex gap-2">
                  <button
                    onTouchStart={() => (keysRef.current.left = true)}
                    onTouchEnd={() => (keysRef.current.left = false)}
                    className="w-14 h-14 rounded-2xl bg-white/20 active:bg-amber-400 active:text-amber-950 text-white flex items-center justify-center text-xl font-bold backdrop-blur border border-white/30"
                  >
                    ←
                  </button>
                  <button
                    onTouchStart={() => (keysRef.current.right = true)}
                    onTouchEnd={() => (keysRef.current.right = false)}
                    className="w-14 h-14 rounded-2xl bg-white/20 active:bg-amber-400 active:text-amber-950 text-white flex items-center justify-center text-xl font-bold backdrop-blur border border-white/30"
                  >
                    →
                  </button>
                </div>

                {/* Gas & Nitro */}
                <div className="flex gap-2">
                  <button
                    onTouchStart={() => (keysRef.current.nitro = true)}
                    onTouchEnd={() => (keysRef.current.nitro = false)}
                    className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-black text-xs flex items-center justify-center shadow-lg border border-cyan-300"
                  >
                    🚀
                  </button>
                  <button
                    onTouchStart={() => (keysRef.current.forward = true)}
                    onTouchEnd={() => (keysRef.current.forward = false)}
                    className="w-16 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-600 text-white font-black text-sm flex items-center justify-center shadow-lg border border-emerald-300"
                  >
                    تسارع 🏎️
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Victory / Finish Screen */}
          {gameState === 'finished' && (
            <div className="max-w-md w-full mx-auto p-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-amber-950 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/40">
                🏆
              </div>

              <div>
                <h3 className="text-3xl font-black text-amber-300">ألف مبروك! المركز الأول! 🌟</h3>
                <p className="text-xs text-purple-200 mt-1">
                  أنهيت السباق ببراعة وحصلت على مكافأة البطل الخارق!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-around">
                <div>
                  <span className="text-[11px] text-purple-300 block">النجوم المكتسبة</span>
                  <span className="text-xl font-black text-amber-400">+50 ⭐</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <span className="text-[11px] text-purple-300 block">النجوم المجمعة</span>
                  <span className="text-xl font-black text-yellow-300">{coinsCollected} ⭐</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setGameState('menu')}
                  className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>تغيير لون السيارة</span>
                </button>
                <button
                  onClick={startRace}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>سباق جديد 🏎️</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
