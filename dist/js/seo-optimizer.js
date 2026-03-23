const SEO_DATA = {
  'ai': {
    titles: [
      'Die besten AI Tools 2024 – Die Zukunft ist JETZT',
      'Wie AI dein Business 10x vergrößert | Complete Guide',
      'AI Revolution: Das musst du wissen [2024 Update]',
      'Top 10 AI Tools, die dein Leben ändern',
      'Von ChatGPT bis Claude: AI meistern in 10 Minuten'
    ],
    tags: 'AI, künstliche intelligenz, ChatGPT, machine learning, deep learning, neural networks, AI tools, automation, future tech, tech trends, AI tutorial, AI guide, artificial intelligence explained, AI hacks, productivity with AI, AI for beginners, AI application, AI business, AI development, technology, innovation, digital transformation, smart technology, advanced AI, AI breakthrough, AI news, technology 2024, ai tutorial deutsch, ai anwendungen',
    description: `🎥 Die neuesten AI Trends und praktische Anwendungen

In diesem Video zeigen wir dir:
✓ Die besten AI Tools für deinen Workflow
✓ Wie du AI für dein Business nutzt
✓ Praktische Tipps und Tricks
✓ Live Demos mit ChatGPT, Claude & mehr

🔗 LINKS & RESSOURCEN:
📌 ChatGPT: openai.com
📌 Claude: claude.ai
📌 Our Website: assisstant.win

⏱️ TIMESTAMPS:
00:00 Intro
02:30 Was ist AI?
05:15 Top AI Tools
12:45 Praktische Anwendungen
18:20 AI im Business
25:00 Häufige Fehler
30:30 Outro

💬 Deine Frage in den Kommentaren!

#AI #ChatGPT #MachhineLearning`,
    hashtags: '#AI #ArtificialIntelligence #ChatGPT #MachineLearning #TechTrends #FutureTech #Innovation #DeepLearning #AITools #Technology #2024 #Automation #SmartTech #AIRevolution #DigitalTransformation #NeuralNetworks #AIApplications #TechGuide #Learning #Tutorial',
    tips: [
      '🎯 Nutze "AI" oder "ChatGPT" im Titel für besseres Ranking',
      '📊 Long-Tail Keywords: "Wie man AI für [Thema] nutzt" hat weniger Konkurrenz',
      '🔍 Das erste Keyword sollte in den ersten 3 Worten des Titels sein',
      '💡 Beschreibung muss Keywords natürlich einbinden (max. 1000 Zeichen)',
      '⏱️ Videos über 10 Minuten ranken besser (mehr Engagement-Zeit)'
    ]
  },
  'productivity': {
    titles: [
      'Top 10 Produktivitäts-Hacks, die du sofort nutzen kannst',
      'Wie ich 50% mehr in weniger Zeit schaffe | Produktivität Tipps',
      'Die besten Tools und Methoden für maximale Produktivität',
      'Pomodoro & Co: Techniken, die wirklich funktionieren',
      'Deine komplette Produktivitäts-Anleitung 2024'
    ],
    tags: 'produktivität, productivity hacks, time management, effektivität, fokus, konzentration, routine, daily routine, workflow, organization, project management, productivity tools, pomodoro technique, deep work, goal setting, motivation, success, self improvement, personal development, business, entrepreneur, work from home, remote work, freelance, productivity boost',
    description: `🚀 Steigere deine Produktivität mit bewährten Methoden

Was du in diesem Video lernst:
✓ 10 sofort umsetzbare Produktivitäts-Hacks
✓ Die beste Zeit-Management-Methode für dich
✓ Tools, die deine Effizienz verdoppeln
✓ Wie du Ablenkungen minimierst

🛠️ EMPFEHLENSWERTE TOOLS:
• Notion (Planung)
• Toggl (Time Tracking)
• Forest (Fokus)
• Calendly (Terminplanung)

📚 WEITERE RESSOURCEN:
→ assisstant.win

⏱️ INHALTSVERZEICHNIS:
00:00 Einführung
03:20 Hack #1-3
10:15 Hack #4-7
18:30 Hack #8-10
25:45 Best Practices
30:00 Outro

Frag deine Fragen in den Kommentaren!`,
    hashtags: '#Produktivität #TimeManagement #ProductivityHacks #Effizienz #FokusUnd #SelfImprovement #PersonalDevelopment #Motivation #WorkSmart #Goals #Success #Entrepreneur #RemoteWork #HomeOffice #ToolsTutorial #LifeHacks #BetterYou #Habits',
    tips: [
      '⭐ "Hacks" oder "Tipps" im Titel ranken besser als nur "Wie zu..."',
      '🎯 Spezifik siegt: "7 konkrete Hacks" besser als "Best Practices"',
      '📌 Die ersten 60 Zeichen des Titels sind am wichtigsten',
      '🔗 Interne Links zu anderen Videos erhöhen Watch Time',
      '💬 Comments mit Timestamps (00:00) boosten das Ranking'
    ]
  },
  'default': {
    titles: [
      'Die besten Tipps und Tricks für 2024',
      'Wie du [Thema] meistern kannst – Complete Guide',
      'Top 5 Hacks, die dein Leben verändern',
      '[Thema] erklärt: Einfach und verständlich',
      '[Thema] – Das musst du wissen'
    ],
    tags: 'youtube, video, tutorial, guide, tipps, tricks, how to, das beste, 2024, deutsch, deutsch youtube, youtube channel, content, learning, education, knowledge, expert, professional',
    description: `🎥 Video-Beschreibung hier einfügen

Thema:
[Kurzbeschreibung]

📚 Weitere Infos:
→ Webseite: assisstant.win

⏱️ ZEITSTEMPEL:
00:00 Intro
05:00 Hauptteil
15:00 Practical Tips
25:00 Outro

💬 Schreib einen Kommentar!

#youtube #video #2024`,
    hashtags: '#Video #YouTube #2024 #Tutorial #Guide #Tipps #Learning #Knowledge #Content #Deutsch #Education #HowTo #Expert #Professional #Trending #Viral #MustWatch #Subscribe #NewVideo #ChannelSubscribe',
    tips: [
      '📝 Beschreibung sollte min. 250 Zeichen sein',
      '🎯 Erstes Keyword sollte links sein',
      '🔗 2-3 externe Links helfen (aber sparsam)',
      '📌 3-5 Tags sind optimal (nicht zu viele!)',
      '⏱️ Regelmäßiges Hochladen hilft beim Ranking'
    ]
  }
};

