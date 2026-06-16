import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { profileCache } from '../structures';

interface Profile {
  id: string;
  email: string;
  role: 'residente' | 'guardia' | 'admin';
  house: string | null;
  full_name: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: string, house?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const registerForPushNotifications = async (userId: string) => {
    if (!Device.isDevice) {
      console.log('[Notifications] No es dispositivo físico, saltando...');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Notifications] Permiso denegado');
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('[Notifications] Token registrado:', token);

    await supabase.from('profiles').update({ push_token: token }).eq('id', userId);
  };

  const fetchProfile = async (userId: string) => {
    // Intento de obtener del cache (HashTable)
    const cached = profileCache.get(userId);
    if (cached) {
      console.log('[Cache HIT] Perfil encontrado en HashTable para:', userId);
      setProfile(cached as any);
      setLoading(false);
      return;
    }

    console.log('[Cache MISS] Buscando perfil en Supabase para:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data);
      profileCache.set(userId, data);
      console.log('[Auth] Perfil cargado y guardado en cache:', data.email, '- Rol:', data.role);
    }

    await registerForPushNotifications(userId);
    setLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, role: string = 'residente', house: string = '') => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  if (data.user) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role, house: house || null })
      .eq('id', data.user.id);
    console.log('[Auth] Rol actualizado a:', role, updateError ? updateError.message : 'OK');

    await fetchProfile(data.user.id);
  }
};

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);