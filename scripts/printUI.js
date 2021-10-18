function draw()
{
	for (let i=0; i<50; i++)
	{
		document.getElementsByClassName("blocks")[0].innerHTML += "<div>a</div>";
		console.log("draw "+i);
	}
}
