/**
 * scanner.js - Motor de Leitura Óptica de Gabaritos (OMR) - Padrão Oficial SAEC
 * 
 * Regras Oficiais SAEC da Rede Municipal:
 * 1. Alternativas: Apenas 4 alternativas (A, B, C, D). Sem opção E.
 * 2. Matriz de Questões por Etapa:
 *    - 1º Ano: 20 questões
 *    - 2º e 3º Ano: 30 questões
 *    - 4º Ano: 36 questões
 *    - 5º Ano: 40 questões (2 colunas)
 *    - 6º ao 9º Ano: 50 questões (3 colunas)
 * 3. Bloco de Respostas Construídas (Questões Discursivas/Abertas):
 *    - Bloco exclusivo no rodapé com bolhas para o professor avaliar cada questão discursiva:
 *      [T] Acerto Total | [P] Acerto Parcial | [E] Erro | [B] Em Branco
 * 4. Visão Computacional com Homografia e Retificação Projetiva por eliminação Gaussiana
 */

export const SHEET_MODELS = {
  '1ano': {
    id: '1ano',
    name: '1º Ano - Ensino Fundamental',
    shortName: '1º Ano (20 Questões)',
    questionsCount: 20,
    options: ['A', 'B', 'C', 'D'],
    columns: 2,
    colDist: [10, 10],
    layout: {
      width: 1000,
      height: 1414,
      fiducials: { size: 55, margin: 50 },
      grid: {
        cols: [
          { startX: 180, startQ: 1, endQ: 10 },
          { startX: 580, startQ: 11, endQ: 20 }
        ],
        startY: 420,
        rowHeight: 48,
        bubbleGapX: 55,
        bubbleRadius: 16
      },
      constructed: {
        enabled: true,
        startY: 970,
        itemsCount: 2,
        options: ['T', 'P', 'E', 'B'],
        bubbleGapX: 55,
        bubbleRadius: 15,
        labels: {
          T: 'Acerto Total',
          P: 'Acerto Parcial',
          E: 'Erro',
          B: 'Em Branco'
        }
      }
    }
  },
  '2e3ano': {
    id: '2e3ano',
    name: '2º e 3º Ano - Ensino Fundamental',
    shortName: '2º e 3º Ano (30 Questões)',
    questionsCount: 30,
    options: ['A', 'B', 'C', 'D'],
    columns: 2,
    colDist: [15, 15],
    layout: {
      width: 1000,
      height: 1414,
      fiducials: { size: 55, margin: 50 },
      grid: {
        cols: [
          { startX: 180, startQ: 1, endQ: 15 },
          { startX: 580, startQ: 16, endQ: 30 }
        ],
        startY: 400,
        rowHeight: 40,
        bubbleGapX: 55,
        bubbleRadius: 15
      },
      constructed: {
        enabled: true,
        startY: 1060,
        itemsCount: 2,
        options: ['T', 'P', 'E', 'B'],
        bubbleGapX: 55,
        bubbleRadius: 15,
        labels: {
          T: 'Acerto Total',
          P: 'Acerto Parcial',
          E: 'Erro',
          B: 'Em Branco'
        }
      }
    }
  },
  '4ano': {
    id: '4ano',
    name: '4º Ano - Ensino Fundamental',
    shortName: '4º Ano (36 Questões)',
    questionsCount: 36,
    options: ['A', 'B', 'C', 'D'],
    columns: 2,
    colDist: [18, 18],
    layout: {
      width: 1000,
      height: 1414,
      fiducials: { size: 55, margin: 50 },
      grid: {
        cols: [
          { startX: 180, startQ: 1, endQ: 18 },
          { startX: 580, startQ: 19, endQ: 36 }
        ],
        startY: 390,
        rowHeight: 36,
        bubbleGapX: 55,
        bubbleRadius: 14
      },
      constructed: {
        enabled: true,
        startY: 1090,
        itemsCount: 2,
        options: ['T', 'P', 'E', 'B'],
        bubbleGapX: 55,
        bubbleRadius: 14,
        labels: {
          T: 'Acerto Total',
          P: 'Acerto Parcial',
          E: 'Erro',
          B: 'Em Branco'
        }
      }
    }
  },
  '5ano': {
    id: '5ano',
    name: '5º Ano - Ensino Fundamental',
    shortName: '5º Ano (40 Questões · 2 Colunas)',
    questionsCount: 40,
    options: ['A', 'B', 'C', 'D'],
    columns: 2,
    colDist: [20, 20],
    layout: {
      width: 1000,
      height: 1414,
      fiducials: { size: 55, margin: 50 },
      grid: {
        cols: [
          { startX: 180, startQ: 1, endQ: 20 },
          { startX: 580, startQ: 21, endQ: 40 }
        ],
        startY: 380,
        rowHeight: 33,
        bubbleGapX: 55,
        bubbleRadius: 13.5
      },
      constructed: {
        enabled: true,
        startY: 1090,
        itemsCount: 2,
        options: ['T', 'P', 'E', 'B'],
        bubbleGapX: 55,
        bubbleRadius: 14,
        labels: {
          T: 'Acerto Total',
          P: 'Acerto Parcial',
          E: 'Erro',
          B: 'Em Branco'
        }
      }
    }
  },
  '6a9ano': {
    id: '6a9ano',
    name: '6º ao 9º Ano - Ensino Fundamental',
    shortName: '6º ao 9º Ano (50 Questões · 3 Colunas)',
    questionsCount: 50,
    options: ['A', 'B', 'C', 'D'],
    columns: 3,
    colDist: [17, 17, 16],
    layout: {
      width: 1000,
      height: 1414,
      fiducials: { size: 55, margin: 50 },
      grid: {
        cols: [
          { startX: 125, startQ: 1, endQ: 17 },
          { startX: 425, startQ: 18, endQ: 34 },
          { startX: 725, startQ: 35, endQ: 50 }
        ],
        startY: 380,
        rowHeight: 38,
        bubbleGapX: 44,
        bubbleRadius: 13
      },
      constructed: {
        enabled: true,
        startY: 1080,
        itemsCount: 2,
        options: ['T', 'P', 'E', 'B'],
        bubbleGapX: 55,
        bubbleRadius: 14,
        labels: {
          T: 'Acerto Total',
          P: 'Acerto Parcial',
          E: 'Erro',
          B: 'Em Branco'
        }
      }
    }
  }
};

