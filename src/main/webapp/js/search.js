const MIN_WALK_DISTANCE = 0.5;

// -----------------------------
// モバイルデバイス判定関数
// -----------------------------
function isMobileDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  if (/android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    return true;
  }
  if ("ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) {
    if (userAgent.includes("Mac") && "ontouchstart" in document.documentElement) return true;
    return true;
  }
  return false;
}

// -----------------------------
// モバイルで歩きスマホ警告
// -----------------------------
if (isMobileDevice() && !sessionStorage.getItem("noWalkingAlert")) {
  const proceed = window.confirm("歩きスマホはやめましょう");
  if (proceed) {
    sessionStorage.setItem("noWalkingAlert", "true");
  } else {
    window.location.href = "index.jsp";
  }
}

// -----------------------------
// ルート生成（submit）ロジック
// -----------------------------
document.getElementById("search-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const prefInput = document.getElementById("prefecture");
  const cityStreetInput = document.getElementById("city-street");
  const buildingNumberInput = document.getElementById("building-number");

  const pref = prefInput.value;
  const cityStreet = cityStreetInput.value;
  const buildingNumber = buildingNumberInput.value;

  // 前回のカスタムエラーメッセージをクリア
  prefInput.setCustomValidity("");
  cityStreetInput.setCustomValidity("");
  buildingNumberInput.setCustomValidity("");

  const address = pref + cityStreet + buildingNumber;
  if (!address) {
    prefInput.setCustomValidity("出発地点（都道府県・市区町村のいずれか）を入力してください。");
    prefInput.reportValidity();
    return;
  }

  const apiKey = "AIzaSyAL_XSlv1njUcuR9FhptALAjQJpDegIerM";
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  fetch(geocodeUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "OK") {
        const location = data.results[0].geometry.location;
        localStorage.setItem("latitude", location.lat);
        localStorage.setItem("longitude", location.lng);

        const walkDistanceInput = document.getElementById("walk-distance");
        const walkTimeInput = document.getElementById("walk-time");
        const walkDistanceKm = walkDistanceInput ? parseFloat(walkDistanceInput.value) : 0;
        const walkTimeMin = walkTimeInput ? parseFloat(walkTimeInput.value) : 0;

        // 距離/時間チェック
        if (!walkDistanceKm && !walkTimeMin) {
          alert("距離または時間のいずれかを入力してください。");
          return;
        }
        if ((walkDistanceKm && walkDistanceKm < MIN_WALK_DISTANCE) || (walkTimeMin && walkTimeMin <= 0)) {
          let msg = "";
          if (walkDistanceKm && walkDistanceKm < MIN_WALK_DISTANCE) {
            msg += `歩く距離は${MIN_WALK_DISTANCE}km以上で入力してください。\n`;
          }
          if (walkTimeMin && walkTimeMin <= 0) {
            msg += "歩く時間は1分以上で入力してください。";
          }
          alert(msg);
          return;
        }

        // localStorage保存
        localStorage.setItem("walkDistance", walkDistanceKm > 0 ? walkDistanceKm : 0);
        localStorage.setItem("walkTime", walkTimeMin > 0 ? walkTimeMin : 0);

        // ルート生成ページへ遷移
        window.location.href = contextPath + "/result";

      } else {
        alert("出発地点の取得に失敗しました: " + data.status);
      }
    })
    .catch((error) => {
      console.error("Geocoding/処理エラー:", error);
      alert("ルート生成中にエラーが発生しました。");
    });
});

// -----------------------------
// 現在地取得ボタン
// -----------------------------
document.getElementById("get-location-button").addEventListener("click", function () {
  if (!navigator.geolocation) {
    alert("お使いのブラウザは現在地取得に対応していません。");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => reverseGeocode(position.coords.latitude, position.coords.longitude),
    (error) => {
      let errorMessage = "現在地の取得に失敗しました。";
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "位置情報の利用が許可されませんでした。";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "位置情報が取得できませんでした。";
          break;
        case error.TIMEOUT:
          errorMessage = "位置情報の取得がタイムアウトしました。";
          break;
      }
      alert(errorMessage);
    }
  );
});

// -----------------------------
// 緯度経度→住所（リバースジオコーディング）
// -----------------------------
function reverseGeocode(lat, lng) {
  const apiKey = "AIzaSyAL_XSlv1njUcuR9FhptALAjQJpDegIerM";
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=ja`;

  fetch(geocodeUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "OK" && data.results.length > 0) {
        const components = data.results[0].address_components;
        let pref = "", city = "", streetArea = "";

        for (const c of components) {
          const types = c.types;
          if (types.includes("administrative_area_level_1")) pref = c.long_name;
          else if (types.includes("locality")) city = c.long_name;
          else if (types.includes("sublocality")) streetArea = c.long_name + streetArea;
        }

        let cityStreet = (city + streetArea).trim();

        // 丁目/番地を削除
        if (cityStreet) {
          cityStreet = cityStreet.replace(/([\s\d０-９一二三四五六七八九十]+\s*(丁目|番地|番|号)\s*[\d０-９\-\s]*)$/,"")
                                 .replace(/([\d０-９\-\s]+)$/m,"")
                                 .replace(/丁目$/,"").trim();
        }

        document.getElementById("prefecture").value = pref;
        document.getElementById("city-street").value = cityStreet;
        document.getElementById("building-number").value = "";

        console.log("フォームに現在地（町名まで）を自動入力しました。");
      } else {
        alert("現在地に対応する住所（町名まで）の取得に失敗しました。");
      }
    })
    .catch((error) => {
      console.error("リバースジオコーディングエラー:", error);
      alert("現在地の住所変換中にエラーが発生しました。");
    });
}

// -----------------------------
// お気に入り登録ボタン
// -----------------------------
document.getElementById("register-button").addEventListener("click", function() {
    // hidden フィールドにフォームの値をコピー
    document.getElementById("fav-prefecture").value = document.getElementById("prefecture").value;
    document.getElementById("fav-cityStreet").value = document.getElementById("city-street").value;
    document.getElementById("fav-buildingNumber").value = document.getElementById("building-number").value;

    // 緯度経度は localStorage から取得
    document.getElementById("fav-latitude").value = localStorage.getItem("latitude") || 0;
    document.getElementById("fav-longitude").value = localStorage.getItem("longitude") || 0;

    // hidden フォームを submit
    document.getElementById("favorite-form").submit();
});
