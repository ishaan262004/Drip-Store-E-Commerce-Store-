import { SignIn } from '@clerk/clerk-react';

export default function Login() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative">
            {/* Background elements */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/15 rounded-full blur-[120px]" />

            <div className="relative z-10">
                <SignIn
                    path="/login"
                    routing="path"
                    signUpUrl="/register"
                    fallbackRedirectUrl="/"
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "bg-surface-card border border-border shadow-2xl shadow-purple-900/10",
                            headerTitle: "text-text-primary",
                            headerSubtitle: "text-text-secondary",
                            socialButtonsBlockButton: "text-text-primary hover:bg-surface-light border-border",
                            formFieldLabel: "text-text-secondary",
                            formFieldInput: "bg-surface-light border-border text-text-primary",
                            footerActionLink: "text-primary hover:text-primary-light"
                        }
                    }}
                />
            </div>
        </div>
    );
}
