(function() {
  var TOKEN_KEY = 'devisai_token';
  var USER_KEY = 'devisai_user';

  window.checkAuth = async function() {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) return true;

    const { data: { session } } = await getSupabaseClient().auth.getSession();

    if (session) {
      localStorage.setItem(TOKEN_KEY, session.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(session.user));
      return true;
    }

    window.location.href = 'login.html';
    return false;
  };

  window.logout = function() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = 'login.html';
  };

  window.getToken = function() {
    return localStorage.getItem(TOKEN_KEY);
  };

  window.getUser = function() {
    var u = localStorage.getItem(USER_KEY);
    return u ? JSON.parse(u) : null;
  };
})();
