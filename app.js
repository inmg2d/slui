const STORAGE_KEY = 'slui_ndop_erp_state_v4';
const baseState = JSON.parse(JSON.stringify(window.SLUI_DATA));
let state = JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(baseState));
let currentUser = JSON.parse(sessionStorage.getItem('slui_current_user') || 'null');
let activeView = 'dashboard';

state.media ||= {};
state.settings ||= {};
state.settings.moduleSettings ||= {};
state.settings.feePurposes ||= ['Admission Fee','Computer Fees','Health Fees','Insurance Fees','Resit Fees','Transcript Fees','Internship Fees','Defense Fees','Other'];
state.media.idTemplateDataUrl ||= '';
state.settings.aiExperienceLabel ||= 'SLUI AI-ready Campus UX';

const views = {
  dashboard: { title: 'Dashboard', subtitle: 'A connected overview of admissions, academics, attendance, finance and identity services.' },
  faculties: { title: 'Faculties', subtitle: 'Faculties are now linked directly to programs, courses, students and timetable ownership.' },
  programs: { title: 'Programs', subtitle: 'Programs sit inside faculties and drive enrollment, fees, timetables and transcript grouping.' },
  students: { title: 'Students', subtitle: 'Student records use the required admission format and connect to accounts, ID cards and results.' },
  staff: { title: 'Staff', subtitle: 'Teaching and administrative users with permissions and module relationships.' },
  courses: { title: 'Courses', subtitle: 'Courses belong to faculties and programs and feed enrollment, attendance and mark ledgers.' },
  enrollment: { title: 'Enrollment', subtitle: 'Bulk enrollment lets one program and semester assign many students to many courses with check marks.' },
  timetable: { title: 'Timetable', subtitle: 'Class schedules grouped by faculty, program, level and semester.' },
  attendance: { title: 'Attendance', subtitle: 'Bulk attendance sheets for fast class capture, visible instantly inside student accounts.' },
  assessments: { title: 'Assessment Ledger', subtitle: 'Bulk CA entry for multiple students in one course with release controls.' },
  exams: { title: 'Exam Ledger', subtitle: 'Bulk examination entry with transcript visibility and weighted totals.' },
  fees: { title: 'Fees Collection', subtitle: 'Structured billing with modern payment purposes, custom fee types, receipts and balance intelligence.' },
  studentPortal: { title: 'Student Portal', subtitle: 'Students can view their photo profile, attendance, timetable, marks, balances and transcript status.' },
  transcripts: { title: 'Transcripts', subtitle: 'Weighted CA plus exam totals, approval workflow and printable output.' },
  idcards: { title: '3D ID Cards', subtitle: 'Photo-enabled 3D student ID cards with barcode and branded visual styling.' },
  announcements: { title: 'Announcements', subtitle: 'Institution notices across all users.' },
  settings: { title: 'Settings', subtitle: 'Everything editable: module behavior, branding, themes, backgrounds, IDs and credentials.' }
};

const navByRole = {
  admin: ['dashboard','faculties','programs','students','staff','courses','enrollment','timetable','attendance','assessments','exams','fees','studentPortal','transcripts','idcards','announcements','settings'],
  staff: ['dashboard','courses','enrollment','timetable','attendance','assessments','exams','studentPortal','announcements'],
  registrar: ['dashboard','students','programs','courses','enrollment','attendance','transcripts','idcards','announcements','settings'],
  student: ['dashboard','studentPortal','timetable','attendance','fees','announcements','idcards']
};

const qs = (s, p=document) => p.querySelector(s);
const qsa = (s, p=document) => [...p.querySelectorAll(s)];
const uid = (p) => `${p}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
const today = () => new Date().toISOString().slice(0,10);
const currency = (n) => new Intl.NumberFormat('en-CM',{style:'currency',currency:'XAF',maximumFractionDigits:0}).format(Number(n||0));
const initials = (name='') => name.split(' ').filter(Boolean).slice(0,2).map(v=>v[0]).join('').toUpperCase();
const saveState = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const escapeHtml = (t='') => String(t).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

const getFaculty = (id) => state.faculties.find(x=>x.id===id);
const getProgram = (id) => state.programs.find(x=>x.id===id);
const getStudent = (id) => state.students.find(x=>x.id===id);
const getCourse = (code) => state.courses.find(x=>x.code===code);
const getExamType = (id) => state.examTypes.find(x=>x.id===id);
const roleBackgroundKey = (role) => `${role}BackgroundDataUrl`;
const currentSearch = () => (qs('#globalSearch')?.value || '').trim().toLowerCase();

function badgeClass(v='') {
  const x = String(v).toLowerCase();
  if (['active','present','paid','released','approved','enrolled','available'].some(t=>x.includes(t))) return 'success';
  if (['late','pending','part'].some(t=>x.includes(t))) return 'warning';
  if (['info','draft'].some(t=>x.includes(t))) return 'info';
  return 'danger';
}
function badge(v='') { return `<span class="badge ${badgeClass(v)}">${escapeHtml(v)}</span>`; }
function optionize(values, selected='') { return values.map(v=>`<option value="${escapeHtml(v)}" ${String(v)===String(selected)?'selected':''}>${escapeHtml(v)}</option>`).join(''); }
function toDataUrl(file, cb) { const r = new FileReader(); r.onload = () => cb(r.result); r.readAsDataURL(file); }

function feePurposeOptions(selected='') {
  return (state.settings.feePurposes || []).map(v => `<option value="${escapeHtml(v)}" ${String(v)===String(selected)?'selected':''}>${escapeHtml(v)}</option>`).join('');
}
function effectivePaymentPurpose(fd) {
  const purpose = String(fd.get('purpose') || '');
  const other = String(fd.get('otherPurpose') || '').trim();
  return purpose === 'Other' ? (other || 'Other') : purpose;
}
function idTemplateSrc() {
  return state.media.idTemplateDataUrl || 'id_template.png';
}

function generateAdmissionNumber() {
  const yy = String(new Date().getFullYear()).slice(-2);
  const prefix = state.institution.idPrefix || 'SLU';
  const current = state.students
    .map(s => s.admissionNo || '')
    .filter(v => v.startsWith(prefix + yy))
    .map(v => Number(v.slice(prefix.length + 2)) || 0);
  const next = (Math.max(0, ...current) + 1).toString().padStart(3, '0');
  return `${prefix}${yy}${next}`;
}

function gradeFromScore(score) {
  return state.settings.gradingScale.find(g => Number(score) >= Number(g.min) && Number(score) <= Number(g.max)) || state.settings.gradingScale[state.settings.gradingScale.length - 1];
}

function paidByStudent(studentId) {
  return state.feeCollections.filter(x=>x.studentId===studentId).reduce((s,x)=>s+Number(x.amount||0),0);
}
function feePlan(student) {
  return state.feeStructure.find(x => x.programId===student.programId && String(x.level)===String(student.level));
}
function expectedFees(student) {
  const plan = feePlan(student);
  if (!plan) return Number(student.balance||0);
  return Number(plan.tuition||0)+Number(plan.registration||0)+Number(plan.technology||0)+Number(plan.medical||0);
}
function outstandingFees(student) {
  return Math.max(expectedFees(student)-paidByStudent(student.id),0);
}
function updateStudentBalances() {
  state.students.forEach(s => {
    s.balance = outstandingFees(s);
    s.status = s.balance === 0 ? 'Active' : (paidByStudent(s.id) > 0 ? 'Part Paid' : 'Pending Fees');
  });
}
function attendanceRate(studentId) {
  const recs = state.attendanceRecords.filter(r=>r.studentId===studentId);
  if (!recs.length) return 0;
  const positive = recs.filter(r => {
    const st = String(r.status).toLowerCase();
    return st === 'present' || st === 'excused' || (state.settings.moduleSettings.attendance.markLateAsPresentForRate && st === 'late');
  }).length;
  return Math.round((positive / recs.length) * 100);
}
function enrollmentRows(filters={}) {
  return state.enrollments.filter(e => (!filters.studentId || e.studentId===filters.studentId) && (!filters.courseCode || e.courseCode===filters.courseCode) && (!filters.semester || e.semester===filters.semester));
}
function enrolledCourses(studentId, semester='') {
  return enrollmentRows({ studentId, semester }).map(e => getCourse(e.courseCode)).filter(Boolean);
}
function courseResultRows(studentId, releaseOnly=false) {
  const student = getStudent(studentId);
  if (!student) return [];
  const courses = enrolledCourses(studentId, student.semester);
  return courses.map(course => {
    const caRows = state.assessmentLedger.filter(r => r.studentId===studentId && r.courseCode===course.code && (!releaseOnly || r.released));
    const examRows = state.examLedger.filter(r => r.studentId===studentId && r.courseCode===course.code && (!releaseOnly || r.released));
    const ca = caRows.reduce((s,r)=>s+Number(r.score||0),0);
    const exam = examRows.reduce((s,r)=>s+Number(r.score||0),0);
    const total = ca + exam;
    const grade = gradeFromScore(total);
    return { course, ca, exam, total, grade };
  });
}
function transcriptApproval(studentId) {
  return state.transcriptApprovals.find(x=>x.studentId===studentId) || { status:'Pending', approvedBy:'', approvedOn:'' };
}
function studentAccount(studentId) {
  return state.authUsers.find(x=>x.studentId===studentId && x.role==='student');
}
function studentByCurrentUser() {
  return currentUser?.studentId ? getStudent(currentUser.studentId) : null;
}
function accountUsernameFromStudent(student) { return student.admissionNo.toLowerCase(); }
function accountPasswordFromStudent(student) { return `${state.settings.defaultStudentPassword}-${student.admissionNo.slice(-3)}`; }
function ensureStudentAccounts(studentIds=[]) {
  const targets = studentIds.length ? state.students.filter(s=>studentIds.includes(s.id)) : state.students;
  targets.forEach(student => {
    let account = studentAccount(student.id);
    const username = accountUsernameFromStudent(student);
    const password = accountPasswordFromStudent(student);
    if (!account) {
      state.authUsers.push({ id: uid('U'), username, password, role: 'student', name: student.name, studentId: student.id });
    } else {
      account.username = username;
      account.password = password;
      account.name = student.name;
    }
  });
  saveState();
}

function applyTheme() {
  const key = currentUser ? roleBackgroundKey(currentUser.role) : '';
  const bg = key ? state.media[key] : '';
  document.body.classList.toggle('custom-bg', !!bg);
  document.body.style.backgroundImage = bg
    ? `linear-gradient(135deg, rgba(7,17,31,.70), rgba(12,24,48,.55)), url(${bg})`
    : '';
  const logo = state.media.logoDataUrl;
  const logoEl = qs('#brandLogo');
  const markEl = qs('#brandMark');
  if (logo) {
    logoEl.src = logo;
    logoEl.classList.remove('hidden');
    markEl.classList.add('hidden');
  } else {
    logoEl.classList.add('hidden');
    markEl.classList.remove('hidden');
  }
  qs('#brandTitle').textContent = state.institution.acronym + ' Ndop';
  qs('#brandSubtitle').textContent = 'Smart Campus ERP';
  qs('#sidebarFooterText').textContent = state.institution.name;
}

function renderLogin() {
  qs('#loginScreen').innerHTML = `
    <div class="login-card">
      <div class="login-hero">
        <div class="login-badge">Saint Lawrence University Institute Ndop</div>
        <h1>Beautiful campus software for our time.</h1>
        <p>Bulk enrollment, bulk attendance, bulk assessment and exam ledgers, student self-service, transcript approval, and photo-powered 3D ID cards — all in one connected system.</p>
        <div class="pill-row">
          <div class="pill">Bulk course enrollment</div>
          <div class="pill">Bulk marks entry</div>
          <div class="pill">3D student ID cards</div>
          <div class="pill">Role-based backgrounds</div>
          <div class="pill">AI-ready workflows</div>
        </div>
        <div class="demo-grid">
          <div class="demo-pill">admin / admin123</div>
          <div class="demo-pill">staff / staff123</div>
          <div class="demo-pill">student / student123</div>
          <div class="demo-pill">registrar / registrar123</div>
        </div>
      </div>
      <div class="login-form-wrap">
        <h2>Sign in</h2>
        <p class="mini">Students can upload profile photos inside their account and see the result instantly on their ID card.</p>
        <form id="loginForm" class="login-form">
          <label>Username <input name="username" value="admin" required /></label>
          <label>Password <input type="password" name="password" value="admin123" required /></label>
          <button class="btn btn-primary" type="submit">Enter system</button>
        </form>
      </div>
    </div>`;
  qs('#loginForm').onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const username = String(fd.get('username')).trim();
    const password = String(fd.get('password')).trim();
    const user = state.authUsers.find(u => u.username === username && u.password === password);
    if (!user) return alert('Invalid login details.');
    currentUser = JSON.parse(JSON.stringify(user));
    sessionStorage.setItem('slui_current_user', JSON.stringify(currentUser));
    initApp();
  };
}

function renderNav() {
  const items = navByRole[currentUser.role] || ['dashboard'];
  qs('#navMenu').innerHTML = items.map(v => `<button class="nav-link ${v===activeView?'active':''}" data-view="${v}">${views[v].title}</button>`).join('');
  qsa('.nav-link').forEach(btn => btn.onclick = () => setView(btn.dataset.view));
}

function renderUserChip() {
  const student = currentUser.role === 'student' ? getStudent(currentUser.studentId) : null;
  const photo = student?.photoDataUrl || '';
  qs('#userChip').innerHTML = `
    <div class="user-avatar">${photo ? `<img src="${photo}" alt="avatar" />` : initials(currentUser.name)}</div>
    <div class="two-line">
      <strong>${escapeHtml(currentUser.name)}</strong>
      <span class="mini">${escapeHtml(currentUser.role.toUpperCase())}${student ? ` • ${escapeHtml(student.admissionNo)}` : ''}</span>
    </div>`;
}

function setView(view) {
  activeView = view;
  qsa('.view').forEach(v => v.classList.remove('active-view'));
  qs('#' + view).classList.add('active-view');
  qs('#viewTitle').textContent = views[view].title;
  qs('#viewSubtitle').textContent = views[view].subtitle;
  renderNav();
  renderViews();
}

function initApp() {
  if (!currentUser) {
    qs('#appShell').classList.add('hidden');
    renderLogin();
    return;
  }
  qs('#loginScreen').innerHTML = '';
  qs('#appShell').classList.remove('hidden');
  applyTheme();
  renderUserChip();
  renderNav();
  setView(activeView);
}

function renderDashboard() {
  updateStudentBalances();
  const studentCount = state.students.length;
  const courseCount = state.courses.length;
  const collection = state.feeCollections.reduce((s,x)=>s+Number(x.amount||0),0);
  const avgAttendance = Math.round(state.students.reduce((s,x)=>s+attendanceRate(x.id),0)/Math.max(1,state.students.length));
  qs('#dashboard').innerHTML = `
    <div class="grid-4">
      <div class="card hero-card"><div class="stat-label mini">Students</div><div class="stat-value">${studentCount}</div><div class="mini">Accounts, IDs, enrollments and academic records connected.</div></div>
      <div class="card"><div class="stat-label">Courses</div><div class="stat-value">${courseCount}</div><div class="mini">Faculty and program structured course offerings.</div></div>
      <div class="card"><div class="stat-label">Collections</div><div class="stat-value">${currency(collection)}</div><div class="mini">Total fee collection in current demo data.</div></div>
      <div class="card"><div class="stat-label">Attendance Rate</div><div class="stat-value">${avgAttendance}%</div><div class="mini">Student participation across recorded classes.</div></div>
    </div>
    <div class="grid-2">
      <div class="panel-stack">
        <div class="card">
          <div class="toolbar"><h3 class="section-title">Smart operations</h3><span class="mini">Merged modules and relationships</span></div>
          <div class="metric-grid">
            <div class="metric"><strong>Bulk enrollment</strong><div class="mini">Tick multiple students and courses in one semester.</div></div>
            <div class="metric"><strong>Bulk attendance</strong><div class="mini">One course sheet enters many students at once.</div></div>
            <div class="metric"><strong>Bulk ledgers</strong><div class="mini">Continuous assessment and exam marks in a single pass.</div></div>
            <div class="metric"><strong>3D ID cards</strong><div class="mini">Student-uploaded photos appear automatically.</div></div>
          </div>
        </div>
        <div class="card">
          <h3 class="section-title">Recent announcements</h3>
          <div class="list">
            ${state.announcements.map(a => `<div class="list-item"><div><strong>${escapeHtml(a.title)}</strong><div class="mini">${escapeHtml(a.body)}</div></div><div class="mini">${escapeHtml(a.date)}</div></div>`).join('')}
          </div>
        </div>
      </div>
      <div class="panel-stack">
        <div class="card">
          <h3 class="section-title">At a glance</h3>
          <div class="kv"><span>Faculties</span><strong>${state.faculties.length}</strong></div>
          <div class="kv"><span>Programs</span><strong>${state.programs.length}</strong></div>
          <div class="kv"><span>Timetable slots</span><strong>${state.timetableSlots.length}</strong></div>
          <div class="kv"><span>Pending transcripts</span><strong>${state.students.filter(s=>transcriptApproval(s.id).status!=='Approved').length}</strong></div>
        </div>
        <div class="card soft">
          <h3 class="section-title">Institution identity rule</h3>
          <div class="callout">
            <strong>Admission number format</strong>
            <p class="mini">Student ID numbers now follow the required structure <strong>SLUYYXXX</strong>. Example: <strong>SLU26001</strong>.</p>
          </div>
        </div>
      </div>
    </div>`;
}

function renderSimpleTable(viewId, title, rowsHtml, formHtml='') {
  qs('#' + viewId).innerHTML = `<div class="grid-2"><div class="card">${formHtml}</div><div class="card"><h3 class="section-title">${title}</h3><div class="table-wrap"><table>${rowsHtml}</table></div></div></div>`;
}

function renderFaculties() {
  const form = `
    <div class="toolbar"><h3 class="section-title">Add faculty</h3><span class="mini">Editable module</span></div>
    <form id="facultyForm" class="form-grid">
      <label>Faculty code <input name="code" required /></label>
      <label>Faculty name <input name="name" required /></label>
      <label>Dean <input name="dean" required /></label>
      <div><button class="btn btn-primary" type="submit">Save faculty</button></div>
    </form>`;
  const rows = `<thead><tr><th>Code</th><th>Name</th><th>Dean</th></tr></thead><tbody>${state.faculties.map(f=>`<tr><td>${escapeHtml(f.code)}</td><td>${escapeHtml(f.name)}</td><td>${escapeHtml(f.dean)}</td></tr>`).join('')}</tbody>`;
  renderSimpleTable('faculties','Faculty list',rows,form);
  qs('#facultyForm').onsubmit = e => { e.preventDefault(); const fd=new FormData(e.target); state.faculties.push({id:uid('FAC'), code:String(fd.get('code')).trim(), name:String(fd.get('name')).trim(), dean:String(fd.get('dean')).trim()}); saveState(); renderViews(); };
}

function renderPrograms() {
  const form = `
    <div class="toolbar"><h3 class="section-title">Add program</h3><span class="mini">Linked to faculty</span></div>
    <form id="programForm" class="form-grid">
      <label>Faculty <select name="facultyId">${state.faculties.map(f=>`<option value="${f.id}">${escapeHtml(f.name)}</option>`).join('')}</select></label>
      <label>Program code <input name="code" required /></label>
      <label>Program name <input name="name" required /></label>
      <label>Award <input name="award" value="B.Sc" required /></label>
      <label>Duration years <input type="number" name="durationYears" value="4" min="1" /></label>
      <div><button class="btn btn-primary" type="submit">Save program</button></div>
    </form>`;
  const rows = `<thead><tr><th>Program</th><th>Faculty</th><th>Award</th><th>Duration</th></tr></thead><tbody>${state.programs.map(p=>`<tr><td>${escapeHtml(p.code)} • ${escapeHtml(p.name)}</td><td>${escapeHtml(getFaculty(p.facultyId)?.name || '')}</td><td>${escapeHtml(p.award)}</td><td>${escapeHtml(String(p.durationYears))} years</td></tr>`).join('')}</tbody>`;
  renderSimpleTable('programs','Program list',rows,form);
  qs('#programForm').onsubmit = e => { e.preventDefault(); const fd=new FormData(e.target); state.programs.push({id:uid('PRG'), facultyId:fd.get('facultyId'), code:String(fd.get('code')).trim(), name:String(fd.get('name')).trim(), award:String(fd.get('award')).trim(), durationYears:Number(fd.get('durationYears')), levels:['100','200','300','400']}); saveState(); renderViews(); };
}

function renderStudents() {
  const students = state.students.filter(s => JSON.stringify(s).toLowerCase().includes(currentSearch()));
  qs('#students').innerHTML = `
    <div class="grid-2">
      <div class="panel-stack">
        <div class="card">
          <div class="toolbar"><h3 class="section-title">Add student</h3><button id="generateAllAccountsBtn" class="btn btn-soft">Generate all student accounts</button></div>
          <form id="studentForm" class="form-grid">
            <label>Admission No <input name="admissionNo" value="${generateAdmissionNumber()}" required /></label>
            <label>Full name <input name="name" required /></label>
            <label>Gender <select name="gender"><option>F</option><option>M</option></select></label>
            <label>Faculty <select name="facultyId">${state.faculties.map(f=>`<option value="${f.id}">${escapeHtml(f.name)}</option>`).join('')}</select></label>
            <label>Program <select name="programId">${state.programs.map(p=>`<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('')}</select></label>
            <label>Level <input name="level" value="100" required /></label>
            <label>Semester <select name="semester">${optionize(state.settings.semesters,'Semester 1')}</select></label>
            <label>Email <input name="email" /></label>
            <label>Phone <input name="phone" /></label>
            <div><button class="btn btn-primary" type="submit">Save student</button></div>
          </form>
        </div>
        <div class="card soft">
          <h3 class="section-title">Account generation</h3>
          <p class="mini">Bulk and single account generation now use the student admission number as username seed and respect the SLUYYXXX identity structure.</p>
        </div>
      </div>
      <div class="card">
        <div class="toolbar"><h3 class="section-title">Student records</h3><span class="search-note">${students.length} shown</span></div>
        <div class="table-wrap"><table><thead><tr><th>Admission No</th><th>Name</th><th>Program</th><th>Semester</th><th>Status</th><th>Account</th></tr></thead><tbody>
          ${students.map(s=>`<tr>
            <td>${escapeHtml(s.admissionNo)}</td>
            <td>${escapeHtml(s.name)}<div class="mini">${escapeHtml(s.email||'')}</div></td>
            <td>${escapeHtml(getProgram(s.programId)?.name || '')}<div class="mini">Level ${escapeHtml(s.level)}</div></td>
            <td>${escapeHtml(s.semester)}</td>
            <td>${badge(s.status)}</td>
            <td><button class="btn btn-soft small" data-gensingle="${s.id}">Generate</button></td>
          </tr>`).join('')}
        </tbody></table></div>
      </div>
    </div>`;
  qs('#studentForm').onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const student = {
      id: uid('ST'),
      admissionNo: String(fd.get('admissionNo')).trim(),
      name: String(fd.get('name')).trim(),
      gender: String(fd.get('gender')),
      facultyId: String(fd.get('facultyId')),
      programId: String(fd.get('programId')),
      level: String(fd.get('level')),
      semester: String(fd.get('semester')),
      email: String(fd.get('email')).trim(),
      phone: String(fd.get('phone')).trim(),
      balance: 0,
      status: 'Active',
      photoDataUrl: ''
    };
    state.students.push(student);
    ensureStudentAccounts([student.id]);
    saveState();
    renderViews();
  };
  qs('#generateAllAccountsBtn').onclick = () => { ensureStudentAccounts(); alert('All student usernames and passwords generated or refreshed.'); renderViews(); };
  qsa('[data-gensingle]').forEach(btn => btn.onclick = () => { ensureStudentAccounts([btn.dataset.gensingle]); alert('Student account generated.'); renderViews(); });
}

