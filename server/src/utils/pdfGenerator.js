const PDFDocument = require('pdfkit');

// "Boardwalk" palette - matches client/src/styles/theme.css so the
// downloaded/emailed ticket feels like part of the same product as
// the (now light, professional) website theme.
const COLORS = {
  paper: '#FFFFFF',
  panel: '#FFFFFF',
  navy: '#0F1B33',      // dark surfaces - header, table header, stub (matches site footer/admin sidebar)
  ink: '#14213D',
  inkSoft: '#5C6B84',
  primary: '#1565D8',
  primaryDark: '#0D47A1',
  accent: '#FF7A00',     // orange - CTAs / accent stripe
  yellow: '#FFC107',
  yellowTint: '#FFF6DD',
  teal: '#00B8A9',
  tealTint: '#E3FBF8',
  primaryTint: '#EAF2FE',
  line: '#E3E8F0',
};

function money(n) {
  return 'Rs. ' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Draws a roller-coaster mark echoing the site's blue logo badge, recolored for print. */
function drawCoasterIcon(doc, cx, cy, r) {
  const scale = (r * 2) / 62;
  const map = (x, y) => [cx + (x - 32) * scale, cy - (y - 32) * scale];
  const rotate = (x, y, deg) => {
    const rad = (deg * Math.PI) / 180;
    return [x * Math.cos(rad) - y * Math.sin(rad), x * Math.sin(rad) + y * Math.cos(rad)];
  };

  doc.save();
  doc.circle(cx, cy, r).fill(COLORS.primary);

  // Track: hill / loop / hill.
  const pts = [
    [8, 38], [13, 21], [20, 21], [24, 32],
    [27, 40], [30, 40], [33, 32],
    [37, 21], [44, 21], [49, 30],
    [52, 35], [54, 37], [57, 38],
  ].map(([x, y]) => map(x, y));
  doc.moveTo(...pts[0])
    .bezierCurveTo(...pts[1], ...pts[2], ...pts[3])
    .bezierCurveTo(...pts[4], ...pts[5], ...pts[6])
    .bezierCurveTo(...pts[7], ...pts[8], ...pts[9])
    .bezierCurveTo(...pts[10], ...pts[11], ...pts[12])
    .lineWidth(Math.max(1.3, 2.6 * scale))
    .strokeColor('#FFFFFF')
    .stroke();

  const [lx, ly] = map(24.5, 31.5);
  doc.circle(lx, ly, 6.4 * scale).lineWidth(Math.max(1.1, 2.1 * scale)).strokeColor('#FFFFFF').stroke();

  // Cart (rotated rectangle, rotated in JS so it can be filled as a plain polygon).
  const cartCorners = [[-5, -3.6], [5, -3.6], [5, 3.6], [-5, 3.6]].map(([x, y]) => {
    const [rx, ry] = rotate(x, y, -24);
    return map(38 + rx, 23 + ry);
  });
  doc.polygon(...cartCorners).fill(COLORS.accent);
  [[-2.8, 4], [2.8, 4]].forEach(([x, y]) => {
    const [rx, ry] = rotate(x, y, -24);
    const [px, py] = map(38 + rx, 23 + ry);
    doc.circle(px, py, Math.max(0.9, 1.5 * scale)).fill(COLORS.navy);
  });

  // Spark.
  const starLocal = [[0, -6.5], [1.7, -1.7], [6.5, 0], [1.7, 1.7], [0, 6.5], [-1.7, 1.7], [-6.5, 0], [-1.7, -1.7]];
  const starPts = starLocal.map(([x, y]) => map(50 + x, 14 + y));
  doc.polygon(...starPts).fill(COLORS.yellow);
  doc.restore();
}

function eyebrow(doc, x, y, label, color) {
  doc.rect(x, y, 7, 7).fill(color);
  doc.fillColor(COLORS.inkSoft).font('Helvetica-Bold').fontSize(10).text(label, x + 13, y - 1);
}

/**
 * Truncates text with an ellipsis so it fits on one line within
 * maxWidth, measured using the doc's *currently set* font/size - so
 * call this right after .font()/.fontSize() and before .text().
 * PDFKit's own `lineBreak: false` + `ellipsis: true` combination
 * doesn't reliably suppress wrapping in this version (confirmed via
 * a standalone test - it still wraps at spaces/hyphens), so this
 * measures and truncates the string manually instead.
 */
function truncateToFit(doc, text, maxWidth) {
  if (doc.widthOfString(text) <= maxWidth) return text;
  const ellipsis = '...';
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (doc.widthOfString(text.slice(0, mid) + ellipsis) <= maxWidth) lo = mid;
    else hi = mid - 1;
  }
  return text.slice(0, lo).trimEnd() + ellipsis;
}

/**
 * Builds the ticket PDF for one order and returns it as a Buffer.
 * Same layout family as the original PHP app's ticket: branded header,
 * order + attendee card, itemized passes table, total band, entry
 * info, a perforated tear line, and a gate-facing admission stub -
 * restyled to match the site's current light "Boardwalk" theme
 * (white page, navy dark-surfaces, blue primary, orange accent).
 */
