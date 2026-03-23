let tools = [];
let filteredTools = [];

async function loadTools() {
  const res = await fetch('/api/tools');
  tools = await res.json();
  filteredTools = tools;
  render();
}

function filterTools(query) {
  query = query.toLowerCase();
  filteredTools = tools.filter(t => 
    t.name.toLowerCase().includes(query) ||
    t.description.toLowerCase().includes(query)
  );
  render();
}

function render() {
  const root = document.getElementById('root');
  const categories = getCategories();
  
  root.innerHTML = `
    <div class="container">
      <div class="sidebar">
        <h2>🛠️ ToolBox</h2>
        ${categories.map(cat => `
          <div class="category">
            <h3>${cat}</h3>
            <ul>
              ${tools.filter(t => t.category === cat).map(t => `
                <li><a href="#" onclick="selectTool('${t.id}')">${t.icon} ${t.name}</a></li>
              `).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
      <div class="main">
        <div class="header">
          <h1>🛠️ ToolBox Dashboard</h1>
          <input type="text" class="search-input" placeholder="Tools suchen..." 
            onkeyup="filterTools(this.value)">
        </div>
        <div class="content">
          <div class="tools-grid">
            ${filteredTools.map(tool => `
              <div class="tool-card" onclick="selectTool('${tool.id}')">
                <div class="tool-icon">${tool.icon}</div>
                <div class="tool-name">${tool.name}</div>
                <div class="tool-desc">${tool.description}</div>
                <span class="tool-status status-${tool.status}">${tool.status}</span>
                <button class="tool-btn">Öffnen →</button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function getCategories() {
  return [...new Set(tools.map(t => t.category))];
}

function selectTool(id) {
  const tool = tools.find(t => t.id === id);
  if (tool && tool.path) {
    loadToolPage(tool.path);
  }
}

function loadToolPage(path) {
  const root = document.getElementById('root');
  
  const supportedTools = {
    '/youtube/thumbnail': '/pages/thumbnail.html',
    '/youtube/tags': '/pages/seo.html',
    '/podcast/content': '/pages/podcast.html',
    '/podcast/multicontent': '/pages/multicontent.html'
  };
  
  if (supportedTools[path]) {
    root.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100vh;">
        <button onclick="goBack()" style="padding: 1rem; background: #1e293b; border: none; color: #e2e8f0; cursor: pointer; text-align: left; z-index: 10;">← Zurück zum Dashboard</button>
        <iframe src="${supportedTools[path]}" style="flex: 1; border: none; width: 100%;"></iframe>
      </div>
    `;
  } else {
    root.innerHTML = `<div style="padding: 2rem; color: #e2e8f0; text-align: center;">
      <p>Tool in Entwicklung...</p>
      <button onclick="goBack()" style="padding: 0.5rem 1rem; background: #3b82f6; color: #fff; border: none; border-radius: 0.375rem; cursor: pointer;">← Zurück</button>
    </div>`;
  }
}

function goBack() {
  render();
}

loadTools();
