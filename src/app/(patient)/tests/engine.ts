import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export type routerObj = {
    gameID: String;
    primaryColor: String;
}

const KEY = "aptitude_session_v1";
type Result = Record<string, unknown>;
type Session = { v: 1; startedAt: string; os: string; results: Record<string, Result> };
let session: Session | null = null;

export async function startSession() {
    const saved = await AsyncStorage.getItem(KEY);
    session = saved
        ? JSON.parse(saved)
        : { v: 1, startedAt: new Date().toISOString(), os: Platform.OS, results: {} };
}

export function recordResult(stepId: string, data?: Result) {
    if (!data) return;
    if (!session) session = { v: 1, startedAt: new Date().toISOString(), os: Platform.OS, results: {} };
    session.results[stepId.split("-")[0]] = data;//turn stupid ids
    AsyncStorage.setItem(KEY, JSON.stringify(session)).catch(() => {});
}

export const aptitudeList = [
    'welcome',
    'intro-1',
    'orient-1',
    'basicfunc-1',
    'gamesection_m',
    "seenIt-10987",
    "wordGarden-11987",
    "digMeOut-12546",
    "patternFactory-13476",
    'ending-1',
    'thanks'

]

async function getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('not sigend in');
    return user
}

export async function checkAp() {
    const user = await getUser()
    const { data, error } = await supabase
        .from('aptitude_test')
        .select('id')
        .eq('patient_id', user.id)
    console.log(data)
    
    if (data?.length===0) {
        return false
    } else {
        return true
    }

    
}

export async function submitSession() {
    if (!session) throw new Error("no session");
    const user = await getUser();
    const { data, error } = await supabase
        .from("aptitude_test")
        .insert({ patient_id: user.id, raw: session })
        .select("id")
        .single();
    if (error) throw error;
    await AsyncStorage.removeItem(KEY);
    session = null;
    // // fire-and-forget: the function reads the row, calls Gemini, writes `aptitude`
    // supabase.functions.invoke("summarize-aptitude", { body: { id: data.id } }).catch(console.log);
    // return data.id;
}