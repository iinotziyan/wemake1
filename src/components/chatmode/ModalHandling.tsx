
import { useState } from 'react';

export const useModalHandling = () => {
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [txtPreviewFile, setTxtPreviewFile] = useState<File | null>(null);
  const [textContentDialogOpen, setTextContentDialogOpen] = useState(false);

  const closePreview = () => {
    setPreviewFile(null);
  };

  const closeTxtPreview = () => {
    setTxtPreviewFile(null);
  };

  return {
    previewFile,
    setPreviewFile,
    txtPreviewFile,
    setTxtPreviewFile,
    textContentDialogOpen,
    setTextContentDialogOpen,
    closePreview,
    closeTxtPreview,
  };
};
