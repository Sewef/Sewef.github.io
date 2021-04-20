document.write("+");
console.log("Hello");


// General
var rotationY = 0;
var helicoFlag = false;
document.addEventListener("wheel", function (e) {
	rotationY += e.deltaY*8;
	// console.log(((rotationY%360)-180)/18);
	document.getElementById("myText").style.transform = "rotateY("+rotationY+"deg) rotateZ("+((rotationY%360)-180)/15+"deg)";
	
	if (abs(rotationY) > 4*360 && !helicoFlag) {
		helicoFlag = true;
		helico();
	}
	return false;
}, true);

function helico() {
	console.log("vrrr");
	document.getElementsByClassName("animation")[0].style.display = "block";
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