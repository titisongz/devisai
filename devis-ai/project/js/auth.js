(function() {
  var TOKEN_KEY = 'devisai_token';
  var USER_KEY = 'devisai_user';

  window.checkAuth = function() {
    if (!localStorage.getItem(TOKEN_KEY)) {
      window.location.href = 'login.html';
    }
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
