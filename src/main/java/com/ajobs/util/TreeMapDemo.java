package com.ajobs.util;

import java.util.Map.Entry;
import java.util.TreeMap;

public class TreeMapDemo {

    private static TreeMap<Integer, TreeMap<String, Integer>> colPosSuggestionIdUniqueID = new TreeMap<Integer, TreeMap<String, Integer>>();

    public static void main(String args[]) {
      // Create a hash map
      
      
      // Put elements to the map
      addToMap(1, "bob1", 1);
      addToMap(2, "bob2", 2);
      addToMap(3, "bob3", 3);
      addToMap(1, "bob4", 4);
      addToMap(2, "bob5", 5);
      addToMap(3, "bob6", 6);
      addToMap(3, "bob7", 7);
      
      for(Entry<Integer, TreeMap<String, Integer>> e1 : colPosSuggestionIdUniqueID.entrySet()) {
    		for(Entry<String, Integer> e2 : e1.getValue().entrySet()) {
    			System.out.println(e1.getKey() + " " + e2.getKey() + " "  + e2.getValue());
    		}
    	}
      
      System.out.println("");
      for(Entry<String, Integer> e2 : colPosSuggestionIdUniqueID.get(3).entrySet()) {
    	  System.out.println(e2.getKey() + " "  + e2.getValue());
      }
   }
   
   private static void addToMap(Integer col_pos, String suggValToSort, Integer idUniqueID) {
       //lookup by column, to get auto-sorted values
    	if(colPosSuggestionIdUniqueID.containsKey(col_pos)) {
    		colPosSuggestionIdUniqueID.get(col_pos).put(suggValToSort, idUniqueID);
    	} else {
    		TreeMap<String, Integer> sortedVals = new TreeMap<String, Integer>();
    		sortedVals.put(suggValToSort, idUniqueID);
    		colPosSuggestionIdUniqueID.put(col_pos, sortedVals);
    	}
   }
}