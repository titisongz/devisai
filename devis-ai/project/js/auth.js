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

// Badge forfait sidebar (toutes les pages)
document.addEventListener('DOMContentLoaded', function() {
  var forfait = localStorage.getItem('devisai_forfait') || 'freemium';
  var labels = { freemium: 'Freemium', pro: 'Pro', proplus: 'Pro+' };

  // Remplacer .user-email par badge forfait sur toutes les pages
  document.querySelectorAll('.user-email').forEach(function(el) {
    el.className = 'em user-forfait';
    el.innerHTML = '<span class="badge-forfait ' + forfait + '">' + (labels[forfait] || 'Freemium') + '</span>';
  });

  // Mettre à jour si déjà remplacé (ex: settings.html)
  document.querySelectorAll('.user-forfait .badge-forfait').forEach(function(el) {
    el.className = 'badge-forfait ' + forfait;
    el.textContent = labels[forfait] || 'Freemium';
  });
});
