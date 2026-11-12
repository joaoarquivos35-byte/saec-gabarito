/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  Scan,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Upload,
  RotateCw,
  FileText,
  X,
  Eye,
  Download,
  Info,
  Sliders,
  Sparkles,
  Maximize2,
  PackageCheck
} from 'lucide-react';
import {
  detectFiducials,
  warpPerspective,
  scanOMRBubbles,
  generateSheetCanvas,
  simulateTiltedCapture,
  SHEET_MODELS,
  type SheetModelKey,
  type SheetModelConfig,
  type FiducialCorners,
  type OMRScanResult,
  type QuestionResult,
  type ConstructedResult
} from './scanner.ts';

// Gabaritos oficiais padrão (Apenas alternativas A, B, C, D)
const DEFAULT_ANSWER_KEYS: Record<SheetModelKey, Record<number, string>> = {
  '1ano': {
    1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'A',
    6: 'B', 7: 'C', 8: 'D', 9: 'A', 10: 'B',
    11: 'C', 12: 'D', 13: 'A', 14: 'B', 15: 'C',
    16: 'D', 17: 'A', 18: 'B', 19: 'C', 20: 'D'
  },
  '2e3ano': {
    1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'A',
    6: 'B', 7: 'C', 8: 'D', 9: 'A', 10: 'B',
    11: 'C', 12: 'D', 13: 'A', 14: 'B', 15: 'C',
    16: 'D', 17: 'A', 18: 'B', 19: 'C', 20: 'D',
    21: 'A', 22: 'B', 23: 'C', 24: 'D', 25: 'A',
    26: 'B', 27: 'C', 28: 'D', 29: 'A', 30: 'B'
  },
  '4ano': {
    1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'A',
    6: 'B', 7: 'C', 8: 'D', 9: 'A', 10: 'B',
    11: 'C', 12: 'D', 13: 'A', 14: 'B', 15: 'C',
    16: 'D', 17: 'A', 18: 'B', 19: 'C', 20: 'D',
    21: 'A', 22: 'B', 23: 'C', 24: 'D', 25: 'A',
    26: 'B', 27: 'C', 28: 'D', 29: 'A', 30: 'B',
    31: 'C', 32: 'D', 33: 'A', 34: 'B', 35: 'C', 36: 'D'
  },
  '5ano': {
    1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'A',
    6: 'B', 7: 'C', 8: 'D', 9: 'A', 10: 'B',
    11: 'C', 12: 'D', 13: 'A', 14: 'B', 15: 'C',
    16: 'D', 17: 'A', 18: 'B', 19: 'C', 20: 'D',
    21: 'A', 22: 'B', 23: 'C', 24: 'D', 25: 'A',
    26: 'B', 27: 'C', 28: 'D', 29: 'A', 30: 'B',
    31: 'C', 32: 'D', 33: 'A', 34: 'B', 35: 'C',
    36: 'D', 37: 'A', 38: 'B', 39: 'C', 40: 'D'
  },
  '6a9ano': {
    1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'A',
    6: 'B', 7: 'C', 8: 'D', 9: 'A', 10: 'B',
    11: 'C', 12: 'D', 13: 'A', 14: 'B', 15: 'C',
    16: 'D', 17: 'A', 18: 'B', 19: 'C', 20: 'D',
    21: 'A', 22: 'B', 23: 'C', 24: 'D', 25: 'A',
    26: 'B', 27: 'C', 28: 'D', 29: 'A', 30: 'B',
    31: 'C', 32: 'D', 33: 'A', 34: 'B', 35: 'C',
    36: 'D', 37: 'A', 38: 'B', 39: 'C', 40: 'D',
    41: 'A', 42: 'B', 43: 'C', 44: 'D', 45: 'A',
    46: 'B', 47: 'C', 48: 'D', 49: 'A', 50: 'B'
  }
};

