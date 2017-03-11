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