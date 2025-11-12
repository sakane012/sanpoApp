<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>散歩ルートメーカー（結果画面）</title>

    <!-- Leaflet地図のCSS -->
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    />

    <style>
      #map {
        height: 500px;
        width: 100%;
        margin-bottom: 20px;
      }
    </style>
  </head>

  <body>
    <!-- ヘッダー共通部分 -->
    <jsp:include page="header.jsp" />

    <main>
      <h1>散歩ルートメーカー（結果画面）</h1>
      <h2>検索結果</h2>

      <div id="map"></div>
      <div id="route-info"></div>

      <button>
        <a href="result.jsp" class="research-link-button">再検索</a>
      </button>
      <button>
        <a href="search.jsp">検索画面へ</a>
      </button>
    </main>

    <!-- フッター共通部分 -->
    <jsp:include page="footer.jsp" />

    <!-- Leaflet地図JS -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

    <!-- 独自JS -->
    <script src="${pageContext.request.contextPath}/js/result.js"></script>
  </body>
</html>
