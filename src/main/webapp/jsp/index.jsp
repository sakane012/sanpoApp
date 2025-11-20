<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core"%>
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<title>さんぽルートメーカー</title>

<!-- 共通ヘッダー/フッター + ページ固有CSS -->
<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/css/header.css">
<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/css/footer.css">
<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/css/index.css">
</head>
<body>

	<!-- ヘッダー共通 -->
	<jsp:include page="/WEB-INF/header.jsp" />

	<!-- メインコンテンツ -->
	<div class="content">
		<h2>ようこそ！</h2>
		<p class="overview">日々の散歩をより楽しくするために毎日違ったルートで散歩してみましょう！</p>

		<c:choose>
			<c:when test="${not empty sessionScope.user}">
				<p class="welcom">おかえり、${sessionScope.user} さん！</p>
				<div class="button-group">
					<button
						onclick="location.href='${pageContext.request.contextPath}/jsp/search.jsp'">はじめる</button>
				</div>
			</c:when>
			<c:otherwise>
				<div class="button-group">
					<button
						onclick="location.href='${pageContext.request.contextPath}/jsp/login.jsp'">ログイン</button>
					<button
						onclick="location.href='${pageContext.request.contextPath}/jsp/search.jsp'">ゲストで開始</button>
				</div>
			</c:otherwise>
		</c:choose>
	</div>

	<!-- フッター共通 -->
	<jsp:include page="/WEB-INF/footer.jsp" />

</body>
</html>
