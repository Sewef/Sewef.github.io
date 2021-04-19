document.write("Look i'm working fine");

console.log("Hello");

let rotation = 0;
console.log(rotation);
document.addEventListener("wheel", function (e) {
  rotation = rotation + 5;
  rotation = rotation > 180 ? (rotation - 180) : rotation;
  
  console.log(rotation);
  document.getElementById("myText").style.transform = "rotate("+rotation+"deg)";
  
  return false;
}, true);