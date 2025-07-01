import React, { ChangeEvent, DragEvent, FC, useState } from 'react';
import { FILE } from '../../constants';

export type FileUploadProps = {
  imageButton?: boolean;
  accept: string;
  hoverLabel?: string;
  dropLabel?: string;
  width?: string;
  height?: string;
  backgroundColor?: string;
  image?: {
    url: string;
    imageStyle?: {
      width?: string;
      height?: string;
    };
  };
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
  selectedFileName?: string;
};

export const FileUpload: FC<FileUploadProps> = ({
  accept,
  imageButton = false,
  hoverLabel = 'Click or drag to upload file',
  dropLabel = 'Drop file here',
  onChange,
  onDrop,
  selectedFileName,
  width = '100%',
  height = '60px',
  backgroundColor = '#f5f5f5',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [labelText, setLabelText] = useState(hoverLabel);

  const stopDefaults = (e: DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleDragEnter = (e: DragEvent) => {
    stopDefaults(e);
    setIsDragOver(true);
    setLabelText(dropLabel);
  };
  const handleDragLeave = (e: DragEvent) => {
    stopDefaults(e);
    setIsDragOver(false);
    setLabelText(hoverLabel);
  };
  const handleDragOver = (e: DragEvent) => {
    stopDefaults(e);
  };
  const handleDrop = (e: DragEvent<HTMLElement>) => {
    stopDefaults(e);
    setIsDragOver(false);
    setLabelText(hoverLabel);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.size > FILE.MAX_SIZE) {
        alert(`파일 크기는 ${FILE.MAX_SIZE / (1024 * 1024)}MB 이하여야 합니다.`);
        return;
      }
    }

    onDrop(e);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.size > FILE.MAX_SIZE) {
      alert(`파일 크기는 ${FILE.MAX_SIZE / (1024 * 1024)}MB 이하여야 합니다.`);
      event.target.value = '';
      return;
    }
    onChange(event);
  };

  return (
    <div
      className={`file-upload-container ${isDragOver ? 'drag-over' : ''}`}
      style={{
        width,
        height,
        backgroundColor: isDragOver ? '#e0e0e0' : backgroundColor,
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input onChange={handleChange} accept={accept} id='file-upload' type='file' className='file-upload-input' />
      <label htmlFor='file-upload' className='file-upload-label'>
        {selectedFileName ? selectedFileName : labelText}
      </label>
    </div>
  );
};
