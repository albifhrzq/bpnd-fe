import { useState, useEffect } from "react";
import api from "../config/api";
import "./wajibpajakpage.css";
import SuperAdminLayout from "../components/SuperAdminLayout";
import QrisModal from "../components/QrisModal";

const WajibPajakPage = () => {
  const [form, setForm] = useState({
    nama: "",
    npwp: "",
    nomor_wa: "",
    status: "belum",
  });
  const [data, setData] = useState([]);
  const [file, setFile] = useState(null);

  const fetchData = async () => {
    try {
      const res = await api.get("/api/wajibpajak/semua");
      setData(res.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      alert("Gagal mengambil data wajib pajak.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/wajibpajak/tambah", form);
      alert("Wajib Pajak berhasil ditambahkan!");
      setForm({ nama: "", npwp: "", nomor_wa: "", status: "belum" });
      fetchData();
    } catch (err) {
      console.error("Error adding data:", err);
      alert("Gagal menambahkan data.");
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImportExcel = async () => {
    if (!file) {
      alert("Pilih file Excel terlebih dahulu!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/api/wajibpajak/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(`${res.data.message} (${res.data.count} data)`);
      fetchData();
    } catch (err) {
      console.error("Error import Excel:", err.response?.data || err.message);
      alert(
        "Gagal import data dari Excel: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      ["NAMA", "NPWP", "NO WA", "STATUS"],
      ["Contoh User", "1234567890", "08123456789", "belum"],
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      template.map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "template_wajibpajak.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <SuperAdminLayout>
      <div className="container">
        <h2>Input Wajib Pajak</h2>
        <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
          <input
            name="nama"
            placeholder="Nama"
            value={form.nama}
            onChange={handleChange}
            required
          />
          <input
            name="npwp"
            placeholder="NPWP"
            value={form.npwp}
            onChange={handleChange}
            required
          />
          <input
            name="nomor_wa"
            placeholder="Nomor WhatsApp"
            value={form.nomor_wa}
            onChange={handleChange}
            required
          />
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="belum">Belum</option>
            <option value="sudah">Sudah</option>
          </select>
          <button type="submit">Tambah</button>
        </form>

        <div style={{ marginBottom: "20px" }}>
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
          <button onClick={handleImportExcel}>Import Excel</button>
          <button onClick={handleDownloadTemplate}>Download Template</button>
        </div>

        <h3>Daftar Wajib Pajak</h3>
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Nama</th>
              <th>NPWP</th>
              <th>No WA</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  <div className="empty-state-icon">📋</div>
                  <div className="empty-state-text">
                    Belum ada data wajib pajak
                  </div>
                </td>
              </tr>
            ) : (
              data.map((d, i) => (
                <tr key={d._id || i} className="slide-in-up">
                  <td>{d.nama}</td>
                  <td>{d.npwp}</td>
                  <td>{d.nomor_wa}</td>
                  <td>
                    <span className={`status-badge status-${d.status}`}>
                      {d.status === "sudah" ? "✅ Sudah" : "⏳ Belum"}
                    </span>
                  </td>
                  <td>
                    {/* FIXED: Kirim semua data termasuk _id */}
                    <QrisModal data={d} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </SuperAdminLayout>
  );
};

export default WajibPajakPage;