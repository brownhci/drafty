package drafty.data;

import java.sql.Connection;
import java.sql.PreparedStatement;
import javax.naming.Context;
import javax.naming.InitialContext;
import javax.sql.DataSource;
import au.com.bytecode.opencsv.CSVReader;
import drafty.views._MainUI;

import java.io.File;
import java.io.FileReader;

public class DataImporter {
	
	//TO-DO:
	//- Generic CSV importer
		//- should maybe have it output a CSV version of old data to your file system for back-up
	//- Use to import new suggestion table from CSV file + TEST
	//- Send to Shaun and Marianne?
	//- Do the update of the suggestion table from the duplicates + TEST
	//- Put data into OpenRefine, see if there are more duplicates
	//- Read gender and cs hires paper to see if there is anything we can do differently

	String DATASOURCE_CONTEXT = _MainUI.getDataProvider().getJNDI();
	
	public DataImporter(){
		
	}
	
	//TO-DO: methods for updating other tables
	public int readCSVSuggestion(File CSV_FILE) throws Exception
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
				System.out.println(nextLine[0] + " "+ nextLine[1]+" "+nextLine[2]+" "+nextLine[3]+" "+nextLine[4]+ " "+ nextLine[5]+" "+ nextLine[6]+" "+ nextLine[7]+" "+ nextLine[8]+" "+nextLine[9]);	
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
	    return 0;
	}
	
}
