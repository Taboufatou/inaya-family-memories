
import React, { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import PhotosSection from '@/components/PhotosSection';
import ConsultationsSection from '@/components/ConsultationsSection';
import JournalSection from '@/components/JournalSection';
import Footer from '@/components/Footer';

type UserType = 'papa' | 'maman' | 'admin';
type ActiveSection = 'dashboard' | 'photos' | 'consultations' | 'journal' | 'events';

const Index = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');

  const handleLogin = (userType: UserType) => {
    setUser(userType);
    setActiveSection('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setActiveSection('dashboard');
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section as ActiveSection);
  };

  // If not logged in, show login form
  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard userType={user} />;
      case 'photos':
        return <PhotosSection />;
      case 'consultations':
        return <ConsultationsSection />;
      case 'journal':
        return <JournalSection userType={user} />;
      case 'events':
        return (
          <div className="p-6 text-center">
            <h1 className="text-3xl font-heading font-bold text-foreground mb-4">
              🎂 Événements
            </h1>
            <p className="text-muted-foreground">
              Section en cours de développement
            </p>
          </div>
        );
      default:
        return <Dashboard userType={user} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Navigation 
        activeSection={activeSection}
        setActiveSection={handleSectionChange}
        userType={user}
        onLogout={handleLogout}
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

export default Index;
