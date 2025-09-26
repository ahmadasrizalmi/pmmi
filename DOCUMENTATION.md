# Documentation: Pondok Multimedia Munzalan Indonesia Website

This document serves as a technical and content guide for the PMM Indonesia website project. It details the design system, animations, and content structure for developer reference.

---

## 1. Design System

### 1.1. Typography

*   **Primary Font:** `Inter`
*   **Source:** Google Fonts
*   **Weights Used:** 400 (Regular), 500 (Medium), 600 (Semi-Bold), 700 (Bold), 800 (Extra-Bold), 900 (Black).
*   **Implementation:** The font is imported in `index.html` and applied globally to the `body` tag.

### 1.2. Color Palette

The color scheme is based on a dark theme with vibrant purple and fuchsia accents.

*   **Background:** Black (`#000`)
*   **Primary Text:** White, Gray (`text-white`, `text-gray-300`, `text-gray-400`)
*   **Accent Colors:**
    *   Fuchsia (`text-fuchsia-400`, `text-fuchsia-500`)
    *   Purple (`text-purple-300`, `text-purple-400`, `text-purple-500`)
*   **UI Elements:** "Glassmorphism" effect using semi-transparent white (`bg-white/5`, `bg-white/10`) with backdrop blur (`backdrop-blur-md`) and light borders (`border-white/10`).

### 1.3. Key Reusable Components

*   `GlassCard.tsx`: A container component that provides the common "glassmorphism" style.
*   `Button.tsx`: The primary call-to-action button with a styled glass effect and hover states.
*   `AnimatedSection.tsx`: A wrapper component that applies a fade-in-up animation to its children when they scroll into view.
*   `Header.tsx` & `Footer.tsx`: Consistent navigation and footer across all pages.

---

## 2. Animation Details

The website uses a combination of CSS transitions and the Framer Motion library for animations.

*   **On-Scroll Fade-in-Up (`AnimatedSection.tsx`):**
    *   **Trigger:** Element enters the viewport.
    *   **Effect:** The element transitions from `opacity: 0` and `translateY: 10px` to `opacity: 1` and `translateY: 0px`.
    *   **Duration:** 1000ms.
    *   **Easing:** `ease-out`.
    *   **Implementation:** `useIntersectionObserver` hook combined with Tailwind CSS transition classes.

*   **Hero Content Entrance (`GalaxyHero.tsx`):**
    *   **Trigger:** Component loads.
    *   **Effect:** Same as the on-scroll animation (fade-in-up).
    *   **Implementation:** React state (`isLoaded`) and Tailwind CSS classes.

*   **Hero Background (`GalaxyHero.tsx`):**
    *   **Effect:** An animated 3D starfield effect giving the impression of flying through space.
    *   **Implementation:** HTML Canvas 2D API. Stars are rendered as particles with their `z` position updated on each frame.

*   **Scrolling Testimonials (`AnimatedTestimonials.tsx`):**
    *   **Effect:** An infinite, continuous vertical scroll of testimonial cards.
    *   **Implementation:** `framer-motion`. The `motion.div` is animated with `translateY: "-50%"` and set to `repeat: Infinity`.

*   **Staggered Section Animation (`SectionWithMockup.tsx`):**
    *   **Trigger:** Section enters the viewport.
    *   **Effect:** The text content and image mockup animate in sequentially (staggered). Each item fades in and moves up.
    *   **Implementation:** `framer-motion` variants (`containerVariants`, `itemVariants`) and `whileInView`.

*   **Image Mockup Parallax (`SectionWithMockup.tsx`):**
    *   **Trigger:** Section scrolls into view.
    *   **Effect:** The two image layers move vertically at slightly different rates, creating a subtle parallax effect.
    *   **Implementation:** `framer-motion`'s `whileInView` prop with different `y` transform values.

*   **Gallery Image Hover (`GalleryPage.tsx`):**
    *   **Trigger:** User hovers over a gallery image.
    *   **Effect:** The image scales up to 110%.
    *   **Implementation:** Tailwind CSS `group-hover:scale-110` utility.

---

## 3. Page Content & Data

This section outlines the static text and data used on each page.

### 3.1. LandingPage.tsx

*   **Hero Section (`GalaxyHero.tsx`):**
    *   **Title:** "Pondok Multimedia <br /> Munzalan Indonesia"
    *   **Subtitle:** "Membentuk Generasi Qurani yang Mahir Multimedia dan Siap Menghadapi Era Digital."
    *   **CTA Button:** "Daftar Sekarang"

*   **About Summary Section (`SectionWithMockup.tsx`):**
    *   **Title:** "Sinergi Unik: Ilmu Agama & Keahlian Digital"
    *   **Description:** "Didirikan tahun 2023, kami hadir untuk mempersiapkan santri agar tidak hanya hafal Al-Quran, tetapi juga mahir di bidang multimedia dan siap menghadapi era digital. Kami memiliki dua jalur utama:"
    *   **Feature 1 (Konten Kreator):**
        *   Title: "Jalur Konten Kreator"
        *   Description: "Mendalami fotografi, videografi, desain, & branding untuk menciptakan konten dakwah yang berdampak."
    *   **Feature 2 (Programmer):**
        *   Title: "Jalur Programmer"
        *   Description: "Menguasai Web & App Development dengan AI Tools untuk membangun solusi digital yang inovatif."

*   **Facilities Summary:**
    *   **Title:** "Fasilitas Modern"
    *   **Items:** ["Ruang Kelas", "Lab Komputer", "Studio Foto & Podcast", "Asrama", "Internet"]

