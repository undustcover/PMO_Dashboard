<template>
  <div ref="container" class="three-container"></div>
  <div v-if="hoveredInfo" class="tooltip" :style="{ top: tooltipPos.y + 'px', left: tooltipPos.x + 'px' }">
    <div class="tooltip-title">{{ hoveredInfo.title }}</div>
    <div v-if="hoveredInfo.details" class="tooltip-content">
      <div v-for="(val, key) in hoveredInfo.details" :key="key">
        {{ key }}: {{ val }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import { useMockData, type CountryData, type LogisticsItem } from '../composables/useMockData';

const emit = defineEmits(['select-country', 'select-logistics']);

const container = ref<HTMLElement | null>(null);
const { countries, logistics } = useMockData();

// Three.js variables
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let earthGroup: THREE.Group;
let animationId: number;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const initialCameraPos = new THREE.Vector3(0, 5, 15);

// Expose methods
defineExpose({
  resetCamera: () => {
    gsap.to(camera.position, {
      x: initialCameraPos.x,
      y: initialCameraPos.y,
      z: initialCameraPos.z,
      duration: 1.5,
      onUpdate: () => controls.update()
    });
    // Reset any highlighting
    earthGroup.children.forEach(child => {
      if (child.userData.type === 'country') child.scale.setScalar(1);
    });
  }
});

// Interaction state
const hoveredInfo = ref<{ title: string; details?: any } | null>(null);
const tooltipPos = ref({ x: 0, y: 0 });

// Constants
const EARTH_RADIUS = 5;

// Utils: LatLon to Vector3
function latLongToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));
  return new THREE.Vector3(x, y, z);
}

// Texture Generation (Procedural for now)
function createEarthTexture() {
  const textureLoader = new THREE.TextureLoader();
  // Use a reliable online texture or a placeholder
  // Using a dark themed earth map for "tech" feel
  return textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg', 
    () => {
      console.log('Texture loaded successfully');
    },
    undefined,
    (err) => {
      console.error('Error loading texture, falling back to procedural', err);
      // Fallback handled by the material color if map fails, or we could generate a canvas here
    }
  );
}

function initScene() {
  if (!container.value) return;

  // Scene
    scene = new THREE.Scene();
    // Transparent background to let CSS gradients show through
    scene.background = null; 
    // Light fog to blend earth into the light background
    scene.fog = new THREE.Fog(0xf0f4f8, 15, 40);

    // Camera
  camera = new THREE.PerspectiveCamera(45, container.value.clientWidth / container.value.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 22); // Slightly closer

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.value.appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 6;
  controls.maxDistance = 20;

  // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2); // Brighter ambient
    scene.add(ambientLight);
    
    // Main directional light (Sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
    sunLight.position.set(20, 20, 20);
    scene.add(sunLight);

    // Blue rim light for "tech" feel
    const rimLight = new THREE.DirectionalLight(0x06b6d4, 1.5);
    rimLight.position.set(-20, 10, -10);
    scene.add(rimLight);

    // Purple fill light
    const fillLight = new THREE.DirectionalLight(0x7c3aed, 0.5);
    fillLight.position.set(0, -20, 10);
    scene.add(fillLight);

  // Earth Group
  earthGroup = new THREE.Group();
  scene.add(earthGroup);

  // Earth Sphere
  const geometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
  const material = new THREE.MeshPhongMaterial({
    map: createEarthTexture(),
    color: 0xffffff, // White base
    emissive: 0x4466aa, // Blue emissive to lift shadows (Light Tech)
    emissiveIntensity: 0.3,
    specular: 0x666666, // Brighter specular
    shininess: 15,
    transparent: false,
    opacity: 1
  });
  const earth = new THREE.Mesh(geometry, material);
  earth.name = 'EARTH';
  earthGroup.add(earth);

  // Atmosphere Glow (Simplified)
  const atmosGeo = new THREE.SphereGeometry(EARTH_RADIUS * 1.05, 64, 64);
  const atmosMat = new THREE.MeshBasicMaterial({
    color: 0x66ccff, // Lighter Cyan
    transparent: true,
    opacity: 0.2, // Stronger glow
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending
  });
  const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
  earthGroup.add(atmosphere);

  // Add Country Markers
  countries.value.forEach(country => {
    addCountryMarker(country);
  });

  // Add Logistics
  logistics.value.forEach(item => {
    addLogisticsMarker(item);
  });

  // Event Listeners
  window.addEventListener('resize', onWindowResize);
  renderer.domElement.addEventListener('mousemove', onMouseMove);
  renderer.domElement.addEventListener('click', onClick);

  animate();
}

