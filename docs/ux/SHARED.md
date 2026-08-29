# PMMI UX Wireframe - Shared Pages

### G01 - SHARED - Login

**Route:** `app.pondokmultimedia.id/login`

**Goal:** Masuk dengan cepat, menjelaskan konteks role tanpa membocorkan detail teknis.

```text
+--------------------------------------------------------------------------------+
| PMMI DIGITAL CAMPUS                                      Bantuan / Status Sistem |
|--------------------------------------------------------------------------------|
|                                                                                |
|             [ Logo PMMI ]                                                       |
|             Selamat datang kembali                                             |
|             Kelola belajar, mengajar, dan operasional pondok.                   |
|                                                                                |
|             Email                                                              |
|             [ nama@...________________________________ ]                        |
|             Password                                                           |
|             [ **************************************** ] [lihat]                |
|             [ Masuk ke Digital Campus ]                                         |
|                                                                                |
|             Lupa akses? Hubungi admin pondok.                                   |
|                                                                                |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Setelah login redirect berdasarkan role ke overview masing-masing.
- Jangan tampilkan role selector; role berasal dari akun.
- Error login ditulis manusiawi, bukan raw API error.
- Rate-limit/error server dibedakan dari password salah.

### G02 - SHARED - Profil & Keamanan Akun

**Route:** `/account`

**Goal:** Satu halaman shared untuk profil, password, channel identity, dan sessions dasar.

```text
+--------------------------------------------------------------------------------+
| Profil & Keamanan                                                               |
| [Profile] [Security] [Connected Channels]                                       |
|--------------------------------------------------------------------------------|
| Nama / email (email changes require admin policy)                               |
| Change password [Current] [New] [Confirm]                                       |
| Connected: Email verified • Telegram linked • WhatsApp pending                  |
| [Logout this device]                                                            |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Role/lifecycle read-only.
- Tidak ada self-service privilege escalation.
- Dangerous account state remains admin-controlled.
