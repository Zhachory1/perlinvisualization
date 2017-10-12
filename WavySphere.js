/******************************************************************************/
var mesh;
function updateGroupGeometry( mesh, geometry ) {
  mesh.children[ 0 ].geometry.dispose();
  mesh.children[ 1 ].geometry.dispose();
  mesh.children[ 0 ].geometry = new THREE.WireframeGeometry( geometry );
  mesh.children[ 1 ].geometry = geometry;
}

function generateGeometry() {
  updateGroupGeometry( mesh,
    new THREE.SphereBufferGeometry(
      vars.radius, vars.widthSegments, vars.heightSegments, vars.phiStart, vars.phiLength, vars.thetaStart, vars.thetaLength
    )
  );
}

// Wavy Sphere
function WavySphereInit() {
  gui = new dat.GUI();
  // gui.add( vars, 'radius', 1, 30 ).onChange( generateGeometry );
  gui.add( vars, 'widthSegments', 10, 50 ).step( 1 ).onChange( generateGeometry );
  gui.add( vars, 'heightSegments', 10, 50 ).step( 1 ).onChange( generateGeometry );

  scene = new THREE.Scene();
  setCamera(200, 200, 500);
  setSceneAndRenderer(0x404040, 0.75);
  setControls(true, 0.25, true, 0, 0, 0);

  terrain = [];
  items = [];
  // Set up item shapes
  // var geometry = new THREE.SphereGeometry( 200, 32, 32 );
  // var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
  // var sphere = new THREE.Mesh( geometry, material );
  mesh = new THREE.Object3D();
  mesh.add( new THREE.LineSegments(
    new THREE.SphereGeometry(),
    new THREE.LineBasicMaterial( {
      color: 0xffffff,
      transparent: true,
      opacity: 0.5
    } )
  ) );

  mesh.add( new THREE.Mesh(
    new THREE.SphereGeometry(),
    new THREE.MeshPhongMaterial( {
      color: 0x156289,
      emissive: 0x072534,
      side: THREE.DoubleSide,
      flatShading: true
    } )
  ) );
  generateGeometry();
  scene.add( mesh );

  renderer.render( scene, camera );
  stopAnimation = false;
  currentRequest = WavySphereAnimate;
  WavySphereAnimate();
}

function WavySphereAnimate() {
  stats.begin();
  if( vars.draw && !stopAnimation && state == CurrentState.SPHERE) {
    requestAnimationFrame( WavySphereAnimate );
    controls.update();
    renderer.render( scene, camera );
  }
  stats.end();
}
/******************************************************************************/