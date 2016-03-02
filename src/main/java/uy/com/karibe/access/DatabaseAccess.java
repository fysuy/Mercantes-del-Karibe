package uy.com.karibe.access;

import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import com.mysql.jdbc.Connection;
import com.mysql.jdbc.PreparedStatement;
import com.mysql.jdbc.Statement;

import uy.com.karibe.domain.Island;
import uy.com.karibe.domain.Port;

public class DatabaseAccess {

	public static void deleteIslands(Connection con) {
		String query = Queries.deleteIslands();
		try
		{			
			Statement stmt = (Statement) con.createStatement();
			stmt.executeUpdate(query);
			stmt.close();
		} catch(Exception ex) {
			ex.printStackTrace();
		}
	}
	
	public static void deletePorts(Connection con) {
		String query = Queries.deletePorts();
		try
		{			
			Statement stmt = (Statement) con.createStatement();
			stmt.executeUpdate(query);
			stmt.close();
		} catch(Exception ex) {
			ex.printStackTrace();
		}
	}
	
	public static List<Island> selectIslands(Connection con) {
		String query = Queries.selectIslands();
		List<Island> islands = new ArrayList<Island>();
		
		try
		{			
			Statement stmt = (Statement) con.createStatement();
			ResultSet rs = stmt.executeQuery(query);
			while(rs.next()) {
				int x = rs.getInt("x");
				int y = rs.getInt("y");
				int width = rs.getInt("width");
				int height = rs.getInt("height");
				
				Island isl = new Island(x, y, width, height);
				islands.add(isl);
			}
			rs.close();
			stmt.close();
		} catch(Exception ex) {
			ex.printStackTrace();
		}
		
		return islands;
	}
	
	public static List<Port> selectPorts(Connection con) {
		String query = Queries.selectPorts();
		List<Port> ports = new ArrayList<Port>();
		
		try
		{			
			Statement stmt = (Statement) con.createStatement();
			ResultSet rs = stmt.executeQuery(query);
			while(rs.next()) {
				String name = rs.getString("name");
				int x = rs.getInt("x");
				
				Port p = new Port(x, name);
				ports.add(p);
			}
			rs.close();
			stmt.close();
		} catch(Exception ex) {
			ex.printStackTrace();
		}
		
		return ports;
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
	
	public static void insertPort(Connection con, Port p){
		String query = Queries.insertPort();
		try
		{			
			PreparedStatement pstmt = (PreparedStatement)con.prepareStatement(query);
			pstmt.setString(1, p.getName());
			pstmt.setInt(2, p.getX());
			pstmt.executeUpdate();
			pstmt.close();
		} catch(Exception ex) {
			ex.printStackTrace();
		}
	}
}