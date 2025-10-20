import { Material } from '../types';

import cameraObscuraContent from './fotografi/camera-obscura.html?raw';
import penemuanPhotographyContent from './fotografi/penemuan-photography.html?raw';

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
];
