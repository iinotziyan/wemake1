
import CustomSlider from '../../../sidebar/CustomSlider';

interface PDFRendererProps {
  file: any;
}

export const PDFRenderer = ({ file }: PDFRendererProps) => {
  if (!file.type.includes('pdf') || !file.dataUrl) return null;

  return (
    <div className="w-full h-full">
      <CustomSlider isOpen={true} className="w-full h-full">
        <iframe
          src={file.dataUrl}
          className="w-full h-full"
          title={file.name}
        />
      </CustomSlider>
    </div>
  );
};
