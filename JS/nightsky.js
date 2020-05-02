// Three.js - Background Cubemap
// from https://threejsfundamentals.org/threejs/threejs-background-cubemap.html


import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r108/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r108/examples/jsm/controls/OrbitControls.js';
/*Downloaded from https://www.codeseek.co/prakhar625/audio-visualizer-solar-sys-EvEZjL */
//initialise simplex noise (replace with perlin noise in future if needed)
//initialise simplex noise instance
var noise = new SimplexNoise();
const HIGHLIGHT_COLORS = [0x4200ff, 0x00ffff, 0xff0000, 0xff00ff];
// the main visualiser function
var vizInit = function (){
  
  var file = document.getElementById("thefile");
  var audio = document.getElementById("audio");
  var fileLabel = document.querySelector("label.file");
  
  document.onload = function(e){
    console.log(e);
    audio.play();
    play();
  }
  file.onchange = function(){
    fileLabel.classList.add('normal');
    audio.classList.add('active');
    var files = this.files;
    
    audio.src = URL.createObjectURL(files[0]);
    audio.load();
    audio.play();
    play();
  }
  
function play() {
    var context = new AudioContext();
    var src = context.createMediaElementSource(audio);
    var analyser = context.createAnalyser();
    src.connect(analyser);
    analyser.connect(context.destination);
    analyser.fftSize = 512;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);

    //here comes the webgl
    var scene = new THREE.Scene();
    var group = new THREE.Group();
    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 3;

    const loader = new THREE.CubeTextureLoader();
    const cmtexture = loader.load([
        '../nightsky/divine_ft.jpg',
        '../nightsky/divine_bk.jpg',
        '../nightsky/divine_up.jpg',
        '../nightsky/divine_dn.jpg',
        '../nightsky/divine_rt.jpg',
        '../nightsky/divine_lf.jpg',
    ]);
    scene.background = cmtexture;

    const controls = new OrbitControls(camera);
    controls.target.set(0, 0, 0);
    controls.update();

    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    var planeGeometry = new THREE.PlaneGeometry(800, 800, 100, 100);
    var planeMaterial = new THREE.MeshLambertMaterial({
        color: 0x6904ce,
        envMap: cmtexture,
        envMapIntensity: .5,
        side: THREE.DoubleSide,
        // wireframe: true
    });
    var plane2Material = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      // envMap: cmtexture,
      envMapIntensity: 1,
      side: THREE.DoubleSide,
      wireframe: true
  });
    
    // var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    // plane.rotation.x = -0.5 * Math.PI;
    // plane.position.set(0, 30, 0);
    // group.add(plane);

    var plane = new THREE.Mesh(planeGeometry, plane2Material);
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.set(0, -50, 0);
    group.add(plane);
    
    var plane2 = new THREE.Mesh(planeGeometry, planeMaterial);
    plane2.rotation.x = -0.5 * Math.PI;
    plane2.position.set(0, -50, 0);
    group.add(plane2);

    var icosahedronGeometry = new THREE.IcosahedronGeometry(10, 4);
    var lambertMaterial = new THREE.MeshLambertMaterial({
        color: 0xff00ee,
        wireframe: true
    });

    // var ball = new THREE.Mesh(icosahedronGeometry, lambertMaterial);
    // ball.position.set(0, 0, 0);
    // group.add(ball);

    var ambientLight = new THREE.AmbientLight(0xaaaaaa);
    scene.add(ambientLight);

    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.intensity = 0.9;
    spotLight.position.set(-10, 40, 20);
    spotLight.lookAt(plane2);
    spotLight.castShadow = true;
    scene.add(spotLight);

    // var orbitControls = new THREE.OrbitControls(camera);
    // orbitControls.autoRotate = true;
    
    scene.add(group);

    document.getElementById('out').appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);

    render();

    function render() {
      analyser.getByteFrequencyData(dataArray);

      var lowerHalfArray = dataArray.slice(0, (dataArray.length/2) - 1);
      var upperHalfArray = dataArray.slice((dataArray.length/2) - 1, dataArray.length - 1);

      var overallAvg = avg(dataArray);
      var lowerMax = max(lowerHalfArray);
      var lowerAvg = avg(lowerHalfArray);
      var upperMax = max(upperHalfArray);
      var upperAvg = avg(upperHalfArray);

      var lowerMaxFr = lowerMax / lowerHalfArray.length;
      var lowerAvgFr = lowerAvg / lowerHalfArray.length;
      var upperMaxFr = upperMax / upperHalfArray.length;
      var upperAvgFr = upperAvg / upperHalfArray.length;

      makeRoughGround(plane, modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));
      makeRoughGround(plane2, modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));


      if(dataArray[10] > 225){
        planeMaterial.color.setHex( HIGHLIGHT_COLORS[Math.floor(Math.random() * HIGHLIGHT_COLORS.length)] )
      }
      
      // makeRoughBall(ball, modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));

      group.rotation.y += 0.000;
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function makeRoughBall(mesh, bassFr, treFr) {
        mesh.geometry.vertices.forEach(function (vertex, i) {
            var offset = mesh.geometry.parameters.radius;
            var amp = 7;
            var time = window.performance.now();
            vertex.normalize();
            var rf = 0.00001;
            var distance = (offset + bassFr ) + noise.noise3D(vertex.x + time *rf*7, vertex.y +  time*rf*8, vertex.z + time*rf*9) * amp * treFr;
            vertex.multiplyScalar(distance);
        });
        mesh.geometry.verticesNeedUpdate = true;
        mesh.geometry.normalsNeedUpdate = true;
        mesh.geometry.computeVertexNormals();
        mesh.geometry.computeFaceNormals();
    }

    function makeRoughGround(mesh, distortionFr) {
        mesh.geometry.vertices.forEach(function (vertex, i) {
            var amp = 2;
            var time = Date.now();
            var distance = (noise.noise2D(vertex.x + time * 0.0003, vertex.y + time * 0.0001) + 0) * distortionFr * amp;
            vertex.z = distance;
        });
        mesh.geometry.verticesNeedUpdate = true;
        mesh.geometry.normalsNeedUpdate = true;
        mesh.geometry.computeVertexNormals();
        mesh.geometry.computeFaceNormals();
    }

    audio.play();
  };
}

