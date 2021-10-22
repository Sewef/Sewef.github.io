posts.forEach(function(item)
  {
	console.log(item.path);
	let imgStr = `<img src=\"/posts/${item.path}/tumbnail.png\">`;
	document.getElementsByClassName("blocks")[0].innerHTML += 
		`<a href=\"/posts/${item.path}\"  style=\"background-image:url(/posts/${item.path}/tumbnail.jpg)\">
		<div>
		${item.title}
		</div>
		</a>`;
  }
);
