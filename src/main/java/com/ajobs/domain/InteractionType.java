package com.ajobs.domain;

public class InteractionType {
	 
	 private Integer idInteractionType;

	 private String interaction;
	 
	 public enum InteractionWeight {
	       CLICK (2) , CLICK_DOUBLE (3) , FILTER (1) , FILTER_BLUR (2), SORTING (1) ;

	       private int interactionWeight ;

	       InteractionWeight(int weight) {
	            this.interactionWeight = weight ;
	       }

	       public int getWeight(){
	             return this.interactionWeight;
	       }
	 }
	 
	 // Interaction could be click, edit or search.
	 public InteractionType(Integer idInteractionType, String interaction) {
		 this.idInteractionType = idInteractionType;
		 this.interaction = interaction;
	}
	  
	public String getInteraction() {
		return interaction;
	}
	
	public void setInteraction(String interaction) {
		this.interaction = interaction;
	}
	
	public Integer getIdInteractionType() {
		return idInteractionType;
	}
	
	
	public void setIdInteractionType(Integer idInteractionType) {
		this.idInteractionType = idInteractionType;
	}

}
