package com.ajobs.util;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map.Entry;

public class HashMapListDemo {

    private static HashMap<Integer, HashMap<String, List<Integer>>> testDS = new HashMap<Integer, HashMap<String, List<Integer>>>();

    public static void main(String args[]) {
      // Create a hash map
    	
      // Put elements to the map
      addToMap(1, "bob1", 1);
      addToMap(1, "bob1", 2);
      addToMap(1, "bob1", 3);
      addToMap(1, "bob1", 4);
      addToMap(1, "bob2", 3);
      addToMap(1, "bob2", 4);
      addToMap(2, "bob3", 5);
      addToMap(2, "bob3", 6);
      addToMap(2, "bob3", 7);
      
      for(Entry<Integer, HashMap<String, List<Integer>>> e1 : testDS.entrySet()) {
    	  for(Entry<String, List<Integer>> e2 : e1.getValue().entrySet()) {
    		  System.out.println(e1.getKey() + " " + e2.getKey() + " "  + e2.getValue());
		  }
      }
      
      System.out.println("");
      for(Entry<String, List<Integer>> e2 : testDS.get(2).entrySet()) {
    	  System.out.println(e2.getKey() + " "  + e2.getValue().get(0));
      }
   }
   
   private static void addToMap(Integer key1, String key2, Integer newVal) {
      List<Integer> list = new ArrayList<Integer>();
       
       //lookup by column, to get auto-sorted values
    	if(testDS.containsKey(key1)) {
    		if(testDS.get(key1).containsKey(key2)) {
    			list = testDS.get(key1).get(key2);
    		}
    		list.add(newVal);
    		testDS.get(key1).put(key2, list);
    	} else {
    		HashMap<String, List<Integer>> sortedVals = new HashMap<String, List<Integer>>();
    		list.add(newVal);
    		sortedVals.put(key2, list);
    		testDS.put(key1, sortedVals);
    	}
   }
}