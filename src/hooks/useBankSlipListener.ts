import { useState, useEffect } from "react";

export function useBankSlipListener() {
  const [isSlipScanOpen, setIsSlipScanOpen] = useState<boolean>(false);
  const [slipInitialFiles, setSlipInitialFiles] = useState<(File | string)[]>([]);

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        e.preventDefault();
        setSlipInitialFiles(files);
        setIsSlipScanOpen(true);
      }
    };

    const handleGlobalDrop = (e: DragEvent) => {
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const imageFiles: File[] = [];
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          const f = e.dataTransfer.files[i];
          if (f.type.startsWith("image/")) {
            imageFiles.push(f);
          }
        }
        if (imageFiles.length > 0) {
          e.preventDefault();
          setSlipInitialFiles(imageFiles);
          setIsSlipScanOpen(true);
        }
      }
    };

    const handleGlobalDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes("Files")) {
        e.preventDefault();
      }
    };

    window.addEventListener("paste", handleGlobalPaste);
    window.addEventListener("drop", handleGlobalDrop);
    window.addEventListener("dragover", handleGlobalDragOver);
    return () => {
      window.removeEventListener("paste", handleGlobalPaste);
      window.removeEventListener("drop", handleGlobalDrop);
      window.removeEventListener("dragover", handleGlobalDragOver);
    };
  }, []);

  const openSlipScan = (initialFiles: (File | string)[] = []) => {
    setSlipInitialFiles(initialFiles);
    setIsSlipScanOpen(true);
  };

  const closeSlipScan = () => {
    setIsSlipScanOpen(false);
    setSlipInitialFiles([]);
  };

  return {
    isSlipScanOpen,
    setIsSlipScanOpen,
    slipInitialFiles,
    setSlipInitialFiles,
    openSlipScan,
    closeSlipScan,
  };
}
