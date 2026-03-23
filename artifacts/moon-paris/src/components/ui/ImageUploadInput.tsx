import React, { useRef, useState } from 'react';
import { ImageIcon, X, UploadCloud, Loader } from 'lucide-react';

const MAX_WIDTH = 800;
const JPEG_QUALITY = 0.85;

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > MAX_WIDTH) {
          h = Math.round((h * MAX_WIDTH) / w);
          w = MAX_WIDTH;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

interface Props {
  value: string;
  onChange: (base64: string) => void;
}

export function ImageUploadInput({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    try {
      const base64 = await resizeImage(file);
      onChange(base64);
    } catch {
      // silent
    } finally {
      setProcessing(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const clear = () => onChange('');

  const isBase64 = value?.startsWith('data:');
  const isUrl = value?.startsWith('http');

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {/* Preview */}
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-background/50">
          <img
            src={value}
            alt="preview"
            className="w-full max-h-48 object-contain p-2"
          />
          <button
            type="button"
            onClick={clear}
            className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-destructive transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          {isBase64 && (
            <div className="absolute bottom-2 right-2 bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-500/30">
              مرفوعة ✓
            </div>
          )}
          {isUrl && (
            <div className="absolute bottom-2 right-2 bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
              رابط خارجي
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={processing}
          className="w-full h-32 rounded-xl border-2 border-dashed border-white/10 hover:border-primary/50 bg-background/30 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
        >
          {processing ? (
            <>
              <Loader className="w-6 h-6 animate-spin" />
              <span className="text-xs">جاري المعالجة...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-7 h-7" />
              <span className="text-sm font-medium">اضغط لرفع صورة</span>
              <span className="text-xs opacity-60">من المعرض أو الكاميرا</span>
            </>
          )}
        </button>
      )}

      {/* Change button when image exists */}
      {value && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={processing}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-white/10 hover:border-primary/40 text-sm text-muted-foreground hover:text-primary transition-all"
        >
          {processing ? <Loader className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
          {processing ? 'جاري المعالجة...' : 'تغيير الصورة'}
        </button>
      )}
    </div>
  );
}
