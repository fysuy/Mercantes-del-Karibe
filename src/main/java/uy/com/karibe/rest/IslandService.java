package uy.com.karibe.rest;

import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.List;

import javax.inject.Singleton;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import com.google.gson.Gson;
import com.mysql.jdbc.Connection;

import uy.com.karibe.access.DatabaseAccess;
import uy.com.karibe.domain.Island;

@Path("/island")
@Singleton
public class IslandService {
	private Connection con;
	
	public IslandService() {
		String driver = "com.mysql.jdbc.Driver";
		try {
			Class.forName(driver);
			String url = "jdbc:mysql://localhost:3306/mdk";
			con = (Connection) DriverManager
					.getConnection(url, "root", "toor");
		} catch (ClassNotFoundException | SQLException e) {
			DatabaseAccess.insertException(con, e);
		}
	}
	
	@GET
	@Path("/isOk")
	@Produces(MediaType.TEXT_PLAIN)
	public String isOk () {
		return "Ok!";
	}
	
	@GET
	@Path("/getIslands")
	@Produces(MediaType.APPLICATION_JSON)
	public String getIslands () {
		List<Island> islands = DatabaseAccess.selectIslands(con);
		return new Gson().toJson(islands);
	}
	
	@POST
	@Path("/saveIslands")
	public void saveIslands(String jsonIslands) {
		Island[] islands = new Gson().fromJson(jsonIslands, Island[].class);
		
		DatabaseAccess.deleteIslands(con);
		
		for (Island island : islands) {
			DatabaseAccess.insertIsland(con, island);
		}
	}
}