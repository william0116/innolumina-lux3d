import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HERO_PRODUCT_IMAGE } from '@/data/showcase';

const HERO_GLB =
  'https://qhsmodel.kujiale.com/genesis3d/inference/20261110/1b1268066ae14f9091a62236d361cfd5/results/tex_mesh/attempt-1/tex_mesh.glb';

/**
 * Hero 桌面端右侧 mini 3D 可旋转琉璃模型
 * - 自动缓慢旋转，鼠标可拖拽
 * - GLB 加载失败回退到静态图
 */
export default function MiniGlbViewer() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!mountRef.current || failed) return;
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 0.6, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // 灯光
    scene.add(new THREE.AmbientLight(0xfff4e0, 0.6));
    const key = new THREE.DirectionalLight(0xffd9a8, 1.2);
    key.position.set(3, 4, 3);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x88b8a8, 0.6);
    rim.position.set(-3, 2, -2);
    scene.add(rim);

    // 控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 2.5;
    controls.maxDistance = 6;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.6;
    controls.target.set(0, 0.3, 0);

    // 加载 GLB
    let model: THREE.Object3D | null = null;
    const loader = new GLTFLoader();
    loader.load(
      HERO_GLB,
      (gltf) => {
        model = gltf.scene;
        // 自动归一化尺寸
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = 1.6 / maxDim;
        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));
        model.position.y += 0.1;
        scene.add(model);
      },
      undefined,
      () => {
        setFailed(true);
      }
    );

    let raf = 0;
    const tick = () => {
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [failed]);

  if (failed) {
    return (
      <img
        src={HERO_PRODUCT_IMAGE}
        alt="四时物候·淡青八角琉璃匣"
        className="w-full h-full object-cover"
      />
    );
  }

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
}
