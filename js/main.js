'use strict'

/* 
IMPORTANT

Open Chrome from Terminal with following command:
	open /Applications/Google\ Chrome.app --args --allow-file-access-from-files 
*/

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





















