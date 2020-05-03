import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r108/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r108/examples/jsm/controls/OrbitControls.js';
/*Downloaded from https://www.codeseek.co/prakhar625/audio-visualizer-solar-sys-EvEZjL */
//initialise simplex noise (replace with perlin noise in future if needed)
//initialise simplex noise instance
const noise = new SimplexNoise();

// the main visualiser function
const vizInit = function (){
  
  const file = document.getElementById("thefile");
  const audio = document.getElementById("audio");
  const fileLabel = document.querySelector("label.file");
  
  document.onload = function(e){
    console.log(e);
    audio.play();
    play();
  }
  file.onchange = function(){
    fileLabel.classList.add('normal');
    audio.classList.add('active');
    const files = this.files;
    
    audio.src = URL.createObjectURL(files[0]);
    audio.load();
    audio.play();
    play();
}
  
function play() {
    const context = new AudioContext();
    const src = context.createMediaElementSource(audio);
    const analyser = context.createAnalyser();
    src.connect(analyser);
    analyser.connect(context.destination);
    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    //here comes the webgl
    const scene = new THREE.Scene();
    const group = new THREE.Group();
    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 3;

    const loader = new THREE.CubeTextureLoader();
    const cmtexture = loader.load([
        '../space/front.png',
        '../space/back.png',
        '../space/top.png',
        '../space/bot.png',
        '../space/left.png',
        '../space/right.png',
    ]);
    scene.background = cmtexture;

    const controls = new OrbitControls(camera);
    controls.target.set(0, 0, 0);
    controls.update();

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const icosahedronGeometry = new THREE.IcosahedronGeometry(10, 4);
    
    const lambertMaterial = new THREE.MeshLambertMaterial({
        color: 0xFFD700,
        envMapIntensity: 1, 
        roughness: 0.125, 
        metallness: 1,
        // wireframe: true
    });

    const sunLambertMaterial = new THREE.MeshLambertMaterial({
        color: 0xFDB813,
        roughness: 0.125, 
        metallness: 1,
        wireframe: true
    });
    
    function sizePlanet (width, height, depth){
        return new THREE.SphereGeometry(width, height, depth);
    }

    function makeInstance(geometry, color, x, y, z) {
    
    const material = new THREE.MeshPhongMaterial({color, roughness: .2, metallness: 1 });

    const planet = new THREE.Mesh(geometry, material);
    scene.add(planet);

    planet.position.x = x;
    planet.position.y = y;
    planet.position.z = z;

    return planet;
  }

  const planets = [
    makeInstance(sizePlanet(1, 32, 32), 0xcccccc,  0, 0, 30),
    makeInstance(sizePlanet(1.5, 32, 32), 0xFF4500,  5, 0, 40),
    makeInstance(sizePlanet(1.75, 32, 32), 0x255880,  10, 0, 50),
    makeInstance(sizePlanet(1.25, 32, 32), 0xba6d36,  15, 0, 60),
  ];
    planets.forEach(planet => {
        group.add(planet)
    })
    
    
    const sun = new THREE.Mesh(icosahedronGeometry, sunLambertMaterial);
    sun.position.set(0, 0, 0);
    group.add(sun);

    const insideSun = new THREE.Mesh(icosahedronGeometry, lambertMaterial);
    insideSun.position.set(0, 0, 0);
    group.add(insideSun);


    const ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.intensity = 1;
    spotLight.position.set(-10, 40, 20);
    spotLight.lookAt(sun);
    spotLight.castShadow = true;
    scene.add(spotLight);

    // const orbitControls = new THREE.OrbitControls(camera);
    // orbitControls.autoRotate = true;
    
    scene.add(group);

    document.getElementById('out').appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);

    render();

    function render() {
      analyser.getByteFrequencyData(dataArray);

      const lowerHalfArray = dataArray.slice(0, (dataArray.length/2) - 1);
      const upperHalfArray = dataArray.slice((dataArray.length/2) - 1, dataArray.length - 1);

      const overallAvg = avg(dataArray);
      const lowerMax = max(lowerHalfArray);
      const lowerAvg = avg(lowerHalfArray);
      const upperMax = max(upperHalfArray);
      const upperAvg = avg(upperHalfArray);

      const lowerMaxFr = lowerMax / lowerHalfArray.length;
      const lowerAvgFr = lowerAvg / lowerHalfArray.length;
      const upperMaxFr = upperMax / upperHalfArray.length;
      const upperAvgFr = upperAvg / upperHalfArray.length;

      
      makeRoughBall(sun, modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));

      group.rotation.y += 0.01;
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
            const offset = mesh.geometry.parameters.radius;
            const amp = 5;
            const time = window.performance.now();
            vertex.normalize();
            const rf = 0.00001;
            const distance = (offset + bassFr ) + noise.noise3D(vertex.x + time *rf*7, vertex.y +  time*rf*8, vertex.z + time*rf*9) * amp * treFr;
            vertex.multiplyScalar(distance);
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
    const fr = fractionate(val, minVal, maxVal);
    const delta = outMax - outMin;
    return outMin + (fr * delta);
}

