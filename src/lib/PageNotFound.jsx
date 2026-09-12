import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';
import AppFooter from '@/components/AppFooter';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';


export default function PageNotFound({}) {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await base44.auth.me();
                return { user, isAuthenticated: true };
            } catch (error) {
                return { user: null, isAuthenticated: false };
            }
        }
    });
    
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-secondary/30">
            <div className="max-w-md w-full text-center">
                <div className="bg-card border border-primary/15 rounded-3xl p-8 shadow-xl shadow-primary/10 space-y-6">
                    <div>
                        <h1 className="text-7xl font-bold text-primary/30">404</h1>
                        <div className="h-1 w-16 rounded-full bg-primary/25 mx-auto mt-3" />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-2xl font-bold text-foreground">Page Not Found</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            The page <span className="font-medium text-foreground">"{pageName}"</span> could not be found in this application.
                        </p>
                    </div>
                    {isFetched && authData.isAuthenticated && authData.user?.role === 'admin' && (
                        <div className="p-4 bg-secondary rounded-2xl border border-primary/10 text-left">
                            <p className="text-sm font-medium text-secondary-foreground">Admin Note</p>
                            <p className="text-sm text-muted-foreground mt-1">This page has not been added to the app.</p>
                        </div>
                    )}
                    <Link to="/" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 font-semibold text-primary-foreground shadow-lg shadow-primary/20">
                        <Home className="w-4 h-4" />
                        Go Home
                    </Link>
                </div>
                <AppFooter />
            </div>
        </div>
    )
}