function renderStaff() {
  qs('#staff').innerHTML = `<div class="card"><div class="table-wrap"><table><thead><tr><th>Name</th><th>Role</th><th>Department</th><th>Marks</th><th>Attendance</th></tr></thead><tbody>${state.staff.map(s=>`<tr><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.role)}</td><td>${escapeHtml(s.department)}</td><td>${badge(s.canEnterMarks?'Allowed':'Blocked')}</td><td>${badge(s.canTakeAttendance?'Allowed':'Blocked')}</td></tr>`).join('')}</tbody></table></div></div>`;
}

function renderCourses() {
  const rows = state.courses.filter(c => JSON.stringify(c).toLowerCase().includes(currentSearch()));
  qs('#courses').innerHTML = `<div class="grid-2"><div class="card"><div class="toolbar"><h3 class="section-title">Add course</h3><span class="mini">Editable module</span></div><form id="courseForm" class="form-grid">
      <label>Course code <input name="code" required /></label>
      <label>Course title <input name="title" required /></label>
      <label>Faculty <select name="facultyId">${state.faculties.map(f=>`<option value="${f.id}">${escapeHtml(f.name)}</option>`).join('')}</select></label>
      <label>Program <select name="programId">${state.programs.map(p=>`<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('')}</select></label>
      <label>Level <input name="level" value="100" required /></label>
      <label>Semester <select name="semester">${optionize(state.settings.semesters)}</select></label>
      <label>Units <input type="number" name="units" value="3" min="1" /></label>
      <label>Lecturer <input name="lecturer" required /></label>
      <div><button class="btn btn-primary" type="submit">Save course</button></div>
    </form></div>
    <div class="card"><div class="table-wrap"><table><thead><tr><th>Code</th><th>Course</th><th>Program</th><th>Semester</th><th>Lecturer</th></tr></thead><tbody>${rows.map(c=>`<tr><td>${escapeHtml(c.code)}</td><td>${escapeHtml(c.title)}<div class="mini">${escapeHtml(String(c.units))} units</div></td><td>${escapeHtml(getProgram(c.programId)?.name||'')}</td><td>${escapeHtml(c.semester)} • Level ${escapeHtml(c.level)}</td><td>${escapeHtml(c.lecturer)}</td></tr>`).join('')}</tbody></table></div></div></div>`;
  qs('#courseForm').onsubmit = e => { e.preventDefault(); const fd=new FormData(e.target); state.courses.push({code:String(fd.get('code')).trim(), title:String(fd.get('title')).trim(), facultyId:String(fd.get('facultyId')), programId:String(fd.get('programId')), level:String(fd.get('level')), semester:String(fd.get('semester')), units:Number(fd.get('units')), lecturer:String(fd.get('lecturer')).trim()}); saveState(); renderViews(); };
}

function matchingStudents(programId, semester) {
  return state.students.filter(s => (!programId || s.programId===programId) && (!semester || s.semester===semester));
}
function matchingCourses(programId, semester) {
  return state.courses.filter(c => (!programId || c.programId===programId) && (!semester || c.semester===semester));
}
function renderEnrollment() {
  const programs = state.programs;
  const selectedProgramId = programs[0]?.id || '';
  const selectedSemester = state.settings.semesters[0];
  qs('#enrollment').innerHTML = `
    <div class="grid-2">
      <div class="card">
        <div class="toolbar"><h3 class="section-title">Bulk enrollment</h3><span class="mini">Tick many students and many courses once</span></div>
        <form id="bulkEnrollForm" class="panel-stack">
          <div class="form-grid">
            <label>Program <select name="programId" id="bulkEnrollProgram">${programs.map(p=>`<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('')}</select></label>
            <label>Semester <select name="semester" id="bulkEnrollSemester">${optionize(state.settings.semesters, selectedSemester)}</select></label>
            <label>Academic year <input name="academicYear" value="${escapeHtml(state.settings.currentAcademicYear)}" /></label>
          </div>
          <div class="grid-2">
            <div>
              <div class="toolbar"><strong>Students</strong><button type="button" class="btn btn-soft small" id="selectAllStudentsBtn">Select all</button></div>
              <div id="bulkStudentList" class="check-grid"></div>
            </div>
            <div>
              <div class="toolbar"><strong>Courses</strong><button type="button" class="btn btn-soft small" id="selectAllCoursesBtn">Select all</button></div>
              <div id="bulkCourseList" class="check-grid"></div>
            </div>
          </div>
          <button class="btn btn-primary" type="submit">Bulk enroll checked students into checked courses</button>
        </form>
      </div>
      <div class="card">
        <div class="toolbar"><h3 class="section-title">Current enrollments</h3><span class="mini">${state.enrollments.length} records</span></div>
        <div class="table-wrap"><table><thead><tr><th>Student</th><th>Course</th><th>Semester</th><th>Status</th></tr></thead><tbody>${state.enrollments.map(e=>`<tr><td>${escapeHtml(getStudent(e.studentId)?.name||'')}<div class="mini">${escapeHtml(getStudent(e.studentId)?.admissionNo||'')}</div></td><td>${escapeHtml(getCourse(e.courseCode)?.title||e.courseCode)}</td><td>${escapeHtml(e.semester)}</td><td>${badge(e.status)}</td></tr>`).join('')}</tbody></table></div>
      </div>
    </div>`;
  function refreshBulkEnrollmentChoices() {
    const programId = qs('#bulkEnrollProgram').value;
    const semester = qs('#bulkEnrollSemester').value;
    const studs = matchingStudents(programId, semester);
    const courses = matchingCourses(programId, semester);
    qs('#bulkStudentList').innerHTML = studs.map(s=>`<label class="check-card"><input type="checkbox" name="studentIds" value="${s.id}" /><div><strong>${escapeHtml(s.name)}</strong><div class="mini">${escapeHtml(s.admissionNo)} • Level ${escapeHtml(s.level)}</div></div></label>`).join('');
    qs('#bulkCourseList').innerHTML = courses.map(c=>`<label class="check-card"><input type="checkbox" name="courseCodes" value="${c.code}" /><div><strong>${escapeHtml(c.code)} • ${escapeHtml(c.title)}</strong><div class="mini">${escapeHtml(c.semester)} • ${escapeHtml(String(c.units))} units</div></div></label>`).join('');
  }
  refreshBulkEnrollmentChoices();
  qs('#bulkEnrollProgram').onchange = refreshBulkEnrollmentChoices;
  qs('#bulkEnrollSemester').onchange = refreshBulkEnrollmentChoices;
  qs('#selectAllStudentsBtn').onclick = () => qsa('#bulkStudentList input').forEach(i=>i.checked=true);
  qs('#selectAllCoursesBtn').onclick = () => qsa('#bulkCourseList input').forEach(i=>i.checked=true);
  qs('#bulkEnrollForm').onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const students = fd.getAll('studentIds');
    const courses = fd.getAll('courseCodes');
    const semester = String(fd.get('semester'));
    const academicYear = String(fd.get('academicYear'));
    if (!students.length || !courses.length) return alert('Select at least one student and one course.');
    let created = 0;
    students.forEach(studentId => courses.forEach(courseCode => {
      if (!state.enrollments.find(x => x.studentId===studentId && x.courseCode===courseCode && x.semester===semester && x.academicYear===academicYear)) {
        state.enrollments.push({ id: uid('ENR'), studentId, courseCode, semester, academicYear, status: 'Enrolled' });
        created += 1;
      }
    }));
    saveState();
    alert(`${created} enrollment records created.`);
    renderViews();
  };
}