/**
 * Converte ImageData em buffer Grayscale (Escala de Cinza)
 */
export function toGrayscale(imageData) {
  const { width, height, data } = imageData;
  const gray = new Uint8Array(width * height);
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    gray[j] = (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8;
  }
  return { width, height, gray };
}

/**
 * Calcula limiar global por Otsu
 */
export function computeOtsuThreshold(grayData, width, height) {
  const total = width * height;
  const hist = new Int32Array(256);
  for (let i = 0; i < total; i++) {
    hist[grayData[i]]++;
  }

  let sum = 0;
  for (let t = 0; t < 256; t++) {
    sum += t * hist[t];
  }

  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let varMax = 0;
  let threshold = 128;

  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    wF = total - wB;
    if (wF === 0) break;

    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;

    const varBetween = wB * wF * (mB - mF) * (mB - mF);
    if (varBetween > varMax) {
      varMax = varBetween;
      threshold = t;
    }
  }

  return threshold;
}

/**
 * Segmenta a imagem usando limiar adaptativo integral
 */
export function adaptiveThreshold(grayData, width, height, windowSize = 35, c = 12) {
  const total = width * height;
  const binary = new Uint8Array(total);
  const integral = new Float64Array(width * height);

  for (let y = 0; y < height; y++) {
    let sum = 0;
    const yOffset = y * width;
    const prevYOffset = (y - 1) * width;
    for (let x = 0; x < width; x++) {
      sum += grayData[yOffset + x];
      integral[yOffset + x] = (y === 0 ? 0 : integral[prevYOffset + x]) + sum;
    }
  }

  const s = Math.floor(windowSize / 2);
  for (let y = 0; y < height; y++) {
    const y1 = Math.max(0, y - s);
    const y2 = Math.min(height - 1, y + s);
    const yOffset = y * width;
    
    for (let x = 0; x < width; x++) {
      const x1 = Math.max(0, x - s);
      const x2 = Math.min(width - 1, x + s);
      const count = (x2 - x1 + 1) * (y2 - y1 + 1);

      const a = (y1 > 0 && x1 > 0) ? integral[(y1 - 1) * width + (x1 - 1)] : 0;
      const b = (y1 > 0) ? integral[(y1 - 1) * width + x2] : 0;
      const cVal = (x1 > 0) ? integral[y2 * width + (x1 - 1)] : 0;
      const d = integral[y2 * width + x2];
      const sum = d - b - cVal + a;

      const threshold = (sum / count) - c;
      binary[yOffset + x] = grayData[yOffset + x] < threshold ? 1 : 0;
    }
  }

  return binary;
}

/**
 * Procura componentes conectados escuros candidatos a marcadores fiduciais
 */
export function findBlobs(binary, width, height, minArea = 120, maxAreaRatio = 0.12) {
  const visited = new Uint8Array(width * height);
  const blobs = [];
  const maxArea = width * height * maxAreaRatio;
  const step = 2;

  for (let y = 4; y < height - 4; y += step) {
    const yOffset = y * width;
    for (let x = 4; x < width - 4; x += step) {
      const idx = yOffset + x;
      if (binary[idx] === 1 && visited[idx] === 0) {
        let minX = x;
        let maxX = x;
        let minY = y;
        let maxY = y;
        let area = 0;
        let sumX = 0;
        let sumY = 0;

        const queue = [idx];
        visited[idx] = 1;

        let qHead = 0;
        while (qHead < queue.length) {
          const curr = queue[qHead++];
          const cy = Math.floor(curr / width);
          const cx = curr % width;

          area++;
          sumX += cx;
          sumY += cy;

          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;

          const neighbors = [
            curr - 1,
            curr + 1,
            curr - width,
            curr + width
          ];

          for (let n = 0; n < 4; n++) {
            const nIdx = neighbors[n];
            if (nIdx >= 0 && nIdx < binary.length && visited[nIdx] === 0 && binary[nIdx] === 1) {
              visited[nIdx] = 1;
              queue.push(nIdx);
              if (queue.length > maxArea) break;
            }
          }
          if (queue.length > maxArea) break;
        }

        const bWidth = maxX - minX + 1;
        const bHeight = maxY - minY + 1;
        const boxArea = bWidth * bHeight;
        const aspectRatio = bWidth / bHeight;
        const fillFactor = area / (boxArea || 1);

        if (
          area >= minArea &&
          area <= maxArea &&
          aspectRatio >= 0.55 &&
          aspectRatio <= 1.75 &&
          fillFactor >= 0.55
        ) {
          blobs.push({
            cx: sumX / area,
            cy: sumY / area,
            x: minX,
            y: minY,
            width: bWidth,
            height: bHeight,
            area,
            aspectRatio,
            fillFactor
          });
        }
      }
    }
  }

  return blobs;
}

