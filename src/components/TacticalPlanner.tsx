import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// Reuse mock cases from IncidentsCases to simulate integration
const ACTIVE_CASES = [
  {
    id: 'CASE-2024-089',
    title: 'Operation Red Mist',
    location: 'Mumbai Data Center, Bandra',
    lat: 19.0596,
    lng: 72.8295,
    status: 'ACTIVE',
    objective: 'Secure Data Center Perimeter',
    terrain: 'URBAN'
  },
  {
    id: 'CASE-2024-094',
    title: 'Ghost Signal',
    location: 'Triangulating Source (Hyderabad)',
    lat: 17.3850,
    lng: 78.4867,
    status: 'ACTIVE',
    objective: 'Locate Transmitter',
    terrain: 'FOREST' 
  },
  {
    id: 'CASE-2024-091', 
    title: 'Protocol Blackout',
    location: 'Power Grid, Northern Sector',
    lat: 34.1491,
    lng: 75.0592,
    status: 'ACTIVE',
    objective: 'Restore Power Infrastructure',
    terrain: 'MOUNTAINS'
  }
];

const UNIT_COLORS: {[key: string]: number} = {
    'ALPHA TEAM': 0x00ffff, // Cyan
    'BRAVO TEAM': 0xffd700, // Gold
    'SNIPER UNIT': 0x9370db, // Purple
    'DRONE RECON': 0xffffff, // White
    'EXFIL VEHICLE': 0x32cd32, // Lime
    'HOSTILE': 0xff0000 // Red
};

interface TacticalPlannerProps {
  onClose: () => void;
}

