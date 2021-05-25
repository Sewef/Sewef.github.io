console.log("Hello");

const screenX = 0;
const screenWidth = document.getElementById("sky").offsetWidth;

const minCloudHeight = 10;
const maxCloudHeight = 40;

const minCloudWidth = 15;
const maxCloudWidth = 30;

const minCloudY = 10;
const maxCloudY = 70;

const minCloudX = -50;
const maxCloudX = 150;


/******************************************
	Scrolling functions
******************************************/

var rotationY = 0;
var helicoFlag = false;

document.addEventListener("wheel", function (e) {
	// console.log(e.deltaY);
	
	// Rotate blade
	rotationY += e.deltaY*8;
	document.getElementById("blade").style.transform = "rotateY("+rotationY+"deg) rotateZ("+((rotationY%360)-180)/15+"deg)";
	
	// Vrrrr animation
	if (abs(rotationY) > 4*360 && !helicoFlag) {
		helicoFlag = true;
		helico();
	}
	
	// Scroll clouds
	let clouds = document.getElementsByClassName("cloud");
	for (let i = 0; i < clouds.length; i++) {
		clouds[i].style.left = (clouds[i].style.left.replace("%", "") - e.deltaY/5) + "%";
		
		let cloudX = clouds[i].style.left.replace("%", "");
		let cloudWidth = clouds[i].style.width.replace("%", "");
		
		// If too out of screen, mark to remove
		if (cloudX < -200 || cloudX > 200)
			clouds[i].setAttribute("dirty", "");
	}
	
	// Remove all "dirty" elements
	document.querySelectorAll("[dirty]").forEach(function(item, index, array) {
		item.parentNode.removeChild(item);
	});
	
	// Spawn a new cloud sometimes
	if (getRandomPercent() < 50) {
		if (e.deltaY > 0) 
			generateCloud(maxCloudX, minCloudY, maxCloudY);
		else
			generateCloud(minCloudX, minCloudY, maxCloudY);
		
	}
	
	return false;
}, true);

// Display vrrr after a time
function helico() {
	console.log("vrrr");
	document.getElementById("animation").style.display = "block";
}


/******************************************
	Populate Sky
******************************************/

// Startup clouds
// generateCloudRandomX(-50, 150, minCloudY, maxCloudY)
for (let i = 0; i < screenWidth/32; i++) {
	if (getRandomPercent() < 40)
		generateCloudRandomX(minCloudX, maxCloudX, minCloudY, maxCloudY)
}

// Random X value
function generateCloudRandomX(minX, maxX, minY, maxY) {
	generateCloud(getRandomArbitrary(minX, maxX), minY, maxY);
}

// Fixed X value
function generateCloud(X, minY, maxY) {
	let myCloud = document.createElement("div");
	myCloud.classList.add("cloud");
	
	let height = getRandomArbitrary(minCloudHeight, maxCloudHeight);
	let width = getRandomArbitrary(minCloudWidth, maxCloudWidth)
	
	if (width/height <= .4) {
		width = height * .4;
		console.log("resized");
	}
	
	myCloud.style.height = height + "%";
	myCloud.style.width = width + "%";
	
	myCloud.style.left = X + "%";
	myCloud.style.top = getRandomArbitrary(minY, maxY) + "%";
	
	let grayScale = min(255,getRandomArbitrary(200, 300));
	myCloud.style.background = "rgb("+grayScale+","+grayScale+","+grayScale+")";
	
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

function getRandom() {
  return Math.random();
}

function getRandomPercent() {
  return Math.random()*100;
}

function min(n1, n2) {
	return (n1 < n2 ? n1 : n2);
}

function max(n1, n2) {
	return (n1 > n2 ? n1 : n2);
}