package drafty.views;

import static java.lang.Math.atan2;
import static java.lang.Math.cos;
import static java.lang.Math.sin;
import static java.lang.Math.sqrt;
import static java.lang.Math.toDegrees;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.math.BigInteger;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import com.vaadin.navigator.View;
import com.vaadin.navigator.ViewChangeListener.ViewChangeEvent;
import com.vaadin.server.Responsive;
import com.vaadin.ui.Button;
import com.vaadin.ui.Button.ClickEvent;
import com.vaadin.ui.VerticalLayout;

import au.com.bytecode.opencsv.CSVReader;

public class Ginger extends VerticalLayout implements View {

	static String DATASOURCE_CONTEXT =  "java:jboss/datasources/MySqlDS_Gps";
	
	private static String csv = "/Users/shaunwallace/Documents/cs2951-R/Takeout_Final/outFinal.csv";
	static int count = 0;
	
	VerticalLayout mainLayout = new VerticalLayout();
	Button etl = new Button("etl", e -> gpsClick(e));
	Button kml = new Button("kml", e -> kmlClick(e));
	Button interpolate = new Button("interpolate", e -> interpolateClick(e));
	
	public static Map<BigInteger, latLong> mapLatLong = new HashMap<BigInteger, latLong>();
	
	//stores lat + long
	public static class latLong {
		Double lat;
		Double lng;
		
		public latLong(Double lat, Double lng) {
			setLat(lat);
			setLng(lng);
		}

		public Double getLat() {
			return lat;
		}

		public void setLat(Double lat) {
			this.lat = lat;
		}

		public Double getLng() {
			return lng;
		}

		public void setLng(Double lng) {
			this.lng = lng;
		}
	}
	
	@Override
	public void enter(ViewChangeEvent event) {
		System.out.println("hello");
		
		// main layout wrapper
		mainLayout.setWidth("100%");
		mainLayout.setMargin(true);
		mainLayout.setSpacing(true);
		this.addComponent(mainLayout);
		mainLayout.addStyleName("main-wrap");
		Responsive.makeResponsive(mainLayout);
		
		mainLayout.addComponents(etl, kml, interpolate);
	}

	private void interpolateClick(ClickEvent e) {
		try {
			interPolate();
		} catch (SQLException e1) {
			System.out.println("Error interPolate() Toplevel SQLEx: " + e);
		} catch (NamingException e1) {
			System.out.println("Error interPolate() Toplevel Naming: " + e);
		}
	}

