'use strict'

/* 
IMPORTANT

Open Chrome from Terminal with following command:
	open /Applications/Google\ Chrome.app --args --allow-file-access-from-files 
*/


// ------- //
// GLOBALS //
// ------- //

// Texture Loader
var loader = new THREE.TextureLoader();
// Initialize Physijs
Physijs.scripts.worker = './js/physijs_worker.js';
Physijs.scripts.ammo = './ammo.js';

// ------- //
// CLASSES //
// ------- //
	// Notes: You cannot simply add "new Character()" to a scene because you would adding the entire clash, and not the ThreeJS object. 
	// The class object would have a .mesh property that you could add, but we use the getMesh() function for best practice.
		// This way, nobody can edit the mesh directly(?)

// --------------- //
// Character class //
// --------------- //
class Character {
	constructor () {
		'use strict'
			// Create our Character Mesh
		this.texture = loader.load( 'textures/character/f1.png' );
		this.material = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, map: this.texture, transparent: true } );
		this.mesh = new THREE.Object3D();
		this.drawing = new THREE.Mesh( new THREE.PlaneBufferGeometry(20,20), this.material );
		this.sphere = new THREE.Mesh( new THREE.SphereGeometry(4,32,32), new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x111111}))
		this.sphere.position.y = 0
			// Add our sphere and drawing to our mesh
		this.mesh.add(this.drawing)
		this.mesh.add(this.sphere)
		this.mesh.position.y = 0;
		this.mesh.rotation.y = Math.PI
		this.mesh.castShadow = true;
		this.mesh.receiveShadow = true;
    	// Set the vector of the current motion
    this.direction = new THREE.Vector3(0, 0, 0);
	}
	getMesh(){
		return this.mesh;
	}
		// Update the direction of the current motion
	setDirection (controls) {
    	// Either left or right, and either up or down
    var x = controls.left ? 1 : controls.right ? -1 : 0,
        y = 0,
        z = controls.up ? 1 : controls.down ? -1 : 0;
    this.direction.set(x, y, z);
	}
		// Process the character motions
	motion () {
			// (if any)
		if (this.direction.x !== 0 || this.direction.z !== 0) {
		    	// Rotate the character
		    this.rotate();
			    // And, only if we're not colliding with an obstacle or a wall ...
				    // if (this.collide()) {
				    //     return false;
				    // }
			    // ... we move the character
		    this.move();
		    return true;	
		}
	}
	currentTile (worldx) {
		console.log("FIND CURRENT TILE AND LIGHT IT UP!")
		// this.mesh.position
		// for (var i = 0; i < newScene.world.mesh.children.length; i++) {
		// 	if (newScene.world.mesh.children[i].position.x 
		// 	newScene.world.mesh.children[i].position.z
		// }
	}

	// Rotate the character
	rotate () {
    // Set the direction's angle, and the difference between it and our Object3D's current rotation
    var angle = Math.atan2(this.direction.x, this.direction.z),
        difference = angle - this.mesh.rotation.y;
   		// If we're doing more than a 180°
    if (Math.abs(difference) > Math.PI) {
        	// We proceed to a direct 360° rotation in the opposite way
        if (difference > 0) {
            this.mesh.rotation.y += 2 * Math.PI;
        } else {
            this.mesh.rotation.y -= 2 * Math.PI;
        }
        	// And we set a new smarter (because shorter) difference
        difference = angle - this.mesh.rotation.y;
        	// In short : we make sure not to turn "left" to go "right"
    }
    	// Now if we haven't reached our target angle
    if (difference !== 0) {
        	// We slightly get closer to it
        this.mesh.rotation.y += difference / 4;
    }
	}
	move () {
		let speed = 1 // used to be 4
    // We update our Object3D's position from our "direction"
    this.mesh.position.x += this.direction.x * ((this.direction.z === 0) ? speed : Math.sqrt(speed));
    this.mesh.position.z += this.direction.z * ((this.direction.x === 0) ? speed : Math.sqrt(speed));
	}
  collide () {
    'use strict';
    // INSERT SOME MAGIC HERE
    return false;
  }
};

// ----------- //
// World Class //
// ----------- //
class World {
	constructor (x, y, tileWidth) {

		// Function for creating a grid, called later
		function createGrid (x, z, tileWidth, that) {
			for (var i = x; i > -x;) {
				for (var j = z; j > -z;){

					// Create the mesh for individual tiles...
					let material = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111} );
					let geometry = new THREE.PlaneBufferGeometry( tileWidth, tileWidth )
					let tile = new THREE.Mesh( geometry, material );

					// Tile Properties
					tile.position.x = j
					tile.position.z = i
					tile.position.y = -10;
					tile.rotation.x = - Math.PI / 2;
					tile.receiveShadow = true;

					// Add tile to the world mesh
					that.mesh.add(tile)

					j -= tileWidth + .1;

				}

				i -= tileWidth + .1;

			}
		}

		// Create a mesh that will contain a mesh for each tile
		this.tileWidth = tileWidth // we set this property so we can grab it in other funcitons if neccessary
		this.mesh = new THREE.Object3D();

		// Create the grid
		createGrid(x, y, tileWidth, this)

	}
	getMesh() {
		return this.mesh;
	}
}


