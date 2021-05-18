console.log("Hello");

const screenX = 0;
const screenWidth = document.getElementById("sky").offsetWidth;

const minCloudHeight = document.getElementById("sky").offsetHeight * .10;
const maxCloudHeight = document.getElementById("sky").offsetHeight * .40;

const minCloudWidth = screenWidth * .10;
const maxCloudWidth = screenWidth * .30;

const minCloudY = document.getElementById("sky").offsetHeight * .30;
const maxCloudY = document.getElementById("sky").offsetHeight * .90;

const minCloudX = 0;
const maxCloudX = screenWidth;


/******************************************
	Scrolling functions
******************************************/

var rotationY = 0;
var helicoFlag = false;

document.addEventListener("wheel", function (e) {
	
	// Rotate blade
	rotationY += e.deltaY*8;
	// console.log(rotationY);
	document.getElementById("blade").style.transform = "rotateY("+rotationY+"deg) rotateZ("+((rotationY%360)-180)/15+"deg)";
	
	// Vrrrr animation
	if (abs(rotationY) > 4*360 && !helicoFlag) {
		helicoFlag = true;
		helico();
	}
	
	// Scroll clouds
	let clouds = document.getElementsByClassName("cloud");
	for (let i = 0; i < clouds.length; i++) {
		clouds[i].style.marginLeft = (clouds[i].style.marginLeft.replace("px", "") - e.deltaY) + "px";
		
		let cloudX = clouds[i].style.marginLeft.replace("px", "");
		let cloudWidth = clouds[i].style.width.replace("px", "");
		
		if (-screenWidth*2 > cloudX || cloudX > screenWidth*2)
			clouds[i].setAttribute("dirty", "");
	}
	
	document.querySelectorAll("[dirty]").forEach(function(item, index, array) {
		item.parentNode.removeChild(item);
	});
	
	if (getRandomPercent() < 50) {
		if (e.deltaY > 0) 
			generateCloud(screenWidth*1.5, minCloudY, maxCloudY);
		else
			generateCloud(-screenWidth*0.5, minCloudY, maxCloudY);
		
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

for (let i = 0; i < 20; i++) {
	generateCloudRandomX(-screenWidth*0.5, screenWidth*1.5, minCloudY, maxCloudY)
}

function generateCloudRandomX(minX, maxX, minY, maxY) {
	let myCloud = document.createElement("div");
	myCloud.classList.add("cloud");
	myCloud.style.height = getRandomArbitrary(minCloudHeight, maxCloudHeight) + "px";
	myCloud.style.width = getRandomArbitrary(minCloudWidth, maxCloudWidth) + "px";
	
	myCloud.style.marginLeft = getRandomArbitrary(minX, maxX) + "px";
	myCloud.style.marginTop = getRandomArbitrary(minY, maxY) + "px";
	
	document.getElementById("sky").appendChild(myCloud);
}


function generateCloud(X, minY, maxY) {
	let myCloud = document.createElement("div");
	myCloud.classList.add("cloud");
	myCloud.style.height = getRandomArbitrary(minCloudHeight, maxCloudHeight) + "px";
	myCloud.style.width = getRandomArbitrary(minCloudWidth, maxCloudWidth) + "px";
	
	myCloud.style.marginLeft = X + "px";
	myCloud.style.marginTop = getRandomArbitrary(minY, maxY) + "px";
	
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