// Setup STL viewer

var stl_viewer=new StlViewer(document.getElementById("display"), {
	camerax: 120,
	cameray: 60,
	auto_rotate: false,
	zoom: -1,
});

// Populate list
let list = document.getElementById("list");
files.forEach(
	function(item)
	{
		// console.log(item);
		list.innerHTML += `<a href="#" onclick="setView(this)">${item}</a>`;
	}
);


// Actions on clicking file

function setView(item)
{
	console.log(item);
	if ((/(?:\.([^.]+))?$/).exec(item.innerText)[1] == "stl")
	{
		if (stl_viewer.get_model_info(0).name != `${window.location.pathname}${item.innerText}`)
		{
			stl_viewer.clean();
			stl_viewer.add_model({id:0, filename:`${window.location.pathname}${item.innerText}`, color:"#008FFF", rotationx: -Math.PI/2});
		}
	}
	
}
