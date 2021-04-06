const socket = io();

const nicknameSection = document.getElementById('nickname');
const nicknameForm = document.getElementById('nickname-form');
const nicknameInput = document.querySelector('#nickname-form input');

const chatSection = document.getElementById('chat');
const chatForm = document.getElementById('chat-form');
const isTypingElement = document.getElementById('is-typing');
const chatInput = document.querySelector('#chat-form input');

const messages = document.querySelector('#chat ul');

let nickname = '';
let typingUsers = [];

chatForm.addEventListener('submit', e => {
	e.preventDefault();

	if (chatInput.value) {
		socket.emit('message', { nickname, message: chatInput.value });
		chatInput.value = '';
		chatInput.focus();
	}
});

nicknameForm.addEventListener('submit', e => {
	e.preventDefault();

	const name = nicknameInput.value;
	if (name) {
		nickname = name;
		nicknameSection.classList.add('hidden');
		chatSection.classList.remove('hidden');
	}
});

chatInput.addEventListener('input', e => {
	if(e.target.value && e.target.value !== '') {
		socket.emit('typing', nickname);
	}
});

socket.on('message', ({ nickname, message }) => {
	const element = document.createElement('li');
	const msg = document.createElement('span');
	const name = document.createElement('span');

	name.textContent = nickname;
	msg.textContent = message;
	element.appendChild(name);
	element.appendChild(msg);
	messages.appendChild(element);
	messages.scrollTop = messages.scrollHeight;
});

socket.on('isTyping', nickname => {
	const found = typingUsers.find(n => n.nickname === nickname);
	if(!found) {
		typingUsers.push({ nickname, date: Date.now() });
	} else {
		found.date = Date.now();
	}

	setTypingUsers();
});

function setTypingUsers() {
	if(typingUsers.length > 0) {
		if(typingUsers.length === 1) {
			isTypingElement.textContent = `${typingUsers[0].nickname} is typing...`;
		} else {
			isTypingElement.textContent = `${typingUsers.map(u => u.nickname).slice(0, typingUsers.length - 1).join(', ')} and ${typingUsers[typingUsers.length - 1].nickname} are typing...`;
		}
	} else {
		isTypingElement.textContent = '';
	}
}

setInterval(() => {
  const time = Date.now();
  typingUsers = typingUsers.filter(user => time < user.date + 3000);
	setTypingUsers();
}, 1000);