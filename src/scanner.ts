/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SheetModelKey = '1ano' | '2e3ano' | '4ano' | '5ano' | '6a9ano';

export interface Point {
  x: number;
  y: number;
  size?: number;
}

export interface FiducialCorners {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
}

export interface BubblePosition {
  question: number;
  option: string;
  x: number;
  y: number;
  radius: number;
  type: 'objective' | 'constructed';
}

export interface QuestionResult {
  question: number;
  answer: string;
  status: 'VALDA' | 'EM_BRANCO' | 'DUPLA_MARCACAO';
  filledOptions: string[];
  densities: Record<string, number>;
  confidence: number;
  type: 'objective' | 'constructed';
}

export interface ConstructedResult {
  item: number;
  label: string;
  answer: string;
  rubricName: string;
  status: 'VALDA' | 'EM_BRANCO' | 'DUPLA_MARCACAO';
  densities: Record<string, number>;
}

export interface OMRScanResult {
  model: string;
  totalQuestions: number;
  validCount: number;
  blankCount: number;
  doubleMarkCount: number;
  questions: QuestionResult[];
  constructedResponses: ConstructedResult[];
  bubbles: {
    x: number;
    y: number;
    radius: number;
    density: number;
    type: 'objective' | 'constructed';
    question: number;
    option: string;
  }[];
}

export interface SheetModelConfig {
  key: SheetModelKey;
  name: string;
  shortName: string;
  questionsCount: number;
  columns: number;
  options: string[];
  constructedItems?: number[];
}

export const SHEET_MODELS: Record<SheetModelKey, SheetModelConfig> = {
  '1ano': {
    key: '1ano',
    name: '1º Ano do Ensino Fundamental (20Q)',
    shortName: '1º Ano',
    questionsCount: 20,
    columns: 2,
    options: ['A', 'B', 'C', 'D'],
    constructedItems: []
  },
  '2e3ano': {
    key: '2e3ano',
    name: '2º/3º Ano do Ensino Fundamental (30Q)',
    shortName: '2º/3º Ano',
    questionsCount: 30,
    columns: 2,
    options: ['A', 'B', 'C', 'D'],
    constructedItems: [12, 13, 28, 29]
  },
  '4ano': {
    key: '4ano',
    name: '4º Ano do Ensino Fundamental (36Q)',
    shortName: '4º Ano',
    questionsCount: 36,
    columns: 2,
    options: ['A', 'B', 'C', 'D'],
    constructedItems: [17, 18, 35, 36]
  },
  '5ano': {
    key: '5ano',
    name: '5º Ano do Ensino Fundamental (40Q)',
    shortName: '5º Ano',
    questionsCount: 40,
    columns: 2,
    options: ['A', 'B', 'C', 'D'],
    constructedItems: [18, 19, 39, 40]
  },
  '6a9ano': {
    key: '6a9ano',
    name: '6º ao 9º Ano do Ensino Fundamental (50Q)',
    shortName: '6º-9º Ano',
    questionsCount: 50,
    columns: 3,
    options: ['A', 'B', 'C', 'D'],
    constructedItems: [6, 7, 13, 14, 18, 19, 24, 25, 26]
  }
};

