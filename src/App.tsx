import React, { useState, useEffect } from 'react';
import { GroupId, UserSession, ClassData } from './types';
import { CASES_DATA, DEFAULT_CLASSES } from './data/cases';
import {
  loadClassData,
  saveClassData,
  subscribeToClassUpdates,
  generateComprehensiveReport,
  downloadCsvReport,
  populateDemoDataForClass,
  getInitialClassData
} from './utils/storage';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { TeamRoomView } from './components/TeamRoomView';
import { GMRoomView } from './components/GMRoomView';
import { TheoryModal } from './components/TheoryModal';
import { OfficialReportModal } from './components/OfficialReportModal';
import { ChatbotWidget } from './components/ChatbotWidget';
import { sound } from './utils/audio';

const USER_SESSION_KEY = 'agency_wars_current_user_v10';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem(USER_SESSION_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return null;
  });

  const [activeClass, setActiveClass] = useState<string>(() => {
    return currentUser?.kelas || DEFAULT_CLASSES[0];
  });

  const [classData, setClassData] = useState<ClassData>(() => {
    return loadClassData(activeClass);
  });

  const [isTheoryOpen, setIsTheoryOpen] = useState(false);
  const [isOfficialReportOpen, setIsOfficialReportOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isCloudConnected, setIsCloudConnected] = useState(true);

  // Sync state when activeClass changes
  useEffect(() => {
    const data = loadClassData(activeClass);
    setClassData(data);

    const unsubscribe = subscribeToClassUpdates(
      activeClass,
      (updated) => {
        setClassData(updated);
      },
      (connected) => {
        setIsCloudConnected(connected);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [activeClass]);

  // Keep sound manager in sync
  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  // 1-second interval ticker for live timer countdown rendering
  useEffect(() => {
    const interval = setInterval(() => {
      if (classData.timerRunning && classData.absoluteStartTime) {
        // Re-read or trigger a render tick
        setClassData((prev) => ({ ...prev }));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [classData.timerRunning, classData.absoluteStartTime]);

  const handleStudentLogin = (kelas: string, group: GroupId, name: string, pin: string) => {
    setActiveClass(kelas);
    const session: UserSession = {
      role: 'student',
      kelas,
      group,
      name
    };
    setCurrentUser(session);
    try {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
    } catch {
      // Ignore
    }

    // Save student profile in class data
    const current = loadClassData(kelas);
    const cleanKey = `${name.toLowerCase().replace(/\s+/g, '_')}_${group}`;
    const updated: ClassData = {
      ...current,
      studentProfiles: {
        ...(current.studentProfiles || {}),
        [cleanKey]: {
          name,
          pin,
          group,
          registeredAt: new Date().toLocaleTimeString('id-ID')
        }
      }
    };
    saveClassData(kelas, updated);
    setClassData(updated);
  };

  const handleGmQuickLogin = (kelas: string) => {
    setActiveClass(kelas);
    const session: UserSession = {
      role: 'gm',
      kelas,
      name: 'Game Master (Dosen)'
    };
    setCurrentUser(session);
    try {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
    } catch {
      // Ignore
    }
  };

  const handleGmLoginSuccess = () => {
    const session: UserSession = {
      role: 'gm',
      kelas: activeClass,
      name: 'Game Master (Dosen)'
    };
    setCurrentUser(session);
    try {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
    } catch {
      // Ignore
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(USER_SESSION_KEY);
    } catch {
      // Ignore
    }
  };

  const handleSwitchRole = (role: 'student' | 'gm', group?: GroupId, name?: string) => {
    const session: UserSession = {
      role,
      kelas: activeClass,
      group,
      name: name || (role === 'gm' ? 'Game Master (Dosen)' : `Perwakilan ${group}`)
    };
    setCurrentUser(session);
    try {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
    } catch {
      // Ignore
    }
  };

  const handleDownloadReport = () => {
    const reportText = generateComprehensiveReport(activeClass, classData);
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Analisis_${activeClass.replace(/\s+/g, '_')}_Kasus_${classData.activeCase}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    downloadCsvReport(activeClass, classData);
  };

  const handleLoadDemoSimulation = (kelas: string) => {
    setActiveClass(kelas);
    const populated = populateDemoDataForClass(kelas);
    setClassData(populated);
    // Log in as G5 to view submitted demo immediately
    handleStudentLogin(kelas, 'G5', 'Ahmad Fauzi', '112233');
  };

  const activeCaseInfo = CASES_DATA[classData.activeCase] || CASES_DATA['1'];

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      {/* App Header */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenTheory={() => setIsTheoryOpen(true)}
        onSwitchRole={handleSwitchRole}
        onGmLoginSuccess={handleGmLoginSuccess}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        isCloudConnected={isCloudConnected}
      />

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {!currentUser ? (
          <LoginView
            onStudentLogin={handleStudentLogin}
            onGmQuickLogin={handleGmQuickLogin}
            onLoadDemoSimulation={handleLoadDemoSimulation}
          />
        ) : currentUser.role === 'student' ? (
          <TeamRoomView
            currentUser={currentUser}
            classData={classData}
            activeCase={activeCaseInfo}
            onUpdateClassData={setClassData}
            onDownloadReport={handleDownloadReport}
            onOpenOfficialReport={() => setIsOfficialReportOpen(true)}
            onDownloadCsv={handleDownloadCsv}
          />
        ) : (
          <GMRoomView
            currentClass={activeClass}
            classData={classData}
            activeCase={activeCaseInfo}
            onChangeClass={(newClass) => {
              setActiveClass(newClass);
              if (currentUser) {
                const updatedSession = { ...currentUser, kelas: newClass };
                setCurrentUser(updatedSession);
                localStorage.setItem(USER_SESSION_KEY, JSON.stringify(updatedSession));
              }
            }}
            onUpdateClassData={setClassData}
            onDownloadReport={handleDownloadReport}
            onOpenOfficialReport={() => setIsOfficialReportOpen(true)}
            onDownloadCsv={handleDownloadCsv}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 space-y-1">
          <p>
            AGENCY WARS — The Behaviour Accounting Simulation &bull;{' '}
            <a
              href="https://sukmassp.blogspot.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 hover:underline font-semibold transition"
            >
              Developed by Sukma Lesmana,Ph.D
            </a>
          </p>
          <p className="text-[11px] text-slate-600">
            Mendukung sinkronisasi real-time multi-jendela / multi-tab tanpa jeda
          </p>
        </div>
      </footer>

      {/* Theory Concepts Reference Modal */}
      <TheoryModal isOpen={isTheoryOpen} onClose={() => setIsTheoryOpen(false)} />

      {/* Official Academic Report & Printable PDF/Excel Modal */}
      <OfficialReportModal
        isOpen={isOfficialReportOpen}
        onClose={() => setIsOfficialReportOpen(false)}
        kelas={activeClass}
        classData={classData}
        activeCase={activeCaseInfo}
        onDownloadTxt={handleDownloadReport}
      />

      {/* Floating Bottom-Left Gemini Chatbot for Behavioral Accounting */}
      <ChatbotWidget />
    </div>
  );
}
