/******************************************************************************/
var xstart = 0;
// Square squiggly edges
function SquigglySquareInit() {
  gui = new dat.GUI();
  gui.add(vars, 'octaves').min(1).max(8).step(1);
  gui.add(vars, 'persistence').min(0).max(1).step(0.05);
  gui.add(vars, 'amplitude').min(0).max(200).step(10);
  gui.add(vars, 'speedInc').min(0).max(0.1).step(0.01);
  gui.add(vars, 'xoff').min(0).max(0.1).step(0.01);
  gui.add(vars, 'draw');

  scene = new THREE.Scene();

  setCamera(200, 200, 500);

  setSceneAndRenderer(0x404040, 0.75);

  setControls(true, 0.25, true, 200, 200, 0);

  terrain = [];
  items = [];
  // Set up item shapes
  var pts = [new THREE.Vector2(0, 400), new THREE.Vector2(400, 400),
             new THREE.Vector2(400, 0), new THREE.Vector2(  0,   0)];
  var basicShape = new THREE.Shape( pts );
  [items[0], items[1]] = addShape(basicShape, 0, 0, 0, 0, 0, 0, 1);
  renderer.render( scene, camera );
}

function SquigglySquareAnimate() {
  stats.begin();
  if( vars.draw ) {
    speed -= vars.speedInc;
    var yoff = 0;
    //  BOTTOM and LEFT, TOP and RIGHT
    var xoff = speed;
    var stepSize = 20;
    terrain = [[], []]
    for (var x = 0; x < 20; x++) {
      var point1 = new THREE.Vector2(0, x*stepSize)
      var point2 = new THREE.Vector2(400, x*stepSize)

      terrain[0].push(
          (dist(0, 0, point1.x, point1.y)*(vars.amplitude/500)*
                    noise2(xoff,0,octaves=vars.octaves,persistence=vars.persistence))
          -((vars.amplitude/500)/2));
      xoff += vars.xoff;

      terrain[1].push(
          (dist(0, 0, point2.x, point2.y)*(vars.amplitude/500)*
                    noise2(xoff,0,octaves=vars.octaves,persistence=vars.persistence))
          -((vars.amplitude/500)/2));
      xoff += vars.xoff;
    }

    var right = [];
    var top = [];
    var bottom = [];
    var left = [];
    for (var x = 0; x < 20; x++) {
        bottom.push(new THREE.Vector2(x*stepSize, terrain[0][x]));
        right.push(new THREE.Vector2(380+terrain[1][x], x*stepSize+20));
        top.push(new THREE.Vector2(x*stepSize+20, 380+terrain[1][x]));
        left.push(new THREE.Vector2(terrain[0][x], x*stepSize));
    }
    var points  = [];
    extend(points, top);
    extend(points, left);
    extend(points, bottom.reverse());
    extend(points, right.reverse());
    var shape = new THREE.Shape( points );
    var geometry = new THREE.ShapeGeometry( shape , 1000 );
    items[0].geometry.dispose();
    items[0].geometry = geometry.clone();
    items[1].geometry.dispose();
    items[1].geometry = geometry.clone();
  }
  stats.end();

  requestAnimationFrame( SquigglySquareAnimate );

  controls.update();

  renderer.render( scene, camera );
}
/******************************************************************************/