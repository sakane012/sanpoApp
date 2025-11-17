// -----------------------------
// マップ初期化・ルート描画（改良版：リトライ・段階的緩和・試行管理）
// -----------------------------


const MAX_SEARCH_ATTEMPTS = 3; // UI上の再試行（全体）
const MAX_API_CALLS = 5;       // ORS呼び出し上限（1回の findBestRouteAndDisplay 内）
const ORS_RETRY_MAX = 3;       // ORS呼び出し内部リトライ回数

let map;
let currentLocationMarker = null;
let inputGoalDistance = 0;

let inputGoalTime = 0;

let searchCenter = null;
let searchGoalDistanceKm = 0;
let watchId = null;

// ORSのAPIキー（そのまま。公開鍵ならプロダクションでの漏洩に注意）
const ORS_API_KEY =
  "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImM1NDVjMGQ5OTJhYTQwMGU4NDdiM2QwZGRhMGU0NDEyIiwiaCI6Im11cm11cjY0In0=";

// -----------------------------
// initMap: 地図初期化して探索スタート
// -----------------------------
function initMap() {
  const lat = parseFloat(localStorage.getItem("latitude"));
  const lng = parseFloat(localStorage.getItem("longitude"));
  if (isNaN(lat) || isNaN(lng)) {
    document.getElementById("route-info").innerText =
      "出発地点が特定できませんでした。";
    return;
  }
  const center = { lat, lng };

  // 目的距離 or 時間から距離計算
  const walkDistanceInput = parseFloat(localStorage.getItem("walkDistance"));
  const walkTimeMin = parseFloat(localStorage.getItem("walkTime"));
  const WALKING_SPEED_KMPH = 4.0;

  let goalDistanceKm;
  if (walkDistanceInput > 0) {
    goalDistanceKm = walkDistanceInput;
    inputGoalDistance = walkDistanceInput;
  } else if (walkTimeMin > 0) {
    goalDistanceKm = (walkTimeMin / 60) * WALKING_SPEED_KMPH;
    inputGoalTime = walkTimeMin;
  } else {
    document.getElementById("route-info").innerText =
      "有効な距離または時間が設定されていません。";
    return;
  }

  searchCenter = center;
  searchGoalDistanceKm = goalDistanceKm;

  // Leafletで地図初期化
  map = L.map("map").setView([lat, lng], 14);

  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }
  ).addTo(map);

  // 現在地マーカー設置
  currentLocationMarker = L.marker([lat, lng])
    .addTo(map)
    .bindPopup("現在地")
    .openPopup();

  // モバイルなら追跡開始
  if (isMobileDevice()) {
    startLocationTracking(center);
  } else {
    console.log("現在地追跡機能はモバイルデバイスでのみ有効です。");
  }

  // ルート探索開始（attempt = 1）
  findBestRouteAndDisplay(searchCenter, searchGoalDistanceKm, 1);
}

// -----------------------------
// isMobileDevice: 簡易モバイル判定
// -----------------------------
function isMobileDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  if (/android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    return true;
  }
  if ("ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) {
    return true;
  }
  return false;
}

// -----------------------------
// startLocationTracking: 現在地追跡（watchPosition）
// -----------------------------
function startLocationTracking(initialCenter) {
  if (!navigator.geolocation) {
    document.getElementById("route-info").innerText =
      "お使いのブラウザは現在地追跡をサポートしていません。";
    return;
  }

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const currentPos = [position.coords.latitude, position.coords.longitude];
      if (currentLocationMarker) {
        currentLocationMarker.setLatLng(currentPos);
      } else {
        currentLocationMarker = L.marker(currentPos)
          .addTo(map)
          .bindPopup("現在地")
          .openPopup();
      }
      map.setView(currentPos);
    },
    (error) => {
      console.error("Geolocation error:", error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 500,
      timeout: 5000,
    }
  );
}

