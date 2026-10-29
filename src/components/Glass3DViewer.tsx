import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Loader2, Plus, Minus } from 'lucide-react';

// 构建占位几何体（八角琉璃匣）
function buildPlaceholderGroup(group: THREE.Group, color: string) {
  const glassColor = new THREE.Color(color);

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: glassColor,
    metalness: 0,
    roughness: 0.08,
    transmission: 0.92,
    thickness: 0.4,
    ior: 1.5,
    transparent: true,
    opacity: 0.85,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1,
    attenuationColor: glassColor.clone().multiplyScalar(0.7),
    attenuationDistance: 2,
  });

  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xc4a96b,
    metalness: 0.9,
    roughness: 0.25,
    envMapIntensity: 1,
  });

  const octagonRadius = 1.2;
  const octagonGeometry = new THREE.CylinderGeometry(octagonRadius, octagonRadius, 0.1, 8);
  const base = new THREE.Mesh(octagonGeometry, glassMaterial);
  base.position.y = -0.75;
  group.add(base);

  const bodyHeight = 1.3;
  const bodyGeometry = new THREE.CylinderGeometry(octagonRadius * 0.98, octagonRadius * 0.98, bodyHeight, 8, 1, false);
  const body = new THREE.Mesh(bodyGeometry, glassMaterial);
  body.position.y = -0.05;
  group.add(body);

  const innerGeometry = new THREE.CylinderGeometry(octagonRadius * 0.8, octagonRadius * 0.82, bodyHeight * 0.9, 8, 1, false);
  const innerMaterial = new THREE.MeshPhysicalMaterial({
    color: glassColor.clone().multiplyScalar(0.6),
    metalness: 0,
    roughness: 0.15,
    transmission: 0.5,
    thickness: 0.2,
    ior: 1.4,
    transparent: true,
    opacity: 0.6,
    side: THREE.BackSide,
  });
  const inner = new THREE.Mesh(innerGeometry, innerMaterial);
  inner.position.y = -0.05;
  group.add(inner);

  const lidGeometry = new THREE.CylinderGeometry(octagonRadius * 1.05, octagonRadius * 1.02, 0.15, 8);
  const lid = new THREE.Mesh(lidGeometry, glassMaterial);
  lid.position.y = 0.65;
  group.add(lid);

  const knobGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.12, 16);
  const knob = new THREE.Mesh(knobGeometry, goldMaterial);
  knob.position.y = 0.78;
  group.add(knob);

  const rimGeometry = new THREE.TorusGeometry(octagonRadius * 1.02, 0.04, 8, 64);
  const rim = new THREE.Mesh(rimGeometry, goldMaterial);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.62;
  group.add(rim);

  const baseRimGeometry = new THREE.TorusGeometry(octagonRadius * 0.98, 0.03, 8, 64);
  const baseRim = new THREE.Mesh(baseRimGeometry, goldMaterial);
  baseRim.rotation.x = Math.PI / 2;
  baseRim.position.y = -0.7;
  group.add(baseRim);

  const reliefMaterial = new THREE.MeshPhysicalMaterial({
    color: glassColor.clone().multiplyScalar(0.5),
    metalness: 0,
    roughness: 0.1,
    transmission: 0.3,
    thickness: 0.1,
    ior: 1.5,
    transparent: true,
    opacity: 0.7,
  });

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const leafGroup = new THREE.Group();
    const leafGeometry = new THREE.SphereGeometry(0.15, 12, 8);
    leafGeometry.scale(1, 1.8, 0.3);
    const leaf1 = new THREE.Mesh(leafGeometry, reliefMaterial);
    leaf1.position.set(0, 0.2, 0);
    leafGroup.add(leaf1);
    const leaf2 = new THREE.Mesh(leafGeometry, reliefMaterial);
    leaf2.position.set(0.08, -0.05, 0);
    leaf2.rotation.z = -0.4;
    leafGroup.add(leaf2);
    const leaf3 = new THREE.Mesh(leafGeometry, reliefMaterial);
    leaf3.position.set(-0.08, -0.15, 0);
    leaf3.rotation.z = 0.3;
    leafGroup.add(leaf3);
    const faceRadius = octagonRadius * 0.92;
    leafGroup.position.x = Math.sin(angle) * faceRadius;
    leafGroup.position.z = Math.cos(angle) * faceRadius;
    leafGroup.rotation.y = -angle;
    group.add(leafGroup);
  }
}

