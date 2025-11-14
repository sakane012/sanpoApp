<%@ page contentType="text/html; charset=UTF-8" language="java"%>
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>サインアップ</title>
</head>
<body>
	<jsp:include page="/WEB-INF/header.jsp" />

	<h1>サインアップ</h1>

	<form action="${pageContext.request.contextPath}/signup"
		method="post">
		<label>ユーザー名: <input type="text" name="username" required></label><br>
		<label>パスワード: <input type="password" name="password" required></label><br>
		<label>パスワード確認: <input type="password" name="confirmPassword"
			required></label><br>
		<button type="submit">登録</button>
	</form>

	<p>
		<a href="login.jsp">ログイン画面に戻る</a>
	</p>

	<%
	String error = request.getParameter("error");
	if (error != null) {
	%>
	<p style="color: red;">
		<%
		switch (error) {
		case "password":
			out.print("パスワードが一致していません。");
			break;
		case "duplicate":
			out.print("そのユーザー名はすでに使われています。");
			break;
		case "unknown":
			out.print("登録に失敗しました。もう一度お試しください。");
			break;
		default:
			out.print("不明なエラーです。");
			break;
		}
		%>
	</p>
	<%
	}
	%>

	<jsp:include page="/WEB-INF/footer.jsp" />
</body>
</html>
