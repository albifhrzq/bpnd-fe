import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StickerAuthRedirect = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const handleRedirect = async () => {
      const stickerUrl = `https://78a3733e6e29.ngrok-free.app/sticker-view/${id}`; // ✅ arahkan ke halaman sticker yang benar
      localStorage.setItem('redirectAfterLogin', stickerUrl);

      if (user) {
        console.log('🔁 User masih login, logout dulu...');
        await logout();
        console.log('✅ Logout selesai, siap login ulang.');
      }

      console.log('➡️ Pindah ke halaman login...');
      navigate('/', { replace: true });
    };

    handleRedirect();
  }, [user, logout, navigate, id]);

  return null;
};

export default StickerAuthRedirect;
