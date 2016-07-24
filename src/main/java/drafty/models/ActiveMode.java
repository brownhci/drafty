package drafty.models;

public class ActiveMode {
	
	private Mode activeMode;
	private Long lastInteraction;
	
	public Mode getActiveMode() {
		return activeMode;
	}
	public void setActiveMode(Mode activeMode) {
		this.activeMode = activeMode;
	}
	public Long getLastInteraction() {
		return lastInteraction;
	}
	public void setLastInteraction(Long lastInteraction) {
		this.lastInteraction = lastInteraction;
	}
}
