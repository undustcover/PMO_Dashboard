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

  // Add Country Markers (Now Outlines)
  loadCountryGeoJson();

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

// GeoJSON Loading & Mesh Generation
function loadCountryGeoJson() {
  const url = 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson';
  
  fetch(url)
    .then(res => res.json())
    .then(data => {
      data.features.forEach((feature: any) => {
        // Match with our mock data
        const countryData = countries.value.find(c => 
          c.nameEn === feature.properties.name || 
          c.nameEn === feature.properties.name_long ||
          c.nameEn === feature.properties.formal_en
        );

        if (countryData) {
          createCountryMesh(feature, countryData);
        }
      });
    })
    .catch(err => console.error('Failed to load GeoJSON:', err));
}

function createCountryMesh(feature: any, countryData: CountryData) {
  const type = feature.geometry.type;
  const coords = feature.geometry.coordinates;
  
  const material = new THREE.MeshBasicMaterial({
    color: 0x0044ff,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  });

  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00d2ff });

  const processPolygon = (polygon: any[]) => {
    const shape = new THREE.Shape();
    const points3D: THREE.Vector3[] = [];
    
    polygon.forEach((ring: any[], ringIndex: number) => {
      // 2D Shape for Triangulation (Lat/Lon space)
      let currentPath: THREE.Path | THREE.Shape = shape;
      
      if (ringIndex > 0) {
         const holePath = new THREE.Path();
         shape.holes.push(holePath);
         currentPath = holePath;
      }

      ring.forEach((point: any, i: number) => {
        const [lon, lat] = point;
        if (i === 0) {
          currentPath.moveTo(lon, lat);
        } else {
          currentPath.lineTo(lon, lat);
        }
        
        // 3D Line Loop - Only add exterior ring to avoid connecting lines between rings
        if (ringIndex === 0) {
            points3D.push(latLongToVector3(lat, lon, EARTH_RADIUS * 1.002));
        }
      });
    });

    // 1. Create Mesh (Fill)
    const geometry = new THREE.ShapeGeometry(shape);
    
    // Morph to Sphere
    const posAttribute = geometry.attributes.position;
    for (let i = 0; i < posAttribute.count; i++) {
      const lon = posAttribute.getX(i);
      const lat = posAttribute.getY(i);
      const vec = latLongToVector3(lat, lon, EARTH_RADIUS * 1.001); // Slightly above earth
      posAttribute.setXYZ(i, vec.x, vec.y, vec.z);
    }
    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(geometry, material.clone());
    mesh.userData = { type: 'country', data: countryData, originalColor: 0x0044ff };
    earthGroup.add(mesh);

    const lineGeo = new THREE.BufferGeometry().setFromPoints(points3D);
    const line = new THREE.LineLoop(lineGeo, lineMaterial.clone());
    mesh.userData.outline = line; // Link outline to mesh
    earthGroup.add(line);
  };

  if (type === 'Polygon') {
    processPolygon(coords);
  } else if (type === 'MultiPolygon') {
    coords.forEach((polygon: any[]) => processPolygon(polygon));
  }
}

// Interaction state tracking
let currentHoveredCountryId: string | null = null;
let currentHoveredLogisticsId: string | null = null;

