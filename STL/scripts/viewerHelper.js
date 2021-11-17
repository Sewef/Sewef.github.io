// Setup STL viewer
var stl_viewer;

// Populate list
let list = document.getElementById("list");
files.forEach(
	function(item)
	{
		// console.log(item);
		list.innerHTML += `<a href="javascript:void(0)" onclick="setView(this)">
		${(/(?:\.([^.]+))?$/).exec(item)[1] == "stl" ? "📦" : "🖼️" }	${item}</a>`;
	}
);
list.firstChild.click();

// Actions on clicking file

function setView(item)
{
	if (document.querySelector('[selected]') != null) document.querySelector('[selected]').removeAttribute('selected');
	
	item.setAttribute('selected', '');
	var text = (/^.*\s(.*)/).exec(item.innerText)[1]; //Trim the icon
	if ((/(?:\.([^.]+))?$/).exec(text)[1] == "stl") //Get extension
	{
		if (stl_viewer == null)
		{
			stl_viewer = new StlViewer(document.getElementById("display"), {
				camerax: 120,
				cameray: 60,
				auto_rotate: false,
				allow_drag_and_drop: false,
				zoom: -1,
			});
			
		}
		
		document.getElementById("display").style.backgroundImage = "";
		if (stl_viewer.models_count == 0 || stl_viewer.get_model_info(0).name != `${window.location.pathname}${text}`)
		{
			stl_viewer.clean();
			stl_viewer.add_model({id:0, filename:`${window.location.pathname}${text}`, color:"#008FFF", rotationx: -Math.PI/2});
		}
	}
	else
	{
		if (stl_viewer != null) stl_viewer.clean();
		document.getElementById("display").style.backgroundImage = `url(${window.location.pathname}${text})`;
	}
}

// Export PNG

function exportPng()
{
	var text = (/^.*\s(.*)/).exec(document.querySelector('[selected]').innerText)[1]; //Trim the icon
	if ((/(?:\.([^.]+))?$/).exec(text)[1] == "stl") //Get extension
		window.open(document.getElementsByTagName("canvas")[0].toDataURL("image/png")); // Export stl view
	else
		window.open(`${window.location.pathname}${text}`); // Show BG image
}
