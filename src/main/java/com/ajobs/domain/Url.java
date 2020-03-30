package com.ajobs.domain;

import com.ajobs.newrow.AjobsNewRow;
import com.ajobs.newrow.AjobsNewRowWindow;
import com.ajobs.newrow.ProfsNewRow;
import com.ajobs.newrow.ProfsNewRowWindow;
import com.vaadin.server.Page;
import com.vaadin.ui.Window;

public class Url {
	private boolean active = false;
	private String currentViewName;
	private String fragment;
	private String searchFragment;
	private String column;
	private String value;
	
	private Dataset dataset = Dataset.AJOBS;

	public enum Dataset {
		AJOBS("ajobs", "Add New Job", "Academic Jobs", AjobsNewRow.class, AjobsNewRowWindow.class),
		PROFS("profs", "Add New Professor", "CS Professors", ProfsNewRow.class, ProfsNewRowWindow.class);
		//SCHOL("schol", ScholNewRow.class, ScholNewRowWindow.class);
		
		private String jndi = "java:/MySqlDS_";
		private String datasource;
		private String addNewRowMsg;
		private String headerMsg;
		private final Class<?> domainClass;
		private final Class<? extends Window> newWindowClass;
		
	    private Dataset(String datasource, String addNewRowMsg, String headerMsg, Class<?> domainClass, Class<? extends Window> newWindowClass) {
			this.datasource = datasource;
			this.addNewRowMsg = addNewRowMsg;
			this.headerMsg = headerMsg;
			this.domainClass = domainClass;
			this.newWindowClass = newWindowClass;
		}

		public String getJNDI() {
	        return jndi + datasource;
	    }
		
		public String getAddNewRowMsg() {
			return addNewRowMsg;
		}
		
		public String getHeaderMsg() {
			return headerMsg;
		}
		
		public String getDatasource() {
	        return datasource;
	    }

		public Class<?> getDomainClass() {
			return domainClass;
		}

		public Class<? extends Window> getNewWindowClass() {
			return newWindowClass;
		}
	};
	
	public boolean isActive() {
		return active;
	}
	public void setActive(boolean active) {
		this.active = active;
	}
	public String getCurrentViewName() {
		return currentViewName;
	}
	public void setCurrentViewName(String currentViewName) {
		this.currentViewName = currentViewName;
	}
	public String getFragment() {
		return fragment;
	}
	public void setFragment(String fragment) {
		//System.out.println("URL setFragment = " + fragment + ", isSearchUrlActive = " + active);
		if(active && Page.getCurrent().getUriFragment().contains("!data")) {
			this.fragment = fragment;
		}
	}
	public String getSearchFragment() {
		return searchFragment;
	}
	public void setSearchFragment(String searchFragment) {
		this.searchFragment = searchFragment;
	}
	public String getColumn() {
		return column;
	}
	public void setColumn(String column) {
		this.column = column;
	}
	public String getValue() {
		return value;
	}
	public void setValue(String value) {
		this.value = value;
	}
	public Dataset getDataset() {
		return dataset;
	}
	public void setDataset(String baseUrl) {
		/*
		 System.out.println("Url class, setDataset = " + baseUrl);
		 for (Dataset ds : Dataset.values()) {
			 if(baseUrl.contains(ds.getJNDI())) {
				 this.dataset = ds;
			 }	 
	     }
	     */
	}
	@Override
	public String toString() {
		return "Url [active=" + active + ", fragment=" + fragment + ", column=" + column + ", value=" + value
				+ ", dataset=" + dataset + "]";
	}
}
