import { Material } from '../types';

import pengenalanDesainContent from './design-grafis/pengenalan-desain.html?raw';
import teoriWarnaContent from './design-grafis/teori-warna.html?raw';

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
];
