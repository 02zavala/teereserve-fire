
"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { 
    onAuthStateChanged, 
    User, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile as updateFirebaseAuthProfile,
    GoogleAuthProvider,
    signInWithRedirect,
    getRedirectResult,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import type { UserProfile } from '@/types';

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<any>;
    signup: (email: string, pass: string, displayName: string, handicap?: number) => Promise<any>;
    logout: () => Promise<void>;
    googleSignIn: () => Promise<any>;
    refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createUserInFirestore = async (userCredential: User, handicap?: number) => {
    if (!db) return; // Do nothing if db is not initialized
    const user = userCredential;
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        const role: UserProfile['role'] = user.email === 'oscargomez@teereserve.golf' ? 'SuperAdmin' : 'Customer';
        await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: role,
            createdAt: new Date().toISOString(),
            handicap: handicap,
            xp: 0,
            achievements: [],
        });
    }
}


export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true); // Only for initial auth state check
    const router = useRouter();
    
    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        };

        const enablePersistence = async () => {
            try {
                if (auth) {
                  await setPersistence(auth, browserLocalPersistence);
                }
            } catch (error: any) {
                if (error.code !== 'failed-precondition') {
                    console.error("Firebase persistence error:", error);
                }
            }
        };
        enablePersistence();

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                await fetchUserProfile(user);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        getRedirectResult(auth)
            .then(async (result) => {
                if (result) {
                    await createUserInFirestore(result.user);
                }
            })
            .catch((error) => {
                console.error("Error getting redirect result:", error);
            });

        return () => unsubscribe();
    }, []);

    const fetchUserProfile = useCallback(async (firebaseUser: User) => {
        if (!db) return;
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
        } else {
            const profile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                role: firebaseUser.email === 'oscargomez@teereserve.golf' ? 'SuperAdmin' : 'Customer',
                createdAt: new Date().toISOString(),
                handicap: undefined,
                xp: 0,
                achievements: [],
            };
            await setDoc(userDocRef, profile);
            setUserProfile(profile);
        }
    }, []);

     const refreshUserProfile = useCallback(async () => {
        if (user) {
            await fetchUserProfile(user);
        }
    }, [user, fetchUserProfile]);
    
    const login = async (email: string, pass: string) => {
      if (!auth) throw new Error("Authentication is not available.");
      return await signInWithEmailAndPassword(auth, email, pass);
    };

    const signup = async (email: string, pass: string, displayName: string, handicap?: number) => {
        if (!auth) throw new Error("Authentication is not available.");
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        await updateFirebaseAuthProfile(userCredential.user, { displayName });
        await createUserInFirestore(userCredential.user, handicap);
        await fetchUserProfile(userCredential.user);
        return userCredential;
    };
    
    const logout = async () => {
        if (!auth) return;
        setUser(null);
        setUserProfile(null);
        await signOut(auth);
        router.push('/');
        router.refresh(); 
    };

    const googleSignIn = async () => {
        if (!auth) throw new Error("Authentication is not available.");
        const provider = new GoogleAuthProvider();
        return signInWithRedirect(auth, provider);
    };

    const value = {
        user,
        userProfile,
        loading,
        login,
        signup,
        logout,
        googleSignIn,
        refreshUserProfile
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