/**
 * Ordena e valida 4 marcadores nos cantos geométricos (TL, TR, BR, BL)
 */
export function orderFiducialCorners(points) {
  if (!points || points.length !== 4) return null;

  const sorted = [...points];
  sorted.sort((a, b) => (a.cx + a.cy) - (b.cx + b.cy));
  const tl = sorted[0];
  const br = sorted[3];

  const remaining = [sorted[1], sorted[2]];
  remaining.sort((a, b) => (a.cx - a.cy) - (b.cx - b.cy));
  const bl = remaining[0];
  const tr = remaining[1];

  if (tr.cx <= tl.cx || br.cx <= bl.cx || bl.cy <= tl.cy || br.cy <= tr.cy) {
    return null;
  }

  const crossProduct = (p1, p2, p3) => (p2.cx - p1.cx) * (p3.cy - p1.cy) - (p2.cy - p1.cy) * (p3.cx - p1.cx);
  const cp1 = crossProduct(tl, tr, br);
  const cp2 = crossProduct(tr, br, bl);
  const cp3 = crossProduct(br, bl, tl);
  const cp4 = crossProduct(bl, tl, tr);

  const allPositive = cp1 > 0 && cp2 > 0 && cp3 > 0 && cp4 > 0;
  const allNegative = cp1 < 0 && cp2 < 0 && cp3 < 0 && cp4 < 0;

  if (!allPositive && !allNegative) {
    return null;
  }

  return {
    topLeft: { x: tl.cx, y: tl.cy, size: tl.width || 40 },
    topRight: { x: tr.cx, y: tr.cy, size: tr.width || 40 },
    bottomRight: { x: br.cx, y: br.cy, size: br.width || 40 },
    bottomLeft: { x: bl.cx, y: bl.cy, size: bl.width || 40 }
  };
}

/**
 * Encontra dinamicamente os 4 marcadores fiduciais na imagem
 */
export function detectFiducials(imageData) {
  const { width, height } = imageData;
  const { gray } = toGrayscale(imageData);
  
  const binary = adaptiveThreshold(gray, width, height, 41, 14);
  const minArea = Math.max(80, Math.floor(width * height * 0.00015));
  const blobs = findBlobs(binary, width, height, minArea);

  if (blobs.length < 4) {
    const otsuThresh = computeOtsuThreshold(gray, width, height);
    const otsuBinary = new Uint8Array(width * height);
    for (let i = 0; i < gray.length; i++) {
      otsuBinary[i] = gray[i] < (otsuThresh * 0.85) ? 1 : 0;
    }
    const otsuBlobs = findBlobs(otsuBinary, width, height, minArea);
    for (const b of otsuBlobs) {
      if (!blobs.some(existing => Math.hypot(existing.cx - b.cx, existing.cy - b.cy) < 20)) {
        blobs.push(b);
      }
    }
  }

  if (blobs.length < 4) {
    return {
      success: false,
      error: `Apenas ${blobs.length} marcadores em potencial encontrados (necessário 4).`,
      blobs
    };
  }

  if (blobs.length === 4) {
    const corners = orderFiducialCorners(blobs);
    if (corners) {
      return { success: true, corners, blobs };
    }
  }

  const topBlobs = blobs.slice().sort((a, b) => b.area - a.area).slice(0, 10);
  let bestCorners = null;
  let bestScore = -1;

  for (let i = 0; i < topBlobs.length; i++) {
    for (let j = i + 1; j < topBlobs.length; j++) {
      for (let k = j + 1; k < topBlobs.length; k++) {
        for (let l = k + 1; l < topBlobs.length; l++) {
          const candidateGroup = [topBlobs[i], topBlobs[j], topBlobs[k], topBlobs[l]];
          const ordered = orderFiducialCorners(candidateGroup);
          if (ordered) {
            const widthTop = Math.hypot(ordered.topRight.x - ordered.topLeft.x, ordered.topRight.y - ordered.topLeft.y);
            const widthBottom = Math.hypot(ordered.bottomRight.x - ordered.bottomLeft.x, ordered.bottomRight.y - ordered.bottomLeft.y);
            const heightLeft = Math.hypot(ordered.bottomLeft.x - ordered.topLeft.x, ordered.bottomLeft.y - ordered.topLeft.y);
            const heightRight = Math.hypot(ordered.bottomRight.x - ordered.topRight.x, ordered.bottomRight.y - ordered.topRight.y);

            const quadArea = ((widthTop + widthBottom) / 2) * ((heightLeft + heightRight) / 2);
            const areas = candidateGroup.map(b => b.area);
            const avgArea = areas.reduce((a, b) => a + b, 0) / 4;
            const variance = areas.reduce((sum, a) => sum + Math.abs(a - avgArea), 0) / avgArea;

            const sheetAspect = (heightLeft + heightRight) / (widthTop + widthBottom);
            const aspectPenalty = Math.abs(sheetAspect - 1.41) < 0.6 ? 1.0 : 0.5;

            const score = (quadArea / (1 + variance)) * aspectPenalty;
            if (score > bestScore) {
              bestScore = score;
              bestCorners = ordered;
            }
          }
        }
      }
    }
  }

  if (bestCorners) {
    return { success: true, corners: bestCorners, blobs };
  }

  return {
    success: false,
    error: 'Não foi possível formar um quadrilátero válido com os 4 marcadores.',
    blobs
  };
}

