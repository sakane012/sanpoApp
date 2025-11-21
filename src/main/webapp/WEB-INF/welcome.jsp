<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ようこそ</title>

<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/css/header.css">
<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/css/footer.css">
<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/css/welcome.css">

</head>
<body>
	<!-- 共通ヘッダー読込 -->
	<jsp:include page="/WEB-INF/header.jsp" />

	<div class="content">
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
		<div class="button-group">
			<button class="start">
				<a href="${pageContext.request.contextPath}/jsp/search.jsp">はじめる！！</a>
			</button>
			<button class="logout">
				<a href="${pageContext.request.contextPath}/logout"
					class="logout-link">ログアウト</a>
			</button>
		</div>
	</div>
	<!-- 共通フッター読込 -->
	<jsp:include page="/WEB-INF/footer.jsp" />
</body>
</html>
