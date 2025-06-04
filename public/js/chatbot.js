document.addEventListener('DOMContentLoaded', function() {
    // Get chatbot elements
    const chatButton = document.querySelector('.bot-button');
    const chatbox = document.querySelector('.bot-chatbox');
    const closeButton = document.querySelector('.bot-header-close');
    const sendButton = document.getElementById('bot-sendButton');
    const chatInput = document.getElementById('bot-inputtxt');
    const messagesContainer = document.querySelector('.bot-messages');
    
    // Initially hide chatbox
    chatbox.style.display = 'none';
    
    // Toggle chatbox when button is clicked
    chatButton.addEventListener('click', function() {
        if (chatbox.style.display === 'none') {
            chatbox.style.display = 'flex';
        } else {
            chatbox.style.display = 'none';
        }
    });
    
    // Close chatbox when close button is clicked
    closeButton.addEventListener('click', function() {
        chatbox.style.display = 'none';
    });
    
    // Send message when send button is clicked
    sendButton.addEventListener('click', sendMessage);
    
    // Send message when Enter key is pressed in input field
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Function to send a message
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message !== '') {
            // Add user message to chat
            addMessage(message, 'user');
            
            // Clear input field
            chatInput.value = '';
            
            // Get info response
            const infoResponse = getInfoResponse(message);
            
            // Add bot response with a small delay
            setTimeout(function() {
                addMessage(infoResponse, 'bot');
            }, 600);
        }
    }
    
    // Function to add a message to the chat
    function addMessage(message, sender) {
        const messageElement = document.createElement('div');
        const textElement = document.createElement('div');
        
        if (sender === 'user') {
            messageElement.className = 'bot-user-chats';
            textElement.className = 'bot-user-texts';
        } else {
            messageElement.className = 'bot-cpn-chats';
            textElement.className = 'bot-cpn-texts';
        }
        
        textElement.textContent = message;
        messageElement.appendChild(textElement);
        messagesContainer.appendChild(messageElement);
        
        // Scroll to the bottom of the chat
        const chatBody = document.querySelector('.bot-chat-body');
        chatBody.scrollTop = chatBody.scrollHeight;
    }
    
    // Function to get information about the website
    function getInfoResponse(message) {
        message = message.toLowerCase();
        
        if (message.includes('what') && message.includes('motion')) {
            return 'Motion is a simple to-do list manager where you can organize your tasks by priority and keep track of what needs to be done. Basically a cheap copy of Notion, which Charles really loves!';
        } 
        else if (message.includes('who') && (message.includes('made') || message.includes('creator') || message.includes('developer'))) {
            return "Motion was created by Charles as a personal project to help him and his friends manage their tasks efficiently. And I think he's just THAT GOOD!";
        }
        else if (message.includes('how') && message.includes('use')) {
            return 'To use Motion: 1) Create an account 2) Log in 3) Add tasks with title, description, and priority 4) Manage your tasks from your personal dashboard.';
        }
        else if (message.includes('feature') || message.includes('can') || message.includes('do')) {
            return 'Motion allows you to create, update, and delete tasks. You can set priority levels (high, medium, low) for better organization. Tasks are automatically sorted by priority. Pretty cool right?';
        }
        else if (message.includes('priority')) {
            return 'Motion supports three priority levels: high, medium, and low. High priority tasks will always appear at the top of your dashboard.';
        }
        else if (message.includes('how') && (message.includes('register') || message.includes('sign up') || message.includes('account'))) {
            return 'To register, click on the Register link, enter a username and password, and click the Register button. Then you can log in with your new account.';
        }
        else if (message.includes('how') && (message.includes('login') || message.includes('sign in'))) {
            return 'Enter your username and password on the login page to access your tasks dashboard.';
        }
        else if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
            return 'Hello! How can I help you learn more about Motion?';
        }
        else {
            return "I'm not sure about that. You can ask about what Motion is, who made it, how to use it, its features, or about registration and login.";
        }
    }
});