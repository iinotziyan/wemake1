
export interface RecentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: number;
  dataUrl?: string;
  content?: string;
  uploadedAt: number;
}

const RECENT_FILES_KEY = 'recent-files';
const MAX_RECENT_FILES = 50; // Increased from 10 to 50 to support 30+ files

export const saveRecentFile = async (file: File): Promise<string | null> => {
  try {
    const existingFiles = getRecentFiles();
    
    // Check if file already exists
    const existingIndex = existingFiles.findIndex(f => 
      f.name === file.name && f.size === file.size && f.lastModified === file.lastModified
    );
    
    let fileId: string;
    
    if (existingIndex !== -1) {
      // Update existing file timestamp
      existingFiles[existingIndex].uploadedAt = Date.now();
      fileId = existingFiles[existingIndex].id;
    } else {
      // Add new file
      const fileData = await serializeFile(file);
      fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const recentFile: RecentFile = {
        id: fileId,
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        uploadedAt: Date.now(),
        ...fileData
      };
      
      existingFiles.unshift(recentFile);
    }
    
    // Keep only the most recent files
    const recentFiles = existingFiles
      .sort((a, b) => b.uploadedAt - a.uploadedAt)
      .slice(0, MAX_RECENT_FILES);
    
    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(recentFiles));
    return fileId;
  } catch (error) {
    console.error('Error saving recent file:', error);
    return null;
  }
};

export const updateRecentFile = (fileId: string, updates: Partial<RecentFile>): boolean => {
  try {
    const existingFiles = getRecentFiles();
    const fileIndex = existingFiles.findIndex(f => f.id === fileId);
    
    if (fileIndex !== -1) {
      existingFiles[fileIndex] = { ...existingFiles[fileIndex], ...updates };
      localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(existingFiles));
      
      // Dispatch event to notify all components about the update
      window.dispatchEvent(new CustomEvent('recentFilesUpdated'));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating recent file:', error);
    return false;
  }
};

export const getRecentFiles = (): RecentFile[] => {
  try {
    const stored = localStorage.getItem(RECENT_FILES_KEY);
    if (!stored) return [];
    
    const files = JSON.parse(stored) as RecentFile[];
    return files.sort((a, b) => b.uploadedAt - a.uploadedAt);
  } catch (error) {
    console.error('Error retrieving recent files:', error);
    return [];
  }
};

export const removeRecentFile = (fileId: string): void => {
  try {
    const existingFiles = getRecentFiles();
    const filteredFiles = existingFiles.filter(f => f.id !== fileId);
    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(filteredFiles));
  } catch (error) {
    console.error('Error removing recent file:', error);
  }
};

export const clearRecentFiles = (): void => {
  try {
    localStorage.removeItem(RECENT_FILES_KEY);
  } catch (error) {
    console.error('Error clearing recent files:', error);
  }
};

const serializeFile = async (file: File): Promise<{ dataUrl?: string; content?: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (file.type === 'text/plain' || file.type === 'text/markdown') {
        resolve({ content: reader.result as string });
      } else {
        resolve({ dataUrl: reader.result as string });
      }
    };
    
    reader.onerror = reject;
    
    if (file.type === 'text/plain' || file.type === 'text/markdown') {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  });
};