// ----------------------------- //
// Box Class (for falling boxes) //
// ----------------------------- //
class Box {
	constructor (x, y, z) {
	  this.mesh = new Physijs.BoxMesh( // We use Physijs library to create a box with physics.
	    new THREE.CubeGeometry( x, y, z ),
	    new THREE.MeshBasicMaterial({ color: 0xfc7b7b })
		)
	}
	getMesh() {
		return this.mesh;
	}
}

// ------------ //
// TEST SPHERES //
// ------------ //

class testSphere {
	constructor (radius, widthsegs, heightsegs) {
		let geometry = new THREE.SphereGeometry(radius, widthsegs, heightsegs)
		let material = new THREE.MeshBasicMaterial({color:0xffff00})
		this.mesh = new THREE.Mesh(geometry, material)
	}
	getMesh() {
		return this.mesh;
	}
}

// ----------- //
// Scene Class //
// ----------- //
class Scene {
	constructor () {

		
		// Renderer
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementById( 'viewport' ).appendChild( this.renderer.domElement );
    // Physijs.Scene
    this.scene = new Physijs.Scene;;
    // Camera
    this.camera();
    // Lights
    this.lights();
    // Objects (world, character, box, etc)
    this.createObjects();
    // Start the event handlers
    this.setControls();
    // Create window resize function:
    let that = this
		function onWindowResize () {
			that.camera.aspect = window.innerWidth / window.innerHeight;
			that.camera.updateProjectionMatrix();
			that.renderer.setSize( window.innerWidth, window.innerHeight );
		}
    window.addEventListener( 'resize', onWindowResize, false );
	}
	camera () {
		// Camera
    this.camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    this.camera.position.set( 0, 70, -120 );
    this.camera.lookAt( this.scene.position );
    this.scene.add( this.camera );
	}
	lights () {
		// Lights
	  // var light, materials;

	  // Ambient
	  // this.scene.add( new THREE.AmbientLight(0xffffff, .01) )

	  // Point
	  this.pointLight = new THREE.PointLight(0xffffff, 1, 10000);
	  this.pointLight.position.y = 100;
	  this.pointLight.position.x = -100;
	  this.pointLight.position.z = -100;
	  this.scene.add(this.pointLight)


	  //  // Directional
	  // this.directionalLight = new THREE.DirectionalLight( 0xdfebff, 1.75 );
		// this.directionalLight.position.set( 5, 5, 5 );
		// this.directionalLight.position.multiplyScalar( 1.3 );
		// this.directionalLight.castShadow = true;
		// this.directionalLight.shadow.mapSize.width = 1024;
		// this.directionalLight.shadow.mapSize.height = 1024;

		// var d = 300;

		// this.directionalLight.shadow.camera.left = - d;
		// this.directionalLight.shadow.camera.right = d;
		// this.directionalLight.shadow.camera.top = d;
		// this.directionalLight.shadow.camera.bottom = - d;

		// this.directionalLight.shadow.camera.far = 1000;

		// this.scene.add(this.directionalLight)
	}
	initializePhysics () {
		this.scene.simulate(); // run the physics
	}
	createObjects () {

		// World - Create the world and add it
		this.world = new World(50, 50, 5)
		this.scene.add( this.world.getMesh() );			
	  
	  // Character - Create a new Character and add to scene.
		this.user = new Character()
		this.scene.add( this.user.getMesh() );

	  // Falling Box Example
	  this.boxMesh = new Box(5,5,5)
	  this.scene.add( this.boxMesh.getMesh() );

	  // Test Sphere
	  this.testsphere = new testSphere(4, 20, 20);
	  this.scene.add( this.testsphere.getMesh() )

	}
	setControls () {
		var user = this.user, // so we can access this inside eventlistener
				controls = { // sets state of controls
					left: false,
					up: false,
					right: false,
					down: false
				};

		// When the user presses a key...
		window.addEventListener( 'keydown', function(e) {
			var prevent = true;
      // Update the state of the attached control to "true"
      switch (e.keyCode) {
          case 37:
              controls.left = true;
              break;
          case 38:
              controls.up = true;
              break;
          case 39:
              controls.right = true;
              break;
          case 40:
              controls.down = true;
              break;
          default:
              prevent = false;
      }
      // Avoid the browser to react unexpectedly
      if (prevent) {
          e.preventDefault();
      } else {
          return;
      }
      // Update the character's direction
      user.setDirection(controls);
		})

		//When the user releases a key...
		window.addEventListener( 'keyup', function(e) {
      var prevent = true;
      // Update the state of the attached control to "false"
      switch (e.keyCode) {
          case 37:
              controls.left = false;
              break;
          case 38:
              controls.up = false;
              break;
          case 39:
              controls.right = false;
              break;
          case 40:
              controls.down = false;
              break;
          default:
              prevent = false;
      }
      // Avoid the browser to react unexpectedly
      if (prevent) {
          e.preventDefault();
      } else {
          return;
      }
      // Update the character's direction
      user.setDirection(controls);
		})
	}
	frame () {
		'use strict'
		this.user.motion();
		this.user.currentTile();
		this.renderer.render(this.scene, this.camera)
	}
}

// Window Resize function (called in Scene class constructor)


// Here is where we initalize everything
var newScene = new Scene()
function animate () {
	newScene.scene.simulate() // run the physics
	requestAnimationFrame(animate);
	newScene.frame();
}
animate()





















