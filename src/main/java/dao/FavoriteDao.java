package dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import model.FavoriteAddress;

public class FavoriteDao {

	private final String jdbcURL = "jdbc:h2:file:C:/Users/7Java14/Desktop/DB/sanpoApp;AUTO_SERVER=TRUE";
	private final String dbUser = "sa";
	private final String dbPassword = "";

	public void insertFavorite(FavoriteAddress favorite) {
		String sql = "INSERT INTO favorite_addresses (user_id, prefecture, city_street, building_number, latitude, longitude, created_at) "
				+
				"VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";
		try (Connection conn = DriverManager.getConnection(jdbcURL, dbUser, dbPassword);
				PreparedStatement ps = conn.prepareStatement(sql)) {

			ps.setInt(1, favorite.getUserId());
			ps.setString(2, favorite.getPrefecture());
			ps.setString(3, favorite.getCityStreet());
			ps.setString(4, favorite.getBuildingNumber());
			ps.setDouble(5, favorite.getLatitude());
			ps.setDouble(6, favorite.getLongitude());
			ps.executeUpdate();

		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

	public List<FavoriteAddress> getFavoritesByUserId(int userId) {
		List<FavoriteAddress> list = new ArrayList<>();
		String sql = "SELECT * FROM favorite_addresses WHERE user_id = ? ORDER BY created_at DESC";

		try (Connection conn = DriverManager.getConnection(jdbcURL, dbUser, dbPassword);
				PreparedStatement stmt = conn.prepareStatement(sql)) {

			stmt.setInt(1, userId);
			ResultSet rs = stmt.executeQuery();
			while (rs.next()) {
				FavoriteAddress fav = new FavoriteAddress(
						rs.getInt("id"), // ここで id を取得
						rs.getInt("user_id"),
						rs.getString("prefecture"),
						rs.getString("city_street"),
						rs.getString("building_number"),
						rs.getDouble("latitude"),
						rs.getDouble("longitude"));
				list.add(fav);
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}

		return list;
	}

	public void deleteFavorite(int id, int userId) {
		String sql = "DELETE FROM favorite_addresses WHERE id = ? AND user_id = ?";
		try (Connection conn = DriverManager.getConnection(jdbcURL, dbUser, dbPassword);
				PreparedStatement pstmt = conn.prepareStatement(sql)) {
			pstmt.setInt(1, id);
			pstmt.setInt(2, userId);
			pstmt.executeUpdate();
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

}
