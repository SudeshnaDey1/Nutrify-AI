import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  ArrowRight,
  ChefHat,
  Loader2,
  LogOut,
  ShieldCheck,
  Sparkles,
  UserCircle2,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  clearStoredSession,
  generateMealPlan,
  getCurrentUser,
  getMealHistory,
  getProfile,
  getStoredSession,
  loginUser,
  registerUser,
  saveProfile,
  submitFeedback,
} from './api';
import { AppUser, AuthSession, MealPlan, Profile } from './types';

type AuthMode = 'login' | 'register';
type AppTab = 'overview' | 'profile' | 'meals';

const emptyProfile: Profile = {
  age: undefined,
  gender: '',
  weight: undefined,
  height: undefined,
  activityLevel: '',
  goal: '',
};

function normalizeError(error: unknown) {
  if (!(error instanceof Error)) {
    return 'Something went wrong. Please try again.';
  }

  if (error.message.includes('Bad credentials')) {
    return 'Incorrect username or password.';
  }

  if (error.message.includes('Username is already taken')) {
    return 'That username is already taken.';
  }

  if (error.message.includes('Email is already in use')) {
    return 'That email is already registered.';
  }

  return error.message.replace(/^"+|"+$/g, '');
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-3xl border border-white/60 bg-white/75 p-5 shadow-sm backdrop-blur">
      <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{label}</div>
      <div className="mt-3 text-3xl font-semibold text-slate-900">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{hint}</div>
    </div>
  );
}