function renderTimetable() {
  qs('#timetable').innerHTML = `<div class="grid-2"><div class="card"><div class="toolbar"><h3 class="section-title">Add timetable slot</h3><span class="mini">Editable days and slots</span></div><form id="ttForm" class="form-grid">
    <label>Course <select name="courseCode">${state.courses.map(c=>`<option value="${c.code}">${escapeHtml(c.code)} • ${escapeHtml(c.title)}</option>`).join('')}</select></label>
    <label>Day <select name="day">${optionize(state.settings.timetableDays)}</select></label>
    <label>Start <input name="start" value="08:00" /></label>
    <label>End <input name="end" value="10:00" /></label>
    <label>Venue <input name="venue" required /></label>
    <label>Lecturer <input name="lecturer" required /></label>
    <div><button class="btn btn-primary" type="submit">Save slot</button></div>
  </form></div><div class="card"><div class="table-wrap"><table><thead><tr><th>Course</th><th>Day</th><th>Time</th><th>Venue</th></tr></thead><tbody>${state.timetableSlots.map(t=>`<tr><td>${escapeHtml(t.courseCode)}<div class="mini">${escapeHtml(getCourse(t.courseCode)?.title||'')}</div></td><td>${escapeHtml(t.day)}</td><td>${escapeHtml(t.start)} - ${escapeHtml(t.end)}</td><td>${escapeHtml(t.venue)}</td></tr>`).join('')}</tbody></table></div></div></div>`;
  qs('#ttForm').onsubmit = e => { e.preventDefault(); const fd=new FormData(e.target); const course=getCourse(String(fd.get('courseCode'))); state.timetableSlots.push({id:uid('TT'), courseCode:course.code, facultyId:course.facultyId, programId:course.programId, level:course.level, semester:course.semester, day:String(fd.get('day')), start:String(fd.get('start')), end:String(fd.get('end')), venue:String(fd.get('venue')), lecturer:String(fd.get('lecturer'))}); saveState(); renderViews(); };
}

function renderBulkMarkModule(targetId, label, ledgerKey, category) {
  const eligibleCourses = currentUser.role === 'student' ? [] : state.courses;
  const examTypes = state.examTypes.filter(x => x.category === category);
  qs('#' + targetId).innerHTML = `
    <div class="grid-2">
      <div class="card">
        <div class="toolbar"><h3 class="section-title">Bulk ${label.toLowerCase()} entry</h3><span class="mini">Fast data entry per course</span></div>
        <form id="${targetId}FilterForm" class="form-grid">
          <label>Course <select name="courseCode" id="${targetId}Course">${eligibleCourses.map(c=>`<option value="${c.code}">${escapeHtml(c.code)} • ${escapeHtml(c.title)}</option>`).join('')}</select></label>
          <label>Exam type <select name="examTypeId" id="${targetId}ExamType">${examTypes.map(e=>`<option value="${e.id}">${escapeHtml(e.name)} (${e.weight}%)</option>`).join('')}</select></label>
          <label>Date <input type="date" name="date" value="${today()}" /></label>
          <label>Entered by <input name="enteredBy" value="${escapeHtml(currentUser.name || '')}" /></label>
          <label>Release immediately <select name="released"><option value="true">Yes</option><option value="false">No</option></select></label>
          <div><button class="btn btn-soft" type="button" id="${targetId}LoadBtn">Load students</button></div>
        </form>
        <div id="${targetId}BulkRows" class="panel-stack"></div>
      </div>
      <div class="card">
        <div class="toolbar"><h3 class="section-title">${label} ledger</h3><span class="mini">${state[ledgerKey].length} records</span></div>
        <div class="table-wrap"><table><thead><tr><th>Student</th><th>Course</th><th>Type</th><th>Score</th><th>Released</th></tr></thead><tbody>${state[ledgerKey].map(r=>`<tr><td>${escapeHtml(getStudent(r.studentId)?.name||'')}<div class="mini">${escapeHtml(getStudent(r.studentId)?.admissionNo||'')}</div></td><td>${escapeHtml(r.courseCode)}</td><td>${escapeHtml(getExamType(r.examTypeId)?.name||'')}</td><td>${escapeHtml(String(r.score))}</td><td>${badge(r.released ? 'Released' : 'Draft')}</td></tr>`).join('')}</tbody></table></div>
      </div>
    </div>`;
  qs(`#${targetId}LoadBtn`).onclick = () => {
    const courseCode = qs(`#${targetId}Course`).value;
    const course = getCourse(courseCode);
    const students = state.enrollments.filter(e => e.courseCode===courseCode && e.status==='Enrolled').map(e => getStudent(e.studentId)).filter(Boolean);
    qs(`#${targetId}BulkRows`).innerHTML = `
      <form id="${targetId}BulkForm" class="panel-stack">
        ${students.map(s=>`<div class="check-card"><input type="checkbox" name="studentIds" value="${s.id}" checked /><div style="flex:1"><strong>${escapeHtml(s.name)}</strong><div class="mini">${escapeHtml(s.admissionNo)}</div></div><input type="number" name="score_${s.id}" placeholder="Score" min="0" max="100" step="0.01" /></div>`).join('')}
        <button class="btn btn-primary" type="submit">Save bulk ${label.toLowerCase()}</button>
      </form>`;
    const form = qs(`#${targetId}BulkForm`);
    if (!form) return;
    form.onsubmit = e => {
      e.preventDefault();
      const filterFd = new FormData(qs(`#${targetId}FilterForm`));
      const formFd = new FormData(form);
      const checked = formFd.getAll('studentIds');
      let saved = 0;
      checked.forEach(studentId => {
        const score = Number(formFd.get(`score_${studentId}`));
        if (Number.isFinite(score)) {
          state[ledgerKey].push({
            id: uid(category === 'CA' ? 'AL' : 'EL'),
            studentId,
            courseCode,
            examTypeId: String(filterFd.get('examTypeId')),
            score,
            enteredBy: String(filterFd.get('enteredBy')),
            date: String(filterFd.get('date')),
            released: String(filterFd.get('released')) === 'true'
          });
          saved += 1;
        }
      });
      saveState();
      alert(`${saved} ${label.toLowerCase()} records saved.`);
      renderViews();
    };
  };
}

function renderAttendance() {
  qs('#attendance').innerHTML = `
    <div class="grid-2">
      <div class="card">
        <div class="toolbar"><h3 class="section-title">Bulk attendance</h3><span class="mini">Mark a full class at once</span></div>
        <form id="attendanceFilterForm" class="form-grid">
          <label>Course <select name="courseCode" id="attendanceCourse">${state.courses.map(c=>`<option value="${c.code}">${escapeHtml(c.code)} • ${escapeHtml(c.title)}</option>`).join('')}</select></label>
          <label>Date <input type="date" name="date" value="${today()}" /></label>
          <label>Taken by <input name="takenBy" value="${escapeHtml(currentUser.name || '')}" /></label>
          <div><button id="attendanceLoadBtn" class="btn btn-soft" type="button">Load class</button></div>
        </form>
        <div id="attendanceBulkArea"></div>
      </div>
      <div class="card">
        <div class="toolbar"><h3 class="section-title">Attendance records</h3><span class="mini">${state.attendanceRecords.length} records</span></div>
        <div class="table-wrap"><table><thead><tr><th>Student</th><th>Course</th><th>Date</th><th>Status</th></tr></thead><tbody>${state.attendanceRecords.map(r=>`<tr><td>${escapeHtml(getStudent(r.studentId)?.name||'')}</td><td>${escapeHtml(r.courseCode)}</td><td>${escapeHtml(r.date)}</td><td>${badge(r.status)}</td></tr>`).join('')}</tbody></table></div>
      </div>
    </div>`;
  qs('#attendanceLoadBtn').onclick = () => {
    const courseCode = qs('#attendanceCourse').value;
    const students = state.enrollments.filter(e=>e.courseCode===courseCode && e.status==='Enrolled').map(e=>getStudent(e.studentId)).filter(Boolean);
    qs('#attendanceBulkArea').innerHTML = `<form id="attendanceBulkForm" class="panel-stack">${students.map(s=>`<div class="check-card"><div style="flex:1"><strong>${escapeHtml(s.name)}</strong><div class="mini">${escapeHtml(s.admissionNo)}</div></div><select name="status_${s.id}">${optionize(state.settings.attendanceStatuses,'Present')}</select><input name="note_${s.id}" placeholder="Optional note" /></div>`).join('')}<button class="btn btn-primary" type="submit">Save bulk attendance</button></form>`;
    qs('#attendanceBulkForm').onsubmit = e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const meta = new FormData(qs('#attendanceFilterForm'));
      students.forEach(s => state.attendanceRecords.push({ id: uid('ATT'), studentId: s.id, courseCode, date: String(meta.get('date')), status: String(fd.get(`status_${s.id}`)), takenBy: String(meta.get('takenBy')), note: String(fd.get(`note_${s.id}`)||'') }));
      saveState();
      alert('Bulk attendance saved.');
      renderViews();
    };
  };
}


