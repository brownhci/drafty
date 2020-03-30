package com.ajobs.view.credits;

import java.util.List;

import com.ajobs.domain.Leaderboard;
import com.ajobs.event.DraftyEventBus;
import com.ajobs.services.InteractionService;
import com.vaadin.navigator.View;
import com.vaadin.navigator.ViewChangeListener.ViewChangeEvent;
import com.vaadin.server.Page;
import com.vaadin.server.Page.BrowserWindowResizeEvent;
import com.vaadin.server.Responsive;
import com.vaadin.shared.data.sort.SortDirection;
import com.vaadin.ui.Component;
import com.vaadin.ui.Grid;
import com.vaadin.ui.Grid.GridContextClickEvent;
import com.vaadin.ui.HorizontalLayout;
import com.vaadin.ui.Label;
import com.vaadin.ui.Notification;
import com.vaadin.ui.Panel;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.themes.ValoTheme;

@SuppressWarnings("serial")
public class CreditsView extends Panel implements View {
	
	InteractionService intService = new InteractionService();
	CreditsService lbService = new CreditsService();
	
	private Label titleLabel;
    private final VerticalLayout root;
    private Grid<Leaderboard> lboard = new Grid<Leaderboard>();
    
    @Override
	public void enter(ViewChangeEvent event) {
    	intService.newView(event.getViewName());
    		
    	List<Leaderboard> users = lbService.getData();
        lboard.setItems(users);
		lboard.sort(lboard.getColumns().get(1), SortDirection.DESCENDING);
		
		//testing
		lboard.addContextClickListener(e -> Notification.show(((GridContextClickEvent<Leaderboard>)e).getItem() + " Clicked"));
	}	
    
	public CreditsView() {
		addStyleName(ValoTheme.PANEL_BORDERLESS);
        setSizeFull();
        DraftyEventBus.register(this);

        root = new VerticalLayout();
        root.setSizeFull();
        root.setSpacing(false);
        root.addStyleName("lboardsheet-view");
        setContent(root);
        Responsive.makeResponsive(root);

        root.addComponent(buildHeader());
        
        Component content = buildContent();
        root.addComponent(content);
        root.setExpandRatio(content, 1);
	}

	private Component buildHeader() {
        HorizontalLayout header = new HorizontalLayout();
        header.addStyleName("viewheader");

        titleLabel = new Label("Leaderboard");
        titleLabel.setSizeUndefined();
        titleLabel.addStyleName(ValoTheme.LABEL_H1);
        titleLabel.addStyleName(ValoTheme.LABEL_NO_MARGIN);
        header.addComponent(titleLabel);

        return header;
    }
	
	private Component buildContent() {
        lboard.setSizeFull();
        lboard.setResponsive(true);
        lboard.setHeight((Page.getCurrent().getBrowserWindowHeight() - 145), Unit.PIXELS);
        Page.getCurrent().addBrowserWindowResizeListener(e -> BrowserResize(e));
        
        lboard.addColumn(Leaderboard::getUsername).setCaption("User Name");
        lboard.addColumn(Leaderboard::getNewRecords).setCaption("New Records");
        lboard.addColumn(Leaderboard::getEdits).setCaption("Edits");
        
        return lboard;
	}

	private void BrowserResize(BrowserWindowResizeEvent e) {
		lboard.setHeight((Page.getCurrent().getBrowserWindowHeight() - 145), Unit.PIXELS);
	}
}
