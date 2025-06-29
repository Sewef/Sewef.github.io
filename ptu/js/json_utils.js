function loadJsonAsCard(file, container) {
    $.getJSON(file, function (data) {
        if (!Array.isArray(data) || data.length === 0) {
            alert(`Error: no data found in ${file}`);
            return;
        }

        // Render each item
        data.forEach(item => {
            const cardHTML = renderItemAsCard(item);
            const cardDiv = document.createElement('div');
            cardDiv.className = "col-12 col-md-4";
            cardDiv.innerHTML = `<div class="card h-100"><div class="card-body">${cardHTML}</div></div>`;
            container.appendChild(cardDiv);
        });
    });
}

function renderItemAsCard(item, depth = 0) {
    let str = '';

    Object.keys(item).forEach(key => {
        const value = item[key];

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // Determine appropriate heading tag (max out at <h6>)
            const headingLevel = Math.min(4 + depth, 6); // h4, h5, h6...
            const nestedHTML = renderItemAsCard(value, depth + 1);

            str += `
                <div class="mt-3">
                    <h${headingLevel} class="text-muted">${key}</h${headingLevel}>
                    <div class="card mt-1">
                        <div class="card-body">
                            ${nestedHTML}
                        </div>
                    </div>
                </div>`;
        } else if (key === "Name") {
            str += `<h3>${value ?? ""}</h3>`;
        } else if (key === "Damage Base") {
            const regex = /(Damage Base.*:) (.*)/;
            const match = value?.match(regex);
            if (match) {
                str += `<strong>${match[1]}</strong> ${match[2]}<br>`;
            } else {
                console.log("Error: damage_base format is incorrect in item:", item);
            }
        } else {
            str += `<strong>${key}</strong>: ${value ?? ""}<br>`;
            str = str.replaceAll("\n", "<br>");
        }
    });

    return str;
}



function loadJsonToTable(file, tableId) {
    $.getJSON(file, function (data) {
        if (!Array.isArray(data) || data.length === 0) {
            $(`#${tableId} tbody`).append('<tr><td colspan="100%">Aucune donnée</td></tr>');
            return;
        }

        // Obtenir toutes les clés uniques de tous les objets
        const allKeys = new Set();
        data.forEach(item => {
            Object.keys(item).forEach(key => allKeys.add(key));
        });
        const keysArray = Array.from(allKeys);
        console.log(data);
        console.log(keysArray);

        // Créer l'en-tête du tableau
        let theadHtml = "";
        keysArray.forEach(key => {
            theadHtml += `<th>${key}</th>`;
        });
        $(`#${tableId} thead tr`).html(theadHtml);

        // Créer les lignes du tableau
        data.forEach(item => {
            let rowHtml = "";
            keysArray.forEach(key => {
                rowHtml += `<td>${item[key] !== undefined ? item[key] : ""}</td>`;
            });
            $(`#${tableId} tbody`).append(`<tr>${rowHtml}</tr>`);
        });
    }).fail(function () {
        alert("Erreur lors du chargement du JSON.");
    });
}

function loadJsonAsText(url, container) {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      container.innerText = JSON.stringify(data, null, 2);
    })
    .catch(err => {
      container.innerText = "Erreur lors du chargement.";
    });
}
