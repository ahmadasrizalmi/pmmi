export interface Material {
  id: string;
  title: string;
  content: string;
  renderAs?: 'article' | 'iframe'; // <-- TAMBAHKAN BARIS INI
}

export interface Category {
  id: string;
  name: string;
  materials: Material[];
}
