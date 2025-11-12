<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>サインアップ</title>
</head>
<body>
<h1>サインアップ</h1>
<form action="signupServlet" method="post">
    <label>ユーザー名: <input type="text" name="username" required></label><br>
    <label>パスワード: <input type="password" name="password" required></label><br>
    <button type="submit">登録</button>
</form>
<% if(request.getParameter("error") != null) { %>
    <p style="color:red;">登録に失敗しました。ユーザー名が重複している可能性があります。</p>
<% } %>
</body>
</html>
