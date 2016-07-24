package drafty.experiments;

import com.vaadin.ui.Button;
import com.vaadin.ui.Button.ClickEvent;
import com.vaadin.ui.Button.ClickListener;
import com.vaadin.ui.Label;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.Window;

public class MySub extends Window {
	
    public MySub() {
        super("Subs on Sale"); // Set window caption
        center();

        // Some basic content for the window
        VerticalLayout content = new VerticalLayout();
        content.addComponent(new Label("Just say it's OK!"));
        content.setMargin(true);
        setContent(content);

        // Disable the close button
        setClosable(false);

        // Trivial logic for closing the sub-window
        Button ok = new Button("OK");
        ok.addClickListener(new ClickListener() {
            public void buttonClick(ClickEvent event) {
                close(); // Close the sub-window
            }
        });
        content.addComponent(ok);
    }
}
