console.log("Hello");

const minObjectGen = -50;
const maxObjectGen = 150;

const despawnLeft = -150;
const despawnRight = 250;


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
		clouds[i].style.left = (clouds[i].style.left.replace("%", "") - e.deltaY/4) + "%";
		
		let cloudX = clouds[i].style.left.replace("%", "");
		let cloudWidth = clouds[i].style.width.replace("%", "");
		
		// If too out of screen, mark to remove
		if (cloudX < despawnLeft || cloudX > despawnRight)
			clouds[i].setAttribute("dirty", "");
	}
	
	// Scroll trees
	let trees = document.getElementsByClassName("tree");
	for (let i = 0; i < trees.length; i++) {
		trees[i].style.left = (trees[i].style.left.replace("%", "") - e.deltaY/4) + "%";
		
		let treeX = trees[i].style.left.replace("%", "");
		let treeWidth = trees[i].style.width.replace("%", "");
		
		// If too out of screen, mark to remove
		if (treeX < despawnLeft || treeX > despawnRight)
			trees[i].setAttribute("dirty", "");
	}
	
	// Remove all "dirty" elements
	document.querySelectorAll("[dirty]").forEach(function(item, index, array) {
		item.parentNode.removeChild(item);
	});
	
	let randomPercent = getRandomPercent();
	
	// Spawn a new cloud sometimes
	if (randomPercent < 50) {
		if (e.deltaY > 0) 
			generateCloud(maxObjectGen, minCloudY, maxCloudY);
		else
			generateCloud(minObjectGen, minCloudY, maxCloudY);
	}
	
	// Spawn a new tree sometimes
	if (randomPercent < 90) {
		if (e.deltaY > 0) 
			generateTree(maxObjectGen, minTreeY, maxTreeY);
		else
			generateTree(minObjectGen, minTreeY, maxTreeY);
	}
	
	if (randomPercent < 2) {
		generateForest(e.deltaY < 0);
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

const minCloudHeight = 10;
const maxCloudHeight = 40;

const minCloudWidth = 10;
const maxCloudWidth = 35;

const minCloudY = 10;
const maxCloudY = 75;

// Startup clouds
for (let i = 0; i < 40; i++) {
	if (getRandomPercent() < 40)
		generateCloudRandomX(minObjectGen, maxObjectGen, minCloudY, maxCloudY)
}

// Random X value
function generateCloudRandomX(minX, maxX, minY, maxY) {
	generateCloud(getRandomArbitrary(minX, maxX), minY, maxY);
}

// Fixed X value
function generateCloud(X, minY, maxY) {
	const minRatio = .6;
	
	let myCloud = document.createElement("div");
	myCloud.classList.add("cloud");
	
	let height = getRandomArbitrary(minCloudHeight, maxCloudHeight);
	let width = getRandomArbitrary(minCloudWidth, maxCloudWidth)
	
	if (width/height <= minRatio) {
		width = height * minRatio;
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
	Populate Ground
******************************************/
const minTreeHeight = 25;
const maxTreeHeight = 80;

const minTreeWidth = 10;
const maxTreeWidth = 35;

const minTreeY = 5;
const maxTreeY = 95;

for (let i = 0; i < 100; i++) {
	if (getRandomPercent() < 70)
		generateTreeRandomX(minObjectGen, maxObjectGen, minTreeY, maxTreeY)
}

// Random X value
function generateTreeRandomX(minX, maxX, minY, maxY) {
	generateTree(getRandomArbitrary(minX, maxX), minY, maxY);
}

// Fixed X value
function generateTree(X, minY, maxY) {
	const ratio = .10;
	
	let myTree = document.createElement("div");
	myTree.classList.add("tree");
	
	let height = getRandomArbitrary(minTreeHeight, maxTreeHeight);
	let width = height * ratio;
	
	myTree.style.height = height + "%";
	myTree.style.width = width + "%";
	
	myTree.style.left = X + "%";
	
	let zAxis = getRandomArbitrary(minY, maxY);
	
	myTree.style.bottom = zAxis + "%";
	myTree.style.zIndex = 100-parseInt(zAxis);
	
	myTree.style.backgroundColor = "rgba(0,0,0," + getRandomArbitrary(20,60)/100 + ")";
	
	document.getElementById("ground").appendChild(myTree);
}

function generateForest(leftSide) {
	const xMin = leftSide ? despawnLeft : 150;
	const xMax = leftSide ? -50 : despawnRight;
	for (let i = 0; i<50; i++) {
		if (getRandomPercent() < 70)
			generateTreeRandomX(xMin, xMax, minTreeY, maxTreeY);
	}
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
	document.dispatchEvent(new WheelEvent('wheel', { 'deltaY': -((e.touches[0].clientY - yPosStart) / 10) }));
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