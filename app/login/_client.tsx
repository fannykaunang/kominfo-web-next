"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  Check,
} from "lucide-react";
import { AppSettings } from "@/lib/types";

interface LoginFormProps {
  settings: AppSettings | null;
}

export default function LoginPage({ settings }: LoginFormProps) {
  const router = useRouter();

  // State Halaman
  const [step, setStep] = useState<"login" | "otp">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // State Form Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // State Form OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer Hitung Mundur Resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // --- LOGIC: STEP 1 (LOGIN) ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login gagal");
      }

      // Jika sukses, pindah ke langkah OTP
      setStep("otp");
      setCountdown(60); // Mulai timer 60 detik
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIC: STEP 2 (OTP) ---

  // 1. Handle Input Manual
  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return; // Hanya angka

    const newOtp = [...otp];
    // Ambil karakter terakhir saja (jika user mengetik cepat)
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Pindah fokus ke kotak berikutnya jika diisi
    if (value !== "" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // 2. Handle Tombol Backspace
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Pindah fokus ke belakang jika backspace ditekan di kotak kosong
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // 3. Handle Paste (Fitur Baru)
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault(); // Mencegah paste default
    const pastedData = e.clipboardData.getData("text");
    // Hanya ambil angka dan batasi 6 karakter
    const pastedNumbers = pastedData.replace(/\D/g, "").slice(0, 6);

    if (pastedNumbers.length === 0) return;

    const newOtp = [...otp];
    pastedNumbers.split("").forEach((char, index) => {
      newOtp[index] = char;
    });
    setOtp(newOtp);

    // Fokuskan ke kotak terakhir yang terisi atau kotak kosong berikutnya
    const nextFocusIndex = Math.min(pastedNumbers.length, 5);
    otpInputRefs.current[nextFocusIndex]?.focus();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setError("Masukkan 6 digit kode OTP");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verifikasi gagal");
      }

      // Sukses login -> Redirect ke Dashboard
      router.push("/backend/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Gagal mengirim ulang OTP");

      setCountdown(60); // Reset timer
      // Optional: Tampilkan toast sukses di sini
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2 overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* SISI KIRI: Visual dengan Background Aesthetic */}
      <div className="hidden lg:flex relative flex-col justify-between p-10">
        {/* Background Aesthetic Image */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="https://qc4n.bigmodel.cn/imagelXmQ_searched.png?UCloudPublicKey=TOKEN_3f4277c6-f8d6-41a9-968b-dbfa0994d483&Expires=1797067152&Signature=5dk5gK2UGmC5sRqDh4ddWdR2I6o%3D"
            alt="Aesthetic Background"
            fill
            priority
            className="object-cover opacity-80"
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 flex items-center text-lg font-medium cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div className="mr-3">
            {settings?.logo ? (
              <Image
                src={settings.logo}
                alt={settings.nama_aplikasi || "Logo"}
                width={42}
                height={42}
                className="object-contain"
                priority
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {settings?.alias_aplikasi || "PM"}
              </div>
            )}
          </div>
          <span className="font-bold tracking-wide text-white text-xl drop-shadow-md">
            {settings?.alias_aplikasi || "PM"}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-20 mt-auto"
        >
          <blockquote className="space-y-2">
            <p className="text-lg text-white/90 font-medium drop-shadow-sm">
              &ldquo;Mengelola informasi publik dengan transparansi dan
              akuntabilitas untuk kemajuan Kabupaten Merauke.&rdquo;
            </p>
            <footer className="text-sm text-white/80">
              <Link
                href="https://kominfo.merauke.go.id"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white hover:underline transition-colors"
              >
                Dinas Komunikasi dan Informatika Kabupaten Merauke
              </Link>
            </footer>
          </blockquote>
        </motion.div>
      </div>

      {/* SISI KANAN: Form Area */}
      <div className="flex items-center justify-center min-h-screen p-4 lg:p-8 relative">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSes-Bci5GqxhoJTD4viRV6WWbZ2J7oP5KQ6w&s"
            alt="Musamus Merauke"
            fill
            priority
            className="object-cover opacity-100 scale-105"
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/80 to-white/70" />
        </div>

        <div className="mx-auto w-full max-w-[380px] relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 dark:border-zinc-800 p-8"
          >
            <AnimatePresence mode="wait">
              {/* --- STEP 1: LOGIN FORM --- */}
              {step === "login" && (
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col space-y-2 text-center">
                    <div className="lg:hidden mx-auto mb-4">
                      <Image
                        src="/Lambang_Kabupaten_Merauke.png"
                        alt="Logo"
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                      Selamat Datang
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Masukan akun administrator Anda
                    </p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="nama@kominfo.go.id"
                        disabled={isLoading}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          disabled={isLoading}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <Alert
                        variant="destructive"
                        className="bg-red-50 text-red-800 border-red-200"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg transform transition-all duration-300 hover:scale-105"
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      ) : (
                        "Masuk"
                      )}
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* --- STEP 2: OTP FORM --- */}
              {step === "otp" && (
                <motion.div
                  key="otp-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col space-y-2 text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                      Verifikasi OTP
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Kode 6 digit telah dikirim ke{" "}
                      <span className="font-medium text-zinc-900 dark:text-white">
                        {email}
                      </span>
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    {/* OTP INPUTS */}
                    <div className="flex justify-center gap-2">
                      {otp.map((digit, index) => (
                        <Input
                          key={index}
                          ref={(el) => {
                            otpInputRefs.current[index] = el;
                          }}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          // PERBAIKAN DI SINI: Menambahkan onPaste
                          onPaste={handlePaste}
                          className="w-12 h-14 text-center text-2xl font-bold bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 border-2 border-blue-200 dark:border-zinc-700 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:scale-105"
                          inputMode="numeric"
                          autoFocus={index === 0}
                          disabled={isLoading}
                        />
                      ))}
                    </div>

                    {otp.every((d) => d !== "") && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                      >
                        <div className="inline-flex items-center gap-2 text-green-600">
                          <Check className="h-5 w-5" />
                          <span className="text-sm font-medium">
                            Kode valid!
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {error && (
                      <Alert
                        variant="destructive"
                        className="bg-red-50 text-red-800 border-red-200"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg transform transition-all duration-300 hover:scale-105"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          Memverifikasi...
                        </>
                      ) : (
                        "Verifikasi & Masuk"
                      )}
                    </Button>
                  </form>

                  {/* OTP Footer */}
                  <div className="space-y-4 text-center">
                    <div className="text-sm">
                      {countdown > 0 ? (
                        <span className="text-muted-foreground">
                          Kirim ulang dalam{" "}
                          <span className="font-medium text-zinc-900 dark:text-white">
                            {countdown} detik
                          </span>
                        </span>
                      ) : (
                        <button
                          onClick={handleResendOtp}
                          disabled={isLoading}
                          className="text-blue-600 hover:text-blue-500 font-medium flex items-center justify-center mx-auto gap-2 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" /> Kirim Kode Baru
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setStep("login");
                        setError("");
                        setOtp(["", "", "", "", "", ""]);
                      }}
                      className="text-sm text-muted-foreground hover:text-zinc-900 dark:hover:text-white flex items-center justify-center mx-auto gap-2 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" /> Kembali ke Login
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 text-center text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Pemerintah Kabupaten Merauke
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
