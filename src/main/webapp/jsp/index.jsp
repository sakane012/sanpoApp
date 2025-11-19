<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core"%>
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<title>さんぽルートメーカー</title>

<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/css/index.css">
</head>
<body>
	<jsp:include page="/WEB-INF/header.jsp" />

	<h1>ようこそ！</h1>
	<p>日々の散歩をより楽しくするために毎日違ったルートで散歩してみましょう！</p>

	<c:choose>
		<c:when test="${not empty sessionScope.user}">
			<p>ようこそ、${sessionScope.user} さん！</p>
			<button
				onclick="location.href='${pageContext.request.contextPath}/jsp/search.jsp'">はじめる</button>
		</c:when>

		<c:otherwise>
			<button
				onclick="location.href='${pageContext.request.contextPath}/jsp/login.jsp'">ログイン</button>
			<button
				onclick="location.href='${pageContext.request.contextPath}/jsp/search.jsp'">ゲストで開始</button>
		</c:otherwise>
	</c:choose>

	<jsp:include page="/WEB-INF/footer.jsp" />
</body>
</html>
