const wheel = $('#wheel');
const wrapper = $('#wrapper');
const defaultClassNames = [
	'card green eight',
	'card blue nine',
	'card yellow ten',
	'card red eleven',
	'card green twelve',
	'card white',
	'card blue one',
	'card yellow two',
	'card red three',
	'card green four',
	'card blue five',
	'card black',
	'card yellow six',
	'card red seven',
];

let state = {
	sectors: +$('#sectors').attr('value'),
	time: +$('#time').attr('value'),
	spins: +$('#spins').attr('value'),
	lastSpinDeg: 0,
	status: 'paused',
	step: 360 / +$('#sectors').attr('value'),
	cardsInGame: (new Array(+$('#sectors').attr('value'))).join().split(',').map((_, i) => i),
	defaultClassNames,
};


function lsTest(){
	const test = 'test';
	if (typeof Storage === 'undefined' || typeof localStorage === 'undefined') return false;
	try {
		localStorage.setItem(test, test);
		localStorage.removeItem(test);
		return true;
	} catch(e) {
		return false;
	}
}

function initState() {
	if (lsTest()) {
		state.sectors = +localStorage.getItem('sectors') || 14;
		state.time = +localStorage.getItem('time') || 10;
		state.spins = +localStorage.getItem('spins') || 50;
		state.lastSpinDeg = 0;
		state.status = 'paused';
		state.step = 360 / state.sectors;
		state.cardsInGame = (new Array(state.sectors)).join().split(',').map((_, i) => i);
		state.defaultClassNames = localStorage.getItem('defaultClassNames') ? localStorage.getItem('defaultClassNames').split('\n') : defaultClassNames;

		$('#sectors').attr('value', state.sectors);
		$('#time').attr('value', state.time);
		$('#spins').attr('value', state.spins);
		$('#body').attr('value', localStorage.getItem('body') || '#333');
		$('#cards-classes').val(state.defaultClassNames);
	}
}


function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
	var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

	return {
		x: centerX + (radius * Math.cos(angleInRadians)),
		y: centerY + (radius * Math.sin(angleInRadians))
	};
}
function describeArc(x, y, radius, startAngle, endAngle){
	var start = polarToCartesian(x, y, radius, endAngle);
	var end = polarToCartesian(x, y, radius, startAngle);

	var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
	return `M${x} ${y}L${start.x} ${start.y}A${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}Z`;
}

function initOptions() {
	const list = $('#in-game-list');
	for(let i = 0; i < state.sectors; i++) {
		const label = document.createElement('label');
		const cb = document.createElement('input');
		cb.type = 'checkbox';
		cb.checked = 'checked';
		label.appendChild(cb);
		label.appendChild(document.createTextNode(state.defaultClassNames[i]));
		cb.addEventListener('change', e => {
			if (e.currentTarget.checked) {
				$(`#cards div:nth-child(${i + 1})`).removeClass('hidden');
				state.cardsInGame.push(i);

				if (state.prevCard === i) {
					state.prevCard = undefined;
				}
			} else {
				$(`#cards div:nth-child(${i + 1})`).addClass('hidden');
				state.cardsInGame.splice(i, 1);
			}
		});
		list.append(label);
	}
}

function init() {
	const base = $('#wheel-base-group');
	const sectorTemplate = $('#sector');
	const cards = $('#cards');
	initState();
	initOptions();
	sectorTemplate.attr('d', describeArc(50, 50, 50, 0, state.step));

	base.empty();
	cards.empty();
	for (let i = 0; i < state.sectors; i++) {
		const s = document.createElementNS('http://www.w3.org/2000/svg', 'use');
		s.classList.add('sector');
		$(s).attr('href', '#sector');
		$(s).attr('transform', `rotate(${i * state.step}, 50, 50)`);
		base.append(s);

		const c = document.createElement('div');
		$(c).css({ transform: `rotate(${360 * (i / state.sectors) + state.step / 2}deg)` });
		c.className = state.defaultClassNames[i];
		cards.append(c);
	}

	if (localStorage.getItem('body')) {
		document.body.style.backgroundColor = localStorage.getItem('body');
	}
}

function getRandomSector() {
	const key = Math.floor(Math.random() * state.cardsInGame.length);
	return state.cardsInGame[key];
}


$(document).ready(() => {
	init();
	$('#sectors').on('change', (e) => {
		state.sectors = +e.currentTarget.value;
		state.step = 360 / state.sectors;
		init();

		if (lsTest()) {
			localStorage.setItem('sectors', +e.currentTarget.value);
		}
	});
	$('#time').on('input', (e) => {
		state.time = +e.currentTarget.value;

		if (lsTest()) {
			localStorage.setItem('time', +e.currentTarget.value);
		}
	});
	$('#spins').on('input', (e) => {
		state.spins = +e.currentTarget.value;

		if (lsTest()) {
			localStorage.setItem('spins', +e.currentTarget.value);
		}
	});
	$('#body').on('input', (e) => {
		document.body.style.backgroundColor = e.currentTarget.value;

		if (lsTest()) {
			localStorage.setItem('body', e.currentTarget.value);
		}
	});
	$('#cards-classes').on('change', (e) => {
		const data = e.currentTarget.value.split('\n').filter(s => !!s.toString().trim());
		state.defaultClassNames = data;

		if (lsTest()) {
			localStorage.setItem('defaultClassNames', data.join('\n'));
		}
	});

	wrapper.on('click', () => {
		if (state.status !== 'paused') return;

		if (typeof state.prevCard !== 'undefined') {
			$(`#cards div:nth-child(${state.prevCard + 1})`).addClass('hidden');
		}

		if (state.cardsInGame.length === 0) return;

		let sectorId = getRandomSector();
		state.cardsInGame.forEach(id => {
			if (sectorId === id) play = true;
		});

		state.status = 'running';
		state.prevCard = sectorId;
		const ang = sectorId * state.step;
		wheel[0].animate([
			{ transform: `rotate(${state.lastSpinDeg}deg)` },
			{ transform: `rotate(${360 * state.spins + ang + state.step/2}deg)` },
		], {
			duration: state.time * 1000,
			easing: 'cubic-bezier(.08,.82,.17,1)',
			fill: 'forwards',
		});
	
		setTimeout(() => {
			state.lastSpinDeg = ang + state.step/2;
			state.status = 'paused';
			state.cardsInGame.splice(state.cardsInGame.indexOf(sectorId), 1);
			$(`#in-game-list label:nth-child(${sectorId + 1}) input`).prop('checked', false);
		}, state.time * 1000);
	});

	$('.shadow').on('click', () => {
		$('.options').hide();
	});

	$('.trigger').on('click', () => {
		$('.options').show();
	});
});