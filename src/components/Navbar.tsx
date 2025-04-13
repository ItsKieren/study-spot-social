// src/components/Navbar.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, MapPin, LogOut, UserPlus, LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { FcGoogle } from "react-icons/fc"; // Keep Google Icon

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSignInOpen, setIsSignInOpen] = useState(false);
    const [isSignUpOpen, setIsSignUpOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authActionLoading, setAuthActionLoading] = useState<string | null>(null);

    // Use useAuth hook which now contains signInWithProvider
    const { user, signOut, signIn, signUp, signInWithProvider, loading: authLoadingGlobal } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        setAuthActionLoading("signout");
        const { error } = await signOut();
        if (error) {
            console.error("Sign Out Error:", error);
            // --- MODIFIED TOAST ---
            toast({ title: "Sign Out Error", description: `Failed to sign out: ${error.message}`, variant: "destructive" });
        } else {
            toast({ title: "Signed Out", description: "You have been successfully signed out." });
            navigate("/");
        }
        setAuthActionLoading(null);
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthActionLoading("signin");
        const { error } = await signIn(email, password);
        if (error) {
            console.error("Sign In Error:", error);
             // --- MODIFIED TOAST ---
            toast({ title: "Sign In Error", description: `Invalid email or password: ${error.message}`, variant: "destructive" });
        } else {
            toast({ title: "Signed In", description: "Welcome back!" });
            setIsSignInOpen(false);
            // Auth state change will handle UI update via listener
        }
        setAuthActionLoading(null);
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthActionLoading("signup");
        const { error } = await signUp(email, password);
        if (error) {
            console.error("Sign Up Error:", error);
            // --- MODIFIED TOAST ---
            toast({ title: "Sign Up Error", description: `Could not create account: ${error.message}`, variant: "destructive" });
        } else {
            toast({ title: "Sign Up Successful", description: "Please check your email to verify your account." });
            setIsSignUpOpen(false);
             // Clear fields after successful sign-up attempt
             setEmail("");
             setPassword("");
        }
        setAuthActionLoading(null);
    };

    // Google Sign In Handler
    const handleGoogleSignIn = async () => {
        setAuthActionLoading("google");
        // Call signInWithProvider from useAuth with 'google'
        const { error } = await signInWithProvider('google');
        if (error) {
            console.error("Google Sign In Error:", error);
            // --- MODIFIED TOAST ---
            toast({ title: "Google Sign In Error", description: `Could not sign in with Google: ${error.message}`, variant: "destructive" });
        } else {
             // Close modals on successful initiation (listener handles actual login)
             setIsSignInOpen(false);
             setIsSignUpOpen(false);
        }
        // Loading state will be reset by the auth listener or if there's an error here
        setAuthActionLoading(null); // Reset loading state here for Google specifically if error occurs
    };


    const closeMobileMenu = () => setIsMenuOpen(false);

    const openSignInModal = () => {
        closeMobileMenu();
        setIsSignUpOpen(false);
        setIsSignInOpen(true);
        setEmail("");
        setPassword("");
    };

    const openSignUpModal = () => {
        closeMobileMenu();
        setIsSignInOpen(false);
        setIsSignUpOpen(true);
        setEmail("");
        setPassword("");
    };

    const isLoading = (action: string) => authActionLoading === action;

    return (
        <>
            <nav className="bg-card shadow-sm sticky top-0 z-50 border-b border-border">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                            <MapPin className="h-6 w-6 text-primary" />
                            <span className="font-bold text-xl">StudySpace 🚀</span>
                        </Link>

                        {/* Desktop Nav Links */}
                        <div className="hidden md:flex items-center gap-6">
                            <Link to="/" className="text-sm text-foreground hover:text-primary transition-colors">Home</Link>
                            <Link to="/spots" className="text-sm text-foreground hover:text-primary transition-colors">Find Spaces</Link>
                            <Link to="/submit" className="text-sm text-foreground hover:text-primary transition-colors">Add a Space</Link>
                        </div>

                        {/* Right Side: Auth + Mobile Toggle */}
                        <div className="flex items-center gap-2">
                            {/* Auth State Display */}
                            {authLoadingGlobal ? (
                                <div className="h-8 w-8 flex items-center justify-center">
                                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                </div>
                            ) : user ? (
                                // User Dropdown (Mini Dashboard)
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                                                    {user.email?.charAt(0).toUpperCase() ?? 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56 bg-popover border-border" align="end" forceMount>
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none text-popover-foreground">My Account</p>
                                                <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-border"/>
                                        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer focus:bg-accent focus:text-accent-foreground" disabled={isLoading("signout")}>
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>{isLoading("signout") ? "Signing Out..." : "Sign Out"}</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                // Sign In/Up Buttons Desktop
                                <div className="hidden md:flex items-center gap-2">
                                    <Button variant="ghost" onClick={openSignInModal} className="text-sm">
                                        <LogIn className="mr-2 h-4 w-4" /> Sign In
                                    </Button>
                                    <Button onClick={openSignUpModal} className="text-sm bg-primary hover:bg-primary/90 text-primary-foreground">
                                        <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                                    </Button>
                                </div>
                            )}

                            {/* Mobile Menu Toggle */}
                            <button
                                className="md:hidden text-foreground p-1 -mr-1"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                aria-label="Toggle mobile menu"
                            >
                                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Content */}
                    {isMenuOpen && (
                        <div className="md:hidden py-4 mt-2 border-t border-border animate-fade-in">
                            <div className="flex flex-col gap-1">
                                <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground" onClick={closeMobileMenu}>Home</Link>
                                <Link to="/spots" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground" onClick={closeMobileMenu}>Find Spaces</Link>
                                <Link to="/submit" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground" onClick={closeMobileMenu}>Add a Space</Link>
                                <div className="pt-4 mt-4 border-t border-border">
                                    {user ? (
                                        <>
                                            <div className="flex items-center px-3 mb-3">
                                                <Avatar className="h-8 w-8 mr-3"><AvatarFallback className="bg-primary text-primary-foreground text-xs">{user.email?.charAt(0).toUpperCase() ?? 'U'}</AvatarFallback></Avatar>
                                                <div>
                                                    <div className="text-base font-medium leading-none text-foreground">Account</div>
                                                    <div className="text-sm font-medium leading-none text-muted-foreground truncate">{user.email}</div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" onClick={() => { handleSignOut(); closeMobileMenu(); }} className="w-full justify-start px-3 py-2 text-base font-medium" disabled={isLoading("signout")}>
                                                <LogOut className="mr-2 h-4 w-4" /> {isLoading("signout") ? "Signing Out..." : "Sign Out"}
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="space-y-2 px-3">
                                            <Button variant="ghost" onClick={openSignInModal} className="w-full justify-start text-base font-medium">
                                                <LogIn className="mr-2 h-4 w-4" /> Sign In
                                            </Button>
                                            <Button onClick={openSignUpModal} className="w-full text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground">
                                                <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

             {/* --------- Modals --------- */}
            <Dialog open={isSignInOpen} onOpenChange={setIsSignInOpen}>
                <DialogContent className="sm:max-w-md bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="text-foreground text-center text-xl font-semibold">Sign In</DialogTitle>
                        <DialogDescription className="text-muted-foreground text-center text-sm">Access your StudySpace account.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 px-4 py-6">
                        {/* --- MODIFIED Google Button --- */}
                        <Button variant="outline" className="w-full border-border hover:bg-secondary group" onClick={handleGoogleSignIn} disabled={isLoading("google")}>
                            {isLoading("google") ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FcGoogle className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />} Continue with Google
                        </Button>
                        <div className="relative my-4"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with email</span></div></div>
                        <form onSubmit={handleSignIn} className="space-y-4">
                            <div><Label htmlFor="signin-email" className="text-foreground sr-only">Email</Label><Input id="signin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email address" className="bg-background"/></div>
                            <div><Label htmlFor="signin-password" className="text-foreground sr-only">Password</Label><Input id="signin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password" className="bg-background"/></div>
                            <Button type="submit" disabled={isLoading("signin") || !email || !password} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">{isLoading("signin") && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Sign In</Button>
                        </form>
                    </div>
                    <DialogFooter className="text-center text-sm text-muted-foreground pt-4 sm:justify-center border-t border-border">Need an account? <Button variant="link" className="p-0 h-auto text-primary font-medium" onClick={openSignUpModal}>Sign Up</Button></DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={isSignUpOpen} onOpenChange={setIsSignUpOpen}>
                 <DialogContent className="sm:max-w-md bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="text-foreground text-center text-xl font-semibold">Create Account</DialogTitle>
                        <DialogDescription className="text-muted-foreground text-center text-sm">Join StudySpace today.</DialogDescription>
                    </DialogHeader>
                     <div className="space-y-4 px-4 py-6">
                         {/* --- MODIFIED Google Button --- */}
                        <Button variant="outline" className="w-full border-border hover:bg-secondary group" onClick={handleGoogleSignIn} disabled={isLoading("google")}>{isLoading("google") ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FcGoogle className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />}Sign up with Google</Button>
                         <div className="relative my-4"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or sign up with email</span></div></div>
                        <form onSubmit={handleSignUp} className="space-y-4">
                            <div><Label htmlFor="signup-email" className="text-foreground sr-only">Email</Label><Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email address" className="bg-background"/></div>
                            <div><Label htmlFor="signup-password" className="text-foreground sr-only">Password</Label><Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Create a password" className="bg-background"/></div>
                            <Button type="submit" disabled={isLoading("signup") || !email || !password} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">{isLoading("signup") && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Account</Button>
                        </form>
                    </div>
                    <DialogFooter className="text-center text-sm text-muted-foreground pt-4 sm:justify-center border-t border-border">Already have an account? <Button variant="link" className="p-0 h-auto text-primary font-medium" onClick={openSignInModal}>Sign In</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Navbar;