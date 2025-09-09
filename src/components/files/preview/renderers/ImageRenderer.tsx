
interface ImageRendererProps {
  file: any;
}

export const ImageRenderer = ({ file }: ImageRendererProps) => {
  if (!file.type.startsWith('image/') || !file.dataUrl) return null;

  return (
    <img
      src={file.dataUrl}
      alt={file.name}
      className="max-w-full max-h-full object-contain"
    />
  );
};