export default function App() {
  const [selectedModel, setSelectedModel] = useState<SheetModelKey>('5ano');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  
  // Detecção em tempo real
  const [detectedCorners, setDetectedCorners] = useState<FiducialCorners | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanMessage, setScanMessage] = useState<string>('Aponte a câmera para os 4 cantos da folha');
  const [thresholdPercent, setThresholdPercent] = useState<number>(36);

  // Resultados
  const [scanResult, setScanResult] = useState<OMRScanResult | null>(null);
  const [auditImages, setAuditImages] = useState<{
    originalUrl?: string;
    warpedUrl?: string;
    homographyMatrix?: number[];
  }>({});
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'resultados' | 'discursivas' | 'visao_computacional' | 'gabarito_oficial'>('resultados');
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Gabarito oficial editável
  const [answerKey, setAnswerKey] = useState<Record<number, string>>(DEFAULT_ANSWER_KEYS['5ano']);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const trackingIntervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setAnswerKey(DEFAULT_ANSWER_KEYS[selectedModel]);
  }, [selectedModel]);

  // Iniciar Câmera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.warn('Erro ao acessar a câmera:', err);
      setCameraActive(false);
      setCameraError('Câmera indisponível no dispositivo. Você pode carregar uma foto ou clicar em "Testar Amostra" para verificação imediata!');
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, [startCamera]);

  // Rastreamento dos 4 cantos fiduciais em tempo real
  useEffect(() => {
    if (!cameraActive) return;

    const processFrame = () => {
      const video = videoRef.current;
      const overlay = overlayCanvasRef.current;
      if (!video || !overlay || video.videoWidth === 0 || video.videoHeight === 0) return;

      overlay.width = video.videoWidth;
      overlay.height = video.videoHeight;
      const ctx = overlay.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, overlay.width, overlay.height);

      const sampleW = 480;
      const sampleH = Math.round((video.videoHeight / video.videoWidth) * sampleW);

      const offscreen = document.createElement('canvas');
      offscreen.width = sampleW;
      offscreen.height = sampleH;
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;

      offCtx.drawImage(video, 0, 0, sampleW, sampleH);
      const imgData = offCtx.getImageData(0, 0, sampleW, sampleH);

      const detection = detectFiducials(imgData);
      const scaleX = video.videoWidth / sampleW;
      const scaleY = video.videoHeight / sampleH;

      if (detection.success && detection.corners) {
        const c = {
          topLeft: { x: detection.corners.topLeft.x * scaleX, y: detection.corners.topLeft.y * scaleY, size: (detection.corners.topLeft.size || 20) * scaleX },
          topRight: { x: detection.corners.topRight.x * scaleX, y: detection.corners.topRight.y * scaleY, size: (detection.corners.topRight.size || 20) * scaleX },
          bottomRight: { x: detection.corners.bottomRight.x * scaleX, y: detection.corners.bottomRight.y * scaleY, size: (detection.corners.bottomRight.size || 20) * scaleX },
          bottomLeft: { x: detection.corners.bottomLeft.x * scaleX, y: detection.corners.bottomLeft.y * scaleY, size: (detection.corners.bottomLeft.size || 20) * scaleX }
        };

        setDetectedCorners(c);
        setScanMessage('4 Marcadores Encontrados! Pronto para escanear.');

        // Traçado dinâmico do quadrilátero de homografia
        ctx.strokeStyle = '#06B6D4';
        ctx.lineWidth = 4;
        ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
        ctx.beginPath();
        ctx.moveTo(c.topLeft.x, c.topLeft.y);
        ctx.lineTo(c.topRight.x, c.topRight.y);
        ctx.lineTo(c.bottomRight.x, c.bottomRight.y);
        ctx.lineTo(c.bottomLeft.x, c.bottomLeft.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const drawMarkerTarget = (p: { x: number; y: number; size: number }, label: string) => {
          const s = Math.max(30, p.size * 1.4);
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 3;
          ctx.strokeRect(p.x - s / 2, p.y - s / 2, s, s);

          ctx.fillStyle = '#10B981';
          ctx.font = 'bold 14px "JetBrains Mono", monospace';
          ctx.fillText(label, p.x - 12, p.y - s / 2 - 8);
        };

        drawMarkerTarget(c.topLeft, 'TL');
        drawMarkerTarget(c.topRight, 'TR');
        drawMarkerTarget(c.bottomRight, 'BR');
        drawMarkerTarget(c.bottomLeft, 'BL');
      } else {
        setDetectedCorners(null);
        setScanMessage('Aponte a câmera para enquadrar os 4 blocos pretos dos cantos...');
      }
    };

    const intervalId = window.setInterval(processFrame, 250);
    trackingIntervalRef.current = intervalId;

    return () => clearInterval(intervalId);
  }, [cameraActive]);

  // Processamento OMR da imagem
  const processImageForOMR = (sourceCanvas: HTMLCanvasElement) => {
    setIsScanning(true);
    setScanMessage('Processando homografia e leitura OMR...');

    try {
      const srcCtx = sourceCanvas.getContext('2d')!;
      const fullImgData = srcCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);

      // 1. Detecção dos 4 cantos
      const detection = detectFiducials(fullImgData);
      if (!detection.success || !detection.corners) {
        throw new Error(
          detection.error || 'Não foi possível encontrar os 4 blocos pretos dos cantos. Certifique-se de que a folha inteira está iluminada e visível.'
        );
      }

      // 2. Warp de Perspectiva (Achatamento por Homografia)
      const targetW = 1000;
      const targetH = 1414;
      const warped = warpPerspective(fullImgData, detection.corners, targetW, targetH, 50);

      // Canvas normalizado
      const warpedCanvas = document.createElement('canvas');
      warpedCanvas.width = targetW;
      warpedCanvas.height = targetH;
      const warpedCtx = warpedCanvas.getContext('2d')!;
      const warpedImageDataObj = warpedCtx.createImageData(targetW, targetH);
      warpedImageDataObj.data.set(warped.data);
      warpedCtx.putImageData(warpedImageDataObj, 0, 0);

      // 3. Leitura OMR das Bolhas (Objetivas A-D e Respostas Construídas T-P-E-B)
      const omrResult = scanOMRBubbles(warped, selectedModel, thresholdPercent);

      // 4. Desenha sobreposição de auditoria visual
      warpedCtx.lineWidth = 2.5;
      for (const b of omrResult.bubbles) {
        const isSelected = b.density >= thresholdPercent;
        if (b.type === 'constructed') {
          if (isSelected) {
            warpedCtx.strokeStyle = '#0284C7';
            warpedCtx.fillStyle = 'rgba(2, 132, 199, 0.4)';
          } else {
            warpedCtx.strokeStyle = 'rgba(2, 132, 199, 0.25)';
            warpedCtx.fillStyle = 'transparent';
          }
        } else {
          if (isSelected) {
            warpedCtx.strokeStyle = '#10B981';
            warpedCtx.fillStyle = 'rgba(16, 185, 129, 0.35)';
          } else {
            warpedCtx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
            warpedCtx.fillStyle = 'transparent';
          }
        }
        warpedCtx.beginPath();
        warpedCtx.arc(b.x, b.y, b.radius + 1.5, 0, Math.PI * 2);
        warpedCtx.fill();
        warpedCtx.stroke();
      }

      setAuditImages({
        originalUrl: sourceCanvas.toDataURL('image/jpeg', 0.9),
        warpedUrl: warpedCanvas.toDataURL('image/jpeg', 0.95),
        homographyMatrix: Array.from(warped.homographyMatrix)
      });

      setScanResult(omrResult);
      setShowResultModal(true);
      setScanMessage(`Leitura Concluída! ${omrResult.validCount} objetivas e ${omrResult.constructedResponses.length} discursivas.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha no processamento óptico.';
      alert(`Aviso OMR: ${msg}`);
      setScanMessage(msg);
    } finally {
      setIsScanning(false);
    }
  };

  const handleScanClick = () => {
    if (!videoRef.current || videoRef.current.videoWidth === 0) {
      alert('Aguardando vídeo da câmera. Você também pode clicar em "Testar Amostra" ou carregar uma imagem.');
      return;
    }

    const video = videoRef.current;
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;
    const ctx = captureCanvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);

    processImageForOMR(captureCanvas);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        processImageForOMR(canvas);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleTestTiltedSample = () => {
    const sampleAnswers: Record<number, string> = {};
    const model = SHEET_MODELS[selectedModel];
    for (let q = 1; q <= model.questionsCount; q++) {
      const opt = model.options[(q * 2 + 1) % model.options.length];
      sampleAnswers[q] = opt;
    }
    delete sampleAnswers[4]; // deixa em branco para teste

    // Simulação do Bloco de Respostas Construídas: Discursiva 01 = Total (T), Discursiva 02 = Parcial (P)
    const sampleConstructed: Record<number, string> = {
      1: 'T',
      2: 'P'
    };

    const tiltedCanvas = simulateTiltedCapture(selectedModel, sampleAnswers, sampleConstructed, {
      rotation: -5.5,
      scale: 0.54
    });

    processImageForOMR(tiltedCanvas);
  };

  const calculateScore = () => {
    if (!scanResult) return { correct: 0, total: 0, percentage: 0 };
    let correct = 0;
    const total = scanResult.totalQuestions;

    scanResult.questions.forEach((q) => {
      const expected = answerKey[q.question];
      if (q.status === 'VALDA' && q.answer === expected) {
        correct++;
      }
    });

    const percentage = Math.round((correct / total) * 100);
    return { correct, total, percentage };
  };

  const handleExportJSON = () => {
    if (!scanResult) return;
    const score = calculateScore();
    const exportData = {
      timestamp: new Date().toISOString(),
      standard: 'SAEC - Rede Municipal',
      model: scanResult.model,
      score,
      summary: {
        total: scanResult.totalQuestions,
        valid: scanResult.validCount,
        blank: scanResult.blankCount,
        doubleMarked: scanResult.doubleMarkCount
      },
      objectiveAnswers: scanResult.questions.map(q => ({
        question: q.question,
        marked: q.answer,
        status: q.status,
        official: answerKey[q.question] || null,
        isCorrect: q.answer === answerKey[q.question],
        confidence: q.confidence,
        densities: q.densities
      })),
      constructedResponses: scanResult.constructedResponses.map(rc => ({
        item: rc.item,
        label: rc.label,
        rubric: rc.answer,
        rubricName: rc.rubricName,
        status: rc.status,
        densities: rc.densities
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omr_saec_${selectedModel}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintSheet = () => {
    const sheetCanvas = generateSheetCanvas(selectedModel);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Gabarito SAEC - ${SHEET_MODELS[selectedModel].name}</title>
          <style>
            @page { size: A4 portrait; margin: 0; }
            body { margin: 0; display: flex; justify-content: center; align-items: center; background: #fff; }
            img { width: 100vw; height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body onload="window.print()">
          <img src="${sheetCanvas.toDataURL('image/png')}" />
        </body>
      </html>
    `);
    win.document.close();
  };

  const scoreData = calculateScore();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 flex flex-col select-none">
      {/* 1. Interface Limpa: Câmera em Tela Cheia (Sem máscaras ou recortes fixos) */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Canvas HUD Dinâmico de Marcadores */}
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {!cameraActive && (
          <div className="relative z-20 flex flex-col items-center justify-center max-w-md px-6 text-center text-slate-300 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
              <Camera className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-200">
                {cameraError || 'Iniciando câmera...'}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={startCamera}
                  className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
                >
                  Tentar Ativar Câmera Novamente
                </button>
                <button
                  onClick={handleTestTiltedSample}
                  className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Testar com Amostra Inclinada (Simulação com Discursivas)
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Carregar Foto do Celular / Computador
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Indicador de rastreamento no topo do vídeo */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-4 py-1.5 rounded-full bg-slate-950/75 backdrop-blur-md border border-slate-800/80 text-xs font-medium text-slate-200 flex items-center gap-2 shadow-lg whitespace-nowrap">
          <div
            className={`w-2 h-2 rounded-full ${
              detectedCorners ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
            }`}
          />
          <span>{scanMessage}</span>
        </div>
      </div>

      {/* 2. Barra Superior: Select Obrigatório com as 5 Etapas SAEC */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
            <Scan className="w-5 h-5 text-cyan-400" />
            OMR SAEC
          </span>
          <span className="hidden sm:inline text-xs text-slate-400">· Rede Municipal (4 Alternativas A-D)</span>
        </div>

        {/* Select de Etapas Oficiais SAEC */}
        <div className="flex items-center gap-2">
          <label htmlFor="model-select" className="sr-only">Etapa Escolar</label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as SheetModelKey)}
            className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-900/95 text-white border border-slate-700 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer shadow-md"
          >
            <option value="1ano">1º Ano (20 Questões · A-D)</option>
            <option value="2e3ano">2º e 3º Ano (30 Questões · A-D)</option>
            <option value="4ano">4º Ano (36 Questões · A-D)</option>
            <option value="5ano">5º Ano (40 Questões · 2 Colunas · A-D)</option>
            <option value="6a9ano">6º ao 9º Ano (50 Questões · 3 Colunas · A-D)</option>
          </select>

          {/* Trocar Câmera */}
          <button
            onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
            title="Alternar Câmera"
            className="p-2 rounded-lg bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800 hover:bg-slate-800 transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Gerar / Imprimir Gabarito SAEC */}
          <button
            onClick={() => setShowPrintModal(true)}
            title="Imprimir Folha SAEC"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-900/80 text-slate-200 border border-slate-800 hover:bg-slate-800 transition-colors"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Imprimir Folha</span>
          </button>

          {/* Baixar site-gabarito.zip para Vercel */}
          <a
            href="/site-gabarito.zip"
            download="site-gabarito.zip"
            title="Baixar site-gabarito.zip para Vercel"
            className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white transition-colors shadow-sm"
          >
            <PackageCheck className="w-4 h-4" />
            <span>ZIP Vercel</span>
          </a>

          {/* Upload de Imagem */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Carregar Imagem"
            className="p-2 rounded-lg bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800 hover:bg-slate-800 transition-colors"
          >
            <Upload className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </header>

      {/* 3. Rodapé com Botão Principal de Leitura */}
      <footer className="absolute bottom-0 left-0 right-0 z-30 p-6 flex flex-col items-center justify-center bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent">
        <div className="flex items-center gap-4">
          <button
            onClick={handleTestTiltedSample}
            title="Testar Amostra com Respostas Construídas"
            className="px-3 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Testar Amostra SAEC</span>
          </button>

          {/* Botão Principal de Leitura */}
          <button
            onClick={handleScanClick}
            disabled={isScanning}
            className={`group relative flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold text-sm transition-all duration-200 shadow-2xl active:scale-95 ${
              detectedCorners
                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 ring-4 ring-cyan-500/30'
                : 'bg-white hover:bg-slate-100 text-slate-950'
            }`}
          >
            {isScanning ? (
              <>
                <RotateCw className="w-5 h-5 animate-spin" />
                <span>Processando OMR...</span>
              </>
            ) : (
              <>
                <Scan className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="tracking-wide">
                  {detectedCorners ? 'LER GABARITO (ALINHADO)' : 'LER GABARITO'}
                </span>
              </>
            )}
          </button>

          {scanResult && (
            <button
              onClick={() => setShowResultModal(true)}
              className="px-3 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 flex items-center gap-1.5 transition-all shadow-md"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Ver Resultado</span>
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <span>{SHEET_MODELS[selectedModel].shortName}</span>
          <span aria-hidden="true">·</span>
          <span>4 Alternativas (A, B, C, D)</span>
          <span aria-hidden="true">·</span>
          <span className="text-cyan-400 font-mono">Discursivas T/P/E/B</span>
        </div>
      </footer>

      {/* 4. MODAL DE RESULTADOS & AUDITORIA SAEC */}
      {showResultModal && scanResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
            {/* Topo do Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white leading-tight">
                    Relatório de Correção OMR SAEC
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>{scanResult.model}</span>
                    <span aria-hidden="true">·</span>
                    <span>{scanResult.totalQuestions} Objetivas</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-cyan-400 font-medium">{scanResult.constructedResponses.length} Discursivas</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportJSON}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Exportar JSON"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowResultModal(false)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Abas */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/40">
              <button
                onClick={() => setActiveTab('resultados')}
                className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'resultados'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Questões Objetivas ({scanResult.totalQuestions})
              </button>
              <button
                onClick={() => setActiveTab('discursivas')}
                className={`pb-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'discursivas'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Respostas Construídas (Discursivas)
              </button>
              <button
                onClick={() => setActiveTab('visao_computacional')}
                className={`pb-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'visao_computacional'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Auditoria de Visão Computacional
              </button>
              <button
                onClick={() => setActiveTab('gabarito_oficial')}
                className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'gabarito_oficial'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Gabarito Oficial
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* ABA 1: RESULTADOS OBJETIVAS */}
              {activeTab === 'resultados' && (
                <div className="space-y-6">
                  {/* Resumo */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-xs text-slate-400">Pontuação Objetiva</div>
                      <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                        {scoreData.correct}/{scoreData.total}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{scoreData.percentage}% de acerto</div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-xs text-slate-400">Válidas</div>
                      <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                        {scanResult.validCount}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">Bolhas únicas</div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-xs text-slate-400">Em Branco</div>
                      <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                        {scanResult.blankCount}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">Sem preenchimento</div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-xs text-slate-400">Dupla Marcação</div>
                      <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
                        {scanResult.doubleMarkCount}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">Anuladas</div>
                    </div>
                  </div>

                  {/* Tabela de Questões Objetivas */}
                  <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/40">
                    <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-slate-200">
                        {SHEET_MODELS[selectedModel].shortName} · Alternativas A, B, C, D
                      </h3>
                      <span className="text-xs text-slate-500">
                        Sensibilidade: {thresholdPercent}%
                      </span>
                    </div>

                    <div className={`grid grid-cols-1 ${SHEET_MODELS[selectedModel].columns === 3 ? 'md:grid-cols-3' : 'sm:grid-cols-2'} divide-y sm:divide-y-0 divide-slate-800`}>
                      {renderQuestionColumns(scanResult, answerKey, selectedModel)}
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 2: RESPOSTAS CONSTRUÍDAS (DISCURSIVAS DO PROFESSOR) */}
              {activeTab === 'discursivas' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-800/40 text-xs text-sky-200 space-y-1">
                    <p className="font-semibold text-sky-100 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-sky-400" />
                      Bloco Oficial de Respostas Construídas (SAEC)
                    </p>
                    <p>
                      Espaço específico no final da folha onde o professor avaliador assinala a pontuação da questão discursiva:
                      <br />
                      <strong>[ T ] Acerto Total</strong> · <strong>[ P ] Acerto Parcial</strong> · <strong>[ E ] Erro / Insuficiente</strong> · <strong>[ B ] Em Branco</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scanResult.constructedResponses.map((rc) => (
                      <div
                        key={rc.item}
                        className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="text-sm font-bold text-white">
                            {rc.label}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                            rc.answer === 'T'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : rc.answer === 'P'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : rc.answer === 'E'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {rc.answer ? `Nota: ${rc.answer} (${rc.rubricName})` : 'Não avaliada'}
                          </span>
                        </div>

                        {/* Bolhas de Avaliação */}
                        <div className="flex items-center justify-around pt-2">
                          {(['T', 'P', 'E', 'B'] as const).map((opt) => {
                            const isMarked = rc.answer === opt;
                            const density = rc.densities[opt] || 0;
                            return (
                              <div key={opt} className="flex flex-col items-center gap-1">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                                    isMarked
                                      ? 'bg-sky-500 text-slate-950 ring-4 ring-sky-500/30 font-extrabold'
                                      : 'bg-slate-900 border border-slate-700 text-slate-400'
                                  }`}
                                >
                                  {opt}
                                </div>
                                <span className="text-[10px] text-slate-400">
                                  {opt === 'T' ? 'Total' : opt === 'P' ? 'Parcial' : opt === 'E' ? 'Erro' : 'Branco'}
                                </span>
                                <span className="text-[10px] font-mono text-slate-500">
                                  {density}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ABA 3: AUDITORIA DE VISÃO COMPUTACIONAL */}
              {activeTab === 'visao_computacional' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Imagem Original */}
                    <div className="rounded-xl border border-slate-800 p-3 bg-slate-950/60 flex flex-col space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                        <span>1. Captura da Foto (Qualquer Inclinação)</span>
                        <span className="font-mono text-slate-500">Original</span>
                      </div>
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-black flex items-center justify-center border border-slate-800">
                        {auditImages.originalUrl ? (
                          <img
                            src={auditImages.originalUrl}
                            alt="Foto Original"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-slate-500">Sem imagem</span>
                        )}
                      </div>
                    </div>

                    {/* Imagem Normalizada por Homografia */}
                    <div className="rounded-xl border border-slate-800 p-3 bg-slate-950/60 flex flex-col space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                        <span>2. Folha Normalizada + Leitura OMR das Bolhas</span>
                        <span className="font-mono text-emerald-400">1000 × 1414 px</span>
                      </div>
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-black flex items-center justify-center border border-slate-800">
                        {auditImages.warpedUrl ? (
                          <img
                            src={auditImages.warpedUrl}
                            alt="Gabarito Achatado por Homografia"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-slate-500">Sem imagem normalizada</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {auditImages.homographyMatrix && (
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <h4 className="text-xs font-semibold text-slate-300">
                        Matriz Projetiva H (3×3) - Homografia
                      </h4>
                      <div className="grid grid-cols-3 gap-2 font-mono text-xs text-cyan-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-center">
                        {auditImages.homographyMatrix.map((val, idx) => (
                          <div key={idx} className="p-1 bg-slate-950 rounded border border-slate-800/80">
                            {val.toFixed(6)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-300">
                        Limiar de Densidade de Tinta: <span className="font-mono text-cyan-400">{thresholdPercent}%</span>
                      </span>
                      <span className="text-xs text-slate-500">Padrão SAEC: 36%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="60"
                      value={thresholdPercent}
                      onChange={(e) => setThresholdPercent(Number(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* ABA 4: GABARITO OFICIAL */}
              {activeTab === 'gabarito_oficial' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">
                        Gabarito Oficial para Correção Automática (A-D)
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Defina a alternativa correta de cada questão ({SHEET_MODELS[selectedModel].questionsCount} questões).
                      </p>
                    </div>
                    <button
                      onClick={() => setAnswerKey(DEFAULT_ANSWER_KEYS[selectedModel])}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    >
                      Restaurar Padrão
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {Array.from({ length: SHEET_MODELS[selectedModel].questionsCount }, (_, i) => i + 1).map((qNum) => {
                      const currentVal = answerKey[qNum] || 'A';
                      const opts = SHEET_MODELS[selectedModel].options; // Somente A, B, C, D
                      return (
                        <div key={qNum} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            Q{qNum < 10 ? '0' + qNum : qNum}
                          </span>
                          <div className="flex gap-1">
                            {opts.map((opt) => (
                              <button
                                key={opt}
                                onClick={() => setAnswerKey(prev => ({ ...prev, [qNum]: opt }))}
                                className={`w-6 h-6 rounded text-xs font-bold transition-colors ${
                                  currentVal === opt
                                    ? 'bg-cyan-500 text-slate-950'
                                    : 'bg-slate-900 text-slate-400 hover:text-white'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Padrão Oficial SAEC · 4 Alternativas (A, B, C, D)
              </span>
              <button
                onClick={() => setShowResultModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL DE IMPRESSÃO DA FOLHA SAEC */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  Folha Oficial SAEC - {SHEET_MODELS[selectedModel].name}
                </h3>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Folha oficial no padrão SAEC com <strong>4 alternativas (A, B, C, D)</strong> e{' '}
              <strong>Bloco de Respostas Construídas</strong> no rodapé. Imprima em papel A4 padrão.
            </p>

            <div className="relative aspect-[1/1.414] max-h-[380px] mx-auto rounded-lg overflow-hidden border border-slate-700 bg-white shadow-inner flex items-center justify-center">
              <PrintablePreview model={selectedModel} />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handlePrintSheet}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors flex items-center gap-2 shadow-lg"
              >
                <Printer className="w-4 h-4" />
                Imprimir Gabarito A4
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Renderiza colunas da tabela de questões de acordo com o modelo
function renderQuestionColumns(scanResult: OMRScanResult, answerKey: Record<number, string>, modelKey: SheetModelKey) {
  const model = SHEET_MODELS[modelKey];
  const total = model.questionsCount;
  const colsCount = model.columns;

  const columns: QuestionResult[][] = [];
  if (colsCount === 3) {
    const col1 = scanResult.questions.slice(0, 17);
    const col2 = scanResult.questions.slice(17, 34);
    const col3 = scanResult.questions.slice(34, 50);
    columns.push(col1, col2, col3);
  } else {
    const half = Math.ceil(total / 2);
    const col1 = scanResult.questions.slice(0, half);
    const col2 = scanResult.questions.slice(half);
    columns.push(col1, col2);
  }

  return columns.map((colQuestions, colIdx) => (
    <div key={colIdx} className="divide-y divide-slate-800/60 border-r last:border-r-0 border-slate-800">
      {colQuestions.map((q) => (
        <QuestionRow
          key={q.question}
          question={q}
          expected={answerKey[q.question]}
          modelOptions={model.options}
        />
      ))}
    </div>
  ));
}

// Linha de questão na tabela
function QuestionRow({
  question,
  expected,
  modelOptions
}: {
  question: QuestionResult;
  expected: string;
  modelOptions: string[];
}) {
  const isCorrect = question.status === 'VALDA' && question.answer === expected;

  return (
    <div className="flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-900/40 transition-colors">
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold text-slate-400 w-6">
          {question.question < 10 ? '0' + question.question : question.question}.
        </span>

        <div className="flex items-center gap-1">
          {modelOptions.map((opt) => {
            const isMarked = question.filledOptions.includes(opt);
            const isTarget = question.answer === opt;
            const density = question.densities[opt] || 0;

            let bubbleClass = 'bg-slate-950 border border-slate-700 text-slate-400';
            if (isTarget) {
              bubbleClass = isCorrect
                ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                : 'bg-rose-500 text-white font-bold border-rose-400';
            } else if (isMarked) {
              bubbleClass = 'bg-amber-500 text-slate-950 font-bold border-amber-400';
            }

            return (
              <span
                key={opt}
                title={`Opção ${opt}: ${density}% densidade`}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-transform ${bubbleClass}`}
              >
                {opt}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {question.status === 'VALDA' ? (
          <div className="flex items-center gap-1">
            <span className="font-mono font-bold text-slate-200">
              {question.answer}
            </span>
            {isCorrect ? (
              <span className="text-emerald-400 font-medium text-[10px]">Ok</span>
            ) : (
              <span className="text-rose-400 font-medium text-[10px]">
                (Gab: {expected})
              </span>
            )}
          </div>
        ) : question.status === 'EM_BRANCO' ? (
          <span className="text-amber-400 font-medium text-[10px]">Branco</span>
        ) : (
          <span className="text-rose-400 font-medium text-[10px]">Dupla</span>
        )}
      </div>
    </div>
  );
}

// Pré-visualização da Folha
function PrintablePreview({ model }: { model: SheetModelKey }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const generated = generateSheetCanvas(model);
    const canvas = canvasRef.current;
    canvas.width = generated.width;
    canvas.height = generated.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(generated, 0, 0);
    }
  }, [model]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full object-contain"
    />
  );
}
