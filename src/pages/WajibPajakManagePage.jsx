import { useEffect, useState } from "react";
import api from "../config/api";
import SuperAdminLayout from "../components/SuperAdminLayout";
import "./WajibPajakManagePage.css";
import QrisModal from "../components/QrisModal";

const WajibPajakManagePage = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("semua");
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/api/wajibpajak/semua");
      setData(res.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      alert("Gagal mengambil data.");
    }
  };

  const filteredData = data.filter((item) =>
    filter === "semua" ? true : item.status === filter
  );

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedIds(filteredData.map((d) => d._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleUpdate = async (id, updatedFields) => {
    try {
      await api.put(`/api/wajibpajak/${id}`, updatedFields);
      fetchData();
    } catch (err) {
      console.error("Error updating data:", err);
      alert("Gagal mengupdate data");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus data ini?")) return;
    try {
      await api.delete(`/api/wajibpajak/${id}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting data:", err);
      alert("Gagal menghapus data");
    }
  };

  const handleBlast = async () => {
    if (!customMessage || selectedIds.length === 0) {
      alert("Pilih minimal 1 data dan isi pesan terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/wajibpajak/blast", {
        ids: selectedIds,
        message: customMessage,
      });
      alert(res.data.message);
    } catch (err) {
      console.error("Error sending WA blast:", err);
      alert("Gagal mengirim pesan WA.");
    }
    setLoading(false);
  };

  return (
    <SuperAdminLayout>
      <div className="container">
        <h2>Manajemen Wajib Pajak</h2>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{data.length}</div>
            <div className="stat-label">Total Wajib Pajak</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {data.filter((d) => d.status === "sudah").length}
            </div>
            <div className="stat-label">Sudah Lapor</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {data.filter((d) => d.status === "belum").length}
            </div>
            <div className="stat-label">Belum Lapor</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{selectedIds.length}</div>
            <div className="stat-label">Dipilih</div>
          </div>
        </div>

        {/* Filter */}
        <div className="filter">
          <label>Filter Status:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="semua">Semua</option>
            <option value="belum">Belum</option>
            <option value="sudah">Sudah</option>
          </select>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      filteredData.length > 0 &&
                      selectedIds.length === filteredData.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th>Nama</th>
                <th>NPWP</th>
                <th>WA</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <div className="empty-state-text">
                      {filter === "semua"
                        ? "Belum ada data wajib pajak"
                        : `Tidak ada data dengan status "${filter}"`}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((d) => (
                  <tr key={d._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(d._id)}
                        onChange={() => handleCheckboxChange(d._id)}
                      />
                    </td>
                    <td>{d.nama}</td>
                    <td>{d.npwp}</td>
                    <td>
                      <input
                        type="text"
                        defaultValue={d.nomor_wa}
                        onBlur={(e) =>
                          handleUpdate(d._id, { nomor_wa: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <select
                        defaultValue={d.status}
                        onChange={(e) =>
                          handleUpdate(d._id, { status: e.target.value })
                        }
                      >
                        <option value="belum">Belum Lapor</option>
                        <option value="sudah">Sudah Lapor</option>
                      </select>
                    </td>
                    <td className="flex gap-2">
                      {/* Tombol QRIS - FIXED: Kirim semua data termasuk _id */}
                      <QrisModal data={d} />
                      {/* Tombol Hapus */}
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(d._id)}
                      >
                        🗑️ Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Blast Section */}
        <div className="blast-section">
          <h3>📱 Kirim Pesan WhatsApp</h3>
          <textarea
            placeholder={`Ketik pesan yang akan dikirim ke wajib pajak yang dipilih...\n\nContoh:\nHalo [Nama], reminder bahwa batas waktu pelaporan pajak akan segera berakhir. Harap segera melengkapi pelaporan Anda. Terima kasih.`}
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
          ></textarea>
          <button
            className="btn-blast"
            onClick={handleBlast}
            disabled={
              loading || !customMessage.trim() || selectedIds.length === 0
            }
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Mengirim...
              </>
            ) : (
              <>📨 Kirim WA ke {selectedIds.length} Nomor</>
            )}
          </button>
          {selectedIds.length === 0 && (
            <p
              style={{
                color: "#ef4444",
                fontSize: "0.875rem",
                marginTop: "8px",
              }}
            >
              ⚠️ Pilih minimal 1 wajib pajak untuk mengirim pesan
            </p>
          )}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default WajibPajakManagePage;