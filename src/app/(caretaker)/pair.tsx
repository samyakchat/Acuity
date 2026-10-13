import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Animated,
  Easing,
  LayoutAnimation,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, CircleAlert, CircleUser, KeyRound, UserPlus, Users } from 'lucide-react-native';
import FatButton from '@/components/fatUI/fatButton';
import FatInput from '@/components/fatUI/fatInput';
import { useTheme, FONT } from '@/components/fatUI/theme';
import { supabase } from '@/lib/supabase';

type Patient = { id: string; name: string; addedAt: string };

const POLL_MS = 30000;

const normalizeCode = (text: string) => text.toUpperCase().replace(/[^A-Z0-9]/g, '');

const openPatient = (patientId: string) => {};

function PatientRow({ patient, index }: { patient: Patient; index: number }) {
  const theme = useTheme();
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 260,
      delay: Math.min(index, 8) * 60,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  return (
    <Animated.View
      style={[
        styles.row,
        {
          backgroundColor: theme.fieldBg,
          borderColor: theme.line,
          opacity: enter,
          transform: [{ translateY }],
        },
      ]}
    >
      <CircleUser size={30} color={theme.primary} strokeWidth={2.25} />

      <Text numberOfLines={2} style={[styles.rowName, { color: theme.text }]}>
        {patient.name}
      </Text>

      <FatButton
        text=""
        textStyle={{ display: 'none' }}
        icon={ChevronRight}
        size="small"
        onPress={() => openPatient(patient.id)}
        accessibilityLabel={`Open ${patient.name}`}
        style={{ width: 56 }}
      />
    </Animated.View>
  );
}

