import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useReactToPrint } from "react-to-print";
import { Link } from "react-router-dom";
import "./QrisModal.css";

const QrisModal = ({ data }) => {
  const [open, setOpen] = useState(false);
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: `
      @page {
        size: 85mm 54mm;
        margin: 0;
      }
    `
  });

  // Validasi data
  if (!data || !data._id) {
    return <button className="qris-error">Error</button>;
  }

  // ✅ QR Code mengarah ke route yang akan redirect ke login
  const qrValue = `https://78a3733e6e29.ngrok-free.app/sticker/${data._id}`;

  return (
    <>
      {/* Tombol QRIS */}
      <button
        onClick={() => setOpen(true)}
        className="qris-button"
      >
        QRIS
      </button>

      {/* Modal */}
      {open && (
        <div className="qris-overlay" onClick={() => setOpen(false)}>
          <div className="qris-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="qris-header">
              <h3 className="qris-title">{data.nama}</h3>
              <p className="qris-debug">ID: {data._id.slice(-8)}</p>
            </div>

            <div className="qris-body">
              {/* QR Code */}
              <div className="qr-container">
                <div className="qr-wrapper">
                  <QRCodeSVG
                    value={qrValue}
                    size={100}
                    level="M"
                    includeMargin={false}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
                <p className="qr-help">Scan untuk melihat sticker</p>
                <p className="qr-info" style={{
                  fontSize: '11px',
                  color: '#64748b',
                  marginTop: '4px'
                }}>
                  📱 Harus login terlebih dahulu
                </p>
              </div>

              {/* Info */}
              <div className="qris-info">
                <div className="info-item">
                  <span className="info-label">NPWP:</span>
                  <span className="info-value">{data.npwp}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">WA:</span>
                  <span className="info-value">{data.nomor_wa}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className={`info-value ${data.status === 'sudah' ? 'status-sudah' : 'status-belum'}`}>
                    {data.status === 'sudah' ? '✓ Sudah Lapor' : '○ Belum Lapor'}
                  </span>
                </div>
              </div>

              {/* Hidden Print Content */}
              <div className="print-hidden">
                <div ref={componentRef} className="print-sticker">
                  <div className="print-header">
                    WAJIB PAJAK - REPUBLIK INDONESIA
                  </div>
                  <div className="print-content">
                    <div className="print-name">{data.nama}</div>
                    <div className="print-details">
                      <div>NPWP: {data.npwp}</div>
                      <div>WA: {data.nomor_wa}</div>
                    </div>
                  </div>
                  <div className="print-footer">
                    <span className={data.status === 'sudah' ? 'status-sudah' : 'status-belum'}>
                      {data.status === 'sudah' ? '✓ Sudah' : '○ Belum'}
                    </span>
                    <span>ID: {data._id.slice(-4)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="qris-actions">
                <button
                  onClick={handlePrint}
                  className="action-btn btn-print"
                >
                  Cetak
                </button>

                <button
                  className="action-btn btn-download"
                  onClick={() => {
                    // Cari elemen SVG QRCode
                    const svg = document.querySelector('.qr-wrapper svg');
                    if (!svg) return;
                    
                    // Buat image dari SVG
                    const serializer = new XMLSerializer();
                    const svgStr = serializer.serializeToString(svg);
                    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
                    const url = URL.createObjectURL(blob);
                    const img = new window.Image();
                    
                    img.onload = function() {
                      const canvas = document.createElement('canvas');
                      canvas.width = svg.width.baseVal.value || 100;
                      canvas.height = svg.height.baseVal.value || 100;
                      const ctx = canvas.getContext('2d');
                      ctx.drawImage(img, 0, 0);
                      const pngUrl = canvas.toDataURL('image/png');
                      const a = document.createElement('a');
                      a.href = pngUrl;
                      a.download = `QRIS_${data.nama || 'qris'}.png`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    };
                    img.src = url;
                  }}
                >
                  Download QRIS
                </button>

                {/* ✅ Tombol Lihat langsung ke sticker-view (protected) */}
                <Link
                  to={`/sticker-view/${data._id}`}
                  className="action-btn btn-view"
                >
                  Lihat
                </Link>

                <button
                  onClick={() => setOpen(false)}
                  className="action-btn btn-close"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QrisModal;