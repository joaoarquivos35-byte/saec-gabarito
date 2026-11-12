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
  Eye,
  Download,
  X,
  Sparkles
} from 'lucide-react';
import {
  detectFiducials,
  warpPerspective,
  scanOMRBubbles,
  generateSheetCanvas,
  simulateTiltedCapture,
  SHEET_MODELS,
  type SheetModelKey,
  type FiducialCorners,
  type OMRScanResult,
  type QuestionResult
} from './scanner.ts';

const DEFAULT_ANSWER_KEYS: Record<SheetModelKey, Record<number, string>> = {
  '1ano': { 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'A', 6: 'B', 7: 'C', 8: 'D', 9: 'A', 10: 'B', 11: 'C', 12: 'D', 13: 'A', 14: 'B', 15: 'C', 16: 'D', 17: 'A', 18: 'B', 19: 'C', 20: 'D' },
  '2e3ano': { 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'A', 6: 'B', 7: 'C', 8: 'D', 9: 'A', 10: 'B', 11: 'C', 12: 'D', 13: 'A', 14: 'B', 15: 'C', 16: 'D', 17: 'A', 18: 'B', 19: 'C', 20: 'D', 21: 'A', 22: 'B', 23: 'C', 24: 'D', 25: 'A', 26: 'B', 27: 'C', 28: 'D', 29: 'A', 30: 'B' },
  '4ano': { 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'A', 6: 'B', 7: 'C', 8: 'D', 9: 'A', 10: 'B', 11: 'C', 12: 'D', 13: 'A', 14: 'B', 15: 'C', 16: 'D', 17: 'A', 18: 'B', 19: 'C', 20: 'D', 21: 'A', 22: 'B', 23: 'C', 24: 'D', 25: 'A', 26: 'B', 27: 'C', 28: 'D', 29: 'A', 30: 'B', 31: 'C', 32: 'D', 33: 'A', 34: 'B', 35: 'C', 36: 'D' },
  '5ano': { 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'A', 6: 'B', 7: 'C', 8: 'D', 9: 'A', 10: 'B', 11: 'C', 12: 'D', 13: 'A', 14: 'B', 15: 'C', 16: 'D', 17: 'A', 18: 'B', 19: 'C', 20: 'D', 21: 'A', 22: 'B', 23: 'C', 24: 'D', 25: 'A', 26: 'B', 27: 'C', 28: 'D', 29: 'A', 30: 'B', 31: 'C', 32: 'D', 33: 'A', 34: 'B', 35: 'C', 36: 'D', 37: 'A', 38: 'B', 39: 'C', 40: 'D' },
  '6a9ano': { 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'A', 6: 'B', 7: 'C', 8: 'D', 9: 'A', 10: 'B', 11: 'C', 12: 'D', 13: 'A', 14: 'B', 15: 'C', 16: 'D', 17: 'A', 18: 'B', 19: 'C', 20: 'D', 21: 'A', 22: 'B', 23: 'C', 24: 'D', 25: 'A', 26: 'B', 27: 'C', 28: 'D', 29: 'A', 30: 'B', 31: 'C', 32: 'D', 33: 'A', 34: 'B', 35: 'C', 36: 'D', 37: 'A', 38: 'B', 39: 'C', 40: 'D', 41: 'A', 42: 'B', 43: 'C', 44: 'D', 45: 'A', 46: 'B', 47: 'C', 48: 'D', 49: 'A', 50: 'B' }
};

