import { Material } from '../types';

import pengenalanDesainContent from './design-grafis/pengenalan-desain.html?raw';
import teoriWarnaContent from './design-grafis/teori-warna.html?raw';
import proyekAkhirContent from './design-grafis/proyek-akhir.html?raw';
import proyekBrandingContent from './design-grafis/proyek-branding.html?raw';
import proyekDesainKemasanContent from './design-grafis/proyek-desain-kemasan.html?raw';

export const designGrafisMaterials: Material[] = [
  {
    id: 'pengenalan-desain',
    title: 'Pengenalan Desain Grafis dan Prinsip Dasar',
    content: pengenalanDesainContent,
    renderAs: 'iframe',
  },
  {
    id: 'teori-warna',
    title: 'Teori Warna dan Psikologi Warna',
    content: teoriWarnaContent,
  },
   {
    id: 'proyek-akhir',
    title: 'Proyek Akhir dan Presentasi',
    content: proyekAkhirContent,
  },
  {
    id: 'proyek-branding',
    title: 'Proyek Branding: Membuat Logo dan Brand Guideline',
    content: proyekBrandingContent,
  },
  {
    id: 'proyek-desain-kemasan',
    title: 'Proyek Desain Kemasan',
    content: proyekDesainKemasanContent,
  },
];
