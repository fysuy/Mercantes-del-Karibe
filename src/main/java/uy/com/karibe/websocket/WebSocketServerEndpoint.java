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
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.WebResource;

import uy.com.karibe.domain.JsonMsg;
import uy.com.karibe.domain.Player;

@ServerEndpoint("/wsServerEndpoint/{gId}/{nickname}")
public class WebSocketServerEndpoint {
	@SuppressWarnings("serial")
	private static final ArrayList<String> roles = new ArrayList<String>(){{
		add("submarine");
		add("blue");
		add("green");
	}};
	private final Object writeLock = new Object();
	private static final Set<Session> sessions = Collections.synchronizedSet(new HashSet<Session>());
	private static final List<Player> players = new ArrayList<Player>();
	
	public WebSocketServerEndpoint() {}
	
	@OnOpen
	synchronized public void onOpen(@PathParam("gId") int gId,
			@PathParam("nickname") String nickname,
			Session session){
		String role = "";
		
		sessions.add(session);
		
		// Nueva partida, el barco seleccionado, sera escogera manera aleatoria,
		// si el juego es reanudado se obtienen los roles en base a los apodos 
		if(gId == 1) {
			Random random = new Random();
			int rnd = random.nextInt(roles.size());
			role = roles.get(rnd);
		} else {					
			Client client = new Client();
			String url = "http://localhost:8080/Mercantes-del-Karibe/rest/ships/getRoleByNickname/" 
					+ gId + "/" + nickname;
			
			WebResource webResource = client
					   .resource(url);

			role = webResource.accept(MediaType.TEXT_PLAIN)
	                   .get(String.class);
		}		
		
		Player p = new Player(role, nickname, session.getId());
		players.add(p);
		
		roles.remove(role);
		
		if(roles.size() == 0) {
			JsonMsg initMsg = new JsonMsg("initGame", "", new Gson().toJson(players));
			sendMessageToAll(new Gson().toJson(initMsg), session, true);
		} else {
			//Se obtienen los usuarios conectados
			String usersConnected = "";
			Player _p;
			
			for (Iterator<Player> iterator = players.iterator(); iterator.hasNext(); ) {
			    _p = iterator.next();
			    usersConnected += "<li>" + _p.getName() + "</li>";
			}
			
			JsonMsg jsonMsg = new JsonMsg("setUsersConnected", "", usersConnected);
	
			sendMessageToAll(new Gson().toJson(jsonMsg), session, true);
		}
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
	}

	@OnMessage
	synchronized public void onMessage(String message, Session session){
		sendMessageToAll(message, session, false);
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
	}
}