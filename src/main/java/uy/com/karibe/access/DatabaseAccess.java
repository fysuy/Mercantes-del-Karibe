package uy.com.karibe.access;

import java.util.Date;

import com.mysql.jdbc.Connection;
import com.mysql.jdbc.PreparedStatement;

import uy.com.karibe.domain.Island;

public class DatabaseAccess {
	public static void insertException(Connection con, Exception ex){
		String query = Queries.insertException();
		try
		{			
			PreparedStatement pstmt = (PreparedStatement)con.prepareStatement(query);
			pstmt.setString(1, ex.getMessage());
			pstmt.setDate(2, (java.sql.Date)new Date());
			pstmt.executeUpdate();
			pstmt.close();
		} catch(Exception e) {
			ex.printStackTrace();
		}
	}
	
	public static void insertIsland(Connection con, Island isl){
		String query = Queries.insertIsland();
		try
		{			
			PreparedStatement pstmt = (PreparedStatement)con.prepareStatement(query);
			pstmt.setInt(1, isl.getX());
			pstmt.setInt(2, isl.getY());
			pstmt.setInt(3, isl.getWidth());
			pstmt.setInt(4, isl.getHeight());
			pstmt.executeUpdate();
			pstmt.close();
		} catch(Exception ex) {
			ex.printStackTrace();
		}
	}
}