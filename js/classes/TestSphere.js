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