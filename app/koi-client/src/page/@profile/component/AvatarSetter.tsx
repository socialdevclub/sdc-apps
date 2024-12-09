import { useAtomValue } from 'jotai';
import { useRef, useState } from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { UserStore } from '../../../store';
import { Query } from '../../../hook';
import { supabase } from '../../../library/supabase';
import useHover from '../../../hook/useHover';

export default function AvatarSetter() {
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const avatarImageRef = useRef<HTMLSpanElement>(null);
  const isHover = useHover(avatarImageRef);

  const { data: avatarUrl, refetch } = Query.Supabase.useQueryAvatarUrl({ supabaseSession });

  const [uploading, setUploading] = useState(false);

  const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    try {
      setUploading(true);

      if (!supabaseSession?.user) return;

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const updates = {
        avatar_url: filePath,
        id: supabaseSession.user.id,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) {
        throw error;
      }

      refetch();
    } catch (error) {
      alert(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Avatar
        ref={avatarImageRef}
        size={96}
        src={avatarUrl}
        icon={<UserOutlined />}
        style={{
          cursor: isHover ? 'pointer' : 'default',
        }}
        onClick={() => {
          if (avatarInputRef.current) {
            avatarInputRef.current.click();
          }
        }}
      />
      <input
        ref={avatarInputRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
        }}
        type="file"
        id="single"
        accept="image/*"
        onChange={uploadAvatar}
        disabled={uploading}
      />
    </>
  );
}
