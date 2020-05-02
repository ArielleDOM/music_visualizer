// Three.js - Background Cubemap
// from https://threejsfundamentals.org/threejs/threejs-background-cubemap.html

import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r108/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r108/examples/jsm/controls/OrbitControls.js';

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});
  renderer.autoClearColor = false;

  const fov = 75;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 3;

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0, 0);
  controls.update();

  const scene = new THREE.Scene();

  {
    const color = 0xFFFFFF;
    const intensity = 1.5;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-4, 2, 0);
    scene.add(light);
     const amblight = new THREE.AmbientLight(color, 0.75);
      scene.add(amblight);
  }
  
    
    const loader = new THREE.CubeTextureLoader();
    const cmtexture = loader.load([
      'nightsky/divine_ft.jpg',
      'nightsky/divine_bk.jpg',
      'nightsky/divine_up.jpg',
      'nightsky/divine_dn.jpg',
      'nightsky/divine_rt.jpg',
      'nightsky/divine_lf.jpg',
    ]);
    scene.background = cmtexture;

  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  function makeInstance(geometry, color, x, y, z) {
    const material = new THREE.MeshPhongMaterial({color, envMap: cmtexture, envMapIntensity: 1, roughness: 0.125, metallness: 1 });

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    cube.position.x = x;
    cube.position.y = y;

    return cube;
  }

  const cubes = [
    makeInstance(geometry, 0x44aa88,  0, 2),
    makeInstance(geometry, 0x8844aa, -2, 2),
    makeInstance(geometry, 0xaa8844,  2, 2),
    makeInstance(geometry, 0x44aa88,  0, 0),
    makeInstance(geometry, 0x8844aa, -2, 0),
    makeInstance(geometry, 0xaa8844,  2, 0),
    makeInstance(geometry, 0x44aa88,  0, -2),
    makeInstance(geometry, 0x8844aa, -2, -2),
    makeInstance(geometry, 0xaa8844,  2, -2),
  ];

  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }
  

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render(time) {
    time *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    cubes.forEach((cube, ndx) => {
      const speed = 2 + ndx * .1;
      const rot = time * speed;
      cube.rotation.x = rot;
      cube.rotation.y = rot;
    });

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();





// // Three.js - Background Cubemap
// // from https://threejsfundamentals.org/threejs/threejs-background-cubemap.html


// import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/build/three.module.js';
// import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/examples/jsm/controls/OrbitControls.js';

// function main() {
//   const canvas = document.querySelector('#c');
//   const renderer = new THREE.WebGLRenderer({canvas});
//   renderer.autoClearColor = false;

//   const fov = 75;
//   const aspect = 2;  // the canvas default
//   const near = 0.1;
//   const far = 100;
//   const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
//   camera.position.z = 3;

//   const controls = new OrbitControls(camera, canvas);
//   controls.target.set(0, 0, 0);
//   controls.update();

//   const scene = new THREE.Scene();

//   {
//     const color = 0xFFFFFF;
//     const intensity = 1;
//     const light = new THREE.DirectionalLight(color, intensity);
//     light.position.set(-1, 2, 4);
//     scene.add(light);
//   }

//   const boxWidth = 1;
//   const boxHeight = 1;
//   const boxDepth = 1;
//   const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

//   function makeInstance(geometry, color, x) {
//     const material = new THREE.MeshPhongMaterial({color});

//     const cube = new THREE.Mesh(geometry, material);
//     scene.add(cube);

//     cube.position.x = x;

//     return cube;
//   }

//   const cubes = [
//     makeInstance(geometry, 0x44aa88,  0),
//     makeInstance(geometry, 0x8844aa, -2),
//     makeInstance(geometry, 0xaa8844,  2),
//   ];

//   {
//     const loader = new THREE.CubeTextureLoader();
//     const texture = loader.load([
//       'divine_ft.jpg',
//       'divine_bk.jpg',
//       'divine_up.jpg',
//       'divine_dn.jpg',
//       'divine_rt.jpg',
//       'divine_lf.jpg',

//     ]);
//     scene.background = texture;
//   }

//   function resizeRendererToDisplaySize(renderer) {
//     const canvas = renderer.domElement;
//     const width = canvas.clientWidth;
//     const height = canvas.clientHeight;
//     const needResize = canvas.width !== width || canvas.height !== height;
//     if (needResize) {
//       renderer.setSize(width, height, false);
//     }
//     return needResize;
//   }

//   function render(time) {
//     time *= 0.001;

//     if (resizeRendererToDisplaySize(renderer)) {
//       const canvas = renderer.domElement;
//       camera.aspect = canvas.clientWidth / canvas.clientHeight;
//       camera.updateProjectionMatrix();
//     }

//     cubes.forEach((cube, ndx) => {
//       const speed = 1 + ndx * .1;
//       const rot = time * speed;
//       cube.rotation.x = rot;
//       cube.rotation.y = rot;
//     });

//     renderer.render(scene, camera);

//     requestAnimationFrame(render);
//   }

//   requestAnimationFrame(render);
// }

// main();

