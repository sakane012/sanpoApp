<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>散歩ルートメーカー</title>
  </head>
  <body>
    <jsp:include page="header.jsp" />

    <main>
      <h2>ようこそ！</h2>
      <p>日々の散歩をより楽しくするために毎日違ったルートで散歩してみましょう！</p>
      <button><a href="login.jsp">ログイン</a></button>
      <button><a href="search.jsp">ゲストで始める</a></button>
    </main>

    <jsp:include page="footer.jsp" />
  </body>
</html>
