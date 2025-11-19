// BarcodeScanner.js
// Cara install: npm install @zxing/browser

import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import "./BarcodeScanner.css";

// Fungsi sederhana deteksi mobile


const BarcodeScanner = () => {
  // Handler upload gambar
  const handleImageUpload = async (e) => {
    setError("");
    setResult(null);
    const file = e.target.files[0];
    if (!file) return;
    const img = new window.Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
      try {
        const codeReader = new BrowserMultiFormatReader();
        const res = await codeReader.decodeFromImageElement(img);
        setResult({
          text: res.getText(),
          format: res.getBarcodeFormat(),
        });
        setHighlight(true);
        setTimeout(() => setHighlight(false), 1000);
      } catch (err) {
        setError("Gagal membaca barcode dari gambar.");
      }
    };
  };
  const videoRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [highlight, setHighlight] = useState(false);

  const codeReaderRef = useRef(null);
  useEffect(() => {
    let codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;
    setIsScanning(true);
    setError("");
    setResult(null);

    codeReader.decodeFromVideoDevice(null, videoRef.current, (res, err) => {
      if (res) {
        setResult({
          text: res.getText(),
          format: res.getBarcodeFormat(),
        });
        setIsScanning(false);
        setHighlight(true);
        // Jangan langsung reset/stop di sini
        setTimeout(() => setHighlight(false), 1000);
      }
      if (err && !(err.name === "NotFoundException")) {
        setError("Gagal membaca barcode.");
      }
    }).catch(() => {
      setError("Kamera gagal diakses. Pastikan izin kamera sudah diberikan.");
      setIsScanning(false);
    });

    // Cleanup saat unmount
    return () => {
        if (codeReaderRef.current && typeof codeReaderRef.current.stop === 'function') {
          codeReaderRef.current.stop();
        }
    };
  }, [isScanning]);

  // Handler scan ulang
  const handleRescan = () => {
    setResult(null);
    setError("");
    setIsScanning(true);
  };

  // Jika bukan mobile, tampilkan pesan khusus


  return (
    <div className="barcode-container">
      <div className={`barcode-video-wrapper ${highlight ? "barcode-success" : ""}`}>
        {/* Live preview kamera */}
        <video ref={videoRef} className="barcode-video" autoPlay playsInline />
      </div>
        {/* Upload gambar untuk scan dari galeri */}
        <div className="barcode-upload-wrapper">
          <label htmlFor="barcode-upload" className="barcode-upload-label">Scan dari Galeri (Upload Gambar)</label>
          <input type="file" id="barcode-upload" accept="image/*" onChange={handleImageUpload} />
        </div>
      {error && <div className="barcode-error">{error}</div>}
      {result && (
        <div className="barcode-result">
          <div className="barcode-code">
            <span>Kode:</span> <b>{result.text}</b>
          </div>
          <div className="barcode-type">
            <span>Tipe:</span> <b>{result.format}</b>
          </div>
          <button className="barcode-rescan-btn" onClick={handleRescan}>Scan Ulang</button>
        </div>
      )}
      {!result && !error && (
        <div className="barcode-instruksi">
          Arahkan kamera ke barcode untuk memindai.
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
