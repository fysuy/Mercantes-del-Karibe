package uy.com.karibe;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("Game")
public class GameService {
    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String getIt() {
        return "Partida obtenida";
    }
    
    @POST
    @Produces(MediaType.TEXT_PLAIN)
    public String saveIt() {
        return "Partida guardada";
    }
}