/**
 * Resolve matriz de homografia projetiva H por Eliminação Gaussiana
 */
export function getHomographyMatrix(srcQuad, dstQuad) {
  const A = [];
  const B = [];

  for (let i = 0; i < 4; i++) {
    const u = srcQuad[i].x;
    const v = srcQuad[i].y;
    const x = dstQuad[i].x;
    const y = dstQuad[i].y;

    A.push([u, v, 1, 0, 0, 0, -u * x, -v * x]);
    B.push(x);

    A.push([0, 0, 0, u, v, 1, -u * y, -v * y]);
    B.push(y);
  }

  const n = 8;
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
        maxRow = k;
      }
    }

    const tempA = A[i];
    A[i] = A[maxRow];
    A[maxRow] = tempA;

    const tempB = B[i];
    B[i] = B[maxRow];
    B[maxRow] = tempB;

    if (Math.abs(A[i][i]) < 1e-12) {
      return null;
    }

    for (let k = i + 1; k < n; k++) {
      const factor = A[k][i] / A[i][i];
      B[k] -= factor * B[i];
      for (let j = i; j < n; j++) {
        A[k][j] -= factor * A[i][j];
      }
    }
  }

  const h = new Float64Array(9);
  for (let i = n - 1; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < n; j++) {
      sum += A[i][j] * h[j];
    }
    h[i] = (B[i] - sum) / A[i][i];
  }
  h[8] = 1.0;

  return h;
}

/**
 * Warp de Perspectiva com Interpolação Bilinear
 */
export function warpPerspective(srcImageData, corners, targetWidth = 1000, targetHeight = 1414, fiducialMargin = 50) {
  const { width: srcW, height: srcH, data: srcData } = srcImageData;

  const dstQuad = [
    { x: fiducialMargin, y: fiducialMargin },
    { x: targetWidth - fiducialMargin, y: fiducialMargin },
    { x: targetWidth - fiducialMargin, y: targetHeight - fiducialMargin },
    { x: fiducialMargin, y: targetHeight - fiducialMargin }
  ];

  const srcPoints = [
    corners.topLeft,
    corners.topRight,
    corners.bottomRight,
    corners.bottomLeft
  ];

  const H = getHomographyMatrix(dstQuad, srcPoints);
  if (!H) {
    throw new Error('Falha ao calcular matriz de homografia (singularidade).');
  }

  const outputData = new Uint8ClampedArray(targetWidth * targetHeight * 4);

  const h00 = H[0], h01 = H[1], h02 = H[2];
  const h10 = H[3], h11 = H[4], h12 = H[5];
  const h20 = H[6], h21 = H[7], h22 = H[8];

  for (let v = 0; v < targetHeight; v++) {
    const vOffset = v * targetWidth * 4;
    for (let u = 0; u < targetWidth; u++) {
      const den = h20 * u + h21 * v + h22;
      const x = (h00 * u + h01 * v + h02) / den;
      const y = (h10 * u + h11 * v + h12) / den;

      const outIdx = vOffset + (u * 4);

      if (x >= 0 && x < srcW - 1 && y >= 0 && y < srcH - 1) {
        const x0 = Math.floor(x);
        const y0 = Math.floor(y);
        const x1 = x0 + 1;
        const y1 = y0 + 1;

        const dx = x - x0;
        const dy = y - y0;
        const w00 = (1 - dx) * (1 - dy);
        const w10 = dx * (1 - dy);
        const w01 = (1 - dx) * dy;
        const w11 = dx * dy;

        const idx00 = (y0 * srcW + x0) * 4;
        const idx10 = (y0 * srcW + x1) * 4;
        const idx01 = (y1 * srcW + x0) * 4;
        const idx11 = (y1 * srcW + x1) * 4;

        outputData[outIdx] = w00 * srcData[idx00] + w10 * srcData[idx10] + w01 * srcData[idx01] + w11 * srcData[idx11];
        outputData[outIdx + 1] = w00 * srcData[idx00 + 1] + w10 * srcData[idx10 + 1] + w01 * srcData[idx01 + 1] + w11 * srcData[idx11 + 1];
        outputData[outIdx + 2] = w00 * srcData[idx00 + 2] + w10 * srcData[idx10 + 2] + w01 * srcData[idx01 + 2] + w11 * srcData[idx11 + 2];
        outputData[outIdx + 3] = 255;
      } else {
        outputData[outIdx] = 255;
        outputData[outIdx + 1] = 255;
        outputData[outIdx + 2] = 255;
        outputData[outIdx + 3] = 255;
      }
    }
  }

  return {
    width: targetWidth,
    height: targetHeight,
    data: outputData,
    homographyMatrix: H
  };
}

