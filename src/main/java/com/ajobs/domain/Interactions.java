package com.ajobs.domain;
import java.util.Date;

public class Interactions {
	
	private Integer idInteraction;
	private Integer idInteractionType;
	private Integer idSession;
	private Date timestamp;
	
	public Interactions(Integer idInteraction, Integer idInteractionType,
			Integer idSession, Date timestamp) {
		super();
		this.idInteraction = idInteraction;
		this.idInteractionType = idInteractionType;
		this.idSession = idSession;
		this.timestamp = timestamp;
	}

	public Integer getidInteraction() {
		return idInteraction;
	}

	public void setidInteraction(Integer idInteraction) {
		this.idInteraction = idInteraction;
	}

	public Integer getidInteractionType() {
		return idInteractionType;
	}

	public void setidInteractionType(Integer idInteractionType) {
		this.idInteractionType = idInteractionType;
	}

	public Integer getidSession() {
		return idSession;
	}

	public void setidSession(Integer idSession) {
		this.idSession = idSession;
	}
	
	public Date getTimeStamp() {
		return timestamp;
	}
	
	public void setTimeStamp(Date timestamp) {
		this.timestamp = timestamp;
	}
}
