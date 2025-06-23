import React, { ChangeEvent, DragEvent, FC, useState } from 'react';

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
    onDrop(e);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event);
  };

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: isDragOver ? '#e0e0e0' : backgroundColor,
        border: isDragOver ? '2px solid #1976d2' : '2px dashed #bdbdbd',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative',
        fontSize: '1rem',
        color: '#333',
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input onChange={handleChange} accept={accept} id='file-upload' type='file' style={{ display: 'none' }} />
      <label
        htmlFor='file-upload'
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        {selectedFileName ? selectedFileName : labelText}
      </label>
    </div>
  );
};
