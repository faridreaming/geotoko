import alkesKrakatau from '../assets/stores/alkes_krakatau.jpeg'
import ankerOfficialMedan from '../assets/stores/anker_official_medan.jpeg'
import cemilanRoufa from '../assets/stores/cemilan_roufa.jpeg'
import deliHouseware from '../assets/stores/deli_houseware.jpeg'
import kebunGreenFeast from '../assets/stores/kebun_green_feast.jpeg'
import komputermedanOs from '../assets/stores/komputermedan_os.jpeg'
import megahSaktiPharmacy from '../assets/stores/megah_sakti_pharmacy.jpeg'
import noImageStore from '../assets/stores/no_image_store.jpeg'
import omegaPremiumStore from '../assets/stores/omega_premium_store.jpeg'
import ratuSerbaGrosir from '../assets/stores/ratu_serba_grosir.jpeg'
import semangatTeknik from '../assets/stores/semangat_teknik.jpeg'
import shmartElectronic from '../assets/stores/shmart_electronic.jpeg'
import sumacoHomeOfficeSolution from '../assets/stores/sumaco_home_office_solution.jpeg'
import twocare from '../assets/stores/twocare.jpeg'
import vincent888 from '../assets/stores/vincent_888.jpeg'

/** Pemetaan nilai `url_gambar` di data → URL hasil bundler Vite. */
const BY_FILENAME: Record<string, string> = {
  'vincent_888.jpeg': vincent888,
  'komputermedan_os.jpeg': komputermedanOs,
  'omega_premium_store.jpeg': omegaPremiumStore,
  'kebun_green_feast.jpeg': kebunGreenFeast,
  'cemilan_roufa.jpeg': cemilanRoufa,
  'no_image_store.jpeg': noImageStore,
  'anker_official_medan.jpeg': ankerOfficialMedan,
  'shmart_electronic.jpeg': shmartElectronic,
  'deli_houseware.jpeg': deliHouseware,
  'twocare.jpeg': twocare,
  'megah_sakti_pharmacy.jpeg': megahSaktiPharmacy,
  'alkes_krakatau.jpeg': alkesKrakatau,
  'ratu_serba_grosir.jpeg': ratuSerbaGrosir,
  'semangat_teknik.jpeg': semangatTeknik,
  'sumaco_home_office_solution.jpeg': sumacoHomeOfficeSolution,
}

/**
 * Menyelesaikan `url_gambar` ke URL yang bisa dipakai di atribut `src`.
 * Mendukung URL absolut (Tokopedia, dll.) dan nama file lokal di `src/assets/stores/`.
 */
export function resolveStoreImageSrc(ref: string): string {
  const trimmed = ref.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return BY_FILENAME[trimmed] ?? noImageStore
}
