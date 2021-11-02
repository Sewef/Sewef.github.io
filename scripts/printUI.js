posts.forEach(function(item)
	{
		let imgStr = `<img src="${window.location.pathname}posts/${item.path}/thumbnail.png">`;
		document.getElementsByClassName("blocks")[0].innerHTML += 
			`<a href=\"${window.location.pathname}posts/${item.path}\"  style=\"background-image:url(${window.location.pathname}posts/${item.path}/thumbnail.jpg)\">
			<div>
			${item.title}
			</div>
			</a>`;
	}
);
