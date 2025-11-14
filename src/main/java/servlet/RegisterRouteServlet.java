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

@WebServlet("/registerRoute")
public class RegisterRouteServlet extends HttpServlet {

    private FavoriteDao favoriteDao = new FavoriteDao();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        // フォームパラメータ取得
        String prefecture = request.getParameter("prefecture");
        String cityStreet = request.getParameter("cityStreet");
        String buildingNumber = request.getParameter("buildingNumber");
        String address = (prefecture + cityStreet + buildingNumber).trim();

        double latitude = 0, longitude = 0;
        try {
            latitude = Double.parseDouble(request.getParameter("latitude"));
            longitude = Double.parseDouble(request.getParameter("longitude"));
        } catch (NumberFormatException e) {
            // 緯度経度が空や不正な場合は 0 に
        }

        // ログインユーザーID取得
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            response.sendRedirect(request.getContextPath() + "/jsp/login.jsp");
            return;
        }	
        int userId = (int) session.getAttribute("userId");

        if (address.isEmpty()) {
            request.setAttribute("error", "出発地点を入力してください");
            request.getRequestDispatcher("/jsp/search.jsp").forward(request, response);
            return;
        }

        FavoriteAddress favorite = new FavoriteAddress(userId, address, latitude, longitude);
        favoriteDao.insertFavorite(favorite);

        response.sendRedirect(request.getContextPath() + "/search.jsp?registered=true");
    }
}
	