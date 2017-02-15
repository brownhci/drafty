package drafty.models;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class LikertOptions {
	private String opt1;
	private String opt2;
	private String opt3;
	private String opt4;
	private String opt5;
	private String extra;

	/**
	 * @param opt1
	 * @param opt2
	 * @param opt3
	 * @param opt4
	 * @param opt5
	 * @param extra
	 */
	public LikertOptions(String opt1, String opt2, String opt3, String opt4, String opt5, String extra, boolean addNumbers) {
		super();
		
		if(addNumbers) {
			this.opt1 = "(1) " + opt1;
			this.opt2 = "(2) " + opt2;
			this.opt3 = "(3) " + opt3;
			this.opt4 = "(4) " + opt4;
			this.opt5 = "(5) " + opt5;
			this.extra = extra;
		} else {
			this.opt1 = opt1;
			this.opt2 = opt2;
			this.opt3 = opt3;
			this.opt4 = opt4;
			this.opt5 = opt5;
			this.extra = extra;
		}
	}

	public List<String> toList() {
		List<String> options = new ArrayList<>();
		options.add(opt1); 
		options.add(opt2);
		options.add(opt3);
		options.add(opt4);
		options.add(opt5);
		options.add(extra);
		
		return options;
	}
	
	public Set<String> toSet() {
		Set<String> options = new HashSet<>();
		options.add(opt1); 
		options.add(opt2);
		options.add(opt3);
		options.add(opt4);
		options.add(opt5);
		options.add(extra);
		
		return options;
	}

	public String getOpt1() {
		return opt1;
	}
	public void setOpt1(String opt1) {
		this.opt1 = opt1;
	}
	public String getOpt2() {
		return opt2;
	}
	public void setOpt2(String opt2) {
		this.opt2 = opt2;
	}
	public String getOpt3() {
		return opt3;
	}
	public void setOpt3(String opt3) {
		this.opt3 = opt3;
	}
	public String getOpt4() {
		return opt4;
	}
	public void setOpt4(String opt4) {
		this.opt4 = opt4;
	}
	public String getOpt5() {
		return opt5;
	}
	public void setOpt5(String opt5) {
		this.opt5 = opt5;
	}
	public String getExtra() {
		return extra;
	}
	public void setExtra(String extra) {
		this.extra = extra;
	}
}
