import React, { useState, useRef } from 'react';
import { X, Camera, Save, User, MapPin, Link, FileText, Tag } from 'lucide-react';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    displayName: string;
    bio?: string;
    location?: string;
    website?: string;
    avatar?: string;
    coverImage?: string;
    tags: string[];
  };
  onSave: (updatedProfile: any) => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave
}) => {
  const [formData, setFormData] = useState({
    displayName: profile.displayName,
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
    tags: profile.tags.join(', ')
  });
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar);
  const [coverPreview, setCoverPreview] = useState(profile.coverImage);
  const [isLoading, setIsLoading] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (type: 'avatar' | 'cover', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'avatar') {
        setAvatarPreview(result);
      } else {
        setCoverPreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updatedProfile = {
        ...profile,
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        avatar: avatarPreview,
        coverImage: coverPreview
      };
      await onSave(updatedProfile);
      onClose();
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-gray)' }}>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>编辑个人资料</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Cover Image */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              封面图片
            </label>
            <div className="relative">
              <div
                className="h-32 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                style={{
                  backgroundImage: coverPreview ? `url(${coverPreview})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
                onClick={() => coverInputRef.current?.click()}
              >
                {!coverPreview && (
                  <div className="text-center">
                    <Camera size={32} className="text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">点击上传封面图片</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-white" />
                </div>
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload('cover', file);
                }}
              />
            </div>
          </div>

          {/* Avatar */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              头像
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={avatarPreview || '/default-avatar.png'}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
                <button
                  className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <Camera size={12} className="text-white" />
                </button>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload('avatar', file);
                }}
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                <User size={16} className="inline mr-1" />
                显示名称
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  borderColor: 'var(--border-gray)'
                } as React.CSSProperties}
                placeholder="输入您的显示名称"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                <FileText size={16} className="inline mr-1" />
                个人简介
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none"
                style={{ 
                  borderColor: 'var(--border-gray)'
                } as React.CSSProperties}
                rows={3}
                maxLength={150}
                placeholder="介绍一下自己..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.bio.length}/150
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                <MapPin size={16} className="inline mr-1" />
                位置
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  borderColor: 'var(--border-gray)'
                } as React.CSSProperties}
                placeholder="您的位置"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                <Link size={16} className="inline mr-1" />
                网站
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  borderColor: 'var(--border-gray)'
                } as React.CSSProperties}
                placeholder="https://your-website.com"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                <Tag size={16} className="inline mr-1" />
                标签
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  borderColor: 'var(--border-gray)'
                } as React.CSSProperties}
                placeholder="旅行, 摄影, 美食 (用逗号分隔)"
              />
              <p className="text-xs text-gray-500 mt-1">
                用逗号分隔多个标签
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t" style={{ borderColor: 'var(--border-gray)' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            style={{ backgroundColor: 'var(--profile-primary)' }}
          >
            <Save size={16} />
            {isLoading ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;