export function detectFiducials(imageData: ImageData): { success: boolean; corners?: FiducialCorners; error?: string } {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const threshold = 90;
  const regions: { cx: number; cy: number; minX: number; maxX: number; minY: number; maxY: number }[] = [];
  const step = 4;
  const visited = new Uint8Array(width * height);

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4;
      const gray = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114);

      if (gray < threshold && visited[y * width + x] === 0) {
        let minX = x, maxX = x, minY = y, maxY = y;
        let count = 0;
        let sumX = 0, sumY = 0;
        const queue: [number, number][] = [[x, y]];
        visited[y * width + x] = 1;

        while (queue.length > 0 && queue.length < 5000) {
          const [cx, cy] = queue.pop()!;
          count++;
          sumX += cx;
          sumY += cy;
          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;

          const neighbors = [[cx + step, cy], [cx - step, cy], [cx, cy + step], [cx, cy - step]];
          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nidx = ny * width + nx;
              if (visited[nidx] === 0) {
                visited[nidx] = 1;
                const ngray = (data[nidx * 4] * 0.299 + data[nidx * 4 + 1] * 0.587 + data[nidx * 4 + 2] * 0.114);
                if (ngray < threshold) queue.push([nx, ny]);
              }
            }
          }
        }
        if (count > 15 && count < 3000) {
          regions.push({ cx: sumX / count, cy: sumY / count, minX, maxX, minY, maxY });
        }
      }
    }
  }

  if (regions.length < 4) {
    return { success: false, error: `Marcadores insuficientes (${regions.length}/4 encontrados).` };
  }

  regions.sort((a, b) => (a.cx + a.cy) - (b.cx + b.cy));
  const topLeft = regions[0];
  regions.sort((a, b) => (b.cx - b.cy) - (a.cx - a.cy));
  const topRight = regions[0];
  regions.sort((a, b) => (b.cx + b.cy) - (a.cx + a.cy));
  const bottomRight = regions[0];
  regions.sort((a, b) => (a.cx - b.cy) - (b.cx - b.cy));
  const bottomLeft = regions[0];

  return {
    success: true,
    corners: {
      topLeft: { x: topLeft.cx, y: topLeft.cy },
      topRight: { x: topRight.cx, y: topRight.cy },
      bottomRight: { x: bottomRight.cx, y: bottomRight.cy },
      bottomLeft: { x: bottomLeft.cx, y: bottomLeft.cy }
    }
  };
}

export function warpPerspective(
  srcImageData: ImageData,
  corners: FiducialCorners,
  targetW: number,
  targetH: number,
  margin = 40
): { data: Uint8ClampedArray; homographyMatrix: number[] } {
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d')!;

  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = srcImageData.width;
  srcCanvas.height = srcImageData.height;
  const srcCtx = srcCanvas.getContext('2d')!;
  srcCtx.putImageData(srcImageData, 0, 0);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(margin, margin);
  ctx.lineTo(targetW - margin, margin);
  ctx.lineTo(targetW - margin, targetH - margin);
  ctx.lineTo(margin, targetH - margin);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(srcCanvas, 0, 0, targetW, targetH);
  ctx.restore();

  const finalImgData = ctx.getImageData(0, 0, targetW, targetH);
  return { data: finalImgData.data, homographyMatrix: [1, 0, 0, 0, 1, 0, 0, 0, 1] };
}

export function scanOMRBubbles(
  warpedData: Uint8ClampedArray,
  modelKey: SheetModelKey,
  thresholdPercent = 36,
  width = 1000,
  height = 1414
): OMRScanResult {
  const model = SHEET_MODELS[modelKey];
  const questions: QuestionResult[] = [];
  const constructedResponses: ConstructedResult[] = [];
  const bubblesAudit: OMRScanResult['bubbles'] = [];

  let validCount = 0;
  let blankCount = 0;
  let doubleMarkCount = 0;

  const getBubbleDensity = (bx: number, by: number, radius: number): number => {
    let darkPixels = 0;
    let totalPixels = 0;
    const rInt = Math.ceil(radius);
    for (let dy = -rInt; dy <= rInt; dy++) {
      for (let dx = -rInt; dx <= rInt; dx++) {
        if (dx * dx + dy * dy <= radius * radius) {
          const px = Math.round(bx + dx);
          const py = Math.round(by + dy);
          if (px >= 0 && px < width && py >= 0 && py < height) {
            const idx = (py * width + px) * 4;
            const gray = (warpedData[idx] * 0.299 + warpedData[idx + 1] + warpedData[idx + 2] * 0.114);
            totalPixels++;
            if (gray < 130) darkPixels++;
          }
        }
      }
    }
    return totalPixels > 0 ? Math.round((darkPixels / totalPixels) * 100) : 0;
  };

  const startY = 420;
  const rowHeight = 24;
  const colWidth = model.columns === 3 ? 300 : 420;
  const startXLeft = 140;
  const bubbleSpacingX = 32;
  const radius = 9;

  for (let q = 1; q <= model.questionsCount; q++) {
    let colIndex = 0;
    let qIndexInCol = 0;

    if (model.columns === 3) {
      if (q <= 17) { colIndex = 0; qIndexInCol = q - 1; }
      else if (q <= 34) { colIndex = 1; qIndexInCol = q - 18; }
      else { colIndex = 2; qIndexInCol = q - 35; }
    } else {
      const half = Math.ceil(model.questionsCount / 2);
      if (q <= half) { colIndex = 0; qIndexInCol = q - 1; }
      else { colIndex = 1; qIndexInCol = q - half - 1; }
    }

    const baseX = startXLeft + (colIndex * colWidth);
    const baseY = startY + (qIndexInCol * rowHeight);

    const densities: Record<string, number> = {};
    const filledOptions: string[] = [];

    model.options.forEach((opt, optIdx) => {
      const bX = baseX + 90 + (optIdx * bubbleSpacingX);
      const bY = baseY;
      const density = getBubbleDensity(bX, bY, radius);

      densities[opt] = density;
      if (density >= thresholdPercent) filledOptions.push(opt);

      const isRC = model.constructedItems?.includes(q);
      bubblesAudit.push({ x: bX, y: bY, radius, density, type: isRC ? 'constructed' : 'objective', question: q, option: opt });
    });

    let status: QuestionResult['status'] = 'VALDA';
    let answer = '';

    if (filledOptions.length === 0) {
      status = 'EM_BRANCO';
      blankCount++;
    } else if (filledOptions.length > 1) {
      status = 'DUPLA_MARCACAO';
      doubleMarkCount++;
      answer = filledOptions[0];
    } else {
      validCount++;
      answer = filledOptions[0];
    }

    const isRC = model.constructedItems?.includes(q);
    questions.push({ question: q, answer, status, filledOptions, densities, confidence: filledOptions.length === 1 ? 95 : 40, type: isRC ? 'constructed' : 'objective' });
  }

  return { model: model.name, totalQuestions: model.questionsCount, validCount, blankCount, doubleMarkCount, questions, constructedResponses, bubbles: bubblesAudit };
}

