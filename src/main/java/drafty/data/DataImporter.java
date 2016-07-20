package drafty.data;

import java.sql.Connection;
import java.sql.PreparedStatement;
import javax.naming.Context;
import javax.naming.InitialContext;
import javax.sql.DataSource;
import au.com.bytecode.opencsv.CSVReader;
import drafty._MainUI;

import java.io.File;
import java.io.FileReader;

public class DataImporter {

	String DATASOURCE_CONTEXT = _MainUI.getApi().getJNDI();
	
	public DataImporter(){
	}
	
	public void readCSV(String table, File CSV_FILE){
		switch(table){
			case "suggestion": try {
				readCSVSuggestion(CSV_FILE);
			} catch (Exception e1) {
				System.out.println("Error Exception - readCSV(String table, File CSV_FILE) - importer.readCSVSuggestion(temp):" + e1);
			}
				break;
			case "person":  try {
				readCSVPerson(CSV_FILE);
			} catch (Exception e) {
				System.out.println("Error Exception - readCSV(String table, File CSV_FILE) - importer.readCSVSuggestion(temp):" + e);
			}
				break;
		}
	}
	
	public void readCSVSuggestion(File CSV_FILE) throws Exception
	{	
		Context initialContext = new InitialContext();
	    DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
	    Connection conn = datasource.getConnection();
	    conn.setAutoCommit(false);
	    
	    System.out.println("inserting from " + CSV_FILE + " into suggestion");
		
		String query = "UPDATE Suggestion "
				+ "SET idPerson = ?, idEntryType = ?, idSuggestionType = ?, "
				+ "suggestion = ?, suggestion_original = ?, comment = ?, date = ?, confidence = ? "
				+ "WHERE idSuggestion = ? ";
		PreparedStatement prep = conn.prepareStatement(query);
		
		CSVReader reader = new CSVReader(new FileReader(CSV_FILE));
		String[] nextLine;		
		while ((nextLine = reader.readNext()) != null) {
			if (nextLine.length > 2){
				//System.out.println(nextLine[0] + " "+ nextLine[1]+" "+nextLine[2]+" "+nextLine[3]+" "+nextLine[4]+ " "+ nextLine[5]+" "+ nextLine[6]+" "+ nextLine[7]+" "+ nextLine[8]+" "+nextLine[9]);	
				prep.setString(1, nextLine[1]); //idPerson
				//prep.setString(2, nextLine[2]); //ignore idProfile
				prep.setString(2, nextLine[3]); //idEntryType
				prep.setString(3, nextLine[4]); //idSuggestionType
				prep.setString(4, nextLine[5]); //suggestion
				prep.setString(5, nextLine[6]); //suggestion_original
				prep.setString(6, nextLine[7]); //comment
				prep.setString(7, nextLine[8]); //date
				prep.setString(8, nextLine[9]); //confidence
				prep.setString(9, nextLine[0]); //idSuggestion
				prep.addBatch();
			}
		}
		prep.executeBatch();
		conn.commit();
		conn.setAutoCommit(true);
		conn.close();
		prep.close();
		reader.close();
	}
	
	public void readCSVPerson(File CSV_FILE) throws Exception
	{	
		Context initialContext = new InitialContext();
	    DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
	    Connection conn = datasource.getConnection();
	    conn.setAutoCommit(false);
	    
	    System.out.println("inserting from " + CSV_FILE + " into person");
		
		String query = "UPDATE person "
				+ "SET name = ? "
				+ "WHERE idPerson = ? ";
		PreparedStatement prep = conn.prepareStatement(query);
		
		CSVReader reader = new CSVReader(new FileReader(CSV_FILE));
		String[] nextLine;		
		while ((nextLine = reader.readNext()) != null) {
			if (nextLine.length > 1){
				System.out.println(nextLine[0] + " "+ nextLine[1]);
				prep.setString(1, nextLine[1]); //name
				prep.setString(2, nextLine[0]); //idPerson
				prep.addBatch();
			}
		}
		prep.executeBatch();
		conn.commit();
		conn.setAutoCommit(true);
		conn.close();
		prep.close();
		reader.close();
	}
}
