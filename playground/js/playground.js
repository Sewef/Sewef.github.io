console.log("Hello");


/******************************************
	Blade rotation
******************************************/


var rotationY = 0;
var helicoFlag = false;
document.addEventListener("wheel", function (e) {
	rotationY += e.deltaY*8;
	// console.log(((rotationY%360)-180)/18);
	document.getElementById("blade").style.transform = "rotateY("+rotationY+"deg) rotateZ("+((rotationY%360)-180)/15+"deg)";
	
	if (abs(rotationY) > 4*360 && !helicoFlag) {
		helicoFlag = true;
		helico();
	}
	return false;
}, true);

function helico() {
	console.log("vrrr");
	document.getElementById("animation").style.display = "block";
}


/******************************************
	Populate Sky
******************************************/
const minCloudHeight = document.getElementById("sky").offsetHeight * .10;
const maxCloudHeight = document.getElementById("sky").offsetHeight * .40;

const minCloudWidth = document.getElementById("sky").offsetWidth * .10;
const maxCloudWidth = document.getElementById("sky").offsetWidth * .30;

const minCloudY = document.getElementById("sky").offsetHeight * .30;
const maxCloudY = document.getElementById("sky").offsetHeight * .90;

for (let i = 0; i < 9; i++) {
	let myCloud = document.createElement("div");
	myCloud.classList.add("cloud");
	myCloud.style.height = getRandomArbitrary(minCloudHeight, maxCloudHeight) + "px";
	myCloud.style.width = getRandomArbitrary(minCloudWidth, maxCloudWidth) + "px";
	
	myCloud.style.marginLeft = getRandomArbitrary(0, document.getElementById("sky").offsetWidth) + "px";
	myCloud.style.marginTop = getRandomArbitrary(minCloudY, maxCloudY) + "px";
	
	document.getElementById("sky").appendChild(myCloud);
}
















/******************************************
	Touchscreen support
******************************************/

if("ontouchstart" in window){
   document.addEventListener('touchstart', touchStartHandler, false);
   document.addEventListener('touchmove', touchMoveHandler, false);
   // document.addEventListener('touchend', touchEndHandler);
}

var yPosStart;
function touchStartHandler(e) {
	yPosStart = e.touches[0].clientY;
}

function touchMoveHandler(e) {
	// console.log(e.touches[0].clientY - yPosStart);
	document.dispatchEvent(new WheelEvent('wheel', { 'deltaY': (e.touches[0].clientY - yPosStart) / 10 }));
	yPosStart = e.touches[0].clientY;
}


/******************************************
	Utils
******************************************/
function abs(n) {
	return (n>=0) ? n : -n;
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}