/**
 * Gera a Folha A4 completa com cabeçalho, marcadores e a grade de bolhas para impressão
 */
export function generateSheetCanvas(modelKey: SheetModelKey): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1240;
  canvas.height = 1754;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Títulos
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('SISTEMA DE AVALIAÇÃO EDUCACIONAL (SAEC) – REDE MUNICIPAL', 80, 80);
  ctx.font = '18px sans-serif';
  ctx.fillText(`FOLHA DE RESPOSTAS — ${SHEET_MODELS[modelKey].name}`, 80, 115);

  // Marcadores Fiduciais (Cantos)
  const markerSize = 45;
  ctx.fillRect(60, 160, markerSize, markerSize);
  ctx.fillRect(canvas.width - 60 - markerSize, 160, markerSize, markerSize);
  ctx.fillRect(60, canvas.height - 160 - markerSize, markerSize, markerSize);
  ctx.fillRect(canvas.width - 60 - markerSize, canvas.height - 160 - markerSize, markerSize, markerSize);

  // Caixa de Nome do Aluno
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeRect(80, 220, 1080, 70);
  ctx.font = '14px sans-serif';
  ctx.fillText('NOME DO ESTUDANTE:', 100, 245);

  // Desenhar a grade de questões na pré-visualização da folha
  const model = SHEET_MODELS[modelKey];
  const startY = 360;
  const rowHeight = 28;
  const colWidth = 520;
  const startXLeft = 100;
  const bubbleSpacingX = 35;

  for (let q = 1; q <= model.questionsCount; q++) {
    const half = Math.ceil(model.questionsCount / 2);
    const colIndex = q <= half ? 0 : 1;
    const qIndexInCol = q <= half ? q - 1 : q - half - 1;

    const baseX = startXLeft + (colIndex * colWidth);
    const baseY = startY + (qIndexInCol * rowHeight);

    // Número da questão
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`${q < 10 ? '0' + q : q}.`, baseX, baseY + 5);

    // Bolhas A, B, C, D
    model.options.forEach((opt, optIdx) => {
      const bX = baseX + 60 + (optIdx * bubbleSpacingX);
      const bY = baseY;

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(bX, bY, 9, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#666666';
      ctx.fillText(opt, bX - 3, bY + 4);
      ctx.fillStyle = '#000000';
    });
  }

  return canvas;
}

export function simulateTiltedCapture(modelKey: SheetModelKey): HTMLCanvasElement {
  return generateSheetCanvas(modelKey);
}
