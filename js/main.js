'use strict'

/* 
IMPORTANT

Open Chrome from Terminal with following command:
	open /Applications/Google\ Chrome.app --args --allow-file-access-from-files 
*/

Physijs.scripts.worker = './js/physijs_worker.js';
Physijs.scripts.ammo = './ammo.js';

var initScene, render, renderer, scene, camera, box, characterMesh, characterArray, loader;

function init() {
	initGraphics();

	// initPhysics();

	setControls();

	createObjects();

	initInput();

	requestAnimationFrame( render );
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function setControls() {
	controls = {
		left: false,
		up: false,
		right: false,
		down: false
	}

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

}

function initInput() {

	const movementSize = 5;
	function moveLeft() {
		console.log("kjdlaf")
		characterMesh.position.x -= movementSize;

		characterMesh.material.map = loader.load( characterArray[1][0] );
		characterMesh.material.alphaMap = loader.load( characterArray[1][1] );
		characterMesh.material.needsUpdate = true;
	}	
	function moveRight() {
		characterMesh.position.x += movementSize;
	}	
	function moveUp() {
		characterMesh.position.z -= movementSize;
	}	
	function moveDown() {
		characterMesh.position.z += movementSize;
	}

    window.addEventListener( 'keydown', function( event ) {

    	if([32, 37, 38, 39, 40].indexOf(event.keyCode) > -1) {
	        event.preventDefault();
	    }

    	console.log(event.keyCode)
	    switch ( event.keyCode ) {
		    // Left
		    case 37:
			    moveLeft();
		    break;
		    // Up		    
		    case 38:
			    moveUp();
		    break;
		    // Right
		    case 39:
			    moveRight();
		    break;		    
		    // Down
		    case 40:
			    moveDown();
		    break;
	    }

    }, false );

    window.addEventListener( 'keyup', function( event ) {

	    characterMesh.material.map = loader.load( characterArray[0][0] );
		characterMesh.material.alphaMap = loader.load( characterArray[0][1] );
		characterMesh.material.needsUpdate = true;

    }, false );
}

function initGraphics() {
	renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementById( 'viewport' ).appendChild( renderer.domElement );

    scene = new Physijs.Scene;

    // Texture Loader
    loader = new THREE.TextureLoader();

    // Camera
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    camera.position.set( 0, 0, 100 );
    camera.lookAt( scene.position );
    scene.add( camera );

    window.addEventListener( 'resize', onWindowResize, false );
}

function createObjects() {
	// Lights
    var light, materials;

    // Ambient
    scene.add( new THREE.AmbientLight(0xFFFFFF) )

    // Directional
 	// light = new THREE.DirectionalLight( 0xdfebff, 1.75 );
	// light.position.set( 5, 5, 5 );
	// light.position.multiplyScalar( 1.3 );

	// light.castShadow = true;

	// light.shadow.mapSize.width = 1024;
	// light.shadow.mapSize.height = 1024;

	// var d = 300;

	// light.shadow.camera.left = - d;
	// light.shadow.camera.right = d;
	// light.shadow.camera.top = d;
	// light.shadow.camera.bottom = - d;

	// light.shadow.camera.far = 1000;

	// scene.add(light)


	// Ground
	var groundTexture = loader.load( './textures/terrain/grid.png' );
	groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
	groundTexture.repeat.set( 25, 25 );
	groundTexture.anisotropy = 16;

	var groundMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, map: groundTexture } );

	var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 100, 100 ), groundMaterial );
	// mesh.position.y = - 250;
	mesh.position.y = -9.5;
	mesh.rotation.x = - Math.PI / 2;
	mesh.receiveShadow = true;
	scene.add( mesh );		


    // Box
    box = new Physijs.BoxMesh(
        new THREE.CubeGeometry( 5, 5, 5 ),
        new THREE.MeshBasicMaterial({ color: 0x888888 })
    );
    scene.add( box );


    // Character
	var characterTexture = loader.load( 'textures/character/f1.png' );
	var characterTextureAlpha = loader.load( 'textures/character/f1_alpha.png' );
	characterArray = [['textures/character/f1.png', 'textures/character/f1_alpha.png'], ['textures/character/f2.png', 'textures/character/f2_alpha.png']]

	var characterMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, map: characterTexture, alphaMap: characterTextureAlpha } );
	characterMaterial.transparent = true;

	characterMesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 20, 20 ), characterMaterial );
	characterMesh.position.y = 0;
	characterMesh.castShadow = true;
	characterMesh.receiveShadow = true;
	scene.add( characterMesh );

};

function render() {
    scene.simulate(); // run physics
    renderer.render( scene, camera); // render the scene
    requestAnimationFrame( render );
};



window.onload = init();

