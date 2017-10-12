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
  this.radius = 200,
  this.widthSegments = 32,
  this.heightSegments = 32,
  this.phiStart = 0,
  this.phiLength = Math.PI*2,
  this.thetaStart = 0,
  this.thetaLength = Math.PI

  this.draw = true;
}

CurrentState = {
  MOUNTAIN: 0,
  SQUARE: 1,
  SPHERE: 2,
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

var stopAnimation = false;
var state = CurrentState.MOUNTAIN;
var currentRequest;

// Set up container for visualizations
container = document.createElement( 'div' );
container.id = "container";
stats = new Stats();
document.body.appendChild( container );
document.body.appendChild( stats.dom );

// Handler for window resize to resize canvas and camera aspect
window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

// Handler to catch keyboard input
document.body.onkeyup = function(e) {
  if(e.keyCode == 32 || e.keyCode == 13) { // Space or enter
    vars.draw = !vars.draw;
  }
  if(e.keyCode == 49 || e.keyCode == 97) { // One key on top row or numpad
    stopAnimation = true;
    state = CurrentState.MOUNTAIN;
    destroy();
    SquareMountainsInit();
  }
  if(e.keyCode == 50 || e.keyCode == 98) { // Two key on top row or numpad
    stopAnimation = true;
    state = CurrentState.SQUARE;
    destroy();
    SquigglySquareInit();
  }
  if(e.keyCode == 51 || e.keyCode == 99) { // Three key on top row or numpad
    stopAnimation = true;
    state = CurrentState.SPHERE;
    destroy();
    WavySphereInit();
  }
}

function destroy() {
  cancelAnimationFrame(currentRequest);// Stop the animation
  scene = null;
  camera = null;
  controls = null;
  var guiElem = document.querySelector("body > div.dg.ac");
  guiElem.removeChild(guiElem.firstChild);
  empty(container);
}

function empty(elem) {
  while (elem.lastChild) elem.removeChild(elem.lastChild);
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
  camera.up = new THREE.Vector3(0, 1, 0);
  camera.lookAt( new THREE.Vector3(0, 0, 0) );
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

function dist2d(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(y2-y1,2) + Math.pow(x2-x1,2))
}
function dist3d(x1, y1, z1, x2, y2, z2) {
  return Math.sqrt(Math.pow(z2-z1,2) + Math.pow(y2-y1,2) + Math.pow(x2-x1,2))
}

function map(n, start1, stop1, start2, stop2, withinBounds) {
  var newval = ((n - start1)/(stop1 - start1)) * (stop2 - start2) + start2;
  if (!withinBounds) {
    return newval;
  }
  if (start2 < stop2) {
    return constrain(newval, start2, stop2);
  } else {
    return constrain(newval, stop2, start2);
  }
}

function constrain(n, low, high) {
  return Math.max(Math.min(n, high), low);
}


// The first shape to be shown will be this Square Mountains
SquareMountainsInit();
/******************************************************************************/


