// Detect page language depending on url params

let params = (new URL(document.location)).searchParams;

// Hide URL params from url
history.replaceState(null, document.querySelector("title").innerText, window.location.pathname);

if (params.get("lang") == null)
{
	let userLang = navigator.language || navigator.userLanguage; 
	if (userLang == "fr")
	{
		params.set('lang', 'fr');
	}
	else
	{
		params.set('lang', 'en');
	}
	
	window.location.search = params.toString();
}

let stylesheet = getStyleSheet("default");
var lang = params.get("lang");
stylesheet.insertRule(`*[lang][lang=${lang}] { display: initial; }`, 0);

// Change link on click
document.addEventListener("click", 
	function(event)
	{
		let target = event.target;
		if ((target.tagName == "A") && (target.host == window.location.host)) // <a> div and not external link
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

function addDate()
{
	let date = new Date(new URL(document.location).pathname.match(/(\d{8})/)[1].replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
	document.write(date.toLocaleDateString(`${(lang == "fr") ? "fr-fr" : "en-us"}`, { year:"numeric", month:"short", day:"numeric"}));
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
