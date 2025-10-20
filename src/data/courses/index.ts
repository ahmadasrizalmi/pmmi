import { Category } from '../types';
import { designGrafisMaterials } from './design-grafis';
import { fotografiMaterials } from './fotografi';
import { vibeCodingMaterials } from './vibe-coding';
import { videografiMaterials } from './videografi';

export const courseData: Category[] = [
  {
    id: 'design-grafis',
    name: 'Desain Grafis',
    materials: designGrafisMaterials,
  },
  {
    id: 'fotografi',
    name: 'Fotografi',
    materials: fotografiMaterials,
  },
  {
    id: 'vibe-coding',
    name: 'Vibe Coding',
    materials: vibeCodingMaterials,
  },
  {
    id: 'videografi',
    name: 'Videografi',
    materials: videografiMaterials,
  },
];
