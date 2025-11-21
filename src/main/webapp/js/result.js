const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImM1NDVjMGQ5OTJhYTQwMGU4NDdiM2QwZGRhMGU0NDEyIiwiaCI6Im11cm11cjY0In0=Y";

let map, currentMarker = null, polyline = null;
let inputGoalDistance = 0, inputGoalTime = 0;

async function initMap() {
  const lat = parseFloat(localStorage.getItem("latitude"));
  const lng = parseFloat(localStorage.getItem("longitude"));
  if (isNaN(lat) || isNaN(lng)) {
    document.getElementById("route-info").innerText = "出発地点が特定できません。";
    return;
  }

  const walkDistance = parseFloat(localStorage.getItem("walkDistance"));
  const walkTime = parseFloat(localStorage.getItem("walkTime"));
  const speedKmh = 4.0;

  let goalKm = 0;
  if (walkDistance > 0) { goalKm = walkDistance; inputGoalDistance = walkDistance; }
  else if (walkTime > 0) { goalKm = (walkTime/60) * speedKmh; inputGoalTime = walkTime; }
  else { document.getElementById("route-info").innerText = "距離または時間を設定してください"; return; }

  map = L.map("map").setView([lat,lng],14);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains:"abcd", maxZoom:20
  }).addTo(map);

  currentMarker = L.marker([lat,lng]).addTo(map).bindPopup("現在地").openPopup();

  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(pos => {
      const p = [pos.coords.latitude,pos.coords.longitude];
      currentMarker.setLatLng(p);
      map.setView(p);
    }, e => console.warn(e), {enableHighAccuracy:true, maximumAge:500, timeout:5000});
  }

  await generateCircularRoute({lat,lng}, goalKm);
}

// 緯度経度計算
function calcLocation(center, angleDeg, distanceKm){
  const rad = angleDeg*Math.PI/180;
  const dLat = distanceKm/111 * Math.cos(rad);
  const dLng = distanceKm/(111*Math.cos(center.lat*Math.PI/180)) * Math.sin(rad);
  return {lat:center.lat+dLat, lng:center.lng+dLng};
}

// 2点間距離（km）
function getDistanceKm(p1,p2){
  const R=6371;
  const dLat=(p2.lat-p1.lat)*Math.PI/180;
  const dLng=(p2.lng-p1.lng)*Math.PI/180;
  const a=Math.sin(dLat/2)**2 + Math.cos(p1.lat*Math.PI/180)*Math.cos(p2.lat*Math.PI/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

// Waypoints生成
function genWaypoints(center, radiusKm, n=5){
  const waypoints=[];
  let angle=0;
  for(let i=0;i<n;i++){
    const variation=(Math.random()-0.5)*10;
    const r=radiusKm*(0.95+Math.random()*0.1);
    waypoints.push({location:calcLocation(center,angle+variation,r), stopover:true});
    angle+=360/n;
  }
  return waypoints;
}

// ORS API呼び出し
async function calcRoundTrip(center, waypoints){
  const coords=[[center.lng,center.lat],...waypoints.map(w=>[w.location.lng,w.location.lat]),[center.lng,center.lat]];
  const body={coordinates:coords, profile:"foot-walking", format:"geojson"};
  const res=await fetch("https://api.openrouteservice.org/v2/directions/foot-walking/geojson",{
    method:"POST",
    headers:{Authorization:ORS_API_KEY,"Content-Type":"application/json"},
    body:JSON.stringify(body)
  });
  if(!res.ok) throw new Error("ORS API error");
  const data=await res.json();
  const distance=data.features[0].properties.summary.distance;
  return {distance, response:data};
}

// 円形ルート生成（±200m精度）
async function generateCircularRoute(center, goalKm){
  const goalM=Math.round(goalKm*1000);
  let radiusKm=goalKm/(2*Math.PI);
  let best=null, minError=Infinity, attempt=0;

  document.getElementById("route-info").innerHTML="<span style='color:orange'>ルート探索中...</span>";

  while(minError>200){
    attempt++;
    const wps=genWaypoints(center,radiusKm);
    try{
      const res=await calcRoundTrip(center,wps);
      const error=res.distance-goalM;
      if(Math.abs(error)<minError){ minError=Math.abs(error); best=res.response; }
      radiusKm*=(1-error/goalM*0.5);
      if(minError<=200) break;
      console.log(`試行${attempt}: 誤差=${error.toFixed(0)}m, 半径=${radiusKm.toFixed(3)}km`);
    }catch(e){ console.warn("API失敗",e); }
  }

  if(best){
    if(polyline) map.removeLayer(polyline);
    const latlngs=best.features[0].geometry.coordinates.map(c=>[c[1],c[0]]);
    polyline=L.polyline(latlngs,{color:"blue",weight:5,opacity:0.9}).addTo(map);
    map.fitBounds(polyline.getBounds());

    const finalDist=best.features[0].properties.summary.distance/1000;
    const finalTime=Math.ceil(best.features[0].properties.summary.duration/60);
    const goalText=inputGoalDistance>0 ? `目標:${inputGoalDistance}km` : inputGoalTime>0 ? `目標:${inputGoalTime}分 (約 ${(inputGoalTime/60*4).toFixed(1)}km)` : "目標なし";
    document.getElementById("route-info").innerHTML=`✅ ルート生成<br>${goalText}<br>距離: ${finalDist.toFixed(2)} km<br>時間: ${finalTime}分<br>誤差: ${minError.toFixed(0)}m<br>試行: ${attempt}回`;
  }else{
    document.getElementById("route-info").innerHTML="<span style='color:red'>ルート生成失敗</span>";
  }
}

document.addEventListener("DOMContentLoaded", initMap);