	private void interPolate() throws SQLException, NamingException {
		try {
			Context initialContext = new InitialContext();
		      
		    DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
		    
		    Connection conn = datasource.getConnection();

			String sql_get = "SELECT * FROM point WHERE point_id > 15000 AND point_id < 20000 ORDER BY timeFormatted ASC ";
			
			PreparedStatement ps_get = conn.prepareStatement(sql_get);
			
			ResultSet rs = ps_get.executeQuery();
			
			int count = 0;
			
			while(rs.next()) {
				/* old code using MS instead
				SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
				String dateString = rs.getString("timeFormatted");
				Date newDate = null;
				try {
					newDate = sdf.parse(dateString);
				} catch (ParseException e) {
					System.out.println("Error String to Date: " + count);
				}
				*/
				
				mapLatLong.put(new BigInteger(rs.getString("timeNormalMs")), 
								new latLong(Double.parseDouble(rs.getString("latitudeRad")), 
										    Double.parseDouble(rs.getString("longitudeRad"))));
				count++;
			}
			
			System.out.println("Total collected gps points google: " + count);
			count = 0;
			ps_get.close();
			
			
			////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			//Interpolate Data now that HashMap is populated
			String sql = "INSERT INTO gps.point (point_id, data_type_id, timestampMs, timeNormalMs, timeFormatted, latitude, longitude, latitudeRad, longitudeRad, latitudeDeg, longitudeDeg, latitudeE7, longitudeE7, accuracy, velocity, heading, altitude, elevation_gpx) " 
					+ "VALUES (NULL, ?, NULL, ?, NULL, ?, ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL)";

			conn.setAutoCommit(false); //commit transaction manually
			PreparedStatement ps = conn.prepareStatement(sql);
			
			double longitudeNew = 0;
			double latitudeNew = 0;
			
			double longitudeOld = 0;
			double latitudeOld = 0;
			
			double longitude1 = 0;
			double latitude1 = 0;
			
			double longitude2A = 0;
			double latitude2A = 0;
			double longitude2B = 0;
			double latitude2B = 0;
			
			double longitude3A = 0;
			double latitude3A = 0;
			double longitude3B = 0;
			double latitude3B = 0;
			double longitude3C = 0;
			double latitude3C = 0;
			double longitude3D = 0;
			double latitude3D = 0;
			
			/*
			Double dateNew = 0.0;
			Double dateOld = 0.0;
			Double date1 = 0.0;
			Double date2A = 0.0;
			Double date2B = 0.0;
			Double date3A = 0.0;
			Double date3B = 0.0;
			Double date3C = 0.0;
			Double date3D = 0.0;
			*/
			
			BigInteger dateNew = new BigInteger("0");
			BigInteger dateOld = new BigInteger("0");
			BigInteger date1 = new BigInteger("0");
			BigInteger date2A = new BigInteger("0");
			BigInteger date2B = new BigInteger("0");
			BigInteger date3A = new BigInteger("0");
			BigInteger date3B = new BigInteger("0");
			BigInteger date3C = new BigInteger("0");
			BigInteger date3D = new BigInteger("0");
			
			int flag = 0;
			for(Entry<BigInteger, latLong> ent : mapLatLong.entrySet()){
				
				if(flag == 0) {
					flag = 1;
					
					//Old Vars
					latitudeOld = ent.getValue().lat;
					longitudeOld = ent.getValue().lng;
					dateOld = ent.getKey();
				} else {
					//New Vars
					latitudeNew = ent.getValue().lat;
					longitudeNew = ent.getValue().lng;
					dateNew = ent.getKey();
					
					//Oversample 1
					date1 = dateAverage(dateNew, dateOld);
					for(Map.Entry<Double, Double> entry : 
						interpolateLatLng(latitudeNew, longitudeNew, latitudeOld, longitudeOld, 0.5).entrySet()) {
						
							latitude1 = entry.getKey();
							longitude1 = entry.getValue();
					}
					ps.setString(1, "3");
					ps.setString(2, date1.toString());
					ps.setDouble(3, latitude1);
					ps.setDouble(4, longitude1);
					ps.addBatch();
					
					
					//Oversample 2
					date2A = dateAverage(dateNew, date1);
					for(Map.Entry<Double, Double> entry : 
						interpolateLatLng(latitudeNew, longitudeNew, latitudeOld, longitudeOld, 0.75).entrySet()) {
						
							latitude2A = entry.getKey();
							longitude2A = entry.getValue();
					}
					ps.setString(1, "4");
					ps.setString(2, date2A.toString());
					ps.setDouble(3, latitude2A);
					ps.setDouble(4, longitude2A);
					ps.addBatch();
					
					date2B = dateAverage(date1, dateOld);
					for(Map.Entry<Double, Double> entry : 
						interpolateLatLng(latitudeNew, longitudeNew, latitudeOld, longitudeOld, 0.25).entrySet()) {
						
							latitude2B = entry.getKey();
							longitude2B = entry.getValue();
					}
					ps.setString(1, "4");
					ps.setString(2, date2B.toString());
					ps.setDouble(3, latitude2B);
					ps.setDouble(4, longitude2B);
					ps.addBatch();
					
					
					//Oversample 3
					date3A = dateAverage(dateNew, date2A);
					for(Map.Entry<Double, Double> entry : 
						interpolateLatLng(latitudeNew, longitudeNew, latitudeOld, longitudeOld, 0.875).entrySet()) {
						
							latitude3A = entry.getKey();
							longitude3A = entry.getValue();
					}
					ps.setString(1, "5");
					ps.setString(2, date3A.toString());
					ps.setDouble(3, latitude3A);
					ps.setDouble(4, longitude3A);
					ps.addBatch();
					
					date3B = dateAverage(date2A, date1);
					for(Map.Entry<Double, Double> entry : 
						interpolateLatLng(latitudeNew, longitudeNew, latitudeOld, longitudeOld, 0.625).entrySet()) {
						
							latitude3B = entry.getKey();
							longitude3B = entry.getValue();
					}
					ps.setString(1, "5");
					ps.setString(2, date3B.toString());
					ps.setDouble(3, latitude3B);
					ps.setDouble(4, longitude3B);
					ps.addBatch();
					
					date3C = dateAverage(date1, date2B);
					for(Map.Entry<Double, Double> entry : 
						interpolateLatLng(latitudeNew, longitudeNew, latitudeOld, longitudeOld, 0.375).entrySet()) {
						
							latitude3C = entry.getKey();
							longitude3C = entry.getValue();
					}
					ps.setString(1, "5");
					ps.setString(2, date3C.toString());
					ps.setDouble(3, latitude3C);
					ps.setDouble(4, longitude3C);
					ps.addBatch();
					
					date3D = dateAverage(date2B, dateOld);for(Map.Entry<Double, Double> entry : 
						interpolateLatLng(latitudeNew, longitudeNew, latitudeOld, longitudeOld, 0.125).entrySet()) {
						
							latitude3D = entry.getKey();
							longitude3D = entry.getValue();
					}
					ps.setString(1, "5");
					ps.setString(2, date3D.toString());
					ps.setDouble(3, latitude3D);
					ps.setDouble(4, longitude3D);
					ps.addBatch();
					
					
					//Old Vars
					latitudeOld = latitudeNew;
					longitudeOld = longitudeNew;
					dateOld = dateNew;
					
					count++;
					/*
					count2++;
					if(count2 > 1000) {
						System.out.println("Total gps points google: " + dateTime);
						count2 = 0;
					}
					*/	
				}
			}
			ps.executeBatch();
			conn.commit();
			conn.setAutoCommit(true);
			
			conn.close();
			
			ps.close();
			
			System.out.println("Total interpolated gps points google: " + count);
		} catch (SQLException e1) {
			System.out.println("Error interpolate sql: " + e1);
		} catch (NamingException e) {
			System.out.println("Error interpolate naming: " + e);
		}
	}

