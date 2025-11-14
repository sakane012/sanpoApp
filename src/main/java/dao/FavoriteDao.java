package dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import model.FavoriteAddress;

public class FavoriteDao {

    private final String jdbcURL = "jdbc:h2:file:C:/Users/7Java14/Desktop/DB/sanpoApp;AUTO_SERVER=TRUE";
    private final String dbUser = "sa";
    private final String dbPassword = "";

    public void insertFavorite(FavoriteAddress favorite) {
        String sql = "INSERT INTO favorite_addresses (user_id, address, latitude, longitude, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)";
        try (Connection conn = DriverManager.getConnection(jdbcURL, dbUser, dbPassword);
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, favorite.getUserId());
            ps.setString(2, favorite.getAddress());
            ps.setDouble(3, favorite.getLatitude());
            ps.setDouble(4, favorite.getLongitude());
            ps.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
	