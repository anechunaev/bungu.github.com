'use strict';

const frame = document.querySelector('.frame');
const cards = Array.from(document.querySelectorAll('.card'));
const cardSize = cards[0].offsetHeight;
let selectedIndex = 0;
const radius = Math.round((cardSize / 2) / Math.tan(Math.PI / cards.length));
const theta = 360 / cards.length;

cards.forEach((card, index, src) => {
	card.style.transform = `rotateX(${theta * index}deg) translateZ(${radius}px)`;
	rotateFrame();
});

function rotateFrame() {
	const angle = theta * selectedIndex * -1;
	frame.style.transform = `translateZ(${-radius}px) rotateX(${angle}deg)`;
}

function recursiveAnimation() {
	setTimeout(() => {
		if (selectedIndex + 1 < cards.length * 3) {
			selectedIndex++;
			rotateFrame();
			recursiveAnimation();
		} else {
			recursiveFade(cards.length, 200);
		}
	}, 200);
}

function recursiveFade(index, base) {
	const timeout =  base + base * (cards.length - index);
	console.log('recursive timeout', timeout);
	frame.style.transition = `transform ${timeout / 1000}s linear`;
	setTimeout(() => {
		if (index > 0) {
			selectedIndex++;
			rotateFrame();
			recursiveFade(index - 1, base);
		} else {
			selectedIndex = selectedIndex % cards.length;
			frame.style.transition = `transform ${base / 1000}s linear`;
			console.log('end', selectedIndex);
		}
	}, timeout);
}

// recursiveAnimation();

window.addEventListener('keypress', (e) => {
	if (e.keyCode == 0 || e.keyCode == 32) {
		recursiveAnimation();
	}
			
	e.preventDefault();
});

// fade function
// (1 + Math.cos(x)) / 2 = 0 .. Math.PI
