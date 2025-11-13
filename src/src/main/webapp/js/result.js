// -----------------------------
// マップ初期化・ルート描画
// -----------------------------

const MAX_SEARCH_ATTEMPTS = 3;

let map;
let currentLocationMarker = null;
let inputGoalDistance = 0;
let inputGoalTime = 0;
let searchCenter = null;
let searchGoalDistanceKm = 0;
let watchId = null;

// ORSのAPIキー
const ORS_API_KEY =
  "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImM1NDVjMGQ5OTJhYTQwMGU4NDdiM2QwZGRhMGU0NDEyIiwiaCI6Im11cm11cjY0In0=";

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

  // =======================================================
  // ★ 変更点1: CartoDB Voyagerに変更 (シンプルで色付きのバランス型)
  // =======================================================
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

  // ルート探索開始
  findBestRouteAndDisplay(searchCenter, searchGoalDistanceKm, 1);
}

function isMobileDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  if (
    /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
  ) {
    return true;
  }
  if (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  ) {
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

/**
 * ORSのDirections APIで周回ルート距離を計算する
 * @param {object} center {lat, lng}
 * @param {Array<object>} waypoints [{location: {lat, lng}}]
 */
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
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();

    // 総距離算出（メートル）
    const totalDistance = data.features[0].properties.summary.distance;

    return { totalDistance, response: data };
  } catch (err) {
    throw err;
  }
}

