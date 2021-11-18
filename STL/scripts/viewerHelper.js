// Global objets
var stl_viewer;
var reader = new XMLHttpRequest() || new ActiveXObject('MSXML2.XMLHTTP');

const icons = {
	"stl": "📦",
	"jpg": "🖼️",
	"png": "🖼️",
	"txt": "📝",
};

// Populate list
let list = document.getElementById("list");
files.forEach(
	function(item)
	{
		// console.log(item);
		list.innerHTML += `<a href="javascript:void(0)" onclick="setView(this)">
		${icons[getExtension(item)]}\t${item}</a>`;
	}
);
list.firstChild.click();

// Actions on clicking file
function setView(item)
{
	// Manage "selected" attribute
	if (document.querySelector("[selected]") != null)
	{
		// Do nothing if this item is the one displayed
		if (document.querySelector("[selected]") == item)
			return;
		
		// Remove old "selected"
		document.querySelector("[selected]").removeAttribute('selected');
	}
	item.setAttribute("selected", '');
	
	// Clean display
	document.getElementById("text").style.visibility = "hidden";
	document.getElementById("display").style.backgroundImage = "";
	if (stl_viewer != null)
		stl_viewer.clean();
	
	// Get item real name (without icon) and extension
	let text = item.innerText.replace(/[\W_]+/, "");
	let extension = getExtension(text)
	
	if (extension == "stl") //Get extension
	{
		if (stl_viewer == null)
		{
			stl_viewer = new StlViewer(document.getElementById("display"), {
				camerax: 80,
				cameray: 60,
				auto_rotate: false,
				allow_drag_and_drop: false,
				zoom: -1,
				all_loaded_callback: setCamera,
			});
		}
		
		if (stl_viewer.models_count == 0)
		{
			stl_viewer.add_model({
				id: 0,
				filename: `${window.location.pathname}${text}`,
				color: "#008FFF",
				rotationx: -Math.PI/2,
				});
		}
	}
	else if (extension == "jpg" || extension == "png")
	{
		document.getElementById("display").style.backgroundImage = `url(${window.location.pathname}${text})`;
	}
	else if (extension == "txt")
	{
		document.getElementById("text").style.visibility = "visible";
		loadFile(text);
	}
}

// Export PNG
function exportImage()
{
	let text = document.querySelector("[selected]").innerText.replace(/[\W_]+/, ""); //Trim the icon
	let extension = getExtension(text)
	if (extension == "stl") //Get extension
		window.open(document.getElementsByTagName("canvas")[0].toDataURL("image/png")); // Export stl view
	else
		window.open(`${window.location.pathname}${text}`);
}

// Show txt
function loadFile(path) {
    reader.open("GET", path, true); 
    reader.onreadystatechange = displayContents;
    reader.send(null);
}

function displayContents() {
    if(reader.readyState==4)
		document.getElementById("text").innerHTML = formatText(reader.responseText);
}

function formatText(text)
{
	// return text;
	text = text	.replaceAll(/#(.*)$/gm, "<big>$1</big>") // # big
				.replaceAll(/\*{1}(.*)\*{1}/gm, "<strong>$1</strong>") // *bold*
				.replaceAll(/`(.*)`/gm, "<code>$1</code>") // `code`
				.replaceAll(/((http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-]))/g, "<a href=\"$1\">$1</a>") // url
				.replaceAll(/(?:\r\n|\r|\n)/g, "<br>"); // <br>
				
	return text;
}

// Misc
function getExtension(path)
{
	return (/(?:\.([^.]+))?$/).exec(path)[1];
}

function setCamera()
{
	stl_viewer.set_zoom(-1, true);
		
	stl_viewer.set_camera_state({
		position: { x: 120, y: 80, z: 120 }
	});
}