/**
 * Lê a densidade de pixels escuros nas bolhas na imagem normalizada e no Bloco de Respostas Construídas
 */
export function scanOMRBubbles(warpedImageData, modelKey = '5ano', thresholdPercent = 36) {
  const model = SHEET_MODELS[modelKey] || SHEET_MODELS['5ano'];
  const { width, height, data } = warpedImageData;
  const { layout, options, questionsCount } = model;
  const { grid, constructed } = layout;

  const gray = new Uint8Array(width * height);
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    gray[j] = (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8;
  }

  // Mede papel de fundo na região entre questões para calibração
  let bgSampleSum = 0;
  let bgSampleCount = 0;
  for (let y = grid.startY; y < grid.startY + 300; y += 15) {
    const checkX = grid.cols[0].startX - 30;
    if (y >= 0 && y < height && checkX >= 0 && checkX < width) {
      bgSampleSum += gray[y * width + checkX];
      bgSampleCount++;
    }
  }
  const paperWhite = bgSampleCount > 0 ? (bgSampleSum / bgSampleCount) : 225;
  const darkPixelThreshold = paperWhite * 0.65;

  const results = [];
  const bubbleCoordinates = [];

  // 1. Leitura das Questões Objetivas (Alternativas A, B, C, D)
  for (let q = 1; q <= questionsCount; q++) {
    // Determina a coluna correspondente
    let targetCol = grid.cols[0];
    let rowIndex = q - 1;

    for (let c = 0; c < grid.cols.length; c++) {
      const col = grid.cols[c];
      if (q >= col.startQ && q <= col.endQ) {
        targetCol = col;
        rowIndex = q - col.startQ;
        break;
      }
    }

    const baseX = targetCol.startX;
    const baseY = grid.startY + (rowIndex * grid.rowHeight);

    const optionDensities = {};
    const optionCoordinates = {};
    const filledOptions = [];

    for (let optIdx = 0; optIdx < options.length; optIdx++) {
      const opt = options[optIdx];
      const bubbleCenterX = Math.round(baseX + (optIdx * grid.bubbleGapX));
      const bubbleCenterY = Math.round(baseY);
      const r = grid.bubbleRadius;
      const innerRadius = Math.max(4, r - 2);

      let totalPixels = 0;
      let darkPixels = 0;
      let sumGray = 0;

      for (let dy = -innerRadius; dy <= innerRadius; dy++) {
        const py = bubbleCenterY + dy;
        if (py < 0 || py >= height) continue;
        const rowOffset = py * width;

        for (let dx = -innerRadius; dx <= innerRadius; dx++) {
          if (dx * dx + dy * dy <= innerRadius * innerRadius) {
            const px = bubbleCenterX + dx;
            if (px >= 0 && px < width) {
              const val = gray[rowOffset + px];
              totalPixels++;
              sumGray += val;
              if (val <= darkPixelThreshold) {
                darkPixels++;
              }
            }
          }
        }
      }

      const density = totalPixels > 0 ? Math.round((darkPixels / totalPixels) * 100) : 0;
      const avgBrightness = totalPixels > 0 ? Math.round(sumGray / totalPixels) : 255;

      optionDensities[opt] = density;
      optionCoordinates[opt] = {
        x: bubbleCenterX,
        y: bubbleCenterY,
        radius: r,
        density,
        avgBrightness
      };

      bubbleCoordinates.push({
        type: 'objective',
        question: q,
        option: opt,
        x: bubbleCenterX,
        y: bubbleCenterY,
        radius: r,
        density
      });

      if (density >= thresholdPercent) {
        filledOptions.push(opt);
      }
    }

    let status = 'VALDA';
    let finalAnswer = null;
    let confidence = 0;

    const sortedOptions = options.slice().sort((a, b) => optionDensities[b] - optionDensities[a]);
    const top1 = sortedOptions[0];
    const top2 = sortedOptions[1];
    const diff = optionDensities[top1] - (optionDensities[top2] || 0);

    if (filledOptions.length === 1) {
      status = 'VALDA';
      finalAnswer = filledOptions[0];
      confidence = Math.min(100, Math.round(diff * 1.5 + optionDensities[finalAnswer] * 0.5));
    } else if (filledOptions.length === 0) {
      status = 'EM_BRANCO';
      finalAnswer = null;
      confidence = 0;
    } else {
      status = 'DUPLA_MARCACAO';
      finalAnswer = null;
      confidence = 0;
    }

    results.push({
      question: q,
      answer: finalAnswer,
      status,
      confidence,
      densities: optionDensities,
      filledOptions,
      coordinates: optionCoordinates
    });
  }

  // 2. Leitura do Bloco de Respostas Construídas (Questões Discursivas do Professor)
  const constructedResults = [];

  if (constructed && constructed.enabled) {
    const rcStartY = constructed.startY;
    const rcOptions = constructed.options; // ['T', 'P', 'E', 'B']
    const rcItemsCount = constructed.itemsCount || 2;

    for (let itemIdx = 1; itemIdx <= rcItemsCount; itemIdx++) {
      // Discursiva 01 na metade esquerda, Discursiva 02 na metade direita
      const colBaseX = itemIdx === 1 ? 260 : 700;
      const rowY = rcStartY + 58;

      const optDensities = {};
      const optCoords = {};
      const markedRubrics = [];

      for (let o = 0; o < rcOptions.length; o++) {
        const opt = rcOptions[o];
        const bubbleX = Math.round(colBaseX + (o * constructed.bubbleGapX));
        const bubbleY = Math.round(rowY);
        const r = constructed.bubbleRadius;
        const innerRadius = Math.max(4, r - 2);

        let totalPixels = 0;
        let darkPixels = 0;

        for (let dy = -innerRadius; dy <= innerRadius; dy++) {
          const py = bubbleY + dy;
          if (py < 0 || py >= height) continue;
          const rowOffset = py * width;

          for (let dx = -innerRadius; dx <= innerRadius; dx++) {
            if (dx * dx + dy * dy <= innerRadius * innerRadius) {
              const px = bubbleX + dx;
              if (px >= 0 && px < width) {
                const val = gray[rowOffset + px];
                totalPixels++;
                if (val <= darkPixelThreshold) {
                  darkPixels++;
                }
              }
            }
          }
        }

        const density = totalPixels > 0 ? Math.round((darkPixels / totalPixels) * 100) : 0;
        optDensities[opt] = density;
        optCoords[opt] = { x: bubbleX, y: bubbleY, radius: r, density };

        bubbleCoordinates.push({
          type: 'constructed',
          question: itemIdx,
          option: opt,
          x: bubbleX,
          y: bubbleY,
          radius: r,
          density
        });

        if (density >= thresholdPercent) {
          markedRubrics.push(opt);
        }
      }

      let rcStatus = 'VALDA';
      let selectedRubric = null;

      if (markedRubrics.length === 1) {
        rcStatus = 'VALDA';
        selectedRubric = markedRubrics[0];
      } else if (markedRubrics.length === 0) {
        rcStatus = 'EM_BRANCO';
      } else {
        rcStatus = 'DUPLA_MARCACAO';
      }

      constructedResults.push({
        item: itemIdx,
        label: `Questão Discursiva ${itemIdx < 10 ? '0' + itemIdx : itemIdx}`,
        answer: selectedRubric,
        rubricName: selectedRubric ? (constructed.labels[selectedRubric] || selectedRubric) : 'Não avaliada',
        status: rcStatus,
        densities: optDensities,
        markedRubrics,
        coordinates: optCoords
      });
    }
  }

  return {
    model: model.name,
    totalQuestions: questionsCount,
    validCount: results.filter(r => r.status === 'VALDA').length,
    blankCount: results.filter(r => r.status === 'EM_BRANCO').length,
    doubleMarkCount: results.filter(r => r.status === 'DUPLA_MARCACAO').length,
    questions: results,
    constructedResponses: constructedResults,
    bubbles: bubbleCoordinates
  };
}

