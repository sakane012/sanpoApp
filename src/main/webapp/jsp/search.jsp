<%@ page contentType="text/html; charset=UTF-8" language="java"%>
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
        <h1>散歩ルートメーカー（検索画面）</h1>

        <!-- ルート生成フォーム（既存のまま） -->
        <form id="search-form">
            <p class="departure-point">出発地点</p>
            <button type="button" id="get-location-button">現在地を取得</button>

            <div class="input-group">
                <label for="prefecture">都道府県：</label>
                <input type="text" id="prefecture" class="location-input" placeholder="例：大阪府" />
            </div>

            <div class="input-group">
                <label for="city-street">市区町村・町名：</label>
                <input type="text" id="city-street" class="location-input" placeholder="例：大阪市北区梅田" />
            </div>

            <div class="input-group">
                <label for="building-number">番地：</label>
                <input type="text" id="building-number" class="location-input" placeholder="例：1丁目1-100" />
            </div>

            <p class="condition">条件</p>
            <div class="input-group">
                <label for="walk-distance">距離：</label>
                <input type="number" id="walk-distance" class="walk-distance-input" step="0.1" placeholder="小数第1位まで可" min="0.5" />
                <span class="walk-distance-unit">km</span>
            </div>

            <div class="input-group">
                <label for="walk-time">時間：</label>
                <input type="number" id="walk-time" class="walk-time-input" placeholder="30" min="0" />
                <span class="walk-time-unit">分</span>
            </div>

            <p>目安：1km = 15分</p>

            <!-- ルート生成ボタン（既存の submit） -->
            <button type="submit" class="submit-button">ルート生成</button>
        </form>

        <!-- お気に入り登録フォーム（hiddenで住所・緯度経度送信） -->
        <form id="favorite-form" action="${pageContext.request.contextPath}/registerRoute" method="post">
            <input type="hidden" name="prefecture" id="fav-prefecture">
            <input type="hidden" name="cityStreet" id="fav-cityStreet">
            <input type="hidden" name="buildingNumber" id="fav-buildingNumber">
            <input type="hidden" name="latitude" id="fav-latitude">
            <input type="hidden" name="longitude" id="fav-longitude">
            <button type="submit" id="register-button">お気に入りに登録</button>
        </form>
    </main>

    <jsp:include page="/WEB-INF/footer.jsp" />

    <script src="${pageContext.request.contextPath}/js/search.js"></script>
    <script>
        const contextPath = "${pageContext.request.contextPath}";
    </script>
</body>
</html>