	private BigInteger dateAverage(BigInteger date1, BigInteger date2) {
		
		BigInteger two = new BigInteger("2");
		BigInteger averageDate = date1.add(date2);
		averageDate = averageDate.divide(two);
		
		
		//System.out.println("Date1: " + date1 + " + Date2: " + date2 + " = avg: " + averageDate);
		
		return averageDate;
	}
	
	/*
	private Date dateAverage(Date date1, Date date2) {
		BigInteger total = BigInteger.ZERO;
		
		System.out.println("DATES: date1 = " + date1 + ", date2 = " + date2);
		
		total = BigInteger.valueOf(date1.getTime());
		total = BigInteger.valueOf(date2.getTime());
		
		BigInteger averageMillis = total.divide(BigInteger.valueOf(2));
		Date averageDate = new Date(averageMillis.longValue());
		
		return averageDate;
	}
	*/
	
	/**
    * Returns the LatLng which lies the given fraction of the way between the
    * origin LatLng and the destination LatLng.
    * @param from     The LatLng from which to start.
    * @param to       The LatLng toward which to travel.
    * @param fraction A fraction of the distance to travel.
    * @return The interpolated LatLng.
    */
   //modified from https://github.com/googlemaps/android-maps-utils/blob/master/library/src/com/google/maps/android/SphericalUtil.java
   public static Map<Double, Double> interpolateLatLng(double fromLat, double fromLng, double toLat, double toLng, double fraction) {
	   Map<Double, Double> map = new HashMap<Double, Double>();
	   
	   Map<Double, Double> mapFrom = new HashMap<Double, Double>();
	   mapFrom.put(toDegrees(fromLat), toDegrees(fromLng));
	   Map<Double, Double> mapTo = new HashMap<Double, Double>();
	   mapFrom.put(toDegrees(toLat), toDegrees(toLng));
	   
       // http://en.wikipedia.org/wiki/Slerp
       double cosFromLat = cos(fromLat);
       double cosToLat = cos(toLat);

       // Computes Spherical interpolation coefficients.
       double angle = computeAngleBetween(fromLat, fromLng, toLat, toLng);
       double sinAngle = sin(angle);
       if (sinAngle < 1E-6) {
           return mapFrom;
       }
       double a = sin((1 - fraction) * angle) / sinAngle;
       double b = sin(fraction * angle) / sinAngle;
       

       // Converts from polar to vector and interpolate.
       double x = a * cosFromLat * cos(fromLng) + b * cosToLat * cos(toLng);
       double y = a * cosFromLat * sin(fromLng) + b * cosToLat * sin(toLng);
       double z = a * sin(fromLat) + b * sin(toLat);

       // Converts interpolated vector back to polar.
       double lat = atan2(z, sqrt(x * x + y * y));
       double lng = atan2(y, x);
       map.put(toDegrees(lat), toDegrees(lng));
       return map;
   }
   
