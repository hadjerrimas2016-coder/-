import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AppMode, Story } from '../types';
import {
  X,
  Trophy,
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  Lock,
  Gift,
  Play,
  Star,
  Flame,
  Rotate3d,
  Layers,
  Award,
  BookOpen,
  Calendar,
  Compass,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  playSparkleSound,
  playFanfareSound,
  playPopSound,
  playClickSound
} from '../utils/audio';

interface ChallengesMapModalProps {
  mode: AppMode;
  onClose: () => void;
  onSelectStoryById?: (id: string) => void;
  starsCount?: number;
  onEarnStars?: (amount: number, reason?: string) => void;
  stories?: Story[];
}

interface MapNode {
  id: string;
  name: string;
  subtitle: string;
  type: 'story' | 'video' | 'daily' | 'new_story' | 'chest';
  status: 'completed' | 'current' | 'available' | 'locked';
  icon: string;
  badge: string;
  rewardStars: number;
  storyId?: string;
  x: number;
  y: number;
  z: number;
}

export const ChallengesMapModal: React.FC<ChallengesMapModalProps> = ({
  mode,
  onClose,
  onSelectStoryById,
  starsCount = 320,
  onEarnStars,
  stories = [],
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activeNode, setActiveNode] = useState<MapNode | null>(null);
  const [showMysteryChest, setShowMysteryChest] = useState<boolean>(false);
  const [chestOpened, setChestOpened] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'daily' | 'completed'>('all');

  // Daily Tasks state matching Screenshot 1
  const [dailyTasks, setDailyTasks] = useState([
    { id: 'task-read', title: 'اقرأ 20 دقيقة', icon: '📖', completed: true, points: 30 },
    { id: 'task-listen', title: 'استمع لقصة', icon: '🎧', completed: true, points: 25 },
    { id: 'task-activity', title: 'أكمل النشاط', icon: '🧩', completed: false, points: 20 },
    { id: 'task-stars', title: 'اجمع 3 نجوم', icon: '⭐', completed: false, points: 15 },
  ]);

  // Waypoints on the 3D map matching Screenshot 1
  const mapNodes: MapNode[] = [
    {
      id: 'node-1',
      name: 'قصة مكتملة',
      subtitle: 'رحلة رائد إلى المريخ: سر الكوكب الأحمر',
      type: 'story',
      status: 'completed',
      icon: '📖',
      badge: 'قصة مكتملة ✓',
      rewardStars: 50,
      storyId: 'raed-mars',
      x: -4.5,
      y: 1.2,
      z: 0.5,
    },
    {
      id: 'node-2',
      name: 'فيديو تعليمي',
      subtitle: 'الشيف الصغير وسر حساء الخضار السحري',
      type: 'video',
      status: 'completed',
      icon: '🎬',
      badge: 'فيديو تعليمي ✓',
      rewardStars: 40,
      storyId: 'cooking-soup-magic',
      x: -1.2,
      y: 2.5,
      z: -1.5,
    },
    {
      id: 'node-3',
      name: 'مهمة اليوم',
      subtitle: 'استمع إلى قصة عن الفضاء واكتشف سر الكواكب',
      type: 'daily',
      status: 'current',
      icon: '📍',
      badge: 'مهمة اليوم 📍',
      rewardStars: 60,
      storyId: 'little-prince',
      x: -3.8,
      y: -0.6,
      z: 1.0,
    },
    {
      id: 'node-4',
      name: 'قصة جديدة',
      subtitle: 'عالم شهرزاد: سر الأميرة ونجمة الصباح',
      type: 'new_story',
      status: 'available',
      icon: '⭐',
      badge: 'قصة جديدة ⭐',
      rewardStars: 70,
      storyId: 'shahrazad-1',
      x: 1.5,
      y: -0.8,
      z: 0.2,
    },
    {
      id: 'node-5',
      name: 'صندوق مفاجآت',
      subtitle: 'كنز الأحلام: وسام ونقاط خيال إضافية',
      type: 'chest',
      status: 'available',
      icon: '🎁',
      badge: 'صندوق مفاجآت 🎁',
      rewardStars: 100,
      x: 3.5,
      y: -2.0,
      z: 2.2,
    },
  ];

  // 3D Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL as per threejs skill
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x130a2a, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3, 11);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xd9b3ff, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffdf80, 2.0);
    sunLight.position.set(5, 10, 7);
    scene.add(sunLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 3.5, 20);
    purpleLight.position.set(-4, 3, 2);
    scene.add(purpleLight);

    const goldenLight = new THREE.PointLight(0xffb703, 4.0, 15);
    goldenLight.position.set(3, -1, 3);
    scene.add(goldenLight);

    // 4. Background Starfield
    const starCount = 350;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 35;
      starPositions[i + 1] = (Math.random() - 0.5) * 30;
      starPositions[i + 2] = (Math.random() - 0.5) * 30 - 5;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.18,
      transparent: true,
      opacity: 0.8,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 5. Floating Fantasy Islands (3-12 parts procedural models matching skill guidelines)
    const islandGroup = new THREE.Group();
    scene.add(islandGroup);

    // Helper to build a magical floating island
    const createIsland = (
      x: number,
      y: number,
      z: number,
      radius: number,
      grassColor = 0x2e8b57,
      isCastleIsland = false
    ) => {
      const island = new THREE.Group();
      island.position.set(x, y, z);

      // Top grassy layer
      const topGeo = new THREE.CylinderGeometry(radius, radius * 0.9, 0.45, 16);
      const topMat = new THREE.MeshStandardMaterial({
        color: grassColor,
        roughness: 0.8,
        metalness: 0.1,
      });
      const topMesh = new THREE.Mesh(topGeo, topMat);
      island.add(topMesh);

      // Rocky underside cone
      const rockGeo = new THREE.ConeGeometry(radius * 0.92, radius * 1.5, 12);
      const rockMat = new THREE.MeshStandardMaterial({
        color: 0x4a3b32,
        roughness: 0.95,
        metalness: 0.05,
      });
      const rockMesh = new THREE.Mesh(rockGeo, rockMat);
      rockMesh.rotation.x = Math.PI;
      rockMesh.position.y = -radius * 0.75;
      island.add(rockMesh);

      // Fairy-tale Castle on highest island (matching Screenshot 1)
      if (isCastleIsland) {
        const castleGroup = new THREE.Group();
        castleGroup.position.set(0, 0.22, 0);

        // Main keep
        const keepGeo = new THREE.CylinderGeometry(0.7, 0.75, 1.4, 8);
        const keepMat = new THREE.MeshStandardMaterial({
          color: 0xf5f3ea,
          roughness: 0.5,
          metalness: 0.1,
        });
        const keep = new THREE.Mesh(keepGeo, keepMat);
        keep.position.y = 0.7;
        castleGroup.add(keep);

        // Keep spire
        const spireGeo = new THREE.ConeGeometry(0.85, 1.8, 8);
        const spireMat = new THREE.MeshStandardMaterial({
          color: 0x9333ea,
          roughness: 0.3,
          metalness: 0.4,
        });
        const spire = new THREE.Mesh(spireGeo, spireMat);
        spire.position.y = 2.1;
        castleGroup.add(spire);

        // Side towers
        const towerPositions = [
          [-0.75, -0.75],
          [0.75, -0.75],
          [0.75, 0.75],
          [-0.75, 0.75],
        ];
        towerPositions.forEach(([tx, tz]) => {
          const tGeo = new THREE.CylinderGeometry(0.3, 0.32, 1.2, 8);
          const tower = new THREE.Mesh(tGeo, keepMat);
          tower.position.set(tx, 0.6, tz);

          const roofGeo = new THREE.ConeGeometry(0.4, 0.9, 8);
          const roof = new THREE.Mesh(roofGeo, spireMat);
          roof.position.set(tx, 1.55, tz);

          castleGroup.add(tower, roof);
        });

        island.add(castleGroup);
      }

      islandGroup.add(island);
      return island;
    };

    // Construct the 5 islands matching Screenshot 1 layout
    createIsland(-4.5, 0.8, 0.5, 1.5, 0x15803d); // Island 1: Left lower
    createIsland(-1.2, 2.1, -1.5, 1.4, 0x16a34a); // Island 2: Upper center
    createIsland(-3.8, -1.0, 1.0, 1.8, 0x15803d); // Island 3: Foreground cliff with Raed
    createIsland(1.5, -1.2, 0.2, 1.6, 0x16a34a); // Island 4: Lower bridge
    createIsland(4.2, 1.8, -1.0, 2.4, 0x22c55e, true); // Island 5: Fairy Castle on right!

    // 6. Winding Illuminated Golden Star Trail (Spline connecting the 5 nodes)
    const curvePoints = mapNodes.map((n) => new THREE.Vector3(n.x, n.y, n.z));
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.08, 8, false);
    const tubeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      emissive: 0xffa200,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
    });
    const trailMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
    scene.add(trailMesh);

    // Star Trail Dots (Tiny sparkling stars along the path)
    const pathStarGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const pathStarMat = new THREE.MeshBasicMaterial({ color: 0xfff3b0 });
    const pathStarsGroup = new THREE.Group();
    for (let i = 0; i < 40; i++) {
      const pt = curve.getPoint(i / 40);
      const dot = new THREE.Mesh(pathStarGeo, pathStarMat);
      dot.position.copy(pt);
      pathStarsGroup.add(dot);
    }
    scene.add(pathStarsGroup);

    // 7. Interactive Node Meshes (Waypoints)
    const interactiveMeshes: THREE.Object3D[] = [];
    const waypointGroup = new THREE.Group();
    scene.add(waypointGroup);

    mapNodes.forEach((node) => {
      const nodeObj = new THREE.Group();
      nodeObj.position.set(node.x, node.y + 0.35, node.z);
      nodeObj.userData = { nodeId: node.id };

      // Base glowing ring
      const ringGeo = new THREE.RingGeometry(0.4, 0.55, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: node.type === 'chest' ? 0xffb703 : 0x06d6a0,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      nodeObj.add(ring);

      // Node Marker Model
      if (node.type === 'chest') {
        // Large Glowing Treasure Chest
        const chestBoxGeo = new THREE.BoxGeometry(0.8, 0.6, 0.5);
        const chestMat = new THREE.MeshStandardMaterial({
          color: 0xd97706,
          emissive: 0x92400e,
          emissiveIntensity: 0.4,
          roughness: 0.3,
          metalness: 0.7,
        });
        const chestLidGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.8, 12, 1, false, 0, Math.PI);
        const chestBox = new THREE.Mesh(chestBoxGeo, chestMat);
        chestBox.position.y = 0.3;
        const chestLid = new THREE.Mesh(chestLidGeo, chestMat);
        chestLid.rotation.z = Math.PI / 2;
        chestLid.position.y = 0.6;
        nodeObj.add(chestBox, chestLid);
      } else {
        // Star or Gem Indicator
        const gemGeo = new THREE.OctahedronGeometry(0.35, 0);
        const gemMat = new THREE.MeshStandardMaterial({
          color:
            node.status === 'completed'
              ? 0x10b981
              : node.status === 'current'
              ? 0xec4899
              : 0xf59e0b,
          emissive:
            node.status === 'completed'
              ? 0x047857
              : node.status === 'current'
              ? 0xbe185d
              : 0xb45309,
          emissiveIntensity: 0.6,
          roughness: 0.2,
          metalness: 0.6,
        });
        const gem = new THREE.Mesh(gemGeo, gemMat);
        gem.position.y = 0.45;
        nodeObj.add(gem);
      }

      waypointGroup.add(nodeObj);
      interactiveMeshes.push(nodeObj);
    });

    // 8. Mouse / Touch Raycasting for Node Selection & Drag Rotate
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      previousMousePosition = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (isDragging) {
        const deltaX = clientX - previousMousePosition.x;
        const deltaY = clientY - previousMousePosition.y;

        scene.rotation.y += deltaX * 0.005;
        scene.rotation.x = Math.max(-0.25, Math.min(0.35, scene.rotation.x + deltaY * 0.004));

        previousMousePosition = { x: clientX, y: clientY };
      }
    };

    const handlePointerUp = (e: MouseEvent | TouchEvent) => {
      isDragging = false;
    };

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes, true);

      if (intersects.length > 0) {
        // Find top group with nodeId
        let cur: THREE.Object3D | null = intersects[0].object;
        while (cur && !cur.userData?.nodeId) {
          cur = cur.parent;
        }

        if (cur?.userData?.nodeId) {
          const found = mapNodes.find((n) => n.id === cur!.userData.nodeId);
          if (found) {
            playSparkleSound();
            setActiveNode(found);
            if (found.type === 'chest') {
              setShowMysteryChest(true);
            }
          }
        }
      }
    };

    const canvasDom = renderer.domElement;
    canvasDom.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    canvasDom.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);
    canvasDom.addEventListener('click', handleClick);

    // 9. Render Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle floating animation of islands
      islandGroup.children.forEach((isl, i) => {
        isl.position.y += Math.sin(elapsedTime * 1.5 + i) * 0.0015;
      });

      // Rotating waypoints
      waypointGroup.children.forEach((wp, i) => {
        wp.rotation.y += 0.02;
      });

      // Slowly rotate starfield
      starField.rotation.y = elapsedTime * 0.015;

      renderer.render(scene, camera);
    };

    animate();

    // 10. Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    });
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      canvasDom.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      canvasDom.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      canvasDom.removeEventListener('click', handleClick);
      renderer.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      tubeGeometry.dispose();
      tubeMaterial.dispose();
    };
  }, []);

  // Handle Mystery Chest Open matching Screenshot 2
  const handleOpenChestReward = () => {
    playFanfareSound();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });
    setChestOpened(true);
    if (onEarnStars) {
      onEarnStars(50, 'صندوق المفاجآت');
    }
  };

  const handleToggleTask = (taskId: string) => {
    playClickSound();
    setDailyTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextState = !t.completed;
          if (nextState) {
            playSparkleSound();
            if (onEarnStars) onEarnStars(t.points, t.title);
          }
          return { ...t, completed: nextState };
        }
        return t;
      })
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-2xl bg-black/85 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border-2 border-purple-600/70 bg-gradient-to-b from-[#180f38] via-[#100a2b] to-[#080517] text-white my-auto max-h-[96vh] flex flex-col">
        {/* Top Header Bar matching Screenshot 1 */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 flex items-center justify-center text-xl font-black shadow-lg">
              🎯
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-purple-900/60 border border-purple-400/40 text-[10px] font-black text-amber-300">
                  خريطة 3D تفاعلية ✨
                </span>
                <span className="text-[11px] text-purple-300 font-bold">اقرأ .. اكتشف .. اجمع</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                تحديات القراءة والمهمات اليومية
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playSparkleSound();
                setShowMysteryChest(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black text-xs flex items-center gap-1.5 shadow hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Gift className="w-4 h-4" />
              <span>صندوق المفاجآت 🎁</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all active:scale-90 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body matching Screenshot 1 */}
        <div className="p-3.5 sm:p-4 overflow-y-auto space-y-4 no-scrollbar flex-grow">
          {/* Daily Mission Banner (مهمة اليوم) matching Screenshot 1 */}
          <div
            onClick={() => {
              playClickSound();
              if (onSelectStoryById) {
                onSelectStoryById('raed-mars');
                onClose();
              }
            }}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-[#2a1352] via-[#3b176e] to-[#200d42] border-2 border-purple-500/50 shadow-xl flex items-center justify-between gap-3 cursor-pointer hover:border-amber-400 transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-400/40 flex items-center justify-center text-2xl flex-shrink-0 shadow group-hover:scale-110 transition-transform">
                🪐
              </span>
              <div className="space-y-0.5">
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black inline-block">
                  مهمة اليوم &gt;
                </span>
                <h4 className="text-xs sm:text-sm font-black text-white">
                  استمع إلى قصة عن الفضاء اليوم واكتشف سر الكوكب الأحمر
                </h4>
                <p className="text-[10px] text-purple-200/80">انقر لبدء المغامرة وحصد +50 نقطة خيال ⭐</p>
              </div>
            </div>

            <ChevronLeft className="w-5 h-5 text-amber-400 group-hover:translate-x-[-3px] transition-transform flex-shrink-0" />
          </div>

          {/* 3D Map Viewport matching Screenshot 1 */}
          <div className="relative rounded-3xl overflow-hidden border-2 border-purple-500/60 bg-[#0e0722] shadow-[0_0_35px_rgba(168,85,247,0.25)] h-72 sm:h-84">
            {/* Background Canvas */}
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* 3D Navigation Overlay Tags matching Screenshot 1 */}
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 pointer-events-none">
              <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 border border-amber-400/40 text-[10px] font-black flex items-center gap-1 shadow">
                <Rotate3d className="w-3 h-3" />
                <span>حرّك الخريطة 3D للمعاينة</span>
              </span>
            </div>

            {/* Raed Character Overlay Avatar */}
            <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2 pointer-events-none">
              <div className="w-10 h-10 rounded-full border-2 border-amber-300 overflow-hidden shadow-lg bg-amber-400/20">
                <img
                  src="/assets/aistudio/Capture_d__cran_2026-10-17_165411_ea7c3f60.png"
                  alt="رائد"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 text-[11px] font-black text-amber-300">
                رائد وثعلبه في المغامرة 🦊
              </div>
            </div>

            {/* Interactive Node Buttons Overlay along the path */}
            <div className="absolute inset-0 pointer-events-none">
              {mapNodes.map((node) => (
                <div
                  key={node.id}
                  onClick={() => {
                    playSparkleSound();
                    setActiveNode(node);
                    if (node.type === 'chest') setShowMysteryChest(true);
                  }}
                  className="pointer-events-auto cursor-pointer"
                >
                  {/* Position markers can be selected via canvas raycast or direct tag clicks */}
                </div>
              ))}
            </div>
          </div>

          {/* Active Node Detail Card (When a station is clicked) */}
          {activeNode && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-amber-400/60 flex items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 font-black text-xl flex items-center justify-center flex-shrink-0">
                  {activeNode.icon}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-amber-300">{activeNode.name}</span>
                    <span className="text-[10px] text-purple-200">+{activeNode.rewardStars} ⭐</span>
                  </div>
                  <p className="text-[11px] text-white truncate">{activeNode.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {activeNode.storyId && (
                  <button
                    onClick={() => {
                      playClickSound();
                      if (onSelectStoryById && activeNode.storyId) {
                        onSelectStoryById(activeNode.storyId);
                        onClose();
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-black flex items-center gap-1 shadow cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>ابدأ</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveNode(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-purple-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Points Progress Card matching Screenshot 1 */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#1c0f38] via-[#2a1352] to-[#1c0f38] border border-purple-500/40 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-bounce">⭐</span>
                <div>
                  <span className="text-[10px] text-purple-300/80 block">نقاط خيالك</span>
                  <span className="text-lg font-black text-amber-300">{starsCount}</span>
                </div>
              </div>

              <div className="text-left">
                <span className="text-[10px] text-purple-300/80 block">للمكافأة القادمة</span>
                <span className="text-xs font-black text-white">680 ⭐</span>
              </div>
            </div>

            {/* Glowing progress bar */}
            <div className="relative w-full h-3 rounded-full bg-black/60 overflow-hidden border border-purple-500/30">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 shadow-lg shadow-purple-500/50 transition-all duration-500"
                style={{ width: `${Math.min(100, (starsCount / 680) * 100)}%` }}
              />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px]">
                ⭐
              </span>
            </div>
          </div>

          {/* Daily Tasks Section («مهام اليوم 📅») matching Screenshot 1 */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs sm:text-sm font-black text-white">مهام اليوم</h4>
              </div>
              <span className="text-[11px] text-purple-300 hover:text-white cursor-pointer font-bold">
                عرض الكل &gt;
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {dailyTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center gap-1.5 ${
                    task.completed
                      ? 'bg-purple-900/40 border-purple-400/50 text-white shadow'
                      : 'bg-white/5 border-white/10 text-purple-300 hover:bg-white/10'
                  }`}
                >
                  <span className="w-8 h-8 rounded-full bg-purple-950/80 border border-purple-400/30 flex items-center justify-center text-base">
                    {task.icon}
                  </span>
                  <span className="text-xs font-black truncate max-w-full">{task.title}</span>
                  <div className="flex items-center gap-1 text-[10px]">
                    {task.completed ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> تم
                      </span>
                    ) : (
                      <span className="text-amber-300">+{task.points} ⭐</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mystery Chest Modal Popup matching Screenshot 2 */}
        {showMysteryChest && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 backdrop-blur-xl bg-black/85 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-400 bg-gradient-to-b from-[#241147] via-[#1b0933] to-[#0d041a] text-white p-5 sm:p-6 space-y-5 text-center">
              <button
                onClick={() => {
                  playClickSound();
                  setShowMysteryChest(false);
                }}
                className="absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black border border-amber-400/40 inline-block">
                  كنز المغامرين 🎁
                </span>
                <h3 className="text-xl font-black text-amber-300">صناديق المفاجآت</h3>
                <p className="text-xs text-purple-200/80">
                  افتح الصندوق السحري واكتشف الجوائز الرائعة التي بانتظارك!
                </p>
              </div>

              {/* Glowing 3D Chest Visual matching Screenshot 2 */}
              <div className="relative py-2 flex items-center justify-center">
                <div className="relative w-36 h-36 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-purple-600/30 to-pink-500/20 border border-amber-400/50 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.4)]">
                  <span className="text-7xl animate-bounce">🎁</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-3xl pointer-events-none" />
                </div>
              </div>

              {/* 4 Mystery Cards matching Screenshot 2 */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-2xl bg-white/5 border border-purple-500/30 space-y-0.5">
                  <span className="text-lg">⭐</span>
                  <h5 className="text-xs font-black text-amber-300">50</h5>
                  <p className="text-[10px] text-purple-200">نقاط خيال</p>
                </div>

                <div className="p-2.5 rounded-2xl bg-white/5 border border-purple-500/30 space-y-0.5">
                  <span className="text-lg">🏅</span>
                  <h5 className="text-xs font-black text-white">وسام جديد</h5>
                  <p className="text-[10px] text-purple-200">مستكشف النجوم</p>
                </div>

                <div className="p-2.5 rounded-2xl bg-white/5 border border-purple-500/30 space-y-0.5">
                  <span className="text-lg">📖</span>
                  <h5 className="text-xs font-black text-white">قصة إضافية</h5>
                  <p className="text-[10px] text-purple-200">مغامرة خاصة</p>
                </div>

                <div className="p-2.5 rounded-2xl bg-white/5 border border-purple-500/30 space-y-0.5">
                  <span className="text-lg">🎨</span>
                  <h5 className="text-xs font-black text-white">إبداع فني</h5>
                  <p className="text-[10px] text-purple-200">ألوان سحرية</p>
                </div>
              </div>

              {/* Open Chest Button matching Screenshot 2 */}
              <button
                onClick={handleOpenChestReward}
                disabled={chestOpened}
                className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
                  chestOpened
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 hover:brightness-110 active:scale-95 shadow-amber-400/40'
                }`}
              >
                <Sparkles className="w-5 h-5 fill-current" />
                <span>{chestOpened ? 'تم فتح الصندوق واستلام 50 ⭐ بنجاح!' : 'افتح الصندوق ✨'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
