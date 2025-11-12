<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<header style="background-color:#7ac1e4; padding:10px; color:white;">
    <h1 style="margin:0;">散歩ルートメーカー</h1>
    <nav style="margin-top:5px;">
        <a href="index.jsp" style="margin-right:10px; color:white;">トップ</a>
<!--        <a href="search.jsp" style="margin-right:10px; color:white;">ルート検索</a>-->
        <c:if test="${not empty sessionScope.userId}">
<!--            <a href="history.jsp" style="margin-right:10px; color:white;">履歴</a>-->
            <a href="logout.jsp" style="margin-right:10px; color:white;">ログアウト</a>
        </c:if>
        <c:if test="${empty sessionScope.userId}">
            <a href="login.jsp" style="margin-right:10px; color:white;">ログイン</a>
        </c:if>
    </nav>
</header>
<hr>