export default function PairingPage() {
  const theme = useTheme();

  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const reveal = useRef(new Animated.Value(0)).current;
  const requestId = useRef(0);
  const patientsRef = useRef<Patient[]>([]);

  useEffect(() => {
    if (!open) return;
    reveal.setValue(0);
    Animated.timing(reveal, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [open]);

  const translateY = reveal.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });

  const toggle = (next: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(next);
    if (!next) {
      setCode('');
      setError(null);
    }
  };

  const loadPatients = useCallback(async () => {
    const id = ++requestId.current;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) throw new Error('Not signed in.');

      const { data: links, error: linkError } = await supabase
        .from('caretaker_patients')
        .select('patient_id, created_at')
        .eq('caretaker_id', uid)
        .order('created_at', { ascending: false });
      if (linkError) throw linkError;

      let next: Patient[] = [];
      if (links && links.length > 0) {
        const ids = links.map((l) => l.patient_id);
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', ids);
        if (profileError) throw profileError;

        const names = new Map<string, string>(
          (profiles ?? []).map((p: any) => [p.id, p.full_name]),
        );
        next = links.map((l) => ({
          id: l.patient_id,
          name: names.get(l.patient_id) || 'Unnamed patient',
          addedAt: l.created_at,
        }));
      }

      if (id !== requestId.current) return; 
      setPatients(next);
      setListError(null);

    } catch (e: any) {
      if (id === requestId.current) {
        setListError(e?.message ?? 'Could not load your patients.');
      }
    } finally {
      if (id === requestId.current) {
        setListLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (!timer) timer = setInterval(loadPatients, POLL_MS);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    loadPatients();
    start();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        loadPatients();
        start();
      } else {
        stop();
      }
    });

    return () => {
      stop();
      sub.remove();
      requestId.current++;
    };
  }, [loadPatients]);

  async function handleAdd() {
    if (loading || !code) return;
    setError(null);
    setLoading(true);
    try {
        console.log("CODEPULLED: "+code)
        const { data, error } = await supabase
            .from('pairing_codes')
            .select("patient_id, expires_at")
            .eq('code', code)
            .maybeSingle();
        if (error) throw error;

        if (data) {
            const expiresAt = new Date(data.expires_at).getTime();
            const now = new Date().getTime();
            if (expiresAt > now || !expiresAt) {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('not sigend in');
                
                const { data: existingPatient, error: existingError } = await supabase
                    .from('caretaker_patients')
                    .select('patient_id')
                    .eq('patient_id', data.patient_id)
                    .maybeSingle();
                if (existingError) throw existingError;
                if (existingPatient) {
                    setError("You have already used this code and added the patient");
                    setCode("")
                    return
                }
                const { error } = await supabase.from('caretaker_patients').insert({
                    caretaker_id: user.id,
                    patient_id: data.patient_id,
                });
                if (error) {
                    setError("An Error has occured");
                } else {
                    setCode("")
                    loadPatients();
                }
            } else {
                setError("This pairing code has expired.");
            }
        } else {
            setError("Invalid pairing code.");
        }
    } catch (error) {
        console.log(error);
    } finally {
        setLoading(false);
    }
  }

  const count = patients.length;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadPatients();
            }}
            tintColor={theme.primary}
          />
        }
      >
        <View style={styles.column}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>My patients</Text>
            <Text style={[styles.subtitle, { color: theme.textSoft }]}>
              {listLoading
                ? 'Loading...'
                : count === 0
                  ? 'Pair with a patient to get started.'
                  : `${count} connected patient${count === 1 ? '' : 's'}`}
            </Text>
          </View>

          {!open ? (
            <FatButton
              text="Add patient"
              icon={UserPlus}
              size="small"
              onPress={() => toggle(true)}
            />
          ) : (
            <Animated.View style={{ gap: 16, opacity: reveal, transform: [{ translateY }] }}>
              <FatInput
                label="Patient code"
                hint="Enter the code from your patient's device."
                icon={KeyRound}
                size="small"
                value={code}
                onChangeText={(t) => {
                  setCode(normalizeCode(t));
                  if (error) setError(null);
                }}
                error={error ?? undefined}
                autoFocus
                autoCapitalize="characters"
                autoCorrect={false}
                autoComplete="off"
                keyboardType="default"
                returnKeyType="done"
                onSubmitEditing={handleAdd}
                placeholder="ABC123"
              />

              <FatButton
                text="Add"
                size="small"
                onPress={handleAdd}
                disabled={!code}
                loading={loading}
                loadingText="Adding..."
              />

              <FatButton
                text="Cancel"
                type="secondary"
                size="small"
                onPress={() => toggle(false)}
                disabled={loading}
              />
            </Animated.View>
          )}

          <View style={styles.list}>
            {listLoading ? (
              <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 24 }} />
            ) : listError ? (
              <View style={styles.emptyBox}>
                <CircleAlert size={32} color={theme.error} strokeWidth={2.5} />
                <Text style={[styles.emptyText, { color: theme.error }]}>{listError}</Text>
                <FatButton
                  text="Try again"
                  type="secondary"
                  size="small"
                  onPress={() => {
                    setListLoading(true);
                    loadPatients();
                  }}
                  style={{ alignSelf: 'stretch' }}
                />
              </View>
            ) : count === 0 ? (
              <View style={styles.emptyBox}>
                <Users size={34} color={theme.textSoft} strokeWidth={2.25} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No patients yet</Text>
                <Text style={[styles.emptyText, { color: theme.textSoft }]}>
                  Tap "Add patient" and enter the code from your patient's device.
                </Text>
              </View>
            ) : (
              patients.map((p, i) => <PatientRow key={p.id} patient={p} index={i} />)
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flexGrow: 1, padding: 20, paddingBottom: 40 },
  column: { width: '100%', maxWidth: 480, alignSelf: 'center', gap: 20 },

  header: { gap: 4, marginTop: 4, marginBottom: 25 },
  title: { fontFamily: FONT.title, fontSize: 32, lineHeight: 36 },
  subtitle: { fontFamily: FONT.body, fontSize: 17, lineHeight: 24 },

  list: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    paddingLeft: 14,
    borderRadius: 18,
    borderWidth: 2,
  },
  rowName: { flex: 1, fontFamily: FONT.bold, fontSize: 19, lineHeight: 24 },

  emptyBox: { alignItems: 'center', gap: 10, paddingVertical: 28, paddingHorizontal: 8 },
  emptyTitle: { fontFamily: FONT.heavy, fontSize: 21, lineHeight: 27, textAlign: 'center' },
  emptyText: { fontFamily: FONT.body, fontSize: 16, lineHeight: 23, textAlign: 'center' },
});