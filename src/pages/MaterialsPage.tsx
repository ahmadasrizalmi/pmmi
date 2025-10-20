import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { courseData } from '../data/courses';
import AnimatedSection from '../../components/AnimatedSection';

const MaterialsPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = courseData.find(c => c.id === categoryId);

  if (!category) {
    return <div className="text-center py-20">Kategori tidak ditemukan.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <AnimatedSection className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-white">{category.name}</h1>
        <p className="mt-4 text-xl text-gray-400">Pilih materi untuk dipelajari.</p>
      </AnimatedSection>

      <AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.materials.map((material) => (
            <Link
              key={material.id}
              to={`/materials/${categoryId}/${material.id}`}
              className="block p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg hover:bg-white/10 hover:-translate-y-1 transition-all duration-300"
            >
              <h3 className="text-xl font-bold text-white group-hover:text-purple-400">{material.title}</h3>
            </Link>
          ))}
        </div>
      </AnimatedSection>
    </div>
  );
};

export default MaterialsPage;
