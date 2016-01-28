package test;


import org.vaadin.viritin.util.BrowserCookie;

import com.vaadin.annotations.Theme;
import com.vaadin.navigator.ViewChangeListener.ViewChangeEvent;
import com.vaadin.ui.Button;
import com.vaadin.ui.CssLayout;
import com.vaadin.ui.Notification;
import com.vaadin.ui.TextField;
import com.vaadin.ui.VerticalLayout;

/**
 *
 * @author Matti Tahvonen
 */
@Theme("valo")
public class BrowserCookieTest extends VerticalLayout {

    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	CssLayout panelWrap = new CssLayout();
	
	//@Override
    public BrowserCookieTest() {
    	this.addComponent(panelWrap);
    	
        final TextField key = new TextField("Cookie key");
        final TextField value = new TextField("Cookie Value");
        
        @SuppressWarnings("serial")
		Button set = new Button("Set value", new Button.ClickListener() {

            @Override
            public void buttonClick(Button.ClickEvent event) {
                BrowserCookie.setCookie(key.getValue(), value.getValue());
                System.out.println("BrowserCookie.setCookie " + key.getValue() + " " + value.getValue());
            }
        });
        
        Button get = new Button("Detect value", new Button.ClickListener() {

            @Override
            public void buttonClick(Button.ClickEvent event) {
                BrowserCookie.detectCookieValue(key.getValue(), new BrowserCookie.Callback() {

                    @Override
                    public void onValueDetected(String value) {
                        Notification.show("Value:" + value, Notification.Type.WARNING_MESSAGE);
                        System.out.println("onValueDetected value " + value);
                    	System.out.println("BrowserCookie.detectCookieValue " + key.getValue());
                    }
                });
            }
        });
        
        panelWrap.addComponents(key, value, set, get);
        
        //return new MVerticalLayout(key, value, set, get);
    }
}