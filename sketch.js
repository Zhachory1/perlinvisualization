/******************************************************************************/
// Square Mountains

var Variables = function() {
  this.octaves = 8;
  this.persistance = 1;
  this.amplitude = 100;

  this.angle = 1;
  this.speedInc = 0.1;
  this.xoff = 0.2;
  this.yoff = 0.2;

  this.rows = 30;
  this.cols = 100;

  this.draw = true;
}

var container, stats, terrain;
var camera, scene, renderer, controls;
var items;
var targetRotation = 0;
var targetRotationOnMouseDown = 0;
var mouseX = 0;
var mouseXOnMouseDown = 0;
var windowHalfX = window.innerWidth / 2;
var vars = new Variables();
var gui = new dat.GUI();

var speed = 0;

init();
animate();

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

function removeEntity(object) {
  var selectedObject = scene.getObjectByName(object.name);
  scene.remove( selectedObject );
  animate();
}

function init() {
  container = document.createElement( 'div' );
  document.body.appendChild( container );

  gui.add(vars, 'octaves').min(1).max(8).step(1);
  gui.add(vars, 'persistance').min(0).max(1).step(0.05);
  gui.add(vars, 'amplitude').min(0).max(200).step(10);
  gui.add(vars, 'speedInc').min(0).max(0.2).step(0.01);
  var angleChange = gui.add(vars, 'angle').min(1).max(16).step(0.5);
  gui.add(vars, 'xoff').min(0).max(0.2).step(0.01);
  gui.add(vars, 'yoff').min(0).max(0.2).step(0.01);
  gui.add(vars, 'cols').min(10).max(100).step(1);
  gui.add(vars, 'draw');

  angleChange.onChange(function(value) {
    for (var i = items.length - 1; i >= 0; i--) {
      removeEntity(items[i]);
    }
    terrain = [];
    items = [];
    for (var x = 0; x < vars.rows; x++) {
      terrain[x] = [];
      var pts = [new THREE.Vector2(0, 0), new THREE.Vector2(400, 1), new THREE.Vector2(400, 0)];
      var basicShape = new THREE.Shape( pts );
      addShape(basicShape, 0, 0, (x*(400/vars.rows))-400, 0, -Math.PI/vars.angle, 0, 1);
    }
  });

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.set(0, 500, 0);
  camera.up = new THREE.Vector3(0,1,0);
  camera.lookAt( new THREE.Vector3(0,0,0) );

  var ambient = new THREE.AmbientLight( { color: 0x404040, intensity: 0.75 }); // soft white light
  scene.add( ambient );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.enableZoom = true;

  stats = new Stats();
  container.appendChild( stats.dom );
  window.addEventListener( 'resize', onWindowResize, false );
  document.body.onkeyup = function(e){
      if(e.keyCode == 32){
          vars.draw = !vars.draw;
      }
  }
  // Set up item shapes
  terrain = [];
  items = [];
  for (var x = 0; x < vars.rows; x++) {
    terrain[x] = [];
    var pts = [new THREE.Vector2(0, 0), new THREE.Vector2(400, 1), new THREE.Vector2(400, 0)];
    var basicShape = new THREE.Shape( pts );
    var objs = addShape(basicShape, 0, 0, (x*(400/vars.rows))-400, 0, -Math.PI/vars.angle, 0, 1);
    items.push(objs[0])
    items.push(objs[1])
  }

  renderer.render( scene, camera );

}

function animate() {
  requestAnimationFrame( animate );
  if( vars.draw ) {
    speed -= vars.speedInc;
    var yoff = speed;
    for (var y = vars.rows; y > 0; y--) {
      var xoff = 0;
      for (var x = 0; x < vars.cols; x++) {
        terrain[vars.rows-y][x] = (
          ((x<10)?(-Math.cos((x/10)*Math.PI)/2)+0.5:1)*
          ((x>vars.cols-10)?(-Math.cos(((vars.cols-x)/10)*Math.PI)/2)+0.5:1)*
          (noise2(xoff,yoff,octaves=vars.octaves,persistance=vars.persistance)*
           ((vars.amplitude*(Math.sin((y/7)+11)))+vars.amplitude))
        );
        xoff += vars.xoff;
      }
      yoff += vars.yoff;
    }

    // Change item's geometry
    for (var y = 0; y < vars.rows-1; y++) {
      var points = [new THREE.Vector2(0, 0)]
      for (var x = 0; x < vars.cols; x++) {
        if(x>0) {
          points.push(new THREE.Vector2((x-1)*(400/vars.cols), terrain[y][x-1]));
          points.push(new THREE.Vector2((x)*(400/vars.cols), terrain[y][x]));
        }
      }
      points.push(new THREE.Vector2(400, 0));
      var shape = new THREE.Shape( points );
      var geometry = new THREE.ShapeGeometry( shape , 1000 );
      items[(y*2)].geometry.dispose();
      items[(y*2)].geometry = geometry.clone();
      items[(y*2)+1].geometry.dispose();
      items[(y*2)+1].geometry = geometry.clone();
    }
  }

  controls.update();

  renderer.render( scene, camera );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}
/******************************************************************************/

/******************************************************************************/
// // Square squiggly edges
// var Variables = function() {
//   this.octaves = 8;
//   this.persistance = 1;
//   this.amplitude = 100;

