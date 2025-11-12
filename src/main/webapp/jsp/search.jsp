<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>散歩ルートメーカー（検索画面）</title>
  </head>
  <body>
    <jsp:include page="header.jsp" />

    <main>
      <h1>散歩ルートメーカー（検索画面）</h1>
      <form id="search-form">
        <!-- 出発地点 -->
        <p class="departure-point">出発地点</p>

        <button type="button" id="get-location-button">現在地を取得</button>

        <!-- 都道府県フォーム -->
        <div class="input-group">
          <label for="prefecture">都道府県：</label>
          <input
            type="text"
            id="prefecture"
            class="location-input"
            placeholder="例：大阪府"
          />
        </div>

        <!-- 市区町村フォーム -->
        <div class="input-group">
          <label for="city-street">市区町村・町名：</label>
          <input
            type="text"
            id="city-street"
            class="location-input"
            placeholder="例：大阪市北区梅田"
          />
        </div>

        <!-- 番地・建物名フォーム -->
        <div class="input-group">
          <label for="building-number">番地：</label>
          <input
            type="text"
            id="building-number"
            class="location-input"
            placeholder="例：1丁目1-100"
          />
        </div>

        <p class="condition">条件</p>

        <!-- 距離フォーム -->
        <div class="input-group">
          <label for="walk-distance">距離：</label>
          <input
            type="number"
            id="walk-distance"
            class="walk-distance-input"
            step="0.1"
            placeholder="2.5(0.5km以上、小数第1位まで可)"
            min="0.5"
          />
          <span class="walk-distance-unit">km</span>
        </div>

        <!-- 時間フォーム -->
        <div class="input-group">
          <label for="walk-time">時間：</label>
          <input
            type="number"
            id="walk-time"
            class="walk-time-input"
            placeholder="30"
            min="0"
          />
          <span class="walk-time-unit">分</span>
        </div>

        <button type="submit" class="submit-button">ルート生成</button>
      </form>
    </main>

    <jsp:include page="footer.jsp" />

    <script src="${pageContext.request.contextPath}/js/search.js"></script>
  </body>
</html>
