const socket = io();

const nicknameSection = document.getElementById('nickname');
const nicknameForm = document.getElementById('nickname-form');
const nicknameInput = document.querySelector('#nickname-form input');

const chatSection = document.getElementById('chat');
const chatForm = document.getElementById('chat-form');
const isTypingElement = document.getElementById('is-typing');
const chatInput = document.querySelector('#chat-form input');

const messages = document.querySelector('.chat ul');
const onlineCount = document.getElementById('online');
const nicknames = document.getElementById('nicknames');

let userNickname = '';
let typingUsers = [];

chatForm.addEventListener('submit', e => {
	e.preventDefault();

	if (chatInput.value) {
		socket.emit('message', { nickname: userNickname, message: chatInput.value });
		chatInput.value = '';
		chatInput.focus();
	}
});

nicknameForm.addEventListener('submit', e => {
	e.preventDefault();

	const name = nicknameInput.value;
	if (name) {
		userNickname = name;
		nicknameSection.classList.add('hidden');
		chatSection.classList.remove('hidden');
		socket.emit('nickname', userNickname);
	}
});

chatInput.addEventListener('input', e => {
	if(e.target.value && e.target.value !== '') {
		socket.emit('typing', userNickname);
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
	if(nickname === userNickname) element.classList.add('own');
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

socket.on('nicknames', names => {
	onlineCount.textContent = `Online users (${names.length}):`;
	setNicknames(names);
});

function setTypingUsers() {
	const users = typingUsers.filter(u => u.nickname !== userNickname);
	if(users.length > 0) {
		if(users.length === 1) {
			isTypingElement.textContent = `${users[0].nickname} is typing...`;
		} else {
			isTypingElement.textContent = `${users.map(u => u.nickname).slice(0, users.length - 1).join(', ')} and ${users[users.length - 1].nickname} are typing...`;
		}
	} else {
		isTypingElement.textContent = '';
	}
}

function setNicknames(names) {
	nicknames.innerHTML = '';
	names.forEach(name => {
		const el = document.createElement('li');
		el.textContent = name;
		nicknames.appendChild(el);
	})
}

setInterval(() => {
  const time = Date.now();
  typingUsers = typingUsers.filter(user => time < user.date + 1500);
	setTypingUsers();
}, 100);