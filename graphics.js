/* setup */
const near = 1; const far = 1000; // camera visualization distances
const xColour = 0xff0000; const yColour = 0x00ff00; const zColour = 0x0000ff;
const origin = new THREE.Vector3(0,0,0);
const xAxis = new THREE.Vector3(1,0,0);
const yAxis = new THREE.Vector3(0,1,0);
const zAxis = new THREE.Vector3(0,0,1);
const fixedAxis = 1; const eulerAxis = 2; const axisAngle = 3;
var angleIncrement; // each frame this many degrees are incremented
var desiredRoll, desiredPitch, desiredYaw; // r p y => x y z rotations
var rotationAxis; // axis for axis angle rotations
var rotationAngle; // angle for axis angle rotations
var rotationType; // type of rotation to perform

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

const worldMatrix = new THREE.Matrix4();
var xRotMatrix = new THREE.Matrix4();
var yRotMatrix = new THREE.Matrix4();
var zRotMatrix = new THREE.Matrix4();
var fixedRotMatrix = new THREE.Matrix4();
var tempMatrix = new THREE.Matrix4();

var i = 0; var j = 0; var k = 0; // primary rotations
var xDone = false; var yDone = false; var zDone = false; // primary rotations
var w = 0; // axis angle rotations
var rotationComplete = true;
var newMovement = false;

