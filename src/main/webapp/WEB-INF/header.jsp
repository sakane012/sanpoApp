<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core"%>



<header>
	<link rel="stylesheet" type="text/css"
		href="${pageContext.request.contextPath}/css/header.css">

	<h1>さんぽルートメーカー</h1>

	<nav>
		<%-- 現在のページURIを取得 --%>
		<c:set var="uri" value="${pageContext.request.requestURI}" />

		<%-- index.jsp ではトップリンクを非表示 --%>
		<c:if test="${not uri.endsWith('index.jsp')}">
			<a href="index.jsp">トップ</a>
		</c:if>

		<%-- 未ログイン：index.jsp と login.jsp ではログインボタンを非表示 --%>
		<c:if
			test="${empty sessionScope.user
                     and not uri.endsWith('index.jsp')
                     and not uri.endsWith('login.jsp')}">
			<a href="${pageContext.request.contextPath}/jsp/login.jsp">ログイン</a>
		</c:if>

		<%-- ログイン中：ユーザ名とログアウトリンクを表示 --%>
		<c:if test="${not empty sessionScope.user}">
			<span>ログイン中 ${sessionScope.user} さん</span>
			<a href="${pageContext.request.contextPath}/logout">ログアウト</a>
		</c:if>
	</nav>
</header>



