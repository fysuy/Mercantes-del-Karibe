package uy.com.karibe.domain;

public class Player {
	private String name;
	private String role;
	private String sessionId; 

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}
	
	public Player(String role, String name, String sessionId) {
		this.role = role;
		this.name = name;
		this.sessionId = sessionId;
	}

	public String getSessionId() {
		return sessionId;
	}

	public void setSessionId(String sessionId) {
		this.sessionId = sessionId;
	}
}