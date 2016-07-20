package drafty.util.commons.text;

import java.util.Locale;

import drafty.util.commons.text.similarity.CosineDistance;
import drafty.util.commons.text.similarity.EditDistance;
import drafty.util.commons.text.similarity.FuzzyScore;
import drafty.util.commons.text.similarity.JaroWrinklerDistance;
import drafty.util.commons.text.similarity.LevenshteinDistance;

@SuppressWarnings("unused")
public class MatchingAnalysis {

	
	FuzzyScore fs = new FuzzyScore(Locale.ENGLISH);
	
	
	LevenshteinDistance ld = new LevenshteinDistance();
	
	
	JaroWrinklerDistance jwd = new JaroWrinklerDistance();
	
	/*
	 * Only extremes are helpful, 1 is bad; approaching 0 is good
	 * can be helpful if it reversed
	 */
	CosineDistance cd = new CosineDistance();
	
	public MatchingAnalysis() {
		TestCase();
	}
	
	private void TestCase() {
		String st1 = "Brown University";
		String st2 = "Brown Uni";
		String st3 = "Butler University";
		String st4 = "The Brown University";
		String st5 = "University of Brown";
		String st6 = "BU";
		String st7 = "Brown College";
		String st8 = "Brwn University";
		String st9 = "Brown Unversity";
		String st10 = "Brwn Unversity";
		String st11 = "Bröwn Univérsity";
		String st12 = "B U";
		String st13 = "HELLO * ,  _  -  |  (  )  [  ]  {  }  <  >  .  * / at  of  the  in  &  and  @  ‘";
		
		StripperChars strip = new StripperChars();
		strip.strip(st13);
		
		StringMatch(st1, st1);
		StringMatch(st1, st11);
		StringMatch(st1, st2);
		StringMatch(st1, st3);
		StringMatch(st1, st4);
		StringMatch(st1, st5);
		StringMatch(st1, st6);
		StringMatch(st1, st12);
		StringMatch(st1, st7);
		StringMatch(st1, st8);
		StringMatch(st1, st9);
		StringMatch(st1, st10);
		
		StringMatch("University of California Santa Barbara", "University of California Santa Barbara");
		StringMatch("University of California Santa Barbara", "University of California at Santa Barbara");
		StringMatch("University of California Santa Barbara", "UCSB");
		
		StringMatch("University of California Santa Barbara", "UC Santa Barbara");
		StringMatch("University of Texas Austin", "UT Austin");
		
		/* CHARS to Strip
		 * ,
		 * at
		 * -
		 * |
		 * (
		 * )
		 * [
		 * ]
		 * {
		 * }
		 * <
		 * >
		 * .
		 * *
		 * \
		 * /
		 * _
		 * of
		 * the
		 * in
		 * &
		 * and
		 * @
		 * - with no spaces
		 */
		
		/* STRIP University or College or Institute
		 * 
		 */
		
		/* SPELLING MISTAKES
		 * Longer the string the greater Lev Dist Allowed 
		 */
		
		/* WRONG ORDERING
		 * 
		 */
		
		/* FULL ABBREVIATIONS
		 * 
		 */
		
		/* PARTIAL ABBREVIATIONS
		 * 
		 */
		
	}

	private Double NameMatch(String name1, String name2) {
		Double match_str = 0.0;
		
		return match_str;
	}
	
	private Double StringMatch(String string1, String string2) {
		Integer fuzzy_score = 0;
		Integer lev_dist = 0;
		Double jaro_dist = 0.0;
		Double cos_dist = 0.0;
		
		System.out.println("MATCH START = " + string1 + " = " + string2);
		
		string1 = string1.replaceAll("\\s+","");
		string2 = string2.replaceAll("\\s+","");
		
		fuzzy_score = fs.fuzzyScore(string1, string2);
		System.out.println("Fuzzy Score = " + fuzzy_score);
		
		lev_dist = ld.apply(string1, string2);
		System.out.println("Lev Dist = " + lev_dist);
		
		jaro_dist = jwd.apply(string1, string2);
		System.out.println("JaroW Dist = " + jaro_dist);
		
		cos_dist = cd.apply(string1, string2);
		System.out.println("Cos Dist = " + cos_dist);
		
		System.out.println("__");
		
		return fuzzy_score + lev_dist + jaro_dist + cos_dist;
	}
}
