import React, { useState, useEffect, type FC } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  User,
  LogIn,
  LogOut,
  Activity,
  Power,
  Settings,
  CircleMinus,
  X,
  ChevronLeft,
  Bell,
  BellOff,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { findStatus, getDuration } from "./util/util";

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
  return date
    .toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, "-");
};

// Format time helper
const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatTimeHHMMSS = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

// Get status color
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "passed":
      return "text-green-500";
    case "failed":
      return "text-red-500";
    case "pending":
      return "text-yellow-500";
    default:
      return "text-gray-500";
  }
};

// Get status icon
const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case "passed":
      return <CheckCircle className="w-4 h-4" />;
    case "failed":
      return <XCircle className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
};

// Get step icon based on message
const getStepIcon = (msg: string) => {
  const lowerMsg = msg.toLowerCase();
  if (lowerMsg.includes("started"))
    return <Activity className="w-4 h-4 text-blue-500" />;
  if (lowerMsg.includes("logged in"))
    return <User className="w-4 h-4 text-indigo-500" />;
  if (lowerMsg.includes("sign in"))
    return <LogIn className="w-4 h-4 text-green-500" />;
  if (lowerMsg.includes("sign out"))
    return <LogOut className="w-4 h-4 text-orange-500" />;
  if (lowerMsg.includes("logging out"))
    return <Power className="w-4 h-4 text-gray-500" />;
  if (lowerMsg.includes("successful"))
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  if (lowerMsg.includes("finished") || lowerMsg.includes("finshed"))
    return <CheckCircle className="w-4 h-4 text-blue-500" />;
  return <ChevronRight className="w-4 h-4 text-gray-400" />;
};

