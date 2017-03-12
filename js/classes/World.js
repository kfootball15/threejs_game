// ----------- //
// World Class //
// ----------- //
class World {
	constructor (boardwidth, tilewidth) {

		// Both x and y represent the distance from (0, 0) to the edge of the game board.
		// So both 2x and 2y are equal to the total board distance

		// Create the Grid Meshes
		this.createGrid(boardwidth/2, boardwidth/2, tilewidth)

		// Create the Ground Mesh (for Physics)
		this.createGround(boardwidth) 

		this.boardWidth = boardwidth; // Number of tiles across
		this.tileWidth = tilewidth; // Individual tile Width

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

	}
	getMesh () {
		return this.mesh;
	}
	getGroundMesh () {
		return this.groundMesh
	}
}