interface Glass3DViewerProps {
  color?: string;
  autoRotate?: boolean;
  modelUrl?: string; // 新增：GLB 模型 URL，有则加载真实模型，无则展示占位几何体
}

export default function Glass3DViewer({ color = '#A8D8D0', autoRotate = true, modelUrl }: Glass3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    group: THREE.Group;
    autoRotate: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [modelReady, setModelReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#F5F0E8');

    // Camera
    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(3.5, 2.5, 4.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.8;
    controls.minDistance = 3;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xc4a96b, 0.5);
    fillLight.position.set(-5, 3, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xa8d8d0, 0.6);
    rimLight.position.set(0, 2, -6);
    scene.add(rimLight);

    // Build octagonal box (八角匣)
    const group = new THREE.Group();

    if (modelUrl) {
      // 加载真实 GLB 模型
      const loader = new GLTFLoader();
      loader.load(modelUrl, (gltf) => {
        const model = gltf.scene;
        // 自动缩放居中
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.5 / maxDim;
        model.scale.setScalar(scale);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center.multiplyScalar(scale));
        group.add(model);
        setLoading(false);
        // 触发淡入动画
        requestAnimationFrame(() => setModelReady(true));
      }, undefined, () => {
        // 加载失败，回退到占位几何体
        buildPlaceholderGroup(group, color);
        setLoading(false);
        requestAnimationFrame(() => setModelReady(true));
      });
    } else {
      // 没有模型 URL，使用占位几何体
      buildPlaceholderGroup(group, color);
      // Loading simulation
      setTimeout(() => {
        setLoading(false);
        requestAnimationFrame(() => setModelReady(true));
      }, 1200);
    }

    scene.add(group);

    // Subtle ground reflection plane
    const planeGeometry = new THREE.PlaneGeometry(10, 10);
    const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.08 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.85;
    plane.receiveShadow = true;
    scene.add(plane);

    sceneRef.current = { scene, camera, renderer, controls, group, autoRotate };

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
      group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    };
  }, [color, modelUrl]);

  // Toggle autoRotate
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.controls.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // 缩放控制
  const zoomIn = () => {
    if (sceneRef.current) {
      const camera = sceneRef.current.camera;
      camera.position.multiplyScalar(0.8);
      sceneRef.current.controls.update();
    }
  };
  const zoomOut = () => {
    if (sceneRef.current) {
      const camera = sceneRef.current.camera;
      camera.position.multiplyScalar(1.25);
      sceneRef.current.controls.update();
    }
  };

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full transition-opacity duration-700 ease-out"
        style={{ opacity: modelReady ? 1 : 0 }}
      />
      {/* 缩放控制按钮 */}
      {!loading && (
        <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-10">
          <button
            onClick={zoomIn}
            className="size-8 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors"
          >
            <Plus className="size-4" />
          </button>
          <button
            onClick={zoomOut}
            className="size-8 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors"
          >
            <Minus className="size-4" />
          </button>
        </div>
      )}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F5F0E8]/80 backdrop-blur-sm transition-opacity duration-300" style={{ opacity: loading ? 1 : 0 }}>
          <Loader2 className="size-8 text-primary animate-spin mb-3" />
          <p className="text-sm text-muted-foreground font-medium">正在生成 3D 模型...</p>
        </div>
      )}
    </div>
  );
}
