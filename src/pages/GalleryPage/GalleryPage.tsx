import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface Exhibit {
  id: string;
  workId: string;
  name: string;
  tag: string;
  glb: string;
  position: [number, number, number];
  lightColor: string;
}

const EXHIBITS: Exhibit[] = [
  {
    id: 'zhuye',
    workId: 'work-zhuye',
    name: '竹叶八角琉璃匣',
    tag: '失蜡铸造 · 72×48mm',
    glb: 'https://qhsmodel.kujiale.com/genesis3d/inference/20261110/94181c3510db441684e1487535824f67/results/tex_mesh/attempt-1/tex_mesh.glb',
    position: [-3.4, 0.55, 0.6],
    lightColor: '#d4c89a',
  },
  {
    id: 'amber',
    workId: 'work-amber',
    name: '琥珀委角琉璃匣',
    tag: '失蜡铸造 · 80×50mm',
    glb: 'https://qhsmodel.kujiale.com/genesis3d/inference/20261110/0a0b7b797f3f42cca1ea3132795a3c2c/results/tex_mesh/attempt-1/tex_mesh.glb',
    position: [-1.7, 0.55, -0.4],
    lightColor: '#ffb366',
  },
  {
    id: 'celadon',
    workId: 'work-celadon',
    name: '淡青八角琉璃匣',
    tag: '失蜡铸造 · 70×45mm',
    glb: 'https://qhsmodel.kujiale.com/genesis3d/inference/20261110/1b1268066ae14f9091a62236d361cfd5/results/tex_mesh/attempt-1/tex_mesh.glb',
    position: [0, 0.55, -1.0],
    lightColor: '#a8e0d0',
  },
  {
    id: 'begonia',
    workId: 'work-begonia',
    name: '海棠形香插花器',
    tag: '失蜡铸造 · 100×30mm',
    glb: 'https://qhsmodel.kujiale.com/genesis3d/inference/20261110/f661c5afe4354de1822265a360e20520/results/tex_mesh/attempt-1/tex_mesh.glb',
    position: [1.7, 0.55, -0.4],
    lightColor: '#f5d8b8',
  },
  {
    id: 'green',
    workId: 'work-green',
    name: '青绿琉璃组器',
    tag: '失蜡铸造 · 120×60mm',
    glb: 'https://qhsmodel.kujiale.com/genesis3d/inference/20261110/6250d2540f9c40b0928ce13a78d71b89/results/tex_mesh/attempt-1/tex_mesh.glb',
    position: [3.4, 0.55, 0.6],
    lightColor: '#9fd4a8',
  },
];

