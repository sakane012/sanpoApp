<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core"%>

<header style="background-color: #7ac1e4; padding: 10px; color: white;">
    <h1 style="margin: 0;">散歩ルートメーカー</h1>

    <nav style="margin-top: 5px;">
        <%-- 現在のページURIを取得 --%>
        <c:set var="uri" value="${pageContext.request.requestURI}" />

        <%-- index.jsp ではトップリンクを非表示 --%>
        <c:if test="${not uri.endsWith('index.jsp')}">
            <a href="index.jsp" style="margin-right: 10px; color: white;">トップ</a>
        </c:if>

        <%-- ログイン中：ユーザ名とログアウトリンクを表示 --%>
        <c:if test="${not empty sessionScope.user}">
            <span style="margin-right: 10px;">ログイン中 ${sessionScope.user} さん</span>
            <a href="${pageContext.request.contextPath}/logout"
               style="margin-right: 10px; color: white;">ログアウト</a>
        </c:if>

        <%-- 未ログイン：index.jsp と login.jsp ではログインボタンを非表示 --%>
        <c:if test="${empty sessionScope.user
                     and not uri.endsWith('index.jsp')
                     and not uri.endsWith('login.jsp')}">
            <a href="${pageContext.request.contextPath}/jsp/login.jsp"
               style="margin-right: 10px; color: white;">ログイン</a>
        </c:if>
    </nav>
</header>
<hr>
