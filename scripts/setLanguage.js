// Detect page language depending on url params

let params = (new URL(document.location)).searchParams;

if (params.get("lang") == null)
{
	let userLang = navigator.language || navigator.userLanguage; 
	let url = (new URL(document.location));
	if (userLang == "fr")
		url.searchParams.set("lang", "fr");
	else
		url.searchParams.set("lang", "en");
	document.location = url;
}

let stylesheet = getStyleSheet("default");
var lang = params.get("lang");
stylesheet.insertRule(`*[lang][lang=${lang}] { display: initial; }`, 0);

// Change link on click
document.addEventListener("click", 
	function(event)
	{
		let target = event.target;
		if (target.tagName == "A")
		{
			let url = new URL(target.href);
			url.searchParams.set("lang", lang);
			target.href = url.toString();
		}
	}
);

// Change language using menu

function changeLanguage(lang)
{
	let url = (new URL(document.location));
	url.searchParams.set("lang", lang);
	document.location = url;
}

// Utils

function getStyleSheet(unique_title) {
	for(var i=0; i<document.styleSheets.length; i++)
	{
		var sheet = document.styleSheets[i];
		if(sheet.title == unique_title)
		{
		return sheet;
		}
	}
}
