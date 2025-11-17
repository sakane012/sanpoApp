const MIN_WALK_DISTANCE = 0.5;

// モバイル判定・歩きスマホ警告
function isMobileDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  if (/android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    return true;
  }
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) {
    if (userAgent.includes('Mac') && 'ontouchstart' in document.documentElement) {
      return true;
    }
    return true;
  }
  return false;
}

if (isMobileDevice() && !sessionStorage.getItem('noWalkingAlert')) {
  const proceed = window.confirm('歩きスマホはやめましょう');
  if (proceed) sessionStorage.setItem('noWalkingAlert', 'true');
  else window.location.href = 'index.html';
}

// ルート生成フォーム submit イベント
document.getElementById('search-form').addEventListener('submit', (e) => {
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

  fetch(geocodeUrl)
    .then(res => res.json())
    .then(data => {
      if (data.status === 'OK') {
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
      } else {
        alert('出発地点の取得に失敗しました: ' + data.status);
      }
    })
    .catch(err => {
      console.error(err);
      alert('ルート生成中にエラーが発生しました');
    });
});

// 現在地取得ボタンの処理
document.getElementById('get-location-button').addEventListener('click', () => {
  if (!navigator.geolocation) {
    alert('お使いのブラウザは現在地取得に対応していません。');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      console.log('現在地の緯度:', lat, '経度:', lng);
      reverseGeocode(lat, lng);
    },
    (error) => {
      console.error('現在地取得エラー:', error);
      let errorMessage = '現在地の取得に失敗しました。';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = '位置情報の利用が許可されませんでした。';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = '位置情報が取得できませんでした。';
          break;
        case error.TIMEOUT:
          errorMessage = '位置情報の取得がタイムアウトしました。';
          break;
      }
      alert(errorMessage);
    }
  );
});

// 逆ジオコーディング：緯度経度→住所の自動セット
function reverseGeocode(lat, lng) {
  const apiKey = 'AIzaSyAL_XSlv1njUcuR9FhptALAjQJpDegIerM';
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=ja`;

  fetch(geocodeUrl)
    .then(res => res.json())
    .then(data => {
      if (data.status === 'OK' && data.results.length > 0) {
        const components = data.results[0].address_components;
        let pref = '';
        let city = '';
        let streetArea = '';

        for (const component of components) {
          const types = component.types;
          if (types.includes('administrative_area_level_1')) pref = component.long_name;
          else if (types.includes('locality')) city = component.long_name;
          else if (types.includes('sublocality')) streetArea = component.long_name + streetArea;
        }
        let cityStreet = (city + streetArea).trim();

        const comprehensivePattern = /([\s\d０-９一二三四五六七八九十]+\s*(丁目|番地|番|号)\s*[\d０-９\-\s]*)$/;
        cityStreet = cityStreet.replace(comprehensivePattern, '').trim();
        const numberPattern = /([\d０-９\-\s]+)$/;
        cityStreet = cityStreet.replace(numberPattern, '').trim();
        const finalChomeCheck = /丁目$/;
        cityStreet = cityStreet.replace(finalChomeCheck, '').trim();

        document.getElementById('prefecture').value = pref;
        document.getElementById('city-street').value = cityStreet;
        document.getElementById('building-number').value = '';

        console.log('フォームに現在地を自動入力しました（町名まで）。番地は手入力してください。');
      } else {
        alert('現在地に対応する住所（町名まで）の取得に失敗しました。');
      }
    })
    .catch(err => {
      console.error('リバースジオコーディングエラー:', err);
      alert('現在地の住所変換中にエラーが発生しました。');
    });
}

// お気に入り登録
document.getElementById('register-button').addEventListener('click', () => {
  const pref = document.getElementById('prefecture').value.trim();
  const cityStreet = document.getElementById('city-street').value.trim();
  const buildingNumber = document.getElementById('building-number').value.trim();
  const address = pref + cityStreet + buildingNumber;
  const errorElem = document.getElementById('favorite-error');

  if (!pref && !cityStreet && !buildingNumber) {
    errorElem.textContent = '住所を入力してください';
    console.log('フォームは空です');
    return;
  } else {
    errorElem.textContent = '';
  }

  const apiKey = 'AIzaSyAL_XSlv1njUcuR9FhptALAjQJpDegIerM';
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    fetch(geocodeUrl)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'OK' && data.results.length > 0) {
          const loc = data.results[0].geometry.location;
          document.getElementById('fav-prefecture').value = pref
          document.getElementById('fav-cityStreet').value = cityStreet;
          document.getElementById('fav-buildingNumber').value = buildingNumber;
          document.getElementById('fav-latitude').value = loc.lat;
          document.getElementById('fav-longitude').value = loc.lng;

          // 隠しフォームを送信
          document.getElementById('favorite-form').submit();
          
        } else {
          errorElem.textContent = '出発地点の緯度経度取得に失敗しました: ' + data.status;
        }
      })
      .catch(err => {
        console.error('お気に入り登録時のジオコーディングエラー:', err);
        errorElem.textContent = 'お気に入り登録中にエラーが発生しました。';
      });
  });