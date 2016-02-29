package uy.com.karibe.rest;
import java.util.HashSet;
import java.util.Set;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;

@ApplicationPath("/rest")
public class GameService extends Application {
	
	public GameService() {}
	
	@Override
	public Set<Class<?>> getClasses( )
	{
		final Set<Class<?>> returnValue = new HashSet<Class<?>>( );
		returnValue.add(IslandService.class);
		return returnValue;
	}
}