// Modal Component
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  records: (AttendanceRecord | undefined)[];
}> = ({ isOpen, onClose, records }) => {
  if (!isOpen || records.length === 0) return null;

  const [signIn, singOut] = records;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <div className="flex justify-between items-start">
            <div className="basis-[95%]">
              <h2 className="text-xl font-semibold text-white mb-2 text-left">
                Automation details
              </h2>
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
          <Tabs defaultValue="signIn">
            <TabsList className="w-[220px]">
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
    return <>No data</>;
  }
  return (
    <>
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
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg"
            >
              <div className="mt-0.5">{getStepIcon(entry.msg)}</div>
              <div className="flex-1">
                <p className="text-white text-sm">{entry.msg}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {formatTimeHHMMSS(entry.at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// Today's Status Card
const TodayCard: React.FC<{
  signIn?: AttendanceRecord;
  signOut?: AttendanceRecord;
  isToday?: boolean;
}> = ({ signIn, signOut, isToday = true }) => {
  const today = new Date()
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, "/");

  return (
    <div
      className={
        isToday
          ? "bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6"
          : "mt-6"
      }
    >
      {isToday && (
        <h2 className="text-lg font-semibold text-white mb-8">Today {today}</h2>
      )}
      <div className="flex gap-4 items-center justify-between">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
            signIn
              ? "bg-green-900/20 border-green-800"
              : "bg-gray-800 border-gray-700"
          }`}
        >
          {signIn ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <Clock className="w-5 h-5 text-gray-500" />
          )}
          <div>
            <p className="text-sm text-gray-400">Signed in</p>
            <p className="text-white font-medium">
              {signIn ? formatTime(signIn.at) : "--:--"}
            </p>
          </div>
        </div>

        <div className="text-gray-600 border-dashed border w-[5%] border-gray-500"></div>

        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
            signOut
              ? "bg-green-900/20 border-green-800"
              : "bg-gray-800 border-gray-700"
          }`}
        >
          <div>
            <p className="text-sm text-gray-400">
              {signOut ? "Signed out" : "Scheduled"}
            </p>
            <p className="text-white font-medium">
              {signOut ? formatTime(signOut.at) : "18:45pm"}
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
  const [groupedData, setGroupedData] = useState<{
    [key: string]: AttendanceRecord[];
  }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<
    (AttendanceRecord | undefined)[]
  >([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://api.rider.rahulnjs.com/greyt/data");
      if (!response.ok) throw new Error("Failed to fetch data");
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
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getSignInOutDataForDate = (date: string) => {
    const signIn = data.find((r) => r.date === date && r.seq === "Sign In");
    const signOut = data.find((r) => r.date === date && r.seq === "Sign Out");
    return [signIn, signOut];
  };

  const handleRowClick = (date: string) => {
    setSelectedRecord(getSignInOutDataForDate(date));
    setModalOpen(true);
  };

  // Get today's date in the format used by the API
  const today = new Date().toISOString().split("T")[0];
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
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const openSettings = () => {
    setShowSettings(true);
  };

  return (
    <div className="min-h-screen bg-[#151b25] p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6 text-left root-font flex justify-between items-center mr-1">
          <span>greyt.io</span>
          <button onClick={openSettings}>
            <Settings className="text-stone-400" />
          </button>
        </h1>

        {(todaySignIn || todaySignOut) && (
          <TodayCard signIn={todaySignIn} signOut={todaySignOut} />
        )}

        {showSettings && (
          <SettingsModal onClose={() => setShowSettings(false)} />
        )}

        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-4 text-gray-400 font-medium">
                    Date
                  </th>
                  <th className="text-left p-4 text-gray-400 font-medium">
                    Sign in
                  </th>
                  <th className="text-left p-4 text-gray-400 font-medium">
                    Sign out
                  </th>
                  <th className="text-left p-4 text-gray-400 font-medium">
                    Duration
                  </th>
                  <th className="text-left p-4 text-gray-400 font-medium">
                    Status
                  </th>
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
                    const signInRecord = records.find(
                      (r) => r.seq === "Sign In"
                    );
                    const signOutRecord = records.find(
                      (r) => r.seq === "Sign Out"
                    );

                    const all_status = [
                      signInRecord?.status,
                      signOutRecord?.status,
                    ];
                    const all_duration = [
                      signInRecord?.duration,
                      signOutRecord?.duration,
                    ];
                    const hw = records.find((r) =>
                      r.log.find((s) => s.msg.indexOf("Skip") === 0)
                    );
                    const hwMsg = hw?.log.find(
                      (s) => s.msg.indexOf("Skip") === 0
                    );

                    let hwMsgText = "";
                    if (hwMsg) {
                      hwMsgText = hwMsg.msg.split(" ")[4];
                    }

                    const meta = {
                      date: String(
                        signInRecord?.date ??
                          signOutRecord?.date ??
                          records[0].date
                      ),
                      status: findStatus(all_status),
                      duration: getDuration(all_duration),
                      isHoliday: hw !== undefined,
                    };

                    return (
                      <tr
                        key={`${meta.date}-record`}
                        className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors"
                        onClick={() =>
                          !meta.isHoliday && handleRowClick(meta.date)
                        }
                      >
                        <td
                          className={`p-4 text-white text-left ${
                            meta.isHoliday ? "bg-[#0c1424]" : ""
                          }`}
                        >
                          {formatDate(meta.date)}
                        </td>
                        {!meta.isHoliday && (
                          <>
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
                            <td
                              className={`p-4 ${getStatusColor(
                                meta.status
                              )} text-left`}
                            >
                              <span className="flex items-center gap-1">
                                {getStatusIcon(meta.status)}
                                {meta.status || "-"}
                              </span>
                            </td>
                          </>
                        )}
                        {meta.isHoliday && (
                          <td
                            className="p-4 text-center text-[#3F51B5] bg-[#0c1424]"
                            colSpan={4}
                          >
                            {" "}
                            <div className="flex gap-2 capitalize">
                              <CircleMinus className="w-[21px]" /> {hwMsgText}
                            </div>
                          </td>
                        )}
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

interface SettingsData {
  logInTime: string;
  logInPeriod: "AM" | "PM";
  logOutTime: string;
  logOutPeriod: "AM" | "PM";
  notify: boolean;
  selectedDays: number[];
}

const SettingsModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const [settings, setSettings] = useState<SettingsData>({
    logInTime: "11:00",
    logInPeriod: "AM",
    logOutTime: "18:00",
    logOutPeriod: "PM",
    notify: true,
    selectedDays: [],
  });
  const date = new Date();
  const [selectedMonth, setSelectedMonth] = useState(date.getMonth()); // October (0-indexed)
  const [currentMonth] = useState(date.getMonth());
  const [currentYear] = useState(date.getFullYear());

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleTimeChange = (
    field: "logInTime" | "logOutTime",
    value: string
  ) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handlePeriodToggle = (field: "logInPeriod" | "logOutPeriod") => {
    setSettings((prev) => ({
      ...prev,
      [field]: prev[field] === "AM" ? "PM" : "AM",
    }));
  };

  const handleNotifyToggle = () => {
    setSettings((prev) => ({ ...prev, notify: !prev.notify }));
  };

  const handleDayClick = (day: number) => {
    setSettings((prev) => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter((d) => d !== day)
        : [...prev.selectedDays, day],
    }));
  };

  const handleMonthChange = (direction: "prev" | "next") => {
    if (direction === "prev" && selectedMonth > 0) {
      setSelectedMonth(selectedMonth - 1);
    } else if (direction === "next" && selectedMonth < 11) {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, currentYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, currentYear);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = settings.selectedDays.includes(day);
      let isPastDate = currentMonth > selectedMonth;
      if (currentMonth === selectedMonth) {
        isPastDate = day < date.getDay() - 1;
      }

      days.push(
        <button
          key={day}
          onClick={() => !isPastDate && handleDayClick(day)}
          className={`p-2 rounded-lg transition-all ${
            isPastDate
              ? `text-gray-500 ${isSelected ? "bg-gray-800" : ""}`
              : `${
                  isSelected
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "text-gray-300 hover:bg-gray-800"
                }`
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white">Settings</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Log in time */}
          <div className="flex items-center justify-between">
            <label className="text-gray-300 font-medium">Log in</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={settings.logInTime}
                onChange={(e) => handleTimeChange("logInTime", e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg w-24 text-center focus:outline-none focus:border-blue-500 transition-colors"
              />
              <div className="flex bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => handlePeriodToggle("logInPeriod")}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    settings.logInPeriod === "AM"
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  AM
                </button>
                <button
                  onClick={() => handlePeriodToggle("logInPeriod")}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    settings.logInPeriod === "PM"
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  PM
                </button>
              </div>
            </div>
          </div>

          {/* Log out time */}
          <div className="flex items-center justify-between">
            <label className="text-gray-300 font-medium">Log out</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={settings.logOutTime}
                onChange={(e) => handleTimeChange("logOutTime", e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg w-24 text-center focus:outline-none focus:border-blue-500 transition-colors"
              />
              <div className="flex bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => handlePeriodToggle("logOutPeriod")}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    settings.logOutPeriod === "AM"
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  AM
                </button>
                <button
                  onClick={() => handlePeriodToggle("logOutPeriod")}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    settings.logOutPeriod === "PM"
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  PM
                </button>
              </div>
            </div>
          </div>

          {/* Notify toggle */}
          <div className="flex items-center justify-between">
            <label className="text-gray-300 font-medium flex items-center gap-2">
              Notify
              <div className="mt-1">
                {settings.notify ? (
                  <Bell className="w-6 h-4 text-blue-400" />
                ) : (
                  <BellOff className="w-6 h-4 text-gray-500" />
                )}
              </div>
            </label>
            <button
              onClick={handleNotifyToggle}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                settings.notify ? "bg-blue-600" : "bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  settings.notify ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Calendar */}
          <div className="pt-4 border-t border-gray-700">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => handleMonthChange("prev")}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={selectedMonth === 0}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h4 className="text-white font-bold text-lg">
                {months[selectedMonth]}
              </h4>
              <button
                onClick={() => handleMonthChange("next")}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={selectedMonth === 11}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Day headers */}
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <div
                  key={index}
                  className="text-gray-500 text-xs font-medium p-2"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {renderCalendar()}
            </div>

            {/* Helper text */}
            <p className="text-gray-500 text-sm text-center mt-4">
              Select days to skip login
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