export default function App() {
  const [selectedModel, setSelectedModel] = useState<SheetModelKey>('5ano');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const [detectedCorners, setDetectedCorners] = useState<FiducialCorners | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanMessage, setScanMessage] = useState<string>('Aponte a câmera para a folha de respostas');
  const [thresholdPercent, setThresholdPercent] = useState<number>(36);

  const [scanResult, setScanResult] = useState<OMRScanResult | null>(null);
  const [auditImages, setAuditImages] = useState<{ originalUrl?: string; warpedUrl?: string }>({});
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'resultados' | 'gabarito' | 'auditoria'>('resultados');
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  const [answerKey, setAnswerKey] = useState<Record<number, string>>(DEFAULT_ANSWER_KEYS['5ano']);
  const [constructedQuestions, setConstructedQuestions] = useState<Record<number, boolean>>({});

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const trackingIntervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setAnswerKey(DEFAULT_ANSWER_KEYS[selectedModel]);
    const defaults: Record<number, boolean> = {};
    SHEET_MODELS[selectedModel].constructedItems?.forEach(q => { defaults[q] = true; });
    setConstructedQuestions(defaults);
  }, [selectedModel]);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch {
      setCameraActive(false);
      setCameraError('Câmera indisponível. Carregue uma foto ou teste com amostra.');
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
    };
  }, [startCamera]);

  useEffect(() => {
    if (!cameraActive) return;
    const processFrame = () => {
      const video = videoRef.current;
      const overlay = overlayCanvasRef.current;
      if (!video || !overlay || video.videoWidth === 0) return;
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

      const detection = detectFiducials(offCtx.getImageData(0, 0, sampleW, sampleH));
      const scaleX = video.videoWidth / sampleW;
      const scaleY = video.videoHeight / sampleH;

      if (detection.success && detection.corners) {
        const c = {
          topLeft: { x: detection.corners.topLeft.x * scaleX, y: detection.corners.topLeft.y * scaleY },
          topRight: { x: detection.corners.topRight.x * scaleX, y: detection.corners.topRight.y * scaleY },
          bottomRight: { x: detection.corners.bottomRight.x * scaleX, y: detection.corners.bottomRight.y * scaleY },
          bottomLeft: { x: detection.corners.bottomLeft.x * scaleX, y: detection.corners.bottomLeft.y * scaleY }
        };
        setDetectedCorners(c);
        setScanMessage('4 Cantos Encontrados! Pronto para escanear.');

        ctx.strokeStyle = '#06B6D4';
        ctx.lineWidth = 3;
        ctx.strokeRect(c.topLeft.x, c.topLeft.y, c.topRight.x - c.topLeft.x, c.bottomLeft.y - c.topLeft.y);
      } else {
        setDetectedCorners(null);
        setScanMessage('Enquadre os 4 marcadores pretos da folha...');
      }
    };
    trackingIntervalRef.current = window.setInterval(processFrame, 300);
    return () => clearInterval(trackingIntervalRef.current);
  }, [cameraActive]);

  const processImageForOMR = (sourceCanvas: HTMLCanvasElement) => {
    setIsScanning(true);
    setScanMessage('Processando leitura óptica...');
    try {
      const fullImgData = sourceCanvas.getContext('2d')!.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
      const detection = detectFiducials(fullImgData);
      if (!detection.success || !detection.corners) {
        throw new Error('Não foi possível encontrar os 4 marcadores pretos. Certifique-se de que a folha está visível e iluminada.');
      }

      const targetW = 1000;
      const targetH = 1414;
      const warped = warpPerspective(fullImgData, detection.corners, targetW, targetH, 50);

      const omrResult = scanOMRBubbles(warped.data, selectedModel, thresholdPercent, targetW, targetH);

      const warpedCanvas = document.createElement('canvas');
      warpedCanvas.width = targetW;
      warpedCanvas.height = targetH;
      const wCtx = warpedCanvas.getContext('2d')!;
      const imgObj = wCtx.createImageData(targetW, targetH);
      imgObj.data.set(warped.data);
      wCtx.putImageData(imgObj, 0, 0);

      // Desenhar círculos de auditoria visual na imagem normalizada
      wCtx.lineWidth = 2;
      for (const b of omrResult.bubbles) {
        const isSelected = b.density >= thresholdPercent;
        wCtx.strokeStyle = isSelected ? (b.type === 'constructed' ? '#0284C7' : '#10B981') : 'rgba(100,116,139,0.3)';
        wCtx.fillStyle = isSelected ? (b.type === 'constructed' ? 'rgba(2, 132, 199, 0.4)' : 'rgba(16, 185, 129, 0.4)') : 'transparent';
        wCtx.beginPath();
        wCtx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        wCtx.fill();
        wCtx.stroke();
      }

      setAuditImages({
        originalUrl: sourceCanvas.toDataURL('image/jpeg', 0.9),
        warpedUrl: warpedCanvas.toDataURL('image/jpeg', 0.95)
      });

      setScanResult(omrResult);
      setShowResultModal(true);
      setScanMessage('Leitura concluída com sucesso!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro no processamento.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleScanClick = () => {
    if (!videoRef.current || videoRef.current.videoWidth === 0) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')!.drawImage(videoRef.current, 0, 0);
    processImageForOMR(canvas);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d')!.drawImage(img, 0, 0);
        processImageForOMR(canvas);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleTestSample = () => {
    const canvas = simulateTiltedCapture(selectedModel, {}, {});
    processImageForOMR(canvas);
  };

  const calculateScore = () => {
    if (!scanResult) return { score: 0, total: 0, percentage: 0 };
    let score = 0;
    const total = scanResult.totalQuestions;

    scanResult.questions.forEach((q) => {
      const isRC = constructedQuestions[q.question];
      if (isRC) {
        if (q.answer === 'B') score += 0.5;
        else if (q.answer === 'C') score += 0.75;
        else if (q.answer === 'D') score += 1.0;
      } else {
        if (q.status === 'VALDA' && q.answer === answerKey[q.question]) {
          score += 1;
        }
      }
    });
    return { score, total, percentage: Math.round((score / total) * 100) };
  };

  const scoreData = calculateScore();

  return (
    <div className="relative w-full min-h-[100dvh] bg-slate-950 flex flex-col select-none overflow-x-hidden">
      {/* Vídeo / Câmera */}
      <div className="relative flex-grow w-full min-h-[60vh] bg-black flex items-center justify-center">
        <video ref={videoRef} playsInline muted autoPlay className="absolute inset-0 w-full h-full object-cover" />
        <canvas ref={overlayCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

        {!cameraActive && (
          <div className="relative z-20 text-center text-slate-300 p-6">
            <Camera className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
            <p className="text-sm">{cameraError || 'Ativando câmera...'}</p>
            <div className="mt-4 flex gap-2 justify-center">
              <button onClick={startCamera} className="px-4 py-2 text-xs bg-cyan-600 rounded-lg text-white font-semibold">Ativar Câmera</button>
              <button onClick={handleTestSample} className="px-4 py-2 text-xs bg-indigo-600 rounded-lg text-white font-semibold">Testar Amostra</button>
            </div>
          </div>
        )}

        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 text-xs text-slate-200">
          {scanMessage}
        </div>
      </div>

      {/* Barra Superior */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-slate-950/90 to-transparent">
        <span className="text-sm font-bold text-white flex items-center gap-1.5">
          <Scan className="w-5 h-5 text-cyan-400" /> OMR SAEC
        </span>
        <div className="flex items-center gap-2">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as SheetModelKey)}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 text-white border border-slate-700"
          >
            <option value="1ano">1º Ano (20Q)</option>
            <option value="2e3ano">2º/3º Ano (30Q)</option>
            <option value="4ano">4º Ano (36Q)</option>
            <option value="5ano">5º Ano (40Q)</option>
            <option value="6a9ano">6º-9º Ano (50Q)</option>
          </select>
          <button onClick={() => setShowPrintModal(true)} className="px-2.5 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white font-medium flex items-center gap-1">
            <Printer className="w-3.5 h-3.5" /> Imprimir
          </button>
          <button onClick={() => setFacingMode(m => m === 'environment' ? 'user' : 'environment')} className="p-2 bg-slate-900 text-slate-300 rounded-lg border border-slate-800">
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Rodapé Fixo */}
      <footer className="sticky bottom-0 left-0 right-0 z-30 p-4 bg-slate-950/95 border-t border-slate-800 flex justify-center items-center gap-3">
        <button onClick={handleTestSample} className="px-3 py-3 bg-slate-900 rounded-xl text-xs text-slate-300 border border-slate-800 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" /> Amostra
        </button>
        <button onClick={handleScanClick} disabled={isScanning} className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-2xl flex items-center gap-2 shadow-lg">
          <Scan className="w-5 h-5" /> LER GABARITO
        </button>
        {scanResult && (
          <button onClick={() => setShowResultModal(true)} className="px-3 py-3 bg-slate-900 rounded-xl text-xs text-slate-300 border border-slate-800 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-cyan-400" /> Resultado
          </button>
        )}
        <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-slate-900 rounded-xl text-emerald-400 border border-slate-800">
          <Upload className="w-4 h-4" />
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
      </footer>

      {/* Modal de Resultados */}
      {showResultModal && scanResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col text-slate-100 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                <h2 className="text-base font-bold text-white">Relatório de Leitura SAEC</h2>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowResultModal(false)} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="flex gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/40">
              <button onClick={() => setActiveTab('resultados')} className={`pb-3 text-xs font-semibold border-b-2 ${activeTab === 'resultados' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400'}`}>Pontuação</button>
              <button onClick={() => setActiveTab('gabarito')} className={`pb-3 text-xs font-semibold border-b-2 ${activeTab === 'gabarito' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400'}`}>Gabarito & Discursivas</button>
              <button onClick={() => setActiveTab('auditoria')} className={`pb-3 text-xs font-semibold border-b-2 ${activeTab === 'auditoria' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400'}`}>Auditoria Visual</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTab === 'resultados' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                      <div className="text-xs text-slate-400">Pontuação Total</div>
                      <div className="text-2xl font-bold font-mono text-cyan-400">{scoreData.score}/{scoreData.total}</div>
                      <div className="text-xs text-slate-500">{scoreData.percentage}%</div>
                    </div>
                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                      <div className="text-xs text-slate-400">Válidas</div>
                      <div className="text-2xl font-bold font-mono text-emerald-400">{scanResult.validCount}</div>
                    </div>
                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                      <div className="text-xs text-slate-400">Em Branco</div>
                      <div className="text-2xl font-bold font-mono text-amber-400">{scanResult.blankCount}</div>
                    </div>
                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                      <div className="text-xs text-slate-400">Dupla Marcação</div>
                      <div className="text-2xl font-bold font-mono text-rose-400">{scanResult.doubleMarkCount}</div>
                    </div>
                  </div>

                  {/* Listagem de Questões */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {scanResult.questions.map((q) => {
                      const isRC = constructedQuestions[q.question];
                      const expected = answerKey[q.question];
                      const isCorrect = q.status === 'VALDA' && q.answer === expected;
                      return (
                        <div key={q.question} className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-slate-300">Q{q.question < 10 ? '0' + q.question : q.question} {isRC && <span className="text-cyan-400 text-[10px] ml-1">(Discursiva)</span>}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-cyan-400 font-bold">{q.answer || '-'}</span>
                            {isRC ? (
                              <span className="text-[10px] text-cyan-300">Peso aplicado</span>
                            ) : (
                              <span className={isCorrect ? 'text-emerald-400 text-[10px]' : 'text-rose-400 text-[10px]'}>{isCorrect ? 'Correto' : `Gab: ${expected}`}</span>
                            )}
                          </div>
               
