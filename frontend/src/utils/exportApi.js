// src/utils/exportApi.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Get authentication headers
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  };
};

/**
 * Get export statistics
 */
export const getExportStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/export/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Gagal mengambil statistik');
    }

    return data;
  } catch (error) {
    console.error('Error fetching export stats:', error);
    throw error;
  }
};

/**
 * Download export file
 * @param {string} type - Type of export: 'gunung', 'jalur', or 'all'
 */
export const downloadExportFile = async (type) => {
  try {
    const validTypes = ['gunung', 'jalur', 'all'];
    if (!validTypes.includes(type)) {
      throw new Error('Tipe ekspor tidak valid');
    }

    const response = await fetch(`${API_BASE_URL}/api/export/${type}`, {
      method: 'GET',
      headers: {
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
      },
      credentials: 'include'
    });

    if (!response.ok) {
      // Try to parse error message from JSON
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengekspor data');
      } catch (parseError) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
    }

    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `export_${type}_${new Date().toISOString().slice(0, 10)}.csv`;
    
    if (contentDisposition) {
      const matches = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    // Get the blob data
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true, filename };
    
  } catch (error) {
    console.error('Error downloading export file:', error);
    throw error;
  }
};

/**
 * Export specific mountain data
 * @param {number} mountainId - ID of specific mountain to export
 */
export const exportMountainData = async (mountainId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/export/gunung/${mountainId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Gagal mengekspor data gunung');
    }

    const blob = await response.blob();
    const filename = `gunung_${mountainId}_${new Date().toISOString().slice(0, 10)}.csv`;
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true, filename };
    
  } catch (error) {
    console.error('Error exporting mountain data:', error);
    throw error;
  }
};

/**
 * Export specific trail data
 * @param {number} trailId - ID of specific trail to export
 */
export const exportTrailData = async (trailId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/export/jalur/${trailId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Gagal mengekspor data jalur');
    }

    const blob = await response.blob();
    const filename = `jalur_${trailId}_${new Date().toISOString().slice(0, 10)}.csv`;
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true, filename };
    
  } catch (error) {
    console.error('Error exporting trail data:', error);
    throw error;
  }
};

/**
 * Check if current user can perform export operations
 */
export const canUserExport = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    // Decode JWT token to check user role (basic check)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.peran === 'admin' || payload.peran === 'superadmin';
  } catch (error) {
    return false;
  }
};

const exportApi = {
  getExportStats,
  downloadExportFile,
  exportMountainData,
  exportTrailData,
  canUserExport
};

export default exportApi;