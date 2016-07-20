package drafty.services;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;

public class RestfulClient {
	
	public static void get(String arg) {

		try {
			String encodedUrl = URLEncoder.encode(arg, "UTF-8");
			
			URL url = new URL("https://www.googleapis.com/customsearch/v1?key=AIzaSyCIFDv000RPXC2jSx847iDmv4L5m6SAgi0&cx=000590875039675145372:oipz6xf0j64&q=" + encodedUrl);
			
			HttpURLConnection conn = (HttpURLConnection) url.openConnection();
			conn.setRequestMethod("GET");
			conn.setRequestProperty("Accept", "application/json");
			
			if (conn.getResponseCode() != 200) {
				throw new RuntimeException("Failed : HTTP error code : " + conn.getResponseCode());
			}
			
			BufferedReader br = new BufferedReader(new InputStreamReader((conn.getInputStream())));
			
				String output;
				System.out.println("Output from Server .... \n");
				while ((output = br.readLine()) != null) {
					System.out.println(output);
				}
				conn.disconnect();
				
		} catch (MalformedURLException e) {
			System.out.println("ERROR RestfulClient MalformedURLException: " + e);
		} catch (IOException e) {
			System.out.println("ERROR RestfulClient IOException: " + e);
		}
	}
}