function onMouseMove(event: MouseEvent) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(earthGroup.children, true);

  let foundTarget: THREE.Object3D | null = null;

  if (intersects.length > 0) {
    for (const intersect of intersects) {
       const obj = intersect.object;
       // Ignore Earth, Atmosphere, and Outlines (if they are hit)
       if (obj.name === 'EARTH' || obj === earthGroup.children.find(c => c.userData.type === 'atmosphere')) continue;
       
       if (obj.userData.type === 'country') {
         foundTarget = obj;
         break;
       }
       if (obj.userData.parentGroup) {
         foundTarget = obj.userData.parentGroup;
         break;
       }
       if (obj.parent && obj.parent.userData.type === 'logistics') {
         foundTarget = obj.parent;
         break;
       }
    }
  }

  // Handle Country Interaction
  if (foundTarget && foundTarget.userData.type === 'country') {
    const countryData = foundTarget.userData.data as CountryData;
    
    // If new country hovered
    if (currentHoveredCountryId !== countryData.id) {
        // Reset previous if any
        if (currentHoveredCountryId) resetCountryHighlight();
        
        currentHoveredCountryId = countryData.id;
        document.body.style.cursor = 'pointer';
        
        // Highlight all parts of this country
        earthGroup.children.forEach(child => {
            if (child.userData.type === 'country' && child.userData.data.id === countryData.id) {
                // Scale up
                gsap.to(child.scale, { x: 1.02, y: 1.02, z: 1.02, duration: 0.3 });
                if (child.userData.outline) {
                    gsap.to(child.userData.outline.scale, { x: 1.02, y: 1.02, z: 1.02, duration: 0.3 });
                }
                
                // Change Color
                if (child instanceof THREE.Mesh) {
                    (child.material as THREE.MeshBasicMaterial).color.setHex(0x3388ff); // Brighter Blue
                    (child.material as THREE.MeshBasicMaterial).opacity = 0.6;
                }
            }
        });

        // Show Tooltip
        hoveredInfo.value = {
            title: countryData.name,
            details: {
            '项目数': countryData.projectCount,
            '收入': countryData.income + '亿',
            '成本': countryData.cost + '亿',
            '进度': countryData.progress + '%'
            }
        };
    }
    // Update tooltip position
    tooltipPos.value = { x: event.clientX + 15, y: event.clientY + 15 };

  } else {
    // Not hovering country
    if (currentHoveredCountryId) {
        resetCountryHighlight();
        currentHoveredCountryId = null;
        document.body.style.cursor = 'default';
        hoveredInfo.value = null;
    }
  }

  // Handle Logistics Interaction (Simplified for conflict avoidance, prioritized country if both hit? 
  // Actually loop above picks first hit. If logistics is on top, it wins. 
  // But usually logistics is small. Let's add logistics logic if not hovering country)
  
  if (foundTarget && foundTarget.userData.type === 'logistics' && !currentHoveredCountryId) {
      // Logic for logistics...
      const logisticsData = foundTarget.userData.data as LogisticsItem;
      if (currentHoveredLogisticsId !== logisticsData.id) {
          if (currentHoveredLogisticsId) resetLogisticsHighlight();
          currentHoveredLogisticsId = logisticsData.id;
          
          document.body.style.cursor = 'pointer';
          gsap.to(foundTarget.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 0.3 });
          
          hoveredInfo.value = {
            title: logisticsData.name,
            details: {
                '类型': logisticsData.type,
                '项目': logisticsData.project,
                '预计到达': logisticsData.arrivalDate
            }
          };
      }
      tooltipPos.value = { x: event.clientX + 15, y: event.clientY + 15 };
  } else {
      if (currentHoveredLogisticsId && (!foundTarget || foundTarget.userData.type !== 'logistics')) {
          resetLogisticsHighlight();
          currentHoveredLogisticsId = null;
          if (!currentHoveredCountryId) {
            document.body.style.cursor = 'default';
            hoveredInfo.value = null;
          }
      }
  }
}