function renderFees() {
  updateStudentBalances();
  const purposeTotals = (state.settings.feePurposes || []).map(name => ({
    name,
    total: state.feeCollections.filter(r => (r.purpose === name) || (name === 'Other' && !(state.settings.feePurposes || []).includes(r.purpose))).reduce((s,r)=>s+Number(r.amount||0),0)
  }));
  qs('#fees').innerHTML = `<div class="panel-stack">
    <div class="grid-4">
      <div class="card hero-card"><div class="mini">Collections</div><div class="stat-value">${currency(state.feeCollections.reduce((s,x)=>s+Number(x.amount||0),0))}</div><div class="mini">Modern fee tracking with purpose intelligence</div></div>
      <div class="card"><div class="mini">Receipts issued</div><div class="stat-value">${state.feeCollections.length}</div><div class="mini">${escapeHtml(state.settings.aiExperienceLabel || 'AI-ready operations')}</div></div>
      <div class="card"><div class="mini">Tracked purposes</div><div class="stat-value">${(state.settings.feePurposes || []).length}</div><div class="mini">Admission, health, transcript, internship and more</div></div>
      <div class="card"><div class="mini">Outstanding balance</div><div class="stat-value">${currency(state.students.reduce((s,student)=>s+outstandingFees(student),0))}</div><div class="mini">Live student balance aggregation</div></div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="toolbar"><h3 class="section-title">Record payment</h3><span class="mini">Purpose-aware fees collection module</span></div>
        <form id="paymentForm" class="form-grid">
          <label>Student <select name="studentId">${state.students.map(s=>`<option value="${s.id}">${escapeHtml(s.admissionNo)} • ${escapeHtml(s.name)}</option>`).join('')}</select></label>
          <label>Amount <input type="number" name="amount" required /></label>
          <label>Method <select name="method"><option>Cash</option><option>Mobile Money</option><option>Bank Deposit</option></select></label>
          <label>Purpose <select name="purpose" id="feePurposeSelect">${feePurposeOptions('Admission Fee')}</select></label>
          <label id="otherPurposeWrap" class="hidden">Other purpose <input name="otherPurpose" placeholder="Type fee purpose" /></label>
          <label>Date <input type="date" name="date" value="${today()}" /></label>
          <label>Received by <input name="receivedBy" value="${escapeHtml(currentUser.name || '')}" /></label>
          <div><button class="btn btn-primary" type="submit">Save payment</button></div>
        </form>
        <hr class="sep" />
        <div class="purpose-chip-row">${(state.settings.feePurposes || []).map(p=>`<span class="badge info">${escapeHtml(p)}</span>`).join('')}</div>
      </div>
      <div class="card">
        <div class="toolbar"><h3 class="section-title">Fee purpose analytics</h3><span class="mini">Best-practice bursary categories</span></div>
        <div class="purpose-grid">${purposeTotals.map(item=>`<div class="purpose-stat"><strong>${escapeHtml(item.name)}</strong><span>${currency(item.total)}</span></div>`).join('')}</div>
      </div>
    </div>
    <div class="card">
      <div class="toolbar"><h3 class="section-title">Receipts and payment history</h3><span class="mini">Latest purpose-tagged payments</span></div>
      <div class="table-wrap"><table><thead><tr><th>Receipt</th><th>Student</th><th>Amount</th><th>Purpose</th><th>Method</th><th>Date</th></tr></thead><tbody>${state.feeCollections.map(r=>`<tr><td>${escapeHtml(r.id)}</td><td>${escapeHtml(getStudent(r.studentId)?.name||'')}<div class="mini">${escapeHtml(getStudent(r.studentId)?.admissionNo||'')}</div></td><td>${currency(r.amount)}</td><td>${escapeHtml(r.purpose)}</td><td>${escapeHtml(r.method)}</td><td>${escapeHtml(r.date)}</td></tr>`).join('')}</tbody></table></div>
    </div>
  </div>`;
  const purposeSelect = qs('#feePurposeSelect');
  const otherWrap = qs('#otherPurposeWrap');
  const syncOtherPurpose = () => otherWrap.classList.toggle('hidden', purposeSelect.value !== 'Other');
  purposeSelect.onchange = syncOtherPurpose;
  syncOtherPurpose();
  qs('#paymentForm').onsubmit = e => {
    e.preventDefault();
    const fd=new FormData(e.target);
    const receipt = `${state.settings.receiptPrefix}-${Math.floor(Math.random()*9000+1000)}`;
    state.feeCollections.push({ id: receipt, studentId:String(fd.get('studentId')), amount:Number(fd.get('amount')), method:String(fd.get('method')), purpose:effectivePaymentPurpose(fd), date:String(fd.get('date')), receivedBy:String(fd.get('receivedBy'))});
    saveState();
    renderViews();
  };
}

function renderStudentPortal() {
  const student = currentUser.role === 'student' ? studentByCurrentUser() : state.students[0];
  if (!student) { qs('#studentPortal').innerHTML = '<div class="card">No student profile linked.</div>'; return; }
  const results = courseResultRows(student.id, true);
  const tslots = state.timetableSlots.filter(t => t.programId===student.programId && t.level===student.level && t.semester===student.semester);
  const records = state.attendanceRecords.filter(r => r.studentId===student.id);
  const account = studentAccount(student.id);
  qs('#studentPortal').innerHTML = `
    <div class="grid-2">
      <div class="panel-stack">
        <div class="card">
          <div class="toolbar"><h3 class="section-title">Student profile</h3><span class="mini">Linked to ID card and account</span></div>
          <div class="kv"><span>Name</span><strong>${escapeHtml(student.name)}</strong></div>
          <div class="kv"><span>Admission No</span><strong>${escapeHtml(student.admissionNo)}</strong></div>
          <div class="kv"><span>Program</span><strong>${escapeHtml(getProgram(student.programId)?.name || '')}</strong></div>
          <div class="kv"><span>Semester</span><strong>${escapeHtml(student.semester)}</strong></div>
          <div class="kv"><span>Account</span><strong>${escapeHtml(account?.username || 'Not generated')}</strong></div>
          ${currentUser.role === 'student' ? `<hr class="sep" /><div class="photo-input"><label>Upload profile photo <input type="file" id="studentPhotoUpload" accept="image/*" /></label><div class="mini">This picture is used automatically on the 3D ID card.</div></div>` : ''}
        </div>
        <div class="card">
          <div class="toolbar"><h3 class="section-title">Released results</h3><span class="mini">Weighted per course</span></div>
          <div class="table-wrap"><table><thead><tr><th>Course</th><th>CA</th><th>Exam</th><th>Total</th><th>Grade</th></tr></thead><tbody>${results.map(r=>`<tr><td>${escapeHtml(r.course.code)} • ${escapeHtml(r.course.title)}</td><td>${r.ca}</td><td>${r.exam}</td><td>${r.total}</td><td>${badge(r.grade.grade + ' • ' + r.grade.remark)}</td></tr>`).join('')}</tbody></table></div>
        </div>
      </div>
      <div class="panel-stack">
        <div class="card"><h3 class="section-title">Attendance & finance</h3><div class="kv"><span>Attendance rate</span><strong>${attendanceRate(student.id)}%</strong></div><div class="kv"><span>Outstanding fees</span><strong>${currency(outstandingFees(student))}</strong></div><div class="kv"><span>Transcript status</span><strong>${escapeHtml(transcriptApproval(student.id).status)}</strong></div></div>
        <div class="card"><h3 class="section-title">Timetable</h3><div class="list">${tslots.map(t=>`<div class="list-item"><div><strong>${escapeHtml(t.courseCode)}</strong><div class="mini">${escapeHtml(getCourse(t.courseCode)?.title||'')}</div></div><div class="mini">${escapeHtml(t.day)}<br>${escapeHtml(t.start)} - ${escapeHtml(t.end)}</div></div>`).join('') || '<div class="mini">No timetable slots.</div>'}</div></div>
        <div class="card"><h3 class="section-title">Attendance records</h3><div class="list">${records.map(r=>`<div class="list-item"><div><strong>${escapeHtml(r.courseCode)}</strong><div class="mini">${escapeHtml(r.date)}</div></div><div>${badge(r.status)}</div></div>`).join('') || '<div class="mini">No attendance records.</div>'}</div></div>
      </div>
    </div>`;
  const upload = qs('#studentPhotoUpload');
  if (upload) upload.onchange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    toDataUrl(file, dataUrl => {
      student.photoDataUrl = dataUrl;
      saveState();
      renderViews();
    });
  };
}

function transcriptHtml(student) {
  const results = courseResultRows(student.id, true);
  const approval = transcriptApproval(student.id);
  const totalUnits = results.reduce((s,r)=>s+Number(r.course.units||0),0);
  const qp = results.reduce((s,r)=>s+(Number(r.grade.gp||0) * Number(r.course.units||0)),0);
  const gpa = totalUnits ? (qp/totalUnits).toFixed(2) : '0.00';
  return `
    <div class="transcript-sheet" id="transcriptSheet">
      <div class="transcript-head">
        <div class="transcript-logo">${state.media.logoDataUrl ? `<img src="${state.media.logoDataUrl}" alt="logo" />` : '<strong>SLUI</strong>'}</div>
        <div>
          <h2 style="margin:0">${escapeHtml(state.institution.name)}</h2>
          <div class="mini">${escapeHtml(state.institution.campus)}</div>
          <h3 style="margin:8px 0 4px">${escapeHtml(state.settings.transcriptTitle)}</h3>
          <div class="mini">${escapeHtml(state.settings.transcriptSubtitle)}</div>
        </div>
      </div>
      <div class="grid-2" style="grid-template-columns:1fr 1fr">
        <div>
          <div class="kv"><span>Student</span><strong>${escapeHtml(student.name)}</strong></div>
          <div class="kv"><span>Admission No</span><strong>${escapeHtml(student.admissionNo)}</strong></div>
          <div class="kv"><span>Program</span><strong>${escapeHtml(getProgram(student.programId)?.name||'')}</strong></div>
        </div>
        <div>
          <div class="kv"><span>Faculty</span><strong>${escapeHtml(getFaculty(student.facultyId)?.name||'')}</strong></div>
          <div class="kv"><span>Semester</span><strong>${escapeHtml(student.semester)}</strong></div>
          <div class="kv"><span>Status</span><strong>${escapeHtml(approval.status)}</strong></div>
        </div>
      </div>
      <div class="table-wrap"><table><thead><tr><th>Course</th><th>CA</th><th>Exam</th><th>Total</th><th>Grade</th><th>GP</th><th>Remark</th></tr></thead><tbody>${results.map(r=>`<tr><td>${escapeHtml(r.course.code)} • ${escapeHtml(r.course.title)}</td><td>${r.ca}</td><td>${r.exam}</td><td>${r.total}</td><td>${escapeHtml(r.grade.grade)}</td><td>${escapeHtml(String(r.grade.gp))}</td><td>${escapeHtml(r.grade.remark)}</td></tr>`).join('')}</tbody></table></div>
      <div class="grid-3" style="margin-top:16px">
        <div class="callout"><strong>Total Units</strong><div>${totalUnits}</div></div>
        <div class="callout"><strong>GPA</strong><div>${gpa}</div></div>
        <div class="callout"><strong>Approved by</strong><div>${escapeHtml(approval.approvedBy || 'Pending')}</div><div class="mini">${escapeHtml(approval.approvedOn || '')}</div></div>
      </div>
    </div>`;
}
function renderTranscripts() {
  const student = currentUser.role === 'student' ? studentByCurrentUser() : state.students[0];
  qs('#transcripts').innerHTML = `
    <div class="grid-2">
      <div class="card">
        <div class="toolbar"><h3 class="section-title">Transcript controls</h3><span class="mini">CA + exam weighted totals</span></div>
        ${currentUser.role !== 'student' ? `<form id="approvalForm" class="form-grid">
          <label>Student <select name="studentId" id="transcriptStudentSelect">${state.students.map(s=>`<option value="${s.id}">${escapeHtml(s.admissionNo)} • ${escapeHtml(s.name)}</option>`).join('')}</select></label>
          <label>Status <select name="status"><option>Pending</option><option>Approved</option></select></label>
          <label>Approved by <input name="approvedBy" value="${escapeHtml(currentUser.name || '')}" /></label>
          <label>Date <input type="date" name="approvedOn" value="${today()}" /></label>
          <div><button class="btn btn-primary" type="submit">Save approval</button></div>
        </form><hr class="sep" />` : ''}
        <div class="toolbar"><button id="printTranscriptBtn" class="btn btn-primary">Export transcript PDF</button></div>
      </div>
      <div class="card">${transcriptHtml(student)}</div>
    </div>`;
  const select = qs('#transcriptStudentSelect');
  if (select) {
    select.onchange = () => {
      const st = getStudent(select.value);
      qs('#transcripts .card:last-child').innerHTML = transcriptHtml(st);
      bindPdfButton();
    };
    qs('#approvalForm').onsubmit = e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const studentId = String(fd.get('studentId'));
      const existing = state.transcriptApprovals.find(x=>x.studentId===studentId);
      const payload = { id: existing?.id || uid('TR'), studentId, status: String(fd.get('status')), approvedBy: String(fd.get('approvedBy')), approvedOn: String(fd.get('approvedOn')) };
      if (existing) Object.assign(existing, payload); else state.transcriptApprovals.push(payload);
      saveState();
      renderViews();
    };
  }
  bindPdfButton();
}

function barcodeText(student) {
  const raw = `${state.settings.barcodePrefix}${student.admissionNo}`;
  const bars = raw.split('').map(ch => '|' + ((ch.charCodeAt(0) % 3) ? '||' : '|') + '|').join(' ');
  return `${bars}\n${raw}`;
}

function idCardHtml(student) {
  const program = getProgram(student.programId)?.name || '';
  const faculty = getFaculty(student.facultyId)?.name || '';
  const displayFaculty = faculty.replace(/^Faculty of /i, '').toUpperCase();
  const levelCode = `${String(program).slice(0,3).toUpperCase() || 'SLU'}L-${escapeHtml(student.level)}`;
  const template = idTemplateSrc();
  return `
    <div class="id-template-scene">
      <div class="id-template-card" id="idCardCanvas">
        <img class="id-template-base" src="${template}" alt="ID template" />
        <div class="id-template-mask photo"></div>
        <div class="id-template-mask details"></div>
        <div class="id-template-mask barcode"></div>
        <div class="id-template-year">ACADEMIC YEAR ${escapeHtml(state.settings.currentAcademicYear || '2026/2027')}</div>
        <div class="id-template-name">${escapeHtml(student.name)}</div>
        <div class="id-template-idlabel">ID Number</div>
        <div class="id-template-idvalue">${escapeHtml(student.admissionNo)}</div>
        <div class="id-template-dept">DEPARTMENT&nbsp;&nbsp;${escapeHtml(displayFaculty || 'GENERAL STUDIES')}</div>
        <div class="id-template-program">${escapeHtml(levelCode)}</div>
        <div class="id-template-contact1">CONTACT US</div>
        <div class="id-template-contact2">info@slu-edu.org</div>
        <div class="id-template-contact3">6 70 83 27 84</div>
        <div class="id-template-expiry"><span>Expire Date :</span> AUGUST ${new Date().getFullYear()+1}</div>
        <div class="id-template-president">PRESIDENT</div>
        <div class="id-template-president-name">Dr. OSCAR LABANG</div>
        <div class="id-template-photo">${student.photoDataUrl ? `<img src="${student.photoDataUrl}" alt="student" />` : `<span>${escapeHtml(initials(student.name))}</span>`}</div>
        <div class="id-template-barcode">${escapeHtml(barcodeText(student))}</div>
      </div>
    </div>`;
}

