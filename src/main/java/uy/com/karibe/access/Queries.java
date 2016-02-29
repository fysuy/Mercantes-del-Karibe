package uy.com.karibe.access;

public class Queries {
	public static String insertException() {
		String s = "insert into mdk.exceptions values (?,?)";
		return s;
	}
	
	public static String insertIsland() {
		String s = "insert into mdk.islands(x, y, width, height) values (?, ?, ?, ?)";
		return s;
	}
	
	public static String deleteIslands() {
		String s = "delete from mdk.islands";
		return s;
	}
	
	public static String selectIslands() {
		String s = "select * from mdk.islands";
		return s;
	}
}