function resetCountryHighlight() {
    if (!currentHoveredCountryId) return;
    
    earthGroup.children.forEach(child => {
        if (child.userData.type === 'country' && child.userData.data.id === currentHoveredCountryId) {
            // Reset Scale
            gsap.to(child.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
            if (child.userData.outline) {
                gsap.to(child.userData.outline.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
            }
            
            // Reset Color
            if (child instanceof THREE.Mesh) {
                (child.material as THREE.MeshBasicMaterial).color.setHex(child.userData.originalColor);
                (child.material as THREE.MeshBasicMaterial).opacity = 0.3;
            }
        }
    });
}

function resetLogisticsHighlight() {
    if (!currentHoveredLogisticsId) return;
    
    earthGroup.children.forEach(child => {
        // Check if it's the logistics group or part of it
        if (child.userData.type === 'logistics' && child.userData.data.id === currentHoveredLogisticsId) {
             gsap.to(child.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
        }
    });
}
function createTruckModel(color: number): THREE.Group {
  const group = new THREE.Group();
  
  // Trailer (Big box)
  const trailerGeo = new THREE.BoxGeometry(0.1, 0.1, 0.25);
  const trailerMat = new THREE.MeshPhongMaterial({ color: color });
  const trailer = new THREE.Mesh(trailerGeo, trailerMat);
  trailer.position.set(0, 0.08, -0.02);
  group.add(trailer);

  // Cab (Small box)
  const cabGeo = new THREE.BoxGeometry(0.1, 0.08, 0.08);
  const cabMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
  const cab = new THREE.Mesh(cabGeo, cabMat);
  cab.position.set(0, 0.07, 0.15); // Forward
  group.add(cab);
  
  // Wheels (4)
  const wheelGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.11, 8);
  const wheelMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
  
  const w1 = new THREE.Mesh(wheelGeo, wheelMat);
  w1.rotation.z = Math.PI/2; w1.position.set(0, 0.025, 0.12);
  group.add(w1);
  
  const w2 = new THREE.Mesh(wheelGeo, wheelMat);
  w2.rotation.z = Math.PI/2; w2.position.set(0, 0.025, -0.1);
  group.add(w2);

  return group;
}

function createShipModel(color: number): THREE.Group {
  const group = new THREE.Group();
  
  // Hull (Base) - Dark
  const hullGeo = new THREE.BoxGeometry(0.12, 0.04, 0.3);
  const hullMat = new THREE.MeshPhongMaterial({ color: 0x333333 }); 
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.position.y = 0.02;
  group.add(hull);

  // Deck - Color
  const deckGeo = new THREE.BoxGeometry(0.12, 0.04, 0.28);
  const deckMat = new THREE.MeshPhongMaterial({ color: color });
  const deck = new THREE.Mesh(deckGeo, deckMat);
  deck.position.set(0, 0.06, 0);
  group.add(deck);

  // Bridge (Rear)
  const bridgeGeo = new THREE.BoxGeometry(0.1, 0.06, 0.08);
  const bridgeMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
  const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
  bridge.position.set(0, 0.11, -0.08);
  group.add(bridge);

  // Containers
  const contGeo = new THREE.BoxGeometry(0.08, 0.04, 0.12);
  const contMat = new THREE.MeshPhongMaterial({ color: 0xff0000 });
  const cont = new THREE.Mesh(contGeo, contMat);
  cont.position.set(0, 0.1, 0.05);
  group.add(cont);

  return group;
}

function createPlaneModel(color: number): THREE.Group {
  const group = new THREE.Group();
  
  // Fuselage
  const bodyGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8);
  bodyGeo.rotateX(Math.PI / 2); // Point Z
  const bodyMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.15; 
  group.add(body);
  
  // Wings
  const wingGeo = new THREE.BoxGeometry(0.4, 0.01, 0.08);
  const wingMat = new THREE.MeshPhongMaterial({ color: color });
  const wing = new THREE.Mesh(wingGeo, wingMat);
  wing.position.set(0, 0.15, 0.05);
  group.add(wing);
  
  // Tail
  const tailGeo = new THREE.BoxGeometry(0.12, 0.01, 0.05);
  const tail = new THREE.Mesh(tailGeo, wingMat);
  tail.position.set(0, 0.15, -0.12);
  group.add(tail);
  
  const vTailGeo = new THREE.BoxGeometry(0.01, 0.08, 0.05);
  const vTail = new THREE.Mesh(vTailGeo, wingMat);
  vTail.position.set(0, 0.19, -0.12);
  group.add(vTail);

  return group;
}

function createTrainModel(color: number): THREE.Group {
  const group = new THREE.Group();
  
  // Locomotive
  const locoGeo = new THREE.BoxGeometry(0.08, 0.08, 0.12);
  const locoMat = new THREE.MeshPhongMaterial({ color: color });
  const loco = new THREE.Mesh(locoGeo, locoMat);
  loco.position.set(0, 0.06, 0.1);
  group.add(loco);
  
  // Car
  const carGeo = new THREE.BoxGeometry(0.08, 0.07, 0.15);
  const carMat = new THREE.MeshPhongMaterial({ color: 0xcccccc });
  const car = new THREE.Mesh(carGeo, carMat);
  car.position.set(0, 0.055, -0.05);
  group.add(car);
  
  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.09, 8);
  const wheelMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
  
  for(let i=0; i<3; i++) {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI/2;
      w.position.set(0, 0.02, 0.12 - i*0.1);
      group.add(w);
  }

  return group;
}

