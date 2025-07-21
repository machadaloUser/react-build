(() => {
  const site = document.currentScript.getAttribute("data-site");
  const apiSite = document.currentScript.getAttribute("data-origin");
  const background = document.currentScript.getAttribute("data-background") || "#a12641";
  const domain = window.location.hostname;
  
  const style = `
    @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

    #ai-chat-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${background};
      color: white;
      font-size: 28px;
      border: none;
      z-index: 9999;
      cursor: pointer;
    }

    #ai-chat-box {
      display: none;
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 320px;
      height: 420px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      overflow: hidden;
      z-index: 9999;
      flex-direction: column;
      display: flex;
      transition: all 0.3s ease-in-out;
    }

    #ai-chat-box.fullscreen {
      width: 100vw !important;
      height: 100vh !important;
      bottom: 0 !important;
      right: 0 !important;
      border-radius: 0 !important;
      z-index: 10000 !important;
    }

    #ai-chat-header {
      background: ${background};
      color: white;
      padding: 10px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    #ai-chat-header .controls {
      display: flex;
      gap: 8px;
    }

    #ai-chat-header button {
      background: none;
      border: none;
      color: white;
      font-size: 16px;
      cursor: pointer;
    }

    #ai-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 10px;
      font-size: 14px;
      display: flex;
      flex-direction: column;
    }

    #ai-chat-input {
      display: flex;
      border-top: 1px solid #ccc;
    }

    #ai-chat-input input {
      flex: 1;
      padding: 10px;
      border: none;
      outline: none;
      font-size: 14px;
    }

    #ai-chat-input button {
      background: ${background};
      color: white;
      border: none;
      padding: 0 15px;
      cursor: pointer;
    }

    .msg {
      margin: 5px 0;
      padding: 8px;
      border-radius: 10px;
      max-width: 90%;
    }

    .msg.user {
      background: ${background};
      color: white;
      align-self: flex-end;
    }

    .msg.bot {
      background: #f0f0f0;
      color: #333;
      align-self: flex-start;
    }

    .product {
      margin: 5px 0;
      font-size: 13px;
    }

    .product strong {
      font-size: 14px;
      display: block;
      margin-bottom: 3px;
    }

    hr {
      border: none;
      border-top: 1px solid #ccc;
      margin: 6px 0;
    }

    .typing-dots span {
      animation: blink 1s infinite;
      font-weight: bold;
      font-size: 16px;
    }

    .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes blink {
      0%, 20% { opacity: 0; }
      50% { opacity: 1; }
      100% { opacity: 0; }
    }
  `;

  const styleElement = document.createElement("style");
  styleElement.innerHTML = style;
  document.head.appendChild(styleElement);

  const chatBtn = document.createElement("button");
  chatBtn.id = "ai-chat-button";
  chatBtn.innerHTML = '<i class="fas fa-comment-dots"></i>';    
  chatBtn.onclick = async() => {
    chatBox.style.display = chatBox.style.display === "none" ? "flex" : "none";
    messages.scrollTop = messages.scrollHeight;
    if (chatBox.style.display === "flex" && !chatBox.dataset.loaded) {
        try {
          const ipRes = await fetch("https://api64.ipify.org?format=json");
          const userIp = (await ipRes.json()).ip;
          const histRes = await fetch(`${apiSite.replace("/ask", "")}/history?site=${site}&ip=${"127.0.0.1"}`);
          const history = await histRes.json();
          history.forEach(h => addMsg(h.message, h.role));
          chatBox.dataset.loaded = "true";
        } catch (err) {
        console.warn("Chat history failed to load", err);
      }
    }  
  };
  window.onload =async()=>{
   // chatBox.style.display = chatBox.style.display === "none" ? "flex" : "none";
    messages.scrollTop = messages.scrollHeight;
    if (!chatBox.dataset.loaded) {
        try {
          const ipRes = await fetch("https://api64.ipify.org?format=json");
          const userIp = (await ipRes.json()).ip;
          const histRes = await fetch(`${apiSite.replace("/ask", "")}/history?site=${site}&ip=${"127.0.0.1"}`);
          const history = await histRes.json();
          history.forEach(h => addMsg(h.message, h.role));
          chatBox.dataset.loaded = "true";
        } catch (err) {
        console.warn("Chat history failed to load", err);
      }
    }     
  }

  const chatBox = document.createElement("div");
  chatBox.id = "ai-chat-box";  
  chatBox.innerHTML = `
    <div id="ai-chat-header">
      <span>Hi Chat with ${domain} 💬</span>
      <div class="controls">
        <button id="ai-fullscreen-toggle" title="Toggle Fullscreen">⛶</button>
        <button id="ai-close-btn" title="Close">&times;</button>
      </div>
    </div>
    <div id="ai-chat-messages"></div>
    <div id="ai-chat-input">
      <input type="text" placeholder="Ask me anything..." />
      <button id="sendBtn"><i class="fas fa-paper-plane"></i></button>
    </div>`;
  
  document.body.append(chatBtn, chatBox);

  const input = chatBox.querySelector("input");
  const send = chatBox.querySelector("#sendBtn");
  const messages = chatBox.querySelector("#ai-chat-messages");

  const genZWords = ["yo", "fam", "vibe", "lit", "sus", "cap", "bet", "slay", "deadass"];

  const addMsg = (text, sender, isHTML = false) => {
    const msg = document.createElement("div");
    msg.className = `msg ${sender}`;
    msg.innerHTML = isHTML ? text : formatMessage(text);
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  };

  function formatMessage(text) {
  // Escape HTML
  text = text.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));

  // Format code blocks (```...```)
  text = text.replace(/```([\s\S]*?)```/g, (_, code) => {
    return `<pre style="background:#f0f0f0;padding:10px;border-radius:6px;overflow-x:auto;"><code>${code.trim()}</code></pre>`;
  });

  // Inline `code`
  text = text.replace(/`([^`\n]+)`/g, (_, code) => {
    return `<code style="background:#eee;padding:2px 4px;border-radius:4px;">${code}</code>`;
  });

  // Bold, italic, strikethrough
  text = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/~~(.*?)~~/g, '<del>$1</del>');

  // Links
  text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color:#005eff;">$1</a>');

  // Detect inline numbered lists (e.g. 1. ..., 2. ..., 3. ...)
  const numberedListMatch = text.match(/(?:\d+\.\s[^]+?)(?=(\d+\.\s)|$)/g);
  if (numberedListMatch && numberedListMatch.length > 2) {
    const listItems = numberedListMatch.map(item => {
      return `<li>${item.replace(/^\d+\.\s*/, "").trim()}</li>`;
    }).join("");
    return text.split(numberedListMatch[0])[0] + `<ol style="margin: 0 0 0 1em; padding-left: 1em;">${listItems}</ol>`;
  }

  // Line-based bulleted or numbered lists
  const lines = text.split("\n").map(line => line.trim()).filter(Boolean);
  const isNumbered = lines.every(l => /^\d+[\.\)]/.test(l));
  const isBulleted = lines.every(l => /^[-*•]/.test(l));

  if (isNumbered || isBulleted) {
    const tag = isNumbered ? "ol" : "ul";
    const items = lines.map(line =>
      `<li>${line.replace(/^(\d+[\.\)]|[-*•])\s*/, "")}</li>`
    ).join("");
    return `<${tag} style="margin: 0 0 0 1em; padding-left: 1em;">${items}</${tag}>`;
  }

  return text.replace(/\n/g, "<br>");
}

  function detectGenZ(text) {
    return genZWords.some(w => text.toLowerCase().includes(w));
  }

  send.onclick = handleSend;

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // 🎯 Fullscreen Toggle
  document.addEventListener("click", (e) => {
    if (e.target.id === "ai-fullscreen-toggle") {
      chatBox.classList.toggle("fullscreen");
    } else if (e.target.id === "ai-close-btn") {
      chatBox.style.display = "none";
    }
  });

   async function handleSend() {
    const q = input.value.trim();
    if (!q) return;

    const isGenZ = detectGenZ(q);

    addMsg(q, "user");
    input.value = "";
    addMsg('<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>', "bot", true);

    try {
      const res = await fetch(apiSite, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, site })
      });

      const data = await res.json();
      messages.lastChild.remove();      
      if (data.api_result?.response?.products?.length) {
        window.__chatbotProducts = data.api_result.response.products;
        const apiResultHtml = renderProductsPage(window.__chatbotProducts, 1);
        addMsg((isGenZ ? "Check these out fam 🛍️:" : "Here are some products for you:") + "<br>" + apiResultHtml, "bot", true);
      } else if (data.api_result?.response?.OrderDetails?.length) {        
        window.__chatbotOrderDetails = data.api_result.response.OrderDetails;
        const apiResultHtml = renderOrdersPage(window.__chatbotOrderDetails, 1);
        addMsg((isGenZ ? "Check these out fam 🛍️:" : "Here are some order details for you:") + "<br>" + apiResultHtml, "bot", true);
      } else {   
        const msg = data.answer || "Sorry, I didn’t get that.";
        addMsg(isGenZ ? `Peep this, fam 💭 ${msg}` : msg, "bot");     
        //addMsg(data.answer || "Sorry, I didn’t get that.", "bot");
      }
    } catch (err) {
      messages.lastChild.remove();
      addMsg("Something went wrong. Please try again.", "bot");
      console.error(err);
    }
  }

  function renderProductsPage(products, page = 1, perPage = 5) {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const currentProducts = products.slice(start, end);

    const productListHTML = currentProducts.map(p => `
      <div class="product">
        <strong>${p.products_name}</strong>
        <small>${p.products_description}</small>
      </div>
    `).join("<hr>");

    const paginationHTML = `
      <div class="pagination" style="text-align:center; margin-top: 10px;">
        ${Array.from({ length: Math.ceil(products.length / perPage) }, (_, i) => `
          <button onclick="window.__changeProductPage(${i + 1})">${i + 1}</button>
        `).join("")}
      </div>
    `;

    return fullHTML = productListHTML + paginationHTML;
    //addMsg(fullHTML, "bot", true);
  }

  function renderOrdersPage(orders, page = 1, perPage = 3) {    
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const currentOrders = orders.slice(start, end);

  const orderListHTML = currentOrders.map(o => `
    <div class="order" style="padding: 15px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 6px;">
      <div><strong>Order ID:</strong> ${o.orders_id}</div>
      <div><strong>Customer:</strong> ${o.customers_name}</div>
      <div><strong>Email:</strong> ${o.customers_email_address}</div>
      <div><strong>Date:</strong> ${o.date_purchased}</div>
      <div><strong>Status:</strong> ${o.orders_status}</div>
      <div><strong>Products:</strong><br><pre style="white-space: pre-line; background:#f9f9f9; padding:8px;">${o.products_summary}</pre></div>
      <div><strong>Shipping:</strong><br><pre style="white-space: pre-line; background:#f9f9f9; padding:8px;">${o.shipping_summary}</pre></div>
      <div><strong>Totals:</strong><br><pre style="white-space: pre-line; background:#f0fff0; padding:8px;">${o.totals_summary}</pre></div>
    </div>
  `).join("");

  const totalPages = Math.ceil(orders.length / perPage);
  const paginationHTML = `
    <div class="pagination" style="text-align:center; margin-top: 10px;">
      ${Array.from({ length: totalPages }, (_, i) => `
        <button onclick="window.__changeOrderPage(${i + 1})" style="margin: 0 5px;">${i + 1}</button>
      `).join("")}
    </div>
  `;
  return orderListHTML;
}


  // Global pagination handler
  window.__changeProductPage = (page) => {
    const products = window.__chatbotProducts || [];
    const start = (page - 1) * 5;
    const end = start + 5;
    const pageProducts = products.slice(start, end);

    const productListHTML = pageProducts.map(p => `
      <div class="product">
        <strong>${p.products_name}</strong>
        <small>${p.products_description}</small>
      </div>
    `).join("<hr>");

    const paginationHTML = `
      <div class="pagination" style="text-align:center; margin-top: 10px;">
        ${Array.from({ length: Math.ceil(products.length / 5) }, (_, i) => `
          <button onclick="window.__changeProductPage(${i + 1})">${i + 1}</button>
        `).join("")}
      </div>
    `;

    const html = productListHTML + paginationHTML;
    const lastBotMsg = [...messages.querySelectorAll(".msg.bot")].pop();
    if (lastBotMsg) lastBotMsg.innerHTML = html;
  };
  
  
})();
