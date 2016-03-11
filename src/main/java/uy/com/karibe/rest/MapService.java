/*
 * MapService.java
 *
 * MDK 4.0.1 - Implementacion de los servicios REST para el mapa
 *
 * 06/03/2016
 *
 * Copyright Drintin© 2016
 */
package uy.com.karibe.rest;

import java.io.IOException;
import java.io.InputStream;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.List;
import java.util.Properties;

import javax.inject.Singleton;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
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
		try {
			Properties p = new Properties();		
			ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
			InputStream input = classLoader.getResourceAsStream("Config.properties");
			p.load(input);
			String driver = p.getProperty("persistencia.driver");
			String url = p.getProperty("persistencia.url");
			String user = p.getProperty("persistencia.user");
			String password = p.getProperty("persistencia.password");

			/* cargo el driver */
			Class.forName(driver);
			con = (Connection) DriverManager.getConnection(url, user, password);
		} catch (ClassNotFoundException | SQLException | IOException e) {
			e.printStackTrace();
		}
	}
	
	@GET
	@Path("/islands/{gId}")
	@Produces(MediaType.APPLICATION_JSON)
	public String getIslands (@PathParam("gId") int gameId) {
		List<Island> islands = DatabaseAccess.selectIslands(con, gameId);
		return new Gson().toJson(islands);
	}
	
	@GET
	@Path("/ports/{gId}")
	@Produces(MediaType.APPLICATION_JSON)
	public String getPorts (@PathParam("gId") int gameId) {
		List<Port> ports = DatabaseAccess.selectPorts(con, gameId);
		return new Gson().toJson(ports);
	}
	
	@POST
	@Produces(MediaType.TEXT_PLAIN)
	@Path("/islands/{gId}")
	public String saveIslands(@PathParam("gId") int gameId, String jsonIslands) {	
		try {
			Island[] islands = new Gson().fromJson(jsonIslands, Island[].class);
			
			DatabaseAccess.deleteIslands(con, gameId);
			
			for (Island island : islands) {
				DatabaseAccess.insertIsland(con, gameId, island);
			}
		} catch (Exception e) {
			e.printStackTrace();
			return e.getMessage();
		}
		
		return "success";
	}

	@POST
	@Produces(MediaType.TEXT_PLAIN)
	@Path("/ports/{gId}")
	public String savePorts(@PathParam("gId") int gameId, String jsonPorts) {	
		try {
			Port[] ports = new Gson().fromJson(jsonPorts, Port[].class);
			
			DatabaseAccess.deletePorts(con, gameId);
			
			for (Port p : ports) {
				DatabaseAccess.insertPort(con, gameId, p);
			}
		} catch (Exception e) {
			e.printStackTrace();
			return e.getMessage();
		}
		
		return "success";
	}
}