(() => {
  const site = document.currentScript.getAttribute("data-site");
  const apiSite = document.currentScript.getAttribute("data-origin");

  const style = `
    @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

    #ai-chat-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #005eff;
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
    }

    #ai-chat-header {
      background: #005eff;
      color: white;
      padding: 10px;
      font-weight: bold;
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
      background: #005eff;
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
      background: #005eff;
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
  const s = document.createElement("style");
  s.innerHTML = style;
  document.head.appendChild(s);

  const b = document.createElement("button");
  b.id = "ai-chat-button";
  b.innerHTML = '<i class="fas fa-comment-dots"></i>';
  b.onclick = () => {
    box.style.display = box.style.display === "none" ? "flex" : "none";
    messages.scrollTop = messages.scrollHeight;
  };

  const box = document.createElement("div");
  box.id = "ai-chat-box";
  box.innerHTML = `
    <div id="ai-chat-header">AI Assistant</div>
    <div id="ai-chat-messages"></div>
    <div id="ai-chat-input">
      <input type="text" placeholder="Ask something..." />
      <button><i class="fas fa-paper-plane"></i></button>
    </div>`;

  document.body.append(b, box);

  const input = box.querySelector("input");
  const send = box.querySelector("button");
  const messages = box.querySelector("#ai-chat-messages");

  const escapeHTML = (str) => {
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);
  };

  const addMsg = (text, sender, isHTML = false) => {
    const msg = document.createElement("div");
    msg.className = `msg ${sender}`;
    msg.innerHTML = isHTML ? text : escapeHTML(text);
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  };

  send.onclick = handleSend;

  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  });

  async function handleSend() {
    const q = input.value.trim();
    if (!q) return;
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
        renderProductsPage(window.__chatbotProducts, 1);
      } else {
        addMsg(data.answer || "Sorry, I didn’t get that.", "bot");
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

    const fullHTML = productListHTML + paginationHTML;
    addMsg(fullHTML, "bot", true);
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
