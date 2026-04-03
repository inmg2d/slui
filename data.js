window.SLUI_DATA = {
  institution: {
    name: 'Saint Lawrence University Institute Ndop',
    acronym: 'SLUI',
    campus: 'Ndop, Cameroon',
    registrar: 'Office of the Registrar',
    bursar: 'Bursary Department',
    slogan: 'Knowledge, Character, Service',
    idPrefix: 'SLU',
    idYearDigits: 2
  },
  media: {
    logoDataUrl: '',
    adminBackgroundDataUrl: '',
    staffBackgroundDataUrl: '',
    studentBackgroundDataUrl: '',
    registrarBackgroundDataUrl: '',
    idTemplateDataUrl: ''
  },
  faculties: [
    { id: 'FAC-001', code: 'FST', name: 'Faculty of Science and Technology', dean: 'Dr. Judith Nfor' },
    { id: 'FAC-002', code: 'FMS', name: 'Faculty of Management Sciences', dean: 'Dr. Muna Rose' },
    { id: 'FAC-003', code: 'FHS', name: 'Faculty of Health Sciences', dean: 'Dr. Tambe Felix' }
  ],
  programs: [
    { id: 'PRG-001', facultyId: 'FAC-001', code: 'CSC', name: 'Computer Science', award: 'B.Sc', durationYears: 4, levels: ['100','200','300','400'] },
    { id: 'PRG-002', facultyId: 'FAC-002', code: 'BUS', name: 'Business Administration', award: 'B.Sc', durationYears: 4, levels: ['100','200','300','400'] },
    { id: 'PRG-003', facultyId: 'FAC-003', code: 'NUR', name: 'Nursing', award: 'B.NSc', durationYears: 4, levels: ['100','200','300','400'] },
    { id: 'PRG-004', facultyId: 'FAC-003', code: 'BMS', name: 'Biomedical Sciences', award: 'B.Sc', durationYears: 4, levels: ['100','200','300','400'] }
  ],
  students: [
    { id: 'ST-001', admissionNo: 'SLU26001', name: 'Nfor Brenda', gender: 'F', facultyId: 'FAC-001', programId: 'PRG-001', level: '200', semester: 'Semester 1', phone: '677112233', email: 'brenda@student.slui.test', balance: 120000, status: 'Active', photoDataUrl: '' },
    { id: 'ST-002', admissionNo: 'SLU26002', name: 'Tangwa Kevin', gender: 'M', facultyId: 'FAC-002', programId: 'PRG-002', level: '300', semester: 'Semester 1', phone: '678334455', email: 'kevin@student.slui.test', balance: 0, status: 'Active', photoDataUrl: '' },
    { id: 'ST-003', admissionNo: 'SLU26003', name: 'Mbah Linda', gender: 'F', facultyId: 'FAC-003', programId: 'PRG-003', level: '100', semester: 'Semester 1', phone: '679991122', email: 'linda@student.slui.test', balance: 250000, status: 'Pending Fees', photoDataUrl: '' },
    { id: 'ST-004', admissionNo: 'SLU26004', name: 'Atem Grace', gender: 'F', facultyId: 'FAC-003', programId: 'PRG-004', level: '400', semester: 'Semester 2', phone: '676444111', email: 'grace@student.slui.test', balance: 0, status: 'Active', photoDataUrl: '' }
  ],
  staff: [
    { id: 'SF-001', name: 'Dr. Asong Peter', role: 'Lecturer', department: 'Computer Science', canEnterMarks: true, canTakeAttendance: true, status: 'Available' },
    { id: 'SF-002', name: 'Mrs. Fuh Esther', role: 'Registrar', department: 'Administration', canEnterMarks: false, canTakeAttendance: false, status: 'Busy' },
    { id: 'SF-003', name: 'Mr. Ndam Joel', role: 'Accountant', department: 'Finance', canEnterMarks: false, canTakeAttendance: false, status: 'Available' },
    { id: 'SF-004', name: 'Mrs. Ndzi Mercy', role: 'Lecturer', department: 'Nursing', canEnterMarks: true, canTakeAttendance: true, status: 'Available' }
  ],
  courses: [
    { code: 'CSC201', title: 'Database Systems', facultyId: 'FAC-001', programId: 'PRG-001', level: '200', semester: 'Semester 1', units: 3, lecturer: 'Dr. Asong Peter' },
    { code: 'CSC204', title: 'Operating Systems', facultyId: 'FAC-001', programId: 'PRG-001', level: '200', semester: 'Semester 1', units: 3, lecturer: 'Dr. Asong Peter' },
    { code: 'BUS305', title: 'Strategic Management', facultyId: 'FAC-002', programId: 'PRG-002', level: '300', semester: 'Semester 1', units: 2, lecturer: 'Dr. Muna Rose' },
    { code: 'NUR110', title: 'Anatomy and Physiology', facultyId: 'FAC-003', programId: 'PRG-003', level: '100', semester: 'Semester 1', units: 4, lecturer: 'Mrs. Ndzi Mercy' },
    { code: 'BMS401', title: 'Clinical Instrumentation', facultyId: 'FAC-003', programId: 'PRG-004', level: '400', semester: 'Semester 2', units: 3, lecturer: 'Dr. Tambe Felix' }
  ],
  enrollments: [
    { id: 'ENR-001', studentId: 'ST-001', courseCode: 'CSC201', academicYear: '2025/2026', semester: 'Semester 1', status: 'Enrolled' },
    { id: 'ENR-002', studentId: 'ST-001', courseCode: 'CSC204', academicYear: '2025/2026', semester: 'Semester 1', status: 'Enrolled' },
    { id: 'ENR-003', studentId: 'ST-002', courseCode: 'BUS305', academicYear: '2025/2026', semester: 'Semester 1', status: 'Enrolled' },
    { id: 'ENR-004', studentId: 'ST-003', courseCode: 'NUR110', academicYear: '2025/2026', semester: 'Semester 1', status: 'Enrolled' },
    { id: 'ENR-005', studentId: 'ST-004', courseCode: 'BMS401', academicYear: '2025/2026', semester: 'Semester 2', status: 'Enrolled' }
  ],
  timetableSlots: [
    { id: 'TT-001', courseCode: 'CSC201', facultyId: 'FAC-001', programId: 'PRG-001', level: '200', semester: 'Semester 1', day: 'Monday', start: '08:00', end: '10:00', venue: 'Lab 2', lecturer: 'Dr. Asong Peter' },
    { id: 'TT-002', courseCode: 'CSC204', facultyId: 'FAC-001', programId: 'PRG-001', level: '200', semester: 'Semester 1', day: 'Wednesday', start: '10:00', end: '12:00', venue: 'Lab 1', lecturer: 'Dr. Asong Peter' },
    { id: 'TT-003', courseCode: 'BUS305', facultyId: 'FAC-002', programId: 'PRG-002', level: '300', semester: 'Semester 1', day: 'Tuesday', start: '10:00', end: '12:00', venue: 'Hall B', lecturer: 'Dr. Muna Rose' },
    { id: 'TT-004', courseCode: 'NUR110', facultyId: 'FAC-003', programId: 'PRG-003', level: '100', semester: 'Semester 1', day: 'Thursday', start: '08:00', end: '11:00', venue: 'Nursing Lab', lecturer: 'Mrs.Ndzi Mercy' }
  ],
  attendanceRecords: [
    { id: 'ATT-001', studentId: 'ST-001', courseCode: 'CSC201', date: '2026-03-10', status: 'Present', takenBy: 'Dr. Asong Peter', note: '' },
    { id: 'ATT-002', studentId: 'ST-001', courseCode: 'CSC201', date: '2026-03-17', status: 'Late', takenBy: 'Dr. Asong Peter', note: '10 minutes late' },
    { id: 'ATT-003', studentId: 'ST-002', courseCode: 'BUS305', date: '2026-03-11', status: 'Present', takenBy: 'Dr. Muna Rose', note: '' },
    { id: 'ATT-004', studentId: 'ST-003', courseCode: 'NUR110', date: '2026-03-12', status: 'Absent', takenBy: 'Mrs. Ndzi Mercy', note: 'Sick leave' }
  ],
  examTypes: [
    { id: 'CA-001', name: 'Continuous Assessment', category: 'CA', academicYear: '2025/2026', semester: 'Semester 1', includeOnTranscript: true, weight: 30 },
    { id: 'EX-001', name: 'Semester Examination', category: 'Exam', academicYear: '2025/2026', semester: 'Semester 1', includeOnTranscript: true, weight: 70 },
    { id: 'CA-002', name: 'Continuous Assessment', category: 'CA', academicYear: '2025/2026', semester: 'Semester 2', includeOnTranscript: true, weight: 30 },
    { id: 'EX-002', name: 'Semester Examination', category: 'Exam', academicYear: '2025/2026', semester: 'Semester 2', includeOnTranscript: true, weight: 70 }
  ],
  assessmentLedger: [
    { id: 'AL-001', studentId: 'ST-001', courseCode: 'CSC201', examTypeId: 'CA-001', score: 24, enteredBy: 'Dr. Asong Peter', date: '2026-03-08', released: true },
    { id: 'AL-002', studentId: 'ST-001', courseCode: 'CSC204', examTypeId: 'CA-001', score: 25, enteredBy: 'Dr. Asong Peter', date: '2026-03-08', released: true },
    { id: 'AL-003', studentId: 'ST-002', courseCode: 'BUS305', examTypeId: 'CA-001', score: 18, enteredBy: 'Dr. Muna Rose', date: '2026-03-09', released: true },
    { id: 'AL-004', studentId: 'ST-003', courseCode: 'NUR110', examTypeId: 'CA-001', score: 21, enteredBy: 'Mrs. Ndzi Mercy', date: '2026-03-10', released: false }
  ],
  examLedger: [
    { id: 'EL-001', studentId: 'ST-001', courseCode: 'CSC201', examTypeId: 'EX-001', score: 54, enteredBy: 'Dr. Asong Peter', date: '2026-03-18', released: true },
    { id: 'EL-002', studentId: 'ST-001', courseCode: 'CSC204', examTypeId: 'EX-001', score: 58, enteredBy: 'Dr. Asong Peter', date: '2026-03-18', released: true },
    { id: 'EL-003', studentId: 'ST-002', courseCode: 'BUS305', examTypeId: 'EX-001', score: 41, enteredBy: 'Dr. Muna Rose', date: '2026-03-18', released: true },
    { id: 'EL-004', studentId: 'ST-003', courseCode: 'NUR110', examTypeId: 'EX-001', score: 47, enteredBy: 'Mrs. Ndzi Mercy', date: '2026-03-18', released: false }
  ],
  feeStructure: [
    { id: 'FEE-001', programId: 'PRG-001', level: '200', tuition: 350000, registration: 25000, technology: 20000, medical: 10000 },
    { id: 'FEE-002', programId: 'PRG-002', level: '300', tuition: 330000, registration: 25000, technology: 20000, medical: 10000 },
    { id: 'FEE-003', programId: 'PRG-003', level: '100', tuition: 420000, registration: 30000, technology: 25000, medical: 15000 },
    { id: 'FEE-004', programId: 'PRG-004', level: '400', tuition: 410000, registration: 30000, technology: 25000, medical: 15000 }
  ],
  feeCollections: [
    { id: 'RCPT-1001', studentId: 'ST-001', amount: 150000, method: 'Mobile Money', purpose: 'Tuition Part Payment', date: '2026-02-14', receivedBy: 'Mr. Ndam Joel' },
    { id: 'RCPT-1002', studentId: 'ST-002', amount: 385000, method: 'Bank Deposit', purpose: 'Full School Fees', date: '2026-02-15', receivedBy: 'Mr. Ndam Joel' },
    { id: 'RCPT-1003', studentId: 'ST-004', amount: 480000, method: 'Cash', purpose: 'Full School Fees', date: '2026-02-16', receivedBy: 'Mr. Ndam Joel' }
  ],
  announcements: [
    { id: 'AN-001', title: 'Semester Registration Deadline', body: 'All students must complete registration before 14 April 2026.', audience: 'All Students', date: '2026-04-02' },
    { id: 'AN-002', title: 'Transcript Clearance Notice', body: 'Students with outstanding fees must complete clearance before final transcript release.', audience: 'Final Year Students', date: '2026-04-01' }
  ],
  transcriptApprovals: [
    { id: 'TR-001', studentId: 'ST-001', status: 'Approved', approvedBy: 'Mrs. Fuh Esther', approvedOn: '2026-04-01' }
  ],
  authUsers: [
    { id: 'U-001', username: 'admin', password: 'admin123', role: 'admin', name: 'System Administrator' },
    { id: 'U-002', username: 'staff', password: 'staff123', role: 'staff', name: 'Dr. Asong Peter', staffId: 'SF-001' },
    { id: 'U-003', username: 'student', password: 'student123', role: 'student', name: 'Nfor Brenda', studentId: 'ST-001' },
    { id: 'U-004', username: 'registrar', password: 'registrar123', role: 'registrar', name: 'Mrs. Fuh Esther', staffId: 'SF-002' }
  ],
  settings: {
    currentAcademicYear: '2026/2027',
    attendanceStatuses: ['Present', 'Absent', 'Late', 'Excused'],
    timetableDays: ['Monday','Tuesday','Wednesday','Thursday','Friday'],
    semesters: ['Semester 1', 'Semester 2'],
    receiptPrefix: 'RCPT',
    barcodePrefix: 'SLUI-',
    defaultStudentPassword: 'slui123',
    transcriptTitle: 'Academic Transcript',
    transcriptSubtitle: 'Statement of Results',
    feePurposes: ['Admission Fee','Computer Fees','Health Fees','Insurance Fees','Resit Fees','Transcript Fees','Internship Fees','Defense Fees','Other'],
    aiExperienceLabel: 'SLUI AI-ready Campus UX',
    gradingScale: [
      { grade: 'A', min: 80, max: 100, gp: 4.0, remark: 'Excellent' },
      { grade: 'B+', min: 70, max: 79, gp: 3.5, remark: 'Very Good' },
      { grade: 'B', min: 60, max: 69, gp: 3.0, remark: 'Good' },
      { grade: 'C', min: 50, max: 59, gp: 2.0, remark: 'Pass' },
      { grade: 'D', min: 45, max: 49, gp: 1.0, remark: 'Weak Pass' },
      { grade: 'F', min: 0, max: 44, gp: 0.0, remark: 'Fail' }
    ],
    moduleSettings: {
      enrollment: { academicYearLabel: '2025/2026', allowBulkEnroll: true },
      attendance: { markLateAsPresentForRate: true, allowBulkAttendance: true },
      assessments: { allowBulkAssessmentEntry: true, releaseDefault: false },
      exams: { allowBulkExamEntry: true, releaseDefault: false },
      fees: { allowReceiptPrint: true },
      portal: { allowStudentPhotoUpload: true },
      theme: { allowRoleBackgrounds: true }
    }
  }
};
