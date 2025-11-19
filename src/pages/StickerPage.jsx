import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import api from "../config/api";
import "./StickerPage.css";

const StickerPage = () => {
  const { id } = useParams();
  const [wp, setWp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const componentRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get(`/api/wajibpajak/${id}`);
        setWp(res.data);
      } catch (err) {
        if (err.response) {
          setError(
            `Error ${err.response.status}: ${
              err.response.data?.message || "Data tidak ditemukan"
            }`
          );
        } else if (err.request) {
          setError(
            "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
          );
        } else {
          setError("Terjadi kesalahan yang tidak terduga.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    } else {
      setError("ID tidak valid");
      setLoading(false);
    }
  }, [id]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: `
      @page {
        size: 85mm 54mm;
        margin: 0;
      }
      @media print {
        body { margin: 0; }
        .no-print { display: none !important; }
        .sticker-card {
          width: 85mm !important;
          height: 54mm !important;
          box-shadow: none !important;
          margin: 0 !important;
          border: 1px solid #ccc !important;
        }
      }
    `,
  });

  const handleDownload = async () => {
    const element = componentRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const link = document.createElement("a");
    link.download = `sticker-${wp?.nama || "wp"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const formatNPWP = (npwp) => {
    if (!npwp) return "N/A";
    if (npwp.length === 15 && !npwp.includes(".")) {
      return npwp.replace(
        /(\d{2})(\d{3})(\d{3})(\d{1})(\d{3})(\d{3})/,
        "$1.$2.$3.$4-$5.$6"
      );
    }
    return npwp;
  };

  const formatWhatsApp = (wa) => {
    if (!wa) return "N/A";
    const cleaned = wa.replace(/[^\d]/g, "");
    if (cleaned.startsWith("62")) {
      return `+${cleaned.substring(0, 2)} ${cleaned.substring(
        2,
        5
      )}-${cleaned.substring(5, 9)}-${cleaned.substring(9)}`;
    } else if (cleaned.startsWith("0")) {
      return `+62 ${cleaned.substring(1, 4)}-${cleaned.substring(
        4,
        8
      )}-${cleaned.substring(8)}`;
    }
    return wa;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading...</p>
        <p className="loading-subtext">ID: {id}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <h2 className="error-title">Error</h2>
          <p>{error}</p>
          <p style={{ fontSize: "12px", marginTop: "8px" }}>ID: {id}</p>
        </div>
        <button
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!wp) {
    return (
      <div className="not-found-container">
        <div className="not-found-card">
          <h2 className="error-title">Data Tidak Ditemukan</h2>
          <p>Data wajib pajak dengan ID tersebut tidak ditemukan.</p>
          <p style={{ fontSize: "12px", marginTop: "8px" }}>ID: {id}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sticker-page">
      <div className="sticker-container">
        {/* Preview Info */}
        <div className="preview-info no-print">
          <h1 className="preview-title">Data Wajib Pajak</h1>
          <p className="preview-subtitle">Preview sticker untuk {wp.nama}</p>
        </div>

        {/* Sticker Card */}
        <div ref={componentRef} className="sticker-card">
          <div className="sticker-header">
            <div className="header-content">
              <div className="header-left">
                <div className="header-logo">
                  <span className="header-logo-text">WP</span>
                </div>
                <div>
                  <h2 className="header-title">WAJIB PAJAK</h2>
                  <p className="header-subtitle">Republik Indonesia</p>
                </div>
              </div>
              <div className="header-flag">
                <span className="flag-emoji">🇮🇩</span>
              </div>
            </div>
          </div>

          <div className="sticker-content">
            <div className="content-wrapper">
              <div className="name-section">
                <p className="field-label">Nama Wajib Pajak</p>
                <h3 className="name-value">{wp.nama}</h3>
              </div>
              <div className="details-grid">
                <div className="detail-item npwp-item">
                  <p className="detail-label">NPWP</p>
                  <p className="detail-value">{formatNPWP(wp.npwp)}</p>
                </div>
                <div className="detail-item wa-item">
                  <p className="detail-label">WhatsApp</p>
                  <p className="detail-value">
                    {formatWhatsApp(wp.nomor_wa)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="sticker-footer">
            <div className="footer-content">
              <div className="status-text">
                Status:{" "}
                <span
                  className={`status-value ${
                    wp.status === "sudah"
                      ? "status-sudah"
                      : "status-belum"
                  }`}
                >
                  {wp.status === "sudah"
                    ? "✅ Sudah Lapor"
                    : "⏳ Belum Lapor"}
                </span>
              </div>
              <div className="id-text">
                ID: {wp._id ? wp._id.slice(-6) : "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons no-print">
          <button onClick={handlePrint} className="btn-primary">
            🖨️ Cetak Sticker
          </button>
          <button onClick={handleDownload} className="btn-success">
            ⬇️ Download PNG
          </button>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary"
          >
            ⬅️ Kembali
          </button>
        </div>
      </div>
    </div>
  );
};

export default StickerPage;