function renderIdCards() {
  const student = currentUser.role === 'student' ? studentByCurrentUser() : state.students[0];
  qs('#idcards').innerHTML = `<div class="grid-2"><div class="card"><div class="toolbar"><h3 class="section-title">3D student ID card</h3><span class="mini">Built from the supplied Saint Lawrence ID template image</span></div>${currentUser.role !== 'student' ? `<label>Select student <select id="idStudentSelect">${state.students.map(s=>`<option value="${s.id}">${escapeHtml(s.admissionNo)} • ${escapeHtml(s.name)}</option>`).join('')}</select></label><hr class="sep" />` : ''}<div class="toolbar"><button id="exportIdBtn" class="btn btn-primary">Export ID card PDF</button></div></div><div class="card" id="idCardWrap">${idCardHtml(student)}</div></div>`;
  const select = qs('#idStudentSelect');
  if (select) select.onchange = () => { qs('#idCardWrap').innerHTML = idCardHtml(getStudent(select.value)); bindIdPdfButton(); };
  bindIdPdfButton();
}

function renderAnnouncements() {
  qs('#announcements').innerHTML = `<div class="grid-2"><div class="card"><div class="toolbar"><h3 class="section-title">Create announcement</h3><span class="mini">Editable module</span></div><form id="annForm" class="form-grid"><label>Title <input name="title" required /></label><label>Audience <input name="audience" value="All Users" /></label><label>Date <input type="date" name="date" value="${today()}" /></label><label style="grid-column:1/-1">Message <textarea name="body" required></textarea></label><div><button class="btn btn-primary" type="submit">Post</button></div></form></div><div class="card"><div class="list">${state.announcements.map(a=>`<div class="list-item"><div><strong>${escapeHtml(a.title)}</strong><div class="mini">${escapeHtml(a.body)}</div></div><div class="mini">${escapeHtml(a.audience)}<br>${escapeHtml(a.date)}</div></div>`).join('')}</div></div></div>`;
  qs('#annForm').onsubmit = e => { e.preventDefault(); const fd=new FormData(e.target); state.announcements.unshift({ id: uid('AN'), title:String(fd.get('title')), audience:String(fd.get('audience')), date:String(fd.get('date')), body:String(fd.get('body')) }); saveState(); renderViews(); };
}

function renderSettings() {
  const roleKeys = [ ['admin','Admin background'], ['staff','Staff background'], ['student','Student background'], ['registrar','Registrar background'] ];
  qs('#settings').innerHTML = `
    <div class="panel-stack">
      <div class="grid-2">
        <div class="card">
          <div class="toolbar"><h3 class="section-title">Institution & module settings</h3><span class="mini">Everything editable</span></div>
          <form id="settingsForm" class="panel-stack">
            <div class="form-grid">
              <label>Institution name <input name="name" value="${escapeHtml(state.institution.name)}" /></label>
              <label>Acronym <input name="acronym" value="${escapeHtml(state.institution.acronym)}" /></label>
              <label>Campus <input name="campus" value="${escapeHtml(state.institution.campus)}" /></label>
              <label>Receipt prefix <input name="receiptPrefix" value="${escapeHtml(state.settings.receiptPrefix)}" /></label>
              <label>Barcode prefix <input name="barcodePrefix" value="${escapeHtml(state.settings.barcodePrefix)}" /></label>
              <label>Default student password <input name="defaultStudentPassword" value="${escapeHtml(state.settings.defaultStudentPassword)}" /></label>
              <label>Transcript title <input name="transcriptTitle" value="${escapeHtml(state.settings.transcriptTitle)}" /></label>
              <label>Transcript subtitle <input name="transcriptSubtitle" value="${escapeHtml(state.settings.transcriptSubtitle)}" /></label>
              <label style="grid-column:1/-1">Fee purposes (comma separated) <input name="feePurposes" value="${escapeHtml((state.settings.feePurposes || []).join(', '))}" /></label>
            </div>
            <div class="module-grid">
              ${Object.entries(state.settings.moduleSettings).map(([key,val]) => `<div class="module-setting"><strong>${escapeHtml(key)}</strong>${Object.entries(val).map(([k,v]) => `<div class="kv"><span>${escapeHtml(k)}</span><strong>${escapeHtml(String(v))}</strong></div>`).join('')}</div>`).join('')}
            </div>
            <button class="btn btn-primary" type="submit">Save settings</button>
          </form>
        </div>
        <div class="card">
          <div class="toolbar"><h3 class="section-title">Branding & uploaded backgrounds</h3><span class="mini">Admin-managed experience for all users</span></div>
          <div class="panel-stack">
            <label>Upload school logo <input type="file" id="logoUpload" accept="image/*" /></label>
            <label>Upload student ID card template <input type="file" id="idTemplateUpload" accept="image/*" /></label>
            ${roleKeys.map(([role,label]) => `<label>${label} <input type="file" data-rolebg="${role}" accept="image/*" /></label>`).join('')}
            <div class="theme-preview" style="background-image:${state.media.adminBackgroundDataUrl ? `url(${state.media.adminBackgroundDataUrl})` : 'linear-gradient(135deg,#2b6fff,#7b5cff)'}"><span>Admin preview</span></div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="toolbar"><h3 class="section-title">Student account credentials</h3><button id="regenAllCredsBtn" class="btn btn-soft">Regenerate all student usernames and passwords</button></div>
        <div class="table-wrap"><table><thead><tr><th>Student</th><th>Admission No</th><th>Username</th><th>Password</th></tr></thead><tbody>${state.students.map(s=>{ const acc = studentAccount(s.id); return `<tr><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.admissionNo)}</td><td>${escapeHtml(acc?.username || 'Not generated')}</td><td>${escapeHtml(acc?.password || 'Not generated')}</td></tr>`; }).join('')}</tbody></table></div>
      </div>
    </div>`;
  qs('#settingsForm').onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    state.institution.name = String(fd.get('name'));
    state.institution.acronym = String(fd.get('acronym'));
    state.institution.campus = String(fd.get('campus'));
    state.settings.receiptPrefix = String(fd.get('receiptPrefix'));
    state.settings.barcodePrefix = String(fd.get('barcodePrefix'));
    state.settings.defaultStudentPassword = String(fd.get('defaultStudentPassword'));
    state.settings.transcriptTitle = String(fd.get('transcriptTitle'));
    state.settings.transcriptSubtitle = String(fd.get('transcriptSubtitle'));
    state.settings.feePurposes = String(fd.get('feePurposes')).split(',').map(v=>v.trim()).filter(Boolean);
    saveState();
    applyTheme();
    renderViews();
  };
  qs('#regenAllCredsBtn').onclick = () => { ensureStudentAccounts(); alert('All student credentials regenerated.'); renderViews(); };
  const logoUpload = qs('#logoUpload');
  logoUpload.onchange = e => { const file=e.target.files?.[0]; if (!file) return; toDataUrl(file, dataUrl => { state.media.logoDataUrl = dataUrl; saveState(); applyTheme(); renderViews(); }); };
  const idTemplateUpload = qs('#idTemplateUpload');
  if (idTemplateUpload) idTemplateUpload.onchange = e => { const file=e.target.files?.[0]; if (!file) return; toDataUrl(file, dataUrl => { state.media.idTemplateDataUrl = dataUrl; saveState(); renderViews(); }); };
  qsa('[data-rolebg]').forEach(inp => inp.onchange = e => { const file=e.target.files?.[0]; if (!file) return; const role = inp.dataset.rolebg; toDataUrl(file, dataUrl => { state.media[roleBackgroundKey(role)] = dataUrl; saveState(); applyTheme(); renderViews(); }); });
}

function bindPdfButton() {
  const btn = qs('#printTranscriptBtn');
  if (!btn) return;
  btn.onclick = async () => {
    const node = qs('#transcriptSheet');
    if (!node || !window.jspdf) return alert('PDF libraries unavailable. Open while online.');
    const canvas = await html2canvas(node, { scale: 2 });
    const img = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = 190; const height = canvas.height * width / canvas.width;
    pdf.addImage(img, 'PNG', 10, 10, width, height);
    pdf.save('slui-transcript.pdf');
  };
}
function bindIdPdfButton() {
  const btn = qs('#exportIdBtn');
  if (!btn) return;
  btn.onclick = async () => {
    const node = qs('#idCardCanvas');
    if (!node || !window.jspdf) return alert('PDF libraries unavailable. Open while online.');
    const canvas = await html2canvas(node, { scale: 2, backgroundColor: null });
    const img = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('l', 'mm', [90, 140]);
    pdf.addImage(img, 'PNG', 5, 5, 130, 80);
    pdf.save('slui-id-card.pdf');
  };
}

function renderViews() {
  renderDashboard();
  renderFaculties();
  renderPrograms();
  renderStudents();
  renderStaff();
  renderCourses();
  renderEnrollment();
  renderTimetable();
  renderAttendance();
  renderBulkMarkModule('assessments', 'Assessment', 'assessmentLedger', 'CA');
  renderBulkMarkModule('exams', 'Exam', 'examLedger', 'Exam');
  renderFees();
  renderStudentPortal();
  renderTranscripts();
  renderIdCards();
  renderAnnouncements();
  renderSettings();
}

qs('#logoutBtn').onclick = () => { currentUser = null; sessionStorage.removeItem('slui_current_user'); initApp(); };
qs('#resetBtn').onclick = () => { if (confirm('Reset all demo data and local changes?')) { state = JSON.parse(JSON.stringify(baseState)); saveState(); initApp(); } };
qs('#exportSummaryBtn').onclick = () => {
  const summary = {
    institution: state.institution.name,
    students: state.students.length,
    accounts: state.authUsers.length,
    courses: state.courses.length,
    enrollments: state.enrollments.length,
    attendance: state.attendanceRecords.length,
    assessments: state.assessmentLedger.length,
    exams: state.examLedger.length,
    feesCollected: state.feeCollections.reduce((s,x)=>s+Number(x.amount||0),0)
  };
  const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'slui-summary.json'; a.click(); URL.revokeObjectURL(a.href);
};
qs('#globalSearch').oninput = () => renderViews();

ensureStudentAccounts();
saveState();
initApp();



/* ===== Final CRUD + ID Card Fix Upgrade ===== */
function actionButtons(id, type, extra='') {
  return `<div class="row-actions">
    <button type="button" class="btn btn-soft small" data-action="edit-${type}" data-id="${id}">Modify</button>
    <button type="button" class="btn btn-danger small" data-action="delete-${type}" data-id="${id}">Delete</button>${extra}
  </div>`;
}
function wireActions(root, actions) {
  Object.entries(actions).forEach(([key, fn]) => {
    qsa(`[data-action="${key}"]`, root).forEach(btn => btn.onclick = () => fn(btn.dataset.id, btn));
  });
}
function removeById(arr, id) {
  const idx = arr.findIndex(x => x.id === id);
  if (idx >= 0) arr.splice(idx, 1);
}
function upsertById(arr, item) {
  const idx = arr.findIndex(x => x.id === item.id);
  if (idx >= 0) arr[idx] = item;
  else arr.push(item);
}
function fillForm(form, values) {
  Object.entries(values).forEach(([k,v]) => {
    const el = form.elements[k];
    if (el) el.value = v ?? '';
  });
}
function clearForm(form) {
  form.reset();
  qsa('[name="editId"]', form).forEach(el => el.value = '');
}
function studentName(studentId) {
  const s = getStudent(studentId);
  return s ? `${s.admissionNo} • ${s.name}` : '';
}
function confirmDelete(label) {
  return confirm(`Delete this ${label}?`);
}
function formHeader(title, subtitle='') {
  return `<div class="toolbar"><h3 class="section-title">${title}</h3><span class="mini">${subtitle}</span></div>`;
}
function saveAndRefresh() { saveState(); renderViews(); }

function renderFaculties() {
  const root = qs('#faculties');
  root.innerHTML = `
    <div class="grid-2">
      <div class="card">
        ${formHeader('Faculty form', 'Save, modify and delete enabled')}
        <form id="facultyForm" class="form-grid">
          <input type="hidden" name="editId" />
          <label>Faculty code <input name="code" required /></label>
          <label>Faculty name <input name="name" required /></label>
          <label>Dean <input name="dean" required /></label>
          <div class="toolbar left-align">
            <button class="btn btn-primary" type="submit">Save faculty</button>
            <button class="btn btn-soft" type="button" id="facultyCancelBtn">Clear</button>
          </div>
        </form>
      </div>
      <div class="card">
        ${formHeader('Faculty list', `${state.faculties.length} records`)}
        <div class="table-wrap"><table><thead><tr><th>Code</th><th>Name</th><th>Dean</th><th>Actions</th></tr></thead>
        <tbody>${state.faculties.map(f=>`<tr>
          <td>${escapeHtml(f.code)}</td>
          <td>${escapeHtml(f.name)}</td>
          <td>${escapeHtml(f.dean)}</td>
          <td>${actionButtons(f.id,'faculty')}</td>
        </tr>`).join('')}</tbody></table></div>
      </div>
    </div>`;
  const form = qs('#facultyForm', root);
  form.onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(form);
    const item = { id: String(fd.get('editId') || uid('FAC')), code: String(fd.get('code')).trim(), name: String(fd.get('name')).trim(), dean: String(fd.get('dean')).trim() };
    upsertById(state.faculties, item); saveAndRefresh();
  };
  qs('#facultyCancelBtn', root).onclick = () => clearForm(form);
  wireActions(root, {
    'edit-faculty': id => {
      const item = state.faculties.find(x=>x.id===id); if (!item) return;
      fillForm(form, item);
      qs('[name="editId"]', form).value = item.id;
    },
    'delete-faculty': id => {
      if (!confirmDelete('faculty')) return;
      removeById(state.faculties, id);
      state.programs = state.programs.filter(p => p.facultyId !== id);
      state.students = state.students.filter(s => s.facultyId !== id);
      state.courses = state.courses.filter(c => c.facultyId !== id);
      saveAndRefresh();
    }
  });
}

