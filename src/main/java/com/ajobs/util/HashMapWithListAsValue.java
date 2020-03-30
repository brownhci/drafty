package com.ajobs.util;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map.Entry;

public class HashMapWithListAsValue {
	private static HashMap<Integer, List<String>> testDS = new HashMap<Integer, List<String>>();

    public static void main(String args[]) {
      // Create a hash map
    	
      // Put elements to the map
      addToMap(1, "bob10");
      addToMap(1, "bob11");
      addToMap(1, "bob12");
      addToMap(1, "bob13");
      addToMap(1, "bob14");
      addToMap(1, "bob15");
      addToMap(2, "bob20");
      addToMap(2, "bob21");
      addToMap(2, "bob22");
      
      for(Entry<Integer, List<String>> e1 : testDS.entrySet()) {
    	  for(String e2 : e1.getValue()) {
    		  System.out.println(e1.getKey() + " " + e2);
		  }
      }
   }
    
   private static void addToMap(Integer key, String newVal) {
	   //lookup by column, to get auto-sorted values
	   if(testDS.containsKey(key)) {
	  		testDS.get(key).add(newVal);
	   } else {
		   List<String> newVals = new ArrayList<String>();
		   newVals.add(newVal);
		   testDS.put(key, newVals);
	   }
     }
}
