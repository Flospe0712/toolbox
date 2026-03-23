export function renderThumbnail(canvas, template, text, colors, variant = 'center') {
  if (!canvas || !template || !text || !colors) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // High-DPI support
  const dpr = window.devicePixelRatio || 1;
  const width = template.layout.width;
  const height = template.layout.height;

  // Set physical pixel size
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  // Scale context to match CSS pixels
  ctx.scale(dpr, dpr);

  // Variant-specific text sizing
  const variants = {
    left: {
      headlineSize: Math.floor(template.layout.headlineSize * 0.75),
      subheadlineSize: Math.floor(template.layout.subheadlineSize * 0.75),
      topicSize: Math.floor(template.layout.topicSize * 0.75),
    },
    center: {
      headlineSize: template.layout.headlineSize,
      subheadlineSize: template.layout.subheadlineSize,
      topicSize: template.layout.topicSize,
    },
    right: {
      headlineSize: Math.floor(template.layout.headlineSize * 1.15),
      subheadlineSize: Math.floor(template.layout.subheadlineSize * 1.15),
      topicSize: Math.floor(template.layout.topicSize * 1.15),
    }
  };

  const sizes = variants[variant] || variants.center;

  // Draw background
  if (template.layout.background.includes('gradient')) {
    drawGradientBackground(ctx, template.layout.background, width, height);
  } else {
    ctx.fillStyle = template.layout.background;
    ctx.fillRect(0, 0, width, height);
  }

  // Draw headlines
  const headlinePos = template.layout.headlinePosition;
  ctx.font = `bold ${sizes.headlineSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
  ctx.fillStyle = colors.headline;
  ctx.textBaseline = 'top';
  ctx.fillText(text.headline, headlinePos.left, headlinePos.top);

  // Draw subheadline
  const subheadlinePos = template.layout.subheadlinePosition;
  ctx.font = `${sizes.subheadlineSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
  ctx.fillStyle = colors.subheadline;
  ctx.textBaseline = 'top';
  ctx.fillText(text.subheadline, subheadlinePos.left, subheadlinePos.top);

  // Draw topic
  const topicPos = template.layout.topicPosition;
  ctx.font = `${sizes.topicSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
  ctx.fillStyle = colors.topic;
  ctx.textBaseline = 'top';
  ctx.fillText(text.topic, topicPos.left, topicPos.top);
}

export function drawGradientBackground(ctx, gradientStr, width, height) {
  try {
    // Parse CSS linear-gradient
    // Format: "linear-gradient(135deg, #color1 0%, #color2 100%)"
    const colorMatch = gradientStr.match(/#[0-9A-Fa-f]{6}/g);
    if (!colorMatch || colorMatch.length < 2) {
      throw new Error('Invalid gradient format');
    }

    const color1 = colorMatch[0];
    const color2 = colorMatch[1];

    // Create diagonal gradient (135 degrees)
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  } catch (error) {
    console.warn('Gradient rendering fallback:', error.message);
    // Fallback to solid color
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, width, height);
  }
}

export function renderAllVariants(canvases, template, text, colors) {
  if (!canvases || canvases.length < 3) return;
  if (!template || !text || !colors) return;

  renderThumbnail(canvases[0], template, text, colors, 'left');
  renderThumbnail(canvases[1], template, text, colors, 'center');
  renderThumbnail(canvases[2], template, text, colors, 'right');
}