function renderPrograms() {
  const root = qs('#programs');
  root.innerHTML = `
    <div class="grid-2">
      <div class="card">
        ${formHeader('Program form', 'Linked to faculties')}
        <form id="programForm" class="form-grid">
          <input type="hidden" name="editId" />
          <label>Faculty <select name="facultyId">${state.faculties.map(f=>`<option value="${f.id}">${escapeHtml(f.name)}</option>`).join('')}</select></label>
          <label>Program code <input name="code" required /></label>
          <label>Program name <input name="name" required /></label>
          <label>Award <input name="award" value="B.Sc" required /></label>
          <label>Duration years <input type="number" name="durationYears" value="4" min="1" /></label>
          <div class="toolbar left-align">
            <button class="btn btn-primary" type="submit">Save program</button>
            <button class="btn btn-soft" type="button" id="programCancelBtn">Clear</button>
          </div>
        </form>
      </div>
      <div class="card">
        ${formHeader('Program list', `${state.programs.length} records`)}
        <div class="table-wrap"><table><thead><tr><th>Program</th><th>Faculty</th><th>Award</th><th>Duration</th><th>Actions</th></tr></thead>
        <tbody>${state.programs.map(p=>`<tr>
          <td>${escapeHtml(p.code)} • ${escapeHtml(p.name)}</td>
          <td>${escapeHtml(getFaculty(p.facultyId)?.name || '')}</td>
          <td>${escapeHtml(p.award)}</td>
          <td>${escapeHtml(String(p.durationYears))} years</td>
          <td>${actionButtons(p.id,'program')}</td>
        </tr>`).join('')}</tbody></table></div>
      </div>
    </div>`;
  const form = qs('#programForm', root);
  form.onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(form);
    const item = {
      id: String(fd.get('editId') || uid('PRG')),
      facultyId: String(fd.get('facultyId')),
      code: String(fd.get('code')).trim(),
      name: String(fd.get('name')).trim(),
      award: String(fd.get('award')).trim(),
      durationYears: Number(fd.get('durationYears') || 4),
      levels: ['100','200','300','400']
    };
    upsertById(state.programs, item); saveAndRefresh();
  };
  qs('#programCancelBtn', root).onclick = () => clearForm(form);
  wireActions(root, {
    'edit-program': id => {
      const item = state.programs.find(x=>x.id===id); if (!item) return;
      fillForm(form, item); qs('[name="editId"]', form).value = item.id;
    },
    'delete-program': id => {
      if (!confirmDelete('program')) return;
      removeById(state.programs, id);
      state.students = state.students.filter(s => s.programId !== id);
      state.courses = state.courses.filter(c => c.programId !== id);
      state.enrollments = state.enrollments.filter(e => getCourse(e.courseCode)?.programId !== id);
      saveAndRefresh();
    }
  });
}

