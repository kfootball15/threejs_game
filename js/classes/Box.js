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