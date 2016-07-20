package drafty.services;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import drafty._MainUI;

public class StatsService {

	
	public String getAllStats() {
		String experiment_id = null;
		String count = null;
		
		try {
			
			int visits = 0;
			
			String sql = "SELECT COUNT(*) as count, idExperiment, visits FROM Experiment_Profile WHERE idProfile = ?";
	        PreparedStatement stmt =  _MainUI.getApi().getConnStmt(sql);
	        stmt.setString(1, _MainUI.getApi().getProfile().getIdProfile());
	        
        	ResultSet rs = stmt.executeQuery();
			while (rs.next()) {
				count = rs.getString("count");
				if(!count.equals("0")) {
					experiment_id = rs.getString("idExperiment");
					visits = rs.getInt("visits");
		        }
			}
	        
	        stmt.getConnection().close();
	        stmt.close();
	        
		} catch (SQLException e) {
			System.out.println("ERROR getAllStats(): " + e);
		}
		
		return "";
	}
}

/*

PROFILE:

SELECT count(*) FROM Profile
SELECT SUM(logins) FROM Profile

SELECT count(*) FROM Validation;

SELECT count(*) FROM Validation WHERE mode = 'experiment';

SELECT count(*) FROM Validation WHERE date_completed IS NOT NULL;


*/ 

/*

June 30th

mysql> select count(*) from Profile;
+----------+
| count(*) |
+----------+
|      367 |
+----------+
1 row in set (0.00 sec)

mysql> SELECT SUM(logins) FROM Profile;
+-------------+
| SUM(logins) |
+-------------+
|         397 |
+-------------+
1 row in set (0.00 sec)

mysql> SELECT count(*) FROM Validation;
+----------+
| count(*) |
+----------+
|       62 |
+----------+
1 row in set (0.00 sec)

mysql> SELECT count(*) FROM Click;
+----------+
| count(*) |
+----------+
|       98 |
+----------+
1 row in set (0.01 sec)

mysql> SELECT count(*) FROM Filter;
+----------+
| count(*) |
+----------+
|      126 |
+----------+
1 row in set (0.00 sec)

mysql> SELECT count(*) FROM Validation WHERE mode = 'experiment';
+----------+
| count(*) |
+----------+
|       30 |
+----------+
1 row in set (0.00 sec)

mysql> SELECT count(*) FROM Validation WHERE date_completed IS NOT NULL;
+----------+
| count(*) |
+----------+
|       18 |
+----------+
1 row in set (0.00 sec)

*/