export const TacticalPlanner: React.FC<TacticalPlannerProps> = ({ onClose }) => {
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [viewState, setViewState] = useState<'SELECT_CASE' | 'MAP_RECON' | '3D_MODEL'>('SELECT_CASE');
  const [isGenerating, setIsGenerating] = useState(false);
  const [placedUnits, setPlacedUnits] = useState<{id: number, type: string, pos: THREE.Vector3}[]>([]);
  const [selectedUnitType, setSelectedUnitType] = useState('ALPHA TEAM');
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const threeMountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const labelRendererRef = useRef<CSS2DRenderer | null>(null);
  const terrainMeshRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const controlsRef = useRef<OrbitControls | null>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const ghostMeshRef = useRef<THREE.Mesh | null>(null);
  const selectedUnitTypeRef = useRef(selectedUnitType); // Ref to access current state in event listeners

  // Sync ref with state
  useEffect(() => {
      selectedUnitTypeRef.current = selectedUnitType;
      // Update ghost color/geometry if it exists
      if (ghostMeshRef.current) {
          // Re-create geometry based on new type logic would be complex here, 
          // usually easier to handle in the render loop or mouse move, 
          // but for now let's just update material color.
          // To update geometry properly we'd need to dispose old and create new.
          // Let's defer this to the mousemove or a specific effect if needed.
          // For simplicity, we'll update color here.
          const colorHex = UNIT_COLORS[selectedUnitType];
          (ghostMeshRef.current.material as THREE.MeshStandardMaterial).color.setHex(colorHex);
          (ghostMeshRef.current.material as THREE.MeshStandardMaterial).emissive.setHex(colorHex);
      }
  }, [selectedUnitType]);

  // --- Initialize Map for MAP_RECON ---
  useEffect(() => {
    if (viewState === 'MAP_RECON' && selectedCase && mapContainerRef.current && !mapInstanceRef.current && window.L) {
      const map = window.L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        center: [selectedCase.lat, selectedCase.lng],
        zoom: 18, 
      });

      // Satellite tiles
      window.L.tileLayer('http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
      }).addTo(map);

      const icon = window.L.divIcon({
          className: 'target-marker',
          html: `<div class="w-8 h-8 border-2 border-red-500 rounded-full animate-ping"></div><div class="absolute inset-2 bg-red-500 rounded-full"></div>`,
          iconSize: [32, 32]
      });
      window.L.marker([selectedCase.lat, selectedCase.lng], { icon }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
        if (viewState !== 'MAP_RECON' && mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
    };
  }, [viewState, selectedCase]);

  const handleGenerateModel = () => {
      setIsGenerating(true);
      setTimeout(() => {
          setIsGenerating(false);
          setViewState('3D_MODEL');
      }, 2000); 
  };

  // --- Initialize Three.js Scene for 3D_MODEL ---
  useEffect(() => {
      if (viewState === '3D_MODEL' && threeMountRef.current && selectedCase) {
          // 1. Scene Setup
          const scene = new THREE.Scene();
          scene.background = new THREE.Color(0x020408); // Dark tactical background
          scene.fog = new THREE.FogExp2(0x020408, 0.012); 
          sceneRef.current = scene;

          // 2. Camera
          const camera = new THREE.PerspectiveCamera(50, threeMountRef.current.clientWidth / threeMountRef.current.clientHeight, 0.1, 1000);
          camera.position.set(0, 50, 60); 
          camera.lookAt(0, 0, 0);
          cameraRef.current = camera;

          // 3. WebGL Renderer
          const renderer = new THREE.WebGLRenderer({ antialias: true });
          renderer.setSize(threeMountRef.current.clientWidth, threeMountRef.current.clientHeight);
          renderer.shadowMap.enabled = true;
          renderer.shadowMap.type = THREE.PCFSoftShadowMap;
          threeMountRef.current.appendChild(renderer.domElement);
          rendererRef.current = renderer;

          // 4. Label Renderer (CSS2D)
          const labelRenderer = new CSS2DRenderer();
          labelRenderer.setSize(threeMountRef.current.clientWidth, threeMountRef.current.clientHeight);
          labelRenderer.domElement.style.position = 'absolute';
          labelRenderer.domElement.style.top = '0px';
          // CRITICAL FIX: Allow pointer events so OrbitControls can capture mouse drags
          labelRenderer.domElement.style.pointerEvents = 'auto'; 
          threeMountRef.current.appendChild(labelRenderer.domElement);
          labelRendererRef.current = labelRenderer;

          // 5. Lighting
          const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); 
          scene.add(ambientLight);

          const dirLight = new THREE.DirectionalLight(0xffffff, 1.2); 
          dirLight.position.set(100, 100, 50);
          dirLight.castShadow = true;
          dirLight.shadow.mapSize.width = 2048;
          dirLight.shadow.mapSize.height = 2048;
          scene.add(dirLight);

          // 6. Environment Generation
          const worldGroup = new THREE.Group();
          terrainMeshRef.current = worldGroup; 
          scene.add(worldGroup);

          // Helper: Add Label
          const addLabel = (text: string, position: THREE.Vector3) => {
              const div = document.createElement('div');
              div.className = 'tactical-label';
              div.textContent = text;
              const label = new CSS2DObject(div);
              label.position.copy(position);
              label.position.y += 4; 
              worldGroup.add(label);
          };

          const generateUrban = () => {
              // Ground - Dark asphalt base
              const groundGeo = new THREE.PlaneGeometry(300, 300);
              groundGeo.rotateX(-Math.PI / 2);
              const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
              const ground = new THREE.Mesh(groundGeo, groundMat);
              ground.receiveShadow = true;
              worldGroup.add(ground);

              const blockSize = 18;
              const streetWidth = 12;
              
              // Building Colors: Light Yellow / Beige variants
              const buildingColors = [0xf5f5dc, 0xffe4b5, 0xffebcd, 0xfaebd7]; // Beige, Moccasin, BlanchedAlmond...

              let targetPlaced = false;

              for (let x = -100; x <= 100; x += blockSize + streetWidth) {
                  for (let z = -100; z <= 100; z += blockSize + streetWidth) {
                      if (Math.random() > 0.2) {
                          const height = Math.random() * 30 + 8;
                          let color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
                          let isTarget = false;

                          // Force one target building near center
                          if (!targetPlaced && Math.abs(x) < 30 && Math.abs(z) < 30) {
                              color = 0xff0000; // RED TARGET
                              isTarget = true;
                              targetPlaced = true;
                          }

                          const buildingGeo = new THREE.BoxGeometry(blockSize, 1, blockSize);
                          const buildingMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.3 });
                          const building = new THREE.Mesh(buildingGeo, buildingMat);
                          building.position.set(x, height / 2, z);
                          building.scale.y = height;
                          building.castShadow = true;
                          building.receiveShadow = true;
                          
                          // Windows texture simulation (simple grid lines)
                          const edges = new THREE.EdgesGeometry(buildingGeo);
                          const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.2 }));
                          building.add(line);

                          worldGroup.add(building);

                          if (isTarget) {
                              addLabel("TARGET: DATA CENTER", new THREE.Vector3(x, height + 2, z));
                              // Add a beacon beam
                              const beamGeo = new THREE.CylinderGeometry(0.5, 0.5, 50, 8);
                              const beamMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.3 });
                              const beam = new THREE.Mesh(beamGeo, beamMat);
                              beam.position.set(x, height + 25, z);
                              worldGroup.add(beam);
                          } else if (Math.random() > 0.95) {
                              addLabel(`RESIDENTIAL BLK ${Math.floor(Math.random()*10)}`, new THREE.Vector3(x, height + 2, z));
                          }
                      }
                  }
              }

              // Roads (Grey)
              const lineGeo = new THREE.PlaneGeometry(300, 6);
              lineGeo.rotateX(-Math.PI / 2);
              const roadMat = new THREE.MeshStandardMaterial({ color: 0x555555 }); // Grey
              
              // X-axis roads
              for (let z = -100 + blockSize/2 + streetWidth/2; z <= 100; z += blockSize + streetWidth) {
                  const road = new THREE.Mesh(lineGeo, roadMat);
                  road.position.set(0, 0.05, z);
                  worldGroup.add(road);
                  if (Math.abs(z) < 15) addLabel("MAIN AVENUE", new THREE.Vector3(-80, 2, z));
              }
              // Z-axis roads
              for (let x = -100 + blockSize/2 + streetWidth/2; x <= 100; x += blockSize + streetWidth) {
                  const road = new THREE.Mesh(lineGeo, roadMat);
                  road.rotation.z = Math.PI / 2;
                  road.position.set(x, 0.06, 0); // Slightly higher to avoid z-fight
                  worldGroup.add(road);
              }
          };

          const generateNature = (type: 'FOREST' | 'MOUNTAINS') => {
              const width = 300;
              const segments = 100;
              const geometry = new THREE.PlaneGeometry(width, width, segments, segments);
              geometry.rotateX(-Math.PI / 2);

              const positions = geometry.attributes.position.array;
              const colors = [];
              const colorObj = new THREE.Color();

              const noise = (x: number, z: number) => {
                  return Math.sin(x * 0.04) * Math.cos(z * 0.04) * 5 + 
                         Math.sin(x * 0.01) * Math.cos(z * 0.01) * 15;
              };

              const riverPath = (z: number) => Math.sin(z * 0.02) * 40;

              for (let i = 0; i < positions.length; i += 3) {
                  const x = positions[i];
                  const z = positions[i + 2];
                  
                  let y = 0;
                  let isRiver = false;

                  if (type === 'MOUNTAINS') {
                      y = Math.abs(noise(x, z)) * 5 + Math.max(0, 60 - Math.sqrt(x*x + z*z) * 0.4); // Peak
                      
                      // Mountain Coloring: White peaks, Grey base
                      if (y > 35) colorObj.setHex(0xffffff); // White Snow
                      else if (y > 15) colorObj.setHex(0x808080); // Grey Rock
                      else colorObj.setHex(0x556b2f); // Dark Olive Base
                  } else {
                      // Forest
                      y = noise(x, z) * 1.5;
                      
                      // River Carving
                      const riverCenter = riverPath(z);
                      const distToRiver = Math.abs(x - riverCenter);
                      
                      if (distToRiver < 12) {
                          y = -3; // Water level
                          if (distToRiver < 10) {
                              colorObj.setHex(0x1e90ff); // Dodger Blue River
                              isRiver = true;
                          } else {
                              colorObj.setHex(0x8b4513); // Brown Bank
                          }
                      } else {
                          colorObj.setHex(0x228b22); // Forest Green Ground
                      }
                  }
                  
                  positions[i + 1] = y;
                  colors.push(colorObj.r, colorObj.g, colorObj.b);
              }

              geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
              geometry.computeVertexNormals();

              const material = new THREE.MeshStandardMaterial({ 
                  vertexColors: true,
                  roughness: 0.8,
                  flatShading: true 
              });
              
              const terrain = new THREE.Mesh(geometry, material);
              terrain.receiveShadow = true;
              worldGroup.add(terrain);

              // Trees (Green)
              if (type === 'FOREST' || type === 'MOUNTAINS') {
                  const treeGeo = new THREE.ConeGeometry(1.5, 6, 6);
                  treeGeo.translate(0, 3, 0);
                  const treeMat = new THREE.MeshStandardMaterial({ color: 0x006400 }); // Dark Green
                  const treeCount = type === 'FOREST' ? 1000 : 300;
                  const treeMesh = new THREE.InstancedMesh(treeGeo, treeMat, treeCount);
                  
                  const dummy = new THREE.Object3D();
                  let index = 0;
                  
                  for(let i=0; i<treeCount; i++) {
                      const tx = (Math.random() - 0.5) * 280;
                      const tz = (Math.random() - 0.5) * 280;
                      
                      let ty = 0;
                      let riverC = riverPath(tz);
                      
                      if (type === 'FOREST') {
                          ty = noise(tx, tz) * 1.5;
                          if (Math.abs(tx - riverC) < 15) continue; // Avoid river
                      } else {
                          ty = Math.abs(noise(tx, tz)) * 5 + Math.max(0, 60 - Math.sqrt(tx*tx + tz*tz) * 0.4);
                          if (ty > 25) continue; // Below snow line
                      }

                      dummy.position.set(tx, ty, tz);
                      dummy.scale.setScalar(0.7 + Math.random() * 0.8);
                      dummy.updateMatrix();
                      treeMesh.setMatrixAt(index++, dummy.matrix);
                  }
                  treeMesh.count = index;
                  treeMesh.castShadow = true;
                  treeMesh.receiveShadow = true;
                  worldGroup.add(treeMesh);
              }

              // Target Building in Nature (e.g., Hidden Base)
              if (type === 'MOUNTAINS' || type === 'FOREST') {
                  const baseGeo = new THREE.BoxGeometry(10, 6, 10);
                  const baseMat = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Red Target
                  const base = new THREE.Mesh(baseGeo, baseMat);
                  base.position.set(20, 10, 20); // Arbitrary position
                  base.castShadow = true;
                  worldGroup.add(base);
                  addLabel("TARGET: HIDDEN BUNKER", new THREE.Vector3(20, 18, 20));
              }

              if (type === 'FOREST') addLabel("RIVER DELTA", new THREE.Vector3(0, 5, 0));
              if (type === 'MOUNTAINS') addLabel("PEAK ELEVATION", new THREE.Vector3(0, 65, 0));
          };

          if (selectedCase.terrain === 'URBAN') {
              generateUrban();
          } else if (selectedCase.terrain === 'MOUNTAINS') {
              generateNature('MOUNTAINS');
          } else {
              generateNature('FOREST');
          }

          // 7. Controls - Enable Pan for Forward/Backward movement
          const controls = new OrbitControls(camera, labelRenderer.domElement); // Attach to labelRenderer to catch events
          controls.enableDamping = true;
          controls.dampingFactor = 0.05;
          controls.maxPolarAngle = Math.PI / 2.1;
          controls.minDistance = 10;
          controls.maxDistance = 200;
          controls.enablePan = true; 
          controls.screenSpacePanning = false; 
          controls.enableRotate = true; // Explicitly ensure rotation is enabled
          controlsRef.current = controls;

          // 8. Animation & Keyboard Navigation Loop
          const animate = () => {
              requestAnimationFrame(animate);
              
              // Keyboard Navigation Logic
              if (cameraRef.current && controlsRef.current) {
                  const speed = 1.2; // Movement speed
                  const rotationSpeed = 0.03; // Rotation speed for Q/E
                  const camera = cameraRef.current;
                  const controls = controlsRef.current;
                  
                  // Calculate movement direction relative to camera looking direction
                  const direction = new THREE.Vector3();
                  camera.getWorldDirection(direction);
                  direction.y = 0;
                  direction.normalize();

                  // Calculate right vector
                  const fwd = new THREE.Vector3();
                  camera.getWorldDirection(fwd);
                  fwd.y = 0; 
                  fwd.normalize();
                  const rightVec = new THREE.Vector3();
                  rightVec.crossVectors(fwd, camera.up).normalize();

                  const moveVector = new THREE.Vector3(0, 0, 0);

                  // Movement
                  if (keysPressed.current['ArrowUp'] || keysPressed.current['KeyW']) {
                      moveVector.add(fwd.multiplyScalar(speed));
                  }
                  if (keysPressed.current['ArrowDown'] || keysPressed.current['KeyS']) {
                      moveVector.add(fwd.multiplyScalar(-speed));
                  }
                  if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD']) {
                      moveVector.add(rightVec.multiplyScalar(speed)); 
                  }
                  if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA']) {
                      moveVector.add(rightVec.multiplyScalar(-speed));
                  }

                  // Rotation (Q/E)
                  // We rotate the camera position around the controls.target
                  if (keysPressed.current['KeyQ']) {
                      // Rotate left
                      const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
                      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationSpeed);
                      camera.position.copy(controls.target).add(offset);
                  }
                  if (keysPressed.current['KeyE']) {
                      // Rotate right
                      const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
                      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), -rotationSpeed);
                      camera.position.copy(controls.target).add(offset);
                  }

                  // Apply movement if any key pressed
                  if (moveVector.lengthSq() > 0) {
                      camera.position.add(moveVector);
                      controls.target.add(moveVector);
                  }
              }

              controls.update();
              renderer.render(scene, camera);
              labelRenderer.render(scene, camera);
          };
          animate();

          // 10. Helper for Unit Geometry
          const getUnitGeometry = (type: string) => {
              if (type === 'EXFIL VEHICLE') return new THREE.BoxGeometry(4, 3, 6);
              if (type === 'DRONE RECON') return new THREE.OctahedronGeometry(1.5);
              return new THREE.CylinderGeometry(0.5, 0.5, 2, 8); // Default Troops
          };

          const updateGhost = (point: THREE.Vector3, type: string) => {
              const colorHex = UNIT_COLORS[type] || 0xffffff;
              
              if (!ghostMeshRef.current) {
                  // Create ghost
                  const geo = getUnitGeometry(type);
                  // Apply offset for humanoids
                  if (type !== 'EXFIL VEHICLE' && type !== 'DRONE RECON') {
                      geo.translate(0, 1, 0); 
                  } else if (type === 'EXFIL VEHICLE') {
                      geo.translate(0, 1.5, 0);
                  }

                  const mat = new THREE.MeshStandardMaterial({ 
                      color: colorHex, 
                      transparent: true, 
                      opacity: 0.5,
                      emissive: colorHex,
                      emissiveIntensity: 0.5
                  });
                  const mesh = new THREE.Mesh(geo, mat);
                  scene.add(mesh);
                  ghostMeshRef.current = mesh;
              }

              // Update pos
              ghostMeshRef.current.position.copy(point);
              if (type === 'DRONE RECON') ghostMeshRef.current.position.y += 8; // Drones fly
              
              // Check if geometry needs update (simple check)
              // For simplicity, we just rebuild if needed or assume type doesn't change fast enough to break this in mousemove
              // A better way is to check type stored on userData
              if (ghostMeshRef.current.userData.type !== type) {
                  ghostMeshRef.current.geometry.dispose();
                  const newGeo = getUnitGeometry(type);
                  if (type !== 'EXFIL VEHICLE' && type !== 'DRONE RECON') newGeo.translate(0, 1, 0);
                  else if (type === 'EXFIL VEHICLE') newGeo.translate(0, 1.5, 0);
                  
                  ghostMeshRef.current.geometry = newGeo;
                  (ghostMeshRef.current.material as THREE.MeshStandardMaterial).color.setHex(colorHex);
                  (ghostMeshRef.current.material as THREE.MeshStandardMaterial).emissive.setHex(colorHex);
                  ghostMeshRef.current.userData.type = type;
              }
          };

          // 9. Click & Move Handlers
          const onMouseMove = (event: MouseEvent) => {
              if (!terrainMeshRef.current || !cameraRef.current) return;

              const rect = labelRenderer.domElement.getBoundingClientRect();
              mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
              mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

              raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
              
              // Raycast against terrain only
              const intersects = raycasterRef.current.intersectObjects(terrainMeshRef.current.children);

              if (intersects.length > 0) {
                  const point = intersects[0].point;
                  updateGhost(point, selectedUnitTypeRef.current);
              } else if (ghostMeshRef.current) {
                  // Hide ghost if off terrain
                  ghostMeshRef.current.position.set(0, -1000, 0); 
              }
          };

          const onMouseClick = (event: MouseEvent) => {
              if (!terrainMeshRef.current || !cameraRef.current || !sceneRef.current) return;

              // Don't place if we are dragging (simple check can be added if needed, but OrbitControls handles drag vs click mostly)
              
              raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
              const intersects = raycasterRef.current.intersectObjects(terrainMeshRef.current.children);

              if (intersects.length > 0) {
                  const point = intersects[0].point;
                  const type = selectedUnitTypeRef.current;
                  const colorHex = UNIT_COLORS[type] || 0xffffff;
                  
                  // Clone geometry logic
                  const geo = getUnitGeometry(type);
                  if (type !== 'EXFIL VEHICLE' && type !== 'DRONE RECON') geo.translate(0, 1, 0);
                  else if (type === 'EXFIL VEHICLE') geo.translate(0, 1.5, 0);

                  const mat = new THREE.MeshStandardMaterial({ 
                      color: colorHex, 
                      emissive: colorHex, 
                      emissiveIntensity: 0.8
                  });
                  
                  const unitMesh = new THREE.Mesh(geo, mat);
                  unitMesh.position.copy(point);
                  if (type === 'DRONE RECON') unitMesh.position.y += 8;

                  unitMesh.castShadow = true;
                  sceneRef.current.add(unitMesh);
                  
                  addLabel(type, unitMesh.position.clone());
                  setPlacedUnits(prev => [...prev, { id: Date.now(), type: type, pos: unitMesh.position.clone() }]);
              }
          };

          // 11. Key Event Listeners
          const onKeyDown = (e: KeyboardEvent) => {
              keysPressed.current[e.code] = true;
          };
          const onKeyUp = (e: KeyboardEvent) => {
              keysPressed.current[e.code] = false;
          };

          // Attach listeners
          labelRenderer.domElement.addEventListener('click', onMouseClick);
          labelRenderer.domElement.addEventListener('mousemove', onMouseMove);
          window.addEventListener('keydown', onKeyDown);
          window.addEventListener('keyup', onKeyUp);

          // Handle Resize
          const handleResize = () => {
              if (threeMountRef.current && cameraRef.current && rendererRef.current && labelRendererRef.current) {
                  cameraRef.current.aspect = threeMountRef.current.clientWidth / threeMountRef.current.clientHeight;
                  cameraRef.current.updateProjectionMatrix();
                  rendererRef.current.setSize(threeMountRef.current.clientWidth, threeMountRef.current.clientHeight);
                  labelRendererRef.current.setSize(threeMountRef.current.clientWidth, threeMountRef.current.clientHeight);
              }
          };
          window.addEventListener('resize', handleResize);

          return () => {
              window.removeEventListener('resize', handleResize);
              window.removeEventListener('keydown', onKeyDown);
              window.removeEventListener('keyup', onKeyUp);
              if (labelRendererRef.current) {
                  labelRendererRef.current.domElement.removeEventListener('click', onMouseClick);
                  labelRendererRef.current.domElement.removeEventListener('mousemove', onMouseMove);
                  labelRendererRef.current.domElement.remove();
              }
              if(threeMountRef.current) threeMountRef.current.innerHTML = '';
              renderer.dispose();
          };
      }
  }, [viewState]); 

  return (
    <div className="fixed inset-0 z-50 bg-[#0f0f10] flex flex-col font-sans animate-in fade-in duration-300 text-amber-500 selection:bg-amber-900 selection:text-white">
        
        {/* Header */}
        <div className="h-16 border-b border-amber-900/30 flex justify-between items-center px-6 bg-[#1a1a1a] z-20">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-900/20 rounded border border-amber-600/30">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-widest uppercase text-amber-500">Tactical Operations Planner</h1>
                    <div className="text-[10px] text-amber-700 font-mono tracking-widest">MISSION STRATEGY & DEPLOYMENT</div>
                </div>
            </div>
            <div className="flex space-x-4">
                <div className="text-right hidden md:block">
                    <div className="text-[10px] text-amber-700 font-mono">CURRENT PHASE</div>
                    <div className="text-sm font-bold text-white">{viewState.replace('_', ' ')}</div>
                </div>
                <button onClick={onClose} className="hover:text-white transition-colors uppercase text-xs tracking-wider border border-amber-900/50 px-3 py-1 rounded hover:bg-amber-900/20">Abort / Close</button>
            </div>
        </div>

        <div className="flex-grow flex overflow-hidden bg-[#121212] relative">
            
            {/* Sidebar - Case Selection / Unit Palette */}
            <div className="w-80 border-r border-amber-900/20 bg-[#161616] flex flex-col z-10">
                {viewState === '3D_MODEL' ? (
                    <div className="p-4 flex flex-col h-full">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-4 border-b border-amber-900/30 pb-2">Deployment Assets</h3>
                        <div className="space-y-2 mb-4">
                            {Object.keys(UNIT_COLORS).map(unit => (
                                <div 
                                    key={unit} 
                                    onClick={() => setSelectedUnitType(unit)}
                                    className={`p-3 rounded cursor-pointer transition-colors flex items-center justify-between border ${selectedUnitType === unit ? 'bg-amber-900/40 border-amber-500' : 'bg-[#0a0a0a] border-amber-900/30 hover:border-amber-500/50'}`}
                                >
                                    <span className={`text-xs font-bold ${selectedUnitType === unit ? 'text-white' : 'text-gray-300'}`}>{unit}</span>
                                    <div 
                                        className="w-3 h-3 rounded-full shadow-[0_0_5px_currentColor]" 
                                        style={{ backgroundColor: '#' + UNIT_COLORS[unit].toString(16).padStart(6, '0') }}
                                    ></div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-auto">
                            <h4 className="text-xs font-bold text-amber-700 mb-2">Tactics Log</h4>
                            <div className="h-32 bg-black border border-amber-900/30 p-2 font-mono text-[10px] text-amber-500/70 overflow-y-auto scrollbar-hide">
                                &gt; Terrain Mesh Generated ({selectedCase?.terrain}).<br/>
                                &gt; Color Mapping: Yellow(BLD), Blue(RVR), Green(FOR), Red(TGT).<br/>
                                {placedUnits.map(u => (
                                    <div key={u.id} style={{ color: '#' + UNIT_COLORS[u.type].toString(16).padStart(6, '0') }}>
                                        &gt; Deployed {u.type} at grid {Math.round(u.pos.x)},{Math.round(u.pos.z)}
                                    </div>
                                ))}
                                &gt; Simulation Ready.
                            </div>
                            <button onClick={() => setPlacedUnits([])} className="w-full mt-2 py-2 border border-red-900/50 text-red-500 text-xs hover:bg-red-900/10">CLEAR BOARD</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b border-amber-900/20 text-xs font-bold uppercase tracking-widest text-amber-700 bg-[#0f0f10]">Active Incidents</div>
                        <div className="flex-grow overflow-y-auto scrollbar-hide">
                            {ACTIVE_CASES.map(c => (
                                <div 
                                    key={c.id} 
                                    onClick={() => { setSelectedCase(c); setViewState('MAP_RECON'); }}
                                    className={`p-4 border-b border-amber-900/10 cursor-pointer hover:bg-amber-900/10 transition-colors ${selectedCase?.id === c.id ? 'bg-amber-900/20 border-l-4 border-l-amber-500' : ''}`}
                                >
                                    <div className="flex justify-between mb-1">
                                        <span className="font-mono text-[10px] opacity-70 text-amber-700">{c.id}</span>
                                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-red-900/30 text-red-500">{c.status}</span>
                                    </div>
                                    <div className="font-bold text-sm text-gray-200 mb-1">{c.title}</div>
                                    <div className="text-xs text-gray-500 truncate">{c.location}</div>
                                    <div className="text-[9px] text-amber-500/50 font-mono mt-1">ENV: {c.terrain}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-grow relative flex flex-col">
                
                {/* --- STATE 1: SELECT CASE --- */}
                {viewState === 'SELECT_CASE' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-80">
                        <div className="w-24 h-24 border-2 border-dashed border-amber-700 rounded-full flex items-center justify-center mb-4 animate-[spin_10s_linear_infinite]">
                            <svg className="w-10 h-10 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-amber-600 tracking-widest uppercase">Select an Incident</h2>
                        <p className="text-amber-800 text-sm font-mono mt-2">INITIATE MISSION PLANNING PROTOCOL</p>
                    </div>
                )}

                {/* --- STATE 2: MAP RECON --- */}
                {viewState === 'MAP_RECON' && (
                    <div className="absolute inset-0 flex flex-col">
                        <div className="relative flex-grow bg-black">
                            <div ref={mapContainerRef} className="absolute inset-0 z-0"></div>
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.05)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none z-10"></div>
                            
                            {/* Map UI */}
                            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur p-4 border-l-2 border-amber-500 z-20 max-w-sm">
                                <h2 className="text-white font-bold text-lg uppercase">{selectedCase.title}</h2>
                                <p className="text-amber-500 text-xs font-mono mb-2">COORD: {selectedCase.lat}, {selectedCase.lng}</p>
                                <p className="text-gray-400 text-xs">{selectedCase.objective}</p>
                            </div>

                            <button 
                                onClick={handleGenerateModel}
                                className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 px-8 rounded clip-path-polygon transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(245,158,11,0.4)] z-20 flex items-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                <span>GENERATE 3D TACTICAL MODEL</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isGenerating && (
                    <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center">
                        <div className="w-64 h-2 bg-gray-800 rounded mb-4 overflow-hidden">
                            <div className="h-full bg-amber-500 animate-[loading_2s_ease-in-out_infinite]"></div>
                        </div>
                        <div className="text-amber-500 font-mono text-sm tracking-widest animate-pulse">PROCESSING LIDAR DATA...</div>
                        <div className="text-amber-800 font-mono text-xs mt-2">RECONSTRUCTING ENVIRONMENT GEOMETRY</div>
                        <style>{`
                            @keyframes loading {
                                0% { width: 0%; transform: translateX(-100%); }
                                100% { width: 100%; transform: translateX(100%); }
                            }
                        `}</style>
                    </div>
                )}

                {/* --- STATE 3: 3D MODEL VIEW --- */}
                {viewState === '3D_MODEL' && (
                    <div className="absolute inset-0 bg-[#050a14] overflow-hidden">
                        <div ref={threeMountRef} className="w-full h-full cursor-crosshair"></div>
                        
                        {/* Overlay Controls */}
                        <div className="absolute top-4 left-4 pointer-events-none z-20">
                            <div className="bg-black/50 p-2 rounded border border-amber-500/20 text-xs font-mono text-amber-500">
                                <div className="mb-1 font-bold">MODE: DEPLOYMENT</div>
                                <div>CLICK TO PLACE: <span style={{ color: '#' + UNIT_COLORS[selectedUnitType].toString(16).padStart(6, '0') }}>{selectedUnitType}</span></div>
                                <div className="mt-2 text-[10px] text-gray-500">LEFT CLICK: PLACE UNIT | RIGHT CLICK: PAN | SCROLL: ZOOM</div>
                                <div className="mt-1 text-[10px] text-white/80 animate-pulse">
                                    ARROWS/WASD: MOVE | Q/E: ROTATE
                                </div>
                            </div>
                        </div>

                        {/* Back Button */}
                        <button 
                            onClick={() => setViewState('MAP_RECON')}
                            className="absolute top-4 right-4 z-20 px-4 py-2 bg-black/80 border border-red-500/50 text-red-400 font-mono text-xs hover:bg-red-900/30 transition-colors rounded uppercase tracking-wider flex items-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            <span>RETURN TO INTEL MAP</span>
                        </button>
                    </div>
                )}

            </div>
        </div>
    </div>
  );
};