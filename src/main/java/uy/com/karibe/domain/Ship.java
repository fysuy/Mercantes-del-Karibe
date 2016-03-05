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
	private int x;
	private int y;
	private int rotation;
	private int health;
	private int bullets;
	
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

	public int getBullets() {
		return bullets;
	}

	public void setBullets(int bullets) {
		this.bullets = bullets;
	}

	public Ship(int x, int y, int rotation, int health, int bullets) {
		this.x = x;
		this.y = y;
		this.rotation = rotation;
		this.health = health;
		this.bullets = bullets;
	}
}