//   this.angle = 1;
//   this.speedInc = 0.1;
//   this.xoff = 0.2;
//   this.yoff = 0.2;

//   this.rows = 30;
//   this.cols = 100;

//   this.draw = true;
// }

// var container, stats, terrain;
// var camera, scene, renderer, controls;
// var items;
// var targetRotation = 0;
// var targetRotationOnMouseDown = 0;
// var mouseX = 0;
// var mouseXOnMouseDown = 0;
// var windowHalfX = window.innerWidth / 2;
// var vars = new Variables();
// var gui = new dat.GUI();
// var objs = [];
// var terrain = [];

// var speed = 0;

// init();
// animate();

// function dist(x1, y1, x2, y2) {
//   return Math.sqrt(Math.pow(y2-y1,2) + Math.pow(x2-x1,2))
// }

// function init() {
//   container = document.createElement( 'div' );
//   document.body.appendChild( container );

//   gui.add(vars, 'octaves').min(1).max(8).step(1);
//   gui.add(vars, 'persistance').min(0).max(1).step(0.05);
//   gui.add(vars, 'amplitude').min(0).max(200).step(10);
//   gui.add(vars, 'speedInc').min(0).max(0.2).step(0.01);
//   // var angleChange = gui.add(vars, 'angle').min(1).max(16).step(0.5);
//   gui.add(vars, 'xoff').min(0).max(0.2).step(0.01);
//   gui.add(vars, 'yoff').min(0).max(0.2).step(0.01);
//   gui.add(vars, 'draw');

//   scene = new THREE.Scene();

//   camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
//   camera.position.set(200, 200, 500);
//   camera.up = new THREE.Vector3(0,1,0);

//   var ambient = new THREE.AmbientLight( { color: 0x404040, intensity: 0.75 }); // soft white light
//   scene.add( ambient );

//   renderer = new THREE.WebGLRenderer( { antialias: true } );
//   renderer.shadowMap.enabled = true;
//   renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

//   renderer.setPixelRatio( window.devicePixelRatio );
//   renderer.setSize( window.innerWidth, window.innerHeight );
//   container.appendChild( renderer.domElement );

//   controls = new THREE.OrbitControls(camera, renderer.domElement);
//   controls.enableDamping = true;
//   controls.dampingFactor = 0.25;
//   controls.enableZoom = true;
//   controls.target =  new THREE.Vector3(200,200,0);

//   stats = new Stats();
//   container.appendChild( stats.dom );
//   window.addEventListener( 'resize', onWindowResize, false );
//   document.body.onkeyup = function(e){
//       if(e.keyCode == 32){
//           vars.draw = !vars.draw;
//       }
//   }
//   // Set up item shapes
//   var pts = [new THREE.Vector2(0, 400), new THREE.Vector2(400, 400), new THREE.Vector2(400, 0), new THREE.Vector2(0, 0)];
//   var basicShape = new THREE.Shape( pts );
//   objs = addShape(basicShape, 0, 0, 0, 0, 0, 0, 1);


//   renderer.render( scene, camera );

// }

// function animate() {
//   requestAnimationFrame( animate );
//   if( vars.draw ) {
//     speed -= vars.speedInc;
//     var yoff = speed;
//     //  BOTTOM and LEFT, TOP and RIGHT
//     var xoff = 0;
//     var stepSize = 29;
//     terrain[0] = []
//     for (var x = 0; x < 20; x++) {
//       var point = new THREE.Vector2(0, x*stepSize)
//       terrain[0].push(dist(0, 0, point.x, point.y)*(0.1)*
//         noise2(xoff,yoff,octaves=vars.octaves,persistance=vars.persistance));
//       xoff += vars.xoff;
//     }
//     terrain[1] = []
//     for (var x = 0; x < 20; x++) {
//       var point = new THREE.Vector2(400, x*stepSize)
//       terrain[1].push(dist(0, 0, point.x, point.y)*(0.1)*
//         noise2(xoff,yoff,octaves=vars.octaves,persistance=vars.persistance));
//       xoff += vars.xoff;
//     }

//     var right = [];
//     var top = [];
//     var bottom = [];
//     var left = [];
//     for (var x = 0; x < 20; x++) {
//         right.push(new THREE.Vector2(terrain[0][x], x*stepSize));
//         bottom.push(new THREE.Vector2(x*stepSize, terrain[0][x]));
//         left.push(new THREE.Vector2(terrain[1][x], x*stepSize));
//         top.push(new THREE.Vector2(x*stepSize, terrain[1][x]));
//     }
//     var points  = [];
//     extend(points, right);
//     extend(points, top);
//     extend(points, left);
//     extend(points, bottom);
//     var shape = new THREE.Shape( points );
//     var geometry = new THREE.ShapeGeometry( shape , 1000 );
//     items[0].geometry.dispose();
//     items[0].geometry = geometry.clone();
//     items[1].geometry.dispose();
//     items[1].geometry = geometry.clone();
//   }

//   controls.update();

//   renderer.render( scene, camera );
// }

// function extend(arr1, arr2) {
//   for (var i = arr2.length - 1; i >= 0; i--) {
//     arr1.push(arr2[i]);
//   }
// }

// function onWindowResize() {
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();
//   renderer.setSize( window.innerWidth, window.innerHeight );
// }

// /******************************************************************************/