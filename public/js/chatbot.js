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
        chatbox.style.display = (chatbox.style.display === 'none') ? 'flex' : 'none';
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
            addMessage(message, 'user');
            chatInput.value = '';

            const infoResponse = getInfoResponse(message);

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
    
    // Function to get information about Tasklet
    function getInfoResponse(message) {
        message = message.toLowerCase();
        
        if (message.includes('what') && message.includes('tasklet')) {
            return 'Tasklet is a simple to-do list manager where you can organize your tasks by priority and keep track of what needs to be done.' ;
        } 
        else if (message.includes('who') && (message.includes('made') || message.includes('creator') || message.includes('developer'))) {
            return "Tasklet was made by Charles as a personal project to practice Javascript and well, manage his tasks efficiently, and hey you can now use it too!";
        }
        else if (message.includes('how') && message.includes('use')) {
            return 'Using Tasklet is easy: 1) Register an account, 2) Log in, 3) Add tasks with title, description, and priority, 4) Stay on top of your day with zero bloat.';
        }
        else if (message.includes('feature') || message.includes('can') || message.includes('do')) {
            return 'Tasklet lets you create, edit, and delete tasks. You can set priority levels (high, medium, low) for better organization. Tasks are automatically sorted by priority. Pretty cool right?';
        }
        else if (message.includes('priority')) {
            return 'Tasks can be tagged as High, Medium, or Low priority. High ones float to the top so you never miss what’s important.';
        }
        else if (message.includes('how') && (message.includes('register') || message.includes('sign up') || message.includes('account'))) {
            return 'To register, hit the Register link, fill in a username and password, and you’re in. No emails, no spam, just you and your tasks.';
        }
        else if (message.includes('how') && (message.includes('login') || message.includes('sign in'))) {
            return 'Just enter your username and password on the login form and you’ll land on your personal dashboard.';
        }
        else if (message.includes('save') && message.includes('data')) {
            return 'All your tasks are stored securely on your own device using SQLite. No cloud, no sync, no nonsense.';
        }
        else if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
            return 'Hello! I’m Tako 🐙 — your friendly Tasklet helper bot. Ask me anything about the app!';
        }
        else if (message.includes('you') || (message.includes("you're") || message.includes('you are') && message.includes('cute'))) {
            return 'Aww, thanks! I try my best to be helpful and adorable. 🐙💕';
        }
        else {
            return "Hmm... Tako doesn't know how to answer that yet. Try asking about Tasklet's features, how to register, or who made it!";
        }
    }
});
