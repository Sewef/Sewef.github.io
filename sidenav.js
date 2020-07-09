document.write('\
\
    <div id="sidenav" class="sidenav">\
        <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">×</a>\
        <a href="/index.html">Accueil</a>\
        <div class="subsidenav" id="sub_about">\
            <!-- <a href="#about">num0</a> -->\
        </div>\
        <a href="/pokeemerald.html">pokeemerald</a>\
        <div class="subsidenav" id="sub_pokeemerald">\
            <a href="/pokeemerald/allInstruments.html">All-Instruments voicegroup</a>\
            <a href="/pokeemerald/saves.html">Saveblocks</a>\
        </div>\
        <a href="#clients">Clients</a>\
        <a href="#contact">Contact</a>\
    </div>\
\
');

// Get page URL
var url = location.pathname.split('/').slice(-1)[0];

// Set the page name in white
var elem = document.querySelector(".sidenav a[href*=\""+url+"\"]");
elem.style.color = '#f1f1f1';

// Show items from subsidenav if in parent
var category = location.pathname.split('/').slice(-1)[0].split('.')[0];
var elem = document.querySelector("#sub_"+ category + ".subsidenav");
if (elem != null) {
    elem.style.display = 'block';
}

// Show items from subsidenav if in children
var category = location.pathname.split('/').slice(-2)[0];
var elem = document.querySelector("#sub_"+ category + ".subsidenav");
if (elem != null) {
    elem.style.display = 'block';
}

function openNav() {
    document.getElementById("sidenav").style.width = "40%";
    document.getElementById("main").style.marginLeft = "40%";
}

function closeNav() {
    document.getElementById("sidenav").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
}