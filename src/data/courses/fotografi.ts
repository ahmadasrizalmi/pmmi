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
import flashContent from './fotografi/flash.html?raw';
import photogenicContent from './fotografi/photogenic.html?raw';
import colorWBContent from './fotografi/color-wb.html?raw';
import kontrasContent from './fotografi/kontras.html?raw';
import alatEditingContent from './fotografi/alat-editing.html?raw';
import dasarEditingContent from './fotografi/dasar-editing.html?raw';
import workflowContent from './fotografi/workflow.html?raw';
import storyTellingContent from './fotografi/story-telling.html?raw';
import sensorDigitalContent from './fotografi/sensor-digital.html?raw';
import aiEditingContent from './fotografi/ai-editing.html?raw';
import aiVsHumanContent from './fotografi/ai-vs-human.html?raw';

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
  },
  {
    id: 'flash',
    title: '16. Flash Photography',
    content: flashContent,
  },
  {
    id: 'photogenic',
    title: '17. Photogenic',
    content: photogenicContent,
  },
  {
    id: 'color-wb',
    title: '18. Color B&W Photography',
    content: colorWBContent,
  },
  {
    id: 'kontras',
    title: '19. Kontras Warna',
    content: kontrasContent,
  },
  {
    id: 'alat-editing',
    title: '20. Alat Editing Foto',
    content: alatEditingContent,
  },
  {
    id: 'dasar-editing',
    title: '21. Dasar Editing Foto',
    content: dasarEditingContent,
  },
  {
    id: 'workflow',
    title: '22. Workflow Editing Foto',
    content: workflowContent,
  },
  {
    id: 'story-telling',
    title: '23. Storytelling dalam Fotografi',
    content: storyTellingContent,
  },
  {
    id: 'sensor-digital',
    title: '24. Sensor Digital',
    content: sensorDigitalContent,
  },
  {
    id: 'ai-editing',
    title: '25. AI Editing Foto',
    content: aiEditingContent,
  },
  {
    id: 'ai-vs-human',
    title: '26. AI VS Photographer',
    content: aiVsHumanContent,
  },
];
