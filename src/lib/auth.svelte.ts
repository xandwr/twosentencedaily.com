import { supabase } from "$lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

let user = $state<User | null>(null);
let showAuthPrompt = $state(false);

supabase.auth.getUser().then(({ data }) => {
	user = data.user;
});

supabase.auth.onAuthStateChange((_event, session) => {
	user = session?.user ?? null;
});

export function getUser(): User | null {
	return user;
}

export function getShowAuthPrompt(): boolean {
	return showAuthPrompt;
}

export function setShowAuthPrompt(value: boolean) {
	showAuthPrompt = value;
}

export async function signIn() {
	await supabase.auth.signInWithOAuth({
		provider: "google",
		options: { redirectTo: window.location.origin },
	});
}

export async function signOut() {
	await supabase.auth.signOut();
	user = null;
}
