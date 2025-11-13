<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ようこそ</title>
</head>
<body>
<%
    String username = (String) session.getAttribute("user");
    if(username == null) {
        // セッション切れや不正アクセスの場合、ログイン画面へ
        response.sendRedirect("login.jsp");
        return;
    }
%>

<h1>ようこそ、<%= username %> さん！</h1>

<p>
    <a href="${pageContext.request.contextPath}/jsp/search.jsp">はじめる！！</a>
<p>
    <a href="${pageContext.request.contextPath}/logout">ログアウト</a>
</p>

</body>
</html>