function addCountryMarker(country: CountryData) {
  const pos = latLongToVector3(country.lat, country.lon, EARTH_RADIUS);
  
  // Marker Mesh (a pin or dot)
  const geometry = new THREE.SphereGeometry(0.1, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const marker = new THREE.Mesh(geometry, material);
  marker.position.copy(pos);
  marker.userData = { type: 'country', data: country };
  
  // Pulse ring
  const ringGeo = new THREE.RingGeometry(0.12, 0.15, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide, transparent: true });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.copy(pos);
  ring.lookAt(new THREE.Vector3(0,0,0)); // Face center
  
  // Animate ring (manual simple animation in render loop or GSAP)
  gsap.to(ring.scale, {
    x: 2, y: 2, duration: 1.5, repeat: -1, yoyo: true, ease: "power1.inOut"
  });

  earthGroup.add(marker);
  earthGroup.add(ring);
}

function addLogisticsMarker(item: LogisticsItem) {
  const pos = latLongToVector3(item.currentLat, item.currentLon, EARTH_RADIUS);
  
  // Vehicle Mesh (Cube for truck, Cone for ship?)
  const geometry = item.transportType === 'truck' 
    ? new THREE.BoxGeometry(0.15, 0.15, 0.15)
    : new THREE.ConeGeometry(0.1, 0.2, 8);
    
  const color = item.type === 'rig' ? 0xffff00 : (item.type === 'equipment' ? 0x00ff00 : 0x00ffff);
  const material = new THREE.MeshLambertMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(pos);
  
  // Orient outwards
  mesh.lookAt(new THREE.Vector3(0,0,0)); // Face center
  // Rotate 180 if needed to stand on surface
  
  mesh.userData = { type: 'logistics', data: item };
  earthGroup.add(mesh);

  // TODO: Add movement animation along great circle if start/end known
  // For now, just a static marker at "current" location
}

function animate() {
  animationId = requestAnimationFrame(animate);
  controls.update();
  earthGroup.rotation.y += 0.0005; // Slow rotation
  renderer.render(scene, camera);
}

function onWindowResize() {
  if (!container.value) return;
  camera.aspect = container.value.clientWidth / container.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
}

function onMouseMove(event: MouseEvent) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(earthGroup.children);

  if (intersects.length > 0) {
    const obj = intersects[0].object;
    if (obj.userData.type === 'country') {
      document.body.style.cursor = 'pointer';
      const data = obj.userData.data as CountryData;
      hoveredInfo.value = {
        title: data.name,
        details: {
          '项目数': data.projectCount,
          '收入': data.income + '亿',
          '成本': data.cost + '亿',
          '进度': data.progress + '%'
        }
      };
      tooltipPos.value = { x: event.clientX + 10, y: event.clientY + 10 };
      // Highlight effect
      (obj as THREE.Mesh).scale.setScalar(1.5);
    } else if (obj.userData.type === 'logistics') {
      document.body.style.cursor = 'pointer';
      const data = obj.userData.data as LogisticsItem;
      hoveredInfo.value = {
        title: data.name,
        details: {
          '类型': data.type,
          '项目': data.project,
          '预计到达': data.arrivalDate
        }
      };
      tooltipPos.value = { x: event.clientX + 10, y: event.clientY + 10 };
    } else {
      document.body.style.cursor = 'default';
      hoveredInfo.value = null;
      // Reset scales (simplified, should track hovered object)
      earthGroup.children.forEach(child => {
        if (child.userData.type === 'country') child.scale.setScalar(1);
      });
    }
  } else {
    document.body.style.cursor = 'default';
    hoveredInfo.value = null;
  }
}

function onClick(event: MouseEvent) {
  if (hoveredInfo.value) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(earthGroup.children);
    if (intersects.length > 0) {
      const obj = intersects[0].object;
      if (obj.userData.type === 'country') {
        const data = obj.userData.data as CountryData;
        emit('select-country', data);
        
        // Zoom logic
        const targetPos = obj.position.clone().multiplyScalar(2); // Move camera closer in direction of country
        gsap.to(camera.position, {
          x: targetPos.x,
          y: targetPos.y,
          z: targetPos.z,
          duration: 1.5,
          onUpdate: () => controls.update()
        });
      } else if (obj.userData.type === 'logistics') {
        const data = obj.userData.data as LogisticsItem;
        emit('select-logistics', data);
      }
    }
  }
}

onMounted(() => {
  initScene();
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId);
  renderer.dispose();
  // Dispose other resources...
});
</script>

<style scoped>
.three-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: transparent;
}

.tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #00d2ff;
  pointer-events: none;
  font-size: 12px;
  z-index: 2000;
}

.tooltip-title {
  font-weight: bold;
  margin-bottom: 5px;
  color: #00d2ff;
}
</style>
