package drafty.csimport.models;

public class Aliases {
	
	//https://raw.githubusercontent.com/emeryberger/CSrankings/gh-pages/dblp-aliases.csv
	
	private String idPersonAlias;
	private String idPerson;
	private String alias; //from dblp
	private String name; //from dblp
	
	/**
	 * @param idPersonAlias
	 * @param idPerson
	 * @param alias
	 * @param name
	 */
	public Aliases(String idPersonAlias, String idPerson, String alias, String name) {
		super();
		this.idPersonAlias = idPersonAlias;
		this.idPerson = idPerson;
		this.alias = alias;
		this.name = name;
	}
	public String getIdPersonAlias() {
		return idPersonAlias;
	}
	public void setIdPersonAlias(String idPersonAlias) {
		this.idPersonAlias = idPersonAlias;
	}
	public String getIdPerson() {
		return idPerson;
	}
	public void setIdPerson(String idPerson) {
		this.idPerson = idPerson;
	}
	public String getAlias() {
		return alias;
	}
	public void setAlias(String alias) {
		this.alias = alias;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	
	
}
