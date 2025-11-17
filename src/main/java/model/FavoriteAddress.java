package model;

public class FavoriteAddress {

	private int id;
	private int userId;
	private String prefecture;
	private String cityStreet;
	private String buildingNumber;
	private double latitude;
	private double longitude;

	public FavoriteAddress(int id, int userId, String prefecture, String cityStreet, String buildingNumber,
			double latitude, double longitude) {
		this.id = id;
		this.userId = userId;
		this.prefecture = prefecture;
		this.cityStreet = cityStreet;
		this.buildingNumber = buildingNumber;
		this.latitude = latitude;
		this.longitude = longitude;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getUserId() {
		return userId;
	}

	public String getPrefecture() {
		return prefecture;
	}

	public String getCityStreet() {
		return cityStreet;
	}

	public String getBuildingNumber() {
		return buildingNumber;
	}

	public double getLatitude() {
		return latitude;
	}

	public double getLongitude() {
		return longitude;
	}
}
