import React, { useState, useEffect, type FC } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, ChevronRight, User, LogIn, LogOut, Activity, Power } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { findStatus, getDuration } from './util/util';

// Type definitions
interface LogEntry {
  at: string;
  msg: string;
}

interface AttendanceRecord {
  _id: { $oid: string } | string;
  user: string;
  date: string;
  seq: "Sign In" | "Sign Out";
  log: LogEntry[];
  status: string;
  duration: number;
  error: string | null;
  at: string;
}

// Format date helper
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '-');
};

// Format time helper
const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const formatTimeHHMMSS = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

// Get status color
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'passed':
      return 'text-green-500';
    case 'failed':
      return 'text-red-500';
    case 'pending':
      return 'text-yellow-500';
    default:
      return 'text-gray-500';
  }
};

// Get status icon
const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'passed':
      return <CheckCircle className="w-4 h-4" />;
    case 'failed':
      return <XCircle className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
};

// Get step icon based on message
const getStepIcon = (msg: string) => {
  const lowerMsg = msg.toLowerCase();
  if (lowerMsg.includes('started')) return <Activity className="w-4 h-4 text-blue-500" />;
  if (lowerMsg.includes('logged in')) return <User className="w-4 h-4 text-indigo-500" />;
  if (lowerMsg.includes('sign in')) return <LogIn className="w-4 h-4 text-green-500" />;
  if (lowerMsg.includes('sign out')) return <LogOut className="w-4 h-4 text-orange-500" />;
  if (lowerMsg.includes('logging out')) return <Power className="w-4 h-4 text-gray-500" />;
  if (lowerMsg.includes('successful')) return <CheckCircle className="w-4 h-4 text-green-500" />;
  if (lowerMsg.includes('finished') || lowerMsg.includes('finshed')) return <CheckCircle className="w-4 h-4 text-blue-500" />;
  return <ChevronRight className="w-4 h-4 text-gray-400" />;
};

