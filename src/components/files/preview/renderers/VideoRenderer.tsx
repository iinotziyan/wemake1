
interface VideoRendererProps {
  file: any;
}

export const VideoRenderer = ({ file }: VideoRendererProps) => {
  if (!file.type.startsWith('video/') || !file.dataUrl) return null;

  return (
    <video
      src={file.dataUrl}
      controls
      className="max-w-full max-h-full"
    />
  );
};
