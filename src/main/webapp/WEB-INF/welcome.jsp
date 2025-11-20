<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ようこそ</title>
<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/css/welcome.css">
<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/css/header.css">
<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/css/footer.css">

</head>
<body>
	<!-- 共通ヘッダー読込 -->
	<jsp:include page="/WEB-INF/header.jsp" />

	<%
	String username = (String) session.getAttribute("user");
	if (username == null) {
		// セッション切れや不正アクセスの場合、ログイン画面へ
		response.sendRedirect("login.jsp");
		return;
	}
	%>

	<h2>
		ようこそ、<%=username%>さん！
	</h2>

	<p>
		<a href="${pageContext.request.contextPath}/jsp/search.jsp">はじめる！！</a>
	</p>

	<p>
		<a href="${pageContext.request.contextPath}/logout"
			class="logout-link">ログアウト</a>
	</p>

	<!-- 共通フッター読込 -->
	<jsp:include page="/WEB-INF/footer.jsp" />
</body>
</html>
