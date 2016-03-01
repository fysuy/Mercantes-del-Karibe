package uy.com.karibe.domain;

public class Port {
	private int x;
	private String name;
	
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
	
	public Port(int x, String name) {
		this.x = x;
		this.name = name;
	}
}