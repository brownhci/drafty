package drafty.data.fixes;

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

import au.com.bytecode.opencsv.CSVReader;
import drafty.views._MainUI;

public class ImportCSV_SuggestionFix {
	String DATASOURCE_CONTEXT = _MainUI.getApi().getJNDI();
	
	private static String csvPerson = "/Users/shaunwallace/Downloads/DraftyDataFixingMarathon-Suggestions1.csv";
	
	
	public ImportCSV_SuggestionFix() {
		importSuggestions();
	}
	
	private void importSuggestions() {
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
			    
				String sql = 
							"UPDATE Suggestion SET suggestion = ?, idSuggestionType = ? WHERE idSuggestion = ?";
				
				PreparedStatement stmt = conn.prepareStatement(sql);
				
				int count = 0;
				while ((nextLine = reader.readNext()) != null) {
					if (nextLine[0].equals("1")) {
						stmt.setString(1, nextLine[2]);
						stmt.setString(2, getSuggestionTypeID(nextLine[3]));
						stmt.setString(3, nextLine[1]);
						stmt.addBatch();
						count++;
					}
				}
				
				System.out.println("COUNT ImportCSV_SuggestionFix = " + count);
				
				stmt.executeBatch();
				
				conn.commit();
				conn.setAutoCommit(true);
				
				conn.close();

			} catch (IOException | SQLException | NamingException e) {
				System.out.println("Error reading line in Suggestion: " + e);
			}
		}
	}
	
	private String getSuggestionTypeID(String type) {
		if(type.equals("University")) {
			return "2";
		} else if(type.equals("Bachelors")) {
			return "3";
		} else if(type.equals("Masters")) {
			return "4";
		} else if(type.equals("Doctorate")) {
			return "5";
		} else if(type.equals("PostDoc")) {
			return "6";
		} else if(type.equals("JoinYear")) {
			return "7";
		} else if(type.equals("Rank")) {
			return "8";
		} else if(type.equals("Subfield")) {
			return "9";
		} else if(type.equals("Gender")) {
			return "10";
		} else if(type.equals("PhotoURL")) {
			return "11";
		} else if(type.equals("Sources")) {
			return "12";
		}
		return "";
	}
}
