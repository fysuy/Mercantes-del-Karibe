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
import uy.com.karibe.domain.Port;

@Path("/map")
@Singleton
public class MapService {
	private Connection con;
	
	public MapService() {
		String driver = "com.mysql.jdbc.Driver";
		try {
			Class.forName(driver);
			String url = "jdbc:mysql://localhost:3306/mdk";
			con = (Connection) DriverManager
					.getConnection(url, "root", "toor");
		} catch (ClassNotFoundException | SQLException e) {
			System.out.println(e.getMessage());
		}
	}
	
	@GET
	@Path("/islands")
	@Produces(MediaType.APPLICATION_JSON)
	public String getIslands () {
		List<Island> islands = DatabaseAccess.selectIslands(con);
		return new Gson().toJson(islands);
	}
	
	@GET
	@Path("/ports")
	@Produces(MediaType.APPLICATION_JSON)
	public String getPorts () {
		List<Port> ports = DatabaseAccess.selectPorts(con);
		return new Gson().toJson(ports);
	}
	
	@POST
	@Produces(MediaType.TEXT_PLAIN)
	@Path("/islands")
	public String saveIslands(String jsonIslands) {	
		try {
			Island[] islands = new Gson().fromJson(jsonIslands, Island[].class);
			
			DatabaseAccess.deleteIslands(con);
			
			for (Island island : islands) {
				DatabaseAccess.insertIsland(con, island);
			}
		} catch (Exception e) {
			return e.getMessage();
		}
		
		return "success";
	}

	@POST
	@Produces(MediaType.TEXT_PLAIN)
	@Path("/ports")
	public String savePorts(String jsonPorts) {	
		try {
			Port[] ports = new Gson().fromJson(jsonPorts, Port[].class);
			
			DatabaseAccess.deletePorts(con);
			
			for (Port p : ports) {
				DatabaseAccess.insertPort(con, p);
			}
		} catch (Exception e) {
			return e.getMessage();
		}
		
		return "success";
	}
}