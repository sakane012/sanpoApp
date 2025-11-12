const MIN_WALK_DISTANCE = 0.5;

//  モバイルデバイス判定関数
function isMobileDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // 一般的なモバイルデバイスのキーワードをチェック
  if (
    /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
  ) {
    return true;
  }
  // タッチスクリーンデバイスをモバイルとみなす
  if (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  ) {
    // iPad Proなどのタブレットも含む
    if (
      userAgent.includes("Mac") &&
      "ontouchstart" in document.documentElement
    ) {
      return true;
    }
    return true;
  }

  return false;
}

// --- PC/モバイル判定のコンソールログ出力 ---
if (isMobileDevice()) {
  console.log("デバイス判定: モバイルデバイスです。");
} else {
  console.log("デバイス判定: PC（デスクトップ）デバイスです。");
}

// 歩きスマホアラート（スマホだけ表示）
if (isMobileDevice() && !sessionStorage.getItem("noWalkingAlert")) {
  const proceed = window.confirm("歩きスマホはやめましょう");
  if (proceed) {
    sessionStorage.setItem("noWalkingAlert", "true");
  } else {
    window.location.href = "index.jsp";
  }
}

// ----------------------------------------------------
//  ルート生成（submit）ロジック
// ----------------------------------------------------
document.getElementById("search-form").addEventListener("submit", (e) => {
  e.preventDefault();

  // 3つの入力欄の要素を取得
  const prefInput = document.getElementById("prefecture");
  const cityStreetInput = document.getElementById("city-street");
  const buildingNumberInput = document.getElementById("building-number");

  const pref = prefInput.value;
  const cityStreet = cityStreetInput.value;
  const buildingNumber = buildingNumberInput.value;

  // 念のため、前のカスタムエラーメッセージをクリア
  prefInput.setCustomValidity("");
  cityStreetInput.setCustomValidity("");
  buildingNumberInput.setCustomValidity("");

  const address = pref + cityStreet + buildingNumber;

  // Google Maps APIキー (既存のものを流用)
  const apiKey = "AIzaSyAL_XSlv1njUcuR9FhptALAjQJpDegIerM";

  // 1. 【最優先チェック】住所が空欄の場合、フォームにアラートバブルを表示して終了
  if (!address) {
    const errorMessage =
      "出発地点（都道府県・市区町村のいずれか）を入力してください。";

    // 都道府県フォームをエラー表示のターゲットとする
    prefInput.setCustomValidity(errorMessage);
    prefInput.reportValidity(); // ネイティブのポップアップを表示
    return;
  }

  // 2. 結合した住所文字列を使ってジオコーディングを実行
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;


  fetch(geocodeUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "OK") {
        const location = data.results[0].geometry.location;
        console.log("最終決定の緯度:", location.lat, "経度:", location.lng);

        // --- 緯度経度をlocalStorage に保存（更新） ---
        localStorage.setItem("latitude", location.lat);
        localStorage.setItem("longitude", location.lng);
		
		// ------------------------------------------------------------------
		// 【✅ 修正 2】サーバーへの fetch ブロックを削除しました。
		// サーバー処理を省略し、クライアント側で処理を続行します。
		// ------------------------------------------------------------------

        // --- 距離/時間の入力チェックと保存 ---
        const walkDistanceInput = document.getElementById("walk-distance");
        const walkTimeInput = document.getElementById("walk-time");
        const walkDistanceKm = walkDistanceInput
          ? parseFloat(walkDistanceInput.value)
          : 0;
        const walkTimeMin = walkTimeInput ? parseFloat(walkTimeInput.value) : 0;

        const isDistanceValid = walkDistanceKm >= MIN_WALK_DISTANCE;
        const isTimeValid = walkTimeMin > 0;

        // 距離が0.5km未満 and 時間が0分以下 の場合にアラート
        if (!isDistanceValid && !isTimeValid) {
          alert(
            `歩く距離（km）は${MIN_WALK_DISTANCE}km以上、または時間（分）を正しく入力してください。`
          );
          return;
        }
       

        // 距離または時間の一方が必須
        if (
          (!walkDistanceKm || walkDistanceKm <= 0) &&
          (!walkTimeMin || walkTimeMin <= 0)
        ) {
          alert(
            "歩く距離（km）または時間（分）のいずれかを正しく入力してください。"
          );
          return;
        }

        // 入力値に応じてローカルストレージに保存
        localStorage.setItem(
          "walkDistance",
          walkDistanceKm > 0 ? walkDistanceKm : 0
        );
        localStorage.setItem("walkTime", walkTimeMin > 0 ? walkTimeMin : 0);

        // 【✅ 修正 1-2】result.html から result.jsp に修正し、遷移
        window.location.href = "result.jsp";
      } else {
        alert("出発地点の取得に失敗しました: " + data.status);
      }
    })
    .catch((error) => {
      console.error("Geocoding/処理エラー:", error);
      alert("ルート生成中にエラーが発生しました。");
    });
});

