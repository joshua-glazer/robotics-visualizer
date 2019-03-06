  	/* setup */
  	const near = 1; const far = 1000; // camera visualization distances
  	const xColour = 0xff0000; const yColour = 0x00ff00; const zColour = 0x0000ff;
  	const origin = new THREE.Vector3(0,0,0);
  	const xAxis = new THREE.Vector3(1,0,0);
  	const yAxis = new THREE.Vector3(0,1,0);
  	const zAxis = new THREE.Vector3(0,0,1);
  	
  	var angleIncrement; // each frame this many degrees are incremented
  	var desiredRoll, desiredPitch, desiredYaw; // r p y => x y z rotations
  	var rotationAxis; // axis for axis angle rotations
  	var rotationAngle; // angle for axis angle rotations
  	var isFixedAxis = false; // for fixed axis rotations
  	var isEulerAngles = false; // for euler angle rotations
  	var isAxisAngle = false; // for axis angle rotations
  	
  	/* renderer */
  	var renderer = new THREE.WebGLRenderer();
  	renderer.setSize(window.innerWidth, window.innerHeight);
  	
  	const container = document.querySelector('#container');
  	container.appendChild(renderer.domElement);	
  	
  	/* scene */
  	var scene = new THREE.Scene();
  	
  	/* camera */
  	var camera = 
  		new THREE.PerspectiveCamera(
  			10,
  			window.innerWidth / window.innerHeight,
  			near,
  			far
  		);
  	
  	camera.up = zAxis;
  	camera.position.set(10, 10, 10);
  	//camera.position.set(3, 13, 7);
  	//camera.position.set(0, 10, 0);
  	camera.lookAt(scene.position);
  	
  	scene.add(camera);
  	
  	// resizes window automatically
  	window.addEventListener( 'resize', 
  		function () {
  			camera.aspect = window.innerWidth / window.innerHeight;
  			camera.updateProjectionMatrix();
  			renderer.setSize( window.innerWidth, window.innerHeight );
  			//controls.handleResize();
  		},
  		false
  	);
  	
  	/* frames */
  	// I've sometimes noticed performance issues when rotating ArrowHelpers
  	
  	//var baseFrame = new THREE.AxisHelper(0.5);
  	//var toolFrame = new THREE.AxisHelper(1);
  	
  	var baseFrame = new THREE.Object3D();
  	var baseSize = 0.5;
  	var baseX = new THREE.ArrowHelper(xAxis, origin, baseSize, xColour);
  	var baseY = new THREE.ArrowHelper(yAxis, origin, baseSize, yColour);
  	var baseZ = new THREE.ArrowHelper(zAxis, origin, baseSize, zColour);
  	baseFrame.add(baseX); baseFrame.add(baseY); baseFrame.add(baseZ);
  	
  	var toolSize = 1;
  	var toolFrame = new THREE.Object3D();
  	var toolX = new THREE.ArrowHelper(xAxis, origin, toolSize, xColour);
  	var toolY = new THREE.ArrowHelper(yAxis, origin, toolSize, yColour);
  	var toolZ = new THREE.ArrowHelper(zAxis, origin, toolSize, zColour);
  	toolFrame.add(toolX); toolFrame.add(toolY); toolFrame.add(toolZ);
  	
  	/*
  	// this will be useful very soon when I start doing rotations of vectors
  	var vector = new THREE.ArrowHelper(xAxis, origin, toolSize, yColour);
  	vector.rotation.y -= 45*3.14159/180;
  	scene.add(vector);
  	*/
  	
  	scene.add(baseFrame);
  	scene.add(toolFrame);
  	
  	/* functions */
  	
  	// from https://stackoverflow.com/questions/11119753/how-to-rotate-a-object-on-axis-world-three-js
  	var rotWorldMatrix;
  	// Rotate an object around an arbitrary axis in world space       
  	function rotateAroundWorldAxis(object, axis, radians) {
  		rotWorldMatrix = new THREE.Matrix4();
  		rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
  		//rotWorldMatrix.multiplySelf(object.matrix);        // pre-multiply
  		rotWorldMatrix.multiply(object.matrix);        // pre-multiply
  		object.matrix = rotWorldMatrix;
  		//object.rotation.getRotationFromMatrix(object.matrix, object.scale);
  		object.rotation.setFromRotationMatrix(object.matrix);
  	}
  
  	var i = 0; var j = 0; var k = 0; // primary rotations
  	var xDone = false; var yDone = false; var zDone = false; // primary rotations
  	var w = 0; // axis angle rotations
  	var rotationComplete = false;
  	
  	// rotates about the base frame's axes
  	function rotateFixedAxis(roll, pitch, yaw){
  		var xDir = 1; var yDir = 1; var zDir = 1;
  		if (roll < 0) { xDir = -1; roll = -roll; }
  		if (pitch < 0) { yDir = -1; pitch = -pitch; }
  		if (yaw < 0) { zDir = -1; yaw = -yaw; }
  
  		if (i < roll) {
  			i += angleIncrement;
  			rotateAroundWorldAxis(toolFrame, xAxis, xDir*THREE.Math.degToRad(angleIncrement));
  		}
  		else {
  			xDone = true;
  		}
  		if (xDone) {
  			if (j < pitch) {
  				j += angleIncrement;
  				rotateAroundWorldAxis(toolFrame, yAxis, yDir*THREE.Math.degToRad(angleIncrement));
  			}
  			else {
  				yDone = true;
  			}
  			if (yDone) {
  				if (k < yaw) {
  					k += angleIncrement;
  					rotateAroundWorldAxis(toolFrame, zAxis, zDir*THREE.Math.degToRad(angleIncrement));
  				}
  				else {
  					zDone = true;
  					rotationComplete = true;
  				}
  			}
  		}
  	}
  	
  	// rotates about the tool frame's axes
  	function rotateEulerAngles(roll, pitch, yaw){
  		var xDir = 1; var yDir = 1; var zDir = 1;
  		if (roll < 0) { xDir = -1; roll = -roll; }
  		if (pitch < 0) { yDir = -1; pitch = -pitch; }
  		if (yaw < 0) { zDir = -1; yaw = -yaw; }
  		
  		if (k < yaw) {
  			k += angleIncrement;
  			toolFrame.rotateZ(zDir*THREE.Math.degToRad(angleIncrement));
  		}
  		else {
  			zDone = true;
  		}
  		if (zDone) {
  			if (j < pitch) {
  				j += angleIncrement;
  				toolFrame.rotateY(yDir*THREE.Math.degToRad(angleIncrement));
  			}
  			else {
  				yDone = true;
  			}
  			if (yDone) {
  				if (i < roll) {
  					i += angleIncrement;
  					toolFrame.rotateX(xDir*THREE.Math.degToRad(angleIncrement));
  				}
  				else {
  					xDone = true;
  					rotationComplete = true;
  				}
  			}
  		}
  	}
  	
  	// rotates about the tool frame's axes
  	function rotateAxisAngles(axis, angle){
  		var dir = 1;
  		if (angle < 0) { dir = -1; angle = -angle; }
  		
  		if (w < angle) {
  			w += angleIncrement;
  			if (isEulerAngles){
  				toolFrame.rotateOnAxis(axis, dir*THREE.Math.degToRad(angleIncrement));
  			}
  			else if (isFixedAxis) {
  				rotateAroundWorldAxis(toolFrame, axis, dir*THREE.Math.degToRad(angleIncrement));
  			}
  		}
  		else {
  			rotationComplete = true;
  		}
  	}
  	
  	/* this function and the following call cause an endless loop of rendering */
  	function update() {
  		if (!rotationComplete){
  			if (isFixedAxis){
  				rotateFixedAxis(desiredRoll, desiredPitch, desiredYaw);
  			}
  			else if (isEulerAngles){
  				rotateEulerAngles(desiredRoll, desiredPitch, desiredYaw);
  			}
  			else if (isAxisAngle){
  				rotateAxisAngles(rotationAxis, rotationAngle);
  			}
  		}
  		/*
  		else { // just to make sure it really is rotating about the desired frame
  			rotationComplete = false;
  			isAxisAngle = true;
  		}
  		*/
  		renderer.render(scene, camera);
  		requestAnimationFrame(update);
  	}
  	
  	angleIncrement = 1;//0.25; // this will cause issues eventually because it can't achieve every angle
  	
  	// this means that rotating x then y then z works like fixed angles
  	// and rotating z then y then x works like euler angles
  	//toolFrame.rotation.order = 'ZYX'; // must use this for fixed angles using euler rotations
  	
  	isFixedAxis = true;
  	//isEulerAngles = true;
  	//isAxisAngle = true;
  	
  	desiredRoll = -180;
  	desiredPitch = -20;
  	desiredYaw = 36.9;
  	
  	rotationAngle = 30;
  	rotationAxis = new THREE.Vector3(1,1,0);
  	
  	/*
  	// apply initial transforms
  	// this doesn't work because fixed angles expects to rotate around world and not base frame
  	var r = -90;
  	var p = 0;
  	var y = 180;
  	rotateAroundWorldAxis(baseFrame, xAxis, THREE.Math.degToRad(r));
  	rotateAroundWorldAxis(baseFrame, yAxis, THREE.Math.degToRad(p));
  	rotateAroundWorldAxis(baseFrame, zAxis, THREE.Math.degToRad(y));
  	rotateAroundWorldAxis(toolFrame, xAxis, THREE.Math.degToRad(r));
  	rotateAroundWorldAxis(toolFrame, yAxis, THREE.Math.degToRad(p));
  	rotateAroundWorldAxis(toolFrame, zAxis, THREE.Math.degToRad(y));
  	*/
  	
  	// this causes the scene to be rendered and then update() recursively calls itself
  	requestAnimationFrame(update); // 60 fps
    
    var xSlider = document.getElementById("myRange");
  	var ySlider = document.getElementById("myRange");
  	var zSlider = document.getElementById("myRange");
  	var xOutput = document.getElementById("demo");
  	var yOutput = document.getElementById("demo");
  	var zOutput = document.getElementById("demo");
  	xOutput.innerHTML = xSlider.value; // Display the default slider value
    yOutput.innerHTML = ySlider.value; // Display the default slider value
    zOutput.innerHTML = zSlider.value; // Display the default slider value
  
  	// Update the current slider value (each time you drag the slider handle)
  	slider.oninput = function() {
  		output.innerHTML = this.value;
  	}
   
  