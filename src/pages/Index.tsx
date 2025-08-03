import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/LoginForm';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import PhotosSection from '@/components/PhotosSection';
import VideosSection from '@/components/VideosSection';
import ConsultationsSection from '@/components/ConsultationsSection';
import JournalSection from '@/components/JournalSection';
import EventsSection from '@/components/EventsSection';
import Footer from '@/components/Footer';

type UserType = 'papa' | 'maman' | 'admin';
type ActiveSection = 'dashboard' | 'photos' | 'videos' | 'consultations' | 'journal' | 'events';

const AppContent = () => {
  const { user, token, logout, loading } = useAuth();
  const [activeSection, setActiveSection] = useState<ActiveSection>(() => {
    // Récupérer la section depuis l'URL ou localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const urlSection = urlParams.get('section') as ActiveSection;
    const savedSection = localStorage.getItem('activeSection') as ActiveSection;
    return urlSection || savedSection || 'dashboard';
  });

  const handleSectionChange = (section: string) => {
    const newSection = section as ActiveSection;
    setActiveSection(newSection);
    
    // Sauvegarder dans localStorage et mettre à jour l'URL
    localStorage.setItem('activeSection', newSection);
    const url = new URL(window.location.href);
    url.searchParams.set('section', newSection);
    window.history.replaceState({}, '', url.toString());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // If not logged in, show login form
  if (!user || !token) {
    return <LoginForm />;
  }

  const renderActiveSection = () => {
    const sectionProps = { userType: user.type, token, userId: user.id };
    
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard userType={user.type} onSectionChange={handleSectionChange} />;
      case 'photos':
        return <PhotosSection {...sectionProps} />;
      case 'videos':
        return <VideosSection {...sectionProps} />;
      case 'consultations':
        return <ConsultationsSection {...sectionProps} />;
      case 'journal':
        return <JournalSection {...sectionProps} />;
      case 'events':
        return <EventsSection {...sectionProps} />;
      default:
        return <Dashboard userType={user.type} onSectionChange={handleSectionChange} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Navigation 
        activeSection={activeSection}
        setActiveSection={handleSectionChange}
        userType={user.type}
        onLogout={logout}
        token={token}
      />
      
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-auto">
          {renderActiveSection()}
        </main>
        <Footer />
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