/**
 * Gera a Folha Oficial de Gabarito SAEC com Bloco de Respostas Construídas
 */
export function generateSheetCanvas(modelKey = '5ano', answersToFill = null, constructedToFill = null) {
  const model = SHEET_MODELS[modelKey] || SHEET_MODELS['5ano'];
  const { layout, options, questionsCount } = model;
  const { width, height, fiducials, grid, constructed } = layout;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Fundo Branco
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // 1. 4 Marcadores Fiduciais Quadrados Pretos nos Cantos
  ctx.fillStyle = '#000000';
  const fSize = fiducials.size;
  const fMargin = fiducials.margin;

  ctx.fillRect(fMargin - fSize / 2, fMargin - fSize / 2, fSize, fSize);
  ctx.fillRect(width - fMargin - fSize / 2, fMargin - fSize / 2, fSize, fSize);
  ctx.fillRect(width - fMargin - fSize / 2, height - fMargin - fSize / 2, fSize, fSize);
  ctx.fillRect(fMargin - fSize / 2, height - fMargin - fSize / 2, fSize, fSize);

  // Linhas guia de referência no topo e rodapé
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(fMargin + fSize + 10, fMargin - 4, width - (2 * (fMargin + fSize + 10)), 8);
  ctx.strokeRect(fMargin + fSize + 10, height - fMargin - 4, width - (2 * (fMargin + fSize + 10)), 8);

  // 2. Cabeçalho SAEC Oficial da Rede Municipal
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SISTEMA DE AVALIAÇÃO EDUCACIONAL (SAEC) - REDE MUNICIPAL', width / 2, 130);

  ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#0284C7';
  ctx.fillText(`FOLHA DE RESPOSTAS · ${model.name.toUpperCase()} · ${questionsCount} QUESTÕES`, width / 2, 162);

  // Caixa de Identificação do Aluno
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(100, 190, width - 200, 130);

  ctx.fillStyle = '#1E293B';
  ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('NOME DO ALUNO: ________________________________________________________________', 120, 225);
  ctx.fillText('ESCOLA: _______________________________________________________________________', 120, 260);
  ctx.fillText('TURMA: _______________   DATA: _____/_____/_________   Nº CHAMADA: ___________', 120, 295);

  // 3. Renderização das Colunas de Questões
  grid.cols.forEach((col, colIdx) => {
    const baseX = col.startX;

    // Cabeçalho da Coluna: Nº | A | B | C | D
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Nº', baseX - 40, grid.startY - 25);

    for (let o = 0; o < options.length; o++) {
      ctx.fillText(options[o], baseX + (o * grid.bubbleGapX), grid.startY - 25);
    }

    // Linha horizontal sob o cabeçalho
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(baseX - 58, grid.startY - 16);
    ctx.lineTo(baseX + (options.length * grid.bubbleGapX) - 10, grid.startY - 16);
    ctx.stroke();

    // Linha vertical divisória entre colunas
    if (colIdx < grid.cols.length - 1) {
      const nextCol = grid.cols[colIdx + 1];
      const midX = (baseX + (options.length * grid.bubbleGapX) + nextCol.startX - 50) / 2;
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(midX, grid.startY - 30);
      ctx.lineTo(midX, grid.startY + ((col.endQ - col.startQ + 1) * grid.rowHeight));
      ctx.stroke();
    }

    // Questões da coluna
    for (let q = col.startQ; q <= col.endQ; q++) {
      const rowIndex = q - col.startQ;
      const baseY = grid.startY + (rowIndex * grid.rowHeight);

      // Número
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 15px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${q < 10 ? '0' + q : q}.`, baseX - 26, baseY + 5);

      const filledOpt = answersToFill ? answersToFill[q] : null;

      for (let o = 0; o < options.length; o++) {
        const opt = options[o];
        const bubbleX = baseX + (o * grid.bubbleGapX);
        const bubbleY = baseY;
        const r = grid.bubbleRadius;
        const isMarked = filledOpt === opt;

        if (isMarked) {
          ctx.fillStyle = '#09090B';
          ctx.beginPath();
          ctx.arc(bubbleX, bubbleY, r - 1, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(opt, bubbleX, bubbleY + 4);
        } else {
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(bubbleX, bubbleY, r, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#475569';
          ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(opt, bubbleX, bubbleY + 4);
        }
      }
    }
  });

  // 4. Bloco de Respostas Construídas (Questões Discursivas/Abertas SAEC)
  if (constructed && constructed.enabled) {
    const rcY = constructed.startY;
    const rcH = 125;
    const rcW = width - 200;

    // Moldura de destaque com fundo suave
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(100, rcY, rcW, rcH);

    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2;
    ctx.strokeRect(100, rcY, rcW, rcH);

    // Faixa do título do bloco
    ctx.fillStyle = '#0284C7';
    ctx.fillRect(100, rcY, rcW, 28);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BLOCO EXCLUSIVO DO PROFESSOR · AVALIAÇÃO DE RESPOSTAS CONSTRUÍDAS (DISCURSIVAS)', width / 2, rcY + 19);

    // Legenda dos critérios
    ctx.fillStyle = '#475569';
    ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CRITÉRIOS: [ T ] Acerto Total    |    [ P ] Acerto Parcial    |    [ E ] Erro / Insuficiente    |    [ B ] Em Branco', width / 2, rcY + 42);

    // Questões Discursivas (ex: Discursiva 01 e Discursiva 02)
    const itemsCount = constructed.itemsCount || 2;
    const rcOptions = constructed.options;

    for (let it = 1; it <= itemsCount; it++) {
      const colBaseX = it === 1 ? 260 : 700;
      const labelX = it === 1 ? 220 : 660;
      const rowY = rcY + 80;

      // Rótulo da Questão Discursiva
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`DISCURSIVA 0${it}:`, labelX - 10, rowY + 5);

      const filledRubric = constructedToFill ? constructedToFill[it] : null;

      for (let o = 0; o < rcOptions.length; o++) {
        const opt = rcOptions[o];
        const bubbleX = colBaseX + (o * constructed.bubbleGapX);
        const bubbleY = rowY;
        const r = constructed.bubbleRadius;
        const isMarked = filledRubric === opt;

        if (isMarked) {
          ctx.fillStyle = '#09090B';
          ctx.beginPath();
          ctx.arc(bubbleX, bubbleY, r - 1, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(opt, bubbleX, bubbleY + 4);
        } else {
          ctx.strokeStyle = '#0284C7';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(bubbleX, bubbleY, r, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#0369A1';
          ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(opt, bubbleX, bubbleY + 4);
        }
      }
    }
  }

  // 5. Rodapé Informativo
  ctx.fillStyle = '#64748B';
  ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LEITURA ÓPTICA POR VISÃO COMPUTACIONAL E HOMOGRAFIA · PREENCHA COM CANETA PRETA OU AZUL', width / 2, height - 90);

  return canvas;
}

/**
 * Simula uma captura fotográfica inclinada de alta precisão
 */
export function simulateTiltedCapture(modelKey = '5ano', answersToFill = null, constructedToFill = null, options = {}) {
  const cleanCanvas = generateSheetCanvas(modelKey, answersToFill, constructedToFill);
  const outW = 1280;
  const outH = 960;

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');

  // Mesa de fundo realista
  const grad = ctx.createLinearGradient(0, 0, outW, outH);
  grad.addColorStop(0, '#1E293B');
  grad.addColorStop(0.5, '#0F172A');
  grad.addColorStop(1, '#020617');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, outW, outH);

  const angle = (options.rotation || -5.5) * (Math.PI / 180);
  const cx = outW / 2;
  const cy = outH / 2;
  const s = options.scale || 0.52;

  const w = cleanCanvas.width * s;
  const h = cleanCanvas.height * s;
  const tiltFactor = 0.84;

  const pTL = { x: -w * tiltFactor / 2, y: -h / 2 };
  const pTR = { x: w * tiltFactor / 2, y: -h / 2 };
  const pBR = { x: w / 2, y: h / 2 };
  const pBL = { x: -w / 2, y: h / 2 };

  const rotatePoint = (p) => {
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    return {
      x: cx + (p.x * cosA - p.y * sinA),
      y: cy + (p.x * sinA + p.y * cosA)
    };
  };

  const quadDst = [
    rotatePoint(pTL),
    rotatePoint(pTR),
    rotatePoint(pBR),
    rotatePoint(pBL)
  ];

  const quadSrc = [
    { x: 0, y: 0 },
    { x: cleanCanvas.width, y: 0 },
    { x: cleanCanvas.width, y: cleanCanvas.height },
    { x: 0, y: cleanCanvas.height }
  ];

  const H = getHomographyMatrix(quadDst, quadSrc);
  if (!H) {
    ctx.drawImage(cleanCanvas, 100, 50, 600, 850);
    return canvas;
  }

  const cleanCtx = cleanCanvas.getContext('2d');
  const cleanImgData = cleanCtx.getImageData(0, 0, cleanCanvas.width, cleanCanvas.height);
  const cleanData = cleanImgData.data;
  const cleanW = cleanCanvas.width;
  const cleanH = cleanCanvas.height;

  const outImgData = ctx.getImageData(0, 0, outW, outH);
  const outData = outImgData.data;

  const h00 = H[0], h01 = H[1], h02 = H[2];
  const h10 = H[3], h11 = H[4], h12 = H[5];
  const h20 = H[6], h21 = H[7], h22 = H[8];

  const minX = Math.max(0, Math.floor(Math.min(...quadDst.map(p => p.x)) - 10));
  const maxX = Math.min(outW - 1, Math.ceil(Math.max(...quadDst.map(p => p.x)) + 10));
  const minY = Math.max(0, Math.floor(Math.min(...quadDst.map(p => p.y)) - 10));
  const maxY = Math.min(outH - 1, Math.ceil(Math.max(...quadDst.map(p => p.y)) + 10));

  for (let y = minY; y <= maxY; y++) {
    const yOffset = y * outW * 4;
    for (let x = minX; x <= maxX; x++) {
      const den = h20 * x + h21 * y + h22;
      const u = (h00 * x + h01 * y + h02) / den;
      const v = (h10 * x + h11 * y + h12) / den;

      if (u >= 0 && u < cleanW - 1 && v >= 0 && v < cleanH - 1) {
        const u0 = Math.floor(u);
        const v0 = Math.floor(v);
        const u1 = u0 + 1;
        const v1 = v0 + 1;

        const du = u - u0;
        const dv = v - v0;

        const idx00 = (v0 * cleanW + u0) * 4;
        const idx10 = (v0 * cleanW + u1) * 4;
        const idx01 = (v1 * cleanW + u0) * 4;
        const idx11 = (v1 * cleanW + u1) * 4;

        const outIdx = yOffset + (x * 4);
        outData[outIdx] = (1 - du) * (1 - dv) * cleanData[idx00] + du * (1 - dv) * cleanData[idx10] + (1 - du) * dv * cleanData[idx01] + du * dv * cleanData[idx11];
        outData[outIdx + 1] = (1 - du) * (1 - dv) * cleanData[idx00 + 1] + du * (1 - dv) * cleanData[idx10 + 1] + (1 - du) * dv * cleanData[idx01 + 1] + du * dv * cleanData[idx11 + 1];
        outData[outIdx + 2] = (1 - du) * (1 - dv) * cleanData[idx00 + 2] + du * (1 - dv) * cleanData[idx10 + 2] + (1 - du) * dv * cleanData[idx01 + 2] + du * dv * cleanData[idx11 + 2];
        outData[outIdx + 3] = 255;
      }
    }
  }

  ctx.putImageData(outImgData, 0, 0);

  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(quadDst[0].x, quadDst[0].y);
  ctx.lineTo(quadDst[1].x, quadDst[1].y);
  ctx.lineTo(quadDst[2].x, quadDst[2].y);
  ctx.lineTo(quadDst[3].x, quadDst[3].y);
  ctx.closePath();
  ctx.stroke();

  return canvas;
}