function avg(arr){
    const total = arr.reduce(function(sum, b) { return sum + b; });
    return (total / arr.length);
}

function max(arr){
    return arr.reduce(function(a, b){ return Math.max(a, b); })
}




// import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r108/build/three.module.js';
// import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r108/examples/jsm/controls/OrbitControls.js';
// /*Downloaded from https://www.codeseek.co/prakhar625/audio-visualizer-solar-sys-EvEZjL */
// //initialise simplex noise (replace with perlin noise in future if needed)
// //initialise simplex noise instance
// const noise = new SimplexNoise();

// // the main visualiser function
// const vizInit = function (){
  
//   const file = document.getElementById("thefile");
//   const audio = document.getElementById("audio");
//   const fileLabel = document.querySelector("label.file");
  
//   document.onload = function(e){
//     console.log(e);
//     audio.play();
//     play();
//   }
//   file.onchange = function(){
//     fileLabel.classList.add('normal');
//     audio.classList.add('active');
//     const files = this.files;
    
//     audio.src = URL.createObjectURL(files[0]);
//     audio.load();
//     audio.play();
//     play();
//   }
  
// function play() {
//     const context = new AudioContext();
//     const src = context.createMediaElementSource(audio);
//     const analyser = context.createAnalyser();
//     src.connect(analyser);
//     analyser.connect(context.destination);
//     analyser.fftSize = 512;
//     const bufferLength = analyser.frequencyBinCount;
//     const dataArray = new Uint8Array(bufferLength);

//     //here comes the webgl
//     const scene = new THREE.Scene();
//     const group = new THREE.Group();
//     const fov = 75;
//     const aspect = 2;  // the canvas default
//     const near = 0.1;
//     const far = 100;
//     const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
//     camera.position.z = 3;

//     const controls = new OrbitControls(camera);
//     controls.target.set(0, 0, 0);
//     controls.update();

//     const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
//     renderer.setSize(window.innerWidth, window.innerHeight);

//     const planeGeometry = new THREE.PlaneGeometry(800, 800, 20, 20);
//     const planeMaterial = new THREE.MeshLambertMaterial({
//         color: 0x6904ce,
//         side: THREE.DoubleSide,
//         wireframe: true
//     });
    
//     const plane = new THREE.Mesh(planeGeometry, planeMaterial);
//     plane.rotation.x = -0.5 * Math.PI;
//     plane.position.set(0, 30, 0);
//     group.add(plane);
    
//     const plane2 = new THREE.Mesh(planeGeometry, planeMaterial);
//     plane2.rotation.x = -0.5 * Math.PI;
//     plane2.position.set(0, -30, 0);
//     group.add(plane2);

//     const icosahedronGeometry = new THREE.IcosahedronGeometry(10, 4);
//     const lambertMaterial = new THREE.MeshLambertMaterial({
//         color: 0xff00ee,
//         wireframe: true
//     });

//     const ball = new THREE.Mesh(icosahedronGeometry, lambertMaterial);
//     ball.position.set(0, 0, 0);
//     group.add(ball);

//     const ambientLight = new THREE.AmbientLight(0xaaaaaa);
//     scene.add(ambientLight);

