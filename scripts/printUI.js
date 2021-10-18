function draw()
{
	posts.forEach(function(item)
	  {
		console.log(item.path);
		document.getElementsByClassName("blocks")[0].innerHTML += `<a href=\"/posts/${item.path}\"><div>${item.title}</div></a>`;
		
		
	  }
	);

	// for (let i=0; i<50; i++)
	// {
		// document.getElementsByClassName("blocks")[0].innerHTML += "<div>AzerTy</div>";
		// console.log("draw "+i);
	// }
}