*   **Testimonials Section:**
    *   **Title:** "Apa Kata Mereka?"
    *   **Data (`testimonials` array):**
        *   { quote: "...", name: "Ahmad Fauzi", designation: "Santri Jalur Konten Kreator" }
        *   { quote: "...", name: "Siti Aisyah", designation: "Santri Jalur Programmer" }
        *   { quote: "...", name: "Yusuf Abdullah", designation: "Santri Jalur Konten Kreator" }
        *   { quote: "...", name: "Fatimah Az-Zahra", designation: "Santri Jalur Programmer" }
        *   { quote: "...", name: "Muhammad Iqbal", designation: "Santri Jalur Konten Kreator" }
        *   { quote: "...", name: "Dewi Lestari", designation: "Santri Jalur Programmer" }

*   **Contact Summary:**
    *   **Title:** "Siap Bergabung?"
    *   **Text:** "Hubungi kami untuk informasi pendaftaran dan konsultasi lebih lanjut."
    *   **CTA Button:** "WhatsApp Kami"

### 3.2. AboutPage.tsx

*   **Title:** "Tentang Kami"
*   **Subtitle:** "Mengenal lebih dalam Pondok Multimedia Munzalan Indonesia."
*   **Latar Belakang:** "Sejak 2012, Masjid Kapal Munzalan Indonesia melalui Gerakan Infaq Beras telah bermitra dengan ribuan pondok dan panti asuhan. Pada 2023, Pondok Multimedia Munzalan Indonesia resmi berdiri untuk membekali santri dengan skill multimedia modern."
*   **Visi:** "Menjadi pusat pendidikan tinggi di bidang multimedia berbasis pondok untuk santri dan penggerak dakwah."
*   **Misi:** ["Memperkuat pendidikan karakter & kepemimpinan.", "Membangun kolaborasi dengan lembaga dakwah dan industri.", "Menyediakan kurikulum terintegrasi multimedia dan ilmu Quran-Sunnah."]
*   **Tujuan Kami:** ["Membentuk generasi Qurani yang menguasai multimedia.", "Memberdayakan generasi muda melalui kerja & wirausaha.", "Mengubah mindset santri dari mustahik menjadi munfiq."]
*   **Struktur Pimpinan:**
    *   { role: "Pimpinan", name: "Yudi Suroto S.Sos" }
    *   { role: "Kabag Pendidikan", name: "Ahmad Asri Zalmi S.Sn" }
    *   { role: "Mentor Photo & Video", name: "Arif Roihan C.L.Q, S.H" }
    *   { role: "Staf Admin", name: "Faisal Nur Fajri" }
    *   { role: "Staf Admin", name: "Ria Rianti" }

### 3.3. ProgramPage.tsx

*   **Title:** "Program Kami"
*   **Subtitle:** "Kurikulum terintegrasi untuk masa depan digital santri."
*   **Jalur Konten Kreator:** "Fokus pada fotografi, videografi, desain grafis, copywriting & branding untuk membentuk kreator digital profesional yang mampu menghasilkan konten dakwah berkualitas tinggi."
*   **Jalur Programmer:** "Fokus pada pengembangan web & aplikasi dengan bantuan AI tools, meliputi UI/UX, front-end, back-end, dan automation untuk menciptakan solusi digital inovatif."
*   **Materi Tambahan:** ["Tahsin & Tahfidz", "Fiqih & Hadist", "Adab Kehidupan", "Public Speaking", "Digital Marketing"]

### 3.4. FacilitiesPage.tsx

*   **Title:** "Fasilitas Pondok"
*   **Subtitle:** "Menyediakan lingkungan belajar yang lengkap dan modern."
*   **Facilities List:** ["Ruang Kelas Modern", "Lab Komputer", "Studio Foto Profesional", "Ruang Podcast", "Mushola", "Perpustakaan", "Asrama Nyaman", "Internet Cepat", "Dapur Umum", "Mesin Cuci"]

### 3.5. TeachersPage.tsx

*   **Title:** "Tenaga Pengajar"
*   **Subtitle:** "Dibimbing oleh para ahli di bidangnya."
*   **Pengajar Tetap:** ["Sarjana Fotografi & Diskomvis lulusan ISI Yogyakarta", "Praktisi Industri Kreatif berpengalaman", "Ustadz Lulusan Pondok Pesantren terkemuka"]
*   **Pengajar Tamu:** "Setiap bulan kami menghadirkan tenaga ahli dari industri multimedia nasional sebagai pengajar tamu untuk memberikan wawasan dan pengetahuan terbaru dari dunia kerja profesional."

### 3.6. AdmissionsPage.tsx

*   **Title:** "Penerimaan Santri"
*   **Subtitle:** "Bergabunglah dengan kami untuk menjadi ahli multimedia Qurani."
*   **Target Peserta:** "Santri lulusan pondok pesantren dan penggerak dakwah yang siap menggabungkan ilmu agama dan keahlian multimedia untuk menyebarkan kebaikan di era digital."
*   **Kriteria:** ["Lulusan pondok pesantren atau penggerak dakwah.", "Usia 18-20 tahun.", "Bisa membaca Al-Quran dengan baik (hafalan nilai plus).", "Lolos seleksi tahunan untuk memilih 20 santri terbaik."]
*   **CTA Title:** "Daftar Sekarang"
*   **CTA Text:** "Jadilah bagian dari 20 santri terpilih tahun ini. Hubungi kami untuk memulai proses pendaftaran."
*   **CTA Button:** "Hubungi via WhatsApp"

### 3.7. ContactPage.tsx

*   **Title:** "Kontak & Lokasi"
*   **Subtitle:** "Kami siap menjawab pertanyaan Anda."
*   **Alamat:** "Jl. Parangtritis No.km 5, Jurug, BangunharjoKec, Kec. Sewon, Kabupaten Bantul, DIY 55187"
*   **WhatsApp:** "+62 882-2546-1230"
