<%@ page contentType="text/html; charset=UTF-8" language="java"%>
<%@ taglib prefix="c" uri="jakarta.tags.core"%>

<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>お気に入り一覧</title>
</head>
<body>
	<jsp:include page="/WEB-INF/header.jsp" />

	<main>
		<h1>お気に入り一覧</h1>

		<c:if test="${empty favorites}">
			<p>お気に入りが登録されていません。</p>
			<p>
				<a href="${pageContext.request.contextPath}/jsp/search.jsp">検索画面へ戻る</a>
			</p>
		</c:if>

		<c:if test="${not empty favorites}">
			<ul>
				<c:forEach var="fav" items="${favorites}">
					<li>${fav.prefecture} ${fav.cityStreet} ${fav.buildingNumber}
						<form action="${pageContext.request.contextPath}/jsp/search.jsp"
							method="get" style="display: inline;">
							<input type="hidden" name="prefecture" value="${fav.prefecture}">
							<input type="hidden" name="cityStreet" value="${fav.cityStreet}">
							<input type="hidden" name="buildingNumber"
								value="${fav.buildingNumber}"> <input type="hidden"
								name="lat" value="${fav.latitude}"> <input type="hidden"
								name="lng" value="${fav.longitude}">
							<button type="submit">この住所をセット</button>
						</form>
						 <!-- 削除ボタン -->
						<form action="${pageContext.request.contextPath}/deleteFavorite"
							method="post" style="display: inline;">
							<input type="hidden" name="id" value="${fav.id}">
							<!-- 各お気に入りの一意ID -->
							<button type="submit" onclick="return confirm('本当に削除しますか？');">削除</button>
						</form>
					</li>
				</c:forEach>
			</ul>
			<p>
				<a href="${pageContext.request.contextPath}/jsp/search.jsp">検索画面へ戻る</a>
			</p>
		</c:if>

	</main>

	<jsp:include page="/WEB-INF/footer.jsp" />
</body>
</html>
