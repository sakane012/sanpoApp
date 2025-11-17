package servlet;

import java.io.IOException;
import java.util.List;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import dao.FavoriteDao;
import model.FavoriteAddress;

@WebServlet("/favoriteList")
public class FavoriteListServlet extends HttpServlet {

    private FavoriteDao favoriteDao = new FavoriteDao();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        handleRequest(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        handleRequest(request, response);
    }

    private void handleRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            response.sendRedirect(request.getContextPath() + "/jsp/login.jsp");
            return;
        }

        int userId = (int) session.getAttribute("userId");

        try {
            List<FavoriteAddress> favorites = favoriteDao.getFavoritesByUserId(userId);
            request.setAttribute("favorites", favorites);
        } catch (Exception e) {
            e.printStackTrace();
            request.setAttribute("error", "お気に入りの取得に失敗しました。");
        }

        // WEB-INF 配下に置くことで直接アクセスを防ぐ
        request.getRequestDispatcher("/WEB-INF/favorites.jsp").forward(request, response);
    }
}
