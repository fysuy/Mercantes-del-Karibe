package uy.com.karibe.websocket;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Random;
import java.util.Set;

import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;

import uy.com.karibe.domain.JsonMsg;

@ServerEndpoint("/wsServerEndpoint")
public class WebSocketServerEndpoint {
	
	private final Object writeLock = new Object();
	private static final Set<Session> sessions = Collections.synchronizedSet(new HashSet<Session>());
	@SuppressWarnings("serial")
	private static final ArrayList<String> roles = new ArrayList<String>(){{
		add("submarine");
		add("blue");
		add("green");
	}};
	
	private static final HashMap<String, String> playersRoles = new HashMap<String, String>();
	private static final HashMap<String, String> playersNames = new HashMap<String, String>();
	
	public WebSocketServerEndpoint() {}
	
	@OnOpen
	synchronized public void onOpen(Session session){
		Random random = new Random();
		int rnd = random.nextInt(roles.size());
		String role = roles.get(rnd);
		
		sessions.add(session);
		playersRoles.put(session.getId(), role);
		roles.remove(rnd);
		
		JsonMsg msg = new JsonMsg("setRole", "", role);
		
		sendMessageToAll(new Gson().toJson(msg), session, true);
		
		if(roles.size() == 0) {
			JsonMsg initMsg = new JsonMsg("initGame", "", "true");
			sendMessageToAll(new Gson().toJson(initMsg), session, true);
		}
	}

	@OnClose
	synchronized public void onClose(Session session){
		sessions.remove(session);
		String role = (String)playersRoles.get(session.getId());
		playersRoles.remove(session.getId());
		playersNames.remove(session.getId());
		roles.add(role);
	}

	@OnMessage
	synchronized public void onMessage(String message, Session session){
		Gson gson = new Gson();
		//JsonMsg jsonMsg = new Gson().fromJson(message, JsonMsg.class);
		JsonElement jsonElement = new JsonParser().parse(message);
		String accion = jsonElement.getAsJsonObject().get("id").getAsString();
		
		switch (accion) {
		case "setRole":
			JsonMsg jsonMsgRole = new Gson().fromJson(message, JsonMsg.class);
			
			playersNames.put(session.getId(), jsonMsgRole.getName());
			sendMessageToAll(message, session, false);
			break;
		case "getUsersConnected":
			JsonMsg jsonMsgUsers = new Gson().fromJson(message, JsonMsg.class);
			String usersConnected="";
			for (Map.Entry<String, String> entry : playersNames.entrySet())
			{
				usersConnected += "<li>" + entry.getValue()+ "</li>";			
			}
			jsonMsgUsers.setMessage(usersConnected);
			sendMessageToAll(gson.toJson(jsonMsgUsers), session,true);
		break;
		default:
			sendMessageToAll(message, session, false);
			break;
		}
	}

	synchronized private void sendMessageToAll(String message, Session session, boolean includeSelf) {
		for(Session s : sessions){
			try {
				if(s.getId() != session.getId() || includeSelf) {
					synchronized (writeLock) {
						s.getBasicRemote().sendText(message);	
					}
				}
			} catch (IOException ex) {
				System.out.println(ex.getMessage());
			}
		}
	}
}