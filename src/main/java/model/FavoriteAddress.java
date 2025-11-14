package model;

public class FavoriteAddress {

    private int userId;
    private String address;
    private double latitude;
    private double longitude;

    public FavoriteAddress(int userId, String address, double latitude, double longitude) {
        this.userId = userId;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public int getUserId() {
        return userId;
    }

    public String getAddress() {
        return address;
    }

    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }
}
	