// ----------------------------------------------------
//  現在地を取得ボタンのロジック
// ----------------------------------------------------
document
  .getElementById("get-location-button")
  .addEventListener("click", function () {
    // 1. Geolocation API が利用可能かチェック
    if (!navigator.geolocation) {
      alert("お使いのブラウザは現在地取得に対応していません。");
      return;
    }

    // 2. 現在地を取得
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        console.log("現在地の緯度:", lat, "経度:", lng);

        // 3. 緯度経度を住所に変換（リバースジオコーディング）
        reverseGeocode(lat, lng);
      },
      (error) => {
        // エラー処理
        console.error("現在地取得エラー:", error);
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

// ----------------------------------------------------
// 緯度経度から住所を取得してフォームに設定する関数
// ----------------------------------------------------

function reverseGeocode(lat, lng) {
  // Google Maps APIキー (既存のものを流用)
  const apiKey = "AIzaSyAL_XSlv1njUcuR9FhptALAjQJpDegIerM";
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=ja`;

  fetch(geocodeUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "OK" && data.results.length > 0) {
        const components = data.results[0].address_components;
        let pref = ""; // 都道府県
        let city = ""; // 市区町村 (locality)
        let streetArea = ""; // 町名・丁目 (sublocality)

        for (const component of components) {
          const types = component.types;

          // 1. 都道府県
          if (types.includes("administrative_area_level_1")) {
            pref = component.long_name;
          }
          // 2. 市区町村
          else if (types.includes("locality")) {
            city = component.long_name;
          }
          // 3. 町名・丁目
          else if (types.includes("sublocality")) {
            // sublocality (例: 〇〇1丁目) を結合
            streetArea = component.long_name + streetArea;
          }
        }

        // city（市区町村）と streetArea（町名・丁目）を結合し、一時的な住所文字列を作成
        let cityStreet = (city + streetArea).trim();

        // ★丁目・番地以下の情報のみを削除するロジックを強化★
        if (cityStreet) {
          // 1. 漢数字またはアラビア数字の後に「丁目」「番地」「番」「号」が続くパターンをすべて削除
          const comprehensivePattern =
            /([\s\d０-９一二三四五六七八九十]+\s*(丁目|番地|番|号)\s*[\d０-９\-\s]*)$/;
          cityStreet = cityStreet.replace(comprehensivePattern, "").trim();

          // 2. 上記で削除しきれなかった、末尾にある数字やハイフン（純粋な番地）も削除
          const numberPattern = /([\d０-９\-\s]+)$/m; // 改行をまたがないようmフラグ追加
          cityStreet = cityStreet.replace(numberPattern, "").trim();

          // 最終チェック：末尾が「丁目」で終わってしまっている場合を削除 (保険)
          const finalChomeCheck = /丁目$/;
          cityStreet = cityStreet.replace(finalChomeCheck, "").trim();
        }
        // ★ロジックここまで★

        // フォームに値をセット
        document.getElementById("prefecture").value = pref;
        // 「市区町村・町名」フォームには、丁目以下の情報を除去した文字列を設定
        document.getElementById("city-street").value = cityStreet;

        // 「番地」フォームは空欄に設定し、ユーザーに手入力を促す
        document.getElementById("building-number").value = "";

        console.log(
          "フォームに現在地（町名まで）を自動入力しました。番地は手入力してください。"
        );
      } else {
        alert("現在地に対応する住所（町名まで）の取得に失敗しました。");
      }
    })
    .catch((error) => {
      console.error("リバースジオコーディングエラー:", error);
      alert("現在地の住所変換中にエラーが発生しました。");
    });
}