export default function GalleryPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(0);
  const [focusedWorkId, setFocusedWorkId] = useState<string | null>(null);
  const cameraGoalRef = useRef<{ pos: THREE.Vector3; target: THREE.Vector3 } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ===== 场景：深檀木底色 + 薄雾 =====
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0e0a08');
    scene.fog = new THREE.FogExp2('#0e0a08', 0.12);

    const width = container.clientWidth;
    const height = container.clientHeight;
    const isMobile = width < 640;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, isMobile ? 2.8 : 2.2, isMobile ? 13 : 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 0.7, -0.3);
    controls.minDistance = 1.2;
    controls.maxDistance = 11;
    controls.enablePan = true;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;

    // ===== 灯光：暖烛光环境 + 每盏背光 =====
    // 环境：暖白，很弱，像暗房里的余温
    scene.add(new THREE.AmbientLight(0xffe8c8, 0.35));

    // 主光：顶部暖光，像天窗
    const keyLight = new THREE.DirectionalLight(0xffd9a8, 0.8);
    keyLight.position.set(0, 6, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    // 冷色补光（青琉璃反光）
    const rimCool = new THREE.DirectionalLight(0x88b8a8, 0.3);
    rimCool.position.set(-4, 3, -4);
    scene.add(rimCool);

    // ===== 地面：深色木案几，微反光 =====
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#1f1612',
      roughness: 0.35,
      metalness: 0.4,
    });
    const floor = new THREE.Mesh(new THREE.CircleGeometry(8, 64), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // 中心一个稍亮的圆形"展台地台"
    const platformMat = new THREE.MeshStandardMaterial({
      color: '#2a1f18',
      roughness: 0.25,
      metalness: 0.5,
    });
    const platform = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.4, 0.08, 64), platformMat);
    platform.position.y = 0.04;
    platform.receiveShadow = true;
    scene.add(platform);

    // ===== 浮动光尘（像光线穿过琉璃的微尘） =====
    const dustCount = 200;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 8;
      dustPos[i * 3 + 1] = Math.random() * 3 + 0.3;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 0.5;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xffd9a8,
      size: 0.02,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // ===== 每个展品 =====
    const loader = new GLTFLoader();
    const rotators: THREE.Group[] = [];
    const groupToWorkId = new Map<THREE.Object3D, string>();

    EXHIBITS.forEach((ex) => {
      // 移动端把展品横向间距收紧
      const [px, py, pz] = ex.position;
      const pos: [number, number, number] = isMobile ? [px * 0.45, py, pz * 0.6] : [px, py, pz];
      // 展台：深色木托，比之前矮、扁、温润
      const pedestalMat = new THREE.MeshStandardMaterial({
        color: '#2a1a10',
        roughness: 0.5,
        metalness: 0.2,
      });
      const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.75, 0.85, 0.5, 32),
        pedestalMat,
      );
      pedestal.position.set(pos[0], 0.33, pos[2]);
      pedestal.castShadow = true;
      pedestal.receiveShadow = true;
      scene.add(pedestal);

      // 展台顶面：一圈暖光描边（像古铜包边）
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0xc4a060,
        metalness: 0.95,
        roughness: 0.25,
        emissive: new THREE.Color(ex.lightColor),
        emissiveIntensity: 0.35,
      });
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.015, 8, 48), rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.set(pos[0], 0.58, pos[2]);
      scene.add(rim);

      // 背光：展台后一盏暖色柔光，把琉璃打透
      const backLight = new THREE.SpotLight(
        new THREE.Color(ex.lightColor),
        12,
        9,
        Math.PI / 5,
        0.6,
        1.5,
      );
      backLight.position.set(pos[0], 2.5, pos[2] - 1.2);
      backLight.target.position.set(pos[0], 0.55, pos[2]);
      backLight.castShadow = true;
      scene.add(backLight);
      scene.add(backLight.target);

      // 顶部小射灯（强调光）
      const topSpot = new THREE.SpotLight(0xfff5e0, 3, 6, Math.PI / 7, 0.5, 1.5);
      topSpot.position.set(pos[0], 3.2, pos[2] + 0.8);
      topSpot.target.position.set(pos[0], 0.6, pos[2]);
      scene.add(topSpot);
      scene.add(topSpot.target);

      // 模型旋转组
      const group = new THREE.Group();
      group.position.set(pos[0], 0.6, pos[2]);
      scene.add(group);
      rotators.push(group);
      groupToWorkId.set(group, ex.workId);

      // 点击热区：一个看不见的圆柱，覆盖展台范围，方便点击
      const hitArea = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.2, 2.2, 16),
        new THREE.MeshBasicMaterial({ visible: false }),
      );
      hitArea.position.y = 0.5;
      group.add(hitArea);

      loader.load(ex.glb, (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 0.85 / maxDim;
        model.scale.setScalar(scale);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center.multiplyScalar(scale));
        model.traverse((o) => {
          if ((o as THREE.Mesh).isMesh) {
            o.castShadow = true;
          }
        });
        group.add(model);
        setLoaded((n) => n + 1);
      });
    });

    // ===== 点击作品：相机飞到该展品（不直接跳详情）=====
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0, downY = 0;
    const onPointerDown = (e: PointerEvent) => { downX = e.clientX; downY = e.clientY; };
    const onPointerUp = (e: PointerEvent) => {
      if (Math.abs(e.clientX - downX) > 5 || Math.abs(e.clientY - downY) > 5) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(rotators, true);
      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj && !groupToWorkId.has(obj)) obj = obj.parent;
        if (obj) {
          const workId = groupToWorkId.get(obj);
          if (workId) {
            // 找该展品的 position，相机飞到正前方 1.8m
            const ex = EXHIBITS.find((x) => x.workId === workId);
            if (ex) {
              const [px, py, pz] = ex.position;
              cameraGoalRef.current = {
                pos: new THREE.Vector3(px, 1.2, pz + 1.9),
                target: new THREE.Vector3(px, 0.7, pz),
              };
              controls.autoRotate = false;
              setFocusedWorkId(workId);
            }
          }
        }
      }
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // 监听"返回总览"按钮：相机飞回去
    const onReset = () => {
      cameraGoalRef.current = {
        pos: new THREE.Vector3(0, isMobile ? 2.8 : 2.2, isMobile ? 13 : 8.5),
        target: new THREE.Vector3(0, 0.7, -0.3),
      };
      controls.autoRotate = true;
    };
    window.addEventListener('gallery-reset-camera', onReset);

    let raf = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      rotators.forEach((g, i) => {
        g.rotation.y += 0.003 + i * 0.0008;
      });
      dust.rotation.y = t * 0.02;
      // 相机目标补间：如果有 goal，平滑过去
      const goal = cameraGoalRef.current;
      if (goal) {
        camera.position.lerp(goal.pos, 0.06);
        controls.target.lerp(goal.target, 0.06);
        // 接近目标后清除
        if (camera.position.distanceTo(goal.pos) < 0.02) {
          camera.position.copy(goal.pos);
          controls.target.copy(goal.target);
          cameraGoalRef.current = null;
        }
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('gallery-reset-camera', onReset);
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden" style={{ background: 'radial-gradient(ellipse at center, #1a120c 0%, #0e0a08 70%)' }}>
      <div ref={containerRef} className="absolute inset-0" />

      {/* 顶部 */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-5 text-[#e8d9b8]">
        <Link to="/" className="flex items-center gap-2 text-sm hover:opacity-80">
          <ArrowLeft className="h-4 w-4" /> 返回
        </Link>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-300" />
          <span className="text-sm tracking-[0.4em]">琉 璃 光 影 展 厅</span>
        </div>
        <span className="text-xs text-[#8a7a60]">
          {loaded >= 5 ? '展品全部就位' : `加载中 ${loaded}/5`}
        </span>
      </div>

      {/* 展品标签：桌面端五栏横排对齐展台，移动端竖排堆叠 */}
      {EXHIBITS.map((ex, i) => {
        const isM = typeof window !== 'undefined' && window.innerWidth < 640;
        const style: React.CSSProperties = isM
          ? {
              left: '50%',
              top: `${58 + i * 8}%`,
              transform: 'translateX(-50%)',
              width: '90%',
            }
          : {
              left: `${12 + i * 19}%`,
              top: '80%',
              transform: 'translateX(-50%)',
            };
        return (
          <div key={ex.id} className="absolute z-10 text-center" style={style}>
            <div className="text-[#e8d9b8] text-xs font-medium tracking-wide whitespace-nowrap">{ex.name}</div>
            <div className="text-[#8a7a60] text-[10px] mt-0.5 tracking-wider whitespace-nowrap">{ex.tag}</div>
          </div>
        );
      })}

      {/* 底部提示 */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 text-[#8a7a60] text-xs tracking-[0.3em]">
        {focusedWorkId ? '拖拽旋转 · 滚轮缩放 · 看清细节' : '点击展品细看 · 拖拽旋转 · 滚轮缩放 · 光自数字来'}
      </div>

      {/* 聚焦后的浮动操作按钮 */}
      {focusedWorkId && (() => {
        const ex = EXHIBITS.find((x) => x.workId === focusedWorkId);
        const downloadGLB = () => {
          if (!ex) return;
          const a = document.createElement('a');
          a.href = ex.glb;
          a.download = `${ex.id}.glb`;
          document.body.appendChild(a);
          a.click();
          a.remove();
        };
        return (
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('gallery-reset-camera'));
                setFocusedWorkId(null);
              }}
              className="px-4 py-2 rounded-full border border-[#8a7a60] text-[#e8d9b8] text-sm hover:bg-white/5"
            >
              ← 返回总览
            </button>
            <button
              onClick={downloadGLB}
              className="px-4 py-2 rounded-full border border-[#c4a060] text-[#e8d9b8] text-sm hover:bg-white/5"
            >
              下载 GLB ↓
            </button>
            <button
              onClick={() => navigate(`/preview/${focusedWorkId}`)}
              className="px-5 py-2 rounded-full bg-amber-500 text-black text-sm font-medium hover:bg-amber-400"
            >
              查看工艺校验 →
            </button>
          </div>
        );
      })()}
    </div>
  );
}
