const MIN_WALK_DISTANCE = 0.5;

// モバイル判定・歩きスマホ警告
function isMobileDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  if (/android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) return true;
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) return true;
  return false;
}

if (isMobileDevice() && !sessionStorage.getItem('noWalkingAlert')) {
  const proceed = window.confirm('歩きスマホはやめましょう');
  if (proceed) sessionStorage.setItem('noWalkingAlert', 'true');
  else window.location.href = 'index.html';
}

// ルート生成フォーム submit
document.getElementById('search-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const pref = document.getElementById('prefecture').value.trim();
  const cityStreet = document.getElementById('city-street').value.trim();
  const buildingNumber = document.getElementById('building-number').value.trim();

  if (!pref && !cityStreet && !buildingNumber) {
    alert('出発地点を入力してください');
    return;
  }

  const address = pref + cityStreet + buildingNumber;
  const apiKey = 'AIzaSyAL_XSlv1njUcuR9FhptALAjQJpDegIerM';
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  try {
    const res = await fetch(geocodeUrl);
    const data = await res.json();

    if (data.status !== 'OK') {
      alert('出発地点の取得に失敗しました: ' + data.status);
      return;
    }

    const loc = data.results[0].geometry.location;
    localStorage.setItem('latitude', loc.lat);
    localStorage.setItem('longitude', loc.lng);

    const walkDistance = parseFloat(document.getElementById('walk-distance').value) || 0;
    const walkTime = parseFloat(document.getElementById('walk-time').value) || 0;

    if (!walkDistance && !walkTime) {
      alert('距離または時間を入力してください');
      return;
    }

    if ((walkDistance && walkDistance < MIN_WALK_DISTANCE) || (walkTime && walkTime <= 0)) {
      let msg = '';
      if (walkDistance && walkDistance < MIN_WALK_DISTANCE) msg += `歩く距離は${MIN_WALK_DISTANCE}km以上で入力してください\n`;
      if (walkTime && walkTime <= 0) msg += '歩く時間は1分以上で入力してください';
      alert(msg);
      return;
    }

    localStorage.setItem('walkDistance', walkDistance);
    localStorage.setItem('walkTime', walkTime);

    window.location.href = contextPath + '/result';
  } catch (err) {
    console.error(err);
    alert('ルート生成中にエラーが発生しました');
  }
});

// 現在地取得ボタン
document.getElementById('get-location-button').addEventListener('click', () => {
  if (!navigator.geolocation) {
    alert('お使いのブラウザは現在地取得に対応していません。');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      reverseGeocode(lat, lng);
    },
    (error) => {
      let errorMessage = '現在地の取得に失敗しました。';
      switch (error.code) {
        case error.PERMISSION_DENIED: errorMessage = '位置情報の利用が許可されませんでした。'; break;
        case error.POSITION_UNAVAILABLE: errorMessage = '位置情報が取得できませんでした。'; break;
        case error.TIMEOUT: errorMessage = '位置情報の取得がタイムアウトしました。'; break;
      }
      alert(errorMessage);
    }
  );
});

// 逆ジオコーディング：緯度経度→住所
async function reverseGeocode(lat, lng) {
  const apiKey = 'AIzaSyAL_XSlv1njUcuR9FhptALAjQJpDegIerM';
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=ja`;

  try {
    const res = await fetch(geocodeUrl);
    const data = await res.json();

    if (data.status !== 'OK' || data.results.length === 0) {
      alert('現在地に対応する住所（町名まで）の取得に失敗しました。');
      return;
    }

	const components = data.results[0].address_components;

	let pref = '';
	let city = '';
	let sublocality = '';

	components.forEach(c => {
	  const types = c.types;
	  if (types.includes('administrative_area_level_1')) pref = c.long_name;
	  else if (types.includes('locality') || types.includes('postal_town')) city = c.long_name;
	  else if (types.includes('sublocality') || types.includes('sublocality_level_1') || types.includes('neighborhood')) {
	    sublocality = c.long_name;
	  }
	  // street_number や premise は無視して番地には入れない
	});

	const cityStreet = [city, sublocality].filter(Boolean).join(' ').trim();

	document.getElementById('prefecture').value = pref;
	document.getElementById('city-street').value = cityStreet;
	document.getElementById('building-number').value = ''; // 番地は必ず空に
  } catch (err) {
    console.error('リバースジオコーディングエラー:', err);
    alert('現在地の住所変換中にエラーが発生しました。');
  }
}

// お気に入り登録
document.getElementById('register-button').addEventListener('click', async () => {
  const pref = document.getElementById('prefecture').value.trim();
  const cityStreet = document.getElementById('city-street').value.trim();
  const buildingNumber = document.getElementById('building-number').value.trim();
  const errorElem = document.getElementById('favorite-error');

  if (!pref && !cityStreet && !buildingNumber) {
    errorElem.textContent = '住所を入力してください';
    return;
  } else {
    errorElem.textContent = '';
  }

  const address = pref + cityStreet + buildingNumber;
  const apiKey = 'AIzaSyAL_XSlv1njUcuR9FhptALAjQJpDegIerM';
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  try {
    const res = await fetch(geocodeUrl);
    const data = await res.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const loc = data.results[0].geometry.location;

      // hiddenフォームにセット
      document.getElementById('fav-prefecture').value = pref;
      document.getElementById('fav-cityStreet').value = cityStreet;
      document.getElementById('fav-buildingNumber').value = buildingNumber;
      document.getElementById('fav-latitude').value = loc.lat;
      document.getElementById('fav-longitude').value = loc.lng;

      document.getElementById('favorite-form').submit();
    } else {
      errorElem.textContent = '出発地点の緯度経度取得に失敗しました: ' + data.status;
    }
  } catch (err) {
    console.error('お気に入り登録時のジオコーディングエラー:', err);
    errorElem.textContent = 'お気に入り登録中にエラーが発生しました。';
  }
});
