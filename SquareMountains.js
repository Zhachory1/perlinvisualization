/******************************************************************************/
// Square Mountains
function SquareMountainsInit() {
  gui = new dat.GUI();
  gui.add(vars, 'octaves').min(1).max(8).step(1);
  gui.add(vars, 'persistence').min(0).max(1).step(0.05);
  gui.add(vars, 'amplitude').min(0).max(200).step(10);
  gui.add(vars, 'speedInc').min(0).max(0.2).step(0.01);
  gui.add(vars, 'xoff').min(0).max(0.2).step(0.01);
  gui.add(vars, 'yoff').min(0).max(0.2).step(0.01);
  gui.add(vars, 'cols').min(10).max(100).step(1);
  gui.add(vars, 'draw');

  scene = new THREE.Scene();
  setCamera(0, 500, 0);
  setSceneAndRenderer(0x404040, 0.75);
  setControls(true, 0.25, true, -200, -200, -200);

  // Set up item shapes
  terrain = [];
  items = [];
  for (var x = 0; x < vars.rows; x++) {
    terrain[x] = [];
    var pts = [new THREE.Vector2(0, 0), new THREE.Vector2(400, 1), new THREE.Vector2(400, 0)];
    var basicShape = new THREE.Shape( pts );
    var objs = addShape(basicShape, 0, 0, (x*(400/vars.rows))-400, 0, -Math.PI, 0, 1);
    items.push(objs[0])
    items.push(objs[1])
  }

  renderer.render( scene, camera );
  stopAnimation = false;
  currentRequest = SquareMountainsAnimate;
  SquareMountainsAnimate();
}

function SquareMountainsAnimate() {
  stats.begin();
  if( vars.draw && !stopAnimation && state == CurrentState.MOUNTAIN) {
    speed += vars.speedInc;
    var yoff = speed;
    for (var y = vars.rows; y > 0; y--) {
      var xoff = 0;
      for (var x = 0; x < vars.cols; x++) {
        terrain[vars.rows-y][x] = (
          ((x<10)?(-Math.cos((x/10)*Math.PI)/2)+0.5:1)*
          ((x>vars.cols-10)?(-Math.cos(((vars.cols-x)/10)*Math.PI)/2)+0.5:1)*
          (noise2(xoff,yoff,octaves=vars.octaves,persistence=vars.persistence)*
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

    requestAnimationFrame( SquareMountainsAnimate );
    controls.update();
    renderer.render( scene, camera );
  }
  stats.end();
}
/******************************************************************************/
