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
			Thread.sleep(3000);
			
			//experiment 1 code
			ArrayList<String> suggInfo = new ArrayList<String>();
			String experiment_id = _MainUI.getApi().getProfile().getIdExperiment();
			String reco[] = null;
			
			if(experiment_id.equals("1")) { //Ask No-Interest)
				reco = _MainUI.getApi().getUIService().getNoInterestBlank();
			} else if (experiment_id.equals("2")) { //Ask Fix User Interest
				reco = _MainUI.getApi().getUIService().getInterestedFieldBlank();
			}
			
			String person_id = reco[0];
			String prof_name = reco[1];
			String suggestion_type_id = reco[2];
			
			//suggestion_type_id = "JoinYear";
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
						&& ((System.currentTimeMillis() - _MainUI.getApi().getActiveMode().getLastInteraction()) > 1500 || count > 12)) {
					goodToGo = true;
				} else {
					Thread.sleep(3000);
				}
				count++;
			}
			
			if(_MainUI.getApi().getInteractionCount() > 7) { //keeps pop up from happening after double click
				new SuggestionComponent("experiment");
			    UI.getCurrent().push();
			}
			
		    return;
		    
        } catch (InterruptedException e) {
        	System.out.println("Thread Interrupted: " + e);
        	Thread.currentThread().interrupt();//preserve the message
            return;//Stop doing whatever I am doing and terminate
        }
	}
}