//     const spotLight = new THREE.SpotLight(0xffffff);
//     spotLight.intensity = 0.9;
//     spotLight.position.set(-10, 40, 20);
//     spotLight.lookAt(ball);
//     spotLight.castShadow = true;
//     scene.add(spotLight);

//     // const orbitControls = new THREE.OrbitControls(camera);
//     // orbitControls.autoRotate = true;
    
//     scene.add(group);

//     document.getElementById('out').appendChild(renderer.domElement);

//     window.addEventListener('resize', onWindowResize, false);

//     render();

//     function render() {
//       analyser.getByteFrequencyData(dataArray);

//       const lowerHalfArray = dataArray.slice(0, (dataArray.length/2) - 1);
//       const upperHalfArray = dataArray.slice((dataArray.length/2) - 1, dataArray.length - 1);

//       const overallAvg = avg(dataArray);
//       const lowerMax = max(lowerHalfArray);
//       const lowerAvg = avg(lowerHalfArray);
//       const upperMax = max(upperHalfArray);
//       const upperAvg = avg(upperHalfArray);

//       const lowerMaxFr = lowerMax / lowerHalfArray.length;
//       const lowerAvgFr = lowerAvg / lowerHalfArray.length;
//       const upperMaxFr = upperMax / upperHalfArray.length;
//       const upperAvgFr = upperAvg / upperHalfArray.length;

//       makeRoughGround(plane, modulate(upperAvgFr, 0, 1, 0.5, 4));
//       makeRoughGround(plane2, modulate(lowerMaxFr, 0, 1, 0.5, 4));
      
//       makeRoughBall(ball, modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));

//       group.rotation.y += 0.005;
//       renderer.render(scene, camera);
//       requestAnimationFrame(render);
//     }

//     function onWindowResize() {
//         camera.aspect = window.innerWidth / window.innerHeight;
//         camera.updateProjectionMatrix();
//         renderer.setSize(window.innerWidth, window.innerHeight);
//     }

//     function makeRoughBall(mesh, bassFr, treFr) {
//         mesh.geometry.vertices.forEach(function (vertex, i) {
//             const offset = mesh.geometry.parameters.radius;
//             const amp = 7;
//             const time = window.performance.now();
//             vertex.normalize();
//             const rf = 0.00001;
//             const distance = (offset + bassFr ) + noise.noise3D(vertex.x + time *rf*7, vertex.y +  time*rf*8, vertex.z + time*rf*9) * amp * treFr;
//             vertex.multiplyScalar(distance);
//         });
//         mesh.geometry.verticesNeedUpdate = true;
//         mesh.geometry.normalsNeedUpdate = true;
//         mesh.geometry.computeVertexNormals();
//         mesh.geometry.computeFaceNormals();
//     }

//     function makeRoughGround(mesh, distortionFr) {
//         mesh.geometry.vertices.forEach(function (vertex, i) {
//             const amp = 2;
//             const time = Date.now();
//             const distance = (noise.noise2D(vertex.x + time * 0.0003, vertex.y + time * 0.0001) + 0) * distortionFr * amp;
//             vertex.z = distance;
//         });
//         mesh.geometry.verticesNeedUpdate = true;
//         mesh.geometry.normalsNeedUpdate = true;
//         mesh.geometry.computeVertexNormals();
//         mesh.geometry.computeFaceNormals();
//     }

//     audio.play();
//   };
// }

// window.onload = vizInit();

// document.body.addEventListener('touchend', function(ev) { context.resume(); });




// //some helper functions here
// function fractionate(val, minVal, maxVal) {
//     return (val - minVal)/(maxVal - minVal);
// }

// function modulate(val, minVal, maxVal, outMin, outMax) {
//     const fr = fractionate(val, minVal, maxVal);
//     const delta = outMax - outMin;
//     return outMin + (fr * delta);
// }

// function avg(arr){
//     const total = arr.reduce(function(sum, b) { return sum + b; });
//     return (total / arr.length);
// }

// function max(arr){
//     return arr.reduce(function(a, b){ return Math.max(a, b); })
// }