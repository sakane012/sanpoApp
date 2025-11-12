package servlet;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.mindrot.jbcrypt.BCrypt;

@WebServlet("/signupServlet")
public class SignupServlet extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String username = request.getParameter("username");
        String password = request.getParameter("password");

        System.out.println("SignupServlet: doPost start");
        System.out.println("入力された username: " + username);
        System.out.println("入力された password: " + password);

        try {
            // H2ドライバロード
            Class.forName("org.h2.Driver");
            Connection conn = DriverManager.getConnection(
                "jdbc:h2:file:C:/Users/7Java14/Desktop/DB/sanpoApp;AUTO_SERVER=TRUE", 
                "sa", 
                ""
            );

            // パスワードをハッシュ化
            String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());
            System.out.println("ハッシュ化後 password: " + hashedPassword);

            // DBに保存
            String sql = "INSERT INTO users (username, password) VALUES (?, ?)";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, username);
            ps.setString(2, hashedPassword);
            ps.executeUpdate();

            ps.close();
            conn.close();

            // 登録成功したらログイン画面へ
            response.sendRedirect("login.jsp?signup=success");

        } catch(Exception e) {
            e.printStackTrace();
            // 登録失敗（ユーザー名重複など）
            response.sendRedirect("signup.jsp?error=1");
        }
    }
}
