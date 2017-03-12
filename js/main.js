'use strict'

/* 
IMPORTANT

Open Chrome from Terminal with following command:
	open /Applications/Google\ Chrome.app --args --allow-file-access-from-files 
*/

// Game logic
function nextBlock (scene) {
	let index, boxMesh, tileToDropOn;
	// newScene.readyForNextBlock = false;

  boxMesh = new Box(scene.world.tileWidth, scene.world.tileWidth, scene.world.tileWidth)
  index = Math.floor(Math.random() * Math.pow(scene.world.boardWidth/scene.world.tileWidth, 2)) // Finds the total number of squares on the board
  tileToDropOn = scene.world.mesh.children[index];

  // Generate Box Position
  boxMesh.mesh.position.y = 60;
  boxMesh.mesh.position.x = tileToDropOn.position.x;
  boxMesh.mesh.position.z = tileToDropOn.position.z;

  console.log(tileToDropOn.material)
  tileToDropOn.material.color = new THREE.Color(0xfe6b7a)
  setTimeout(function(){
  	tileToDropOn.material.color = new THREE.Color(0xffffff)
  }, 4000)

  // Add the boxmesh to the scene
  scene.scene.add( boxMesh.getMesh() );

}


// Here is where we initalize everything
var addAnotherBlock = true;
var newScene = new Scene(100, 5) // (boardwidth, tilewidth)

function animate () {
	newScene.scene.simulate() // run the physics
	
	// adds another box in a few seconds
	if (addAnotherBlock){
		addAnotherBlock = false;
		setTimeout(function(){
			addAnotherBlock = true
			nextBlock(newScene)
		}, 3000)
	}

	requestAnimationFrame(animate);
	newScene.frame();
}

animate()





