   /**
    * Returns the angle between two LatLngs, in radians. This is the same as the distance
    * on the unit sphere.
    */
   static double computeAngleBetween(double fromLat, double fromLng, double toLat, double toLng) {
	   
       return distanceRadians(Math.toRadians(fromLat), Math.toRadians(fromLng),
    		   				  Math.toRadians(toLat), Math.toRadians(toLng));
   }
	
   /**
    * Returns distance on the unit sphere; the arguments are in radians.
    */
   private static double distanceRadians(double lat1, double lng1, double lat2, double lng2) {
       return arcHav(havDistance(lat1, lat2, lng1 - lng2));
   }
   
   /**
    * Returns hav() of distance from (lat1, lng1) to (lat2, lng2) on the unit sphere.
    */
   static double havDistance(double lat1, double lat2, double dLng) {
       return hav(lat1 - lat2) + hav(dLng) * cos(lat1) * cos(lat2);
   }
   
   /**
    * Returns haversine(angle-in-radians).
    * hav(x) == (1 - cos(x)) / 2 == sin(x / 2)^2.
    */
   static double hav(double x) {
       double sinHalf = sin(x * 0.5);
       return sinHalf * sinHalf;
   }
   
   /**
    * Computes inverse haversine. Has good numerical stability around 0.
    * arcHav(x) == acos(1 - 2 * x) == 2 * asin(sqrt(x)).
    * The argument must be in [0, 1], and the result is positive.
    */
   static double arcHav(double x) {
       return 2 * Math.asin(sqrt(x));
   }
   
	private void listFilesForFolder(final File folder) {
        for (final File fileEntry : folder.listFiles()) {
            if (fileEntry.isDirectory()) {
                listFilesForFolder(fileEntry);
            } else {
                if (!fileEntry.getName().equals(".DS_Store")) {
                    System.out.println(fileEntry.getName());
                	//csv_files.add(fileEntry.getName());
                }
            }
        }
    }
	
	private static void CsvImport() throws SQLException {
		
		CSVReader reader = null;
		
		try {
			reader = new CSVReader(new FileReader(csv));
		} catch (FileNotFoundException e) {
			System.out.println("Error reading gps csv: " + e);
		} finally {
			String [] nextLine;
			
			try {
				Context initialContext = new InitialContext();
			      
			    DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
			    
			    Connection conn = datasource.getConnection();
				conn.setAutoCommit(false); //commit transaction manually

				String sql = "INSERT INTO gps.point (point_id, timestampMs, timeNormalMs, timeFormatted, latitude, longitude, latitudeDeg, longitudeDeg, latitudeE7, longitudeE7, accuracy, velocity, heading, altitude) " 
							+ "VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL)";				
				
				PreparedStatement ps = conn.prepareStatement(sql);
				
				int count = 0;
				int count2 = 0;
				while ((nextLine = reader.readNext()) != null) {
					ps.setString(1, nextLine[0]);
					ps.setString(2, nextLine[1]);
					
					String dateTime = nextLine[2];
					dateTime = dateTime.replace("T", " ");
					dateTime = dateTime.replace("-0500", "");
					ps.setString(3, dateTime);
					
					ps.setString(4, nextLine[3]);
					ps.setString(5, nextLine[4]);
					ps.setString(6, nextLine[5]);
					ps.setString(7, nextLine[6]);
					ps.setString(8, nextLine[7]);
					ps.setString(9, nextLine[8]);
					ps.setString(10, nextLine[9]);
					ps.addBatch();
					
					count++;
					/*
					count2++;
					if(count2 > 1000) {
						System.out.println("Total gps points google: " + dateTime);
						count2 = 0;
					}
					*/
				}
				ps.executeBatch();
				conn.commit();
				conn.setAutoCommit(true);
				
				conn.close();
				
				System.out.println("Total gps points google: " + count);
			} catch (IOException e) {
				System.out.println("Error reading line in google gps: " + e);
			} catch (NamingException e) {
				System.out.println("Error naming in google gps: " + e);
			}
		}
	}
	
