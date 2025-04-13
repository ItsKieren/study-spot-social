// src/hooks/useAuth.tsx
import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from 'react';
import { Session, User, AuthError, Provider } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { useToast } from './use-toast';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithProvider: (provider: Provider) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const initializeAuth = useCallback(async () => {
    let isSupabaseMocked = false;
    try {
      setLoading(true);
      if (typeof supabase.auth?.onAuthStateChange !== 'function') {
           isSupabaseMocked = true;
           console.error("AuthProvider Init: Supabase client appears mocked. Check Vercel env vars.");
           toast({ /* ... config error toast ... */ });
      } else {
          console.log("AuthProvider Init: Attempting getSession...");
          const { data, error: getSessionError } = await supabase.auth.getSession();
          console.log("AuthProvider Init: getSession result", { /* ... logs ... */ });
          if (getSessionError) {
            console.error("AuthProvider Init: Error getting initial session:", getSessionError.message);
            toast({ /* ... session error toast ... */ });
          }
          setSession(data.session);
          setUser(data.session?.user ?? null);
      }
    } catch (error: any) {
       console.error("AuthProvider Init: Critical error:", error);
       toast({ /* ... init error toast ... */ });
       setSession(null); setUser(null); isSupabaseMocked = true;
    } finally {
        console.log("AuthProvider Init: Setting loading false.");
        setLoading(false);
    }

    let unsubscribeCallback = () => {};
    if (!isSupabaseMocked && supabase.auth?.onAuthStateChange) {
        console.log("AuthProvider: Setting up listener.");
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
            console.log("AuthProvider: onAuthStateChange received!", { /* ... logs ... */ });
            setSession(currentSession); setUser(currentSession?.user ?? null);
            if (loading && !currentSession) setLoading(false);
          }
        );
        unsubscribeCallback = () => { console.log("AuthProvider: Unsubscribing."); subscription?.unsubscribe(); };
    } else if (!isSupabaseMocked) { console.error("AuthProvider: Cannot set up listener!"); }
    return unsubscribeCallback;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  useEffect(() => {
    const cleanupPromise = initializeAuth();
    return () => { cleanupPromise.then(unsub => { if (typeof unsub === 'function') { unsub(); } }).catch(err => console.error("Error unsubscribing:", err)); };
  }, [initializeAuth]);

  const signIn = async (email: string, password: string): Promise<{ error: AuthError | null }> => { /* ... direct call + logging ... */
    console.log("AuthProvider: signIn called");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) console.error("AuthProvider: signIn error:", error.message);
    return { error };
  };
  const signUp = async (email: string, password: string): Promise<{ error: AuthError | null }> => { /* ... direct call + logging ... */
    console.log("AuthProvider: signUp called");
    const { error } = await supabase.auth.signUp({ email, password });
     if (error) console.error("AuthProvider: signUp error:", error.message);
    return { error };
  };
  const signInWithProvider = async (provider: Provider): Promise<{ error: AuthError | null }> => { /* ... direct call + logging ... */
    console.log(`AuthProvider: signInWithProvider (${provider}) called`);
    const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: { redirectTo: window.location.origin },
    });
     if (error) console.error(`AuthProvider: signInWithProvider (${provider}) error:`, error.message);
    return { error };
  };
  const signOut = async (): Promise<{ error: AuthError | null }> => { /* ... direct call + logging ... */
    console.log("AuthProvider: signOut called");
    const { error } = await supabase.auth.signOut();
     if (error) console.error("AuthProvider: signOut error:", error.message);
    return { error };
  };

  const value = { user, session, loading, signIn, signUp, signInWithProvider, signOut };

  return (
      <AuthContext.Provider value={value}>
          {loading && ( <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div> )}
          {children}
      </AuthContext.Provider>
  );
}

export function useAuth() { /* ... */
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}