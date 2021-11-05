posts.forEach(function(item)
	{
		document.getElementById("blocks").innerHTML += 
			`<a href=\"${window.location.pathname}posts/${item.path}\"  style=\"background-image:url(${window.location.pathname}posts/${item.path}/thumbnail.jpg)\">
			<div>
			${item.title}
			</div>
			</a>`;
	}
);
