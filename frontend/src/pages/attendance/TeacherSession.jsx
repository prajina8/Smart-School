import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios.js";
import { ClipboardCheck } from "lucide-react";
import toast from "react-hot-toast";



const TeacherSession = () => {

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/courses").then(({ data }) => {
      setCourses(data.courses);
      if (data.courses[0]) setSelectedCourse(data.courses[0]._id);
    });
  },
   []);

  useEffect(() => {
    if (!selectedCourse) return;
    api.get(`/courses/${selectedCourse}`).then(({ data }) => {
      const list = data.course.students || [];
      setStudents(list);
      const initial = {};
      list.forEach((s) => (initial[s._id] = "present"));
      setStatuses(initial);
    });
  }, [selectedCourse]);

const setStatus = (studentId, status) => {
  setStatuses((prev) => {
    const updated = {
      ...prev,
      [studentId]: status,
    };

    console.log("Updated attendance:", updated);

    return updated;
  });
};

 const submit = async () => {
  if (!selectedCourse || students.length === 0) {
    toast.error("Please select a course with students");
    return;
  }

  setSaving(true);

  try {
    const records = students.map((s) => ({
      studentId: s._id,
      status: statuses[s._id] || "absent",
    }));

    console.log("Sending attendance:", {
      courseId: selectedCourse,
      records,
      date,
    });

    const response = await api.post("/attendance/take", {
      courseId: selectedCourse,
      records,
      date,
    });

    console.log("Attendance response:", response.data);

    toast.success("Attendance saved");
  } catch (err) {
    console.error("Attendance error:", err);
    console.error("Server response:", err.response?.data);

    toast.error(
      err.response?.data?.message || "Failed to save attendance"
    );
  } finally {
    setSaving(false);
  }
};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-espresso">Take attendance</h1>
        <p className="text-sage text-sm">Mark each student present, late, or absent for this class</p>
      </div>

      <div className="card p-5 space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="label">Course</label>
            <select className="input" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>{c.title} ({c.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        {students.length === 0 ? (
          <p className="text-sm text-sage">No students enrolled in this course yet.</p>
        ) : (
          <div className="divide-y divide-sage/20">
            {students.map((s) => (
              <div key={s._id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-espresso">{s.name}</p>
                  <p className="text-xs text-sage">{s.rollNumber}</p>
                </div>
                <div className="flex gap-1.5">
                  {["present", "late", "absent"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setStatus(s._id, opt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border ${
                        statuses[s._id] === opt
                          ? opt === "present"
                            ? "bg-green-600 text-white border-green-600"
                            : opt === "late"
                            ? "bg-amber-500 text-white border-amber-500"
                            : "bg-red-500 text-white border-red-500"
                          : "border-sage/40 text-sage"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <button onClick={submit} disabled={saving || students.length === 0} className="btn-primary">
          <ClipboardCheck size={16} /> {saving ? "Saving..." : "Save attendance"}
        </button>
      </div>
    </div>
  );
};

export default TeacherSession;