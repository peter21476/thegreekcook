import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { API_CONFIG } from '../config';

const ProfilePictureUpload = ({ onImageUpload, currentImage = '', className = '' }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    uploadImage(file);
  };

  const uploadImage = async (file) => {
    setUploading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/upload/profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || 'Upload failed');
        } catch (parseError) {
          throw new Error(`Upload failed: ${errorText}`);
        }
      }

      const data = await response.json();
      
      if (data.success) {
        setPreview(data.url);
        onImageUpload(data.url);
        toast.success('Profile picture uploaded successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Error uploading profile picture');
      setPreview(currentImage); // Reset to current image
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview('');
    onImageUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`profile-picture-upload ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      <div className="profile-picture-container">
        {preview ? (
          <div className="profile-picture-preview">
            <img src={preview} alt="Profile" />
            <div className="profile-picture-overlay">
              <button
                type="button"
                onClick={handleClick}
                className="btn btn-primary btn-sm"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Change'}
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="btn btn-danger btn-sm"
                disabled={uploading}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-picture-placeholder" onClick={handleClick}>
            <div className="profile-picture-icon">👤</div>
            <p>Add Photo</p>
            {uploading && <p className="uploading-text">Uploading...</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePictureUpload;
