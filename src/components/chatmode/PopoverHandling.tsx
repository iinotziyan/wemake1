
import { useState } from 'react';

export const usePopoverHandling = () => {
  const [attachPopoverOpen, setAttachPopoverOpen] = useState(false);
  const [modelPopoverOpen, setModelPopoverOpen] = useState(false);

  const handleModelMenuClick = (label: string) => {
    console.log(`Model selected: ${label}`);
    setModelPopoverOpen(false);
  };

  return {
    attachPopoverOpen,
    setAttachPopoverOpen,
    modelPopoverOpen,
    setModelPopoverOpen,
    handleModelMenuClick,
  };
};
