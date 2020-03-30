package com.ajobs.util;

import com.vaadin.ui.ComboBox;
import com.vaadin.ui.DateTimeField;
import com.vaadin.ui.TextField;

public class ComponentGenerator {
	
	public TextField genTextField(String caption) {
		TextField tf = new TextField();
		tf.setCaption(caption);
		tf.setWidth("100%");
		
		return tf;
	}
	
	public DateTimeField genDateTimeField(String caption) {
		DateTimeField dtf = new DateTimeField();
		dtf.setCaption(caption);
		dtf.setWidth("100%");
		
		return dtf;
	}
	
	public ComboBox<Object> genComboBox(String caption) {
		ComboBox<Object> cb = new ComboBox<Object>();
		cb.setCaption(caption);
		cb.setWidth("100%");
		
		return cb;
	}
}
