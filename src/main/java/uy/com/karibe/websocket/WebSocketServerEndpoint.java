/*
 * WebSocketServerEndpoint
 *
 * MDK 4.0.1 - Implementacion del web socket, utilizado en el lobby y el juego. 
 *
 * 05/03/2016
 *
 * Copyright Drintin© 2016
 */
package uy.com.karibe.websocket;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Random;
import java.util.Set;

import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import javax.ws.rs.core.MediaType;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.WebResource;

import uy.com.karibe.domain.JsonMsg;
import uy.com.karibe.domain.Player;

@ServerEndpoint("/wsServerEndpoint/{nickname}/{new}")
public class WebSocketServerEndpoint {
	private final Object writeLock = new Object();
	private static final Set<Session> sessions = Collections.synchronizedSet(new HashSet<Session>());
	@SuppressWarnings("serial")
	private static final ArrayList<String> roles = new ArrayList<String>(){{
		add("submarine");
		add("blue");
		add("green");
	}};
	
	private static final List<Player> players = new ArrayList<Player>();
	
	//HasMap que tiene los roles disponibles del juego.Una vez que se utilice un rol se eliminara del Has.
	//private static final HashMap<String, String> playersRoles = new HashMap<String, String>();
	//HasMap que contiene los jugadores que ya ingresaron su apodo
	//private static final HashMap<String, String> playersNames = new HashMap<String, String>();
	
	public WebSocketServerEndpoint() {}
	
	@OnOpen
	synchronized public void onOpen(@PathParam("new") String newGame,
			@PathParam("nickname") String nickname,
			Session session){
		//String role = "";
		//Client client = Client.create();
		
		//El barco seleccionado, sera escogera manera aleatoria.
		if(newGame.equals("true")) {
			Random random = new Random();
			int rnd = random.nextInt(roles.size());
			String role = roles.get(rnd);
			
			sessions.add(session);
			
			//Se agrega el jugador al hashMap de jugadores
			//playersRoles.put(session.getId(), role);
			Player p = new Player(role, nickname, session.getId());
			players.add(p);
			
			roles.remove(rnd);
		} else {					
			sessions.add(session);
			
			
			Client client = new Client();
			
			WebResource webResource = client
					   .resource("http://localhost:8080/Mercantes-del-Karibe/rest/ships/getRoleByNickname/2/" + nickname);

			String role = webResource.accept(MediaType.TEXT_PLAIN)
	                   .get(String.class);
			
			Player p = new Player(role, nickname, session.getId());
			players.add(p);
			
			roles.remove(role);
			//playersRoles.put(session.getId(), role);
			//roles.remove(clientId);
		}		
		
		if(roles.size() == 0) {
			JsonMsg initMsg = new JsonMsg("initGame", "", new Gson().toJson(players));
			sendMessageToAll(new Gson().toJson(initMsg), session, true);
		}
//		
//		JsonMsg msg = new JsonMsg("setRole", "", role);
//		
//		sendMessageToAll(new Gson().toJson(msg), session, true);
	}

	@OnClose
	synchronized public void onClose(Session session){		
		//Al cerrar la ventana del navegador, el usuario se elimina de la sesion.
		sessions.remove(session);
		
		for (Iterator<Player> iterator = players.iterator(); iterator.hasNext(); ) {
		    Player p = iterator.next();
		    if(p.getSessionId() == session.getId()) {
		    	roles.add(p.getRole());
		    	players.remove(p);
				JsonMsg shipDeadMsg = new JsonMsg("shipLeft", p.getRole() , "true");
				sendMessageToAll(new Gson().toJson(shipDeadMsg), session, false);
			}
		}
		
		//String role = (String)playersRoles.get(session.getId());
		//playersRoles.remove(session.getId());
		//playersNames.remove(session.getId());
		//roles.add(role);

	}

	@OnMessage
	synchronized public void onMessage(String message, Session session){
		Gson gson = new Gson();
		JsonElement jsonElement = new JsonParser().parse(message);
		String accion = jsonElement.getAsJsonObject().get("id").getAsString();
		//Dependiendo el tipo de mensaje, se ejecutan diferentes acciones
		switch (accion) {
//		case "settingRole":
//			//Se agrega el jugador
//			JsonMsg jsonMsgRole = new Gson().fromJson(message, JsonMsg.class);		
//			for (Iterator<Player> iterator = players.iterator(); iterator.hasNext(); ) {
//			    Player p = iterator.next();
//			    if(p.getRole() == playersRoles.get(session.getId())) {
//					p.setName(jsonMsgRole.getName());
//				}
//			}
//			
//			playersNames.put(session.getId(), jsonMsgRole.getName());
//			sendMessageToAll(message, session, false);
//			
//			//Cuando no existan mas roles disponibles, se comienza la partida.
//			if(roles.size() == 0) {
//				JsonMsg initMsg = new JsonMsg("initGame", "", new Gson().toJson(players));
//				sendMessageToAll(new Gson().toJson(initMsg), session, true);
//			}
////			Client client = Client.create();
////			WebResource webResource = client
////					.resource("http://localhost:8080/Mercantes-del-Karibe/rest/ships/1/" 
////							+ jsonMsgRole.getName() + "/" + playersRoles.get(session.getId()));
////			webResource
////					.type(MediaType.APPLICATION_JSON)
////					.post(ClientResponse.class, MediaType.APPLICATION_JSON);
//			break;
		case "getUsersConnected":
			//Se obtienen los usuarios conectados
			JsonMsg jsonMsgUsers = new Gson().fromJson(message, JsonMsg.class);
			String usersConnected = "";
			for (Iterator<Player> iterator = players.iterator(); iterator.hasNext(); ) {
			    Player p = iterator.next();
			    usersConnected += "<li>" + p.getName() + "</li>";
			}
//			for (Map.Entry<String, String> entry : playersNames.entrySet())
//			{
//				usersConnected += "<li>" + entry.getValue()+ "</li>";			
//			}
			jsonMsgUsers.setMessage(usersConnected);
			sendMessageToAll(gson.toJson(jsonMsgUsers), session,true);
		break;
		default:
			sendMessageToAll(message, session, false);
			break;
		}
	}
	//Metodo para enviar los mensajes a todos las sesiones conectadas.
	synchronized private void sendMessageToAll(String message, Session session, boolean includeSelf) {
		for (Iterator<Session> iterator = sessions.iterator(); iterator.hasNext(); ) {
			Session s = iterator.next();
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
//		for(Session s : sessions){
//			try {
//				if(s.getId() != session.getId() || includeSelf) {
//					synchronized (writeLock) {
//						s.getBasicRemote().sendText(message);	
//					}
//				}
//			} catch (IOException ex) {
//				System.out.println(ex.getMessage());
//			}
//		}
	}
}