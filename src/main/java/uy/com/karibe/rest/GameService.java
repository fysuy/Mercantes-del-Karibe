package uy.com.karibe.rest;
import java.sql.DriverManager;
import java.sql.SQLException;

import javax.inject.Singleton;
import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.ws.rs.POST;
import javax.ws.rs.Path;

import com.mysql.jdbc.Connection;

import uy.com.karibe.access.DatabaseAccess;
import uy.com.karibe.domain.Island;

@Path("/game")
@Singleton
public class GameService {
	public Connection con;

	public GameService() {
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
	
	@POST
	@Path("/saveIslands")
	public void saveIslands(String jsonIslands) {
		JsonArray jsonArray = Json
				.createArrayBuilder()
				.add(jsonIslands)
				.build();

		int x;
		int y;
		int width;
		int height;

		for (int i = 0; i < jsonArray.size(); i++) {
			JsonObject island = jsonArray.getJsonObject(i);
			x = island.getInt("x");
			y = island.getInt("y");
			width = island.getInt("width");
			height = island.getInt("height");

			Island isl = new Island(x, y, width, height);
			DatabaseAccess.insertIsland(con, isl);
		}
	}
}
