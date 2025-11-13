package servlet;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import dao.UserDao;

@WebServlet("/signup")
public class SignupServlet extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String username = request.getParameter("username");
        String password = request.getParameter("password");
        String confirmPassword = request.getParameter("confirmPassword");

        // 1. パスワード不一致
        if (!password.equals(confirmPassword)) {
            System.out.println("[SignupServlet] パスワード不一致: " + username);
            response.sendRedirect(request.getContextPath() + "/jsp/signup.jsp?error=password");
            return;
        }

        UserDao userDao = new UserDao();
        boolean success = false;
        boolean duplicate = false;

        try {
            success = userDao.createUser(username, password);
            if (!success) {
                duplicate = true; // 重複の場合は false が返る
            }
        } catch (Exception e) {
            System.err.println("[SignupServlet] DBエラー: " + username);
            e.printStackTrace(System.err);
        }

        // 2. リダイレクト判定
        if (success) {
            System.out.println("[SignupServlet] 登録成功: " + username);
            response.sendRedirect(request.getContextPath() + "/jsp/login.jsp?signup=success");
        } else if (duplicate) {
            System.out.println("[SignupServlet] 登録失敗（重複）: " + username);
            response.sendRedirect(request.getContextPath() + "/jsp/signup.jsp?error=duplicate");
        } else {
            System.out.println("[SignupServlet] 登録失敗（その他）: " + username);
            response.sendRedirect(request.getContextPath() + "/jsp/signup.jsp?error=unknown");
        }
    }
}
