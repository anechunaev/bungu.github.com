'use strict';

const state = {
	prevKey: null,
	selectedKeys: [],
	bodyColor: '#fff',
	cardElements: [],
};

const defaultCards = [
	'Авиа',
	'ПТТ',
	'Автобусы',
	'Туры',
	'Приключения',
	'B2B',
	'ЖД',
	'Электрички',
];

const classes = [
	'one',
	'two',
	'three',
	'four',
];

function lsTest(){
	const test = 'test';
	if (typeof Storage === 'undefined' || typeof localStorage === 'undefined') return false;
	try {
		localStorage.setItem(test, test);
		localStorage.removeItem(test);
		return true;
	} catch(e) {
		console.error(e);
		return false;
	}
}

function initState() {
	if (lsTest()) {
		state.time = +localStorage.getItem('time') || 3;
		state.spins = +localStorage.getItem('spins') || 1;
		state.bodyColor = localStorage.getItem('body') || '#1d1e22';

		if (localStorage.getItem('cards')) {
			state.cards = localStorage.getItem('cards').split('\n');
		} else {
			state.cards = defaultCards;
		}

		document.getElementById('time').setAttribute('value', state.time);
		document.getElementById('spins').setAttribute('value', state.spins);
		document.getElementById('body').setAttribute('value', state.bodyColor);
		document.getElementById('cards').value = state.cards.join("\n");
	}
}

function initCards(frame, triggerWrapper) {
	state.cards.forEach((card, index) => {
		// create card
		const cardElement = document.createElement('div');
		cardElement.classList.add(classes[ index % classes.length ]);
		cardElement.classList.add('card');
		cardElement.innerText = card;
		frame.appendChild(cardElement);
		state.cardElements.push(cardElement);

		// create card options
		const triggerElement = document.createElement('label');
		const triggerInput = document.createElement('input');
		triggerInput.type = 'checkbox';
		triggerInput.dataset.index = index;
		triggerInput.checked = 'checked';
		const triggerLabel = document.createElement('span');
		triggerLabel.innerText = card;
		triggerElement.appendChild(triggerInput);
		triggerElement.appendChild(triggerLabel);
		triggerInput.addEventListener('change', function(e) {
			if (e.target.checked) {
				state.selectedKeys.splice(state.selectedKeys.indexOf(+e.target.dataset.index), 1);
				state.cardElements[+e.target.dataset.index].classList.remove('selected');
			} else {
				state.selectedKeys.push(+e.target.dataset.index);
				state.cardElements[+e.target.dataset.index].classList.add('selected');
			}
		});
		triggerWrapper.appendChild(triggerElement);
	});
}

function init() {
	initState();
	const frame = document.querySelector('.frame');
	const availableTriggersWrapper = document.getElementById('available');
	document.body.style.backgroundColor = state.bodyColor;
	frame.style.transformDuration = `${state.time}s`;
	initCards(frame, availableTriggersWrapper);

	const cards = state.cardElements;
	const cardsLength = state.cards.length;
	const cardSize = cards[0].offsetHeight;
	let selectedIndex = 0;
	const radius = Math.round((cardSize / 2) / Math.tan(Math.PI / cards.length));
	const theta = 360 / cards.length;

	cards.forEach((card, index) => {
		card.style.transform = `rotateX(${theta * index}deg) translateZ(${radius}px)`;
		rotateFrame();
	});

	function rotateFrame() {
		const angle = theta * selectedIndex * -1;
		frame.style.transform = `translateZ(${-radius}px) rotateX(${angle}deg)`;
	}

	function playAnimation() {
		if (typeof state.prevKey === 'number') {
			cards[state.prevKey].classList.add('selected');
		}
		const spins = cards.length * state.spins;
		const newKey = random(cardsLength, state.selectedKeys);
		selectedIndex += spins + newKey + (cardsLength - state.prevKey || 0);
		state.prevKey = newKey;
		rotateFrame();
	}

	function random(srcLength, selected) {
		let randomKey = Math.floor(Math.random() * srcLength);
		while(selected.indexOf(randomKey) > -1) {
			randomKey = Math.floor(Math.random() * srcLength);
		}
		selected.push(randomKey);
		document.querySelector(`#available input[data-index="${randomKey}"]`).checked = false;
		return randomKey;
	}

	window.addEventListener('keypress', (e) => {
		if (e.keyCode == 0 || e.keyCode == 32) {
			if (state.selectedKeys.length !== cardsLength) {
				playAnimation();
			}
			e.preventDefault();
		}
	});
}


window.addEventListener('load', function() {
	init();

	const time = document.getElementById('time');
	time.addEventListener('input', function(e) {
		state.time = +e.currentTarget.value;

		if (lsTest()) {
			localStorage.setItem('time', +e.currentTarget.value);
		}
	});

	const spins = document.getElementById('spins');
	spins.addEventListener('input', function(e) {
		state.spins = +e.currentTarget.value;

		if (lsTest()) {
			localStorage.setItem('spins', +e.currentTarget.value);
		}
	});

	const body = document.getElementById('body');
	body.addEventListener('input', function(e) {
		document.body.style.backgroundColor = e.currentTarget.value;

		if (lsTest()) {
			localStorage.setItem('body', e.currentTarget.value);
		}
	});

	const cards = document.getElementById('cards');
	cards.addEventListener('input', function(e) {
		const data = e.currentTarget.value.split('\n').filter(s => !!s.toString().trim())
		state.cards = data;

		if (lsTest()) {
			localStorage.setItem('cards', data.join('\n'));
		}
	});

	const options = document.querySelector('.options');
	const shadow = document.querySelector('.shadow');
	shadow.addEventListener('click', function() {
		options.style.display = 'none';
	});
	const trigger = document.querySelector('.trigger');
	trigger.addEventListener('click', function() {
		options.style.display = 'block';
	});
});