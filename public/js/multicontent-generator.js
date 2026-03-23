let generatedContent = {};

function generateAllContent() {
  const transcript = document.getElementById('transcriptInput').value.trim();
  
  if (!transcript) {
    alert('Bitte ein Transkript eingeben');
    return;
  }

  document.getElementById('loading').classList.add('active');
  document.getElementById('resultsSection').classList.remove('active');

  setTimeout(() => {
    generateContent(transcript);
    document.getElementById('loading').classList.remove('active');
    document.getElementById('resultsSection').classList.add('active');
  }, 1200);
}

function generateContent(transcript) {
  const lines = transcript.split('\n').filter(l => l.trim());
  const firstSentence = lines[0] || 'Ein großartiger Content';
  const mainTopic = extractMainTopic(transcript);

  generatedContent = {
    blog: generateBlog(transcript, mainTopic),
    newsletter: generateNewsletter(transcript, mainTopic),
    twitter: generateTwitter(transcript),
    linkedin: generateLinkedin(transcript, mainTopic),
    instagram: generateInstagram(transcript, mainTopic),
    tiktok: generateTikTok(transcript),
    quotes: generateQuotes(transcript)
  };

  // Display
  document.getElementById('blogContent').textContent = generatedContent.blog;
  document.getElementById('newsletterContent').textContent = generatedContent.newsletter;
  document.getElementById('twitterContent').textContent = generatedContent.twitter;
  document.getElementById('linkedinContent').textContent = generatedContent.linkedin;
  document.getElementById('instagramContent').textContent = generatedContent.instagram;
  document.getElementById('tiktokContent').textContent = generatedContent.tiktok;
  document.getElementById('quotesContent').textContent = generatedContent.quotes;
}

function extractMainTopic(text) {
  const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 5);
  return words[0] || 'Thema';
}

function generateBlog(transcript, topic) {
  return `📖 Blog-Artikel: ${topic.charAt(0).toUpperCase() + topic.slice(1)}

[Intro - 150 Wörter]
${transcript.split('\n')[0]}

In diesem ausführlichen Artikel tauchen wir tief ein in das Thema und beleuchten alle wichtigen Aspekte. Du wirst praktische Tipps, Best Practices und konkrete Beispiele entdecken, die du sofort umsetzen kannst.

[Hauptteil 1]
Lassen Sie uns zunächst verstehen, warum dieses Thema so wichtig ist. Die Bedeutung liegt darin, dass...

${transcript.split('\n').slice(1, 3).join('\n')}

[Praktische Tipps]
1. Erste Strategie: Verstehen Sie die Grundlagen
2. Zweite Strategie: Implementieren Sie schrittweise
3. Dritte Strategie: Messen Sie Ihre Ergebnisse
4. Vierte Strategie: Optimieren Sie kontinuierlich

[Häufige Fehler]
- Fehler 1: Zu schnell vorgehen
- Fehler 2: Falsche Werkzeuge wählen
- Fehler 3: Nicht messen und anpassen

[Fazit - 100 Wörter]
Zusammengefasst geht es darum, dass... Die wichtigsten Erkenntnisse sind, dass Sie mit den richtigen Strategien und kontinuierlichen Optimierungen beeindruckende Ergebnisse erreichen können.

Weitere Ressourcen: assisstant.win`;
}

function generateNewsletter(transcript, topic) {
  return `📧 NEWSLETTER-TEXT

Subject: 🔥 Das musst du über ${topic} wissen

---

Hallo zusammen,

in dieser Woche möchte ich dir etwas Wichtiges teilen:

${transcript.split('\n')[0]}

🎯 TOP 3 INSIGHTS DIESER WOCHE:

1️⃣ ${transcript.split('\n')[1] || 'Ersten Punkt verstehen'}
Warum ist das relevant? Weil...

2️⃣ Zweiter wichtiger Punkt
Die meisten Menschen übersehen dies, aber...

3️⃣ Dritter Punkt zum Handeln
So setzt du es um:
- Schritt 1
- Schritt 2
- Schritt 3

💡 QUICK TIP:
Eine schnelle Taktik, die du sofort anwenden kannst...

📚 EMPFEHLUNG DIESER WOCHE:
[Artikel/Tool/Ressource]

🎬 VIDEO DER WOCHE:
Schau dir an: assisstant.win

Bis nächste Woche!

Viele Grüße
Das Team`;
}

function generateTwitter(transcript) {
  return `🧵 TWITTER THREAD

1/8 Eine große Erkenntnis über dieses Thema ist etwas, das die meisten nicht verstehen.

2/8 ${transcript.split('\n')[0] || 'Das Hauptkonzept ist folgendes'}

3/8 Hier sind 3 Dinge, die du sofort tun kannst:
✓ Punkt 1
✓ Punkt 2
✓ Punkt 3

4/8 Der größte Fehler? Die meisten versuchen zu schnell zu gehen.

5/8 Stattdessen solltest du es systematisch angehen:
→ Verstehe zuerst die Grundlagen
→ Implementiere dann schrittweise
→ Messe deine Ergebnisse

6/8 Mit dieser Herangehensweise habe ich gesehen, dass sich die Ergebnisse um 10x verbessert haben.

7/8 Wenn du diesen Artikel hilfreich fandest, folge mir für mehr solcher Insights.

8/8 Was ist dein größter Takeaway aus diesem Thread? Lass es mich in den Antworten wissen! 👇`;
}

