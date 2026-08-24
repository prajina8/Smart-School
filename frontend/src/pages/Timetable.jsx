import { useEffect, useState } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { CalendarDays } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Timetable = () => {
  const { user } = useAuth();
  const [department, setDepartment] = useState(user?.department || "");
  const [semester, setSemester] = useState(user?.semester || "");
  const [timetable, setTimetable] = useState(null);

  const load = async () => {
    const params = new URLSearchParams();
    if (department) params.set("department", department);
    if (semester) params.set("semester", semester);
    const { data } = await api.get(`/timetable?${params.toString()}`);
    setTimetable(data.timetables[0] || null);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const slotsByDay = (day) =>
    (timetable?.slots || [])
      .filter((s) => s.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Class timetable</h1>
        <p className="text-slate-500 text-sm">Weekly schedule by department and semester</p>
      </div>

      <div className="flex gap-3 flex-wrap items-end">
        <div>
          <label className="label">Department</label>
          <input className="input" value={department} onChange={(e) => setDepartment(e.target.value)} />
        </div>
        <div>
          <label className="label">Semester</label>
          <input type="number" className="input w-28" value={semester} onChange={(e) => setSemester(e.target.value)} />
        </div>
        <button className="btn-secondary" onClick={load}>
          Load
        </button>
      </div>

      {!timetable ? (
        <div className="card p-10 text-center text-slate-400">
          <CalendarDays className="mx-auto mb-2" size={28} />
          No timetable published yet for this department/semester.
        </div>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
          {DAYS.map((day) => (
            <div key={day} className="card p-3">
              <p className="font-semibold text-slate-700 text-sm mb-2">{day}</p>
              <div className="space-y-2">
                {slotsByDay(day).length === 0 && <p className="text-xs text-slate-300">—</p>}
                {slotsByDay(day).map((s) => (
                  <div key={s._id} className="rounded-lg bg-brand-50 p-2">
                    <p className="text-xs font-medium text-brand-700">
                      {s.startTime}–{s.endTime}
                    </p>
                    <p className="text-xs text-slate-600">{s.course?.title}</p>
                    <p className="text-[11px] text-slate-400">{s.room}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Timetable;
