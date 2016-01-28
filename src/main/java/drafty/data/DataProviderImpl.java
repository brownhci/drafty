package drafty.data;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.net.URL;
import java.nio.charset.Charset;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.sql.DataSource;

import com.google.common.base.Predicate;
import com.google.common.collect.Collections2;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import drafty.models.DraftyNotification;

/**
 * A dummy implementation for the backend API.
 */
public class DataProviderImpl implements DataProvider {

    //private static Random rand = new Random();

    //Can add future feature for notifications
    //private final Collection<DashboardNotification> notifications = DummyDataGenerator.randomNotifications();
    private final Collection<DraftyNotification> notifications = null;	

    /**
     * Initialize the data for this application.
     */
    public DataProviderImpl() {
        
    }

    /* JSON utility method */
    private static String readAll(Reader rd) throws IOException {
        StringBuilder sb = new StringBuilder();
        int cp;
        while ((cp = rd.read()) != -1) {
            sb.append((char) cp);
        }
        return sb.toString();
    }

    /* JSON utility method */
    @SuppressWarnings("unused")
	private static JsonObject readJsonFromUrl(String url) throws IOException {
        InputStream is = new URL(url).openStream();
        try {
            BufferedReader rd = new BufferedReader(new InputStreamReader(is,
                    Charset.forName("UTF-8")));
            String jsonText = readAll(rd);
            JsonElement jelement = new JsonParser().parse(jsonText);
            JsonObject jobject = jelement.getAsJsonObject();
            return jobject;
        } finally {
            is.close();
        }
    }

    /* JSON utility method */
    @SuppressWarnings("unused")
	private static JsonObject readJsonFromFile(File path) throws IOException {
        BufferedReader rd = new BufferedReader(new FileReader(path));
        String jsonText = readAll(rd);
        JsonElement jelement = new JsonParser().parse(jsonText);
        JsonObject jobject = jelement.getAsJsonObject();
        return jobject;
    }
    
    @Override
    public int getUnreadNotificationsCount() {
        Predicate<DraftyNotification> unreadPredicate = new Predicate<DraftyNotification>() {
            @Override
            public boolean apply(DraftyNotification input) {
                return !input.isRead();
            }
        };
        return Collections2.filter(notifications, unreadPredicate).size();
    }

    @Override
    public Collection<DraftyNotification> getNotifications() {
        for (DraftyNotification notification : notifications) {
            notification.setRead(true);
        }
        return Collections.unmodifiableCollection(notifications);
    }


    @Override
	public String getJNDI() {
		return "java:jboss/datasources/MySqlDS_Drafty";
	}
    
    public List<String> getUniversitiesUSACan() {
		List<String> list = new ArrayList<String>();
		
		try {
	      Context initialContext = new InitialContext();
	      DataSource datasource = (DataSource)initialContext.lookup(getJNDI());
	      if (datasource != null) {
	        Connection conn = datasource.getConnection();
	        String sql = 
	        		"SELECT * FROM UniversityName "
	        		+ "WHERE name LIKE '%- USA%' OR "
	        		+ "name LIKE '%- Canada%' OR "
	        		+ "name LIKE '%(USA)%' OR "
	        		+ "name LIKE '%(Canada%' ";
	        PreparedStatement stmt = conn.prepareStatement(sql);
	        try {
	        	ResultSet rs = stmt.executeQuery();
				while (rs.next()) {
					list.add(rs.getString("name"));
				}
	        } catch (SQLException e) {
				System.out.println("Error: 1 getUniversitiesUSACan(): " + e.getMessage());
			}
	        stmt.close();
	        conn.close();
	      }
	    }
        catch (Exception ex)
        {
        	System.out.println("Error: 2 getUniversitiesUSACan():  " + ex);
        }	
		
		return list;
	}
	
    public List<String> getUniversities() {
		List<String> list = new ArrayList<String>();
		
		try {
	      Context initialContext = new InitialContext();
	      DataSource datasource = (DataSource)initialContext.lookup(getJNDI());
	      if (datasource != null) {
	        Connection conn = datasource.getConnection();
	        String sql = 
	        		"SELECT name FROM  UniversityName LIMIT 531 OFFSET 1";
	        PreparedStatement stmt = conn.prepareStatement(sql);
	        try {
	        	ResultSet rs = stmt.executeQuery();
				while (rs.next()) {
					list.add(rs.getString("name"));
				}
	        } catch (SQLException e) {
				System.out.println("Error: 1 getUniversities(): " + e.getMessage());
			}
	        stmt.close();
	        conn.close();
	      }
	    }
        catch (Exception ex)
        {
        	System.out.println("Error: 2 getUniversities():  " + ex);
        }	
		
		return list;
	}
	
    public List<String> getSubfields() {
		List<String> list = new ArrayList<String>();
		
		try {
	      Context initialContext = new InitialContext();
	      DataSource datasource = (DataSource)initialContext.lookup(getJNDI());
	      
	      if (datasource != null) {
	        Connection conn = datasource.getConnection();
	        String sql = "SELECT name FROM  SubfieldName LIMIT 25 OFFSET 1";
	        PreparedStatement stmt = conn.prepareStatement(sql);
	        try {
	        	ResultSet rs = stmt.executeQuery();
				while (rs.next()) {
					list.add(rs.getString("name"));
				}
	        } catch (SQLException e) {
				System.out.println(e.getMessage());
			}
	        stmt.close();
	        conn.close();
	      }
	    }
        catch (Exception ex)
        {
        	System.out.println("Exception checkIpAddress() " + ex);
        }	
		
		return list;
	}
    
    public String getIdSuggestion(String person_id, String value, String column) throws SQLException {
		String idSuggestion = null;
		
		try {
		      Context initialContext = new InitialContext();
		      DataSource datasource = (DataSource)initialContext.lookup(getJNDI());
		      
		      if (datasource != null) {
		        Connection conn = datasource.getConnection();
		        String sql = 
		        		"SELECT count(s.idSuggestion) as exist, s.idSuggestion "
		        		+ "FROM Suggestion s "
		        		+ "INNER JOIN SuggestionType st ON st.idSuggestionType = s.idSuggestionType "
		        		+ "WHERE s.idPerson = ? "
		        		+ "AND s.suggestion = ? "
		        		+ "AND st.type = ? "
		        		+ "GROUP BY confidence "
		        		+ "ORDER BY confidence desc "
		        		+ "LIMIT 1";
		        PreparedStatement stmt = conn.prepareStatement(sql);
		        stmt.setString(1, person_id);
		        stmt.setString(2, value);
		        stmt.setString(3, column);
		        try {
		        	ResultSet rs = stmt.executeQuery();
					while (rs.next()) {
						if(!rs.getString("exist").equals("0")) {
							idSuggestion = rs.getString("idSuggestion");
							//System.out.println("getIdSuggestionMaxConf(): person_id = " + person_id + ", value = " + value + ", column = " + column);
						}
					}
		        } catch (SQLException e) {
					System.out.println(e.getMessage());
				}
		        conn.close();
		      }
		    }
	        catch (Exception ex)
	        {
	        	System.out.println("Exception" + ex);
	        }
			return idSuggestion;
	}
    
    public String cleanUniversityName(String name) {

		name = name.replaceAll(" - USA", "");
		name = name.replaceAll(" - Canada", "");
		name = name.replaceAll(" (USA)", "");
		name = name.replaceAll(" (Canada)", "");
		
		return name;
	}
}
