const chatContainer = document.getElementById("chatContainer");
const form = document.getElementById("questionForm");
const select = document.getElementById("questionSelect");
const responseDisplay = document.getElementById("responseDisplay");
const personaSelect = document.getElementById("personaSelect");
const avatar = document.querySelector(".avatar");
const toggleBtn = document.getElementById("toggleLang");

const firemanPersonasEnglish = [
	{ name: "Fireman John", file: "firemanPersonaJohn.json" },
	{ name: "Fireman Tim", file: "firemanPersonaTim.json" },
	{ name: "Firewoman Sarah", file: "firewomanPersonaSarah.json" },
];

const firemanPersonasFrench = [
	{ name: "Pompier Jean", file: "pompierPersonaJean.json" },
	{ name: "Pompier Pierre", file: "pompierPersonaPierre.json" },
	{ name: "Pompière Sophie", file: "pompierePersonaSophie.json" },
];

const personasQuantity = firemanPersonasEnglish.length + firemanPersonasFrench.length;

let firemanPersonas = firemanPersonasEnglish;
let isEnglish = true;
const defaultLanguage = "English";
const defaultPersona = "Select a fireman...";
const defaultQuestion = "Select a question...";
const defaultButtonText = "Ask";

let personasLoaded = false;

const toggleLanguage = () => {
	if (isEnglish) {
		toggleBtn.textContent = "FR";
		isEnglish = false;
		document.querySelector("h1").textContent = "Chat Virtuel avec un Pompier Romantique";
		personaSelect.options[0].text = "Sélectionnez un pompier...";
		select.options[0].text = "Sélectionnez une question...";
		form.querySelector("button").textContent = "Demander";
		avatar.style.backgroundImage = "url('default-avatar.png')";
		firemanPersonas = firemanPersonasFrench;
	} else {
		toggleBtn.textContent = "EN";
		isEnglish = true;
		document.querySelector("h1").textContent = "Virtual Romantic Firefighter Chat";
		personaSelect.options[0].text = "Select a fireman...";
		select.options[0].text = "Select a question...";
		form.querySelector("button").textContent = "Ask";
		avatar.style.backgroundImage = "url('default-avatar.png')";
		firemanPersonas = firemanPersonasEnglish;
	}

	if (!personasLoaded) {
		loadPersonas();
		personasLoaded = true;
	} else {
		updatePersonaSelect();
	}
};

toggleBtn.addEventListener("click", toggleLanguage);

let personaData = {};

function updatePersonaSelect() {
	personaSelect.innerHTML = "";
	const option = document.createElement("option");
	option.value = "";
	option.text = isEnglish ? defaultPersona : "Sélectionnez un pompier...";
	personaSelect.appendChild(option);

	firemanPersonas.forEach((persona) => {
		const option = document.createElement("option");
		option.value = persona.name;
		option.text = persona.name + ` (${personaData[persona.name].age})`;
		personaSelect.appendChild(option);
	});
}

function loadPersona(persona, callback) {
	const xhr = new XMLHttpRequest();
	xhr.open("GET", persona.file);
	xhr.responseType = "json";
	xhr.send();

	xhr.onload = function () {
		if (xhr.status === 200) {
			personaData[persona.name] = xhr.response;
			personasLoaded++;
			if (personasLoaded === personasQuantity) {
				callback();
			}
		} else {
			console.error(`Failed to load ${persona.file}: ${xhr.statusText}`);
			personasLoaded++;
			if (personasLoaded === personasQuantity) {
				callback();
			}
		}
	};

	xhr.onerror = function () {
		console.error(`Failed to load ${persona.file}`);
		personasLoaded++;
		if (personasLoaded === firemanPersonas.length) {
			callback();
		}
	};
}

function loadPersonas() {
	personaData = {};
	personasLoaded = 0;

	firemanPersonasFrench.forEach((persona) => {
		loadPersona(persona, () => {
			updatePersonaSelect();
		});
	});
	firemanPersonasEnglish.forEach((persona) => {
		loadPersona(persona, () => {
			updatePersonaSelect();
		});
	});
}

loadPersonas();

personaSelect.addEventListener("change", function () {
	// Get the selected persona
	const selectedPersonaName = personaSelect.value;
	const selectedPersona = personaData[selectedPersonaName];

	// Display its avatar if exists
	if (selectedPersona && selectedPersona.avatar) {
		avatar.style.backgroundImage = `url('${selectedPersona.avatar}')`;
	} else {
		avatar.style.backgroundImage = "url('default-avatar.png')";
	}

	// Generate the options for the question select element
	select.innerHTML = "";
	const defaultOption = document.createElement("option");
	defaultOption.value = "";
	defaultOption.text = "Select a question...";
	select.appendChild(defaultOption);
	Object.keys(selectedPersona.responses).forEach((question) => {
		if (question.length != 0) {
			const questionOption = document.createElement("option");
			questionOption.value = question;
			questionOption.text = question;
			select.appendChild(questionOption);
		}
	});
});

form.addEventListener("submit", function (event) {
	event.preventDefault();

	// Get the selected persona and question
	const selectedPersonaName = personaSelect.value;
	const selectedQuestion = select.value;
	const selectedPersona = personaData[selectedPersonaName];

	// Check if a persona and question have been selected
	if (!selectedPersona || !selectedQuestion) {
		responseDisplay.innerHTML = `<p>${isEnglish ? "Please select a fireman and a question." : "Veuillez sélectionner un pompier et une question."}</p>`;
		return;
	}

	// Get the possible responses for the selected question
	const possibleResponses = selectedPersona.responses[selectedQuestion];

	// Check if there are responses available for the selected question
	if (!possibleResponses) {
		responseDisplay.innerHTML = `<p>${isEnglish ? "This fireman doesn't have a response for that question." : "Ce pompier n'a pas de réponse pour cette question."}</p>`;
		return;
	}

	// Display a random response
	const response = possibleResponses[Math.floor(Math.random() * possibleResponses.length)];
	responseDisplay.innerHTML = `<p>${response}</p>`;
});
