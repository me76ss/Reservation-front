const BASE_URL = 'http://localhost:8000';
// const BASE_URL = 'http://192.168.43.87:8000';

$(document).ready(function() {
  var loginForm = $('#login-form');
  loginForm.on('submit', function(event) {
    event.preventDefault();
    var data = $('#login-form')
      .serializeArray()
      .reduce(function(obj, item) {
        obj[item.name] = item.value;
        return obj;
      }, {});

    login(data);
  });

  var regForm = $('#register-form');
  regForm.on('submit', function(event) {
    event.preventDefault();
    var data = $('#register-form')
      .serializeArray()
      .reduce(function(obj, item) {
        obj[item.name] = item.value;
        return obj;
      }, {});

    register(data);
  });
});

function login(data) {
  console.log('TCL: data', data);
  $.ajax({
    type: 'POST',
    url: `${BASE_URL}/user/login`,
    data: JSON.stringify(data),
    dataType: 'json',
    contentType: 'application/json;charset=utf-8',
    success: function(msg) {
      console.log('TCL: loadPage -> msg', msg);
      localStorage.setItem('token', msg.token);
      location.href = '/';
    }
  });
}

function register(data) {
  console.log('TCL: data', data);
  $.ajax({
    type: 'POST',
    url: `${BASE_URL}/user/register`,
    data: JSON.stringify(data),
    dataType: 'json',
    contentType: 'application/json;charset=utf-8',
    success: function(msg) {
      console.log('TCL: loadPage -> msg', msg);
      // localStorage.setItem('token', msg.token);
      location.href = '/login.html';
    }
  });
}
