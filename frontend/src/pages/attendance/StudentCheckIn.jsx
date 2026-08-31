import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { CalendarCheck2 } from "lucide-react";

const statusStyle = {
  present: "bg-green-50 text-green-700",
  late: "bg-amber-50 text-amber-700",
  absent: "bg-red-50 text-red-700",
};

const StudentCheckIn = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    api.get("/attendance").then(({ data }) => setRecords(data.records));
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-espresso">Your attendance</h1>
        <p className="text-sage text-sm">Marked by your teacher for each class</p>
      </div>

      <div className="card p-5">
        {records.length === 0 ? (
          <div className="text-center py-10 text-sage">
            <CalendarCheck2 className="mx-auto mb-2" size={28} />
            No attendance records yet.
          </div>
        ) : (
          <div className="divide-y divide-sage/20">
            {records.map((r) => (
              <div key={r._id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-espresso">{r.course?.title}</p>
                  <p className="text-xs text-sage">{new Date(r.markedAt).toLocaleDateString()}</p>
                </div>
                <span className={`badge capitalize ${statusStyle[r.status]}`}>{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCheckIn;