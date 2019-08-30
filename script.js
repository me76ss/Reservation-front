const BASE_URL = 'http://localhost:8000';
var default_content = '';
var token = localStorage.getItem('token');

$(document).ready(function() {
  if (!token) {
    location.href = '/login.html';
    return;
  }
  checkURL();
  $('ul li a').click(function(e) {
    checkURL(this.hash);
  });

  //filling in the default content
  default_content = $('#pageContent').html();

  setInterval('checkURL()', 200);
});

var lasturl = '';

function checkURL(hash) {
  if (!hash) hash = window.location.hash;

  if (hash == '') {
    location.href = '#page1';
    return;
  }
  console.log('TCL: checkURL -> hash', hash, lasturl);
  if (hash != lasturl) {
    lasturl = hash;

    // FIX - if we've used the history buttons to return to the homepage,
    // fill the pageContent with the default_content

    if (hash == '') {
      location.href = '#page1';
    } else loadPage(hash);
  }
}

function loadPage(url) {
  url = url.replace('#page', '');

  $('#loading').css('visibility', 'visible');

  $.ajax({
    type: 'GET',
    url: `pages/page_${url}.html`,
    // data: 'page=' + url,
    // dataType: 'html',
    success: function(msg) {
      console.log('TCL: loadPage -> msg', msg);
      // if (parseInt(msg) != 0) {
      $('#pageContent').html(msg);
      setTimeout(() => {
        console.log('TCL: loadPage -> url', url);
        if (url === '1') getPanelData();
        if (url === '2') getProfile();
      }, 100);
      //   $('#loading').css('visibility', 'hidden');
      // }
    }
  });
}

function getPanelData() {
  getProgramList();
  getReservedList();
}

function getReservedList() {
  $.ajax({
    type: 'GET',
    url: `${BASE_URL}/programs/reserves`,
    // data: 'page=' + url,
    // dataType: 'html',
    headers: { Authorization: `token ${token}` },
    success: function(msg) {
      console.log('TCL: getPanelData -> msg', msg);

      msg.forEach(r => {
        var slot = r.slot;
        var html = `<div class="reserved">
				<h3>${slot.program.name}</h3>
				<div>
					شروع: ${slot.program.starts_at} <br>
					پایان: ${slot.program.ends_at}
				</div>
				<h6>اسلات رزرو شده</h6>
				<div>
					شروع: ${slot.starts_at} <br>
					پایان: ${slot.ends_at}
					<button onclick="onDeleteReserve(${r.id})">حذف رزرو</button>
				</div>
			</div>`;

        var div = document.createElement('div');
        div.innerHTML = html;
        $('.reserves').append(div);
      });
      // console.log('TCL: loadPage -> msg', msg);
      // if (parseInt(msg) != 0) {
      // $('#pageContent').html(msg);
      //   $('#loading').css('visibility', 'hidden');
      // }
    }
  });
}

function getProgramList() {
  console.log('TCL: getPanelData -> token', token);

  $.ajax({
    type: 'GET',
    url: `${BASE_URL}/programs`,
    // data: 'page=' + url,
    // dataType: 'html',
    headers: { Authorization: `token ${token}` },
    success: function(msg) {
      console.log('TCL: getPanelData -> msg', msg);
      // console.log('TCL: loadPage -> msg', msg);
      // if (parseInt(msg) != 0) {
      // $('#pageContent').html(msg);
      //   $('#loading').css('visibility', 'hidden');
      // }
      msg.forEach(r => {
        var slots = msg.slots.reduce((result, slot) => {
          return `${result}<div class="slot">
          ظرفیت: ${slot.capacity} <br>
          رزرو شده: ${slot.reserve} <br>
          شروع: ${slot.starts_at} <br>
          پایان: ${slot.ends_at} <br>
          <button onclick="onReserve(${r.id}, ${slot.id})">رزرو</button>
        </div>`;
        }, '');

        var html = `<div class="program">
          <h3>${r.name}</h3>
          <div>
            شروع: ${r.starts_at} <br>
            پایان: ${r.ends_at}
          </div>
          <div class="p-slots">${slots}</div>
        </div>`;

        var div = document.createElement('div');
        div.innerHTML = html;
        $('.programs').append(div);
      });
    },
    error: function(xhr, ajaxOptions, thrownError) {
      alert(`Error status: ${xhr.status}, Message: ${thrownError}`);
    }
  });
}

function getProfile() {
  $.ajax({
    type: 'GET',
    url: `${BASE_URL}/user/profile`,
    // data: 'page=' + url,
    // dataType: 'html',
    headers: { Authorization: `token ${token}` },
    success: function(msg) {
      console.log('TCL: getPanelData -> msg', msg);
      // console.log('TCL: loadPage -> msg', msg);
      // if (parseInt(msg) != 0) {
      // $('#pageContent').html(msg);
      //   $('#loading').css('visibility', 'hidden');
      // }
      var user = msg.user;
      var html = `<div class="profile">
				
				<table>
      <tr>
        <td>نام</td>
        <td>${user.first_name}</td>
      </tr>
      <tr>
        <td>نام خانوادگی</td>
        <td>${user.last_name}</td>
      </tr>
      <tr>
        <td>ایمیل</td>
        <td>${user.email}</td>
      </tr>
      <tr>
        <td>نام کاربری</td>
        <td>${user.username}</td>
      </tr>
    </table>


			</div>`;

      var div = document.createElement('div');
      div.innerHTML = html;
      $('.profile-c').append(div);
    },
    error: function(xhr, ajaxOptions, thrownError) {
      alert(`Error status: ${xhr.status}, Message: ${thrownError}`);
    }
  });
}

function onDeleteReserve(id) {
  $.ajax({
    type: 'DELETE',
    url: `${BASE_URL}/programs/reserves/${id}`,
    // data: 'page=' + url,
    // dataType: 'html',
    headers: { Authorization: `token ${token}` },
    success: function(msg) {
      location.href = '/';
    },
    error: function(xhr, ajaxOptions, thrownError) {
      alert(`Error status: ${xhr.status}, Message: ${thrownError}`);
    }
  });
}

function onReserve(pid, sid) {
  $.ajax({
    type: 'POST',
    url: `${BASE_URL}/programs/${pid}/slots/${sid}`,
    // data: 'page=' + url,
    // dataType: 'html',
    headers: { Authorization: `token ${token}` },
    success: function(msg) {
      location.href = '/';
    },
    error: function(xhr, ajaxOptions, thrownError) {
      alert(`Error status: ${xhr.status}, Message: ${thrownError}`);
    }
  });
}

function logout() {
  $.ajax({
    type: 'POST',
    url: `${BASE_URL}/user/logout`,
    // data: 'page=' + url,
    // dataType: 'html',
    headers: { Authorization: `token ${token}` },
    success: function(msg) {
      localStorage.clear();
      location.href = '/login.html';
    },
    error: function(xhr, ajaxOptions, thrownError) {
      alert(`Error status: ${xhr.status}, Message: ${thrownError}`);
    }
  });
}
