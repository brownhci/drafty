package drafty.data;

import java.sql.Connection;
import java.sql.PreparedStatement;
import javax.naming.Context;
import javax.naming.InitialContext;
import javax.sql.DataSource;
import au.com.bytecode.opencsv.CSVReader;
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

	public DataImporter(){
		
	}
	
	public int readCSVSuggestion(String CSV_FILE) throws Exception
	{	
		Context initialContext = new InitialContext();
	    DataSource datasource = (DataSource)initialContext.lookup("java:jboss/datasources/MySqlDS_Drafty");
	    Connection conn = datasource.getConnection();
	    
	    System.out.println("inserting from " + CSV_FILE + " into suggestion");
		
		String query = "UPDATE Suggestion "
				+ "SET idPerson = ?, idProfile = ?, idEntryType = ?, idSuggestionType = ?, "
				+ "suggestion = ?, suggestion_original = ?, comment = ?, date = ?, confidence = ?"
				+ "WHERE idSuggestion = ?";
		//TO-DO- ignore id Profile!
		PreparedStatement prep = conn.prepareStatement(query);
		
		CSVReader reader = new CSVReader(new FileReader(CSV_FILE));
		String[] nextLine;		
		while ((nextLine = reader.readNext()) != null) {

	    
	    
		}
	    return 0;
	}
	
}
