package uy.com.karibe.access;

import java.sql.ResultSet;

import com.mysql.jdbc.Connection;
import com.mysql.jdbc.Statement;

public class DatabaseAccess {
	public static String getMap (Connection con) throws Exception{
		String query = Queries.getMap();
		String map = "";
		try
		{			
			Statement stmt = (Statement) con.createStatement();
			ResultSet rs = stmt.executeQuery(query);
			while (rs.next())
			{	
				map = rs.getString("map");
			}
			rs.close();
			stmt.close();
				
		} catch(Exception e) {
			throw e;
		}
		
		return map;
	}
}