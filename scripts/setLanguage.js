let params = (new URL(document.location)).searchParams;

if (params.get("lang") == null)
{
	let url = (new URL(document.location));
	url.searchParams.set("lang", "fr");
	document.location = url;
}

if (params.get("lang") != null)
{
	let stylesheet = getStyleSheet("default");
	let lang = params.get("lang");
	stylesheet.insertRule(`*[lang][lang=${lang}] { display: initial; }`, 0);
}

function changeLanguage(lang)
{
	let url = (new URL(document.location));
	url.searchParams.set("lang", lang);
	document.location = url;
}

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