function generateLinkedin(transcript, topic) {
  return `💼 LINKEDIN POST

🔥 Die größte Erkenntnis über ${topic}:

${transcript.split('\n').slice(0, 2).join('\n')}

Nachdem ich mich jahrelang mit diesem Thema beschäftige, habe ich verstanden, dass...

Hier sind 3 praktische Lektionen:

1️⃣ Verstehe das "Warum"
Das Fundament allen Erfolgs ist ein klares Verständnis der zugrundeliegenden Prinzipien.

2️⃣ Baue ein System
Erfolg ist nicht zufällig – es ist ein wiederholbarer Prozess.

3️⃣ Messe und optimiere
Was nicht gemessen wird, kann nicht verbessert werden.

Die Kombination dieser drei Elemente hat für mich einen enormen Unterschied gemacht.

Was sind deine Erfahrungen? Ich würde gerne von dir hören!

#Leadership #Growth #Mindset #Lernen`;
}

function generateInstagram(transcript, topic) {
  return `📸 INSTAGRAM CAROUSEL (10 SLIDES)

SLIDE 1:
🔥 Die WAHRHEIT über ${topic}
Es ist nicht das, was du denkst...

---

SLIDE 2:
Punkt 1: Verstehe die Grundlagen
${transcript.split('\n')[0] || 'Wissen ist Kraft'}

---

SLIDE 3:
Punkt 2: Implementiere schrittweise
Nicht alles auf einmal, sondern...

---

SLIDE 4:
Punkt 3: Messe & Optimiere
Data-driven Entscheidungen sind der Schlüssel

---

SLIDE 5:
❌ Der größte Fehler:
Zu viel zu schnell wollen

---

SLIDE 6:
✅ Die richtige Herangehensweise:
Systematic improvement

---

SLIDE 7:
Ergebnis: 10x bessere Resultate
In der Hälfte der Zeit

---

SLIDE 8:
Es braucht:
⏰ Geduld
📊 Daten
🔄 Optimierung

---

SLIDE 9:
Meine Top Ressourcen:
→ assisstant.win
→ Newsletter (Link im Bio)

---

SLIDE 10:
Was ist DEIN größter Takeaway?
Schreib einen Kommentar! 👇

#${topic} #Tipps #Erfolg #Growth`;
}

function generateTikTok(transcript) {
  return `🎵 TIKTOK SCRIPT (60 Sekunden)

[0-5s] HOOK:
Moment! Das, was ich dir gleich zeige, wird dein Verständnis komplett verändern.

[5-20s] INTRO:
${transcript.split('\n')[0]}

In den nächsten 45 Sekunden zeige ich dir, warum die meisten falsch liegen.

[20-45s] MAIN CONTENT:
Punkt 1: Das Fundament
Punkt 2: Die Implementierung
Punkt 3: Das Geheimnis

Das Wichtigste: [eine konkrete Handlung]

[45-55s] CALL TO ACTION:
Wenn du mehr über dieses Thema erfahren möchtest, folg mir und check meinen Link in der Bio.

[55-60s] OUTRO:
Lass mich einen Kommentar da – was ist dein größter Takeaway?`;
}

function generateQuotes(transcript) {
  return `💭 SOCIAL MEDIA ZITATE

"Das größte Geheimnis von Erfolg ist nicht das Wissen, sondern die Umsetzung."

---

"Erfolg ist ein System, keine Magie. Wenn du es systematisch angehst, sind die Ergebnisse garantiert."

---

"Die meisten Menschen wissen, was zu tun ist. Die wenigen, die es tun, sind die Gewinner."

---

"Geduld + Daten + Optimierung = 10x Ergebnisse"

---

"Es ist nicht wichtig, wie schnell du fortschreitest. Wichtig ist, dass du nicht stehen bleibst."

---

"Deine Routine bestimmt deine Ergebnisse. Ändere die Routine, ändere dein Leben."

---

"Wissen ohne Umsetzung ist Verschwendung. Umsetzung ohne Messung ist Zufall."

---

"Jeder erfolgreiche Mensch hat einmal bei Null angefangen. Der Unterschied: Sie sind nicht stehen geblieben."`;
}

function switchTab(event) {
  const tabBtn = event.target;
  const tabName = tabBtn.dataset.tab;

  // Deaktiviere alle
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  // Aktiviere geklickt
  tabBtn.classList.add('active');
  const tabEl = document.querySelector(`.tab-content[data-tab="${tabName}"]`);
  if (tabEl) {
    tabEl.classList.add('active');
  }
}

function copyContent(elementId) {
  const text = document.getElementById(elementId).textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = event.target;
    const original = btn.textContent;
    btn.textContent = '✅ Kopiert!';
    btn.classList.add('copied');

    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove('copied');
    }, 2000);
  });
}

function clearAll() {
  document.getElementById('transcriptInput').value = '';
  document.getElementById('resultsSection').classList.remove('active');
}
