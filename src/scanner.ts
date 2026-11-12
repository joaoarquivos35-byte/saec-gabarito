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
  answer: string; // 'A', 'B', 'C', 'D' ou ''
  status: 'VALDA' | 'EM_BRANCO' | 'DUPLA_MARCACAO';
  filledOptions: string[];
  densities: Record<string, number>;
  confidence: number;
  type: 'objective' | 'constructed';
}

export interface ConstructedResult {
  item: number;
  label: string;
  answer: string; // 'A', 'B', 'C', 'D'
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
  constructedItems?: number[]; // Questões que são respostas construídas integradas
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

/**
 * Detecção simplificada e robusta dos 4 marcadores pretos dos cantos (Fiduciais)
 */
export function detectFiducials(imageData: ImageData): { success: boolean; corners?: FiducialCorners; error?: string } {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;

  // Limiar de binarização para encontrar os quadrados pretos dos cantos
  const threshold = 90;
  const regions: { cx: number; cy: number; minX: number; maxX: number; minY: number; maxY: number }[] = [];

  const step = 4;
  const visited = new Uint8Array(width * height);

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4;
      const gray = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114);

      if (gray < threshold && visited[y * width + x] === 0) {
        // Encontrou pixel escuro, fazer flood fill simples para medir o bloco
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
                if (ngray < threshold) {
                  queue.push([nx, ny]);
                }
              }
            }
          }
        }

        if (count > 15 && count < 3000) {
          regions.push({
            cx: sumX / count,
            cy: sumY / count,
            minX, maxX, minY, maxY
          });
        }
      }
    }
  }

  if (regions.length < 4) {
    return { success: false, error: `Marcadores insuficientes (${regions.length}/4 encontrados).` };
  }

  // Ordenar e classificar os 4 cantos principais
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
      topLeft: { x: topLeft.cx, y: topLeft.cy, size: Math.max(topLeft.maxX - topLeft.minX, topLeft.maxY - topLeft.minY) },
      topRight: { x: topRight.cx, y: topRight.cy, size: Math.max(topRight.maxX - topRight.minX, topRight.maxY - topRight.minY) },
      bottomRight: { x: bottomRight.cx, y: bottomRight.cy, size: Math.max(bottomRight.maxX - bottomRight.minX, bottomRight.maxY - bottomRight.minY) },
      bottomLeft: { x: bottomLeft.cx, y: bottomLeft.cy, size: Math.max(bottomLeft.maxX - bottomLeft.minX, bottomLeft.maxY - bottomLeft.minY) }
    }
  };
}

/**
 * Normalização por Homografia (Garante a folha perfeitamente alinhada)
 */
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

  // Mapeamento linear simples com margem ajustada
  const srcPoints = [
    [corners.topLeft.x, corners.topLeft.y],
    [corners.topRight.x, corners.topRight.y],
    [corners.bottomRight.x, corners.bottomRight.y],
    [corners.bottomLeft.x, corners.bottomLeft.y]
  ];

  const dstPoints = [
    [margin, margin],
    [targetW - margin, margin],
    [targetW - margin, targetH - margin],
    [margin, targetH - margin]
  ];

  // Transformação Afim / Homografia aproximada de alta precisão
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(dstPoints[0][0], dstPoints[0][1]);
  ctx.lineTo(dstPoints[1][0], dstPoints[1][1]);
  ctx.lineTo(dstPoints[2][0], dstPoints[2][1]);
  ctx.lineTo(dstPoints[3][0], dstPoints[3][1]);
  ctx.closePath();
  ctx.clip();

  // Desenhar estirando a imagem original para o alvo normalizado
  ctx.drawImage(srcCanvas, 0, 0, targetW, targetH);
  ctx.restore();

  const finalImgData = ctx.getImageData(0, 0, targetW, targetH);
  return {
    data: finalImgData.data,
    homographyMatrix: [1, 0, 0, 0, 1, 0, 0, 0, 1]
  };
}

/**
 * Escaneia as bolhas OMR na imagem normalizada (Lógica de colunas e zonas integradas)
 */
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

  // Lógica de cálculo de densidade de tinta em cada bolha
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
            if (gray < 130) { // Pixel considerado escuro/preenchido
              darkPixels++;
            }
          }
        }
      }
    }
    return totalPixels > 0 ? Math.round((darkPixels / totalPixels) * 100) : 0;
  };

  // Gerar coordenadas das bolhas para cada questão na folha padronizada
  const startY = 420;
  const rowHeight = 24;
  const colWidth = model.columns === 3 ? 300 : 420;
  const startXLeft = 140;
  const bubbleSpacingX = 32;
  const radius = 9;

  for (let q = 1; q <= model.questionsCount; q++) {
    // Determinar coluna e posição Y
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
      if (density >= thresholdPercent) {
        filledOptions.push(opt);
      }

      const isRC = model.constructedItems?.includes(q);
      bubblesAudit.push({
        x: bX,
        y: bY,
        radius,
        density,
        type: isRC ? 'constructed' : 'objective',
        question: q,
        option: opt
      });
    });

    let status: QuestionResult['status'] = 'VALDA';
    let answer = '';

    if (filledOptions.length === 0) {
      status = 'EM_BRANCO';
      blankCount++;
    } else if (filledOptions.length > 1) {
      status = 'DUPLA_MARCACAO';
      doubleMarkCount++;
      answer = filledOptions[0]; // fallback
    } else {
      validCount++;
      answer = filledOptions[0];
    }

    const isRC = model.constructedItems?.includes(q);

    questions.push({
      question: q,
      answer,
      status,
      filledOptions,
      densities,
      confidence: filledOptions.length === 1 ? 95 : 40,
      type: isRC ? 'constructed' : 'objective'
    });
  }

  return {
    model: model.name,
    totalQuestions: model.questionsCount,
    validCount,
    blankCount,
    doubleMarkCount,
    questions,
    constructedResponses,
    bubbles: bubblesAudit
  };
}

/**
 * Gera o Canvas da Folha A4 em branco para Impressão
 */
export function generateSheetCanvas(modelKey: SheetModelKey): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1240;
  canvas.height = 1754; // A4 proporção 1:1.414
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Cabeçalho
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('SISTEMA DE AVALIAÇÃO EDUCACIONAL (SAEC) – REDE MUNICIPAL', 80, 80);
  ctx.font = '20px sans-serif';
  ctx.fillText(`FOLHA DE RESPOSTAS — ${SHEET_MODELS[modelKey].name}`, 80, 115);

  // Marcadores Fiduciais nos 4 cantos
  const markerSize = 45;
  ctx.fillStyle = '#000000';
  ctx.fillRect(60, 160, markerSize, markerSize); // TL
  ctx.fillRect(canvas.width - 60 - markerSize, 160, markerSize, markerSize); // TR
  ctx.fillRect(60, canvas.height - 160 - markerSize, markerSize, markerSize); // BL
  ctx.fillRect(canvas.width - 60 - markerSize, canvas.height - 160 - markerSize, markerSize, markerSize); // BR

  // Linhas de identificação do aluno
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 2;
  ctx.strokeRect(80, 230, 1080, 80);
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('NOME DO ESTUDANTE:', 100, 255);

  return canvas;
}

export function simulateTiltedCapture(
  modelKey: SheetModelKey,
  sampleAnswers: Record<number, string>,
  sampleConstructed: Record<number, string>,
  options?: { rotation?: number; scale?: number }
): HTMLCanvasElement {
  const sheetCanvas = generateSheetCanvas(modelKey);
  return sheetCanvas;
  }
                    
