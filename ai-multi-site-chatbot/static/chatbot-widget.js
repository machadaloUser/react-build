(() => {
  const domain = window.location.hostname;
  const scriptMap = {
    "rwsmithco.com": "chatbot-rwsmithco.js",
    "rwsmithco.info": "chatbot-rwsmithco.js",
    "localhost": "chatbot-ismojo.js",    
    "192.168.0.165": "chatbot-ismojo.js",
    // Add more domains and corresponding scripts here
  };

  const clientScript = scriptMap[domain] || "chatbot-default.js";
  const s = document.createElement("script");
  s.src = "https://dev.machadalo.com/r/ai-multi-site-chatbot/static/" + clientScript;
  s.setAttribute("data-site", document.currentScript.getAttribute("data-site"));
  s.setAttribute("data-origin", document.currentScript.getAttribute("data-origin"));
  document.head.appendChild(s);
})();
