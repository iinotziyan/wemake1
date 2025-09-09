
import { useFileRenderer } from './hooks/useFileRenderer';
import { ImageRenderer } from './renderers/ImageRenderer';
import { VideoRenderer } from './renderers/VideoRenderer';
import { AudioRenderer } from './renderers/AudioRenderer';
import { TextRenderer } from './renderers/TextRenderer';
import { PDFRenderer } from './renderers/PDFRenderer';
import { FallbackRenderer } from './renderers/FallbackRenderer';

interface FileRendererProps {
  file: any;
  isChatVisible: boolean;
  isEditing?: boolean;
  onEditStart?: () => void;
  onEditEnd?: () => void;
}

export const FileRenderer = ({ file, isChatVisible, isEditing, onEditStart, onEditEnd }: FileRendererProps) => {
  const {
    editContent,
    setEditContent,
    currentFileContent,
    isAnimatingContent,
    animatedContent,
    handleAnimationComplete
  } = useFileRenderer(file, isEditing, onEditEnd);

  if (!file) return null;

  // Try each renderer in order
  const imageRenderer = <ImageRenderer file={file} />;
  if (imageRenderer.props.file.type.startsWith('image/') && imageRenderer.props.file.dataUrl) {
    return imageRenderer;
  }

  const videoRenderer = <VideoRenderer file={file} />;
  if (videoRenderer.props.file.type.startsWith('video/') && videoRenderer.props.file.dataUrl) {
    return videoRenderer;
  }

  const audioRenderer = <AudioRenderer file={file} />;
  if (audioRenderer.props.file.type.startsWith('audio/') && audioRenderer.props.file.dataUrl) {
    return audioRenderer;
  }

  const textRenderer = (
    <TextRenderer 
      file={file}
      isEditing={isEditing || false}
      editContent={editContent}
      currentFileContent={currentFileContent}
      isAnimatingContent={isAnimatingContent}
      animatedContent={animatedContent}
      onEditContentChange={setEditContent}
      onAnimationComplete={handleAnimationComplete}
    />
  );
  if ((file.type === 'text/plain' || file.type === 'text/markdown') && (currentFileContent || file.content || isAnimatingContent || isEditing)) {
    return textRenderer;
  }

  const pdfRenderer = <PDFRenderer file={file} />;
  if (pdfRenderer.props.file.type.includes('pdf') && pdfRenderer.props.file.dataUrl) {
    return pdfRenderer;
  }

  return <FallbackRenderer file={file} />;
};
