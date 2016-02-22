package uy.com.karibe.websocket;

import java.util.Set;
import java.util.HashSet;
import java.util.Iterator;
import java.io.IOException;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.Collections;


import javax.websocket.server.ServerEndpoint;
import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.json.JsonValue;
import javax.json.JsonWriter;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;

@ServerEndpoint("/wsServerEndpoint")
public class WebSocketServerEndpoint {

	static Set<Session> users = Collections.synchronizedSet(new HashSet<Session>());

	@OnOpen
	public void handleOpen(Session userSession){
		users.add(userSession);
	}

	@OnClose
	public void handleClose(Session userSession){
		users.remove(userSession);
	}

	@OnMessage
	public void handleMessage(String msg, Session userSession) throws IOException {
		String user = (String) userSession.getUserProperties().get("user");
		if(user == null) {
			userSession.getUserProperties().put("user", msg);
		} else {
			Iterator<Session> iterator = users.iterator();
			while(iterator.hasNext()){
				iterator.next().getBasicRemote().sendText(buildJsonData(user, msg));
			}
		}
	}

	private String buildJsonData(String user, String msg) {
		
		JsonReader jsonReader = Json.createReader(new StringReader(msg));
		JsonObject jsonObj = jsonReader.readObject();
		jsonReader.close();
			
		JsonObject jsonObject = Json.createObjectBuilder()
				.add("user", user)
				.add("x", jsonObj.getInt("x"))
				.add("y", jsonObj.getInt("y"))
				.add("angle", jsonObj.getInt("angle"))
				.build();
		
		StringWriter stringWriter = new StringWriter();
		try (JsonWriter jsonWriter = Json.createWriter(stringWriter)) {jsonWriter.write(jsonObject);}

		return stringWriter.toString();
	}
}