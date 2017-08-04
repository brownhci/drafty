package drafty.csimport;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;

import com.vaadin.navigator.View;
import com.vaadin.navigator.ViewChangeListener.ViewChangeEvent;
import com.vaadin.ui.VerticalLayout;

import au.com.bytecode.opencsv.CSVReader;

public class CsImporter extends VerticalLayout implements View {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 4152234697222274539L;

	CSVReader csv = null;
	
	@Override
	public void enter(ViewChangeEvent event) {
		
	}
	
	public CsImporter() {
		csv = getCSV("https://raw.githubusercontent.com/emeryberger/CSrankings/gh-pages/dblp-aliases.csv");
		csv = getCSV("https://github.com/emeryberger/CSrankings/blob/gh-pages/homepages.csv");
		csv = getCSV("https://raw.githubusercontent.com/emeryberger/CSrankings/gh-pages/generated-author-info.csv");
		csv = getCSV("");
		csv = getCSV("");
		System.out.println("DONE - CS Importer");
	}
	
	private CSVReader getCSV(String url) {
		CSVReader reader = null;
		try {
			URL stockURL = new URL(url);
			BufferedReader in = new BufferedReader(new InputStreamReader(stockURL.openStream()));
			reader = new CSVReader(in);
		} catch (IOException e) {
			e.printStackTrace();
		}
		return reader;
	}
}