function renderStudents() {
  const root = qs('#students');
  const students = state.students.filter(s => JSON.stringify(s).toLowerCase().includes(currentSearch()));
  root.innerHTML = `
    <div class="grid-2">
      <div class="panel-stack">
        <div class="card">
          <div class="toolbar"><h3 class="section-title">Student form</h3><button id="generateAllAccountsBtn" class="btn btn-soft">Generate all student accounts</button></div>
          <form id="studentForm" class="form-grid">
            <input type="hidden" name="editId" />
            <label>Admission No <input name="admissionNo" value="${generateAdmissionNumber()}" required /></label>
            <label>Full name <input name="name" required /></label>
            <label>Gender <select name="gender"><option>F</option><option>M</option></select></label>
            <label>Faculty <select name="facultyId">${state.faculties.map(f=>`<option value="${f.id}">${escapeHtml(f.name)}</option>`).join('')}</select></label>
            <label>Program <select name="programId">${state.programs.map(p=>`<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('')}</select></label>
            <label>Level <input name="level" value="100" required /></label>
            <label>Semester <select name="semester">${optionize(state.settings.semesters,'Semester 1')}</select></label>
            <label>Email <input name="email" /></label>
            <label>Phone <input name="phone" /></label>
            <label>Status <select name="status"><option>Active</option><option>Pending Fees</option><option>Deferred</option></select></label>
            <div class="toolbar left-align">
              <button class="btn btn-primary" type="submit">Save student</button>
              <button class="btn btn-soft" type="button" id="studentCancelBtn">Clear</button>
            </div>
          </form>
        </div>
        <div class="card soft">
          <h3 class="section-title">Account generation</h3>
          <p class="mini">Single and bulk credentials stay tied to the SLUYYXXX admission number format.</p>
        </div>
      </div>
      <div class="card">
        ${formHeader('Student records', `${students.length} shown`)}
        <div class="table-wrap"><table><thead><tr><th>Admission No</th><th>Name</th><th>Program</th><th>Semester</th><th>Status</th><th>Account</th><th>Actions</th></tr></thead><tbody>
        ${students.map(s=>{ const acc = studentAccount(s.id); return `<tr>
          <td>${escapeHtml(s.admissionNo)}</td>
          <td>${escapeHtml(s.name)}<div class="mini">${escapeHtml(s.email || '')}</div></td>
          <td>${escapeHtml(getProgram(s.programId)?.name || '')}<div class="mini">Level ${escapeHtml(s.level)}</div></td>
          <td>${escapeHtml(s.semester)}</td>
          <td>${badge(s.status)}</td>
          <td><div class="mini">${escapeHtml(acc?.username || 'Not generated')}</div></td>
          <td>${actionButtons(s.id,'student', `<button type="button" class="btn btn-soft small" data-action="cred-student" data-id="${s.id}">Generate login</button>`)}</td>
        </tr>`; }).join('')}
        </tbody></table></div>
      </div>
    </div>`;
  const form = qs('#studentForm', root);
  form.onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(form);
    const existing = state.students.find(x=>x.id===String(fd.get('editId')));
    const item = {
      id: String(fd.get('editId') || uid('ST')),
      admissionNo: String(fd.get('admissionNo')).trim(),
      name: String(fd.get('name')).trim(),
      gender: String(fd.get('gender')),
      facultyId: String(fd.get('facultyId')),
      programId: String(fd.get('programId')),
      level: String(fd.get('level')).trim(),
      semester: String(fd.get('semester')),
      phone: String(fd.get('phone') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      balance: Number(existing?.balance || 0),
      status: String(fd.get('status')),
      photoDataUrl: existing?.photoDataUrl || ''
    };
    upsertById(state.students, item);
    ensureStudentAccounts([item.id]);
    saveAndRefresh();
  };
  qs('#studentCancelBtn', root).onclick = () => clearForm(form);
  qs('#generateAllAccountsBtn', root).onclick = () => { ensureStudentAccounts(); alert('All student accounts generated.'); renderViews(); };
  wireActions(root, {
    'edit-student': id => {
      const s = state.students.find(x=>x.id===id); if (!s) return;
      fillForm(form, s); qs('[name="editId"]', form).value = s.id;
    },
    'delete-student': id => {
      if (!confirmDelete('student')) return;
      removeById(state.students, id);
      state.authUsers = state.authUsers.filter(u => u.studentId !== id);
      state.enrollments = state.enrollments.filter(e => e.studentId !== id);
      state.attendanceRecords = state.attendanceRecords.filter(r => r.studentId !== id);
      state.assessmentLedger = state.assessmentLedger.filter(r => r.studentId !== id);
      state.examLedger = state.examLedger.filter(r => r.studentId !== id);
      state.feeCollections = state.feeCollections.filter(r => r.studentId !== id);
      state.transcriptApprovals = state.transcriptApprovals.filter(r => r.studentId !== id);
      saveAndRefresh();
    },
    'cred-student': id => {
      ensureStudentAccounts([id]); alert('Student login generated/updated.'); renderViews();
    }
  });
}

function renderStaff() {
  const root = qs('#staff');
  root.innerHTML = `
    <div class="grid-2">
      <div class="card">
        ${formHeader('Staff form', 'Save, modify and delete enabled')}
        <form id="staffForm" class="form-grid">
          <input type="hidden" name="editId" />
          <label>Full name <input name="name" required /></label>
          <label>Role <input name="role" required /></label>
          <label>Department <input name="department" required /></label>
          <label>Can enter marks <select name="canEnterMarks"><option value="true">Yes</option><option value="false">No</option></select></label>
          <label>Can take attendance <select name="canTakeAttendance"><option value="true">Yes</option><option value="false">No</option></select></label>
          <label>Status <select name="status"><option>Available</option><option>Busy</option><option>Leave</option></select></label>
          <div class="toolbar left-align">
            <button class="btn btn-primary" type="submit">Save staff</button>
            <button class="btn btn-soft" type="button" id="staffCancelBtn">Clear</button>
          </div>
        </form>
      </div>
      <div class="card">
        ${formHeader('Staff directory', `${state.staff.length} records`)}
        <div class="table-wrap"><table><thead><tr><th>Name</th><th>Role</th><th>Department</th><th>Marks</th><th>Attendance</th><th>Actions</th></tr></thead><tbody>
          ${state.staff.map(s=>`<tr>
            <td>${escapeHtml(s.name)}</td>
            <td>${escapeHtml(s.role)}</td>
            <td>${escapeHtml(s.department)}</td>
            <td>${badge(s.canEnterMarks ? 'Allowed' : 'Blocked')}</td>
            <td>${badge(s.canTakeAttendance ? 'Allowed' : 'Blocked')}</td>
            <td>${actionButtons(s.id,'staff')}</td>
          </tr>`).join('')}
        </tbody></table></div>
      </div>
    </div>`;
  const form = qs('#staffForm', root);
  form.onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(form);
    const item = {
      id: String(fd.get('editId') || uid('SF')),
      name: String(fd.get('name')).trim(),
      role: String(fd.get('role')).trim(),
      department: String(fd.get('department')).trim(),
      canEnterMarks: String(fd.get('canEnterMarks')) === 'true',
      canTakeAttendance: String(fd.get('canTakeAttendance')) === 'true',
      status: String(fd.get('status'))
    };
    upsertById(state.staff, item); saveAndRefresh();
  };
  qs('#staffCancelBtn', root).onclick = () => clearForm(form);
  wireActions(root, {
    'edit-staff': id => {
      const s = state.staff.find(x=>x.id===id); if (!s) return;
      fillForm(form, {...s, canEnterMarks: String(!!s.canEnterMarks), canTakeAttendance: String(!!s.canTakeAttendance)}); qs('[name="editId"]', form).value = s.id;
    },
    'delete-staff': id => { if (!confirmDelete('staff entry')) return; removeById(state.staff, id); saveAndRefresh(); }
  });
}

function renderCourses() {
  const root = qs('#courses');
  const rows = state.courses.filter(c => JSON.stringify(c).toLowerCase().includes(currentSearch()));
  root.innerHTML = `
    <div class="grid-2">
      <div class="card">
        ${formHeader('Course form', 'Save, modify and delete enabled')}
        <form id="courseForm" class="form-grid">
          <input type="hidden" name="editCode" />
          <label>Course code <input name="code" required /></label>
          <label>Course title <input name="title" required /></label>
          <label>Faculty <select name="facultyId">${state.faculties.map(f=>`<option value="${f.id}">${escapeHtml(f.name)}</option>`).join('')}</select></label>
          <label>Program <select name="programId">${state.programs.map(p=>`<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('')}</select></label>
          <label>Level <input name="level" value="100" required /></label>
          <label>Semester <select name="semester">${optionize(state.settings.semesters)}</select></label>
          <label>Units <input type="number" name="units" value="3" min="1" /></label>
          <label>Lecturer <input name="lecturer" required /></label>
          <div class="toolbar left-align">
            <button class="btn btn-primary" type="submit">Save course</button>
            <button class="btn btn-soft" type="button" id="courseCancelBtn">Clear</button>
          </div>
        </form>
      </div>
      <div class="card">
        ${formHeader('Course catalog', `${rows.length} shown`)}
        <div class="table-wrap"><table><thead><tr><th>Code</th><th>Course</th><th>Program</th><th>Semester</th><th>Lecturer</th><th>Actions</th></tr></thead><tbody>
          ${rows.map(c=>`<tr>
            <td>${escapeHtml(c.code)}</td>
            <td>${escapeHtml(c.title)}<div class="mini">${escapeHtml(String(c.units))} units</div></td>
            <td>${escapeHtml(getProgram(c.programId)?.name||'')}</td>
            <td>${escapeHtml(c.semester)} • Level ${escapeHtml(c.level)}</td>
            <td>${escapeHtml(c.lecturer)}</td>
            <td>${actionButtons(c.code,'course')}</td>
          </tr>`).join('')}
        </tbody></table></div>
      </div>
    </div>`;
  const form = qs('#courseForm', root);
  form.onsubmit = e => {
    e.preventDefault();
    const fd=new FormData(form);
    const oldCode = String(fd.get('editCode') || '');
    const item = {
      code: String(fd.get('code')).trim(),
      title: String(fd.get('title')).trim(),
      facultyId: String(fd.get('facultyId')),
      programId: String(fd.get('programId')),
      level: String(fd.get('level')).trim(),
      semester: String(fd.get('semester')),
      units: Number(fd.get('units')),
      lecturer: String(fd.get('lecturer')).trim()
    };
    if (oldCode && oldCode !== item.code) {
      const idx = state.courses.findIndex(c => c.code === oldCode);
      if (idx >= 0) state.courses[idx] = item;
      state.enrollments.forEach(e => { if (e.courseCode === oldCode) e.courseCode = item.code; });
      state.attendanceRecords.forEach(r => { if (r.courseCode === oldCode) r.courseCode = item.code; });
      state.assessmentLedger.forEach(r => { if (r.courseCode === oldCode) r.courseCode = item.code; });
      state.examLedger.forEach(r => { if (r.courseCode === oldCode) r.courseCode = item.code; });
      state.timetableSlots.forEach(r => { if (r.courseCode === oldCode) r.courseCode = item.code; });
    } else {
      const idx = state.courses.findIndex(c => c.code === item.code);
      if (idx >= 0) state.courses[idx] = item; else state.courses.push(item);
    }
    saveAndRefresh();
  };
  qs('#courseCancelBtn', root).onclick = () => clearForm(form);
  wireActions(root, {
    'edit-course': id => {
      const c = state.courses.find(x=>x.code===id); if (!c) return;
      fillForm(form, {...c, editCode: c.code});
      qs('[name="editCode"]', form).value = c.code;
    },
    'delete-course': id => {
      if (!confirmDelete('course')) return;
      state.courses = state.courses.filter(c => c.code !== id);
      state.enrollments = state.enrollments.filter(e => e.courseCode !== id);
      state.attendanceRecords = state.attendanceRecords.filter(e => e.courseCode !== id);
      state.assessmentLedger = state.assessmentLedger.filter(e => e.courseCode !== id);
      state.examLedger = state.examLedger.filter(e => e.courseCode !== id);
      state.timetableSlots = state.timetableSlots.filter(e => e.courseCode !== id);
      saveAndRefresh();
    }
  });
}

function renderEnrollment() {
  const root = qs('#enrollment');
  const programs = state.programs;
  const selectedProgramId = programs[0]?.id || '';
  const selectedSemester = state.settings.semesters[0];
  root.innerHTML = `
    <div class="grid-2">
      <div class="card">
        ${formHeader('Bulk enrollment', 'Tick many students and many courses once')}
        <form id="bulkEnrollForm" class="panel-stack">
          <div class="form-grid">
            <label>Program <select name="programId" id="bulkEnrollProgram">${programs.map(p=>`<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('')}</select></label>
            <label>Semester <select name="semester" id="bulkEnrollSemester">${optionize(state.settings.semesters, selectedSemester)}</select></label>
            <label>Academic year <input name="academicYear" value="${escapeHtml(state.settings.currentAcademicYear)}" /></label>
          </div>
          <div class="grid-2">
            <div><div class="toolbar"><strong>Students</strong><button type="button" class="btn btn-soft small" id="selectAllStudentsBtn">Select all</button></div><div id="bulkStudentList" class="check-grid"></div></div>
            <div><div class="toolbar"><strong>Courses</strong><button type="button" class="btn btn-soft small" id="selectAllCoursesBtn">Select all</button></div><div id="bulkCourseList" class="check-grid"></div></div>
          </div>
          <button class="btn btn-primary" type="submit">Save bulk enrollment</button>
        </form>
      </div>
      <div class="card">
        ${formHeader('Enrollment records', `${state.enrollments.length} records`)}
        <div class="table-wrap"><table><thead><tr><th>Student</th><th>Course</th><th>Semester</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${state.enrollments.map(e=>`<tr>
          <td>${escapeHtml(getStudent(e.studentId)?.name||'')}<div class="mini">${escapeHtml(getStudent(e.studentId)?.admissionNo||'')}</div></td>
          <td>${escapeHtml(getCourse(e.courseCode)?.title || e.courseCode)}</td>
          <td>${escapeHtml(e.semester)}</td>
          <td>${badge(e.status)}</td>
          <td>${actionButtons(e.id,'enroll', `<button type="button" class="btn btn-soft small" data-action="status-enroll" data-id="${e.id}">Change status</button>`)}</td>
        </tr>`).join('')}</tbody></table></div>
      </div>
    </div>`;
  function refreshBulkEnrollmentChoices() {
    const programId = qs('#bulkEnrollProgram', root).value;
    const semester = qs('#bulkEnrollSemester', root).value;
    const studs = matchingStudents(programId, semester);
    const courses = matchingCourses(programId, semester);
    qs('#bulkStudentList', root).innerHTML = studs.map(s=>`<label class="check-card"><input type="checkbox" name="studentIds" value="${s.id}" /><div><strong>${escapeHtml(s.name)}</strong><div class="mini">${escapeHtml(s.admissionNo)} • Level ${escapeHtml(s.level)}</div></div></label>`).join('');
    qs('#bulkCourseList', root).innerHTML = courses.map(c=>`<label class="check-card"><input type="checkbox" name="courseCodes" value="${c.code}" /><div><strong>${escapeHtml(c.code)} • ${escapeHtml(c.title)}</strong><div class="mini">${escapeHtml(c.semester)} • ${escapeHtml(String(c.units))} units</div></div></label>`).join('');
  }
  refreshBulkEnrollmentChoices();
  qs('#bulkEnrollProgram', root).onchange = refreshBulkEnrollmentChoices;
  qs('#bulkEnrollSemester', root).onchange = refreshBulkEnrollmentChoices;
  qs('#selectAllStudentsBtn', root).onclick = () => qsa('#bulkStudentList input', root).forEach(i=>i.checked=true);
  qs('#selectAllCoursesBtn', root).onclick = () => qsa('#bulkCourseList input', root).forEach(i=>i.checked=true);
  qs('#bulkEnrollForm', root).onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const studentIds = fd.getAll('studentIds').map(String);
    const courseCodes = fd.getAll('courseCodes').map(String);
    const semester = String(fd.get('semester'));
    const academicYear = String(fd.get('academicYear'));
    studentIds.forEach(studentId => courseCodes.forEach(courseCode => {
      const exists = state.enrollments.find(x=>x.studentId===studentId && x.courseCode===courseCode && x.semester===semester);
      if (!exists) state.enrollments.push({ id: uid('ENR'), studentId, courseCode, semester, academicYear, status: 'Enrolled' });
    }));
    saveAndRefresh();
  };
  wireActions(root, {
    'delete-enroll': id => { if (!confirmDelete('enrollment')) return; removeById(state.enrollments, id); saveAndRefresh(); },
    'edit-enroll': id => {
      const item = state.enrollments.find(x=>x.id===id); if (!item) return;
      const semester = prompt('Semester', item.semester); if (semester === null) return;
      item.semester = semester;
      item.academicYear = prompt('Academic year', item.academicYear || state.settings.currentAcademicYear) || item.academicYear;
      saveAndRefresh();
    },
    'status-enroll': id => {
      const item = state.enrollments.find(x=>x.id===id); if (!item) return;
      const status = prompt('Status (Enrolled, Dropped, Deferred)', item.status);
      if (!status) return;
      item.status = status; saveAndRefresh();
    }
  });
}

function renderTimetable() {
  const root = qs('#timetable');
  root.innerHTML = `
    <div class="grid-2">
      <div class="card">
        ${formHeader('Timetable slot form', 'Editable days and slots')}
        <form id="ttForm" class="form-grid">
          <input type="hidden" name="editId" />
          <label>Course <select name="courseCode">${state.courses.map(c=>`<option value="${c.code}">${escapeHtml(c.code)} • ${escapeHtml(c.title)}</option>`).join('')}</select></label>
          <label>Day <select name="day">${optionize(state.settings.timetableDays)}</select></label>
          <label>Start <input name="start" value="08:00" /></label>
          <label>End <input name="end" value="10:00" /></label>
          <label>Venue <input name="venue" required /></label>
          <label>Lecturer <input name="lecturer" required /></label>
          <div class="toolbar left-align">
            <button class="btn btn-primary" type="submit">Save slot</button>
            <button class="btn btn-soft" type="button" id="ttCancelBtn">Clear</button>
          </div>
        </form>
      </div>
      <div class="card">
        ${formHeader('Timetable', `${state.timetableSlots.length} slots`)}
        <div class="table-wrap"><table><thead><tr><th>Course</th><th>Day</th><th>Time</th><th>Venue</th><th>Actions</th></tr></thead><tbody>
          ${state.timetableSlots.map(t=>`<tr>
            <td>${escapeHtml(t.courseCode)}<div class="mini">${escapeHtml(getCourse(t.courseCode)?.title||'')}</div></td>
            <td>${escapeHtml(t.day)}</td>
            <td>${escapeHtml(t.start)} - ${escapeHtml(t.end)}</td>
            <td>${escapeHtml(t.venue)}</td>
            <td>${actionButtons(t.id,'tt')}</td>
          </tr>`).join('')}
        </tbody></table></div>
      </div>
    </div>`;
  const form = qs('#ttForm', root);
  form.onsubmit = e => {
    e.preventDefault();
    const fd=new FormData(form); const course=getCourse(String(fd.get('courseCode'))); if (!course) return;
    const item = {
      id: String(fd.get('editId') || uid('TT')),
      courseCode: course.code,
      facultyId: course.facultyId,
      programId: course.programId,
      level: course.level,
      semester: course.semester,
      day: String(fd.get('day')),
      start: String(fd.get('start')),
      end: String(fd.get('end')),
      venue: String(fd.get('venue')),
      lecturer: String(fd.get('lecturer'))
    };
    upsertById(state.timetableSlots, item); saveAndRefresh();
  };
  qs('#ttCancelBtn', root).onclick = () => clearForm(form);
  wireActions(root, {
    'edit-tt': id => { const t = state.timetableSlots.find(x=>x.id===id); if (!t) return; fillForm(form, t); qs('[name="editId"]', form).value=t.id; },
    'delete-tt': id => { if (!confirmDelete('timetable slot')) return; removeById(state.timetableSlots, id); saveAndRefresh(); }
  });
}

function renderAttendance() {
  const root = qs('#attendance');
  root.innerHTML = `
    <div class="grid-2">
      <div class="card">
        ${formHeader('Bulk attendance', 'Mark a full class at once')}
        <form id="attendanceFilterForm" class="form-grid">
          <label>Course <select name="courseCode" id="attendanceCourse">${state.courses.map(c=>`<option value="${c.code}">${escapeHtml(c.code)} • ${escapeHtml(c.title)}</option>`).join('')}</select></label>
          <label>Date <input type="date" name="date" value="${today()}" /></label>
          <label>Taken by <input name="takenBy" value="${escapeHtml(currentUser.name || '')}" /></label>
          <div><button id="attendanceLoadBtn" class="btn btn-soft" type="button">Load class</button></div>
        </form>
        <div id="attendanceBulkArea"></div>
      </div>
      <div class="card">
        ${formHeader('Attendance records', `${state.attendanceRecords.length} records`)}
        <div class="table-wrap"><table><thead><tr><th>Student</th><th>Course</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          ${state.attendanceRecords.map(r=>`<tr>
            <td>${escapeHtml(getStudent(r.studentId)?.name||'')}</td>
            <td>${escapeHtml(r.courseCode)}</td>
            <td>${escapeHtml(r.date)}</td>
            <td>${badge(r.status)}</td>
            <td>${actionButtons(r.id,'att')}</td>
          </tr>`).join('')}
        </tbody></table></div>
      </div>
    </div>`;
  qs('#attendanceLoadBtn', root).onclick = () => {
    const courseCode = qs('#attendanceCourse', root).value;
    const students = state.enrollments.filter(e=>e.courseCode===courseCode && e.status==='Enrolled').map(e=>getStudent(e.studentId)).filter(Boolean);
    qs('#attendanceBulkArea', root).innerHTML = `<form id="attendanceBulkForm" class="panel-stack">${students.map(s=>`<div class="check-card"><div style="flex:1"><strong>${escapeHtml(s.name)}</strong><div class="mini">${escapeHtml(s.admissionNo)}</div></div><select name="status_${s.id}">${optionize(state.settings.attendanceStatuses,'Present')}</select><input name="note_${s.id}" placeholder="Optional note" /></div>`).join('')}<button class="btn btn-primary" type="submit">Save bulk attendance</button></form>`;
    qs('#attendanceBulkForm', root).onsubmit = e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const meta = new FormData(qs('#attendanceFilterForm', root));
      students.forEach(s => state.attendanceRecords.push({ id: uid('ATT'), studentId: s.id, courseCode, date: String(meta.get('date')), status: String(fd.get(`status_${s.id}`)), takenBy: String(meta.get('takenBy')), note: String(fd.get(`note_${s.id}`)||'') }));
      saveAndRefresh();
    };
  };
  wireActions(root, {
    'edit-att': id => {
      const r = state.attendanceRecords.find(x=>x.id===id); if (!r) return;
      const status = prompt('Attendance status', r.status); if (!status) return;
      r.status = status; r.note = prompt('Note', r.note || '') ?? r.note; saveAndRefresh();
    },
    'delete-att': id => { if (!confirmDelete('attendance record')) return; removeById(state.attendanceRecords, id); saveAndRefresh(); }
  });
}

function renderBulkMarkModule(targetId, label, ledgerKey, category) {
  const root = qs('#' + targetId);
  const examTypes = state.examTypes.filter(x => x.category === category);
  root.innerHTML = `
    <div class="grid-2">
      <div class="card">
        ${formHeader(`Bulk ${label.toLowerCase()} entry`, 'Fast data entry per course')}
        <form id="${targetId}FilterForm" class="form-grid">
          <label>Course <select name="courseCode" id="${targetId}Course">${state.courses.map(c=>`<option value="${c.code}">${escapeHtml(c.code)} • ${escapeHtml(c.title)}</option>`).join('')}</select></label>
          <label>Exam type <select name="examTypeId" id="${targetId}ExamType">${examTypes.map(e=>`<option value="${e.id}">${escapeHtml(e.name)} (${e.weight}%)</option>`).join('')}</select></label>
          <label>Date <input type="date" name="date" value="${today()}" /></label>
          <label>Entered by <input name="enteredBy" value="${escapeHtml(currentUser.name || '')}" /></label>
          <label>Release immediately <select name="released"><option value="true">Yes</option><option value="false">No</option></select></label>
          <div><button class="btn btn-soft" type="button" id="${targetId}LoadBtn">Load students</button></div>
        </form>
        <div id="${targetId}BulkRows" class="panel-stack"></div>
      </div>
      <div class="card">
        ${formHeader(`${label} ledger`, `${state[ledgerKey].length} records`)}
        <div class="table-wrap"><table><thead><tr><th>Student</th><th>Course</th><th>Type</th><th>Score</th><th>Released</th><th>Actions</th></tr></thead><tbody>
          ${state[ledgerKey].map(r=>`<tr>
            <td>${escapeHtml(getStudent(r.studentId)?.name||'')}<div class="mini">${escapeHtml(getStudent(r.studentId)?.admissionNo||'')}</div></td>
            <td>${escapeHtml(r.courseCode)}</td>
            <td>${escapeHtml(getExamType(r.examTypeId)?.name||'')}</td>
            <td>${escapeHtml(String(r.score))}</td>
            <td>${badge(r.released ? 'Released' : 'Draft')}</td>
            <td>${actionButtons(r.id, targetId)}</td>
          </tr>`).join('')}
        </tbody></table></div>
      </div>
    </div>`;
  qs(`#${targetId}LoadBtn`, root).onclick = () => {
    const courseCode = qs(`#${targetId}Course`, root).value;
    const students = state.enrollments.filter(e => e.courseCode===courseCode && e.status==='Enrolled').map(e => getStudent(e.studentId)).filter(Boolean);
    qs(`#${targetId}BulkRows`, root).innerHTML = `<form id="${targetId}BulkForm" class="panel-stack">${students.map(s=>`<div class="check-card"><input type="checkbox" name="studentIds" value="${s.id}" checked /><div style="flex:1"><strong>${escapeHtml(s.name)}</strong><div class="mini">${escapeHtml(s.admissionNo)}</div></div><input type="number" name="score_${s.id}" placeholder="Score" min="0" max="100" step="0.01" /></div>`).join('')}<button class="btn btn-primary" type="submit">Save bulk ${label.toLowerCase()}</button></form>`;
    const form = qs(`#${targetId}BulkForm`, root);
    if (!form) return;
    form.onsubmit = e => {
      e.preventDefault();
      const fd = new FormData(form); const meta = new FormData(qs(`#${targetId}FilterForm`, root));
      const examTypeId = String(meta.get('examTypeId')); const enteredBy = String(meta.get('enteredBy')); const date = String(meta.get('date')); const released = String(meta.get('released')) === 'true';
      fd.getAll('studentIds').map(String).forEach(studentId => {
        const score = Number(fd.get(`score_${studentId}`) || 0);
        state[ledgerKey].push({ id: uid(ledgerKey==='assessmentLedger'?'AL':'EL'), studentId, courseCode, examTypeId, score, enteredBy, date, released });
      });
      saveAndRefresh();
    };
  };
  wireActions(root, {
    [`edit-${targetId}`]: id => {
      const r = state[ledgerKey].find(x=>x.id===id); if (!r) return;
      const val = prompt('Score', r.score); if (val===null) return;
      r.score = Number(val); r.released = confirm('Mark as released?'); saveAndRefresh();
    },
    [`delete-${targetId}`]: id => { if (!confirmDelete(label.toLowerCase() + ' record')) return; removeById(state[ledgerKey], id); saveAndRefresh(); }
  });
}
function renderAssessments() { renderBulkMarkModule('assessments','Assessment','assessmentLedger','CA'); }
function renderExams() { renderBulkMarkModule('exams','Examination','examLedger','Exam'); }

