
/**
 * Imagineflow AI Chatbot Widget
 * Configured for: Support Bot
 */

(function() {
  // Configuration
  const CONFIG = {
    name: "Support Bot",
    welcomeMessage: "Hello! How can I help you today?",
    primaryColor: "#8b5cf6",
    apiKey: "GEMINI_API_KEY", // Note: In production, use a backend proxy!
    context: ""
  };

  // Inject Fonts & Icons
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdn.jsdelivr.net/npm/lucide-static@0.344.0/font/lucide.min.css';
  document.head.appendChild(link);

  // Create UI Elements
  const container = document.createElement('div');
  container.id = 'if-chatbot-container';
  container.innerHTML = `
    <div id="if-chat-window" class="hidden">
      <div class="if-header" style="background-color: ${CONFIG.primaryColor}">
        <div class="if-title">
          <i class="icon-message-square"></i>
          <span>${CONFIG.name}</span>
        </div>
        <button id="if-close-btn">&times;</button>
      </div>
      <div id="if-messages" class="if-messages">
        <div class="if-message bot">
          ${CONFIG.welcomeMessage}
        </div>
      </div>
      <div class="if-input-area">
        <input type="text" id="if-input" placeholder="Type a message..." />
        <button id="if-send-btn" style="background-color: ${CONFIG.primaryColor}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
    <button id="if-toggle-btn" style="background-color: ${CONFIG.primaryColor}">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    </button>
  `;
  document.body.appendChild(container);

  // Logic
  const toggleBtn = document.getElementById('if-toggle-btn');
  const closeBtn = document.getElementById('if-close-btn');
  const chatWindow = document.getElementById('if-chat-window');
  const input = document.getElementById('if-input');
  const sendBtn = document.getElementById('if-send-btn');
  const messagesContainer = document.getElementById('if-messages');

  toggleBtn.addEventListener('click', () => {
    chatWindow.classList.toggle('hidden');
    if (!chatWindow.classList.contains('hidden')) input.focus();
  });

  closeBtn.addEventListener('click', () => chatWindow.classList.add('hidden'));

  const addMessage = (text, isUser = false) => {
    const div = document.createElement('div');
    div.className = `if-message ${isUser ? 'user' : 'bot'}`;
    div.innerText = text;
    if (isUser) div.style.backgroundColor = CONFIG.primaryColor;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  const showTyping = () => {
    const div = document.createElement('div');
    div.className = 'if-message bot typing';
    div.id = 'if-typing';
    div.innerHTML = '<span>.</span><span>.</span><span>.</span>';
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  const removeTyping = () => {
    const el = document.getElementById('if-typing');
    if (el) el.remove();
  };

  const callGemini = async (userMessage) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${CONFIG.apiKey}`;
    
    const prompt = {
      contents: [{
        role: "user",
        parts: [{ text: `System: You are a helpful AI assistant for this website. 
        Strictly answer based on the following Knowledge Base. If the answer is not in the context, politely say you don't know.
        
        Knowledge Base:
        ${CONFIG.context}
        
        User Question: ${userMessage}` }]
      }]
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompt)
      });
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error(error);
      return "Sorry, I'm having trouble connecting right now.";
    }
  };

  const handleSend = async () => {
    const text = input.value.trim();
    if (!text) return;
    
    addMessage(text, true);
    input.value = '';
    showTyping();

    const reply = await callGemini(text);
    removeTyping();
    addMessage(reply);
  };

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });

})();
