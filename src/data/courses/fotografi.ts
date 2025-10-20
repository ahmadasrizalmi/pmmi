import { Material } from '../types';

import cameraObscuraContent from './fotografi/camera-obscura.html?raw';
import penemuanPhotographyContent from './fotografi/penemuan-photography.html?raw';
import perkembanganCameraContent from './fotografi/perkembangan-camera.html?raw';
import photography20thContent from './fotografi/photography-20th.html?raw';
import jenisCameraContent from './fotografi/jenis-camera.html?raw';
import fungsiCameraContent from './fotografi/fungsi-camera.html?raw';
import jenisLensaContent from './fotografi/jenis-lensa.html?raw';
import focalLengthContent from './fotografi/focal-length.html?raw';
import histogramContent from './fotografi/histogram.html?raw';
import segitigaExposureContent from './fotografi/segitiga-exposure.html?raw';
import teknikKomposisiContent from './fotografi/teknik-komposisi.html?raw';
import bentukFotoContent from './fotografi/bentuk-foto.html?raw';
import sudutPengambilanContent from './fotografi/sudut-pengambilan.html?raw';
import sumberCahayaContent from './fotografi/sumber-cahaya.html?raw';
import goldenhourContent from './fotografi/golden-hour.html?raw';

export const fotografiMaterials: Material[] = [
  {
    id: 'camera-obscura',
    title: '1. Permulaan Camera Obscura',
    content: cameraObscuraContent,
  },
  {
    id: 'penemuan-photography',
    title: '2. Penemuan Photography',
    content: penemuanPhotographyContent,
  },
   {
    id: 'perkembangan-camera',
    title: '3. Perkembangan Kamera',
    content: perkembanganCameraContent,
  },
  {
    id: 'photography-20th',
    title: '4. Photography di Abad 20',
    content: photography20thContent,
  },
   {
    id: 'jenis-camera',
    title: '5. Jenis-jenis Kamera',
    content: jenisCameraContent,
  },
  {
    id: 'fungsi-camera',
    title: '6. Fungsi Kamera',
    content: fungsiCameraContent,
  },
  {
    id: 'jenis-lensa',
    title: '7. Jenis-jenis lensa',
    content: jenisLensaContent
  },
  {
    id: 'focal-length',
    title: '8. Focal length',
    content: focalLengthContent,
  },
  {
    id: 'histogram',
    title: '9. Histogram & Metering',
    content: histogramContent,
  },
  {
    id: 'segitiga-exposure',
    title: '10. Segitiga Exposure',
    content: segitigaExposureContent,
  },
   {
    id: 'teknik-komposisi',
    title: '11 Teknik komposisi dasar',
    content: teknikKomposisiContent,
  },
   {
    id: 'bentuk-foto',
    title: '12 Bentuk Dalam Fotografi',
    content: bentukFotoContent,
  },
   {
    id: 'sudut-pengambilan',
    title: '13 Segitiga Exposure',
    content: sudutPengambilanContent,
  },
  {
  id: 'sumber-cahaya',
    title: '14 Sumber Cahaya',
    content: sumberCahayaContent,
  },
  {
    id: 'golden-hour',
    title: '15. Golden Hour dan Blue Hour',
    content: goldenhourContent,
  }
];
