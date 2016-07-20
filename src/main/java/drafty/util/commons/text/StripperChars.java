package drafty.util.commons.text;

public class StripperChars {

	/* CHARS to Strip
	 * ,
	 * _
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
	 * at
	 * of
	 * the
	 * in
	 * &
	 * and
	 * @
	 * '
	 * - with no spaces
	 */
	public String strip(String strip) {
		
		System.out.println("Strip = " + strip);
		
		//words
		strip = strip.replaceAll("(?i) the ", "");
		strip = strip.replaceAll("(?i) at ", "");
		strip = strip.replaceAll("(?i) of ", "");
		strip = strip.replaceAll("(?i) in ", "");
		strip = strip.replaceAll("(?i) and ", "");
		
		strip = strip.replaceAll("\\s+", ""); //strips white spaces
		
		strip = strip.replaceAll("(?i)&", "");
		strip = strip.replaceAll("\\n", "");
		strip = strip.replaceAll("\\@", "");
		strip = strip.replaceAll("\\,", "");
		strip = strip.replaceAll("\\_", "");
		strip = strip.replaceAll("\\-", "");
		strip = strip.replaceAll("\\|", "");
		strip = strip.replaceAll("[()]", "");
		strip = strip.replaceAll("\\[", "");
		strip = strip.replaceAll("\\]", "");
		strip = strip.replaceAll("\\{", "");
		strip = strip.replaceAll("\\}", "");
		strip = strip.replaceAll("\\<", "");
		strip = strip.replaceAll("\\>", "");
		strip = strip.replaceAll("\\.", "");
		strip = strip.replaceAll("\\*", "");
		strip = strip.replaceAll("\\'", "");
		strip = strip.replaceAll("\\\\", "");
		strip = strip.replaceAll("\\/", "");
		strip = strip.replaceAll("\\‘", "");
		strip = strip.replaceAll("\\=", "");
		strip = strip.replaceAll("\\+", "");
		strip = strip.replaceAll("\\;", "");
		strip = strip.replaceAll("\"", "");
		
		System.out.println("Strip = " + strip);
		
		return strip;
	}
}
