document.write("Look i'm working fine");

console.log("Hello");

document.getElementById("myText").style.WebkitTransitionDuration='0.4s';

let rotation = 0;
document.addEventListener("wheel", function (e) {
	
	rotation += e.deltaY*10;
	document.getElementById("myText").style.transform = "rotate("+rotation+"deg)";
	  
	return false;
}, true);