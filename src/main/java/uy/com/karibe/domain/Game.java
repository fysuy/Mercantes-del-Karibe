package uy.com.karibe.domain;

import java.sql.DriverManager;

import com.mysql.jdbc.Connection;

import uy.com.karibe.access.DatabaseAccess;

public class Game {
	public static String getMap() throws Exception {
		String driver = "com.mysql.jdbc.Driver";
		Class.forName(driver);

		String url = "jdbc:mysql://localhost:3306/mdk";
		Connection con = (Connection) DriverManager.getConnection(url, "root", "toor");

		return DatabaseAccess.getMap(con);
	}
}