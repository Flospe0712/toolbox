let currentTranscript = '';
let currentMetadata = {};

const uploadSection = document.getElementById('uploadSection');
const audioInput = document.getElementById('audioInput');
const processing = document.getElementById('processing');
const resultsSection = document.getElementById('resultsSection');

// Upload-Bereich Click
uploadSection.addEventListener('click', () => audioInput.click());

// Drag & Drop
uploadSection.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadSection.classList.add('dragover');
});

uploadSection.addEventListener('dragleave', () => {
  uploadSection.classList.remove('dragover');
});

uploadSection.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadSection.classList.remove('dragover');
  
  const files = e.dataTransfer.files;
  if (files.length) {
    handleFile(files[0]);
  }
});

// File Input Change
audioInput.addEventListener('change', (e) => {
  if (e.target.files.length) {
    handleFile(e.target.files[0]);
  }
});

function handleFile(file) {
  if (file.type.includes('audio')) {
    transcribeAudio(file);
  }
}

function transcribeAudio(file) {
  processing.classList.add('active');
  
  // Simulate transcription
  const reader = new FileReader();
  reader.onload = async () => {
    simulateTranscription(file.name);
  };
  reader.readAsArrayBuffer(file);
}

function simulateTranscription(filename) {
  // Demo-Transkript basierend auf Dateiname
  const demoTranscripts = {
    'ai': `In dieser Episode sprechen wir über künstliche Intelligenz und ihre Auswirkungen auf die Zukunft. 
    
    Wir diskutieren, wie AI unsere tägliche Arbeit verändert, welche neuen Möglichkeiten entstehen und welche Herausforderungen wir bewältigen müssen. 
    
    Von maschinellem Lernen bis zu großen Sprachmodellen – die Technologie entwickelt sich rasant.
    
    Wichtige Punkte:
    - Automatisierung von Routineaufgaben
    - Neue Jobprofile und Umschulung
    - Ethische Fragen der AI
    - Zukunft von Kreativität und menschlicher Arbeit`,
    'productivity': `Heute teilen wir unsere Top-10 Produktivitäts-Hacks, die dein Leben verändern können.
    
    Von effizienten To-Do-Listen über Zeit-Blocking bis zu digitalen Tools – wir decken alles ab.
    
    Erfahre, wie du deine Fokuszeit maximierst, Ablenkungen minimierst und deine Ziele schneller erreichst.
    
    Besprochene Methoden:
    - Pomodoro-Technik
    - Zero-Inbox-Methode
    - Batching von Tasks
    - Deep Work Sessions`,
    'default': `In dieser Episode sprechen wir über aktuelle Trends, Tipps und Tricks, die dir helfen können.
    
    Wir beleuchten verschiedene Perspektiven und geben dir praktische Ratschläge, die du sofort umsetzen kannst.
    
    Höre rein und entdecke neue Ideen für dein privates und berufliches Leben.
    
    Wichtige Themen:
    - Persönliche Entwicklung
    - Praktische Tipps
    - Expert-Interviews
    - Actionable Insights`
  };

  const keyword = filename.toLowerCase();
  const transcript = Object.keys(demoTranscripts).find(k => keyword.includes(k)) 
    ? demoTranscripts[Object.keys(demoTranscripts).find(k => keyword.includes(k))]
    : demoTranscripts.default;

  currentTranscript = transcript;
  
  updateProgress(50);
  setTimeout(() => {
    generateContent();
  }, 500);
}

function updateProgress(value) {
  const fill = document.getElementById('progressFill');
  const status = document.getElementById('processingStatus');
  fill.style.width = value + '%';
  
  if (value === 50) status.textContent = 'Transkribiere Audio...';
  if (value === 75) status.textContent = 'Generiere Content...';
  if (value === 100) status.textContent = 'Fertig!';
}

function generateContent() {
  updateProgress(75);

  const desc = generateYoutubeDesc();
  const tags = generateTags();
  const titles = generateTitles();
  const twitter = generateTwitter();
  const linkedin = generateLinkedin();
  const instagram = generateInstagram();
  const chapters = generateChapters();

  // Populate results
  document.getElementById('descText').textContent = desc.long;
  document.getElementById('shortDesc').textContent = desc.short;
  document.getElementById('tagsText').textContent = tags;
  document.getElementById('titlesText').textContent = titles;
  document.getElementById('twitterText').textContent = twitter;
  document.getElementById('linkedinText').textContent = linkedin;
  document.getElementById('instagramText').textContent = instagram;
  document.getElementById('chaptersText').textContent = chapters;
  document.getElementById('transcriptText').textContent = currentTranscript;

  updateProgress(100);
  
  setTimeout(() => {
    processing.classList.remove('active');
    resultsSection.classList.add('active');
    setupTabs();
  }, 500);
}

