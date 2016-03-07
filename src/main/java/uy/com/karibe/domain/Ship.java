/*
 * JsonMsg.java
 *
 * MDK 4.0.1 - Clase utilizada para guardar las posiciones de las naves.
 *
 * 05/03/2016
 *
 * Copyright Drintin© 2016
 */
package uy.com.karibe.domain;

public class Ship {
	private int gameId;
	private String name;
	private int x;
	private int y;
	private int rotation;
	private int health;
	
	public int getGameId() {
		return gameId;
	}
	
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
	
	public int getX() {
		return x;
	}

	public void setX(int x) {
		this.x = x;
	}

	public int getY() {
		return y;
	}

	public void setY(int y) {
		this.y = y;
	}

	public int getRotation() {
		return rotation;
	}

	public void setRotation(int rotation) {
		this.rotation = rotation;
	}

	public int getHealth() {
		return health;
	}

	public void setHealth(int health) {
		this.health = health;
	}

	public Ship(int gameId, String name, int x, int y, int rotation, int health) {
		this.gameId = gameId;
		this.name = name;
		this.x = x;
		this.y = y;
		this.rotation = rotation;
		this.health = health;
	}
}