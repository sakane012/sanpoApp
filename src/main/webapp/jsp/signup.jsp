<%@ page contentType="text/html; charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>サインアップ</title>
</head>
<body>
<h1>サインアップ</h1>
<form action="${pageContext.request.contextPath}/SignupServlet" method="post"> 
    <label>ユーザー名: <input type="text" name="username" required></label><br>
    <label>パスワード: <input type="password" name="password" required></label><br>
    <label>パスワード確認: <input type="password" name="confirmPassword" required></label><br>
    <button type="submit">登録</button>
    
    <p><a href="login.jsp">ログイン画面に戻る</a></p>
</form>
<% if(request.getParameter("error") != null) { %>
    <p style="color:red;">登録に失敗しました。ユーザー名が重複している可能性があります。</p>
<% } %>
</body>
</html>
