class GregorianJalaliHelperClass {
  /**
   * Returns the equivalent jalali date value for a give input Gregorian date.
   * `gdate` is a JS Date to be converted to jalali.
   * utc to local
   */
  fromGregorian(gdate) {
    let g2d = this.gregorianToDay(gdate.getFullYear(), gdate.getMonth() + 1, gdate.getDate());
    return this.dayToJalali(g2d);
  }
  /*
   Converts a date of the Jalali calendar to the Julian Day number.
   @param jy Jalali year (1 to 3100)
   @param jm Jalali month (1 to 12)
   @param jd Jalali day (1 to 29/31)
   @return Julian Day number
   */
  gregorianToDay(gy, gm, gd) {
    let day = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408;
    day = day - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
    return day;
  }
  /*
   Converts the Julian Day number to a date in the Jalali calendar.
   @param jdn Julian Day number
   @return
   jy: Jalali year (1 to 3100)
   jm: Jalali month (1 to 12)
   jd: Jalali day (1 to 29/31)
   */
  dayToJalali(julianDayNumber) {
    let gy = this.dayToGregorion(julianDayNumber).getFullYear(), // Calculate Gregorian year (gy).
      jalaliYear = gy - 621,
      r = this.jalCal(jalaliYear),
      gregorianDay = this.gregorianToDay(gy, 3, r.march),
      jalaliDay,
      jalaliMonth,
      numberOfDays;
    // Find number of days that passed since 1 Farvardin.
    numberOfDays = julianDayNumber - gregorianDay;
    if (numberOfDays >= 0) {
      if (numberOfDays <= 185) {
        // The first 6 months.
        jalaliMonth = 1 + div(numberOfDays, 31);
        jalaliDay = mod(numberOfDays, 31) + 1;
        return { year: jalaliYear, month: jalaliMonth, day: jalaliDay };
      } else {
        // The remaining months.
        numberOfDays -= 186;
      }
    } else {
      // Previous Jalali year.
      jalaliYear -= 1;
      numberOfDays += 179;
      if (r.leap === 1) {
        numberOfDays += 1;
      }
    }
    jalaliMonth = 7 + div(numberOfDays, 30);
    jalaliDay = mod(numberOfDays, 30) + 1;
    return { year: jalaliYear, month: jalaliMonth, day: jalaliDay };
  }
  /**
   * Returns the equivalent JS date value for a give input Jalali date.
   * `jalaliDate` is an Jalali date to be converted to Gregorian.
   */
  toGregorian(jalaliDate) {
    const jYear = jalaliDate.year;
    const jMonth = jalaliDate.month;
    const jDate = jalaliDate.day;
    let jdn = this.jalaliToDay(jYear, jMonth, jDate);
    let date = this.dayToGregorion(jdn);
    date.setHours(6, 30, 3, 200);
    return date;
  }
  /*
   Converts a date of the Jalali calendar to the Julian Day number.
   @param jy Jalali year (1 to 3100)
   @param jm Jalali month (1 to 12)
   @param jd Jalali day (1 to 29/31)
   @return Julian Day number
   */
  jalaliToDay(jYear, jMonth, jDay) {
    let r = this.jalCal(jYear);
    return this.gregorianToDay(r.gy, 3, r.march) + (jMonth - 1) * 31 - div(jMonth, 7) * (jMonth - 7) + jDay - 1;
  }
  /*
   Calculates Gregorian and Julian calendar dates from the Julian Day number
   (jdn) for the period since jdn=-34839655 (i.e. the year -100100 of both
   calendars) to some millions years ahead of the present.
   @param jdn Julian Day number
   @return
   gy: Calendar year (years BC numbered 0, -1, -2, ...)
   gm: Calendar month (1 to 12)
   gd: Calendar day of the month M (1 to 28/29/30/31)
   */
  dayToGregorion(julianDayNumber) {
    let j, i, gDay, gMonth, gYear;
    j = 4 * julianDayNumber + 139361631;
    j = j + div(div(4 * julianDayNumber + 183187720, 146097) * 3, 4) * 4 - 3908;
    i = div(mod(j, 1461), 4) * 5 + 308;
    gDay = div(mod(i, 153), 5) + 1;
    gMonth = mod(div(i, 153), 12) + 1;
    gYear = div(j, 1461) - 100100 + div(8 - gMonth, 6);
    return new Date(gYear, gMonth - 1, gDay);
  }
  /*
   This function determines if the Jalali (Persian) year is
   leap (366-day long) or is the common year (365 days), and
   finds the day in March (Gregorian calendar) of the first
   day of the Jalali year (jy).
   @param jy Jalali calendar year (-61 to 3177)
   @return
   leap of years since the last leap year (0 to 4)
   gy: Gregorian year of the beginning of Jalali year
   march: the March day of Farvardin the 1st (1st day of jy)
   @see: http://www.astro.uni.torun.pl/~kb/Papers/EMP/PersianC-EMP.htm
   @see: http://www.fourmilab.ch/documents/calendar/
   */
  jalCal(jalaliYear) {
    // Jalali years starting the 33-year rule.
    let breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178],
      breaksLength = breaks.length,
      gYear = jalaliYear + 621,
      leapJ = -14,
      jp = breaks[0],
      jm,
      jump,
      leap,
      leapG,
      march,
      n,
      i;
    if (jalaliYear < jp || jalaliYear >= breaks[breaksLength - 1]) {
      throw new Error('Invalid Jalali year ' + jalaliYear);
    }
    // Find the limiting years for the Jalali year jalaliYear.
    for (i = 1; i < breaksLength; i += 1) {
      jm = breaks[i];
      jump = jm - jp;
      if (jalaliYear < jm) {
        break;
      }
      leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
      jp = jm;
    }
    n = jalaliYear - jp;
    // Find the number of leap years from AD 621 to the beginning
    // of the current Jalali year in the Persian calendar.
    leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
    if (mod(jump, 33) === 4 && jump - n === 4) {
      leapJ += 1;
    }
    // And the same in the Gregorian calendar (until the year gYear).
    leapG = div(gYear, 4) - div((div(gYear, 100) + 1) * 3, 4) - 150;
    // Determine the Gregorian date of Farvardin the 1st.
    march = 20 + leapJ - leapG;
    // Find how many years have passed since the last leap year.
    if (jump - n < 6) {
      n = n - jump + div(jump + 4, 33) * 33;
    }
    leap = mod(mod(n + 1, 33) - 1, 4);
    if (leap === -1) {
      leap = 4;
    }
    return {
      leap: leap,
      gy: gYear,
      march: march
    };
  }
}
function mod(a, b) {
  return a - b * Math.floor(a / b);
}
function div(a, b) {
  return Math.trunc(a / b);
}

