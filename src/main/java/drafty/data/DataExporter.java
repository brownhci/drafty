package drafty.data;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Collection;
import java.util.Iterator;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import com.vaadin.data.Container;
import com.vaadin.data.Item;
import com.vaadin.data.Property;

import drafty.views._MainUI;

//CSV Writing code in this class comes largely from Haijian Wang : https://github.com/haiwan/Exporter/blob/master/src/org/vaadin/haijian/filegenerator/CSVFileBuilder.java
public class DataExporter {
	
	protected File file;
	private FileWriter writer;
	private int num_row;
	private int num_col;
	
	String DATASOURCE_CONTEXT = _MainUI.getApi().getJNDI();

	public DataExporter(){
		
	}
	
	public void buildRowsFromContainer(Container dataSource){
		for (Iterator it = dataSource.getItemIds().iterator(); it.hasNext();){
			onNewRow();
			Item item = dataSource.getItem((Integer)it.next());
			Collection properties = item.getItemPropertyIds();
			//Because this is a publicly download, skip the id column - TODO - not working!
			boolean firstCol = true;
			for (Iterator it2 = properties.iterator(); it2.hasNext();){
				if (!firstCol){
					Property prop = item.getItemProperty(it2.next());	
					buildCell(prop.getValue());
				} else {
					firstCol = false;
				}
			}
		}
	}
	
	public void buildRowsFull() throws NamingException, SQLException{

		Context initialContext = new InitialContext();
	      
	      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
	      if (datasource != null) {
	        Connection conn = datasource.getConnection();
		
		String sql = 
        		"select o.idPerson AS idPerson,o.idSuggestionType AS idSuggestionType, o.suggestion AS suggestion, o.confidence AS confidence, p.name AS name "
        		+ "from ((drafty.Suggestion o "
        		+ "left join drafty.Suggestion b on(((o.idPerson = b.idPerson) and (o.confidence < b.confidence) and (o.idSuggestionType = b.idSuggestionType)))) "
        		+ "join drafty.Person p on((o.idPerson = p.idPerson))) "
        		+ "where o.idPerson AND isnull(b.confidence) order by o.idPerson, o.idSuggestionType "; 
		
		PreparedStatement stmt = conn.prepareStatement(sql);
		try {
        	String personId = "";
        	String typeId = "";
        	String personIdSt = "1"; //for first record
        	String typeIdSt = "2"; //always have a university
        	
        	String Full_Name = "";
        	String University = "";
        	String Bachelors = "";
        	String Masters = "";
        	String Doctorate = "";
        	String PostDoc = "";
        	String Gender = "";
        	String Rank = "";
        	String JoinYear = "";
        	String Subfield = "";
        	String PhotoUrl = "";
        	String Sources = "";
        	
        	boolean flag = false;
        	
			ResultSet rs = stmt.executeQuery();
			while (rs.next()) {
				personId = rs.getString("idPerson");
				typeId = rs.getString("idSuggestionType");
				
				if(personId.equals(personIdSt)) {
					Full_Name = rs.getString("name"); //always the same
					if(typeId.equals("2")) { //
						University = _MainUI.getApi().cleanUniversityName(rs.getString("suggestion"));
					} else if(typeId.equals("3")) { //
						Bachelors = rs.getString("suggestion");
					} else if(typeId.equals("4")) { //
						Masters = rs.getString("suggestion");
					} else if(typeId.equals("5")) { //
						Doctorate = rs.getString("suggestion");
					} else if(typeId.equals("6")) { //
						PostDoc = rs.getString("suggestion");
					} else if(typeId.equals("7")) { //
						JoinYear = rs.getString("suggestion");
					} else if(typeId.equals("8")) { //
						Rank = rs.getString("suggestion");
					} else if(typeId.equals("9")) { //
						Subfield = rs.getString("suggestion");
					} else if(typeId.equals("10")) { //
						Gender = rs.getString("suggestion");
					} else if(typeId.equals("11")) { //
						PhotoUrl = rs.getString("suggestion");
					} else if(typeId.equals("12")) { //
						Sources = rs.getString("suggestion");
					} else {
						//System.out.println(typeId + " " + Full_Name + " " + rs.getString("suggestion"));
					}
				} else {
					if(flag == false) {
						flag = true;
					} else {
						
					}
					
					if(!Full_Name.equals("")) {
						onNewRow();
						buildCell(personIdSt);
						buildCell(Full_Name);
					    buildCell(University);
					    buildCell(Bachelors);
					    buildCell(Masters);
					    buildCell(Doctorate);
					    buildCell(PostDoc);
					    buildCell(Gender);
					    buildCell(Rank);
					    buildCell(JoinYear);
					    buildCell(Subfield);
					    buildCell(PhotoUrl);
					    buildCell(Sources);
					}	
					
					//clears variables
					Full_Name = "";
					University = _MainUI.getApi().cleanUniversityName(rs.getString("suggestion")); //skipped due to logic
		        	Bachelors = "";
		        	Masters = "";
		        	Doctorate = "";
		        	PostDoc = "";
		        	Gender = "";
		        	Rank = "";
		        	JoinYear = "";
		        	Subfield = "";
		        	PhotoUrl = "";
		        	Sources = "";
				}
				
				personIdSt = personId;
				typeIdSt = typeId;
			}
		} catch (SQLException e) {
			System.out.println(e.getMessage());
		}
        conn.close();
      }
	    writeToFile();  
	}
	
	protected void onNewRow() {
        if (num_row > 0) {
            try {
                writer.append("\n");
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        num_row++;
        num_col = 0;
    }

    protected void onNewCell() {
        if (num_col > 0) {
            try {
                writer.append(",");
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        num_col++;
    }
	
    protected void buildCell(Object value) {
    	onNewCell();
        try {
        	if(value == null){
        		writer.append("");
        	}else {
        		writer.append(value.toString());
        	}
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    
    public File getFullCSVFile() {
        try {
            initTempFile(true);
            resetContent();
            buildColumnHeaders();
            buildRowsFull();
            writeToFile();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return file;
    }
    
    public File getContainerCSVFile(Container container){
    	try {
    		initTempFile(false);
    		resetContent();
    		buildColumnHeaders();
    		buildRowsFromContainer(container);
    		writeToFile();
    	}
    	catch (Exception e){
    		e.printStackTrace();
    	}
    	return file;
    }
    
    private void buildColumnHeaders(){
    	onNewRow();
		buildCell("id");
		buildCell("FullName");
		buildCell("University");
		buildCell("JoinYear");
		buildCell("Rank");
		buildCell("Subfield");
		buildCell("Bachelor");
		buildCell("Masters");
		buildCell("Doctorate");
		buildCell("PostDoc");
		buildCell("Gender");
		buildCell("PhotoUrl");
		buildCell("Sources");
		
    }

    private void initTempFile(Boolean full) throws IOException {
        if (file != null) {
            file.delete();
        }
        if (full){
        	file = File.createTempFile("drafty_export_full", ".csv");
        } else {
        	file = File.createTempFile("drafty_export_filtered", ".csv");
        }
    }
    
    protected void resetContent() {
        try {
            num_col = 0;
            num_row = 0;
            writer = new FileWriter(file);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    
    protected void writeToFile() {
        try {
            writer.flush();
            writer.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    
	
}
