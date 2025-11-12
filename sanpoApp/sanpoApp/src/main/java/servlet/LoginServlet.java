package servlet;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.mindrot.jbcrypt.BCrypt;

@WebServlet("/loginServlet")
public class LoginServlet extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String username = request.getParameter("username");
        String password = request.getParameter("password");

        try {
            Class.forName("org.h2.Driver");
            Connection conn = DriverManager.getConnection(
                "jdbc:h2:file:C:/Users/7Java14/Desktop/DB/sanpoApp;AUTO_SERVER=TRUE", 
                "sa", 
                ""
            );

            String sql = "SELECT password FROM users WHERE username=?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, username);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                String storedHash = rs.getString("password");
                if (BCrypt.checkpw(password, storedHash)) {
                    // ログイン成功
                    request.getSession().setAttribute("user", username);
                    response.sendRedirect("search.jsp");
                } else {
                    // パスワード不一致
                    response.sendRedirect("login.jsp?error=1");
                }
            } else {
                // ユーザーなし
                response.sendRedirect("login.jsp?error=1");
            }

            rs.close();
            ps.close();
            conn.close();
        } catch(Exception e) {
            e.printStackTrace();
            response.sendRedirect("login.jsp?error=1");
        }
    }
}
