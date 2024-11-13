import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

// Scene
const scene = new THREE.Scene();
// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 5;

// HDRI Environment
const rgbeLoader = new RGBELoader();
rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr', function(texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
  scene.background = texture;
});

// GLTF Loader
const loader = new GLTFLoader();
let model;

loader.load('./DamagedHelmet.gltf', (gltf) => {
  model = gltf.scene;
  scene.add(model);
  model.position.set(0, 0, 0);
  model.scale.set(2, 2, 2);
}, undefined, (error) => {
  console.error('An error occurred loading the model:', error);
});

// Renderer
const renderer = new THREE.WebGLRenderer({ 
  canvas: document.querySelector("#canvas"),
  antialias: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // to get great performance without secrificing resorces
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping; // to get a better look
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // to make the camera move smoothly

// render
renderer.render(scene, camera);

function animate() {
  window.requestAnimationFrame(animate); // to render the scene continuously
  controls.update();
  
  if (model) {
    model.rotation.y += 0.005;
  }
  
  renderer.render(scene, camera);
}

animate();