import user from './assets/user.svg';
import bot from './assets/bot.svg';

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loaderInterval;

function loader(element) {
    element.textContent = '';
    loaderInterval = setInterval(() => {
        element.textContent += '.';
        if (element.textContent === '....')
            element.textContent = '';
    }, 300);
}

function typeText(element, text) {
    let index = 0;
    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++; 
        } else {
            clearInterval(interval);
        }
    }, 20)
}

function generateUniqueID() {
    let date = Date.now();
    let randomNumber = Math.random();
    let hexString = randomNumber.toString(16);
    return `id-${date}-${hexString}`;
}

function chatStripe(isAi, value, uniqueID) {
    return (
        `<div class="wrapper ${isAi && 'ai'}">
                <div class="chat">
                    <div class="profile">
                        <img
                            src = ${isAi ? bot : user}
                            alt = ${isAi ? 'bot' : 'user'} 
                        />
                    </div>
                    <div class="message" id=${uniqueID}>${value}</div>
                </div>
        </div>`
    )
}

const handleSubmit = async (e) => {
    e.preventDefault();
    let formData = new FormData(form);

    // User stripe
    chatContainer.innerHTML += chatStripe(false, formData.get('prompt'));

    form.reset();

    let uniqueID = generateUniqueID();
    // AI stripe
    chatContainer.innerHTML += chatStripe(true, "", uniqueID);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    let messageDiv = document.getElementById(`${uniqueID}`);
    loader(messageDiv);
    
    // Fetch data
    const response = await fetch('https://codex-your-coding-ai.onrender.com', {
        method: 'POST',
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({prompt: formData.get('prompt')})
    })

    clearInterval(loaderInterval);
    messageDiv.innerHTML = '';

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim();

        typeText(messageDiv, parsedData);
    } else {
        const err = await response.text();
        messageDiv.innerHTML = "Something went wrong!";
        alert(err);
    }
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13)
        handleSubmit(e)
});