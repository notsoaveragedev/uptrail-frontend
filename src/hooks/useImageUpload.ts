import { useEffect, useRef, useState } from "react";
import { useToast } from "./useToast";

type ImageUploadOptions = {
  label: string;
  maxBytes: number;
  onUploaded: (url: string) => void;
};

export function useImageUpload({ label, maxBytes, onUploaded }: ImageUploadOptions) {
  const toast = useToast();
  const [progress, setProgress] = useState<number | null>(null);
  const timerRef = useRef<number>(undefined);

  useEffect(() => () => window.clearInterval(timerRef.current), []);

  function upload(file: File) {
    if (!file.type.startsWith("image/")) return toast.error("That file isn't an image", "Use a PNG, SVG or JPG.");
    if (file.size > maxBytes) {
      return toast.error(`${label} is too large`, `Keep it under ${Math.round(maxBytes / 1024 / 1024)} MB.`);
    }
    window.clearInterval(timerRef.current);
    let percent = 0;
    setProgress(percent);
    timerRef.current = window.setInterval(() => {
      percent += 20;
      if (percent < 100) return setProgress(percent);
      window.clearInterval(timerRef.current);
      setProgress(null);
      onUploaded(URL.createObjectURL(file));
      toast.success(`${label} uploaded`, file.name);
    }, 150);
  }

  return { progress, upload };
}
