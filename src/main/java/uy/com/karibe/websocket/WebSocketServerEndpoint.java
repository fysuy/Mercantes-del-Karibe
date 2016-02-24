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

	private static final Set<Session> sessions = Collections.synchronizedSet(new HashSet<Session>());

	@OnOpen
	public void onOpen(Session session){
		  	System.out.println(session.getId() + " has opened a connection"); 
	        sendMessageToAll("User has connected");
	        try {
	            session.getBasicRemote().sendText("Connection Established");
	        } catch (IOException ex) {
	            ex.printStackTrace();
	        }
	        sessions.add(session);
	}

	@OnClose
	public void onClose(Session session){
	        sessions.remove(session);
	        System.out.println("Session " +session.getId()+" has ended");
	        sendMessageToAll("User has disconnected");
	}

	//@OnMessage
	//public void handleMessage(String msg, Session userSession) throws IOException {
		/*String user = (String) userSession.getUserProperties().get("user");
		if(user == null) {
			userSession.getUserProperties().put("user", msg);
		} else {
			Iterator<Session> iterator = users.iterator();
			while(iterator.hasNext()){
				iterator.next().getBasicRemote().sendText(buildJsonData(user, msg));
			}
		}*/
	//	}
	
	 @OnMessage
	 public void onMessage(String message, Session session){
	        System.out.println("Message from " + session.getId() + ": " + message);
	        sendMessageToAll(message);
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
	
	private void sendMessageToAll(String message){
        for(Session s : sessions){
            try {
                s.getBasicRemote().sendText(message);
            } catch (IOException ex) {
                ex.printStackTrace();
            }
        }
    }
}