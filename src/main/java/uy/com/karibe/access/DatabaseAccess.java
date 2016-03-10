package uy.com.karibe.access;

import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import com.mysql.jdbc.Connection;
import com.mysql.jdbc.PreparedStatement;

import uy.com.karibe.domain.Island;
import uy.com.karibe.domain.Port;
import uy.com.karibe.domain.Ship;

public class DatabaseAccess {

	public static void deleteIslands(Connection con, int gameId) {
		String query = Queries.deleteIslands();
		try
		{			
			PreparedStatement pstmt = (PreparedStatement)con.prepareStatement(query);
			pstmt.setInt(1, gameId);
			pstmt.executeUpdate();
			pstmt.close();
		} catch(Exception ex) {
			ex.printStackTrace();
		}
	}
	
	public static void deleteShips(Connection con, int gameId) {
		String query = Queries.deleteShips();
		try
		{			
			PreparedStatement pstmt = (PreparedStatement)con.prepareStatement(query);
			pstmt.setInt(1, gameId);
			pstmt.executeUpdate();
			pstmt.close();
		} catch(Exception ex) {
			ex.printStackTrace();
		}
	}
	
	public static void deletePorts(Connection con, int gameId) {
		String query = Queries.deletePorts();
		try
		{			
			PreparedStatement pstmt = (PreparedStatement)con.prepareStatement(query);
			pstmt.setInt(1, gameId);
			pstmt.executeUpdate();
			pstmt.close();
		} catch(Exception ex) {
			ex.printStackTrace();
		}
	}
	
	public static List<Ship> selectShips(Connection con, int _gameId) {
		String query = Queries.selectShips();
		List<Ship> ships = new ArrayList<Ship>();
		
		try {
			PreparedStatement pstmt = (PreparedStatement)con.prepareStatement(query);
			pstmt.setInt(1, _gameId);			
			ResultSet rs = pstmt.executeQuery();
			while(rs.next()) {
				int gameId = rs.getInt("gameId");
				String name = rs.getString("name");
				int x = rs.getInt("x");
				int y = rs.getInt("y");
				int rotation = rs.getInt("rotation");
				String state = rs.getString("state");
				int health = rs.getInt("health");
				String nickname = rs.getString("nickname");
				
				Ship s = new Ship(gameId, name, x, y, rotation, health, state, nickname);
				ships.add(s);
			}
			rs.close();
			pstmt.close();
		} catch(Exception ex) {
			ex.printStackTrace();
		}
		
		return ships;
	}
	
	public static void updateNicknameByRole(Connection con, 
			int _gameId, String _nickname, String _role) {
		String query = Queries.updateNicknameByRole();
		try {
			PreparedStatement pstmt = (PreparedStatement)con.prepareStatement(query);
			pstmt.setString(1, _nickname);
			pstmt.setString(2, _role);
			pstmt.setInt(3, _gameId);
			pstmt.executeUpdate();
			pstmt.close();
		} catch(Exception ex) {
			ex.printStackTrace();
		}
	}
	
	public static String getRoleByNickname(Connection con, int _gameId, String _nickname) {
		String query = Queries.getRoleByNickname();
		String role = "";
		try {
			PreparedStatement pstmt = (PreparedStatement)con.prepareStatement(query);
			pstmt.setString(1, _nickname);
			pstmt.setInt(2, _gameId);
			ResultSet rs = pstmt.executeQuery();
			while(rs.next()) {
				role = rs.getString("name");
			}
			rs.close();
			pstmt.close();
		} catch(Exception ex) {
			ex.printStackTrace();
		}
		
		return role;
	}
	
	public static List<Island> selectIslands(Connection con, int _gameId) {
		String query = Queries.selectIslands();
		List<Island> islands = new ArrayList<Island>();
		
		try
		{			
			PreparedStatement pstmt = (PreparedStatement)con.prepareStatement(query);
			pstmt.setInt(1, _gameId);			
			ResultSet rs = pstmt.executeQuery();
			while(rs.next()) {
				int gameId = rs.getInt("gameId");
				int x = rs.getInt("x");
				int y = rs.getInt("y");
				int width = rs.getInt("width");
				int height = rs.getInt("height");
				
				Island isl = new Island(gameId, x, y, width, height);
				islands.add(isl);
			}
			rs.close();
			pstmt.close();
		} catch(Exception ex) {
			ex.printStackTrace();
		}
		
		return islands;
	}
	
	public static List<Port> selectPorts(Connection con, int _gameId) {
		String query = Queries.selectPorts();
		List<Port> ports = new ArrayList<Port>();
		
		try
		{			
			PreparedStatement pstmt = (PreparedStatement)con.prepareStatement(query);
			pstmt.setInt(1, _gameId);			
			ResultSet rs = pstmt.executeQuery();
			while(rs.next()) {
				int gameId = rs.getInt("gameId");
				String name = rs.getString("name");
				int x = rs.getInt("x");
				
				Port p = new Port(gameId, x, name);
				ports.add(p);
			}
			rs.close();
			pstmt.close();
		} catch(Exception ex) {
			ex.printStackTrace();
		}
		
		return ports;
	}
	
	public static void insertIsland(Connection con, int gameId, Island isl){
		String query = Queries.insertIsland();
		try
		{			
			PreparedStatement pstmt = (PreparedStatement)con.prepareStatement(query);
			pstmt.setInt(1, isl.getX());
			pstmt.setInt(2, isl.getY());
			pstmt.setInt(3, isl.getWidth());
			pstmt.setInt(4, isl.getHeight());
			pstmt.setInt(5, gameId);
			pstmt.executeUpdate();
			pstmt.close();
		} catch(Exception ex) {
			ex.printStackTrace();
		}
	}
	
	public static void insertPort(Connection con, int gameId, Port p){
		String query = Queries.insertPort();
		try
		{			
			PreparedStatement pstmt = (PreparedStatement)con.prepareStatement(query);
			pstmt.setString(1, p.getName());
			pstmt.setInt(2, p.getX());
			pstmt.setInt(3, gameId);
			pstmt.executeUpdate();
			pstmt.close();
		} catch(Exception ex) {
			ex.printStackTrace();
		}
	}
	
	public static void insertShip(Connection con, int gameId, Ship s){
		String query = Queries.insertShip();
		try
		{			
			PreparedStatement pstmt = (PreparedStatement)con.prepareStatement(query);
			pstmt.setString(1, s.getName());
			pstmt.setInt(2, s.getX());
			pstmt.setInt(3, s.getY());
			pstmt.setInt(4, s.getRotation());
			pstmt.setInt(5, s.getHealth());
			pstmt.setString(6, s.getState());
			pstmt.setInt(7, gameId);
			pstmt.setString(8, s.getNickname());
			pstmt.executeUpdate();
			pstmt.close();
		} catch(Exception ex) {
			ex.printStackTrace();
		}
	}
}