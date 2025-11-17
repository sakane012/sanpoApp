<%@ page contentType="text/html; charset=UTF-8" language="java"%>
<%@ taglib prefix="c" uri="jakarta.tags.core"%>
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>散歩ルートメーカー（検索画面）</title>
</head>
<body>
	<jsp:include page="/WEB-INF/header.jsp" />

	<main>

		<form id="search-form">
			<p class="departure-point">出発地点</p>
			<button type="button" id="get-location-button">現在地を取得</button>

			<div class="input-group">
				<label for="prefecture">都道府県：</label> <input type="text"
					id="prefecture" class="location-input" placeholder="例：大阪府" />
			</div>

			<div class="input-group">
				<label for="city-street">市区町村・町名：</label> <input type="text"
					id="city-street" class="location-input" placeholder="例：大阪市北区梅田" />
			</div>

			<div class="input-groupQ">
				<label for="building-number">番地：</label> <input type="text"
					id="building-number" class="location-input"
					placeholder="例：1丁目1-100" />
			</div>


			<p id="favorite-error" style="color: red;"></p>
			</p>
			<button type="button" id="register-button">お気に入りに登録</button>


			<p>
				<a href="${pageContext.request.contextPath}/favoriteList">お気に入り一覧</a>
			</p>

			<p class="condition">条件</p>
			<div class="input-group">
				<label for="walk-distance">距離：</label> <input type="number"
					id="walk-distance" class="walk-distance-input" step="0.1"
					placeholder="小数第1位まで可" min="0.5" /> <span
					class="walk-distance-unit">km</span>
			</div>

			<div class="input-group">
				<label for="walk-time">時間：</label> <input type="number"
					id="walk-time" class="walk-time-input" placeholder="30" min="0" />
				<span class="walk-time-unit">分</span>
			</div>

			<p>目安：1km = 15分</p>

			<button type="submit" class="submit-button">ルート生成</button>
		</form>

		<!-- hidden フォーム（サーブレット用） -->
		<form id="favorite-form"
			action="${pageContext.request.contextPath}/registerAddress"
			method="post" style="display: none;">
			<input type="hidden" id="fav-prefecture" name="prefecture"> <input
				type="hidden" id="fav-cityStreet" name="cityStreet"> <input
				type="hidden" id="fav-buildingNumber" name="buildingNumber">
			<input type="hidden" id="fav-latitude" name="latitude"> <input
				type="hidden" id="fav-longitude" name="longitude">
		</form>
	</main>

	<jsp:include page="/WEB-INF/footer.jsp" />
	<script src="${pageContext.request.contextPath}/js/search.js"></script>
	<script>
        const contextPath = "${pageContext.request.contextPath}";
            
        window.addEventListener('DOMContentLoaded', () => {
            const params = new URLSearchParams(window.location.search);
            const pref = params.get('prefecture');
            const cityStreet = params.get('cityStreet');
            const buildingNumber = params.get('buildingNumber');
            const lat = params.get('lat');
            const lng = params.get('lng');

            if (pref) document.getElementById('prefecture').value = pref;
            if (cityStreet) document.getElementById('city-street').value = cityStreet;
            if (buildingNumber) document.getElementById('building-number').value = buildingNumber;
            if (lat && lng) {
                localStorage.setItem('latitude', lat);
                localStorage.setItem('longitude', lng);
            }
        });
    </script>
</body>
</html>
