package servlet;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import dao.UserDao;

@WebServlet("/SignupServlet")
public class SignupServlet extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String username = request.getParameter("username");
        String password = request.getParameter("password");
        String confirmPassword = request.getParameter("confirmPassword");

        // パスワード確認
        if (!password.equals(confirmPassword)) {
            System.out.println("[SignupServlet] パスワード不一致: " + username);
            response.sendRedirect("signup.jsp?error=2"); // パスワード不一致
            return;
        }

        UserDao userDao = new UserDao();
        boolean success = false;
        try {
            success = userDao.createUser(username, password);
        } catch (Exception e) {
            System.out.println("[SignupServlet] DBエラーで登録できませんでした: " + username);
            e.printStackTrace(); // 詳細エラーをコンソールに出力
        }

        if (success) {
            System.out.println("[SignupServlet] 登録成功: " + username);
            response.sendRedirect("login.jsp?signup=success");
        } else {
            System.out.println("[SignupServlet] 登録失敗（重複またはDBエラー）: " + username);
            response.sendRedirect("signup.jsp?error=3"); // ユーザー名重複 or DBエラー
        }
    }
}
