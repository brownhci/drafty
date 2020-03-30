package com.ajobs.util;

import org.vaadin.artur.KeyAction;
import org.vaadin.artur.KeyAction.KeyActionEvent;
import org.vaadin.artur.KeyAction.KeyActionListener;

import com.ajobs.event.DraftyEvent.CopyEvent;
import com.ajobs.event.DraftyEvent.CutEvent;
import com.ajobs.event.DraftyEvent.PasteEvent;
import com.ajobs.event.DraftyEventBus;
import com.vaadin.ui.AbstractComponent;

public class KeyListener {

	@SuppressWarnings("serial")
	public KeyAction addKeyListener(AbstractComponent component, final String keyname, int keycode, int... modifierKey) {
		KeyAction action = new KeyAction(keycode, modifierKey);
		action.addKeypressListener(new KeyActionListener() {
			@Override
			public void keyPressed(KeyActionEvent keyPressEvent) {
				System.out.println(keyname + " pressed on " + keyPressEvent.getComponent().getId());
				if(keyname.equals("Copy")) {
					DraftyEventBus.post(new CopyEvent());
				} else if(keyname.equals("Cut")) {
					DraftyEventBus.post(new CutEvent());
				} else if(keyname.equals("Paste")) {
					DraftyEventBus.post(new PasteEvent());
				}
			}
		});
		action.extend(component);
		return action;
	}
}