function generateYoutubeDesc() {
  const shortLines = currentTranscript.split('\n').filter(l => l.trim()).slice(0, 2);
  
  return {
    long: `🎙️ In dieser Episode besprechen wir wichtige Themen und praktische Tipps.

${currentTranscript}

⏱️ TIMESTAMPS:
00:00 Intro
03:15 Hauptthema Teil 1
12:30 Praktische Tipps
18:45 Expert-Perspektive
24:20 Outro

📚 RESSOURCEN:
- Mehr Infos: assisstant.win
- Newsletter: [Link]
- Social Media: @assisstant

💬 Schreib einen Kommentar: Was ist dein größter Takeaway aus dieser Episode?

#Podcast #Podcast2024`,
    short: shortLines.join('\n')
  };
}

function generateTags() {
  const keywords = extractKeywords();
  const tags = [
    'podcast', 'deutsch', 'deutsch-podcast', 'audio',
    ...keywords.slice(0, 10),
    'education', 'learning', 'inspiration', 'tipps',
    'episode', 'neue-episode', 'hör-mich', 'content',
    'interview', 'unterhaltung', 'wissen', 'produktivität',
    'erfolg', 'motivation', 'karriere', 'growth',
    'mindset', 'persönlichkeit', 'entwicklung'
  ].slice(0, 30);

  return tags.join(', ');
}

function generateTitles() {
  const firstWord = currentTranscript.split(' ')[0];
  
  return `1. Die WAHRHEIT über Erfolg: Was Experten nicht sagen
2. Wie du dein Potenzial 10x vergrößerst (Schritt für Schritt)
3. Die besten Tipps, die niemand kennt
4. Transformation statt Talk: Echte Ergebnisse erzielen
5. ${firstWord} verstehen: Ein Deep Dive in aktuelle Trends`;
}

function generateTwitter() {
  return `🧵 1/5
Gerade eine großartige Episode aufgenommen, in der wir wichtige Lektionen teilen. 

Wenn du erfahren möchtest, wie du dein Leben verändern kannst, hör dir das an:
assisstant.win

2/5
Das häufigste Problem? Viele wissen NICHT, dass...

3/5
Hier sind 3 sofort umsetzbare Tipps:
✓ Punkt 1
✓ Punkt 2
✓ Punkt 3

4/5
Die wichtigste Erkenntnis: Ohne diese Grundlage geht nichts.

5/5
Was war dein größter Takeaway? Schreib's in die Kommentare! 👇`;
}

function generateLinkedin() {
  return `🎙️ Neue Episode: Wie man wirklich erfolgreich wird

In unserer neuesten Episode sprechen wir über:
✓ Bewährte Strategien für Erfolg
✓ Häufige Fehler, die du vermeiden solltest
✓ Praktische Tipps für deinen Alltag

Die wichtigste Erkenntnis? Erfolg ist ein System, keine Magie.

Hör rein und lerne von Experten: [Link zum Podcast]

Was sind deine Gedanken zu diesem Thema? Lass mich in den Kommentaren wissen!

#Podcast #PodcastDeutsch #Erfolg #Karriere #Lernen`;
}

function generateInstagram() {
  return `🎙️ Neue Episode OUT! 🔥

In dieser Episode:
🎯 Die wahren Geheimnisse von erfolgreichen Menschen
💡 3 praktische Tipps, die dein Leben ändern
🚀 Actionable Insights für heute

Hör rein auf assisstant.win (Link im Bio)

Was ist DEIN größter Takeaway?
Schreib's in die Kommentare! 👇

#podcast #podcastdeutsch #deutsch #audio #neuefolge #hörenswert #erfolg #tipps #lifehacks`;
}

function generateChapters() {
  return `00:00 Intro & Begrüßung
03:15 Das Hauptthema einfach erklärt
12:30 Erste praktische Tipps
18:45 Häufige Fehler & wie du sie vermeidest
24:20 Expert-Interview & Insights
32:10 Die 3 besten Takeaways
38:50 Bonus-Tipps
42:30 Outro & Call to Action`;
}

function extractKeywords() {
  const words = currentTranscript.toLowerCase().split(/\W+/).filter(w => w.length > 4);
  const unique = [...new Set(words)];
  return unique.slice(0, 20);
}

function setupTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Deaktiviere alle
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      // Aktiviere geklickt
      btn.classList.add('active');
      const tabId = btn.dataset.tab;
      
      // Map tabs to content
      const tabMap = {
        'youtube-desc': 'youtube-desc',
        'tags': 'tags',
        'social': 'social',
        'chapters': 'chapters',
        'transcript': 'transcript'
      };
      
      document.getElementById(tabMap[tabId]).classList.add('active');
    });
  });
}

function copyContent(elementId) {
  const text = document.getElementById(elementId).textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✅ Kopiert!';
    btn.classList.add('copied');
    
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove('copied');
    }, 2000);
  });
}

// Demo-Transkript laden beim Start
document.addEventListener('DOMContentLoaded', () => {
  // Optional: Auto-load demo
  // simulateTranscription('demo.mp3');
});
