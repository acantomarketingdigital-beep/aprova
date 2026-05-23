'use client';

import React, { useCallback, useRef, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

type UploadState = 'idle' | 'dragging' | 'uploading' | 'success' | 'error';

interface ImportResult {
  updated: number;
  created: number;
  errors: number;
  message: string;
}

interface ImportModalProps {
  onClose: () => void;
  onSuccess: (result: ImportResult) => void;
}

const ACCEPTED = ['.csv', '.xlsx', '.xls'];

function FileSizeLabel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImportModal({ onClose, onSuccess }: ImportModalProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isValidFile = (f: File) =>
    ACCEPTED.some((ext) => f.name.toLowerCase().endsWith(ext));

  const handleFile = useCallback((f: File) => {
    if (!isValidFile(f)) {
      setErrorMsg('Formato inválido. Use CSV, XLSX ou XLS.');
      return;
    }
    setFile(f);
    setErrorMsg('');
    setUploadState('idle');
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setUploadState('idle');
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile],
  );

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setUploadState('dragging'); };
  const onDragLeave = () => setUploadState('idle');

  const handleUpload = async () => {
    if (!file) return;
    setUploadState('uploading');
    setProgress(0);

    // Simula progresso enquanto faz upload real
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) { clearInterval(progressInterval); return 90; }
        return p + Math.random() * 15;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_URL}/employees/import-payroll`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message ?? 'Erro no servidor ao processar a folha');
      }

      const data: ImportResult = await res.json();
      setResult(data);
      setUploadState('success');
      setTimeout(() => onSuccess(data), 300);
    } catch (err: any) {
      clearInterval(progressInterval);
      setErrorMsg(err.message ?? 'Falha no upload. Tente novamente.');
      setUploadState('error');
    }
  };

  const reset = () => {
    setFile(null);
    setUploadState('idle');
    setProgress(0);
    setResult(null);
    setErrorMsg('');
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A]/90 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-[#111] border border-[#2A2A2A] rounded-2xl flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1A1A1A]">
          <div>
            <h2 className="text-white font-black text-lg tracking-wide">IMPORTAR FOLHA</h2>
            <p className="text-[#555] text-xs mt-0.5">Atualize salários e margens em lote</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-[#666] hover:text-white hover:bg-[#222] transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5">

          {/* Drop zone */}
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => !file && inputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 px-6 cursor-pointer transition-all select-none ${
              uploadState === 'dragging'
                ? 'border-[#FFD700] bg-[#1A1A00]'
                : uploadState === 'success'
                ? 'border-green-500 bg-[#0A1A0A]'
                : uploadState === 'error'
                ? 'border-red-500 bg-[#1A0A0A]'
                : file
                ? 'border-[#FFD700]/40 bg-[#141400]'
                : 'border-[#333] hover:border-[#FFD700]/60 hover:bg-[#141400]'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED.join(',')}
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {uploadState === 'uploading' ? (
              <>
                <div className="text-4xl animate-bounce">📊</div>
                <p className="text-white font-bold">Processando folha...</p>
                <div className="w-full bg-[#1A1A1A] rounded-full h-2 overflow-hidden mt-2">
                  <div
                    className="h-full bg-[#FFD700] rounded-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[#555] text-xs">{Math.floor(progress)}%</p>
              </>
            ) : uploadState === 'success' ? (
              <>
                <div className="text-4xl">✅</div>
                <p className="text-green-400 font-black">Importação concluída!</p>
                {result && (
                  <p className="text-[#888] text-sm text-center">
                    {result.updated} atualizados · {result.created} criados · {result.errors} erros
                  </p>
                )}
              </>
            ) : file ? (
              <>
                <div className="text-4xl">📄</div>
                <div className="text-center">
                  <p className="text-white font-bold text-sm">{file.name}</p>
                  <p className="text-[#555] text-xs mt-1">{FileSizeLabel(file.size)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                  className="text-[#555] text-xs hover:text-[#888] underline mt-1"
                >
                  Remover e escolher outro
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-[#1A1A00] border border-[#FFD700]/20 flex items-center justify-center text-3xl">
                  📊
                </div>
                <div className="text-center">
                  <p className="text-white font-bold">
                    Arraste o arquivo aqui
                  </p>
                  <p className="text-[#555] text-sm mt-1">
                    ou{' '}
                    <span className="text-[#FFD700] font-bold underline-offset-2 underline">
                      clique para selecionar
                    </span>
                  </p>
                </div>
                <p className="text-[#444] text-xs text-center max-w-xs leading-relaxed">
                  Suba o relatório da folha (CSV ou Excel) para atualizar o salário líquido e
                  recalcular a margem de todos os funcionários automaticamente.
                </p>
                <p className="text-[#333] text-xs">CSV, XLSX, XLS · máx. 10 MB</p>
              </>
            )}
          </div>

          {/* Error message */}
          {(uploadState === 'error' || errorMsg) && (
            <div className="bg-[#1A0A0A] border border-red-500/30 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm font-medium">❌ {errorMsg}</p>
            </div>
          )}

          {/* Template download */}
          {uploadState !== 'success' && (
            <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[#888] text-xs font-bold uppercase tracking-widest mb-0.5">
                  Modelo de planilha
                </p>
                <p className="text-[#555] text-xs">
                  CPF, Nome, Salário Líquido, Admissão
                </p>
              </div>
              <a
                href="/templates/folha-modelo.csv"
                download
                className="text-[#FFD700] text-xs font-bold hover:underline flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                ⬇ Baixar modelo
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1A1A1A] flex gap-3">
          {uploadState === 'success' ? (
            <button
              onClick={onClose}
              className="flex-1 bg-[#FFD700] text-[#0A0A0A] font-black text-sm py-3.5 rounded-xl tracking-widest uppercase hover:brightness-110 transition"
            >
              CONCLUIR
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="flex-1 border border-[#2A2A2A] text-[#666] font-bold text-sm py-3.5 rounded-xl hover:border-[#444] hover:text-[#888] transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || uploadState === 'uploading'}
                className="flex-1 bg-[#FFD700] text-[#0A0A0A] font-black text-sm py-3.5 rounded-xl tracking-widest uppercase hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,215,0,0.3)]"
              >
                {uploadState === 'uploading' ? 'PROCESSANDO...' : 'IMPORTAR FOLHA'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
