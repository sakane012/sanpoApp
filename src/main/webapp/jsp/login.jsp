<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core"%>
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ログイン</title>

<!-- CSS -->
<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/css/header.css">
<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/css/footer.css">
<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/css/login.css">
</head>
<body>

	<!-- ヘッダー共通 -->
	<jsp:include page="/WEB-INF/header.jsp" />

	<!-- メインコンテンツ -->
	<div class="content">
		<h2>ログイン</h2>

		<%-- エラー表示 --%>
		<c:if test="${not empty errorMessage}">
			<p class="error">${errorMessage}</p>
		</c:if>

		<form action="${pageContext.request.contextPath}/login" method="post"
			class="login-form">
			<div class="input-group">
				<label for="username">ユーザー名</label> <input type="text" id="username"
					name="username" required
					value="${param.username != null ? param.username : ''}" />
			</div>
			<div class="input-group">
				<label for="password">パスワード</label> <input type="password"
					id="password" name="password" required
					autocomplete="current-password" />
			</div>

			<div class="button-login">
				<button class ="login" type="submit">ログイン</button>
			</div>
		</form>

		<div class="button-group small">
			<button
				onclick="location.href='${pageContext.request.contextPath}/jsp/signup.jsp'">新規作成</button>
			<button
				onclick="location.href='${pageContext.request.contextPath}/jsp/search.jsp'">ゲストではじめる</button>
		</div>
	</div>

	<!-- フッター共通 -->
	<jsp:include page="/WEB-INF/footer.jsp" />

</body>
</html>
