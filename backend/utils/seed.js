import dotenv from "dotenv";
import dns from "node:dns";

dotenv.config();

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const { default: connectDB } = await import("../config/db.js");
const { default: User } = await import("../models/User.js");
const { default: Course } = await import("../models/Course.js");

const run = async () => {
  await connectDB();
  console.log("Seeding demo data...");

  await Promise.all([User.deleteMany({}), Course.deleteMany({})]);

  const admin = await User.create({
    name: "Admin User",
    email: "admin@campus.edu",
    password: "password123",
    role: "admin",
  });

  const teacher = await User.create({
    name: "Dr. Asha Rai",
    email: "teacher@campus.edu",
    password: "password123",
    role: "teacher",
    employeeId: "T-1001",
    department: "Computer Science",
  });

  const students = await User.insertMany(
    [
      { name: "Rahul Sharma", email: "student1@campus.edu", rollNumber: "CS101", semester: 3 },
      { name: "Priya Thapa", email: "student2@campus.edu", rollNumber: "CS102", semester: 3 },
      { name: "Bikash Gurung", email: "student3@campus.edu", rollNumber: "CS103", semester: 3 },
    ].map((s) => ({
      ...s,
      password: "password123",
      role: "student",
      department: "Computer Science",
    }))
  );

  const course = await Course.create({
    title: "Data Structures & Algorithms",
    code: "CS301",
    description: "Core DSA course covering trees, graphs, and complexity analysis.",
    department: "Computer Science",
    semester: 3,
    credits: 4,
    teacher: teacher._id,
    students: students.map((s) => s._id),
  });

  teacher.teachingCourses = [course._id];
  await teacher.save();

  await Promise.all(
    students.map((s) =>
      User.findByIdAndUpdate(s._id, {
        $addToSet: { enrolledCourses: course._id },
      })
    )
  );

  console.log("Seed complete:");
  console.log("  admin@campus.edu / password123");
  console.log("  teacher@campus.edu / password123");
  console.log("  student1@campus.edu / password123 (also student2, student3)");

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});