document.write("Look i'm working fine");
console.log("Hello");

document.getElementById("myText").style.WebkitTransitionDuration='0.4s';

if("ontouchstart" in window){
   document.addEventListener('touchstart', touchStartHandler, false);
   document.addEventListener('touchmove', touchMoveHandler, false);
   // document.addEventListener('touchend', touchEndHandler);
}

// General
var rotation = 0;
document.addEventListener("wheel", function (e) {
	// console.log("wheel");
	rotation += e.deltaY*10;
	document.getElementById("myText").style.transform = "rotate("+rotation+"deg)";
	  
	return false;
}, true);




// Touchscreen support
var yPosStart;
function touchStartHandler(e) {
	yPosStart=e.touches[0].clientY;
}

function touchMoveHandler(e) {
	// console.log(e.touches[0].clientY - yPosStart);
	document.dispatchEvent(new WheelEvent('wheel', { 'deltaY': (e.touches[0].clientY - yPosStart) / 10 }));
	yPosStart = e.touches[0].clientY;
}