export default function App() {
  const [booting, setBooting] = useState(true);
  const [tab, setTab] = useState<AppTab>('overview');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authenticating, setAuthenticating] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [generatingMeal, setGeneratingMeal] = useState(false);
  const [authError, setAuthError] = useState('');
  const [pageError, setPageError] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [session, setSession] = useState<AuthSession | null>(getStoredSession());
  const [user, setUser] = useState<AppUser | null>(getStoredSession()?.user || null);
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [authForm, setAuthForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [feedbackForm, setFeedbackForm] = useState<Record<number, { rating: string; comments: string }>>({});

  const latestMealPlan = mealPlans[0];
  const completionScore = useMemo(() => {
    const fields = [profile.age, profile.gender, profile.weight, profile.height, profile.activityLevel, profile.goal];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  useEffect(() => {
    const restoreSession = async () => {
      if (!session?.token) {
        setBooting(false);
        return;
      }

      try {
        const [currentUser, currentProfile, history] = await Promise.all([
          getCurrentUser(session.token),
          getProfile(session.token),
          getMealHistory(session.token),
        ]);
        setUser(currentUser);
        setProfile({
          ...emptyProfile,
          ...currentProfile,
        });
        setMealPlans(history);
      } catch (error) {
        clearStoredSession();
        setSession(null);
        setUser(null);
        setPageError(normalizeError(error));
      } finally {
        setBooting(false);
      }
    };

    restoreSession();
  }, [session?.token]);

  const handleLogout = () => {
    clearStoredSession();
    setSession(null);
    setUser(null);
    setProfile(emptyProfile);
    setMealPlans([]);
    setFeedbackForm({});
    setAuthError('');
    setPageError('');
    setFeedbackMessage('');
    setTab('overview');
  };

  const handleAuthSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError('');

    if (authMode === 'register' && authForm.password !== authForm.confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    setAuthenticating(true);

    try {
      const nextSession = authMode === 'login'
        ? await loginUser({ username: authForm.username, password: authForm.password })
        : await registerUser({ username: authForm.username, email: authForm.email, password: authForm.password });

      setSession(nextSession);
      setUser(nextSession.user);
      setProfile(emptyProfile);
      setMealPlans([]);
      setFeedbackForm({});
      setAuthForm({ username: '', email: '', password: '', confirmPassword: '' });
      setPageError('');
    } catch (error) {
      setAuthError(normalizeError(error));
    } finally {
      setAuthenticating(false);
    }
  };

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session?.token) {
      return;
    }

    setSavingProfile(true);
    setPageError('');
    setFeedbackMessage('');

    try {
      const saved = await saveProfile(session.token, profile);
      setProfile({
        ...emptyProfile,
        ...saved,
      });
    } catch (error) {
      setPageError(normalizeError(error));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleGenerateMealPlan = async () => {
    if (!session?.token) {
      return;
    }

    setGeneratingMeal(true);
    setPageError('');
    setFeedbackMessage('');

    try {
      const mealPlan = await generateMealPlan(session.token);
      setMealPlans((current) => [mealPlan, ...current.filter((item) => item.id !== mealPlan.id)]);
      setTab('meals');
    } catch (error) {
      setPageError(normalizeError(error));
    } finally {
      setGeneratingMeal(false);
    }
  };

  const handleFeedbackSubmit = async (mealPlanId: number) => {
    if (!session?.token) {
      return;
    }

    const feedback = feedbackForm[mealPlanId];
    if (!feedback?.rating) {
      setPageError('Please choose a rating before sending feedback.');
      return;
    }

    setPageError('');

    try {
      await submitFeedback(session.token, {
        mealPlanId,
        rating: Number(feedback.rating),
        comments: feedback.comments || '',
      });
      setFeedbackMessage('Feedback saved successfully.');
      setFeedbackForm((current) => ({
        ...current,
        [mealPlanId]: { rating: '', comments: '' },
      }));
    } catch (error) {
      setPageError(normalizeError(error));
    }
  };

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#ecfeff,_#f8fafc_40%,_#e2e8f0)]">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user || !session) {
    return (
      <div className="min-h-screen bg-[linear-gradient(135deg,_#081c15_0%,_#1b4332_38%,_#d8f3dc_100%)] px-4 py-10 text-slate-900">
        <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/55 p-8 text-white shadow-2xl backdrop-blur"
          >
            <div className="absolute -right-20 top-0 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-lime-200/10 blur-3xl" />
            <div className="relative flex h-full flex-col justify-between gap-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm">
                  <ChefHat className="h-4 w-4 text-emerald-300" />
                  NutrifyAI Application
                </div>
                <div className="space-y-4">
                  <h1 className="max-w-xl text-5xl font-semibold tracking-tight">NutrifyAI – AI-Powered Nutrition & Meal Recommendation System</h1>
                  <p className="max-w-2xl text-lg leading-8 text-emerald-50/80">
                    NutrifyAI is a full-stack AI-powered application designed to provide personalized nutrition and meal recommendations based on user input, health goals, and lifestyle preferences. The system uses machine learning and intelligent algorithms to generate customized diet plans that promote healthy living.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
                  <ShieldCheck className="h-6 w-6 text-emerald-300" />
                  <div className="mt-4 font-semibold">Personalized Plans</div>
                  <div className="mt-2 text-sm text-emerald-50/70">Get custom meal plans tailored to your specific health goals, dietary restrictions, and taste preferences.</div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
                  <UserCircle2 className="h-6 w-6 text-emerald-300" />
                  <div className="mt-4 font-semibold">Smart Tracking</div>
                  <div className="mt-2 text-sm text-emerald-50/70">Effortlessly log your daily intake and monitor your progress with intuitive AI-driven insights.</div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
                  <Sparkles className="h-6 w-6 text-emerald-300" />
                  <div className="mt-4 font-semibold">Expert AI Advice</div>
                  <div className="mt-2 text-sm text-emerald-50/70">Access 24/7 nutritional guidance powered by advanced machine learning to keep your health on track.</div>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <Card className="w-full rounded-[2rem] border-0 bg-white/92 shadow-2xl backdrop-blur">
              <CardHeader className="space-y-5 p-8 pb-4">
                <div className="inline-flex rounded-full bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition ${authMode === 'login' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition ${authMode === 'register' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}
                  >
                    Register
                  </button>
                </div>
                <div>
                  <CardTitle className="text-3xl font-semibold text-slate-950">
                    {authMode === 'login' ? 'Welcome back' : 'Create your account'}
                  </CardTitle>
                  <CardDescription className="mt-2 text-base text-slate-500">
                    {authMode === 'login'
                      ? 'Sign in with your username and password.'
                      : 'Register your customer account and start using the nutrition dashboard.'}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-8 pt-2">
                <form onSubmit={handleAuthSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={authForm.username}
                      onChange={(event) => setAuthForm((current) => ({ ...current, username: event.target.value }))}
                      placeholder="Enter your username"
                      required
                      className="h-12 rounded-2xl border-slate-200"
                    />
                  </div>

                  {authMode === 'register' && (
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={authForm.email}
                        onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))}
                        placeholder="Enter your email"
                        required
                        className="h-12 rounded-2xl border-slate-200"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={authForm.password}
                      onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))}
                      placeholder="Enter your password"
                      required
                      className="h-12 rounded-2xl border-slate-200"
                    />
                  </div>

                  {authMode === 'register' && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={authForm.confirmPassword}
                        onChange={(event) => setAuthForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                        placeholder="Re-enter your password"
                        required
                        className="h-12 rounded-2xl border-slate-200"
                      />
                    </div>
                  )}
                  {authError && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{authError}</div>}
                  {pageError && <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">{pageError}</div>}

                  <Button
                    type="submit"
                    disabled={authenticating}
                    className="h-12 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800"
                  >
                    {authenticating ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Please wait
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        {authMode === 'login' ? 'Login to dashboard' : 'Create account'}
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f7fee7,_#f8fafc_30%,_#e2e8f0)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6 lg:px-6">
        <aside className="hidden w-72 shrink-0 rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl lg:flex lg:flex-col">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500/20 p-3 text-emerald-300">
              <ChefHat className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xl font-semibold">NutrifyAI</div>
              <div className="text-sm text-slate-400">AI Personalised</div>
            </div>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
  <div className="flex items-center gap-3">
    <Avatar className="h-12 w-12 border border-white/10 shrink-0">
      <AvatarFallback className="bg-emerald-500/20 text-emerald-200">
        {user.username.slice(0, 1).toUpperCase()}
      </AvatarFallback>
    </Avatar>

    <div className="min-w-0 flex-1">
      <div className="font-medium truncate">
        {user.username}
      </div>

      <div
        className="text-sm text-slate-400 truncate w-full"
        title={user.email}
      >
        {user.email}
      </div>
    </div>
  </div>
</div>

          <nav className="mt-8 space-y-2">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'profile', label: 'Health Profile', icon: UserCircle2 },
              { id: 'meals', label: 'Meal Plans', icon: Sparkles },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id as AppTab)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                  tab === item.id ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-4">
            <div className="rounded-[1.5rem] bg-emerald-500/15 p-4">
              <div className="text-xs uppercase tracking-[0.25em] text-emerald-200/80">Profile completion</div>
              <div className="mt-3 text-3xl font-semibold">{completionScore}%</div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-emerald-400" style={{ width: `${completionScore}%` }} />
              </div>
            </div>
            <Button type="button" variant="ghost" onClick={handleLogout} className="w-full justify-start rounded-2xl text-slate-300 hover:bg-white/10 hover:text-white">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          <header className="rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.35em] text-slate-400">Customer dashboard</div>
                <h1 className="mt-2 text-3xl font-semibold">NutrifyAI – AI-Powered Nutrition & Meal Recommendation System</h1>
                <p className="mt-2 text-slate-500">Use the profile tab to save customer details, then generate meal plans .</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={() => setTab('profile')} className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800">
                  Update profile
                </Button>
                <Button type="button" onClick={handleGenerateMealPlan} disabled={generatingMeal} className="rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700">
                  {generatingMeal ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Generate meal plan
                </Button>
              </div>
            </div>
          </header>

          {pageError && <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700">{pageError}</div>}
          {feedbackMessage && <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">{feedbackMessage}</div>}

          {tab === 'overview' && (
            <section className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard label="Latest plan" value={latestMealPlan ? new Date(latestMealPlan.planDate).toLocaleDateString() : 'None yet'} hint="Most recent backend-generated plan" />
                <StatCard label="Calories" value={latestMealPlan ? `${Math.round(latestMealPlan.totalCalories)} kcal` : '--'} hint="Daily target in your latest plan" />
                <StatCard label="Goal" value={profile.goal ? profile.goal.replace('_', ' ') : 'Not set'} hint="Set from the saved health profile" />
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <Card className="rounded-[2rem] border-white/60 bg-white/80 shadow-sm">
                  <CardHeader>
                    <CardTitle>Latest meal lineup</CardTitle>
                    <CardDescription> Meal history.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    {latestMealPlan ? (
                      [
                        ['Breakfast', latestMealPlan.breakfast],
                        ['Lunch', latestMealPlan.lunch],
                        ['Dinner', latestMealPlan.dinner],
                        ['Snacks', latestMealPlan.snacks],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-3xl bg-slate-50 p-5">
                          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{label}</div>
                          <div className="mt-3 text-lg font-medium text-slate-900">{value}</div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full rounded-3xl border border-dashed border-slate-200 px-6 py-14 text-center text-slate-500">
                        Save your health profile first, then generate a meal plan from the dashboard.
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card className="rounded-[2rem] border-white/60 bg-slate-950 text-white shadow-sm">
                  <CardHeader>
                    <CardTitle>Nutrition macros</CardTitle>
                    <CardDescription className="text-slate-400">These values come from the meal plan response.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="rounded-3xl bg-white/5 p-5">
                      <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Protein</div>
                      <div className="mt-2 text-3xl font-semibold">{latestMealPlan ? `${Math.round(latestMealPlan.protein)} g` : '--'}</div>
                    </div>
                    <div className="rounded-3xl bg-white/5 p-5">
                      <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Carbs</div>
                      <div className="mt-2 text-3xl font-semibold">{latestMealPlan ? `${Math.round(latestMealPlan.carbs)} g` : '--'}</div>
                    </div>
                    <div className="rounded-3xl bg-white/5 p-5">
                      <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Fats</div>
                      <div className="mt-2 text-3xl font-semibold">{latestMealPlan ? `${Math.round(latestMealPlan.fats)} g` : '--'}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

          {tab === 'profile' && (
            <Card className="rounded-[2rem] border-white/60 bg-white/85 shadow-sm">
              <CardHeader>
                <CardTitle>Customer health profile</CardTitle>
                <CardDescription>These details are stored through the Customer inputs.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" type="number" value={profile.age ?? ''} onChange={(event) => setProfile((current) => ({ ...current, age: Number(event.target.value) || undefined }))} className="h-11 rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Input id="gender" value={profile.gender ?? ''} onChange={(event) => setProfile((current) => ({ ...current, gender: event.target.value }))} placeholder="Female, Male, Other" className="h-11 rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input id="weight" type="number" step="0.1" value={profile.weight ?? ''} onChange={(event) => setProfile((current) => ({ ...current, weight: Number(event.target.value) || undefined }))} className="h-11 rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input id="height" type="number" step="0.1" value={profile.height ?? ''} onChange={(event) => setProfile((current) => ({ ...current, height: Number(event.target.value) || undefined }))} className="h-11 rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activityLevel">Activity level</Label>
                    <Input id="activityLevel" value={profile.activityLevel ?? ''} onChange={(event) => setProfile((current) => ({ ...current, activityLevel: event.target.value }))} placeholder="sedentary, moderate, active" className="h-11 rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal">Goal</Label>
                    <Input id="goal" value={profile.goal ?? ''} onChange={(event) => setProfile((current) => ({ ...current, goal: event.target.value }))} placeholder="weight_loss, muscle_gain, maintenance" className="h-11 rounded-2xl" />
                  </div>
                  <div className="md:col-span-2">
                    <Button type="submit" disabled={savingProfile} className="h-11 rounded-2xl bg-slate-950 text-white hover:bg-slate-800">
                      {savingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Save profile
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {tab === 'meals' && (
            <section className="space-y-5">
              {mealPlans.length === 0 ? (
                <Card className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 shadow-sm">
                  <CardContent className="py-16 text-center text-slate-500">
                    No meal plans yet. Save a profile, then click generate meal plan.
                  </CardContent>
                </Card>
              ) : (
                mealPlans.map((mealPlan) => (
                  <Card key={mealPlan.id} className="rounded-[2rem] border-white/60 bg-white/85 shadow-sm">
                    <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <CardTitle>Meal plan for {new Date(mealPlan.planDate).toLocaleDateString()}</CardTitle>
                        <CardDescription>Generated and stored.</CardDescription>
                      </div>
                      <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                        {Math.round(mealPlan.totalCalories)} kcal
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {[
                          ['Breakfast', mealPlan.breakfast],
                          ['Lunch', mealPlan.lunch],
                          ['Dinner', mealPlan.dinner],
                          ['Snacks', mealPlan.snacks],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-3xl bg-slate-50 p-5">
                            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{label}</div>
                            <div className="mt-3 text-base font-medium text-slate-900">{value}</div>
                          </div>
                        ))}
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-3xl bg-emerald-50 p-5">
                          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">Protein</div>
                          <div className="mt-2 text-2xl font-semibold text-emerald-950">{Math.round(mealPlan.protein)} g</div>
                        </div>
                        <div className="rounded-3xl bg-sky-50 p-5">
                          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">Carbs</div>
                          <div className="mt-2 text-2xl font-semibold text-sky-950">{Math.round(mealPlan.carbs)} g</div>
                        </div>
                        <div className="rounded-3xl bg-amber-50 p-5">
                          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">Fats</div>
                          <div className="mt-2 text-2xl font-semibold text-amber-950">{Math.round(mealPlan.fats)} g</div>
                        </div>
                      </div>
                      <div className="rounded-[1.5rem] border border-slate-200 p-5">
                        <div className="mb-4">
                          <div className="text-lg font-semibold">Send customer feedback</div>
                          <div className="text-sm text-slate-500">Ratings and comments.</div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-[140px_1fr_auto]">
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            placeholder="Rating 1-5"
                            value={feedbackForm[mealPlan.id]?.rating || ''}
                            onChange={(event) => setFeedbackForm((current) => ({
                              ...current,
                              [mealPlan.id]: {
                                rating: event.target.value,
                                comments: current[mealPlan.id]?.comments || '',
                              },
                            }))}
                            className="h-11 rounded-2xl"
                          />
                          <Input
                            placeholder="Optional comments"
                            value={feedbackForm[mealPlan.id]?.comments || ''}
                            onChange={(event) => setFeedbackForm((current) => ({
                              ...current,
                              [mealPlan.id]: {
                                rating: current[mealPlan.id]?.rating || '',
                                comments: event.target.value,
                              },
                            }))}
                            className="h-11 rounded-2xl"
                          />
                          <Button type="button" onClick={() => handleFeedbackSubmit(mealPlan.id)} className="h-11 rounded-2xl bg-slate-950 text-white hover:bg-slate-800">
                            Submit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
