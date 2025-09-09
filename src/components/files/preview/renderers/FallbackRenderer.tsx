
interface FallbackRendererProps {
  file: any;
}

export const FallbackRenderer = ({ file }: FallbackRendererProps) => {
  return (
    <div className="text-center text-gray-400">
      <div className="text-6xl mb-4">📄</div>
      <p className="text-lg mb-2">{file.name}</p>
      <p className="text-sm">Preview not available for this file type</p>
    </div>
  );
};
