package drafty.views;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import com.vaadin.navigator.View;
import com.vaadin.navigator.ViewChangeListener.ViewChangeEvent;
import com.vaadin.server.Responsive;
import com.vaadin.ui.Button;
import com.vaadin.ui.Button.ClickEvent;
import com.vaadin.ui.VerticalLayout;

import au.com.bytecode.opencsv.CSVReader;

public class CSV_Shaun extends VerticalLayout implements View {

	static String DATASOURCE_CONTEXT =  "java:jboss/datasources/MySqlDS_Drafty";
	
	private static String csv = "/Users/shaunwallace/Documents/cs2951-R/Takeout_Final/outFinal.csv";
	static int count = 0;
	
	VerticalLayout mainLayout = new VerticalLayout();
	Button etl = new Button("etl", e -> gpsClick(e));
	Button kml = new Button("kml", e -> kmlClick(e));
	Button interpolate = new Button("interpolate", e -> interpolateClick(e));
	
	@Override
	public void enter(ViewChangeEvent event) {
		System.out.println("hello");
		
		// main layout wrapper
		mainLayout.setWidth("100%");
		mainLayout.setMargin(true);
		mainLayout.setSpacing(true);
		this.addComponent(mainLayout);
		mainLayout.addStyleName("main-wrap");
		Responsive.makeResponsive(mainLayout);
		
		mainLayout.addComponents(etl, kml, interpolate);
	}

	private void interpolateClick(ClickEvent e) {
		
	}
	
	private static void CsvImport() throws SQLException {
		
		CSVReader reader = null;
		
		try {
			reader = new CSVReader(new FileReader(csv));
		} catch (FileNotFoundException e) {
			System.out.println("Error reading gps csv: " + e);
		} finally {
			String [] nextLine;
			
			try {
				Context initialContext = new InitialContext();
			      
			    DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
			    
			    Connection conn = datasource.getConnection();
				conn.setAutoCommit(false); //commit transaction manually

				String sql = "INSERT INTO gps.point (point_id, timestampMs, timeNormalMs, timeFormatted, latitude, longitude, latitudeDeg, longitudeDeg, latitudeE7, longitudeE7, accuracy, velocity, heading, altitude) " 
							+ "VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL)";				
				
				PreparedStatement ps = conn.prepareStatement(sql);
				
				int count = 0;
				while ((nextLine = reader.readNext()) != null) {
					ps.setString(1, nextLine[0]);
					ps.setString(2, nextLine[1]);
					
					String dateTime = nextLine[2];
					dateTime = dateTime.replace("T", " ");
					dateTime = dateTime.replace("-0500", "");
					ps.setString(3, dateTime);
					
					ps.setString(4, nextLine[3]);
					ps.setString(5, nextLine[4]);
					ps.setString(6, nextLine[5]);
					ps.setString(7, nextLine[6]);
					ps.setString(8, nextLine[7]);
					ps.setString(9, nextLine[8]);
					ps.setString(10, nextLine[9]);
					ps.addBatch();
					
					count++;
				}
				ps.executeBatch();
				conn.commit();
				conn.setAutoCommit(true);
				
				conn.close();
				
				System.out.println("Total gps points google: " + count);
			} catch (IOException e) {
				System.out.println("Error reading line in google gps: " + e);
			} catch (NamingException e) {
				System.out.println("Error naming in google gps: " + e);
			}
		}
	}
	
	
	
	private void gpsClick(Event e) {
		System.out.println("gps");
		
		try {
			CsvImport();
		} catch (SQLException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
	}
	
	private void kmlClick(Event e) {
		System.out.println("kml");	
		
		//final File folder = new File("/Users/shaunwallace/Documents/cs2951-R/Takeout_Final/point_errorRate.csv");
        //listFilesForFolder(folder);
		
        CSVReader reader = null;
		
		try {
			reader = new CSVReader(new FileReader("/Users/shaunwallace/Documents/cs2951-R/Takeout_Final/point_errorRate.csv"));
		} catch (FileNotFoundException e3) {
			System.out.println("Error reading gps csv: " + e3);
		} finally {
			String [] nextLine;
			
			try {
				
				while ((nextLine = reader.readNext()) != null) {
					
				}
			} catch (IOException e5) {
				System.out.println("Error reading line in google gps: " + e5);
			}
		}
    }
}
