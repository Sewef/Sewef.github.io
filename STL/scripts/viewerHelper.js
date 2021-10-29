// Setup STL viewer
var stl_viewer;

// Populate list
let list = document.getElementById("list");
files.forEach(
	function(item)
	{
		// console.log(item);
		list.innerHTML += `<a href="#" onclick="setView(this)">${item}</a>`;
	}
);
list.firstChild.click();

// Actions on clicking file

function setView(item)
{
	if ((/(?:\.([^.]+))?$/).exec(item.innerText)[1] == "stl")
	{
		if (stl_viewer == null)
		{
			stl_viewer = new StlViewer(document.getElementById("display"), {
				camerax: 120,
				cameray: 60,
				auto_rotate: false,
				zoom: -1,
			});
			
		}
		
		document.getElementById("display").style.backgroundImage = "";
		if (stl_viewer.models_count == 0 || stl_viewer.get_model_info(0).name != `${window.location.pathname}${item.innerText}`)
		{
			stl_viewer.clean();
			stl_viewer.add_model({id:0, filename:`${window.location.pathname}${item.innerText}`, color:"#008FFF", rotationx: -Math.PI/2});
		}
	}
	else
	{
		if (stl_viewer != null) stl_viewer.clean();
		document.getElementById("display").style.backgroundImage = `url(${window.location.pathname}${item.innerText})`;
	}
}
