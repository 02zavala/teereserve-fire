
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
        });
    }
}


export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    
    useEffect(() => {
        const enablePersistence = async () => {
            try {
                await setPersistence(auth, browserLocalPersistence);
            } catch (error: any) {
                if (error.code !== 'failed-precondition') {
                    console.error("Firebase persistence error:", error);
                }
            }
        };
        enablePersistence();
    }, []);

    const fetchUserProfile = useCallback(async (firebaseUser: User) => {
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
            };
            await setDoc(userDocRef, profile);
            setUserProfile(profile);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setLoading(true);
            setUser(user);
            if (user) {
                await fetchUserProfile(user);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        // Handle redirect result
        getRedirectResult(auth)
            .then(async (result) => {
                if (result) {
                    await createUserInFirestore(result.user);
                    // Optionally fetch user profile again or trust the onAuthStateChanged listener
                }
            })
            .catch((error) => {
                console.error("Error getting redirect result:", error);
            });

        return () => unsubscribe();
    }, [fetchUserProfile]);

     const refreshUserProfile = useCallback(async () => {
        if (user) {
            setLoading(true);
            await fetchUserProfile(user);
            setLoading(false);
        }
    }, [user, fetchUserProfile]);
    
    const login = (email: string, pass: string) => {
        return signInWithEmailAndPassword(auth, email, pass);
    };

    const signup = async (email: string, pass: string, displayName: string, handicap?: number) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        await updateFirebaseAuthProfile(userCredential.user, { displayName });
        
        await createUserInFirestore(userCredential.user, handicap);
        
        // Refresh local state after creating profile
        await fetchUserProfile(userCredential.user);

        return userCredential;
    };
    
    const logout = async () => {
        await signOut(auth);
        setUser(null);
        setUserProfile(null);
        router.push('/');
    };

    const googleSignIn = async () => {
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
