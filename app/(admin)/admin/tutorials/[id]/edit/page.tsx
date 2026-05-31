'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '../../../../../../lib/api';
import styles from '../../../../admin.module.css';
import tutStyles from '../../tutorials.module.css';

type InputMode = 'url' | 'upload';

/** Detect if a URL is a YouTube/Vimeo embed-able link */
function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  // Direct video file (mp4, webm, etc.)
  if (/\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url)) return url;
  // Cloudinary video
  if (url.includes('cloudinary.com') && url.includes('/video/')) return url;
  return null;
}

export default function EditTutorialPage() {
  const router = useRouter();
  const params = useParams();
  const tutorialId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Original saved URLs (for display / rollback)
  const [originalVideoUrl, setOriginalVideoUrl] = useState('');
  const [originalThumbUrl, setOriginalThumbUrl] = useState('');

  // Video state
  const [videoMode, setVideoMode] = useState<InputMode>('url');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Thumbnail state
  const [thumbMode, setThumbMode] = useState<InputMode>('url');
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState('');
  const [thumbUploading, setThumbUploading] = useState(false);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    duration: 0,
    price: 0,
    isPublished: false,
  });

  useEffect(() => {
    const fetchTutorial = async () => {
      try {
        const res = await api.getTutorialById(tutorialId);
        const tut = res.tutorial;
        if (!tut) { setNotFound(true); return; }
        setFormData({
          title: tut.title || '',
          description: tut.description || '',
          videoUrl: tut.videoUrl || '',
          thumbnailUrl: tut.thumbnailUrl || '',
          duration: tut.duration || 0,
          price: tut.price || 0,
          isPublished: tut.isPublished || false,
        });
        setOriginalVideoUrl(tut.videoUrl || '');
        setOriginalThumbUrl(tut.thumbnailUrl || '');
        if (tut.thumbnailUrl) setThumbPreview(tut.thumbnailUrl);
      } catch (err: any) {
        console.error('Failed to fetch tutorial:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTutorial();
  }, [tutorialId]);

  const handleVideoFile = async (file: File) => {
    setVideoFile(file);
    setVideoUploading(true);
    try {
      const fd = new FormData();
      fd.append('video', file);
      const res = await api.uploadTutorialVideo(fd);
      setFormData(prev => ({
        ...prev,
        videoUrl: res.videoUrl,
        duration: res.duration || prev.duration,
      }));
    } catch (err: any) {
      alert('Gagal upload video: ' + (err.message || 'Unknown error'));
      setVideoFile(null);
    } finally {
      setVideoUploading(false);
    }
  };

  const handleThumbFile = async (file: File) => {
    setThumbFile(file);
    setThumbPreview(URL.createObjectURL(file));
    setThumbUploading(true);
    try {
      const fd = new FormData();
      fd.append('thumbnail', file);
      const res = await api.uploadTutorialThumbnail(fd);
      setFormData(prev => ({ ...prev, thumbnailUrl: res.thumbnailUrl }));
    } catch (err: any) {
      alert('Gagal upload thumbnail: ' + (err.message || 'Unknown error'));
      setThumbFile(null);
      setThumbPreview(originalThumbUrl);
    } finally {
      setThumbUploading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.videoUrl) {
      alert('URL video atau file video wajib diisi.');
      return;
    }
    setSaving(true);
    try {
      await api.updateTutorial(tutorialId, {
        ...formData,
        duration: Number(formData.duration),
        price: Number(formData.price),
      });
      router.push('/admin/tutorials');
    } catch (err: any) {
      alert('Gagal memperbarui tutorial: ' + (err.message || 'Unknown error'));
      setSaving(false);
    }
  };

  const embedUrl = getEmbedUrl(formData.videoUrl);
  const isDirectVideo = formData.videoUrl && /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(formData.videoUrl);
  const isCloudinaryVideo = formData.videoUrl && formData.videoUrl.includes('cloudinary.com') && formData.videoUrl.includes('/video/');

  if (loading) {
    return (
      <div className={styles.pageContent}>
        <div className={tutStyles.loadingState}>
          <div className={tutStyles.spinner} />
          <span>Memuat data tutorial...</span>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className={styles.pageContent}>
        <div className={tutStyles.loadingState}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.4 }}>error_outline</span>
          <p>Tutorial tidak ditemukan.</p>
          <button className={tutStyles.cancelBtn} onClick={() => router.push('/admin/tutorials')}>
            Kembali ke Daftar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContent}>
      <div className={tutStyles.headerRow} style={{ marginBottom: '1.5rem' }}>
        <div>
          <button
            type="button"
            className={tutStyles.actionBtn}
            onClick={() => router.back()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--clr-primary)' }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Kembali ke Daftar Tutorial
          </button>
          <h1 className={styles.pageTitle}>Edit Tutorial</h1>
          <p className={styles.pageSubtitle}>Perbarui informasi tutorial #{tutorialId}</p>
        </div>
      </div>

      <div className={tutStyles.tableCard} style={{ padding: '2.5rem', maxWidth: '860px', background: '#fff' }}>
        <form onSubmit={handleUpdate} className={tutStyles.modalForm}>
          <div className={tutStyles.formGrid}>

            {/* Title */}
            <div className={`${tutStyles.formGroup} ${tutStyles.fullWidth}`}>
              <label className={tutStyles.label}>Judul Tutorial</label>
              <input
                className={tutStyles.input}
                required
                placeholder="Contoh: Cara Membuat Nasi Goreng Spesial"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className={`${tutStyles.formGroup} ${tutStyles.fullWidth}`}>
              <label className={tutStyles.label}>Deskripsi (Opsional)</label>
              <textarea
                className={tutStyles.textarea}
                placeholder="Deskripsi singkat tentang apa yang akan dipelajari..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* ── VIDEO ── */}
            <div className={`${tutStyles.formGroup} ${tutStyles.fullWidth}`}>
              <label className={tutStyles.label}>Video Tutorial</label>

              {/* Current video preview */}
              {originalVideoUrl && (
                <div className={tutStyles.mediaPreviewBlock}>
                  <div className={tutStyles.mediaPreviewLabel}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>play_circle</span>
                    Video Saat Ini
                  </div>
                  {embedUrl && !isDirectVideo && !isCloudinaryVideo ? (
                    <iframe
                      src={embedUrl}
                      className={tutStyles.videoEmbed}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Video preview"
                    />
                  ) : (formData.videoUrl && (isDirectVideo || isCloudinaryVideo)) ? (
                    <video
                      src={formData.videoUrl}
                      controls
                      className={tutStyles.videoEmbed}
                      style={{ background: '#000' }}
                    />
                  ) : (
                    <div className={tutStyles.videoEmbedFallback}>
                      <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--clr-outline)' }}>link</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--clr-on-surface-variant)', wordBreak: 'break-all' }}>
                        {formData.videoUrl}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Input tabs */}
              <div className={tutStyles.mediaChangeLabel}>
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span>
                Ganti Video
              </div>
              <div className={tutStyles.modeTabs}>
                <button type="button" className={`${tutStyles.modeTab} ${videoMode === 'url' ? tutStyles.modeTabActive : ''}`} onClick={() => setVideoMode('url')}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>link</span> URL
                </button>
                <button type="button" className={`${tutStyles.modeTab} ${videoMode === 'upload' ? tutStyles.modeTabActive : ''}`} onClick={() => setVideoMode('upload')}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>upload_file</span> Upload File
                </button>
              </div>

              {videoMode === 'url' ? (
                <input
                  className={tutStyles.input}
                  placeholder="https://youtube.com/watch?v=... atau URL video lainnya"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                />
              ) : (
                <div
                  className={tutStyles.dropzone}
                  onClick={() => videoInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('video/')) handleVideoFile(file);
                  }}
                >
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    style={{ display: 'none' }}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideoFile(f); }}
                  />
                  {videoUploading ? (
                    <div className={tutStyles.dropzoneUploading}>
                      <div className={tutStyles.spinner} />
                      <span>Mengupload video ke Cloudinary...</span>
                    </div>
                  ) : videoFile ? (
                    <div className={tutStyles.dropzoneDone}>
                      <span className="material-symbols-outlined" style={{ color: '#16a34a', fontSize: '28px' }}>check_circle</span>
                      <div>
                        <div className={tutStyles.dropzoneFileName}>{videoFile.name}</div>
                        <div className={tutStyles.dropzoneFileSize}>{(videoFile.size / 1024 / 1024).toFixed(2)} MB · Berhasil diupload</div>
                      </div>
                      <button type="button" className={tutStyles.dropzoneChange} onClick={(e) => {
                        e.stopPropagation();
                        setVideoFile(null);
                        setFormData(p => ({ ...p, videoUrl: originalVideoUrl }));
                      }}>
                        Batalkan
                      </button>
                    </div>
                  ) : (
                    <div className={tutStyles.dropzoneEmpty}>
                      <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--clr-outline)' }}>video_file</span>
                      <span>Klik atau drag & drop file video baru</span>
                      <span className={tutStyles.dropzoneHint}>MP4, WebM, MOV — maks 500MB</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── THUMBNAIL ── */}
            <div className={`${tutStyles.formGroup} ${tutStyles.fullWidth}`}>
              <label className={tutStyles.label}>Thumbnail</label>

              {/* Current thumbnail preview */}
              {originalThumbUrl && (
                <div className={tutStyles.mediaPreviewBlock}>
                  <div className={tutStyles.mediaPreviewLabel}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>image</span>
                    Thumbnail Saat Ini
                  </div>
                  <div className={tutStyles.thumbPreviewLarge}>
                    <img
                      src={thumbPreview || originalThumbUrl}
                      alt="Thumbnail"
                      className={tutStyles.thumbPreviewImg}
                    />
                  </div>
                </div>
              )}

              {/* Input tabs */}
              <div className={tutStyles.mediaChangeLabel}>
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span>
                Ganti Thumbnail
              </div>
              <div className={tutStyles.modeTabs}>
                <button type="button" className={`${tutStyles.modeTab} ${thumbMode === 'url' ? tutStyles.modeTabActive : ''}`} onClick={() => setThumbMode('url')}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>link</span> URL
                </button>
                <button type="button" className={`${tutStyles.modeTab} ${thumbMode === 'upload' ? tutStyles.modeTabActive : ''}`} onClick={() => setThumbMode('upload')}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>upload_file</span> Upload Gambar
                </button>
              </div>

              {thumbMode === 'url' ? (
                <input
                  className={tutStyles.input}
                  placeholder="https://... (kosongkan untuk pakai gambar resep)"
                  value={formData.thumbnailUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, thumbnailUrl: e.target.value });
                    setThumbPreview(e.target.value);
                  }}
                />
              ) : (
                <div
                  className={tutStyles.dropzone}
                  onClick={() => thumbInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) handleThumbFile(file);
                  }}
                >
                  <input
                    ref={thumbInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleThumbFile(f); }}
                  />
                  {thumbUploading ? (
                    <div className={tutStyles.dropzoneUploading}>
                      <div className={tutStyles.spinner} />
                      <span>Mengupload thumbnail...</span>
                    </div>
                  ) : thumbFile ? (
                    <div className={tutStyles.dropzoneDone}>
                      <img src={thumbPreview} alt="preview" className={tutStyles.thumbPreview} />
                      <div>
                        <div className={tutStyles.dropzoneFileName}>{thumbFile.name}</div>
                        <div className={tutStyles.dropzoneFileSize}>{(thumbFile.size / 1024 / 1024).toFixed(2)} MB · Berhasil diupload</div>
                      </div>
                      <button type="button" className={tutStyles.dropzoneChange} onClick={(e) => {
                        e.stopPropagation();
                        setThumbFile(null);
                        setThumbPreview(originalThumbUrl);
                        setFormData(p => ({ ...p, thumbnailUrl: originalThumbUrl }));
                      }}>
                        Batalkan
                      </button>
                    </div>
                  ) : (
                    <div className={tutStyles.dropzoneEmpty}>
                      <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--clr-outline)' }}>add_photo_alternate</span>
                      <span>Klik atau drag & drop gambar thumbnail baru</span>
                      <span className={tutStyles.dropzoneHint}>JPG, PNG, WebP — maks 10MB</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Duration */}
            <div className={tutStyles.formGroup}>
              <label className={tutStyles.label}>Durasi (Menit)</label>
              <input
                type="number"
                className={tutStyles.input}
                required
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              />
            </div>

            {/* Price */}
            <div className={tutStyles.formGroup}>
              <label className={tutStyles.label}>Harga (Rp)</label>
              <input
                type="number"
                className={tutStyles.input}
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              />
            </div>

            {/* Is Published */}
            <div className={`${tutStyles.fullWidth} ${tutStyles.checkboxGroup}`}>
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              />
              <label htmlFor="isPublished">Publikasikan tutorial</label>
            </div>

          </div>

          <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--clr-outline-variant)' }}>
            <button type="button" className={tutStyles.cancelBtn} onClick={() => router.back()}>
              Batal
            </button>
            <button type="submit" className={tutStyles.saveBtn} disabled={saving || videoUploading || thumbUploading}>
              {saving ? (
                <><span className={tutStyles.spinner} style={{ width: '16px', height: '16px', borderWidth: '2px' }} />Menyimpan...</>
              ) : (
                <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>Simpan Perubahan</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
