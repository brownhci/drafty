package drafty.data.fixes;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.concurrent.TimeUnit;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import au.com.bytecode.opencsv.CSVReader;
import drafty._MainUI;

public class ImportCSV_PersonFix {
	String DATASOURCE_CONTEXT = _MainUI.getApi().getJNDI();
	
	private static String csvPerson = "/Users/shaunwallace/Downloads/DraftyDataFixingMarathon-Person.csv";
	
	
	public ImportCSV_PersonFix() {
		try {
			importPerson();
		} catch (SQLException | NamingException e) {
			System.out.println("importPerson() ERROR -  " + e);
		}
	}
	
	private void importPerson() throws SQLException, NamingException {
		CSVReader reader = null;
		
		try {
			reader = new CSVReader(new FileReader(csvPerson));
		} catch (FileNotFoundException e) {
			System.out.println("Error reading ACTsegments: " + e);
		} finally {
			String [] nextLine;
			
			try {
				Context initialContext = new InitialContext(); 
			    DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
			    Connection conn = datasource.getConnection();
			    conn.setAutoCommit(false); //commit transaction manually
			    
				String sqlP = 
							"UPDATE Person SET name = ? WHERE idPerson = ?";
				String sqlS = 
							"UPDATE Suggestion SET idPerson = ? WHERE idPerson = ?";
				
				PreparedStatement stmtP = conn.prepareStatement(sqlP);
				PreparedStatement stmtS = conn.prepareStatement(sqlS);
				
				int count = 0;
				while ((nextLine = reader.readNext()) != null) {
					
					if (nextLine[0].equals("1")) {
						stmtP.setString(1, nextLine[2]);
						stmtP.setString(2, nextLine[1]);
						stmtP.addBatch();
						
						if (nextLine[3] != null && !nextLine[3].isEmpty()) {
							count++;
							stmtS.setString(1, nextLine[3]);
							stmtS.setString(2, nextLine[1]);
							stmtS.addBatch();
						}
					}
				}
				
				System.out.println("COUNT = " + count);
				
				stmtP.executeBatch();
				stmtS.executeBatch();
				
				conn.commit();
				conn.setAutoCommit(true);
				
				conn.close();

			} catch (IOException e) {
				System.out.println("Error reading line in Person: " + e);
			} catch (NamingException e) {
				System.out.println("Error naming in Person: " + e);
			}
		}
	}
}
