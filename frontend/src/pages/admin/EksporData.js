// src/pages/admin/EksporData.js

import React, { useState, useEffect } from 'react';
import './EksporData.css';
import { getExportStats, downloadExportFile } from '../../utils/exportApi';
import PageHeader from '../../components/admin/common/PageHeader';

const EksporData = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getExportStats();
      if (response.success) {
        setStats(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      setError('Gagal memuat statistik data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      setExportLoading(prev => ({ ...prev, [type]: true }));
      setError(null);
      
      await downloadExportFile(type);
      
      // Show success message
      // Note: File download will be handled by browser
      
    } catch (err) {
      setError(`Gagal mengekspor data ${type}: ` + err.message);
    } finally {
      setExportLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const exportOptions = [
    {
      type: 'gunung',
      title: 'Data Gunung',
      description: 'Ekspor semua data gunung termasuk informasi dasar dan statistik jalur',
      icon: 'bi-mountain',
      color: 'success',
      count: stats?.total_gunung || 0
    },
    {
      type: 'jalur',
      title: 'Data Jalur Pendakian',
      description: 'Ekspor semua data jalur dengan detail lengkap kriteria dan lokasi',
      icon: 'bi-signpost-split',
      color: 'primary', 
      count: stats?.total_jalur || 0
    },
    {
      type: 'all',
      title: 'Semua Data',
      description: 'Ekspor data gunung dan jalur dalam satu file CSV berurutan',
      icon: 'bi-collection',
      color: 'warning',
      count: (stats?.total_gunung || 0) + (stats?.total_jalur || 0)
    }
  ];

  return (
    <div className="ekspor-data-container">
      <PageHeader 
        title="Ekspor Data"
      />
      <div className="mb-3">
        <p className="text-muted">Download data sistem dalam format CSV</p>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Memuat...</span>
          </div>
          <p className="mt-2 text-muted">Memuat statistik data...</p>
        </div>
      ) : (
        <>
          {/* Statistics Overview */}
          {stats && (
            <div className="row mb-4">
              <div className="col-md-4">
                <div className="card bg-success text-white">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-mountain fs-1 me-3"></i>
                      <div>
                        <h5 className="card-title mb-0">Total Gunung</h5>
                        <h2 className="mb-0">{stats.total_gunung}</h2>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-primary text-white">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-signpost-split fs-1 me-3"></i>
                      <div>
                        <h5 className="card-title mb-0">Total Jalur</h5>
                        <h2 className="mb-0">{stats.total_jalur}</h2>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-info text-white">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-check-circle fs-1 me-3"></i>
                      <div>
                        <h5 className="card-title mb-0">Gunung Berjalur</h5>
                        <h2 className="mb-0">{stats.gunung_dengan_jalur}</h2>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Export Options */}
          <div className="row">
            {exportOptions.map((option) => (
              <div key={option.type} className="col-lg-4 col-md-6 mb-4">
                <div className="card h-100 export-card">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex align-items-center mb-3">
                      <div className={`export-icon bg-${option.color}`}>
                        <i className={`bi ${option.icon}`}></i>
                      </div>
                      <div className="ms-3">
                        <h5 className="card-title mb-1">{option.title}</h5>
                        <small className="text-muted">{option.count} record</small>
                      </div>
                    </div>
                    
                    <p className="card-text text-muted flex-grow-1">
                      {option.description}
                    </p>
                    
                    <button
                      className={`btn btn-${option.color} w-100`}
                      onClick={() => handleExport(option.type)}
                      disabled={exportLoading[option.type] || option.count === 0}
                    >
                      {exportLoading[option.type] ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Mengekspor...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-download me-2"></i>
                          Download CSV
                        </>
                      )}
                    </button>
                    
                    {option.count === 0 && (
                      <small className="text-muted mt-2 text-center">
                        Tidak ada data untuk diekspor
                      </small>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Information Card */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Informasi Ekspor
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>Format File:</h6>
                  <ul className="list-unstyled">
                    <li><i className="bi bi-check-circle text-success me-2"></i>CSV (Comma Separated Values)</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Encoding UTF-8 dengan BOM</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Compatible dengan Excel</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6>Isi Data:</h6>
                  <ul className="list-unstyled">
                    <li><i className="bi bi-check-circle text-success me-2"></i>Header kolom dalam bahasa Indonesia</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Data lengkap sesuai database</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Timestamp pada nama file</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-3">
                <h6>Catatan:</h6>
                <ul className="list-unstyled mb-0">
                  <li><i className="bi bi-exclamation-triangle text-warning me-2"></i>File akan didownload otomatis setelah proses selesai</li>
                  <li><i className="bi bi-exclamation-triangle text-warning me-2"></i>Pastikan popup blocker tidak menghalangi download</li>
                  <li><i className="bi bi-exclamation-triangle text-warning me-2"></i>Data yang diekspor adalah snapshot real-time</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          {stats && (
            <div className="text-center mt-3">
              <small className="text-muted">
                <i className="bi bi-clock me-1"></i>
                Terakhir diperbarui: {new Date(stats.last_updated).toLocaleString('id-ID')}
                <button 
                  className="btn btn-link btn-sm p-0 ms-2"
                  onClick={fetchStats}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-clockwise"></i>
                </button>
              </small>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EksporData;