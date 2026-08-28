import Timetable from "../models/Timetable.js";

export const getTimetable = async (req, res, next) => {
  try {
    const { department, semester } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (semester) filter.semester = Number(semester);
    const timetables = await Timetable.find(filter).populate({
      path: "slots.course",
      select: "title code teacher",
      populate: { path: "teacher", select: "name" },
    });
    res.json({ timetables });
  } catch (err) {
    next(err);
  }
};


export const upsertTimetable = async (req, res, next) => {
  try {
    const { department, semester, slots } = req.body;
    const timetable = await Timetable.findOneAndUpdate(
      { department, semester },
      { department, semester, slots },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ timetable });
  } catch (err) {
    next(err);
  }
};

export const deleteTimetable = async (req, res, next) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
};
