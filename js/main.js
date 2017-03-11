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
		this.drawing = new THREE.Mesh( new THREE.PlaneBufferGeometry(5,20), this.material );
		//this.sphere = new THREE.Mesh( new THREE.SphereGeometry(2.5,32,32), new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x111111}))
		this.sphere = new Physijs.SphereMesh(
	    new THREE.SphereGeometry(2.5,32,32),
	    new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x111111})
		)
		this.sphere.position.y = 0
		this.sphere.castShadow = true;
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
	// Find users current tile
	setCurrentTile (world) {
		// Find the users 2D coordinates and round them to match the nearest tiles coordinates
		let user2DCoords = {
			x: Math.round(this.mesh.position.x/(world.tileWidth))*world.tileWidth,
			z: Math.round(this.mesh.position.z/(world.tileWidth))*world.tileWidth
		}
		// Set the current tile property on this user, and set that tiles material to glow (emissive)
		for (var i = 0; i < world.mesh.children.length; i++) {
			// console.log(world.mesh.children[i].position.x, user2DCoords.x)
			if (world.mesh.children[i].position.x === user2DCoords.x && world.mesh.children[i].position.z === user2DCoords.z) {
				this.currentTile = world.mesh.children[i] // Set the users current tile
				this.currentTile.material.emissive = new THREE.Color(); // set the glow for the users current tile
			} else {
				world.mesh.children[i].material.emissive = new THREE.Color(0x000000) // if it is NOT the current tile, turn the glow off;
			}
		}

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

		// Both x and y represent the distance from (0, 0) to the edge of the game board.
		// So both 2x and 2y are equal to the total board distance

		// Create the Grid Meshes
		this.createGrid(x, y, tileWidth)

		// Create the Ground Mesh (for Physics)
		this.createGround(x*2) 

	}
	createGrid (x, z, tileWidth) {
		// Create parent mesh for tiles
		this.mesh = new THREE.Object3D();
		// Create tiles and append them to parent
		for (var i = x; i > -x;) {
			for (var j = z; j > -z;){

				// Create the mesh for individual tiles...
				let material = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111} );
				let geometry = new THREE.PlaneGeometry( tileWidth, tileWidth, 1 )
				let tile = new THREE.Mesh( geometry, material, 0/* Mass of zero*/ );

				// Tile Properties
				tile.position.x = j
				tile.position.z = i
				tile.position.y = -9.99;
				tile.rotation.x = - Math.PI / 2;
				tile.receiveShadow = true;

				// Add tile to the world mesh
				this.mesh.add(tile)

				j -= tileWidth;
			}

			i -= tileWidth;
		}
	}
	createGround (boardWidth) {
		// Material
		this.ground_material = Physijs.createMaterial(
			new THREE.MeshLambertMaterial({ color: 0xff0000 }),
			.8, // high friction
			.4 // low restitution
		);

		// Geometry
		this.ground_geometry = new THREE.PlaneGeometry( boardWidth*2, boardWidth*2, 100, 100 );
		this.ground_geometry.computeFaceNormals();
		this.ground_geometry.computeVertexNormals();

		// If your plane is not square as far as face count then the HeightfieldMesh
		// takes two more arguments at the end: # of x faces and # of z faces that were passed to THREE.PlaneMaterial
		this.groundMesh = new Physijs.HeightfieldMesh(
				this.ground_geometry,
				this.ground_material,
				0 // mass
		);
		this.groundMesh.rotation.x = -Math.PI / 2;
		this.groundMesh.position.y = -10
		// this.scene.add( this.groundMesh );
	}
	getMesh () {
		return this.mesh;
	}
	getGroundMesh () {
		return this.groundMesh
	}
}


// ----------------------------- //
// Box Class (for falling boxes) //
// ----------------------------- //
class Box {
	constructor (x, y, z) {

		// Create a PhysiJS box
	  this.mesh = new Physijs.BoxMesh( // We use Physijs library to create a box with physics.
	    new THREE.CubeGeometry( x, y, z ),
	    new THREE.MeshBasicMaterial({ color: 0xfc7b7b })
		)

		// Event Handler for when boxes are added to scene
		this.mesh.addEventListener('ready', function(){
			// Handle new boxes here...
			console.log("New Box Added to Scene")
		})
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
    // this.renderer.shadowMap.enabled = true;
    document.getElementById( 'viewport' ).appendChild( this.renderer.domElement );
    // Physijs.Scene
    this.scene = new Physijs.Scene;
    // Camera
    this.camera();
    // Lights
    this.lights();
    // Objects (world, character, box, etc)
    this.createObjects();
    // Start the event handlers
    this.setControls();
    // Initialize Physics;
    this.initializePhysics();
    // State that Scene is ready for first block
    this.readyForNextBlock = true;
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
	  // Ambient
	  // this.scene.add( new THREE.AmbientLight(0xffffff, .01) )

	  // Point
	  this.pointLight = new THREE.PointLight(0xffffff, 1.1, 10000);
	  this.pointLight.position.y = 100;
	  this.pointLight.position.x = -100;
	  this.pointLight.position.z = -100;
	  this.pointLight.castSahdow = true;
	  this.scene.add(this.pointLight)
	}
	initializePhysics () {
		this.scene.simulate(); // run the physics
	}
	createObjects () {
		// World
		let boardWidth = 100; // Set the number of tiles Across here;
		let tileWidth = 5; // Set the tileWidth here;
		this.world = new World(boardWidth/2, boardWidth/2, tileWidth);
		this.world.boardWidth = boardWidth; // Number of tiles across
		this.world.tileWidth = tileWidth; // Individual tile Width
		this.scene.add( this.world.getMesh() );		

		// Ground
		this.scene.add( this.world.getGroundMesh() );

	  // Character - Create a new Character and add to scene.
		this.user = new Character()
		this.scene.add( this.user.getMesh() );

	  // Test Sphere
	  // this.testsphere = new testSphere(4, 20, 20);
	  // this.scene.add( this.testsphere.getMesh() )
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
		this.user.setCurrentTile(this.world);
		this.renderer.render(this.scene, this.camera)
	}
}

function generateBox () {

}

// Game logic
function nextBlock (scene) {
	newScene.readyForNextBlock = false;

  let boxMesh = new Box(scene.world.tileWidth, scene.world.tileWidth, scene.world.tileWidth)
  boxMesh.mesh.position.y = 60;
  boxMesh.mesh.position.x = 0;
  boxMesh.mesh.position.z = 0;
  scene.scene.add( boxMesh.getMesh() );

	setTimeout(function(){
		scene.readyForNextBlock = true;
	},1000)
}

// Here is where we initalize everything
var newScene = new Scene()
function animate () {
	newScene.scene.simulate() // run the physics
	if (newScene.readyForNextBlock) nextBlock(newScene);
	requestAnimationFrame(animate);
	newScene.frame();
}
animate()





















