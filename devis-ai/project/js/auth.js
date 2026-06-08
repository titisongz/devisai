(function() {
  var TOKEN_KEY = 'devisai_token';
  var USER_KEY = 'devisai_user';

  window.checkAuth = async function() {
    let token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      const { data: { session } } = await getSupabaseClient().auth.getSession();
      if (!session) {
        window.location.href = 'login.html';
        return false;
      }
      token = session.access_token;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(session.user));
      return true;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiration = payload.exp * 1000;
      const cinqMinutes = 5 * 60 * 1000;

      if (Date.now() > expiration - cinqMinutes) {
        const { data, error } = await getSupabaseClient().auth.refreshSession();
        if (error || !data.session) {
          localStorage.clear();
          window.location.href = 'login.html';
          return false;
        }
        localStorage.setItem(TOKEN_KEY, data.session.access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.session.user));
      }
    } catch(e) {
      console.error('Erreur vérification token:', e);
    }

    demarrerRefreshAutomatique();
    return true;
  };

  function demarrerRefreshAutomatique() {
    setInterval(async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return;

      try {
        const { data, error } = await getSupabaseClient().auth.refreshSession();
        if (!error && data.session) {
          localStorage.setItem(TOKEN_KEY, data.session.access_token);
          localStorage.setItem(USER_KEY, JSON.stringify(data.session.user));
          localStorage.removeItem('devisai_companies_cache');
          localStorage.removeItem('devisai_companies_cache_time');
        }
      } catch(e) {
        console.error('Refresh automatique échoué:', e);
      }
    }, 50 * 60 * 1000);
  }

  window.logout = function() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = 'login.html';
  };

  window.getToken = function() {
    return localStorage.getItem(TOKEN_KEY);
  };

  window.refreshTokenIfNeeded = async function() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiration = payload.exp * 1000;
      const maintenant = Date.now();
      const cinqMinutes = 5 * 60 * 1000;

      if (expiration - maintenant < cinqMinutes) {
        const { data, error } = await getSupabaseClient().auth.refreshSession();
        if (error || !data.session) {
          localStorage.clear();
          window.location.href = 'login.html';
          return null;
        }
        localStorage.setItem(TOKEN_KEY, data.session.access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.session.user));
        return data.session.access_token;
      }
    } catch (e) {
      console.error('Erreur refresh token:', e);
    }

    return token;
  };

  window.getValidToken = async function() {
    return await window.refreshTokenIfNeeded();
  };

  window.getUser = function() {
    var u = localStorage.getItem(USER_KEY);
    return u ? JSON.parse(u) : null;
  };
})();

// Appliquer les préférences d'apparence sur toutes les pages
window.appliquerApparenceGlobale = function() {
  var app = JSON.parse(localStorage.getItem('devisai_apparence') || '{}');
  if (!app.theme && !app.color) return;

  var root = document.documentElement;

  // Thème
  var theme = app.theme;
  if (theme === 'system') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  if (theme === 'light') {
    root.style.setProperty('--bg', '#f0f2f5');
    root.style.setProperty('--bg2', '#ffffff');
    root.style.setProperty('--card', '#ffffff');
    root.style.setProperty('--text', '#1a1a2e');
    root.style.setProperty('--text2', '#555577');
    root.style.setProperty('--border', 'rgba(0,0,0,0.1)');
  } else if (theme === 'dark') {
    root.style.setProperty('--bg', '#0d0d2b');
    root.style.setProperty('--bg2', '#050514');
    root.style.setProperty('--card', '#1a1a4e');
    root.style.setProperty('--text', '#ffffff');
    root.style.setProperty('--text2', 'rgba(255,255,255,0.6)');
    root.style.setProperty('--border', 'rgba(255,255,255,0.08)');
  }

  // Couleur d'accent
  if (app.color) {
    root.style.setProperty('--accent', app.color);
    root.style.setProperty('--accent-hover', app.color + 'cc');
  }

  // Densité
  if (app.densite) {
    var padding = app.densite === 'compact' ? '0.4rem 0.8rem' : app.densite === 'spacieux' ? '1rem 1.5rem' : '0.7rem 1rem';
    root.style.setProperty('--row-padding', padding);
  }
};

// Appliquer immédiatement au chargement
document.addEventListener('DOMContentLoaded', function() {
  window.appliquerApparenceGlobale();
});
