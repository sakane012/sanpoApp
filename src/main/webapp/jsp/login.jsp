<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ログイン</title>

<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/css/login.css">
</head>
<body>
	<jsp:include page="/WEB-INF/header.jsp" />

	<h1>ログイン</h1>

	<div class="form-wrapper">

		<%-- エラー表示 --%>
		<%
		String errorMessage = (String) request.getAttribute("errorMessage");
		if (errorMessage != null) {
		%>
		<p class="error"><%=errorMessage%></p>
		<%
		}
		%>

		<form action="${pageContext.request.contextPath}/login" method="post"
			class="login-form">

			<div class="input-group">
				<label for="username">ユーザー名</label> <input type="text" id="username"
					name="username" required
					value="<%=request.getParameter("username") != null ? request.getParameter("username") : ""%>" />
			</div>

			<div class="input-group">
				<label for="password">パスワード</label> <input type="password"
					id="password" name="password" required
					autocomplete="current-password" />
			</div>

			<button type="submit">ログイン</button>
		</form>
	</div>


	<div class="login-links">
		<p>
			<a href="${pageContext.request.contextPath}/jsp/signup.jsp">新規作成</a>
		</p>
		<p>
			<a href="${pageContext.request.contextPath}/jsp/search.jsp">ゲストではじめる</a>
		</p>
	</div>



	<jsp:include page="/WEB-INF/footer.jsp" />
</body>
</html>
