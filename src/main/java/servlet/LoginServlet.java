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

@WebServlet("/login")
public class LoginServlet extends HttpServlet {
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		String username = request.getParameter("username");
		String password = request.getParameter("password");

		try {
			Class.forName("org.h2.Driver");
			try (Connection conn = DriverManager.getConnection(
					"jdbc:h2:file:C:/Users/7Java14/Desktop/DB/sanpoApp;AUTO_SERVER=TRUE",
					"sa",
					"");
					PreparedStatement ps = conn.prepareStatement("SELECT password FROM users WHERE username=?")) {

				ps.setString(1, username);
				try (ResultSet rs = ps.executeQuery()) {
					if (rs.next()) {
						String storedHash = rs.getString("password");
						if (BCrypt.checkpw(password, storedHash)) {
							// ログイン成功
							request.getSession().setAttribute("user", username);
							// WEB-INF 配下の welcome.jsp は直接アクセスできないのでサーブレット経由
							response.sendRedirect(request.getContextPath() + "/welcome");
							return;
						}
					}
					// ユーザーなし or パスワード不一致
					request.setAttribute("errorMessage", "ユーザー名またはパスワードが間違っています。");
					request.getRequestDispatcher("/jsp/login.jsp").forward(request, response);
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			request.setAttribute("errorMessage", "ログイン処理中にエラーが発生しました。");
			request.getRequestDispatcher("/jsp/login.jsp").forward(request, response);
		}
	}
}
