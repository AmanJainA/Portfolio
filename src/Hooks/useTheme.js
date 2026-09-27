// src/Hooks/useTheme.js
import { useEffect } from 'react';
import Cookies from 'js-cookie';

const useTheme = () => {
  useEffect(() => {
    const modeToggler = document.getElementById('darkmode');
    const documentBody = document.body;

    const setThemeFromCookie = () => {
      if (Cookies.get('mode') === 'light-mode') {
        documentBody.classList.add('light-mode');
        if (modeToggler) modeToggler.checked = true;
        console.log('Cookie: light mode');
      } else {
        documentBody.classList.remove('light-mode');
        if (modeToggler) modeToggler.checked = false;
        console.log('Cookie: dark mode (default)');
      }
    };

    setThemeFromCookie();

    if (modeToggler) {
      modeToggler.addEventListener('change', () => {
        if (modeToggler.checked) {
          documentBody.classList.add('light-mode');
          Cookies.set('mode', 'light-mode', { expires: 7 });
          console.log('change to light mode');
        } else {
          documentBody.classList.remove('light-mode');
          Cookies.remove('mode');
          console.log('change to default dark mode');
        }
      });
    }

    // Cleanup listener on unmount
    return () => {
      if (modeToggler) {
        modeToggler.removeEventListener('change', () => {});
      }
    };
  }, []);
};

export default useTheme;
