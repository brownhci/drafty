package drafty.experiments;

import java.util.ArrayList;

import com.vaadin.ui.UI;

import drafty._MainUI;
import drafty.components.SuggestionComponent;
import drafty.models.Mode;
import drafty.services.ExperimentService;

public class PopUp extends Thread {
	
	@Override
	public void run() {
		
		try {
			//System.out.println("Thread Sleep");
			Thread.sleep(3000);
			//System.out.println("Thread Stop");
		} catch (InterruptedException e) {
			e.printStackTrace();
		}

		MySub sub = new MySub();
    	
	    // Add it to the root component
		/*
	    UI.getCurrent().addWindow(sub);
	    UI.getCurrent().setFocusedComponent(sub);
	    System.out.println("Thread Push");
	    UI.getCurrent().push();
	    */
		
		//experiment 1 code
		ArrayList<String> suggInfo = new ArrayList<String>();
		String experiment_id = _MainUI.getApi().getProfile().getIdExperiment();
		String reco[] = null;
		
		if(experiment_id.equals("1")) { //Ask No-Interest)
			String recoTemp[] = _MainUI.getApi().getUIService().getNoInterest();
			reco = recoTemp;
		} else if (experiment_id.equals("2")) { //Ask Fix User Interest
			String recoTemp[] = _MainUI.getApi().getUIService().getInterestedField();
			reco = recoTemp;
		}
		
		String person_id = reco[0];
		String prof_name = reco[1];
		String suggestion_type_id = reco[2];
		suggInfo = ExperimentService.getSuggestionWithMaxConf(person_id, suggestion_type_id);
		String suggestion_with_max_conf = suggInfo.get(0);
		String suggestion_id = suggInfo.get(1);
		
		_MainUI.getApi().getCellSelection().setCellSelection(person_id, prof_name, _MainUI.getApi().getProfUniversity(person_id), suggestion_with_max_conf, suggestion_id, suggestion_type_id, null);
		
		boolean goodToGo = false;
		int count = 0;
		//System.out.println("Mode: " + _MainUI.getApi().getActiveMode().getActiveMode());
		//System.out.println("Time: " + (System.currentTimeMillis() - _MainUI.getApi().getActiveMode().getLastInteraction()));
		while(goodToGo == false) {
			if(_MainUI.getApi().getActiveMode().getActiveMode() == Mode.NORMAL 
					&& ((System.currentTimeMillis() - _MainUI.getApi().getActiveMode().getLastInteraction()) > 1500 || count > 10)) {
				goodToGo = true;
			} else {
				try {
					System.out.println("Thread Sleep: " + count*2);
					Thread.sleep(2000);
					System.out.println("Thread Stop: " + count*2);
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
			}
			count++;
		}
		
		new SuggestionComponent("experiment");
		
		//UI.getCurrent().setFocusedComponent(sub);
	    System.out.println("Thread Push");
	    UI.getCurrent().push();
	}
}
