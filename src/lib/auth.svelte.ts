import { supabase } from "$lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

let user = $state<User | null>(null);
let username = $state<string | null>(null);
let showAuthPrompt = $state(false);

async function loadProfile(userId: string) {
	const { data } = await supabase
		.from("profiles")
		.select("username")
		.eq("id", userId)
		.single();
	username = data?.username ?? null;
}

supabase.auth.getUser().then(({ data }) => {
	user = data.user;
	if (user) loadProfile(user.id);
});

supabase.auth.onAuthStateChange((_event, session) => {
	user = session?.user ?? null;
	if (user) loadProfile(user.id);
	else username = null;
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

export function getUsername(): string | null {
	return username;
}

export async function updateUsername(newUsername: string): Promise<string | null> {
	const u = user;
	if (!u) return "Not signed in";
	const cleaned = newUsername.trim().toLowerCase().replace(/\s+/g, "-");
	if (!cleaned || cleaned.length < 2) return "Username must be at least 2 characters";
	if (cleaned.length > 30) return "Username must be 30 characters or less";
	if (!/^[a-z0-9][a-z0-9._-]*$/.test(cleaned)) return "Letters, numbers, hyphens, dots only";

	const { error } = await supabase
		.from("profiles")
		.update({ username: cleaned })
		.eq("id", u.id);

	if (error) {
		if (error.code === "23505") return "Username already taken";
		return error.message;
	}
	username = cleaned;
	return null;
}

export async function signOut() {
	await supabase.auth.signOut();
	user = null;
	username = null;
}