function renderFees() {
  updateStudentBalances();
  const root = qs('#fees');
  const purposeTotals = (state.settings.feePurposes || []).map(name => ({
    name,
    total: state.feeCollections.filter(r => r.purpose === name).reduce((s,r)=>s+Number(r.amount||0),0)
  }));
  root.innerHTML = `<div class="panel-stack">
    <div class="grid-4">
      <div class="card hero-card"><div class="mini">Collections</div><div class="stat-value">${currency(state.feeCollections.reduce((s,x)=>s+Number(x.amount||0),0))}</div><div class="mini">Modern fee tracking with purpose intelligence</div></div>
      <div class="card"><div class="mini">Receipts issued</div><div class="stat-value">${state.feeCollections.length}</div><div class="mini">${escapeHtml(state.settings.aiExperienceLabel || 'AI-ready operations')}</div></div>
      <div class="card"><div class="mini">Tracked purposes</div><div class="stat-value">${(state.settings.feePurposes || []).length}</div><div class="mini">Admission, health, transcript, internship and more</div></div>
      <div class="card"><div class="mini">Outstanding balance</div><div class="stat-value">${currency(state.students.reduce((s,student)=>s+outstandingFees(student),0))}</div><div class="mini">Live student balance aggregation</div></div>
    </div>
    <div class="grid-2">
      <div class="card">
        ${formHeader('Fee payment form', 'Save, modify and delete enabled')}
        <form id="paymentForm" class="form-grid">
          <input type="hidden" name="editId" />
          <label>Student <select name="studentId">${state.students.map(s=>`<option value="${s.id}">${escapeHtml(s.admissionNo)} • ${escapeHtml(s.name)}</option>`).join('')}</select></label>
          <label>Amount <input type="number" name="amount" required /></label>
          <label>Method <select name="method"><option>Cash</option><option>Mobile Money</option><option>Bank Deposit</option></select></label>
          <label>Purpose <select name="purpose" id="feePurposeSelect">${feePurposeOptions('Admission Fee')}</select></label>
          <label id="otherPurposeWrap" class="hidden">Other purpose <input name="otherPurpose" placeholder="Type fee purpose" /></label>
          <label>Date <input type="date" name="date" value="${today()}" /></label>
          <label>Received by <input name="receivedBy" value="${escapeHtml(currentUser.name || '')}" /></label>
          <div class="toolbar left-align">
            <button class="btn btn-primary" type="submit">Save payment</button>
            <button class="btn btn-soft" type="button" id="paymentCancelBtn">Clear</button>
          </div>
        </form>
        <hr class="sep" />
        <div class="purpose-chip-row">${(state.settings.feePurposes || []).map(p=>`<span class="badge info">${escapeHtml(p)}</span>`).join('')}</div>
      </div>
      <div class="card">
        ${formHeader('Fee purpose analytics', 'Best-practice bursary categories')}
        <div class="purpose-grid">${purposeTotals.map(item=>`<div class="purpose-stat"><strong>${escapeHtml(item.name)}</strong><span>${currency(item.total)}</span></div>`).join('')}</div>
      </div>
    </div>
    <div class="card">
      ${formHeader('Receipts and payment history', 'Latest purpose-tagged payments')}
      <div class="table-wrap"><table><thead><tr><th>Receipt</th><th>Student</th><th>Amount</th><th>Purpose</th><th>Method</th><th>Date</th><th>Actions</th></tr></thead><tbody>
        ${state.feeCollections.map(r=>`<tr>
          <td>${escapeHtml(r.id)}</td>
          <td>${escapeHtml(studentName(r.studentId))}</td>
          <td>${currency(r.amount)}</td>
          <td>${escapeHtml(r.purpose)}</td>
          <td>${escapeHtml(r.method)}</td>
          <td>${escapeHtml(r.date)}</td>
          <td>${actionButtons(r.id,'fee')}</td>
        </tr>`).join('')}
      </tbody></table></div>
    </div>
  </div>`;
  const form = qs('#paymentForm', root);
  const sel = qs('#feePurposeSelect', root);
  const toggleOther = () => {
    const isOther = sel.value === 'Other';
    qs('#otherPurposeWrap', root).classList.toggle('hidden', !isOther);
  };
  sel.onchange = toggleOther; toggleOther();
  form.onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(form);
    let purpose = String(fd.get('purpose'));
    if (purpose === 'Other') purpose = String(fd.get('otherPurpose') || '').trim() || 'Other';
    const item = {
      id: String(fd.get('editId') || nextReceiptId()),
      studentId: String(fd.get('studentId')),
      amount: Number(fd.get('amount') || 0),
      method: String(fd.get('method')),
      purpose,
      date: String(fd.get('date')),
      receivedBy: String(fd.get('receivedBy'))
    };
    upsertById(state.feeCollections, item); saveAndRefresh();
  };
  qs('#paymentCancelBtn', root).onclick = () => clearForm(form);
  wireActions(root, {
    'edit-fee': id => {
      const r = state.feeCollections.find(x=>x.id===id); if (!r) return;
      const standard = (state.settings.feePurposes || []).includes(r.purpose) ? r.purpose : 'Other';
      fillForm(form, {...r, purpose: standard, otherPurpose: standard === 'Other' ? r.purpose : ''});
      qs('[name="editId"]', form).value = r.id;
      toggleOther();
    },
    'delete-fee': id => { if (!confirmDelete('fee payment')) return; removeById(state.feeCollections, id); saveAndRefresh(); }
  });
}

function idCardHtml(student) {
  if (!student) return '<div class="card">No student selected.</div>';
  const program = getProgram(student.programId)?.name || '';
  const faculty = getFaculty(student.facultyId)?.name || '';
  const template = idTemplateSrc();
  const levelCode = `${String(program).slice(0,3).toUpperCase() || 'SLU'}L-${escapeHtml(student.level)}`;
  return `
    <div class="id-template-scene">
      <div class="id-template-card final-id-card" id="idCardCanvas">
        <img class="id-template-base" src="${template}" alt="ID template" />
        <div class="id-template-photo final-photo">${student.photoDataUrl ? `<img src="${student.photoDataUrl}" alt="student photo" />` : `<span>${escapeHtml(initials(student.name))}</span>`}</div>
        <div class="final-id-name">${escapeHtml(student.name)}</div>
        <div class="final-id-number">${escapeHtml(student.admissionNo)}</div>
        <div class="final-id-dept">${escapeHtml(faculty.replace(/^Faculty of /i, '').toUpperCase() || 'GENERAL STUDIES')}</div>
        <div class="final-id-program">${escapeHtml(levelCode)}</div>
        <div class="final-id-expiry">AUGUST ${new Date().getFullYear()+1}</div>
        <div class="final-id-barcode">${escapeHtml(barcodeText(student))}</div>
      </div>
    </div>`;
}

function renderIdCards() {
  const root = qs('#idcards');
  const selected = currentUser.role === 'student' ? studentByCurrentUser() : state.students[0];
  root.innerHTML = `<div class="grid-2">
    <div class="card">
      ${formHeader('Student ID card', 'Duplicate overlay text removed and final template aligned')}
      ${currentUser.role !== 'student' ? `<label>Select student <select id="idStudentSelect">${state.students.map(s=>`<option value="${s.id}">${escapeHtml(s.admissionNo)} • ${escapeHtml(s.name)}</option>`).join('')}</select></label><hr class="sep" />` : ''}
      <div class="toolbar"><button id="exportIdBtn" class="btn btn-primary">Export ID card PDF</button></div>
    </div>
    <div class="card" id="idCardWrap">${idCardHtml(selected)}</div>
  </div>`;
  const select = qs('#idStudentSelect', root);
  if (select) select.onchange = () => { qs('#idCardWrap', root).innerHTML = idCardHtml(getStudent(select.value)); bindIdPdfButton(); };
  bindIdPdfButton();
}

function renderAnnouncements() {
  const root = qs('#announcements');
  root.innerHTML = `<div class="grid-2">
    <div class="card">
      ${formHeader('Announcement form', 'Save, modify and delete enabled')}
      <form id="annForm" class="form-grid">
        <input type="hidden" name="editId" />
        <label>Title <input name="title" required /></label>
        <label>Audience <input name="audience" value="All Users" /></label>
        <label>Date <input type="date" name="date" value="${today()}" /></label>
        <label style="grid-column:1/-1">Message <textarea name="body" required></textarea></label>
        <div class="toolbar left-align">
          <button class="btn btn-primary" type="submit">Save announcement</button>
          <button class="btn btn-soft" type="button" id="annCancelBtn">Clear</button>
        </div>
      </form>
    </div>
    <div class="card">
      ${formHeader('Announcements', `${state.announcements.length} posts`)}
      <div class="list">${state.announcements.map(a=>`<div class="list-item">
        <div><strong>${escapeHtml(a.title)}</strong><div class="mini">${escapeHtml(a.body)}</div></div>
        <div>
          <div class="mini">${escapeHtml(a.audience)}<br>${escapeHtml(a.date)}</div>
          ${actionButtons(a.id,'ann')}
        </div>
      </div>`).join('')}</div>
    </div>
  </div>`;
  const form = qs('#annForm', root);
  form.onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(form);
    const item = { id: String(fd.get('editId') || uid('AN')), title:String(fd.get('title')), audience:String(fd.get('audience')), date:String(fd.get('date')), body:String(fd.get('body')) };
    upsertById(state.announcements, item); saveAndRefresh();
  };
  qs('#annCancelBtn', root).onclick = () => clearForm(form);
  wireActions(root, {
    'edit-ann': id => { const a = state.announcements.find(x=>x.id===id); if (!a) return; fillForm(form, a); qs('[name="editId"]', form).value = a.id; },
    'delete-ann': id => { if (!confirmDelete('announcement')) return; removeById(state.announcements, id); saveAndRefresh(); }
  });
}