function buildTicketPdf({ order, user }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageW = doc.page.width;
    const left = 50;
    const right = pageW - 50;
    const contentW = right - left;

    doc.rect(0, 0, pageW, doc.page.height).fill(COLORS.paper);

    // ---- Header ----
    const headerH = 104;
    const grad = doc.linearGradient(0, 0, pageW, headerH);
    grad.stop(0, COLORS.primaryDark).stop(1, COLORS.primary);
    doc.rect(0, 0, pageW, headerH).fill(grad);
    doc.rect(0, headerH, pageW, 4).fill(COLORS.accent);

    drawCoasterIcon(doc, left + 24, headerH / 2 - 6, 24);
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(22).text('TICKETS TO ', left + 66, 26, { continued: true });
    doc.fillColor(COLORS.yellow).text('THRILL');
    doc.fillColor('#CFE1FB').font('Helvetica').fontSize(11).text('E-Ticket / Order Confirmation', left + 66, 52);

    doc.roundedRect(right - 96, 20, 96, 24, 12).fill(COLORS.accent);
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(11).text('PAID', right - 96, 27, { width: 96, align: 'center' });
    doc.fillColor('#FFFFFF').fontSize(15).text(`Order #${order._id.toString().slice(-6).toUpperCase()}`, left, 62, { width: contentW, align: 'right' });

    let y = headerH + 36;

    // ---- Order + attendee card ----
    const cardH = 156;
    doc.rect(left, y, contentW, cardH).fill(COLORS.panel);
    doc.rect(left, y, contentW, cardH).lineWidth(1).strokeColor(COLORS.line).stroke();
    eyebrow(doc, left + 18, y + 20, 'ORDER DETAILS', COLORS.primary);

    const col1 = left + 18;
    const col2 = left + 300;
    const rowLabelY = y + 42;
    doc.fillColor(COLORS.inkSoft).font('Helvetica-Bold').fontSize(9).text('VISIT DATE', col1, rowLabelY).text('NAME', col2, rowLabelY);
    doc.fillColor(COLORS.accent).font('Helvetica-Bold').fontSize(13)
      .text(new Date(order.visitDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), col1, rowLabelY + 14);
    doc.fillColor(COLORS.ink).font('Helvetica').fontSize(12)
      .text(truncateToFit(doc, user.name, 220), col2, rowLabelY + 14);

    const row2LabelY = rowLabelY + 38;
    doc.fillColor(COLORS.inkSoft).font('Helvetica-Bold').fontSize(9).text('BOOKED ON', col1, row2LabelY).text('EMAIL', col2, row2LabelY);
    doc.fillColor(COLORS.ink).font('Helvetica').fontSize(12)
      .text(new Date(order.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }), col1, row2LabelY + 14)
      .text(truncateToFit(doc, user.email, 220), col2, row2LabelY + 14);

    const row3LabelY = row2LabelY + 38;
    doc.fillColor(COLORS.inkSoft).font('Helvetica-Bold').fontSize(9).text('PAYMENT REF', col1, row3LabelY);
    doc.fillColor(COLORS.ink).font('Helvetica').fontSize(12).text(order.paymentRef || '-', col1, row3LabelY + 14);

    y += cardH + 28;

    // ---- Passes table ----
    eyebrow(doc, left + 4, y, 'YOUR PASSES', COLORS.teal);
    y += 24;

    const colQtyX = left + 280;
    const colPriceX = left + 340;
    const colTotalX = left + 430;
    const colWidth = right - colTotalX;

    doc.rect(left, y, contentW, 28).fill(COLORS.navy);
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(10)
      .text('TICKET', left + 16, y + 9)
      .text('QTY', colQtyX, y + 9, { width: colPriceX - colQtyX - 10, align: 'right' })
      .text('PRICE', colPriceX, y + 9, { width: colTotalX - colPriceX - 10, align: 'right' })
      .text('LINE TOTAL', colTotalX, y + 9, { width: colWidth, align: 'right' });
    y += 28;

    const rowH = 27;
    const bottomReserve = 345;
    const maxRowsY = doc.page.height - bottomReserve;
    let drawnCount = 0;
    for (const item of order.items) {
      if (y + rowH > maxRowsY) break;
      const tint = drawnCount % 2 === 0 ? COLORS.primaryTint : COLORS.tealTint;
      doc.rect(left, y, contentW, rowH).fill(tint);
      const lineTotal = item.price * item.qty;
      doc.fillColor(COLORS.ink).font('Helvetica').fontSize(11)
        .text(truncateToFit(doc, item.ticketName, colQtyX - left - 26), left + 16, y + 8)
        .text(String(item.qty), colQtyX, y + 8, { width: colPriceX - colQtyX - 10, align: 'right' })
        .text(money(item.price), colPriceX, y + 8, { width: colTotalX - colPriceX - 10, align: 'right' });
      doc.font('Helvetica-Bold').fillColor(COLORS.primary)
        .text(money(lineTotal), colTotalX, y + 8, { width: colWidth, align: 'right' });
      y += rowH;
      drawnCount += 1;
    }
    const remaining = order.items.length - drawnCount;
    if (remaining > 0) {
      doc.rect(left, y, contentW, rowH).fill(COLORS.primaryTint);
      doc.fillColor(COLORS.inkSoft).font('Helvetica').fontSize(10)
        .text(`+ ${remaining} more pass(es) - see My Account for the full breakdown`, left + 16, y + 8);
      y += rowH;
    }
    doc.moveTo(left, y).lineTo(right, y).lineWidth(0.75).strokeColor(COLORS.line).stroke();

    // ---- Total band ----
    doc.rect(left, y, contentW, 36).fill(COLORS.yellowTint);
    doc.fillColor(COLORS.ink).font('Helvetica-Bold').fontSize(11).text('TOTAL PAID', left + 16, y + 12);
    doc.fillColor(COLORS.primaryDark).fontSize(15).text(money(order.total), left, y + 9, { width: contentW - 16, align: 'right' });
    y += 36 + 22;

    // ---- Entry info ----
    eyebrow(doc, left + 4, y, 'ENTRY INFO', COLORS.accent);
    y += 22;
    const infoLines = [
      "Gates open one hour before the park's posted opening time.",
      'Carry a valid photo ID that matches the name on this ticket.',
      'This ticket is valid for single-day entry on the date of purchase.',
    ];
    infoLines.forEach((line) => {
      doc.rect(left + 2, y + 1, 4, 4).fill(COLORS.accent);
      doc.fillColor(COLORS.inkSoft).font('Helvetica').fontSize(10).text(line, left + 14, y);
      y += 17;
    });

    // ---- Perforated tear line ----
    y += 8;
    doc.fillColor(COLORS.inkSoft).font('Helvetica-Bold').fontSize(8)
      .text('KEEP THIS STUB FOR ENTRY', left, y, { width: contentW, align: 'center' });
    y += 12;
    doc.save().dash(5, { space: 4 }).moveTo(left + 6, y).lineTo(right - 6, y).lineWidth(1.4).strokeColor(COLORS.inkSoft).stroke().undash().restore();
    doc.circle(left - 6, y, 9).fill(COLORS.paper);
    doc.circle(right + 6, y, 9).fill(COLORS.paper);

    // ---- Admission stub ----
    const stubTop = y + 16;
    const stubH = 128;
    doc.rect(left, stubTop, contentW, stubH).fill(COLORS.navy);
    doc.rect(left, stubTop, 6, stubH).fill(COLORS.accent);
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(13).text('ADMIT - TICKETS TO THRILL', left + 24, stubTop + 20);
    doc.fillColor('#B9C6DC').font('Helvetica').fontSize(11).text(truncateToFit(doc, user.name, 220), left + 24, stubTop + 39);
    doc.fontSize(10).text(`Order #${order._id.toString().slice(-6).toUpperCase()}   ${order.items.length} pass(es)`, left + 24, stubTop + 56);

    // Decorative order-code bars (not a scannable barcode - gate staff verify by the order number).
    const barX0 = left + 24;
    const barW0 = 220;
    const barY = stubTop + 92;
    doc.fillColor('#8DA0BE').font('Helvetica-Bold').fontSize(8)
      .text(`ORDER CODE ${order._id.toString().slice(-6).toUpperCase()}`, barX0, barY - 12);
    let barX = barX0;
    let seed = parseInt(order._id.toString().slice(-8), 16) || 12345;
    while (barX < barX0 + barW0) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const barW = 1.4 + (seed % 100) / 100 * 2.6;
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      if (seed % 100 >= 30) {
        doc.rect(barX, barY, Math.min(barW, barX0 + barW0 - barX), 22).fill('#FFFFFF');
      }
      barX += barW + 1.6;
    }

    // Right-hand note - kept clear of the barcode column above.
    doc.fillColor('#8DA0BE').font('Helvetica').fontSize(9)
      .text('Gate staff: verify by order number in the admin panel.', left + 270, stubTop + 39, { width: contentW - 294 });

    // ---- Footer ----
    const footY = stubTop + stubH + 26;
    doc.save().dash(3, { space: 3 }).moveTo(left, footY - 12).lineTo(right, footY - 12).lineWidth(0.75).strokeColor(COLORS.line).stroke().undash().restore();
    doc.fillColor(COLORS.ink).font('Helvetica-Bold').fontSize(10).text('Present this ticket (printed or on screen) at the gate.', left, footY);
    doc.fillColor(COLORS.inkSoft).font('Helvetica').fontSize(9).text('This is a demo ticket - no real payment was processed.', left, footY + 15);
    doc.font('Helvetica').fontSize(9).text('ticketstothrill.example', left, footY, { width: contentW, align: 'right' });
    doc.text('support@ticketstothrill.example', left, footY + 15, { width: contentW, align: 'right' });

    doc.end();
  });
}

module.exports = { buildTicketPdf };
