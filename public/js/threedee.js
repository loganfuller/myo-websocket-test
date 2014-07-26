var HALF_WINDOW_HEIGHT = window.innerHeight / 2;
var HALF_WINDOW_WIDTH = window.innerWidth / 2;

// Set up the scene
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

var ambient = new THREE.AmbientLight( 0x101030 );
scene.add( ambient );

var directionalLight = new THREE.DirectionalLight( 0xffeedd );
directionalLight.position.set( 0, 0, 1 );
scene.add( directionalLight );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.domElement.id = "threeJs";
document.body.appendChild( renderer.domElement );

camera.position.z = 150;
// camera.position.z = 50;

var jsonLoader = new THREE.JSONLoader();
var mesh = null;
jsonLoader.load( "models/katana/katana.js", function (geometry, materials) {
    mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
    scene.add( mesh );
    render();
});

// Render the scene
function render() {
    requestAnimationFrame(render);

    if(window.myoOrientation) {
        var orientation = (new THREE.Euler())
                .setFromQuaternion(new THREE.Quaternion(
                    window.myoOrientation.orientation.x,
                    window.myoOrientation.orientation.y,
                    window.myoOrientation.orientation.z,
                    window.myoOrientation.orientation.w
                )),
            offset = (new THREE.Euler())
                .setFromQuaternion(new THREE.Quaternion(
                    window.myoOrientation.offset.x,
                    window.myoOrientation.offset.y,
                    window.myoOrientation.offset.z,
                    window.myoOrientation.offset.w
                ));

            mesh.quaternion.set(
                window.myoOrientation.orientation.y,
                -window.myoOrientation.orientation.z,
                window.myoOrientation.orientation.x,
                -window.myoOrientation.orientation.w
            );
    }

    camera.lookAt(scene.position);

	renderer.render(scene, camera);
}