// rotates about the base frame's axes
function rotateFixedAxis(roll, pitch, yaw){
	var xDir = 1; var yDir = 1; var zDir = 1;
	if (roll < 0) { xDir = -1; roll = -roll; }
	if (pitch < 0) { yDir = -1; pitch = -pitch; }
	if (yaw < 0) { zDir = -1; yaw = -yaw; }
  if (i < roll) {
		i += angleIncrement;
		xRotMatrix.makeRotationX(xDir*THREE.Math.degToRad(i));
		fixedRotMatrix.copy(xRotMatrix);
		toolFrame.rotation.setFromRotationMatrix(fixedRotMatrix);
	}
	else {
		xRotMatrix.makeRotationX(xDir*THREE.Math.degToRad(roll));
		fixedRotMatrix.copy(xRotMatrix);
		toolFrame.rotation.setFromRotationMatrix(fixedRotMatrix);
		xDone = true;
	}
	if (xDone) {
		if (j < pitch) {
			j += angleIncrement;
			yRotMatrix.makeRotationY(yDir*THREE.Math.degToRad(j));
			fixedRotMatrix.multiplyMatrices(yRotMatrix,xRotMatrix);
			toolFrame.rotation.setFromRotationMatrix(fixedRotMatrix);
			//console.log(j);
		}
		else {
			yRotMatrix.makeRotationY(yDir*THREE.Math.degToRad(pitch));
			fixedRotMatrix.multiplyMatrices(yRotMatrix,xRotMatrix);
			toolFrame.rotation.setFromRotationMatrix(fixedRotMatrix);
			yDone = true;
		}
		if (yDone) {
			if (k < yaw) {
				k += angleIncrement;
				zRotMatrix.makeRotationZ(zDir*THREE.Math.degToRad(k));
				tempMatrix.multiplyMatrices(yRotMatrix,xRotMatrix);
				fixedRotMatrix.multiplyMatrices(zRotMatrix,tempMatrix);
				toolFrame.rotation.setFromRotationMatrix(fixedRotMatrix);
				//console.log(k);
			}
			else {
				zRotMatrix.makeRotationZ(zDir*THREE.Math.degToRad(yaw));
				tempMatrix.multiplyMatrices(yRotMatrix,xRotMatrix);
				fixedRotMatrix.multiplyMatrices(zRotMatrix,tempMatrix);
				toolFrame.rotation.setFromRotationMatrix(fixedRotMatrix);
				zDone = true;
				console.log((xRotMatrix.premultiply(yRotMatrix)).elements);
				console.log(fixedRotMatrix.elements);
				//console.log(pitch);
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
		toolFrame.rotateOnAxis(axis, dir*THREE.Math.degToRad(angleIncrement));
	}
	else {
		rotationComplete = true;
	}
}
    
/* this function and the following call cause an endless loop of rendering */
function update() {
  if (newMovement){
	var startingRotation = new THREE.Matrix4();
	startingRotation.copy(worldMatrix);
    toolFrame.rotation.setFromRotationMatrix(startingRotation);
    //toolFrame.rotation.set(0,0,0);
    newMovement = false; rotationComplete = false;
    i=0; j=0; k=0; w=0;
    xDone=false; yDone=false; zDone=false;
    desiredRoll = parseFloat(xSlider.value); desiredPitch = parseFloat(ySlider.value); desiredYaw = parseFloat(zSlider.value);
    console.log("desired angles:");
    console.log("x (roll): "+desiredRoll); console.log("y (pitch): "+desiredPitch); console.log("z (yaw): "+desiredYaw);
    
    rotationAxis = new THREE.Vector3(parseFloat(axisAngleX.value), parseFloat(axisAngleY.value), parseFloat(axisAngleZ.value));
    rotationAxis.normalize();
    rotationAngle = parseFloat(axisAngleTheta.value);
    
    console.log("desired axis and angle:");
    console.log("["+axisAngleX.value+" "+axisAngleY.value+" "+axisAngleZ.value+"]"+" at "+rotationAngle+" degrees");
    console.log("normalized to:");
    console.log("["+rotationAxis.x+" "+rotationAxis.y+" "+rotationAxis.z+"]");
  }
  if (!rotationComplete){
    if (rotationType == fixedAxis){
      rotateFixedAxis(desiredRoll, desiredPitch, desiredYaw);
    }
    else if (rotationType == eulerAxis){
      rotateEulerAngles(desiredRoll, desiredPitch, desiredYaw);
    }
    else if (rotationType == axisAngle){
      rotateAxisAngles(rotationAxis, rotationAngle);
    }
  }
	renderer.render(scene, camera);
	requestAnimationFrame(update);
}

// this means that rotating x then y then z works like fixed angles
// and rotating z then y then x works like euler angles
//toolFrame.rotation.order = 'ZYX'; // must use this for fixed angles using euler rotations

angleIncrement = 1;//0.25; // this will cause issues eventually because it can't achieve every angle

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

// Gain access to the sliders
var xSlider = document.getElementById("xRange");
var ySlider = document.getElementById("yRange");
var zSlider = document.getElementById("zRange");
// Get angles from the sliders
var xOutput = document.getElementById("xAngles");
var yOutput = document.getElementById("yAngles");
var zOutput = document.getElementById("zAngles");
// Put the default slider values into the webpage
xOutput.innerHTML = xSlider.value;
yOutput.innerHTML = ySlider.value;
zOutput.innerHTML = zSlider.value;
// Set the slider increment equal to the value defined in the calculations
xSlider.step=angleIncrement;
ySlider.step=angleIncrement;
zSlider.step=angleIncrement;
// Gain access to the radio buttons
var fixedRadio = document.getElementById("r1");
var eulerRadio = document.getElementById("r2");
var axisRadio = document.getElementById("r3");
// Gain axis to the axis angle data
var axisAngleX = document.getElementById("xVector");
var axisAngleY = document.getElementById("yVector");
var axisAngleZ = document.getElementById("zVector");
var axisAngleTheta = document.getElementById("axisAngle");
// Update the current slider value (each time you drag the slider handle)
xSlider.oninput = function() {
	xOutput.innerHTML = this.value;
}
ySlider.oninput = function() {
	yOutput.innerHTML = this.value;
}
zSlider.oninput = function() {
	zOutput.innerHTML = this.value;
}
// when the button is pressed, update the desired angles based on the sliders and activate the animation
anglesButton = document.getElementById("anglesButton");
anglesButton.onclick = function() {
  newMovement = true;
  if (fixedRadio.checked) { rotationType = fixedAxis; console.log(fixedRadio.value); }
  else if (eulerRadio.checked) { rotationType = eulerAxis; console.log(eulerRadio.value); }
  else if (axisRadio.checked) {
    rotationType = axisAngle;
    console.log("axis vector: "+axisAngleX.value+axisAngleY.value+axisAngleZ.value);
    console.log("axis angle: "+axisAngleTheta.value);
  }
}
// this causes the scene to be rendered and then update() recursively calls itself
requestAnimationFrame(update); // 60 fps