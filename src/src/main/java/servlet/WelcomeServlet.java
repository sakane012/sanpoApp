package servlet;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class Welcome
 */
@WebServlet("/welcome")
public class WelcomeServlet extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // ログインチェック
        String username = (String) request.getSession().getAttribute("user");
        if (username == null) {
            response.sendRedirect(request.getContextPath() + "/login.jsp");
            return;
        }

        // JSP へフォワード
        request.getRequestDispatcher("/WEB-INF/welcome.jsp").forward(request, response);
    }
}
	