function createTransportPath(start: THREE.Vector3, end: THREE.Vector3, color: number, type: 'truck' | 'ship' | 'plane' | 'train', waypoints?: THREE.Vector3[]) {
  const points: THREE.Vector3[] = [];
  
  if (waypoints && waypoints.length > 0) {
    // Multi-segment path
    const allPoints = [start, ...waypoints, end];
    
    for (let i = 0; i < allPoints.length - 1; i++) {
      const p1 = allPoints[i];
      const p2 = allPoints[i+1];
      const segmentPoints = 10; // Points per segment
      
      for (let j = 0; j < segmentPoints; j++) { // Don't include last point to avoid dupes, except very last
        if (i > 0 && j === 0) continue; // Skip first point of segment if not first segment

        const t = j / segmentPoints;
        const p = new THREE.Vector3().copy(p1).lerp(p2, t).normalize();
        p.multiplyScalar(EARTH_RADIUS * 1.01); // Sea level
        points.push(p);
      }
    }
    points.push(end.clone().normalize().multiplyScalar(EARTH_RADIUS * 1.01));

  } else {
    // Direct Great Circle
    const numControlPoints = 20; 
    points.push(start.clone());
    
    for (let i = 1; i < numControlPoints; i++) {
      const t = i / numControlPoints;
      const p = new THREE.Vector3().copy(start).lerp(end, t).normalize();
      
      let altitude = EARTH_RADIUS * 1.01; 
      if (type === 'plane') {
        const heightFactor = Math.sin(t * Math.PI); 
        const angle = start.angleTo(end);
        const maxAltitude = EARTH_RADIUS * (1 + angle * 0.2); // Reduced from 0.4 to 0.2
        altitude = EARTH_RADIUS + heightFactor * (maxAltitude - EARTH_RADIUS);
      }
      
      p.multiplyScalar(altitude);
      points.push(p);
    }
    points.push(end.clone());
  }
  
  const curve = new THREE.CatmullRomCurve3(points);
  // Curve type centripetal to avoid loops
  curve.curveType = 'centripetal';
  
  // Differentiate visual style based on type
  let mesh: THREE.Object3D;
  
  if (type === 'truck') {
    // Highway Style: TubeGeometry (Thick solid line)
    const tubeGeo = new THREE.TubeGeometry(curve, 100, 0.03, 8, false); // Radius 0.03
    const tubeMat = new THREE.MeshLambertMaterial({
      color: color,
      transparent: true,
      opacity: 0.9
    });
    mesh = new THREE.Mesh(tubeGeo, tubeMat);
    
  } else if (type === 'train') {
    // Railway Style: Dashed Line (Tracks)
    const curvePoints = curve.getPoints(200); // More points for smooth dashing
    const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const lineMat = new THREE.LineDashedMaterial({
      color: color,
      linewidth: 1,
      scale: 1,
      dashSize: 0.1,
      gapSize: 0.1,
      transparent: true,
      opacity: 0.8
    });
    const line = new THREE.Line(geometry, lineMat);
    line.computeLineDistances(); // Required for dashed line
    mesh = line;

  } else if (type === 'ship') {
    // Ship Style: Dotted Line (Sea route)
    const curvePoints = curve.getPoints(150); 
    const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const lineMat = new THREE.LineDashedMaterial({
      color: color,
      linewidth: 1,
      scale: 1,
      dashSize: 0.05,
      gapSize: 0.1, // Sparse dots
      transparent: true,
      opacity: 0.6
    });
    const line = new THREE.Line(geometry, lineMat);
    line.computeLineDistances();
    mesh = line;

  } else {
    // Plane: Solid thin line (default)
    const curvePoints = curve.getPoints(100); 
    const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const material = new THREE.LineBasicMaterial({ 
      color: color,
      transparent: true,
      opacity: 0.5,
      linewidth: 1
    });
    mesh = new THREE.Line(geometry, material);
  }
  
  return { mesh, curve };
}

