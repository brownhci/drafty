package drafty.data;


import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.OutputStream;

import com.vaadin.ui.Upload.Receiver;
import com.vaadin.ui.Upload.SucceededEvent;
import com.vaadin.ui.Upload.SucceededListener;

public class CSVReceiver implements Receiver, SucceededListener {
	
	protected File temp;
	
	@Override
	public OutputStream receiveUpload(String filename, String mimType){
		try {
			System.out.println(filename);
			System.out.println(mimType);
			//temp = File.createTempFile("temp", ".csv");
			temp = new File("temp");
			return new FileOutputStream(temp);
		}
		catch (IOException e){
			System.out.println("Error uploading file");
			return null;
		}
	}
	public void uploadSucceeded(SucceededEvent event){
		//TO-DO
		try {
			FileReader reader = new FileReader(temp);
			DataImporter importer = new DataImporter();
			try {
				importer.readCSVSuggestion(temp);
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			try {
				reader.close();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			temp.delete();
		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}
}