window.onload = vizInit();

document.body.addEventListener('touchend', function(ev) { context.resume(); });




//some helper functions here
function fractionate(val, minVal, maxVal) {
    return (val - minVal)/(maxVal - minVal);
}

function modulate(val, minVal, maxVal, outMin, outMax) {
    var fr = fractionate(val, minVal, maxVal);
    var delta = outMax - outMin;
    return outMin + (fr * delta);
}

function avg(arr){
    var total = arr.reduce(function(sum, b) { return sum + b; });
    return (total / arr.length);
}

function max(arr){
    return arr.reduce(function(a, b){ return Math.max(a, b); })
}



// import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r108/build/three.module.js';
// import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r108/examples/jsm/controls/OrbitControls.js';

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
//     const intensity = 1.5;
//     const light = new THREE.DirectionalLight(color, intensity);
//     light.position.set(-4, 2, 0);
//     scene.add(light);
//      const amblight = new THREE.AmbientLight(color, 0.75);
//       scene.add(amblight);
//   }
  
    
//     const loader = new THREE.CubeTextureLoader();
//     const cmtexture = loader.load([
//       'nightsky/divine_ft.jpg',
//       'nightsky/divine_bk.jpg',
//       'nightsky/divine_up.jpg',
//       'nightsky/divine_dn.jpg',
//       'nightsky/divine_rt.jpg',
//       'nightsky/divine_lf.jpg',
//     ]);
//     scene.background = cmtexture;

//   const boxWidth = 1;
//   const boxHeight = 1;
//   const boxDepth = 1;
//   const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

//   function makeInstance(geometry, color, x, y, z) {
//     const material = new THREE.MeshPhongMaterial({color, envMap: cmtexture, envMapIntensity: 1, roughness: 0.125, metallness: 1 });

//     const cube = new THREE.Mesh(geometry, material);
//     scene.add(cube);

//     cube.position.x = x;
//     cube.position.y = y;

//     return cube;
//   }

//   const cubes = [
//     makeInstance(geometry, 0x44aa88,  0, 2),
//     makeInstance(geometry, 0x8844aa, -2, 2),
//     makeInstance(geometry, 0xaa8844,  2, 2),
//     makeInstance(geometry, 0x44aa88,  0, 0),
//     makeInstance(geometry, 0x8844aa, -2, 0),
//     makeInstance(geometry, 0xaa8844,  2, 0),
//     makeInstance(geometry, 0x44aa88,  0, -2),
//     makeInstance(geometry, 0x8844aa, -2, -2),
//     makeInstance(geometry, 0xaa8844,  2, -2),
//   ];

//   {
//     const color = 0xFFFFFF;
//     const intensity = 1;
//     const light = new THREE.DirectionalLight(color, intensity);
//     light.position.set(-1, 2, 4);
//     scene.add(light);
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
//       const speed = 2 + ndx * .1;
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