function addLogisticsMarker(item: LogisticsItem) {
  // Color & Model Selection
  let colorHex = 0xffffff;
  let model: THREE.Group;

  switch (item.transportType) {
    case 'truck':
      colorHex = 0xffa500; // Orange
      model = createTruckModel(colorHex);
      break;
    case 'ship':
      colorHex = 0x00bfff; // DeepSkyBlue
      model = createShipModel(colorHex);
      break;
    case 'plane':
      colorHex = 0x00ffff; // Cyan
      model = createPlaneModel(colorHex);
      break;
    case 'train':
      colorHex = 0x32cd32; // LimeGreen
      model = createTrainModel(colorHex);
      break;
    default:
      colorHex = 0xffffff;
      model = createTruckModel(colorHex);
  }
  
  // Attach Data for Interaction
  model.userData = { type: 'logistics', data: item };
  // Recursively attach to all children
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.userData = { parentGroup: model };
    }
  });

  // 2. Position and Path
  if (
    Number.isFinite(item.startLat) && Number.isFinite(item.startLon) && 
    Number.isFinite(item.destLat) && Number.isFinite(item.destLon)
  ) {
     const startPos = latLongToVector3(item.startLat, item.startLon, EARTH_RADIUS);
     const destPos = latLongToVector3(item.destLat, item.destLon, EARTH_RADIUS);
     
     // Convert waypoints if present
     let waypointVectors: THREE.Vector3[] | undefined = undefined;
     if (item.waypoints) {
       waypointVectors = item.waypoints.map(w => latLongToVector3(w.lat, w.lon, EARTH_RADIUS));
     }

     // Create Path
     const { mesh: pathLine, curve } = createTransportPath(startPos, destPos, colorHex, item.transportType, waypointVectors);
     earthGroup.add(pathLine);

     // Calculate position on curve
     // For complex paths, simple angle ratio is not enough. 
     // We need distance along curve.
     
     // Calculate total length
     const totalLength = curve.getLength();
     
     // Approximate current position ratio
     // Since we don't have real-time tracking along the specific path segments,
     // we can estimate 't' based on (dist start->current) / (dist start->dest)
     // BUT, for waypoint paths, 'current' might be far from the straight line.
     // Better: project current position onto the curve.
     // For visualization demo: Just use a time-based animation or static ratio?
     // User provided 'currentLat/Lon'. Let's find the closest point on curve.
     
     const currentPosSurface = latLongToVector3(item.currentLat, item.currentLon, EARTH_RADIUS);
     
     // Find t where curve.getPoint(t) is closest to currentPosSurface
     // Simple search
     let minD = Infinity;
     let bestT = 0;
     const divisions = 100;
     for (let i=0; i<=divisions; i++) {
        const t = i/divisions;
        const pt = curve.getPoint(t);
        const d = pt.distanceTo(currentPosSurface);
        if (d < minD) {
            minD = d;
            bestT = t;
        }
     }
     
     // Refine search around bestT
     const window = 1/divisions;
     for (let i=0; i<20; i++) {
        const t = Math.max(0, Math.min(1, bestT - window/2 + i*(window/20)));
        const pt = curve.getPoint(t);
        const d = pt.distanceTo(currentPosSurface);
        if (d < minD) {
            minD = d;
            bestT = t;
        }
     }

     const pointOnCurve = curve.getPoint(bestT);
     model.position.copy(pointOnCurve);
     
     // Orient along path
     const lookAtPoint = curve.getPoint(Math.min(1, bestT + 0.01));
     model.lookAt(lookAtPoint);

  } else {
    // Fallback
    const pos = latLongToVector3(item.currentLat, item.currentLon, EARTH_RADIUS);
    model.position.copy(pos);
    model.lookAt(pos.clone().multiplyScalar(2)); 
    model.position.multiplyScalar(1.02);
  }

  earthGroup.add(model);
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



function onClick(event: MouseEvent) {
  if (hoveredInfo.value) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(earthGroup.children, true);
    
    let foundTarget: THREE.Object3D | null = null;
    if (intersects.length > 0) {
        for (const intersect of intersects) {
            const obj = intersect.object;
            if (obj.userData.type === 'country') {
                foundTarget = obj;
                break;
            }
            if (obj.userData.parentGroup) {
                foundTarget = obj.userData.parentGroup;
                break;
            }
            if (obj.parent && obj.parent.userData.type === 'logistics') {
                foundTarget = obj.parent;
                break;
            }
        }
    }

    if (foundTarget) {
      const obj = foundTarget;
      if (obj.userData.type === 'country') {
        const data = obj.userData.data as CountryData;
        emit('select-country', data);
        
        // Zoom logic
        const targetPos = obj.position.clone().multiplyScalar(2); 
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
