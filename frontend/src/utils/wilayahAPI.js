// src/utils/wilayahAPI.js
// Utility untuk mengakses API wilayah administratif Indonesia

const WILAYAH_API = {
  BASE_URL: "https://www.emsifa.com/api-wilayah-indonesia/api",
  PROVINCES: "/provinces.json",
  REGENCIES: "/regencies", // + /{provinceId}.json
  DISTRICTS: "/districts", // + /{regencyId}.json (jika diperlukan)
};

export const wilayahAPI = {
  // Mengambil semua provinsi
  async getProvinces() {
    try {
      const response = await fetch(
        `${WILAYAH_API.BASE_URL}${WILAYAH_API.PROVINCES}`
      );
      if (!response.ok) throw new Error("Gagal memuat data provinsi");
      return await response.json();
    } catch (error) {
      console.error("Kesalahan mengambil data provinsi:", error);
      throw error;
    }
  },

  // Mengambil kabupaten berdasarkan ID provinsi
  async getRegencies(provinceId) {
    try {
      const response = await fetch(
        `${WILAYAH_API.BASE_URL}${WILAYAH_API.REGENCIES}/${provinceId}.json`
      );
      if (!response.ok)
        throw new Error(`Gagal memuat kabupaten untuk provinsi ${provinceId}`);
      return await response.json();
    } catch (error) {
      console.error(
        `Kesalahan mengambil data kabupaten untuk provinsi ${provinceId}:`,
        error
      );
      throw error;
    }
  },

  // Mengambil kecamatan berdasarkan ID kabupaten (jika diperlukan)
  async getDistricts(regencyId) {
    try {
      const response = await fetch(
        `${WILAYAH_API.BASE_URL}${WILAYAH_API.DISTRICTS}/${regencyId}.json`
      );
      if (!response.ok)
        throw new Error(`Gagal memuat kecamatan untuk kabupaten ${regencyId}`);
      return await response.json();
    } catch (error) {
      console.error(
        `Kesalahan mengambil data kecamatan untuk kabupaten ${regencyId}:`,
        error
      );
      throw error;
    }
  },

  // Mengambil kabupaten untuk beberapa provinsi sekaligus
  async getRegenciesForMultipleProvinces(provinceIds, provinceList = []) {
    try {
      const promises = provinceIds.map(async (provinceId) => {
        const regencies = await this.getRegencies(provinceId);
        const provinceName =
          provinceList.find((p) => p.id === provinceId)?.name || "";
        return regencies.map((regency) => ({
          id: regency.id,
          name: regency.name,
          province_id: provinceId,
          province_name: provinceName,
        }));
      });

      const results = await Promise.all(promises);
      return results.flat(); // Gabungkan semua array menjadi satu
    } catch (error) {
      console.error("Kesalahan mengambil data kabupaten untuk beberapa provinsi:", error);
      throw error;
    }
  },

  // Utility untuk parsing lokasi administratif yang tersimpan
  parseStoredLocation(locationString) {
    if (!locationString) return [];
    return locationString.split("; ").map((loc) => {
      const parts = loc.split(", ");
      return {
        regency: parts[0],
        province: parts[1],
      };
    });
  },

  // Utility untuk format lokasi administratif untuk disimpan
  formatLocationForStorage(regencies, availableRegencies = []) {
    return regencies
      .map((regencyId) => {
        const regency = availableRegencies.find(
          (item) => item.id === regencyId
        );
        return regency ? `${regency.name}, ${regency.province_name}` : "";
      })
      .filter(Boolean);
  },
};

export default wilayahAPI;
