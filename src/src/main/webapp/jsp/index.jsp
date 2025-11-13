<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core"%>
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<title>散歩ルートメーカー</title>
</head>
<body>

<jsp:include page="/WEB-INF/header.jsp" />

	<h1>散歩ルートメーカー</h1>

	<h2>ようこそ！</h2>
	<p>日々の散歩をより楽しくするために毎日違ったルートで散歩してみましょう！</p>

	<c:choose>
		<c:when test="${not empty sessionScope.user}">
			<p>ようこそ、${sessionScope.user} さん！</p>
			<a href="${pageContext.request.contextPath}/jsp/search.jsp">
				<button>はじめる</button>
			</a>
		</c:when>

		<c:otherwise>
			<a href="${pageContext.request.contextPath}/jsp/login.jsp">
				<button>ログイン</button>
			</a>
			<a href="${pageContext.request.contextPath}/jsp/search.jsp">
				<button>ゲストで始める</button>
			</a>
		</c:otherwise>
	</c:choose>

	<jsp:include page="/WEB-INF/footer.jsp" />

</body>
</html>
