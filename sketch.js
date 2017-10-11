/******************************************************************************/
// Base
var Variables = function() {
  this.octaves = 8;
  this.persistence = 1;
  this.amplitude = 100;
  this.speedInc = 0.1;
  this.xoff = 0.1;
  this.yoff = 0.1;
  this.rows = 30;
  this.cols = 100;
  this.draw = true;
}

var container, stats, terrain, items;
var camera, scene, renderer, controls, gui;
var targetRotation = 0;
var targetRotationOnMouseDown = 0;
var mouseX = 0;
var mouseXOnMouseDown = 0;
var windowHalfX = window.innerWidth / 2;
var vars = new Variables();

var speed = 0;

// Set up container for visualizations
container = document.createElement( 'div' );
document.body.appendChild( container );

// Show stats of page
stats = new Stats();
container.appendChild( stats.dom );

// Handler for window resize to resize canvas and camera aspect
window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

// Handler to catch keyboard input
document.body.onkeyup = function(e) {
  console.log(e.keyCode);
  if(e.keyCode == 32 || e.keyCode == 13) { // Space or enter
    vars.draw = !vars.draw;
  }
  if(e.keyCode == 49 || e.keyCode == 97) { // One key on top row or numpad
    console.log("One was pressed");
  }
  if(e.keyCode == 50 || e.keyCode == 98) { // Two key on top row or numpad
    console.log("Two was pressed");
  }
  if(e.keyCode == 51 || e.keyCode == 99) { // Three key on top row or numpad
    console.log("Three was pressed");
  }
}

// Basic functions to add shapes to scene
function addShape( shape, x, y, z, rx, ry, rz, s ) {
  var geometry = new THREE.ShapeGeometry( shape, 1000 );
  var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0x202020, side: THREE.DoubleSide } ) );
  mesh.position.set( x, y, z );
  mesh.rotation.set( rx, ry, rz );
  mesh.scale.set( s, s, s );
  scene.add( mesh );
  var line = addLineShape(shape, x, y, z+1, rx, ry, rz, s);
  return [mesh, line];
}

function addLineShape( shape, x, y, z, rx, ry, rz, s ) {
  shape.autoClose = true;
  var points = shape.createPointsGeometry();
  var line = new THREE.Line( points, new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 3 } ) );
  line.position.set( x, y, z );
  line.rotation.set( rx, ry, rz );
  line.scale.set( s, s, s );
  scene.add( line );
  return line;
}

function setCamera(x, y, z) {
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.set(x, y, z);
  camera.up = new THREE.Vector3(0,1,0);
  camera.lookAt( new THREE.Vector3(0,0,0) );
}

function setSceneAndRenderer(ambientColor, ambientIntesity) {
  var ambient = new THREE.AmbientLight( { color: ambientColor, intensity: ambientIntesity }); // soft white light
  scene.add( ambient );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );
}

function setControls(enableDamping=true, dampingFactor=0.25, enableZoom=true, targetX=0, targetY=0, targetZ=0) {
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = enableDamping;
  if(enableDamping) {
    controls.dampingFactor = dampingFactor;
  }
  controls.enableZoom = enableZoom;
  controls.target =  new THREE.Vector3(targetX,targetY,targetZ);

}

// Util Functions
function extend(arr1, arr2) {
  for (var i = arr2.length - 1; i >= 0; i--) {
    arr1.push(arr2[i]);
  }
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(y2-y1,2) + Math.pow(x2-x1,2))
}

// The first shape to be shown will be this Square Mountains
SquigglySquareInit();
SquigglySquareAnimate();
/******************************************************************************/


