package uy.com.karibe.access;

public class Queries {
	public static String insertException() {
		String s = "insert into exceptions values (?,?)";
		return s;
	}
	
	public static String insertIsland() {
		String s = "insert into islands values (?, ?, ?, ?)";
		return s;
	}
}