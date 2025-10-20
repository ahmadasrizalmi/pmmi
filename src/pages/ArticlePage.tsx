import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { courseData } from '../data/courses';
import AnimatedSection from '../../components/AnimatedSection';

const ArticlePage: React.FC = () => {
  const { categoryId, articleId } = useParams<{ categoryId: string; articleId: string }>();
  const category = courseData.find(c => c.id === categoryId);
  const article = category?.materials.find(m => m.id === articleId);
  
  // State untuk menyimpan tinggi iframe, defaultnya 720px
  const [iframeHeight, setIframeHeight] = useState('720px');

  useEffect(() => {
    // Fungsi untuk menangani pesan yang dikirim dari dalam iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'iframe-height' && typeof event.data.height === 'number') {
        // Atur tinggi iframe sesuai data yang dikirim + sedikit ruang ekstra
        setIframeHeight(`${event.data.height + 10}px`);
      }
    };

    // Tambahkan event listener untuk mendengarkan pesan
    window.addEventListener('message', handleMessage);

    // Hapus event listener saat komponen dibongkar
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  if (!article) {
    return <div className="text-center py-20">Materi tidak ditemukan.</div>;
  }

  // Skrip yang akan disisipkan ke dalam HTML iframe
  // Skrip ini mengukur tinggi konten dan mengirimkannya ke halaman utama
  const iframeResizeScript = `
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const sendHeight = () => {
          const height = document.documentElement.scrollHeight;
          window.parent.postMessage({ type: 'iframe-height', height: height }, '*');
        };

        // Kirim tinggi saat konten selesai dimuat
        window.addEventListener('load', sendHeight);

        // Gunakan ResizeObserver untuk mengirim pembaruan jika tinggi konten berubah
        const resizeObserver = new ResizeObserver(sendHeight);
        resizeObserver.observe(document.body);

        // Kirim tinggi awal untuk berjaga-jaga
        sendHeight();
      });
    </script>
  `;

  // Sisipkan skrip ke konten HTML sebelum tag </body>
  const contentWithScript = article.content.replace('</body>', `${iframeResizeScript}</body>`);

  return (
    <div className="container mx-auto px-4 py-16">
      <AnimatedSection>
        <div className="max-w-4xl mx-auto">
          <Link to={`/materials/${categoryId}`} className="text-purple-400 hover:text-purple-300 mb-8 inline-block">&larr; Kembali ke daftar materi</Link>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">{article.title}</h1>
          
          {article.renderAs === 'iframe' ? (
            // Container tidak lagi menggunakan aspect-video
            <div className="w-full border border-white/10 rounded-lg overflow-hidden bg-white">
              <iframe
                srcDoc={contentWithScript}
                title={article.title}
                className="w-full"
                style={{ height: iframeHeight, display: 'block', border: 'none' }}
                // 'allow-scripts' diperlukan agar skrip bisa berjalan
                sandbox="allow-scripts" 
              />
            </div>
          ) : (
            // Render sebagai artikel biasa jika bukan iframe
            <div 
              className="prose prose-invert prose-lg max-w-none text-gray-300"
              dangerouslySetInnerHTML={{ __html: article.content }} 
            />
          )}
        </div>
      </AnimatedSection>
    </div>
  );
};

export default ArticlePage;
