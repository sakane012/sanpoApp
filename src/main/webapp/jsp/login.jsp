<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>散歩ルートメーカー：ログイン</title>
</head>
<body>

	<jsp:include page="/WEB-INF/header.jsp" />

	<h1>ログイン</h1>

	<%-- エラーがあれば表示 --%>
	<%
	String errorMessage = (String) request.getAttribute("errorMessage");
	if (errorMessage != null) {
	%>
	<p style="color: red; margin-bottom: 15px;"><%=errorMessage%></p>
	a
	<%
	}
	%>
	<form action="${pageContext.request.contextPath}/login"
		method="post">
		<label for="username">ユーザー名：</label> <input type="text" id="username"
			name="username" required /><br /> <label for="password">パスワード：</label>
		<input type="password" id="password" name="password" required /><br />

		<button type="submit">ログイン</button>
	</form>

	<p>
		<a href="signup.jsp">アカウントを作成する</a>
	</p>
	<p>
		<a href="search.jsp">ゲストとして続行</a>
	</p>

	<jsp:include page="/WEB-INF/footer.jsp" />
</body>
</html>
