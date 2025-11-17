package servlet;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import dao.FavoriteDao;

@WebServlet("/deleteFavorite")
public class DeleteFavoriteServlet extends HttpServlet {

    private FavoriteDao favoriteDao = new FavoriteDao();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // ログインユーザーID取得
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            response.sendRedirect(request.getContextPath() + "/jsp/login.jsp");
            return;
        }
        int userId = (int) session.getAttribute("userId");

        // 削除対象ID取得
        String idStr = request.getParameter("id");
        if (idStr != null && !idStr.isEmpty()) {
            try {
                int favoriteId = Integer.parseInt(idStr);
                favoriteDao.deleteFavorite(favoriteId, userId);
            } catch (NumberFormatException e) {
                // 無効なIDは無視
            }
        }

        // 削除後はお気に入り一覧にリダイレクト
        response.sendRedirect(request.getContextPath() + "/favoriteList");
    }
}
