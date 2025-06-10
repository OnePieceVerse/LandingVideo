"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({
    google: false,
    email: false,
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleOAuthLogin = async (provider: "google") => {
    try {
      setLoading({ ...loading, [provider]: true });
      setError("");

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}`, // ${window.location.origin}/auth/callback
        },
      });

      if (error) {
        throw error;
      }

      // The redirect happens automatically by Supabase
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading({ ...loading, [provider]: false });
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading({ ...loading, email: true });
      setError("");

      if (!email || !password) {
        throw new Error("Please enter both email and password");
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If user doesn't exist, try to sign up
        if (error.message.includes("Invalid login")) {
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}`,
            },
          });

          if (signUpError) {
            throw signUpError;
          } else {
            setError(
              "A confirmation email has been sent to your email address. Please check your inbox.",
            );
            return;
          }
        } else {
          throw error;
        }
      }

      // If successful, redirect to profile page
      router.push("/profile");
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading({ ...loading, email: false });
    }
  };

  return (
    <div
      className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center py-12"
      data-oid="-:vjq4e"
    >
      <div
        className="mx-auto w-full max-w-md space-y-6 px-4 md:px-6"
        data-oid=":iy:xp6"
      >
        <div className="space-y-2 text-center" data-oid="_8.z.3y">
          <h1 className="text-3xl font-bold" data-oid="w-::van">
            Login
          </h1>
          <p className="text-gray-500 dark:text-gray-400" data-oid="8wx8.x8">
            Sign in to your account using one of the methods below
          </p>
        </div>
        <div className="space-y-4" data-oid="pekac59">
          {error && (
            <div
              className="text-red-500 text-sm text-center"
              data-oid="g2zwbqn"
            >
              {error}
            </div>
          )}

          <div className="grid gap-2" data-oid="2utv5uu">
            <Button
              variant="outline"
              onClick={() => handleOAuthLogin("google")}
              disabled={loading.google}
              className="w-full"
              data-oid="aw.z4d3"
            >
              {loading.google ? (
                <span
                  className="flex items-center justify-center"
                  data-oid="-f9o_:n"
                >
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4 text-current"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    data-oid="tklghgm"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      data-oid="lz3ddky"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      data-oid="iqgyeir"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span
                  className="flex items-center justify-center"
                  data-oid="h:dw.wg"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    data-oid="uxjm-sa"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                      data-oid="ouqsnlu"
                    />

                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                      data-oid="6k2j.3g"
                    />

                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                      data-oid="0rrbqf."
                    />

                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                      data-oid="vhy524h"
                    />

                    <path d="M1 1h22v22H1z" fill="none" data-oid="it-s.18" />
                  </svg>
                  Sign in with Google
                </span>
              )}
            </Button>
          </div>

          <div className="relative my-4" data-oid="dc4zd-2">
            <div
              className="absolute inset-0 flex items-center"
              data-oid="c1701un"
            >
              <span className="w-full border-t" data-oid="z8.5p8r" />
            </div>
            <div
              className="relative flex justify-center text-xs uppercase"
              data-oid="vj4b_m8"
            >
              <span
                className="bg-background px-2 text-muted-foreground"
                data-oid="evxvtk0"
              >
                Or continue with email
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowEmailForm(!showEmailForm)}
            className="w-full"
            data-oid="b9t6vd-"
          >
            <span
              className="flex items-center justify-center"
              data-oid="nuwwu5o"
            >
              <Mail className="mr-2 h-4 w-4" data-oid="w-9rqno" />
              {showEmailForm ? "Hide email form" : "Sign in with Email"}
            </span>
          </Button>

          {showEmailForm && (
            <form
              onSubmit={handleEmailLogin}
              className="mt-4 space-y-4"
              data-oid="cbx8jo0"
            >
              <div className="space-y-2" data-oid="2wb_c.u">
                <Label htmlFor="email" data-oid="7x1li02">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-oid="qd.artr"
                />
              </div>
              <div className="space-y-2" data-oid="aeg48ea">
                <Label htmlFor="password" data-oid="d:rk2es">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-oid="vq:hr74"
                />

                <p className="text-xs text-muted-foreground" data-oid="rq1fnre">
                  Password must be at least 6 characters long
                </p>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading.email}
                data-oid="10d:t3s"
              >
                {loading.email ? (
                  <span
                    className="flex items-center justify-center"
                    data-oid="ov9_dng"
                  >
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-current"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      data-oid="_9xt.na"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        data-oid="mlhl:z."
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        data-oid="x6b7q4c"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Sign in / Sign up"
                )}
              </Button>
            </form>
          )}

          <div className="text-center text-sm mt-4" data-oid="1bxvdxw">
            <Link
              href="/"
              className="underline underline-offset-4 hover:text-primary"
              data-oid="_6dov56"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