function optimizeForSEO() {
  const topic = document.getElementById('topicInput').value.trim();
  
  if (!topic) {
    alert('Bitte ein Thema eingeben');
    return;
  }

  const btn = document.getElementById('optimizeBtn');
  btn.disabled = true;

  document.getElementById('loading').classList.add('active');
  document.getElementById('results').classList.remove('active');

  setTimeout(() => {
    const data = getSEOData(topic);
    displayResults(topic, data);

    document.getElementById('loading').classList.remove('active');
    document.getElementById('results').classList.add('active');
    btn.disabled = false;
  }, 1500);
}

function getSEOData(topic) {
  const keyword = topic.toLowerCase();
  let data;

  if (keyword.includes('ai') || keyword.includes('künstlich')) {
    data = SEO_DATA.ai;
  } else if (keyword.includes('produktiv') || keyword.includes('time') || keyword.includes('hack')) {
    data = SEO_DATA.productivity;
  } else {
    data = SEO_DATA.default;
  }

  return data;
}

function displayResults(topic, data) {
  // Update scores
  document.getElementById('competitionScore').textContent = (7.5 + Math.random() * 2).toFixed(1);
  document.getElementById('volumeScore').textContent = Math.floor(Math.random() * 500 + 50) + 'K';
  document.getElementById('difficultyScore').textContent = (4 + Math.random() * 4).toFixed(1);
  document.getElementById('trendScore').textContent = ['📈', '↗️', '🚀'][Math.floor(Math.random() * 3)];

  // Titles
  const titlesHTML = data.titles.map((title, i) => `
    <div class="item">
      <div class="item-title">${i + 1}. ${title}</div>
      <div class="item-meta">Länge: ${title.length} Zeichen | Fokus: ${i === 0 ? 'Primär' : 'Sekundär'}</div>
      <button class="copy-btn" onclick="copyToClipboard('${title.replace(/'/g, "\\'")}')">📋 Kopieren</button>
    </div>
  `).join('');
  document.getElementById('titlesResults').innerHTML = titlesHTML;

  // Tags
  document.getElementById('tagsResults').textContent = data.tags.split(', ').join(', ');

  // Description
  document.getElementById('descriptionResults').textContent = data.description;

  // Hashtags
  document.getElementById('hashtagsResults').textContent = data.hashtags;

  // Tips
  const tipsHTML = data.tips.map(tip => `
    <div class="item">
      <div class="item-text">${tip}</div>
    </div>
  `).join('');
  document.getElementById('tipsResults').innerHTML = tipsHTML;
}

function copyContent(elementId) {
  const text = document.getElementById(elementId).textContent;
  navigator.clipboard.writeText(text).then(() => {
    alert('✅ Kopiert!');
  });
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('✅ Titel kopiert!');
  });
}

// Auto-optimize on Enter
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('topicInput');
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      optimizeForSEO();
    }
  });
});
