import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import logoBandung from '../assets/bandung.png';  
import logoInstansi from '../assets/logo.png';

const PrintLaporan = () => {
  const location = useLocation();
  const data = location.state?.data;
  const printRef = useRef();

  useEffect(() => {
    if (data) {
      setTimeout(() => {
        window.print();
      }, 300);
    }
  }, [data]);

  if (!data) return <div>Data tidak ditemukan</div>;

  return (
    <div ref={printRef} style={{ padding: '40px', fontFamily: 'serif' }}>
      {/* Logo Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src={logoBandung} alt="Logo Bandung" style={{ height: '70px' }} />
        <img src={logoInstansi} alt="Logo Instansi" style={{ height: '70px' }} />
      </div>

      {/* Header Text */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <h1 style={{
          margin: '0',
          fontSize: '18px',
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>
          PEMERINTAH KOTA BANDUNG
        </h1>
        <h2 style={{
          margin: '5px 0',
          fontSize: '16px',
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>
          BADAN PENGELOLAAN PENDAPATAN DAERAH
        </h2>
        <p style={{ margin: '5px 0', fontSize: '12px' }}>
          Jl. Wastukencana No. 2 Telp. (022) 422 2323 - Bandung
        </p>
      </div>

      <hr style={{ borderTop: '2px solid black', margin: '20px 0' }} />

      {/* Title */}
      <h2 style={{ textAlign: 'center', textDecoration: 'underline', marginBottom: '30px' }}>
        BERITA ACARA
      </h2>

      {/* Isi Data */}
      <div style={{ fontSize: '16px', lineHeight: '1.8' }}>
        <p><strong>Nama Pelapor:</strong> {data.nama}</p>
        <p><strong>Tanggal:</strong> {new Date(data.tanggal).toLocaleDateString('id-ID')}</p>
        <p><strong>Jenis Laporan:</strong> {data.jenis}</p>
        <p><strong>Isi Laporan:</strong></p>
        <p style={{ textAlign: 'justify' }}>{data.deskripsi}</p>
        {data.gambar && (
          <div style={{ marginTop: '20px' }}>
            <strong>Bukti Gambar:</strong><br />
            <img src={data.gambar} alt="Bukti" style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px' }} />
          </div>
        )}
      </div>

      {/* Tanda Tangan */}
      <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ textAlign: 'center' }}>
          <p>Pelapor,</p>
          <div style={{ height: '80px' }}></div>
          <p><strong>{data.nama}</strong></p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p>Mengetahui,</p>
          <div style={{ height: '80px' }}></div>
          <p><strong>Pimpinan Instansi</strong></p>
        </div>
      </div>
    </div>
  );
};

export default PrintLaporan;
