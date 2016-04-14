package drafty.data;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.util.ArrayList;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.sql.DataSource;

import au.com.bytecode.opencsv.CSVReader;
import drafty.views._MainUI;


public class DataCleaner {
	
	String DATASOURCE_CONTEXT = _MainUI.getApi().getJNDI();
	
	public DataCleaner(){
		
	}
	
	//CSV File should be formatted as name, good_id, bad_id
	public int CleanDuplicates(File CSV_FILE){
		ArrayList<ArrayList<String>> duplicateIDs = new ArrayList<ArrayList<String>>();
		
		CSVReader reader = null;
		try {
			reader = new CSVReader(new FileReader(CSV_FILE));
		} catch (FileNotFoundException e1) {
			System.out.println("Error in Clean Duplicates - new CSV Reader" + e1);
		}
		String[] nextLine;		
		try {
			while ((nextLine = reader.readNext()) != null) {
				System.out.println(nextLine[0]+ " "+ nextLine[1]+" "+ nextLine[2]);
				ArrayList<String> values = new ArrayList<String>();
				values.add(nextLine[0]);
				values.add(nextLine[1]);
				values.add(nextLine[2]);
				duplicateIDs.add(values);
			}
			System.out.println(duplicateIDs);
			System.out.println(duplicateIDs.get(5));
			System.out.println(duplicateIDs.get(5).get(0));
			System.out.println(duplicateIDs.size());
		} catch (IOException e) {
			System.out.println("Error in Clean Duplicates - read next line");
		}
		if (reader!=null){
			try {
				reader.close();
			} catch (IOException e) {
				System.out.println("Error in CleanDuplicates - closing reader");
			}
		}
		try {
		      Context initialContext = new InitialContext();
		      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
		      if (datasource != null) {
		    	Connection conn = datasource.getConnection();  
		    	String sql = 
			        		"UPDATE Suggestion "
			        		+ "SET idPerson = ? "
			        		+ "WHERE idPerson = ? ";
			    PreparedStatement stmt = conn.prepareStatement(sql); 
			    conn.setAutoCommit(false);
			    for (ArrayList<String> vals : duplicateIDs){	    	
			    	Integer good_id = Integer.parseInt(vals.get(1));
			    	Integer bad_id = Integer.parseInt(vals.get(2));
			    	System.out.println("Fixing " + vals.get(0)+ "in suggestion table, setting " + bad_id + " to "+ good_id);
		        	stmt.setInt(1, good_id);
		        	stmt.setInt(2, bad_id);
		        	stmt.addBatch();
		        }	     
		        stmt.executeBatch();
		        conn.commit();
		        stmt.close();
		        conn.close();
		      }
		 }
		catch (Exception ex)
		 {
		    System.out.println("Error in data cleaner " + ex);
		 }	
		return 0;
	}

}
