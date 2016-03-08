package drafty.data;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.sql.DataSource;



public class DataCleaner {
	
	public DataCleaner(){
		
	}
	
	public int CleanDuplicates(){
		HashMap<Integer, Integer> duplicateIDs = new HashMap();
		duplicateIDs.put(14899, 1868);
		duplicateIDs.put(15367, 1620);
		duplicateIDs.put(15413, 1657);
		duplicateIDs.put(155569,1313);
		duplicateIDs.put(15365, 1621);
		duplicateIDs.put(15366, 1622);
		duplicateIDs.put(14905, 1869);
		duplicateIDs.put(15353, 1623);
		duplicateIDs.put(15379, 1624);
		duplicateIDs.put(15450, 1658);
		duplicateIDs.put(15437, 1659);
		duplicateIDs.put(14889, 1871);
		duplicateIDs.put(15570, 1319);
		duplicateIDs.put(14911, 1873);
		duplicateIDs.put(15389, 1662);
		duplicateIDs.put(15344, 1629);
		duplicateIDs.put(15420, 1663);
		duplicateIDs.put(14884, 1874);
		duplicateIDs.put(14895, 1875);
		duplicateIDs.put(15451, 1666);
		duplicateIDs.put(15405, 1667);
		duplicateIDs.put(14878, 1876);
		duplicateIDs.put(15345,1633);
		duplicateIDs.put(15436, 1670);
		duplicateIDs.put(14883, 1877);
		duplicateIDs.put(15357, 1635);
		duplicateIDs.put(15417, 1671);
		duplicateIDs.put(14910, 1878);
		duplicateIDs.put(14913, 1879);
		duplicateIDs.put(14912, 1880);
		duplicateIDs.put(15406, 1962);
		duplicateIDs.put(14896, 1881);
		duplicateIDs.put(15368, 1636);
		duplicateIDs.put(15454, 1673);
		duplicateIDs.put(15464, 1674);
		duplicateIDs.put(15380, 1637);
		duplicateIDs.put(15376, 1638);
		duplicateIDs.put(15429, 1677);
		duplicateIDs.put(15412, 1678);
		duplicateIDs.put(15370, 1639);
		duplicateIDs.put(15386, 1679);
		duplicateIDs.put(15383, 1640);
		duplicateIDs.put(15343, 1641);
		duplicateIDs.put(15358, 1642);
		duplicateIDs.put(15338, 1385);
		duplicateIDs.put(14894, 1891);
		duplicateIDs.put(15244, 1212);
		duplicateIDs.put(14067, 683);
		duplicateIDs.put(15278, 941);
		duplicateIDs.put(15408, 1680);
		duplicateIDs.put(15430, 1681);
		duplicateIDs.put(14870,1885);
		duplicateIDs.put(15400, 1682);
		duplicateIDs.put(15423, 1683);
		duplicateIDs.put(15414, 1684);
		duplicateIDs.put(14880, 1886);
		duplicateIDs.put(15456, 1686);
		duplicateIDs.put(15453, 1687);
		duplicateIDs.put(15409, 1688);
		duplicateIDs.put(14886, 1887);
		duplicateIDs.put(14881, 1888);
		duplicateIDs.put(14877, 1889);
		duplicateIDs.put(15372, 1643);
		duplicateIDs.put(14866, 1890);
		duplicateIDs.put(15461, 1690);
		duplicateIDs.put(15347, 1644);
		duplicateIDs.put(15446, 1691);
		duplicateIDs.put(15348, 1645);
		duplicateIDs.put(15387, 1692);
		duplicateIDs.put(15449, 1693);
		duplicateIDs.put(15459, 1694);
		duplicateIDs.put(14871, 1892);
		duplicateIDs.put(15466, 1696);
		duplicateIDs.put(14867, 1893);
		duplicateIDs.put(15393, 1695);
		duplicateIDs.put(14879, 1896);
		duplicateIDs.put(15425, 1697);
		duplicateIDs.put(14915, 1897);
		duplicateIDs.put(14868, 1898);
		duplicateIDs.put(15355, 1646);
		duplicateIDs.put(14869, 1900);
		duplicateIDs.put(15375, 1647);
		duplicateIDs.put(15433, 1702);
		duplicateIDs.put(14901, 1904);
		duplicateIDs.put(15377, 1648);
		duplicateIDs.put(14906, 1906);
		duplicateIDs.put(15369, 1649);
		duplicateIDs.put(15352, 1650);
		duplicateIDs.put(15381, 1651);
		duplicateIDs.put(15391, 1703);
		duplicateIDs.put(15440, 1704);
		duplicateIDs.put(15427, 1705);
		duplicateIDs.put(15447, 1706);
		duplicateIDs.put(14875, 1907);
		duplicateIDs.put(14876, 1908);
		duplicateIDs.put(15385, 1652);
		duplicateIDs.put(15361, 1653);
		duplicateIDs.put(14908, 1911);
		duplicateIDs.put(15422, 1707);
		duplicateIDs.put(14893, 1912);
		duplicateIDs.put(15418, 1708);
		duplicateIDs.put(14887, 1913);
		duplicateIDs.put(15467, 1709);
		duplicateIDs.put(14873, 1914);
		duplicateIDs.put(14872, 1915);
		duplicateIDs.put(15438, 1711);
		duplicateIDs.put(14900, 1916);
		duplicateIDs.put(15392, 1712);
		duplicateIDs.put(15349, 1654);
		duplicateIDs.put(14892, 1919);
		duplicateIDs.put(14916, 1920);
		duplicateIDs.put(14891, 1921);
		duplicateIDs.put(15350, 1655);
		duplicateIDs.put(15455, 1713);
		duplicateIDs.put(15346, 1656);
		duplicateIDs.put(15460, 1714);
		duplicateIDs.put(15428, 1715);
				
		//TO-DO etc//
		
		try {
		      Context initialContext = new InitialContext();
		      DataSource datasource = (DataSource)initialContext.lookup("java:jboss/datasources/MySqlDS_Drafty");
		      if (datasource != null) {
		    	Connection conn = datasource.getConnection();  
		    	String sql = 
			        		"UPDATE suggestion"
			        		+ "SET idPerson = ?"
			        		+ "WHERE idPerson = ?";
			    PreparedStatement stmt = conn.prepareStatement(sql); 
			    conn.setAutoCommit(false);
		        Iterator it = duplicateIDs.entrySet().iterator();
		        while (it.hasNext()){
		        	Map.Entry pair = (Map.Entry)it.next();
		        	Integer bad_id = (Integer)pair.getKey();
		        	Integer good_id = (Integer)pair.getValue();
		        	stmt.setInt(1, good_id);
		        	stmt.setInt(2, bad_id);
		        	stmt.addBatch();
		        	it.remove();
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
