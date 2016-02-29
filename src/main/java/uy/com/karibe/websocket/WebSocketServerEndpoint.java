package uy.com.karibe.websocket;

import java.io.IOException;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import com.mysql.jdbc.Connection;

import uy.com.karibe.access.DatabaseAccess;

@ServerEndpoint("/wsServerEndpoint")
public class WebSocketServerEndpoint {

	private static final Set<Session> sessions = Collections.synchronizedSet(new HashSet<Session>());
	private Connection con;
	
	public WebSocketServerEndpoint() {
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
	
	@OnOpen
	public void onOpen(Session session){
		sessions.add(session);
	}

	@OnClose
	public void onClose(Session session){
		sessions.remove(session);
	}

	@OnMessage
	public void onMessage(String message, Session session){
		sendMessageToAll(message, session);
	}

//	private String buildJsonData(String user, String msg) {
//
//		JsonReader jsonReader = Json.createReader(new StringReader(msg));
//		JsonObject jsonObj = jsonReader.readObject();
//		jsonReader.close();
//
//		JsonObject jsonObject = Json.createObjectBuilder()
//				.add("user", user)
//				.add("x", jsonObj.getInt("x"))
//				.add("y", jsonObj.getInt("y"))
//				.add("angle", jsonObj.getInt("angle"))
//				.build();
//
//		StringWriter stringWriter = new StringWriter();
//		try (JsonWriter jsonWriter = Json.createWriter(stringWriter)) {jsonWriter.write(jsonObject);}
//
//		return stringWriter.toString();
//	}

	private void sendMessageToAll(String message, Session session) {
		for(Session s : sessions){
			try {
				if(s.getId() != session.getId()) {
					s.getBasicRemote().sendText(message);
				}
			} catch (IOException ex) {
				DatabaseAccess.insertException(con, ex);
			}
		}
	}
}