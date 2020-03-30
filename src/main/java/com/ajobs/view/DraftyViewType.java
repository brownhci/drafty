package com.ajobs.view;

import com.ajobs.domain.Url;
import com.ajobs.domain.Url.Dataset;
import com.ajobs.view.credits.CreditsView;
import com.ajobs.view.grid.GridViewAjobs;
import com.ajobs.view.grid.GridViewProfs;
import com.ajobs.view.stats.StatsView;
import com.ajobs.view.wip.WipView;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.navigator.View;
import com.vaadin.server.FontAwesome;
import com.vaadin.server.Resource;


public enum DraftyViewType {
	//SPREADSHEET("data", SpreadsheetView.class, FontAwesome.TABLE, false, true), 
	GRID("data", getGridViewClass(), VaadinIcons.TABLE, false, true), 
    LEADERBOARD("credits", CreditsView.class, FontAwesome.TROPHY, false, false),
    STATS("stats", StatsView.class, FontAwesome.BAR_CHART_O, true, false),
	WIP("wip", WipView.class, FontAwesome.BAR_CHART_O, true, false);

    private final String viewName;
    private final Class<? extends View> viewClass;
    private final Resource icon;
    private final boolean admin;
    private final boolean stateful;

    private DraftyViewType(final String viewName,
            final Class<? extends View> viewClass, final Resource icon,
            final boolean admin, final boolean stateful) {
        this.viewName = viewName;
        this.viewClass = viewClass;
        this.icon = icon;
        this.admin = admin;
        this.stateful = stateful;
    }

    public boolean isStateful() {
        return stateful;
    }

    public String getViewName() {
        return viewName;
    }
    
    public Class<? extends View> getViewClass() {
        return viewClass;
    }
    
    public static Class<? extends View> getGridViewClass() {
    	Url url = new Url();
    	if(url.getDataset() ==  Dataset.AJOBS) {
    		return GridViewAjobs.class;
    	} else if(url.getDataset() ==  Dataset.PROFS) {
    		return GridViewProfs.class;
    	}
    	
    	return null;
    }

    public Resource getIcon() {
        return icon;
    }
    
    public boolean isAdmin() {
		return admin;
	}

	public static DraftyViewType getByViewName(final String viewName) {
        DraftyViewType result = null;
        for (DraftyViewType viewType : values()) {
            if (viewType.getViewName().equals(viewName)) {
                result = viewType;
                break;
            }
        }
        return result;
    }

}