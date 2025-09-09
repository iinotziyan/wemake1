
interface AudioRendererProps {
  file: any;
}

export const AudioRenderer = ({ file }: AudioRendererProps) => {
  if (!file.type.startsWith('audio/') || !file.dataUrl) return null;

  return (
    <div className="text-center">
      <div className="text-6xl mb-4">🎵</div>
      <p className="text-white mb-4">{file.name}</p>
      <audio src={file.dataUrl} controls className="w-full max-w-md" />
    </div>
  );
};
