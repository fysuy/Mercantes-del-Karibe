package uy.com.karibe.access;

import java.util.Date;

import com.mysql.jdbc.Connection;
import com.mysql.jdbc.PreparedStatement;

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
}