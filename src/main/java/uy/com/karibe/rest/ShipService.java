/*
 * MapService.java
 *
 * MDK 4.0.1 - Implementacion de los servicios REST para las naves
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
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import com.google.gson.Gson;
import com.mysql.jdbc.Connection;

import uy.com.karibe.access.DatabaseAccess;
import uy.com.karibe.domain.Player;
import uy.com.karibe.domain.Ship;

@Path("/ships")
@Singleton
public class ShipService {
	private Connection con;
	
	public ShipService() {
		try {
			Properties p = new Properties();
			ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
			InputStream input = classLoader.getResourceAsStream("Config.properties");
			p.load(input);
			String driver = p.getProperty("persistencia.driver");
			String url = p.getProperty("persistencia.services");
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
	@Path("{gId}")
	@Produces(MediaType.APPLICATION_JSON)
	public String getShips (@PathParam("gId") int gameId) {
		List<Ship> ships = DatabaseAccess.selectShips(con, gameId);
		return new Gson().toJson(ships);
	}
	
	@GET
	@Path("getRoleByNickname/{gId}/{nickname}")
	@Produces(MediaType.TEXT_PLAIN)
	public String getRoleByNickname (@PathParam("gId") int gameId, 
			@PathParam("nickname") String nickname) {
		String role = DatabaseAccess.getRoleByNickname(con, gameId, nickname);
		return role;
	}
	
	@POST
	@Path("updateNicknames/{gId}")
	@Consumes(MediaType.APPLICATION_JSON)
	public void updateNicknameByRole (@PathParam("gId") int gameId, String message) {
		Player[] players = new Gson().fromJson(message, Player[].class);
		for (Player player : players) {
			DatabaseAccess.updateNicknameByRole(con, gameId, player.getName(), player.getRole());	
		}
	}
	
	@POST
	@Path("{gId}")
	@Produces(MediaType.TEXT_PLAIN)
	public String saveShips(@PathParam("gId") int gameId, String jsonShips) {	
		try {
			Ship[] ships = new Gson().fromJson(jsonShips, Ship[].class);
			
			DatabaseAccess.deleteShips(con, gameId);
			
			for (Ship ship : ships) {
				DatabaseAccess.insertShip(con, gameId, ship);
			}
		} catch (Exception e) {
			e.printStackTrace();
			return e.getMessage();
		}
		
		return "success";
	}
}