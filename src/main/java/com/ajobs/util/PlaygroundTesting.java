package com.ajobs.util;

public class PlaygroundTesting {
	
	public static void main(String args[]) {
		String cookie1 = "1";
		String cookie2 = "2|logout";
		
		parseCookie(cookie1);
		parseCookie(cookie2);
	}
	
	private static void parseCookie(String cookie) {
		System.out.println("");
		
		String[] splitCookie = cookie.split("|logout");
		System.out.println("Cookie Val = " + splitCookie[0]);
		
		System.out.println("Length = " + splitCookie.length);
		
		if(splitCookie.length > 1) {
			System.out.println("Cookie Logout Flag = " + splitCookie[1]);
		}
	}
}