const GregorianJalaliHelper = new GregorianJalaliHelperClass();

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
  // console.log('TCL: checkURL -> hash', hash, lasturl);
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
        var participatedPassed = !r.participated && new Date(slot.starts_at).getTime() <= Date.now();
        var html = `<div class="reserved ${participatedPassed ? 'slot-passed' : ''}">
				<h3>${slot.program.name}</h3>
				<div>
					شروع: ${dateToString(slot.program.starts_at)} <br>
					پایان: ${dateToString(slot.program.ends_at)}
				</div>
				<h6>${r.type === 'WAITING' ? 'در لیست انتظار' : 'اسلات رزرو شده'}</h6>
				<div>
					شروع: ${dateToString(slot.starts_at)} <br>
					پایان: ${dateToString(slot.ends_at)}
<div class="mt-2">					<button class="btn btn-danger" onclick="onDeleteReserve(${r.id})">حذف رزرو</button> </div>
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
    url: `${BASE_URL}/programs/`,
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
        var slots = r.slots.reduce((result, slot) => {
          return `${result}<div class="slot">
          ظرفیت: ${slot.capacity} <br>
          رزرو شده: ${slot.reserve} <br>
          ${r.queueable ? `در انتتظار: ${slot.waiting} <br>` : ''}
          شروع: ${dateToString(slot.starts_at)} <br>
          پایان: ${dateToString(slot.ends_at)} <br>
<div class="mt-2">          <button class="btn btn-primary" onclick="onReserve(${r.id}, ${slot.id})">رزرو</button> </div>
        </div>`;
        }, '');

        var html = `<div class="program">
          <h3>${r.name}</h3>
          <div>
            شروع: ${dateToString(r.starts_at)} <br>
            پایان: ${dateToString(r.ends_at)} <br>
          </div>
          ${r.queueable ? '' : `<div>این برنامه لیست انتظار ندارد</div>`}
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

function dateToString(date) {
  const j = GregorianJalaliHelper.fromGregorian(new Date(date));
  return `${j.year}/${j.month}/${j.day} - ${new Date(date).toLocaleTimeString()}`;
}
