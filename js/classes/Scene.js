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
		let boardWidth = 90; // Set the number of tiles Across here;
		let tileWidth = 2.5; // Set the tileWidth here;
		this.world = new World(boardWidth/2, boardWidth/2, tileWidth);
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