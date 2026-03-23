const TEMPLATES = {
  'bold-text': {
    name: 'Bold Text',
    render: (ctx, title, colors) => {
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, 1280, 720);

      // Border accent
      ctx.fillStyle = colors.accent;
      ctx.fillRect(0, 0, 1280, 40);
      ctx.fillRect(0, 680, 1280, 40);

      // Main text
      ctx.font = 'bold 120px Roboto';
      ctx.fillStyle = colors.text;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const lines = wrapText(title, 15);
      const lineHeight = 140;
      const startY = 360 - (lines.length * lineHeight) / 2;

      lines.forEach((line, i) => {
        ctx.fillText(line, 640, startY + i * lineHeight);
      });
    }
  },
  'text-icon': {
    name: 'Text + Icon',
    render: (ctx, title, colors) => {
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, 1280, 720);

      // Left accent
      ctx.fillStyle = colors.accent;
      ctx.fillRect(0, 0, 80, 720);

      // Icon circle
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(1100, 200, 100, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 90px Roboto';
      ctx.fillStyle = colors.text;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      const lines = wrapText(title, 18);
      const startY = 250;
      lines.forEach((line, i) => {
        ctx.fillText(line, 150, startY + i * 120);
      });
    }
  },
  'minimalist': {
    name: 'Minimalist',
    render: (ctx, title, colors) => {
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, 1280, 720);

      // Center line
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(100, 360);
      ctx.lineTo(1180, 360);
      ctx.stroke();

      // Text
      ctx.font = 'bold 80px Montserrat';
      ctx.fillStyle = colors.text;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const lines = wrapText(title, 20);
      const lineHeight = 100;
      const startY = 360 - (lines.length * lineHeight) / 2;

      lines.forEach((line, i) => {
        ctx.fillText(line, 640, startY + i * lineHeight);
      });
    }
  },
  'split': {
    name: 'Split Design',
    render: (ctx, title, colors) => {
      // Left half
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, 640, 720);

      // Right half
      ctx.fillStyle = colors.accent;
      ctx.fillRect(640, 0, 640, 720);

      // Text on both sides
      ctx.font = 'bold 70px Roboto';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const lines = wrapText(title, 15);
      const lineHeight = 90;
      const startY = 360 - (lines.length * lineHeight) / 2;

      ctx.fillStyle = colors.text;
      lines.forEach((line, i) => {
        const y = startY + i * lineHeight;
        ctx.fillText(line, 320, y);
        ctx.fillStyle = colors.bg;
        ctx.fillText(line, 960, y);
        ctx.fillStyle = colors.text;
      });
    }
  },
  'headlines': {
    name: 'Headlines',
    render: (ctx, title, colors) => {
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, 1280, 720);

      // Top banner
      ctx.fillStyle = colors.accent;
      ctx.fillRect(0, 0, 1280, 150);

      // Main text
      ctx.font = 'bold 100px Roboto';
      ctx.fillStyle = colors.text;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const lines = wrapText(title, 16);
      const startY = 200;
      lines.forEach((line, i) => {
        ctx.fillText(line, 640, startY + i * 120);
      });

      // Bottom decoration
      ctx.fillStyle = colors.accent;
      ctx.fillRect(200, 650, 880, 5);
    }
  }
};

const COLOR_SCHEMES = {
  dark: {
    bg: '#1a1a2e',
    text: '#ffffff',
    accent: '#ff006e',
    secondary: '#00f5ff'
  },
  neon: {
    bg: '#0a0a0a',
    text: '#ffff00',
    accent: '#ff006e',
    secondary: '#00ff00'
  },
  pastel: {
    bg: '#ffd6a5',
    text: '#2d3436',
    accent: '#a29bfe',
    secondary: '#00b894'
  },
  auto: {
    bg: '#1e293b',
    text: '#f1f5f9',
    accent: '#3b82f6',
    secondary: '#10b981'
  }
};

function wrapText(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length > maxChars) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = currentLine ? currentLine + ' ' + word : word;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
}

function renderThumbnail(canvasId, title, template, scheme) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const colors = COLOR_SCHEMES[scheme];
  const templateObj = TEMPLATES[template];

  if (templateObj) {
    templateObj.render(ctx, title, colors);
  }
}

function generateThumbnails() {
  const title = document.getElementById('titleInput').value;
  const template = document.getElementById('templateSelect').value;
  const scheme = document.querySelector('.color-option.active').dataset.scheme;

  // Update preview
  renderThumbnail('previewCanvas', title, template, scheme);

  // Generate 3 variations
  const variations = [
    { variant: 'Variante 1', templateOverride: null, schemeOverride: null },
    { variant: 'Variante 2 (Alternativer Schnitt)', templateOverride: getRandomTemplate(template), schemeOverride: getRandomScheme(scheme) },
    { variant: 'Variante 3 (Andere Farben)', templateOverride: null, schemeOverride: getRandomScheme(scheme) }
  ];

  const grid = document.getElementById('previewsGrid');
  grid.innerHTML = '';

  variations.forEach((v, i) => {
    const card = document.createElement('div');
    card.className = 'preview-card';

    const title_el = document.createElement('div');
    title_el.className = 'preview-card-title';
    title_el.textContent = v.variant;

    const imageDiv = document.createElement('div');
    imageDiv.className = 'preview-card-image';

    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;

    const finalTemplate = v.templateOverride || template;
    const finalScheme = v.schemeOverride || scheme;

    renderThumbnail(canvas, title, finalTemplate, finalScheme);

    imageDiv.appendChild(canvas);

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'download-btn';
    downloadBtn.textContent = '⬇️ Download PNG';
    downloadBtn.onclick = () => downloadPNG(canvas, `thumbnail-${i + 1}`);

    card.appendChild(title_el);
    card.appendChild(imageDiv);
    card.appendChild(downloadBtn);

    grid.appendChild(card);
  });
}

function getRandomTemplate(currentTemplate) {
  const templates = Object.keys(TEMPLATES);
  const filtered = templates.filter(t => t !== currentTemplate);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

function getRandomScheme(currentScheme) {
  const schemes = Object.keys(COLOR_SCHEMES);
  const filtered = schemes.filter(s => s !== currentScheme);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

function downloadPNG(canvas, filename) {
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `${filename}.png`;
  link.click();
}

// Color scheme selector
document.addEventListener('DOMContentLoaded', () => {
  const colorOptions = document.querySelectorAll('.color-option');
  colorOptions.forEach(option => {
    option.addEventListener('click', () => {
      colorOptions.forEach(o => o.classList.remove('active'));
      option.classList.add('active');
    });
  });

  // Real-time preview
  const titleInput = document.getElementById('titleInput');
  const templateSelect = document.getElementById('templateSelect');

  titleInput.addEventListener('input', () => {
    const scheme = document.querySelector('.color-option.active').dataset.scheme;
    renderThumbnail('previewCanvas', titleInput.value, templateSelect.value, scheme);
  });

  templateSelect.addEventListener('change', () => {
    const scheme = document.querySelector('.color-option.active').dataset.scheme;
    renderThumbnail('previewCanvas', titleInput.value, templateSelect.value, scheme);
  });

  // Initial render
  const scheme = document.querySelector('.color-option.active').dataset.scheme;
  renderThumbnail('previewCanvas', titleInput.value, templateSelect.value, scheme);
});
