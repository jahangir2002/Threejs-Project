import './style.css';
import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import gsap from 'gsap';
import LocomotiveScroll from 'locomotive-scroll';

const locomotiveScroll = new LocomotiveScroll();


// Scene
const scene = new THREE.Scene();
// Camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 6;

// HDRI Environment
const rgbeLoader = new RGBELoader();
rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr', function(texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
  // scene.background = texture;
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
  alpha: true, // to make the background transparent
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// Post Processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.00025;
composer.addPass(rgbShiftPass);

// Controls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.025; // The dampingFactor is a parameter commonly used in physics simulations and animations to control the "smoothness" of a transition

window.addEventListener('mousemove', (e) => {

  if (model) { 
    const rotationX = (e.clientX / window.innerWidth - 0.5) * Math.PI * .10; // to get the mouse position and set the rotation of the model
    const rotationY = (e.clientY / window.innerHeight - 0.5) * Math.PI * .10; 
    gsap.to(model.rotation, {
      x: rotationY,
      y: rotationX,
      z: 0,
      duration: 0.5,
      ease: "power2.out"
    }); // Smoothly animate rotation with GSAP

    // model.rotation.y = rotationX; // to set the rotation of the model
    // model.rotation.x = rotationY; // to set the rotation of the model

  }

  
});

// responsive more like 
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight); // to update the renderer size
  camera.aspect = window.innerWidth / window.innerHeight; // to update the camera aspect ratio
  camera.updateProjectionMatrix(); // to update the camera aspect ratio
});

function animate() {
  window.requestAnimationFrame(animate);
  // controls.update(); // to make the camera move smoothly
  
  if (model) {
    // model.rotation.y += 0.005;
  }
  
  composer.render();
}

animate();