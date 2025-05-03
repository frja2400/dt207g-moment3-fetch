"use strict";

//Adderar en funktion som visar meddelande när min render-databas får i viloläge.
function showLoadingMessage() {
    const tableBody = document.getElementById("workexperienceTable");
    tableBody.innerHTML = `<tr><td colspan="7">Laddar data...</td></tr>`;
}

//Asynkron funktion med try/catch för att hämta ut min data. 
async function getData() {
    showLoadingMessage();
    try {

        const response = await fetch("https://dt207g-moment2-rest.onrender.com/api/workexperience");

        if (!response.ok) throw new Error("Nätverksfel");

        const data = await response.json();
        console.table(data);
        renderData(data);   //Anropar funktion som skriver ut datan på skärmen.
    } catch (error) {
        console.error("Fel vid hämtning:", error);
    } finally {
        console.log("Förfrågan avslutad.");
    }
}

//Bara hämta och rendera data om tabellen finns.
//För att undvika fel när all kod ligger i samma JS-fil men används på flera HTML-sidor.
const table = document.getElementById("workexperienceTable");

if (table) {
    getData();
}

//Skriv ut datan på skärmen med en funktion och manipulera DOM
function renderData(data) {
    const tableBody = document.getElementById("workexperienceTable");
    tableBody.innerHTML = '';

    data.forEach(work => {
        const row = document.createElement('tr');

        //Addera varje egenskap från de egenskaperna som finns i mitt objekt i API:et.
        row.innerHTML = `
            <td data-label="Företag">${work.companyname}</td>
            <td data-label="Roll">${work.jobtitle}</td>
            <td data-label="Stad">${work.location}</td>
            <td data-label="Startdaum">${formatDate(work.startdate)}</td>
            <td data-label="Slutdatum">${formatDate(work.enddate)}</td>
            <td data-label="Beskrivning">${work.description}</td>
            <td><button class="deleteBtn">RADERA</button></td>
        `;

        //Lägg till händelselyssnare för radera-knappen
        const deleteButton = row.querySelector(".deleteBtn");
        deleteButton.addEventListener("click", function () {
            deleteWorkExperience(work.id, row);     //Anropa delete-funktionen.
        });

        tableBody.appendChild(row);
    });
}


//Funktion som adderar data till min databas via mitt formulär.
const form = document.getElementById("workexperienceForm");

//Kontrollera att forumläret finns och addera en händelselyssnare på knappen.
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault(); //Hindra standardfunktion för submit-knapp.

        //Hämta värden från formuläret
        const newWorkExperience = {
            companyname: document.getElementById("company").value,
            jobtitle: document.getElementById("role").value,
            location: document.getElementById("location").value,
            startdate: document.getElementById("startDate").value,
            enddate: document.getElementById("endDate").value,
            description: document.getElementById("description").value
        }

        try {
            const response = await fetch("https://dt207g-moment2-rest.onrender.com/api/workexperience", {
                //Anger att det är ett POST-anrop
                method: "POST",
                //Anger att jag vill skicka JSON-data till min body
                headers: {
                    "Content-Type": "application/json"
                },
                //Skickar datan, konverterad från objekt till JSON-format. Måste göras vid fetch-anrop.
                body: JSON.stringify(newWorkExperience)
            });

            if (!response.ok) throw new Error("Något gick fel vid sparandet.");

            alert("Arbetslivserfarenhet tillagd!");
            form.reset();
        } catch (error) {
            console.error("Fel vid POST:", error);
            alert("Kunde inte spara.");
        }
    });
}

//Formaterar om datumen på skärmen
function formatDate(dateString) {
    const date = new Date(dateString);
    //Gör om date-onjekt till ISO-sträng och delar upp och plockar bort första delen, innan "T".
    return date.toISOString().split("T")[0];
}

//Funktion som raderar data
async function deleteWorkExperience(id, row) {
    try {
        const response = await fetch(`https://dt207g-moment2-rest.onrender.com/api/workexperience/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) throw new Error("Kunde inte radera posten");

        //Ta bort från DOM efter att det är raderat från servern
        row.remove();
        alert("Arbetslivserfarenhet raderad!");
    } catch (error) {
        console.error("Fel vid radering:", error);
        alert("Kunde inte radera posten.");
    }
}