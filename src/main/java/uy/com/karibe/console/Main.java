package uy.com.karibe.console;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

import com.mysql.jdbc.Connection;
import com.mysql.jdbc.PreparedStatement;

public class Main {

	public static void main(String[] args) {
		Connection con = null;
		try {
			Properties p = new Properties();
			String nomArch = "src/main/resources/Config.properties";
			p.load(new FileInputStream(nomArch));
			String driver = p.getProperty("persistencia.driver");
			String url = p.getProperty("persistencia.url");
			String user = p.getProperty("persistencia.user");
			String password = p.getProperty("persistencia.password");

			/* cargo el driver */
			Class.forName(driver);
			con = (Connection) DriverManager.getConnection(url, user, password);

			/* creo la base de datos */
			String database = "CREATE DATABASE mdk";
			PreparedStatement pstmt = (PreparedStatement) con
					.prepareStatement(database);
			pstmt.executeUpdate();
			pstmt.close();

			/* creo la tabla para las islas */
			String islands = "CREATE TABLE mdk.islands "
					+ "(id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, "
					+ " x int NOT NULL, "
					+ " y int NOT NULL, "
					+ " width int NOT NULL, "
					+ " height int NOT NULL)";
			pstmt = (PreparedStatement) con.prepareStatement(islands);
			pstmt.executeUpdate();
			pstmt.close();

			/* creo la tabla de los puertos */
			String ports = "CREATE TABLE mdk.ports "
					+ "(id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, "
					+ " name varchar(50) NOT NULL, "
					+ " x INT NOT NULL)";

			pstmt = (PreparedStatement) con.prepareStatement(ports);
			pstmt.executeUpdate();
			pstmt.close();
			
			/* creo la tabla de los puertos */
			String ships = "CREATE TABLE mdk.ships "
					+ "(id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, "
					+ " name varchar(50) NOT NULL, "
					+ " x int NOT NULL, "
					+ " y int NOT NULL, "
					+ " rotation int NOT NULL, "
					+ " health int NOT NULL)";

			pstmt = (PreparedStatement) con.prepareStatement(ships);
			pstmt.executeUpdate();
			pstmt.close();
		} catch (FileNotFoundException e) {
			/* si no encuentra el archivo de configuracion */
			e.printStackTrace();
		} catch (IOException e) {
			/* si hay problema al leer el archivo de configuracion */
			e.printStackTrace();
		} catch (SQLException e) {
			/* si hay algun problema vinculado al DBMS o la BD */
			e.printStackTrace();
		} catch (ClassNotFoundException e) {
			/* si no se puede hallar la clase correspondiente al driver */
			e.printStackTrace();
		} finally {
			try {
				/* en cualquier caso, cierro la conexion */
				if (con != null)
					con.close();
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}
	}
}