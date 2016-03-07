/*
 * Port.java
 *
 * MDK 4.0.1 - Clase utlizada para guardar la posicion de los puertos.
 *
 * 05/03/2016
 *
 * Copyright Drintin© 2016
 */
package uy.com.karibe.domain;

public class Port {
	private int gameId;
	private int x;
	private String name;
	
	public int getGameId() {
		return gameId;
	}
	
	public int getX() {
		return x;
	}
	
	public String getName() {
		return name;
	}
	
	public void setX(int x) {
		this.x = x;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public Port(int gameId, int x, String name) {
		this.gameId = gameId;
		this.x = x;
		this.name = name;
	}
}