package servlet;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import dao.FavoriteDao;
import model.FavoriteAddress;

@WebServlet("/registerAddress")
public class RegisterAddressServlet extends HttpServlet {

	private FavoriteDao favoriteDao = new FavoriteDao();

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		request.setCharacterEncoding("UTF-8");

		// フォームパラメータ取得
		String prefecture = request.getParameter("prefecture");
		String cityStreet = request.getParameter("cityStreet");
		String buildingNumber = request.getParameter("buildingNumber");
		String latitudeStr = request.getParameter("latitude");
		String longitudeStr = request.getParameter("longitude");

		// -----------------------------
		// 入力チェック
		// -----------------------------
		if ((prefecture == null || prefecture.isEmpty()) &&
				(cityStreet == null || cityStreet.isEmpty()) &&
				(buildingNumber == null || buildingNumber.isEmpty())) {

			// 空ならエラーとして search.jsp に戻す
			request.setAttribute("error", "出発地点を入力してください");
			request.getRequestDispatcher("/jsp/search.jsp").forward(request, response);
			return;
		}

		double latitude = 0, longitude = 0;
		try {
			if (latitudeStr != null && !latitudeStr.isEmpty())
				latitude = Double.parseDouble(latitudeStr);
			if (longitudeStr != null && !longitudeStr.isEmpty())
				longitude = Double.parseDouble(longitudeStr);
		} catch (NumberFormatException e) {
			// 無効な緯度経度の場合もエラー
			request.setAttribute("error", "緯度・経度の値が不正です");
			request.getRequestDispatcher("/jsp/search.jsp").forward(request, response);
			return;
		}

		// ログインユーザーID取得
		HttpSession session = request.getSession(false);
		if (session == null || session.getAttribute("userId") == null) {
			response.sendRedirect(request.getContextPath() + "/jsp/login.jsp");
			return;
		}
		int userId = (int) session.getAttribute("userId");
	
		// DBに登録
		FavoriteAddress favorite = new FavoriteAddress(0,userId, prefecture, cityStreet, buildingNumber, latitude,
				longitude);
		favoriteDao.insertFavorite(favorite);

		response.sendRedirect(request.getContextPath() + "/favoriteList");
	}
}