function calculateLocation(origin, angleDeg, distanceKm, KM_PER_DEGREE) {
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

function generateCircularWaypoints(circleCenter, goalDistanceM) {
  const waypoints = [];
  const KM_PER_DEGREE = 111.0;

  const radiusKm = calculateRadiusFromDistance(goalDistanceM);
  const numWaypoints = Math.min(10, 4 + Math.floor(goalDistanceM / 2000));
  const stepAngle = 360 / numWaypoints;
  let currentAngle = Math.random() * 360;

  for (let i = 0; i < numWaypoints; i++) {
    const angleVariation = Math.random() * 20 - 10;
    const finalAngleDeg = currentAngle + angleVariation;
    const radiusVariation = 0.9 + Math.random() * 0.2;
    const finalRadiusKm = radiusKm * radiusVariation;

    const waypoint = calculateLocation(
      circleCenter,
      finalAngleDeg,
      finalRadiusKm,
      KM_PER_DEGREE
    );

    waypoints.push({ location: waypoint, stopover: true });
    currentAngle += stepAngle;
  }
  return waypoints;
}

/**
 * 最適ルートを複数試行して表示、再試行も行う
 */
let currentPolyline = null;

async function findBestRouteAndDisplay(center, goalDistanceKm, currentAttempt) {
  const GOAL_DISTANCE_M = goalDistanceKm * 1000;

  // ORSの429エラー対策のため、同時試行回数は3に維持
  const NUM_TRIALS = 3;
  const MAX_ERROR_M = 150;

  let bestRouteResponse = null;
  let minError = Infinity;

  const radiusKm = calculateRadiusFromDistance(GOAL_DISTANCE_M);
  const directions = [
    "north",
    "northeast",
    "east",
    "southeast",
    "south",
    "southwest",
    "west",
    "northwest",
  ];
  const randomIndex = Math.floor(Math.random() * directions.length);
  const DIRECTION_TO_OFFSET = directions[randomIndex];
  const circleCenter = calculateCircleCenter(
    center,
    DIRECTION_TO_OFFSET,
    radiusKm
  );

  document.getElementById(
    "route-info"
  ).innerHTML = `<span style="color: orange;">ルート探索中...</span><br>目標距離: ${goalDistanceKm} km。`;

  const routePromises = [];
  for (let i = 0; i < NUM_TRIALS; i++) {
    const waypoints = generateCircularWaypoints(circleCenter, GOAL_DISTANCE_M);
    routePromises.push(calculateRoundTrip(center, waypoints));
  }

  let allResults;
  try {
    allResults = await Promise.all(
      routePromises.map((p) =>
        p.catch((error) => ({ error: true, status: error }))
      )
    );
  } catch {
    document.getElementById(
      "route-info"
    ).innerHTML = `<span style="color: red;">致命的な探索エラーが発生しました。</span>`;
    return;
  }

  for (const result of allResults) {
    if (result.error || result.status !== undefined) continue;
    const currentError = Math.abs(result.totalDistance - GOAL_DISTANCE_M);
    if (currentError > MAX_ERROR_M) continue;
    if (currentError < minError) {
      minError = currentError;
      bestRouteResponse = result.response;
    }
  }

  if (bestRouteResponse) {
    // 古いルート線は消す
    if (currentPolyline) {
      map.removeLayer(currentPolyline);
    }

    const coords = bestRouteResponse.features[0].geometry.coordinates;
    const latlngs = coords.map((c) => [c[1], c[0]]);

    // =======================================================
    // ★ 変更点2: ルートラインを標準の青に戻す
    // =======================================================
    currentPolyline = L.polyline(latlngs, {
      color: "blue",
      weight: 5,
      opacity: 0.9,
    }).addTo(map);
    map.fitBounds(currentPolyline.getBounds());

    // 距離・時間表示
    const finalDistanceKm =
      bestRouteResponse.features[0].properties.summary.distance / 1000;
    const finalDurationMin = Math.ceil(
      bestRouteResponse.features[0].properties.summary.duration / 60
    );

    const timeDiffMin =
      inputGoalTime > 0 ? Math.abs(inputGoalTime - finalDurationMin) : null;
    const distanceDiffKm =
      inputGoalDistance > 0
        ? Math.abs(inputGoalDistance - finalDistanceKm)
        : null;

    const displayTime = inputGoalTime > 0 ? inputGoalTime + "分" : "設定なし";
    const displayDistance =
      inputGoalDistance > 0 ? inputGoalDistance.toFixed(2) + "km" : "設定なし";
    let goalText = "";
    if (inputGoalDistance > 0) {
      goalText = `目標: **${inputGoalDistance} km**`;
    } else if (inputGoalTime > 0) {
      const goalDistanceConverted = (inputGoalTime / 60) * 4.0; // 4km/h換算
      goalText = `目標: **${inputGoalTime} 分** (約 ${goalDistanceConverted.toFixed(
        1
      )} km)`;
    } else {
      goalText = `目標: 設定なし`;
    }

    document.getElementById("route-info").innerHTML = `
      ✅ ルートが生成されました (試行${currentAttempt}/${MAX_SEARCH_ATTEMPTS})<br>
      ---<br>
      ${goalText} **(許容誤差 ±${MAX_ERROR_M}m)**<br>
      実際の距離: **${finalDistanceKm.toFixed(2)} km**<br>
      実際の所要時間: **${finalDurationMin} 分**<br>
      目標との誤差: ${minError.toFixed(0)} m
    `;
  } else {
    if (currentAttempt < MAX_SEARCH_ATTEMPTS) {
      console.log(
        `⚠️ 目標距離の±${MAX_ERROR_M}m以内に収まるルートを見つけられませんでした。再試行します (${
          currentAttempt + 1
        }/${MAX_SEARCH_ATTEMPTS})...`
      );
      // 再試行の間隔を1秒に維持
      setTimeout(() => {
        findBestRouteAndDisplay(center, goalDistanceKm, currentAttempt + 1);
      }, 1000);
    } else {
      document.getElementById("route-info").innerHTML = `
        <span style="color: red;">
          ❌ ${MAX_SEARCH_ATTEMPTS}回試行しましたが、目標距離の±${MAX_ERROR_M}m以内に収まるルートを見つけられませんでした。<br>
          出発地点や目標距離を変更して再度お試しください。
        </span>
      `;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const researchButton = document.querySelector(".research");
  if (researchButton) {
    researchButton.addEventListener("click", () => {
      window.location.href = "search.jsp";
    });
  }
});

document.addEventListener("DOMContentLoaded", initMap);
