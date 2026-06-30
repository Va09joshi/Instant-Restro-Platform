"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";

export default function SignUp() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      // Save to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        phone: phone || "",
        role: "CUSTOMER",
        createdAt: new Date().toISOString(),
      });

      router.push("/customer/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create an account");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isGoogleLoading) return;
    
    setIsGoogleLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Save to Firestore (upsert)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        role: "CUSTOMER",
        createdAt: new Date().toISOString(),
      }, { merge: true });

      router.push("/customer/dashboard");
    } catch (err: any) {
      // Ignore errors when user closes popup or double-clicks
      if (
        err?.code === 'auth/cancelled-popup-request' || 
        err?.code === 'auth/popup-closed-by-user'
      ) {
        return;
      }
      
      setError("Failed to sign in with Google.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col items-center py-12 px-4 relative z-0">
      {/* Dark Top Background */}
      <div className="absolute top-0 left-0 right-0 h-[50vh] bg-[#0A1616] -z-10"></div>

      <Button
        variant="ghost"
        onClick={() => router.push("/")}
        className="absolute top-4 left-4 sm:top-8 sm:left-8 hover:bg-white/10 text-neutral-400 hover:text-white z-10"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back to Home
      </Button>
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-neutral-100 z-10 mx-4">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center font-[family-name:var(--font-yesteryear)] text-4xl border-b-[1px] border-neutral-200 pb-1">
            <span className="text-emerald-700">I</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">nstant</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-neutral-900 mb-2">Create an account</h2>
        <p className="text-center text-neutral-500 mb-6 text-sm">Sign up to reserve the best tables instantly.</p>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" placeholder="John Doe" required className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Mobile Number</Label>
            <div className="flex gap-2">
              <select className="w-24 border border-neutral-200 bg-neutral-50 rounded-xl px-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3636] focus:border-[#1A3636]">
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+91">🇮🇳 +91</option>
                <option value="+61">🇦🇺 +61</option>
                <option value="+1">🇨🇦 +1</option>
                <option value="+49">🇩🇪 +49</option>
                <option value="+33">🇫🇷 +33</option>
                <option value="+81">🇯🇵 +81</option>
                <option value="+86">🇨🇳 +86</option>
                <option value="+55">🇧🇷 +55</option>
                <option value="+27">🇿🇦 +27</option>
              </select>
              <Input id="phone" name="phone" type="tel" placeholder="(555) 123-4567" required className="h-11 flex-1 bg-neutral-50 border-neutral-200 focus:border-[#1A3636] focus:ring-[#1A3636] rounded-xl" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="john@example.com" required className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required className="h-11" />
          </div>

          <Button type="submit" className="w-full h-11 bg-[#1A3636] hover:bg-[#1A3636]/90 text-white font-medium text-base shadow-md transition-all mt-2" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </Button>
        </form>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-neutral-200"></div>
          <span className="text-xs text-neutral-400 font-medium uppercase">Or continue with</span>
          <div className="flex-1 h-px bg-neutral-200"></div>
        </div>

        <div className="mt-6">
          <Button onClick={handleGoogleSignIn} type="button" variant="outline" className="w-full h-11 border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-medium">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </Button>
        </div>

        <p className="mt-8 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link href="/login" className="text-[#1A3636] hover:text-[#1A3636]/80 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