	private static void CsvImport2() throws SQLException {
		
		CSVReader reader = null;
		
		try {
			reader = new CSVReader(new FileReader(csv));
		} catch (FileNotFoundException e) {
			System.out.println("Error reading gps csv: " + e);
		} finally {
			String [] nextLine;
			
			try {
				
				int count = 0;
				while ((nextLine = reader.readNext()) != null) {
					
					if(count < 15) {
						System.out.println(nextLine[0] + " " + nextLine[1] + " " + nextLine[2] + " " + nextLine[3] + " " + nextLine[4]  + " " + nextLine[5] + " " + nextLine[6] + " " + nextLine[7]);
						
					}
					count++;
				}
				
				System.out.println("Total gps points google: " + count);
			} catch (IOException e) {
				System.out.println("Error reading line in google gps: " + e);
			}
		}
	}
	
	private void gpsClick(Event e) {
		System.out.println("gps");
		
		try {
			CsvImport();
		} catch (SQLException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
	}
	
	private void kmlClick(Event e) {
		System.out.println("kml");	
		
		//final File folder = new File("/Users/shaunwallace/Documents/cs2951-R/Takeout_Final/point_errorRate.csv");
        //listFilesForFolder(folder);
		
        CSVReader reader = null;
		
		try {
			reader = new CSVReader(new FileReader("/Users/shaunwallace/Documents/cs2951-R/Takeout_Final/point_errorRate.csv"));
		} catch (FileNotFoundException e3) {
			System.out.println("Error reading gps csv: " + e3);
		} finally {
			String [] nextLine;
			
			try {
				
				int count = 0;
				int flag = 0;
				double diff_tot = 0;
				while ((nextLine = reader.readNext()) != null) {
					//System.out.println("Long/Lat: " + nextLine[0] + nextLine[3] + "   " + nextLine[4]);
					
					if(flag == 0 || nextLine[3].isEmpty() || nextLine[4].isEmpty()) {
						flag = 1;
					} else {
						double diff = getDistanceKm(Double.parseDouble(nextLine[1]), Double.parseDouble(nextLine[2]), 41.6568008687100000, -71.4541525888100000);
						diff_tot = diff_tot + diff;

						System.out.println("Diff in: " + diff + ", Long/Lat: " + nextLine[1] + "   " + nextLine[2]);
						count++;
					}
				}
				
				System.out.println("Avg Distance: " + diff_tot/count);
				System.out.println("Total gps points google: " + count);
			} catch (IOException e5) {
				System.out.println("Error reading line in google gps: " + e5);
			}
		}
    }

	//Haversine - modified code from: http://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
	private Double getDistanceKm(Double lat1,Double lon1,Double lat2, Double lon2) {
		  //Double R = 6371.0; // Radius of the earth in km
		  Double R = 3959.0; // Radius of the earth in miles
		  Double dLat = deg2rad(lat2-lat1);  // deg2rad below
		  Double dLon = deg2rad(lon2-lon1); 
		  Double a = 
		    Math.sin(dLat/2) * Math.sin(dLat/2) +
		    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
		    Math.sin(dLon/2) * Math.sin(dLon/2)
		    ; 
		  Double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		  Double d = R * c; // Distance in km
		  return d;
	}

	private Double deg2rad(Double deg) {
		Double answer = deg * (Math.PI/180);
		return answer;
	}
	
	private Double rad2deg(Double rad) {
		Double answer = rad * 180 / Math.PI;
		return answer;
	}
}
