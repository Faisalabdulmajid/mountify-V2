import React from 'react';

const SimaksiPricingInput = ({ 
  value, 
  onChange, 
  disabled = false, 
  showHelp = true,
  compact = false 
}) => {
  return (
    <div style={{border: '1px solid #ccc', padding: '15px', borderRadius: '4px', marginBottom: '15px'}}>
      <label className="form-label" style={{fontWeight: 'bold', marginBottom: '8px', display: 'block'}}>
        Biaya SIMAKSI (Rp)
      </label>
      <input 
        type="number" 
        className="form-control"
        placeholder="Masukkan biaya SIMAKSI" 
        defaultValue={typeof value === 'number' ? value : 0}
        onChange={(e) => onChange && onChange(parseInt(e.target.value) || 0)}
        disabled={disabled}
        style={{marginBottom: '8px'}}
      />
      <small className="text-muted" style={{display: 'block'}}>
        💡 Sistem kategori SIMAKSI (Mahasiswa/Lokal/Umum/Mancanegara) akan tersedia setelah perbaikan teknis.
      </small>
    </div>
  );
};

export default SimaksiPricingInput;