// -----------------------------
// calculateRoundTrip: ORS Directions を呼んでルート距離を返す
//   - 内部で再試行（指数バックオフ）を行う（429や一時エラー対策）
//   - waypoints は [{location:{lat,lng}, stopover:true}, ...]
// -----------------------------
async function calculateRoundTrip(center, waypoints) {
  const coordinates = [
    [center.lng, center.lat],
    ...waypoints.map((wp) => [wp.location.lng, wp.location.lat]),
    [center.lng, center.lat],
  ];

  const body = {
    coordinates: coordinates,
    profile: "foot-walking",
    format: "geojson",
  };

  // 内部リトライ（指数バックオフ）
  for (let attempt = 0; attempt <= ORS_RETRY_MAX; attempt++) {
    try {
      const res = await fetch(
        "https://api.openrouteservice.org/v2/directions/foot-walking/geojson",
        {
          method: "POST",
          headers: {
            Authorization: ORS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (res.status === 429) {
        // レート制限に当たったら待ってリトライ
        const wait = 500 + attempt * 800; // 0.5s, 1.3s, 2.1s...
        console.warn(`ORS 429: waiting ${wait}ms then retry (attempt ${attempt + 1})`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      const data = await res.json();
      const totalDistance = data.features[0].properties.summary.distance;
      return { totalDistance, response: data };
    } catch (err) {
      // ネットワーク一時エラーやJSONパースエラーなど
      console.warn("calculateRoundTrip error:", err);
      if (attempt < ORS_RETRY_MAX) {
        const wait = 300 + attempt * 500;
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      throw err;
    }
  }

  // 全リトライ失敗
  throw new Error("ORS request failed after retries");
}

// -----------------------------
// calculateLocation: 角度と距離から緯度経度を返す（補助）
// -----------------------------
function calculateLocation(origin, angleDeg, distanceKm, KM_PER_DEGREE = 111.0) {
  const angleRad = (angleDeg * Math.PI) / 180;
  const deltaLat = (distanceKm / KM_PER_DEGREE) * Math.cos(angleRad);
  const deltaLng =
    (distanceKm / (KM_PER_DEGREE * Math.cos((origin.lat * Math.PI) / 180))) *
    Math.sin(angleRad);
  return {
    lat: origin.lat + deltaLat,
    lng: origin.lng + deltaLng,
  };
}

// -----------------------------
// calculateRadiusFromDistance: 目標距離から円の半径を計算する（経験則）
// -----------------------------
function calculateRadiusFromDistance(goalDistanceM) {
  const goalDistanceKm = goalDistanceM / 1000;
  const COMPENSATION_FACTOR = 0.7;
  const radiusKm = (goalDistanceKm / (2 * Math.PI)) * COMPENSATION_FACTOR;
  let minRadiusKm;
  if (goalDistanceKm <= 1.0) {
    minRadiusKm = 0.09;
  } else if (goalDistanceKm <= 2.0) {
    minRadiusKm = 0.15;
  } else if (goalDistanceKm <= 3.0) {
    minRadiusKm = 0.3;
  } else {
    minRadiusKm = 0.5;
  }
  return Math.max(minRadiusKm, radiusKm);
}

// -----------------------------
// calculateCircleCenter: 指定方向へオフセットした中心を返す（補助）
// -----------------------------
function calculateCircleCenter(center, direction, offsetDistanceKm) {
  let angleDeg;
  switch (direction.toLowerCase()) {
    case "north":
      angleDeg = 0;
      break;
    case "northeast":
      angleDeg = 45;
      break;
    case "east":
      angleDeg = 90;
      break;
    case "southeast":
      angleDeg = 135;
      break;
    case "south":
      angleDeg = 180;
      break;
    case "southwest":
      angleDeg = 225;
      break;
    case "west":
      angleDeg = 270;
      break;
    case "northwest":
      angleDeg = 315;
      break;
    default:
      angleDeg = 0;
  }
  const KM_PER_DEGREE = 111.0;
  return calculateLocation(center, angleDeg, offsetDistanceKm, KM_PER_DEGREE);
}

// -----------------------------
// generateCircularWaypoints: 円形に経由地を作る（ランダム要素あり）
//   - circleCenter: 中心座標
//   - goalDistanceM: 目標距離（メートル）
// -----------------------------
function generateCircularWaypoints(circleCenter, goalDistanceM) {
  const waypoints = [];
  const KM_PER_DEGREE = 111.0;

  const radiusKm = calculateRadiusFromDistance(goalDistanceM);

  // 候補数は距離とランダム性に応じて決定（固定だと同じルートになりやすいのでランダム化）
  const numWaypoints = 4 + Math.floor(Math.random() * 4); // 4〜7個
  const stepAngle = 360 / numWaypoints;
  let currentAngle = Math.random() * 360;

  for (let i = 0; i < numWaypoints; i++) {
    // ランダム幅を少し狭めて、過度な離散を防ぐ
    const angleVariation = Math.random() * 30 - 15; // ±15度
    const radiusVariation = 0.85 + Math.random() * 0.3; // 0.85〜1.15倍
    const finalAngleDeg = currentAngle + angleVariation;
    const finalRadiusKm = radiusKm * radiusVariation;

    const waypoint = calculateLocation(circleCenter, finalAngleDeg, finalRadiusKm, KM_PER_DEGREE);
    waypoints.push({ location: waypoint, stopover: true });

    currentAngle += stepAngle;
  }

  return waypoints;
}

// -----------------------------
// ハッシュ関数（候補の重複判定用）
// -----------------------------
function waypointHash(waypoints) {
  // lat/lngを小数点4桁に丸めてキー化
  return waypoints
    .map((w) => `${w.location.lat.toFixed(4)},${w.location.lng.toFixed(4)}`)
    .join("|");
}

// -----------------------------
// findBestRouteAndDisplay: メイン探索ルーチン
//   - 段階的緩和: 初期は厳しく（MAX_ERROR_M_small）、見つからなければ緩和（MAX_ERROR_M_big）
//   - API呼び出し回数を上限(MAX_API_CALLS)で抑える
//   - 試行済み候補はスキップ（重複回避）
// -----------------------------
let currentPolyline = null;
async function findBestRouteAndDisplay(center, goalDistanceKm, currentAttempt) {
  const GOAL_DISTANCE_M = Math.round(goalDistanceKm * 1000);

  // 小さい誤差許容→見つからなければ広げる（段階的緩和）
  const MAX_ERROR_SMALL = 100; // 最初の段階（±120m）
  const MAX_ERROR_BIG = 300;   // 緩和後（±500m）

  // まずは小さい誤差で試す
  let maxErrorToUse = MAX_ERROR_SMALL;

  // 試行済み候補を記録（ハッシュ）
  const triedHashes = new Set();

  let bestRouteResponse = null;
  let minError = Infinity;

  // API 呼び出し回数管理
  let apiCalls = 0;

  // 生成する「中心点」は複数方向からランダムに選ぶ（1〜3個）
  const directions = ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"];
  const numCenters = 1 + Math.floor(Math.random() * 3); // 1〜3
  const centers = [];
  const baseRadiusKm = calculateRadiusFromDistance(GOAL_DISTANCE_M);
  for (let i = 0; i < numCenters; i++) {
    const dir = directions[Math.floor(Math.random() * directions.length)];
    const offset = baseRadiusKm * (0.6 + Math.random() * 0.6); // 0.6〜1.2倍
    centers.push(calculateCircleCenter(center, dir, offset));
  }

  document.getElementById("route-info").innerHTML =
    `<span style="color: orange;">ルート探索中...</span><br>目標距離: ${goalDistanceKm} km。`;

  // 最大 API 呼び出しを繰り返す（段階的緩和を含む）
  while (apiCalls < MAX_API_CALLS) {
    for (const c of centers) {
      if (apiCalls >= MAX_API_CALLS) break;

      // 毎回違う waypoints を試す
      const waypoints = generateCircularWaypoints(c, GOAL_DISTANCE_M);
      const hash = waypointHash(waypoints);
      if (triedHashes.has(hash)) {
        // 同じ候補はスキップ
        continue;
      }
      triedHashes.add(hash);

      try {
        apiCalls++;
        const res = await calculateRoundTrip(center, waypoints);
        const currentError = Math.abs(res.totalDistance - GOAL_DISTANCE_M);

        // ベスト更新（誤差の小さい方を保存）
        if (currentError < minError) {
          minError = currentError;
          bestRouteResponse = res.response;
        }

        // 現在の許容誤差以内なら決定
        if (currentError <= maxErrorToUse) {
          // found good route -> break all
          console.log(`Found route (err=${currentError}m) with apiCalls=${apiCalls}`);
          // display and return below
          apiCalls = Math.min(apiCalls, MAX_API_CALLS);
          break;
        } else {
          // 近いが許容外なら記録して続行
          console.log(`Tried route err=${currentError}m (not within ${maxErrorToUse}m).`);
        }
      } catch (e) {
        console.warn("calculateRoundTrip failed for a candidate:", e);
        // 失敗しても次へ（APIの一時的問題を回避）
      }
    }

    // 決定条件：bestRouteResponse が maxErrorToUse 以下の誤差を満たしているなら break
    if (bestRouteResponse && minError <= maxErrorToUse) break;

    // もし今の段階で見つからなければ、段階的に誤差を広げてもう一度（ただし2段階まで）
    if (maxErrorToUse === MAX_ERROR_SMALL) {
      maxErrorToUse = MAX_ERROR_BIG;
      console.log("許容誤差を広げます:", maxErrorToUse);
      // 続けて試す（ただし API 呼び出し上限に注意）
      continue;
    } else {
      // 既に緩和済みでまだ見つかっていない → ループ終了
      break;
    }
  } // while(apiCalls...)

  // ルートが見つかった／ベストがある場合に地図に表示
 if (bestRouteResponse && minError <= maxErrorToUse) {
    if (currentPolyline) {
      map.removeLayer(currentPolyline);
    }

    const coords = bestRouteResponse.features[0].geometry.coordinates;
    const latlngs = coords.map((c) => [c[1], c[0]]);
    currentPolyline = L.polyline(latlngs, {
      color: "blue",
      weight: 5,
      opacity: 0.9,
    }).addTo(map);
    map.fitBounds(currentPolyline.getBounds());

    const finalDistanceKm =
      bestRouteResponse.features[0].properties.summary.distance / 1000;
    const finalDurationMin = Math.ceil(
      bestRouteResponse.features[0].properties.summary.duration / 60
    );

    const displayTime = inputGoalTime > 0 ? inputGoalTime + "分" : "設定なし";
    let goalText = "";
    if (inputGoalDistance > 0) {
      goalText = `目標: **${inputGoalDistance} km**`;
    } else if (inputGoalTime > 0) {
      const goalDistanceConverted = (inputGoalTime / 60) * 4.0; // 4km/h換算
      goalText = `目標: **${inputGoalTime} 分** (約 ${goalDistanceConverted.toFixed(1)} km)`;
    } else {
      goalText = `目標: 設定なし`;
    }

    document.getElementById("route-info").innerHTML = `
      ✅ ルートが生成されました (API呼び出し ${Math.min(MAX_API_CALLS, 1 + triedHashes.size)} 回)<br>
      ---<br>
      ${goalText} **(許容誤差 ±${maxErrorToUse}m)**<br>
      実際の距離: **${finalDistanceKm.toFixed(2)} km**<br>
      実際の所要時間: **${finalDurationMin} 分**<br>
      目標との誤差: ${minError.toFixed(0)} m
    `;
  } else {
    // フォールバック・メッセージ：ORSが全部ダメな場合や見つからない場合
    document.getElementById("route-info").innerHTML = `
      <span style="color: red;">
        ❌ ルートを生成できませんでした。<br>
        ・API制限/ネットワークエラーの可能性があります（CORS / 429）<br>
        ・または現在の目標距離に対して適切な経路が見つかりませんでした。<br>
        対処案: 目標距離を少し変える、またはサーバー側プロキシ経由でAPIを呼び出す設定をしてください。
      </span>
    `;
  }
}

// -----------------------------
// DOMロード時に初期化
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  const researchButton = document.querySelector(".research");
  if (researchButton) {
    researchButton.addEventListener("click", () => {
      window.location.href = "search.jsp";
    });
  }

  // 追加: 「検索画面へ」ボタン押下で search.jsp に遷移
  const searchButton = document.getElementById("btn-search");
  if (searchButton) {
    searchButton.addEventListener("click", () => {
      const contextPath = '<%= request.getContextPath() %>'; // JSP用
      window.location.href = contextPath + "/search.jsp";
    });
  }

  initMap();
});