// Modal Component
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; records: (AttendanceRecord | undefined)[] }> = ({
  isOpen,
  onClose,
  records
}) => {
  if (!isOpen || records.length === 0) return null;

  const [signIn, singOut] = records;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <div className="flex justify-between items-start">
            <div className="basis-[95%]">
              <h2 className="text-xl font-semibold text-white mb-2 text-left">Attendance Details</h2>
              <div className="flex gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {signIn ? formatDate(signIn.date) : ""}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {signIn ? formatTime(signIn.at) : ""}
                </span>
              </div>

              <TodayCard signIn={signIn} signOut={singOut} isToday={false} />
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <Tabs defaultValue="signIn" >
            <TabsList className='w-[300px]'>
              <TabsTrigger value="signIn">Sign In</TabsTrigger>
              <TabsTrigger value="signOut">Sign Out</TabsTrigger>
            </TabsList>
            <TabsContent value="signIn">
              <Logger record={signIn} />
            </TabsContent>
            <TabsContent value="signOut">
              <Logger record={singOut} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

const Logger: FC<{ record?: AttendanceRecord }> = ({ record }) => {
  if (!record) {
    return <>No data</>
  }
  return (<>
    {record.error && (
      <Alert className="bg-red-900/20 border-red-900">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-red-400">
          {record.error}
        </AlertDescription>
      </Alert>
    )}

    <div>
      <div className="space-y-2 max-h-[41vh] overflow-y-auto mt-4">
        {record.log.map((entry, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
            <div className="mt-0.5">{getStepIcon(entry.msg)}</div>
            <div className="flex-1">
              <p className="text-white text-sm">{entry.msg}</p>
              <p className="text-gray-500 text-xs mt-1">{formatTimeHHMMSS(entry.at)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>)
}

// Today's Status Card
const TodayCard: React.FC<{ signIn?: AttendanceRecord; signOut?: AttendanceRecord, isToday?: boolean }> = ({ signIn, signOut, isToday = true }) => {
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '/');

  return (
    <div className={isToday ? "bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6" : "mt-6"}>
      {isToday && <h2 className="text-lg font-semibold text-white mb-8">Today {today}</h2>}
      <div className="flex gap-4 items-center justify-between">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${signIn ? 'bg-green-900/20 border-green-800' : 'bg-gray-800 border-gray-700'
          }`}>
          {signIn ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <Clock className="w-5 h-5 text-gray-500" />
          )}
          <div>
            <p className="text-sm text-gray-400">Signed in</p>
            <p className="text-white font-medium">
              {signIn ? formatTime(signIn.at) : '--:--'}
            </p>
          </div>
        </div>

        <div className="text-gray-600 border-dashed border w-[5%] border-gray-500"></div>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${signOut ? 'bg-green-900/20 border-green-800' : 'bg-gray-800 border-gray-700'
          }`}>
          <div>
            <p className="text-sm text-gray-400">{signOut ? 'Signed out' : 'Scheduled'}</p>
            <p className="text-white font-medium">
              {signOut ? formatTime(signOut.at) : '18:45pm'}
            </p>
          </div>
          {signOut ? (
            <CheckCircle className="w-5 h-5 text-orange-500" />
          ) : (
            <Clock className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function AttendanceTracker() {
  const [data, setData] = React.useState<AttendanceRecord[]>([]);
  const [groupedData, setGroupedData] = useState<{ [key: string]: AttendanceRecord[] }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<(AttendanceRecord | undefined)[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.rider.rahulnjs.com/greyt/data');
      if (!response.ok) throw new Error('Failed to fetch data');
      const result: AttendanceRecord[] = await response.json();
      const _d: { [key: string]: AttendanceRecord[] } = {};
      for (let i = result.length - 1; i >= 0; i--) {
        const r = result[i];
        if (!_d[r.date]) {
          _d[r.date] = [];
        }
        _d[r.date].push(r);
      }
      setData(result);
      setGroupedData(_d);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getSignInOutDataForDate = (date: string) => {
    const signIn = data.find(r => r.date === date && r.seq === "Sign In");
    const signOut = data.find(r => r.date === date && r.seq === "Sign Out");
    return [signIn, signOut];
  }

  const handleRowClick = (date: string) => {
    setSelectedRecord(getSignInOutDataForDate(date));
    setModalOpen(true);
  };


  // Get today's date in the format used by the API
  const today = new Date().toISOString().split('T')[0];
  const [todaySignIn, todaySignOut] = getSignInOutDataForDate(today);

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black p-4 flex items-center justify-center">
        <Alert className="max-w-md bg-red-900/20 border-red-900">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-400">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#151b25] p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Attendance Tracker</h1>

        {(todaySignIn || todaySignOut) && (
          <TodayCard signIn={todaySignIn} signOut={todaySignOut} />
        )}

        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Sign in</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Sign out</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Duration</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 || !groupedData ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-gray-500">
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  Object.values(groupedData).map((records) => {

                    const signInRecord = records.find(r => r.seq === "Sign In");
                    const signOutRecord = records.find(r => r.seq === "Sign Out");

                    const all_status = [signInRecord?.status, signOutRecord?.status];
                    const all_duration = [signInRecord?.duration, signOutRecord?.duration];

                    const meta = {
                      date: String(signInRecord?.date ?? signOutRecord?.date),
                      status: findStatus(all_status),
                      duration: getDuration(all_duration)
                    }

                    return (
                      <tr
                        key={`${meta.date}-record`}
                        className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors"
                        onClick={() => handleRowClick(meta.date)}
                      >
                        <td className="p-4 text-white text-left">{formatDate(meta.date)}</td>
                        <td className="p-4 text-left">
                          {signInRecord ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="p-4 text-left">
                          {signOutRecord ? (
                            <CheckCircle className="w-5 h-5 text-orange-500" />
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="p-4 text-white text-left">
                          {meta.duration}
                        </td>
                        <td className={`p-4 ${getStatusColor(meta.status)} text-left`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(meta.status)}
                            {meta.status || '-'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          records={selectedRecord}
        />
      </div>
    </div>
  );
}