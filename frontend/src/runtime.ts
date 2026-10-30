// @ts-nocheck
// Compatibility renderer extracted verbatim from the supplied HTML. Strict typed API, state and router live in adjacent modules.
import type {Bootstrap} from './types';
import type {RuntimeBridge,LegacyRuntime} from './state/bridge';
import {mountMoney} from './views/plus/money';
import {request} from './api/client';
import {renderAuth} from './views/auth/login';
import {routeChanged,loginRoute} from './router';
export function mountRuntime(bootstrap:Bootstrap|null,bridge:RuntimeBridge):LegacyRuntime {
const emptyDemo={employees:[],accounts:[],v:3,progress:{},decl:{},dependents:{},sign:[],signTpls:[],posts:[],groups:[],swaps:[],roster:{},published:false};
const initial=bootstrap||{demo:emptyDemo,live:{v:1,data:{resp:[]},seq:{},settings:{empPrefix:'BC-',quotas:{'Casual leave':12},acc:{},answered:{},adv:{ratingHigh:4,ratingLow:2,eligMonths:12,eligRating:4,ffDays:30,minGroup:5}},audit:[]},user:null,computed:{}};
let COMPUTED=initial.computed||{};
let CONVERT_SOURCE=null;

    /* =================== ICONS =================== */
    const I = {
      home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
      dashboard: '<path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z"/>',
      user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
      users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
      org: '<rect x="9" y="2" width="6" height="5" rx="1"/><rect x="2" y="17" width="6" height="5" rx="1"/><rect x="16" y="17" width="6" height="5" rx="1"/><path d="M12 7v5M5 17v-3h14v3"/>',
      login: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>',
      logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
      leave: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      pay: '<rect x="2" y="6" width="20" height="13" rx="2"/><circle cx="12" cy="12.5" r="2.5"/><path d="M6 10v5M18 10v5"/>',
      receipt: '<path d="M4 2v20l3-2 3 2 2-2 2 2 3-2 3 2V2l-3 2-3-2-2 2-2-2-3 2z"/><path d="M8 9h8M8 13h6"/>',
      heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
      briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>',
      chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-7"/>',
      learn: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
      doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
      laptop: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20"/>',
      chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
      mega: '<path d="m3 11 18-8v18L3 13z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
      gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
      shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
      moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
      bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
      download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
      upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
      search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
      x: '<path d="M18 6 6 18M6 6l12 12"/>',
      edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/>',
      trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
      gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v9H5v-9M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
      check: '<path d="M20 6 9 17l-5-5"/>',
      inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/>',
      list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
      grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
      pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/><path d="m15 5 3 3"/>',
      calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h2M14 14h2M8 18h2"/>',
      swap: '<path d="m17 3 4 4-4 4"/><path d="M3 7h18"/><path d="m7 21-4-4 4-4"/><path d="M21 17H3"/>',
      arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
      chev: '<path d="m9 6 6 6-6 6"/>',
      thumb: '<path d="M7 10v11H3V10z"/><path d="M7 10l4-8a3 3 0 0 1 3 3v4h5.5a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 18.1 21H7"/>',
      send: '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>',
      star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>'
    };
    const ic = (n, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || I.doc}</svg>`;

    /* =================== HELPERS =================== */
    const AVC = ['#2457F5', '#14B8E6', '#7C5CFF', '#0FA37F', '#E0811D', '#D9466F', '#3B82C4', '#6366F1'];
    const avc = s => AVC[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % AVC.length];
    const ini = n => n.split(' ').map(x => x[0]).slice(0, 2).join('');
    const av = (n, c = '') => `<span class="av ${c}" style="background:${avc(n)}">${ini(n)}</span>`;
    const inr = n=>'₹'+Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:2});
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const todayISO = () => new Date().toISOString().slice(0, 10);
    const fd = s => { if (!s) return '—'; const d = new Date(s + 'T00:00:00'); return isNaN(d) ? s : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) };
    const fdShort = s => { const d = new Date(s + 'T00:00:00'); return isNaN(d) ? s : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
    const uid = () => Math.random().toString(36).slice(2, 8);
    function weekdays(a, b) { let d = new Date(a + 'T00:00:00'), e = new Date(b + 'T00:00:00'), n = 0; if (e < d) return 0; while (d <= e) { const w = d.getDay(); if (w && w !== 6) n++; d.setDate(d.getDate() + 1) } return n }
    const PILL = { 'Awaiting signature': 'warn', Viewed: 'info', Declined: 'bad', Voided: 'mute', Expired: 'mute', Active: 'ok', Approved: 'ok', Resolved: 'ok', Hired: 'ok', Present: 'ok', Completed: 'ok', Issued: 'ok', Paid: 'ok', Accepted: 'ok', Verified: 'ok', Published: 'ok', Assigned: 'ok', Acknowledged: 'ok', Open: 'warn', Pending: 'warn', 'Due soon': 'warn', Late: 'warn', 'In repair': 'warn', 'Not submitted': 'warn', Submitted: 'info', Probation: 'info', 'In progress': 'info', 'In stock': 'info', Remote: 'info', Locked: 'bad', Disabled: 'mute', Interview: 'info', Screening: 'info', Offer: 'info', Draft: 'mute', 'On leave': 'mute', 'Not started': 'mute', Closed: 'mute', Withdrawn: 'mute', Applied: 'mute', Cancelled: 'mute', 'Notice period': 'bad', Rejected: 'bad', Absent: 'bad', Inactive: 'bad', Urgent: 'bad', High: 'warn', Normal: 'mute', Retired: 'mute' };
    const pill = s => `<span class="pill p-${PILL[s] || 'mute'}">${esc(s)}</span>`;
    const BANDV = ['m_wfa', 'suiteDash', 'adminDash', 'recruitDash', 'payrollDash', 'expenseDash', 'signDash', 'learnDash'];
    const head = (t, p, a = '') => { const band = BANDV.includes(current); const ap = USER ? APP(CURAPP)[1] : ''; return `<div class="head${band ? ' band' : ''}"><div>${ap ? `<span class="eyebrow">${esc(ap)}</span>` : ''}<h1>${t}</h1><p>${p}</p></div><div class="actions">${a}</div></div>` };
    const btn = (label, fn, cls = '', icon = '') => `<button class="btn ${cls}" onclick="${fn}">${icon ? ic(icon, 16) : ''}${label}</button>`;
    const stat = (icon, k, v, d, cls = '') => `<div class="card stat"><div class="k"><i>${ic(icon, 16)}</i>${k}</div><div class="v">${v}</div><div class="d ${cls}">${d}</div></div>`;
    const bar = (p) => `<div class="bar"><span style="width:${Math.max(0, Math.min(100, p))}%"></span></div>`;
    function tbl(cols, rows, empty = 'Nothing here yet.') {
      return `<div class="table-wrap"><table><thead><tr>${cols.map(c => `<th>${c[0]}</th>`).join('')}</tr></thead><tbody>${rows.length ? rows.map(r => `<tr>${cols.map(c => `<td>${c[1](r)}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${cols.length}"><div class="empty">${empty}</div></td></tr>`}</tbody></table></div>`;
    }
    const card = (title, body, extra = '') => `<div class="card"><h3>${title}${extra}</h3>${body}</div>`;
    const who = (n, sub) => `<div class="who">${av(n)}<div><b>${esc(n)}</b><span>${esc(sub ?? (emp(n)?.role || ''))}</span></div></div>`;
    /* tabs: per-view tab state */
    const TAB = {};
    function tabs(view, list) { const cur = TAB[view] || list[0]; return `<div class="tabs" role="tablist" style="margin-bottom:16px">${list.map(t => `<button role="tab" class="${t === cur ? 'on' : ''}" onclick="TAB['${view}']='${t}';rerender()">${t}</button>`).join('')}</div>` }
    const tabOf = (view, list) => TAB[view] || list[0];

    /* =================== STATE =================== */
    let ME = 'Rahul Varma', ADMIN = 'Ananya Rao', USER = null;
    function seed(){return structuredClone(initial.demo)}
    let S;
    S=structuredClone(initial.demo)
    if (!S || !S.employees) S = seed();
    { const D = seed();['sign', 'signTpls', 'posts', 'groups', 'swaps', 'roster', 'published'].forEach(k => { if (S[k] === undefined) S[k] = D[k] }); if (Object.keys(S.progress || {}).length < 4) S.progress = { ...D.progress, ...S.progress } }
    const mail = n => n.toLowerCase().replace(/[^a-z ]/g, '').trim().replace(/\s+/g, '.') + '@brightcone.ai';
    function addAccount(e, role = 'Employee') { e.email = e.email || mail(e.name); if (!S.accounts.some(a => a.email === e.email)) S.accounts.push({ email: e.email, name: e.name, role, pass: role === 'HR Admin' ? 'Admin@123' : 'Welcome@123', status: 'Active', fails: 0, last: null }) }
    function initAccounts() { S.accounts = []; S.employees.forEach(e => addAccount(e, e.name === 'Ananya Rao' ? 'HR Admin' : 'Employee')) }
    const STATE_V = 3;
    function migrate() {
      // Normalise every work email to firstname.lastname@brightcone.ai and rebuild accounts,
      // keeping any role, status, password and last sign-in already set for that person.
      const prev = {}; (S.accounts || []).forEach(a => prev[a.name] = a);
      S.employees.forEach(e => { e.email = mail(e.name) });
      S.accounts = S.employees.map(e => {
        const p = prev[e.name] || {}; const role = p.role || (e.name === 'Ananya Rao' ? 'HR Admin' : 'Employee');
        return { email: e.email, name: e.name, role, pass: p.pass || (role === 'HR Admin' ? 'Admin@123' : 'Welcome@123'), status: p.status || 'Active', fails: p.fails || 0, last: p.last || null }
      });
      S.v = STATE_V;
    }

    function ensureUser(n) { S.decl[n] = S.decl[n] || { '80C': 0, '80D': 0, 'HRA': 0, '80CCD(1B)': 0, regime: 'New regime', status: 'Not submitted' }; S.dependents[n] = S.dependents[n] || []; S.progress[n] = S.progress[n] || {} }
    function save(){return bridge.scheduleSave({demo:S,live:R})}
    function log(a) { const d = new Date(); S.audit.unshift({ t: d.toISOString().slice(0, 10) + ' ' + d.toTimeString().slice(0, 5), who: USER ? USER.name : 'System', a }); }
    const emp = n => S.employees.find(e => e.name === n);
    const me = () => emp(ME);
    const deptNames = () => S.depts.map(d => d.n);
    const used = (n, t, st = 'Approved') => S.leaves.filter(l => l.emp === n && l.type === t && l.status === st).reduce((a, l) => a + l.days, 0);
    const jobT = id => S.jobs.find(j => j.id === id)?.t || '—';
    const isAdmin = () => S.role === 'admin';

    /* =================== NAV =================== */
    const APPS = [
      ['people', 'People', 'users', '#12A58E', 'Employee records, time off and HR operations'],
      ['recruit', 'Recruit', 'briefcase', '#7C5CFF', 'Jobs, candidates, interviews and offers'],
      ['payroll', 'Payroll', 'pay', '#0F9F6E', 'Payroll runs, salary register and compliance'],
      ['expense', 'Expense', 'receipt', '#E07A1D', 'Claims, approvals and reimbursements'],
      ['sign', 'Sign', 'pen', '#D9466F', 'E-signatures for offers, NDAs and letters'],
      ['connect', 'Connect', 'chat', '#0BA6CC', 'Company feed, kudos and announcements'],
      ['learn', 'Learn', 'learn', '#6366F1', 'Courses, compliance training and skills'],
      ['shift', 'Shift', 'calendar', '#3B82C4', 'Rosters, shift swaps and attendance'],
      ['plus', 'People Plus', 'grid', '#0B6FDB', 'Your whole HR suite on one dashboard']
    ];
    const APP = k => APPS.find(a => a[0] === k) || APPS.at(-1);
    const NAV = {
      admin: {
        plus: [
          ['Suite Overview', [['suiteDash', 'Suite dashboard', 'dashboard'], ['approvals', 'Approvals inbox', 'inbox'], ['reports', 'Reports & analytics', 'chart'], ['m_actions', 'Action center & alerts', 'bell']]],
          ['Strategic HR', [['m_wfa', 'Workforce analytics', 'chart'], ['m_perf', 'Performance management', 'star'], ['m_career', 'Career growth & promotions', 'briefcase'], ['m_eng', 'Engagement analytics', 'heart'], ['m_comp', 'HR compliance dashboard', 'shield']]],
          ['Suite Administration', [['settings', 'Settings & permissions', 'gear'], ['m_access', 'Access control matrix', 'shield'], ['m_backup', 'Data & backup', 'download'], ['audit', 'Audit log', 'list']]]
        ],
        people: [
          ['Overview', [['adminDash', 'People dashboard', 'dashboard']]],
          ['Employee Master & Directory', [['employees', 'Employee master data', 'users'], ['orgStructure', 'Org structure', 'org'], ['m_profile', 'Employee profiles', 'idcard']]],
          ['Lifecycle & Movement', [['onboarding', 'Onboarding & joiners', 'login'], ['m_probation', 'Probation tracking', 'clock'], ['exits', 'Exits & offboarding', 'logout']]],
          ['Time & Attendance', [['leaveAdmin', 'Leave management', 'leave'], ['attendanceAdmin', 'Attendance & shifts', 'clock']]],
          ['HR Services & Records', [['docsAdmin', 'Documents & letters', 'doc'], ['helpAdmin', 'Helpdesk queue', 'chat']]]
        ],
        recruit: [['Overview', [['recruitDash', 'Recruit dashboard', 'dashboard']]], ['Hiring', [['recruitment', 'Pipeline & jobs', 'briefcase']]]],
        payroll: [['Overview', [['payrollDash', 'Payroll dashboard', 'dashboard']]], ['Payroll', [['payrollAdmin', 'Payroll runs', 'pay'], ['benefitsAdmin', 'Benefits', 'heart']]]],
        expense: [['Overview', [['expenseDash', 'Expense dashboard', 'dashboard']]], ['Claims', [['expensesAdmin', 'All claims', 'receipt']]]],
        sign: [['Overview', [['signDash', 'Sign dashboard', 'dashboard']]], ['Documents', [['signDocs', 'Signature requests', 'pen'], ['signTemplates', 'Templates', 'doc']]]],
        connect: [['Overview', [['feed', 'Company feed', 'chat']]], ['Communicate', [['announcements', 'Announcements', 'mega'], ['directory', 'People directory', 'users']]]],
        learn: [['Overview', [['learnDash', 'Learn dashboard', 'dashboard']]], ['Catalogue', [['learningAdmin', 'Courses', 'learn']]]],
        shift: [['Overview', [['shiftRoster', 'Weekly roster', 'calendar']]], ['Manage', [['shiftSwaps', 'Swap requests', 'swap'], ['attendanceAdmin', 'Attendance & shifts', 'clock']]]]
      },
      employee: {
        plus: [
          ['My Workspace', [['home', 'My dashboard', 'home'], ['approvals', 'My approvals & requests', 'inbox']]],
          ['Growth & Development', [['myPerformance', 'Goals & performance', 'star'], ['m_career', 'Career growth', 'briefcase']]]
        ],
        people: [
          ['Me & Records', [['profile', 'My profile', 'user'], ['myDocs', 'Documents & letters', 'doc']]],
          ['Time & Attendance', [['myLeave', 'Leave', 'leave'], ['myAttendance', 'Attendance & clock', 'clock']]],
          ['Workplace & Help', [['myHelp', 'HR helpdesk', 'chat'], ['myExit', 'Resignation & exit', 'logout']]]
        ],
        recruit: [['Careers', [['careers', 'Jobs & referrals', 'briefcase']]]],
        payroll: [['Pay', [['myPay', 'Payslips & tax', 'pay'], ['myBenefits', 'Benefits', 'heart']]]],
        expense: [['Claims', [['myExpenses', 'My expenses', 'receipt']]]],
        sign: [['Documents', [['mySign', 'Documents to sign', 'pen']]]],
        connect: [['Community', [['feed', 'Company feed', 'chat'], ['directory', 'People directory', 'users']]]],
        learn: [['Learning', [['myLearning', 'My learning', 'learn']]]],
        shift: [['Schedule', [['mySchedule', 'My schedule', 'calendar']]]]
      }
    };
    let current, CURAPP = 'plus';
    const navItems = () => Object.values(NAV[S.role]).flatMap(gs => gs.flatMap(g => g[1]));
    const appOf = v=>Object.keys(NAV[S.role]).find(a=>NAV[S.role][a].some(g=>g[1].some(x=>x[0]===v)))||(v?.startsWith('m_')?REG[v.slice(2)]?.app:null)||'plus';
    const home = () => isAdmin() ? 'suiteDash' : 'home';
    function pendingAll() {
      const P = [];
      S.leaves.filter(x => x.status === 'Pending').forEach(x => P.push({ mod: 'Leave', col: 'leaves', id: x.id, emp: x.emp, what: `${x.type}, ${x.days} day${x.days > 1 ? 's' : ''} (${fdShort(x.from)}${x.to !== x.from ? ' to ' + fdShort(x.to) : ''})` }));
      S.regs.filter(x => x.status === 'Pending').forEach(x => P.push({ mod: 'Regularisation', col: 'regs', id: x.id, emp: x.emp, what: `${fdShort(x.date)}, ${x.in} to ${x.out}. ${x.reason}` }));
      S.expenses.filter(x => x.status === 'Pending').forEach(x => P.push({ mod: 'Expense', col: 'expenses', id: x.id, emp: x.emp, what: `${x.cat}, ${inr(x.amt)}. ${x.desc}` }));
      S.assetReqs.filter(x => x.status === 'Pending').forEach(x => P.push({ mod: 'Asset request', col: 'assetReqs', id: x.id, emp: x.emp, what: `${x.item}. ${x.reason}` }));
      S.letters.filter(x => x.status === 'Pending').forEach(x => P.push({ mod: 'Letter', col: 'letters', id: x.id, emp: x.emp, what: `${x.type}, addressed to ${x.to}` }));
      S.resignations.filter(x => x.status === 'Pending').forEach(x => P.push({ mod: 'Resignation', col: 'resignations', id: x.id, emp: x.emp, what: `Proposed last day ${fd(x.lwd)}. ${x.reason}` }));
      S.swaps.filter(x => x.status === 'Pending').forEach(x => P.push({ mod: 'Shift swap', col: 'swaps', id: x.id, emp: x.emp, what: `${fdShort(x.date)}: ${x.from} to ${x.to}${x.with ? ', with ' + x.with : ''}. ${x.reason}` }));
      return P;
    }
    function appBadge(k) {
      if (isAdmin()) {
        if (k === 'plus') return pendingAll().length;
        if (k === 'people') return ['leaves', 'letters', 'resignations', 'assetReqs'].reduce((a, c) => a + S[c].filter(x => x.status === 'Pending').length, 0);
        if (k === 'expense') return S.expenses.filter(x => x.status === 'Pending').length;
        if (k === 'shift') return S.swaps.filter(x => x.status === 'Pending').length + S.regs.filter(x => x.status === 'Pending').length;
        return 0
      }
      if (k === 'sign') return S.sign.filter(g => g.to === ME && SIGN_OPEN.includes(g.status)).length;
      return 0
    }
    function renderNav() {
      const pc = pendingAll().length, A = APP(CURAPP);
      document.getElementById('app').style.setProperty('--ac', A[3]);
      document.getElementById('rapps').innerHTML = APPS.map(([k, n, i, c]) => { const b = appBadge(k); return `<button class="rapp ${k === CURAPP ? 'on' : ''}" style="--ac:${c}" onclick="openApp('${k}')" title="${n}" ${k === CURAPP ? 'aria-current="true"' : ''}><i>${ic(i)}</i><span>${n}</span>${b ? `<em class="bdg">${b}</em>` : ''}</button>` }).join('');
      document.getElementById('apphead').innerHTML = `<i>${ic(A[2], 20)}</i><div><b>${A[1]}</b><span>${isAdmin() ? 'HR Admin' : 'Employee self-service'}</span></div>`;
      document.getElementById('nav').innerHTML = NAV[S.role][CURAPP].map(([g, items], gi) => navGroupHead(g, items, gi) + items.map(([k, l, i]) =>
        `<button class="nav ${k === current ? 'active' : ''}" onclick="go('${k}')" ${k === current ? 'aria-current="page"' : ''}>${ic(i)}${l}${k === 'approvals' && pc ? `<span class="count">${pc}</span>` : ''}</button>`).join('') + '</div>').join('');
      const lbl = NAV[S.role][CURAPP].flatMap(g => g[1]).find(x => x[0] === current)?.[1] || '';
      document.getElementById('crumb').innerHTML = `<span>${A[1]}</span>${ic('chev', 14)}<b>${lbl}</b>`;
      const u = emp(USER.name);
      document.getElementById('sideUser').innerHTML = `${av(u.name)}<div><b>${esc(u.name)}</b><span>${esc(USER.email)}</span></div><button aria-label="Sign out" title="Sign out" onclick="logout()">${ic('logout', 16)}</button>`;
      document.getElementById('me').innerHTML = `${av(u.name)}<div>${u.name}<br><span>${u.role}</span></div>`;
      document.getElementById('bell').innerHTML = ic('bell') + (isAdmin() && pc ? '<span class="dot"></span>' : '');
    }
    function go(v) { if (!USER) { showLogin(); return } if (!navItems().some(x => x[0] === v) && !(isAdmin() && typeof V[v] === 'function')) { if (v) toast('You don’t have access to that page'); v = home() } if (!NAV[S.role][CURAPP]?.some(g => g[1].some(x => x[0] === v))) CURAPP = appOf(v); current = v; routeChanged(CURAPP,current); rerender(); document.getElementById('content').scrollTop = 0; closeAll() }
    function openApp(k) { CURAPP = k; go(NAV[S.role][k][0][1][0][0]) }
    function openLauncher() { modal(`<h2>Brightcone People Plus</h2><p class="sub">Switch between the apps in your HR suite.</p><div class="launch">${APPS.map(([k, n, i, c, d]) => `<button style="--c:${c}" onclick="closeAll();openApp('${k}')"><i>${ic(i)}</i><b>${n}</b><span>${d}</span></button>`).join('')}</div>`); document.getElementById('modal').classList.add('wide') }
    function rerender() { save(); renderNav(); document.getElementById('content').innerHTML = `<div class="view">${V[current]()}</div>`; AFTER[current] && AFTER[current](); }
    /* =================== AUTH =================== */
    const SKEY = 'bc-hr-session';
    let LVIEW = 'signin', LMSG = null;
    function readSession(){return null}
    function writeSession(){}
    function clearSession(){}
    function canLogin(a) { const e = emp(a.name); return a.status === 'Active' && e && e.status !== 'Inactive' }
    function boot(){if(initial.user)enter(initial.user,false);else showLogin()}
    function showLogin() { loginRoute(); USER = null; clearInterval(tick); document.getElementById('app').hidden = true; document.getElementById('login').hidden = false; renderLogin(); paintTheme() }
    function renderLogin(){renderAuth(LVIEW,LMSG)}
    function fillDemo(e, p) { document.getElementById('le').value = e; document.getElementById('lpw').value = p; document.querySelector('#lcard form button[type=submit]').focus() }
    async function doLogin(ev){ev.preventDefault();const email=document.getElementById('le').value.trim().toLowerCase(),pw=document.getElementById('lpw').value,rem=document.getElementById('lrem').checked;try{const data=await bridge.authenticate(email,pw,rem);hydrate(data);enter(data.user,false);toast('Welcome back, '+data.user.name.split(' ')[0]);history.replaceState(null,'','/plus/'+home())}catch(error){LMSG=['lerr',esc(error.message)];renderLogin();document.getElementById('le').value=email}}
    async function forgot(ev){ev.preventDefault();try{const v=document.getElementById('fe').value.trim();const data=await request('/auth/forgot','POST',{email:v});LVIEW='signin';LMSG=['lok',esc(data.message)];renderLogin()}catch(error){LMSG=['lerr',esc(error.message)];renderLogin()}}
    function enter(a, fresh) {
      USER = { email: a.email, name: a.name, role: a.role }; S.role = a.role === 'HR Admin' ? 'admin' : 'employee'; if (S.role === 'admin') ADMIN = a.name; else ME = a.name; ensureUser(a.name); a.last = new Date().toISOString().slice(0, 16).replace('T', ' '); if (fresh) log('Signed in'); LMSG = null; LVIEW = 'signin';
      for (const k in TAB) delete TAB[k]; document.getElementById('login').hidden = true; document.getElementById('app').hidden = false; CURAPP = 'plus'; go(home()); if (fresh) toast(`Welcome back, ${a.name.split(' ')[0]}`)
    }
    async function logout(){await bridge.flush();await bridge.logout();USER=null;LMSG=['lok','You’ve signed out.'];closeAll();showLogin();history.replaceState(null,'','/login')}
    function toggleSide() { const s = document.getElementById('side'), r = document.getElementById('rail'); s.classList.toggle('on'); r.classList.toggle('on', s.classList.contains('on')); document.getElementById('scrim').classList.toggle('on', s.classList.contains('on')) }
    function notifs() { if (isAdmin()) { go('approvals') } else { const p = S.leaves.filter(l => l.emp === ME && l.status === 'Pending').length; toast(p ? `${p} of your requests are waiting for approval` : 'No new notifications') } }

    /* =================== FORMS =================== */
    let FORM_CB = null;
    function form(title, sub, fields, label, cb) {
      FORM_CB = cb;
      const f = fields.map(x => {
        const id = 'f_' + x.k, req = x.req ? 'required' : '', v = x.v ?? '';
        let inp;
        if (x.t === 'select') inp = `<select class="input" id="${id}">${x.o.map(o => `<option ${String(o) === String(v) ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
        else if (x.t === 'textarea') inp = `<textarea class="input" id="${id}" rows="3" placeholder="${esc(x.ph || '')}">${esc(v)}</textarea>`;
        else inp = `<input class="input" id="${id}" type="${x.t || 'text'}" value="${esc(v)}" placeholder="${esc(x.ph || '')}" ${req}>`;
        return { half: x.half, html: `<label class="field">${x.l}${x.req ? ' <span class="muted" style="font-weight:400">(required)</span>' : ''}${inp}</label>` };
      });
      let html = '', i = 0;
      while (i < f.length) { if (f[i].half && f[i + 1]?.half) { html += `<div class="frow">${f[i].html}${f[i + 1].html}</div>`; i += 2 } else { html += f[i].html; i++ } }
      modal(`<h2>${title}</h2><p class="sub">${sub}</p>${html}<p id="ferr" style="color:var(--bad);font-size:13.5px;margin:0 0 8px;min-height:1px"></p><div class="mfoot"><button class="btn" onclick="closeAll()">Cancel</button><button class="btn primary" id="fsubmit">${label}</button></div>`);
      document.getElementById('fsubmit').onclick = () => {
        const vals = {}; for (const x of fields) { vals[x.k] = document.getElementById('f_' + x.k).value.trim(); if (x.req && !vals[x.k]) { document.getElementById('ferr').textContent = `${x.l} is required.`; document.getElementById('f_' + x.k).focus(); return } }
        const r = FORM_CB(vals); if (typeof r === 'string') { document.getElementById('ferr').textContent = r; return }
        closeAll(); rerender();
      };
    }
    function confirmBox(title, msg, label, cb, danger = true) {
      modal(`<h2>${title}</h2><p class="sub">${msg}</p><div class="mfoot"><button class="btn" onclick="closeAll()">Cancel</button><button class="btn primary" id="cok" style="${danger ? 'background:var(--bad);border-color:var(--bad)' : ''}">${label}</button></div>`);
      document.getElementById('cok').onclick = () => { cb(); closeAll(); rerender() };
    }
    function modal(html) { const m = document.getElementById('modal'); m.classList.remove('wide'); m.innerHTML = html; m.classList.add('on'); document.getElementById('scrim').classList.add('on'); setTimeout(() => m.querySelector('input,select,textarea,button.primary')?.focus(), 60) }
    function drawer(html) { const d = document.getElementById('drawer'); d.innerHTML = `<div style="display:flex;justify-content:flex-end"><button class="icon-btn" aria-label="Close" onclick="closeAll()">${ic('x')}</button></div>` + html; d.classList.add('on'); document.getElementById('scrim').classList.add('on') }
    function closeAll() { ['modal', 'drawer', 'palette', 'side', 'rail'].forEach(id => document.getElementById(id).classList.remove('on')); document.getElementById('scrim').classList.remove('on') }

    /* =================== SHARED ACTIONS =================== */
    function decide(col, id, ok) {
      const x = S[col].find(r => r.id === id); if (!x) return;
      const map = { letters: ok ? 'Issued' : 'Rejected', resignations: ok ? 'Accepted' : 'Rejected' };
      x.status = map[col] || (ok ? 'Approved' : 'Rejected');
      if (col === 'resignations' && ok) { x.check = [['Manager approval', 1], ['Knowledge transfer', 0], ['Asset return', 0], ['Exit interview', 0], ['Full & final settlement', 0], ['Relieving & experience letter', 0]]; const e = emp(x.emp); if (e) e.status = 'Notice period' }
      if (col === 'swaps' && ok) { const e = emp(x.emp); if (e) S.roster[e.id + '|' + x.date] = x.to }
      if (col === 'assetReqs' && ok) { const a = S.assets.find(a => a.type === x.item && a.status === 'In stock'); if (a) { a.emp = x.emp; a.status = 'Assigned'; a.since = todayISO() } }
      log(`${x.status} ${col === 'leaves' ? 'leave' : col.replace(/s$/, '')} request ${id} for ${x.emp}`);
      toast(`${x.emp}'s request ${x.status.toLowerCase()}`); rerender();
    }
    const approveBtns = (col, id) => `<button class="btn sm ok" onclick="decide('${col}','${id}',true)">Approve</button> <button class="btn sm bad" onclick="decide('${col}','${id}',false)">Reject</button>`;

    function applyLeave() {
      form('Apply for leave', `Your manager, ${me().mgr || 'HR'}, will be notified.`, [
        { k: 'type', l: 'Leave type', t: 'select', o: S.leaveTypes.map(t => t.n) },
        { k: 'from', l: 'From', t: 'date', v: todayISO(), half: true, req: true }, { k: 'to', l: 'To', t: 'date', v: todayISO(), half: true, req: true },
        { k: 'reason', l: 'Reason', t: 'textarea', ph: 'Optional note for your manager' }], 'Submit request', v => {
          const days = weekdays(v.from, v.to); if (!days) return 'Pick an end date on or after the start date, on a working day.';
          const lt = S.leaveTypes.find(t => t.n === v.type); const left = lt.q - used(ME, v.type) - used(ME, v.type, 'Pending');
          if (lt.q && days > left) return `You have ${left} day${left === 1 ? '' : 's'} of ${v.type.toLowerCase()} left.`;
          S.leaves.unshift({ id: 'L' + uid(), emp: ME, type: v.type, from: v.from, to: v.to, days, reason: v.reason, status: 'Pending' });
          toast(`Leave request submitted for ${days} day${days > 1 ? 's' : ''}`);
        });
    }
    function raiseTicket(cat = 'Payroll & tax', subject = '') {
      form('Raise a request', 'The People Ops team replies here and by email.', [
        { k: 'cat', l: 'Category', t: 'select', o: ['Payroll & tax', 'Benefits & insurance', 'Letters & documents', 'Leave & attendance', 'IT & assets', 'Other'], v: cat },
        { k: 'sub', l: 'Subject', v: subject, req: true, ph: 'Briefly, what do you need?' },
        { k: 'pri', l: 'Priority', t: 'select', o: ['Normal', 'High', 'Urgent'] },
        { k: 'd', l: 'Details', t: 'textarea', ph: 'Anything that helps us resolve it faster' }], 'Submit request', v => {
          const id = 'HR-' + (2300 + S.tickets.length); S.tickets.unshift({ id, emp: ME, sub: v.sub, cat: v.cat, pri: v.pri, status: 'Open', to: '', date: todayISO(), notes: v.d ? [v.d] : [] }); toast(`Request ${id} submitted`);
        });
    }

    /* =================== CLOCK =================== */
    let tick;
    async function toggleClock(){try{await bridge.flush();const data=await request('/attendance/clock','POST',{action:S.clockedIn?'out':'in'});bridge.adopt(data);rerender();toast(S.clockedIn?'Clocked in. Time log saved.':'Clocked out. Time log saved.')}catch(error){toast(error.message)}}
    function clockUI() { clearInterval(tick); const t = document.getElementById('timer'); if (!t) return; const draw = () => { const s = S.clockedIn ? Math.floor((Date.now() - S.clockStart) / 1000) : 0; t.textContent = [s / 3600, s % 3600 / 60, s % 60].map(x => String(Math.floor(x)).padStart(2, '0')).join(':') }; draw(); if (S.clockedIn) tick = setInterval(draw, 1000) }
    const clockCard = () => `<div class="clock"><div><div class="time" id="timer">00:00:00</div><div class="lbl">${S.clockedIn ? 'Clocked in at ' + new Date(S.clockStart).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'You haven’t clocked in yet'}</div></div><button class="btn light" onclick="toggleClock()">${S.clockedIn ? 'Clock out' : 'Clock in'}</button></div>`;

    /* =================== PAY CALC =================== */
    function salary(e){return COMPUTED.salary?.[e.id]||{earn:[],ded:[['Provident fund',0],['Professional tax',0],['Income tax (TDS)',0]],gross:0,net:0,pfE:0,professionalTax:0,employeePf:0,tds:0}}

    /* =================== VIEWS =================== */
    const V = {};
    const AFTER = { home: clockUI, myAttendance: clockUI };

    /* ---------- EMPLOYEE: Home ---------- */
    V.home = () => {
      const e = me(), h = new Date().getHours(), g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
      const tasks = [];
      S.policies.filter(p => p.mand && !p.ack.includes(ME)).forEach(p => tasks.push([`Acknowledge "${p.n}"`, "go('myDocs')"]));
      S.courses.filter(c => c.type === 'Mandatory' && (c.aud === 'Everyone' || c.aud === e.dept) && (S.progress[ME]?.[c.id] || 0) < 100).forEach(c => tasks.push([`Complete "${c.t}"${c.due ? ' by ' + fdShort(c.due) : ''}`, "go('myLearning')"]));
      if (!(S.reviews[ME]?.self)) tasks.push([`Submit your self-review by ${fdShort(S.cycle.due)}`, "go('myPerformance')"]);
      const nextH = S.holidays.filter(x => x.d >= todayISO()).slice(0, 3);
      return head(`${g}, ${e.name.split(' ')[0]}`, `${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}. ${e.shift} shift.`, btn('Apply for leave', 'applyLeave()', '', 'leave') + btn('Raise a request', 'raiseTicket()', 'primary', 'plus')) +
        `<div class="grid g-dash"><div class="card hero"><h2>Your workday</h2><p>Shift ${S.shifts.find(s => s.n === e.shift)?.s} to ${S.shifts.find(s => s.n === e.shift)?.e}. Grace period 15 minutes.</p>${clockCard()}</div>
   ${card('Quick actions', `<div class="quick">${[['leave', 'Apply for leave', 'applyLeave()'], ['receipt', 'Claim expense', 'claimExpense()'], ['download', 'Latest payslip', "go('myPay')"], ['doc', 'Request a letter', 'requestLetter()'], ['clock', 'Regularise attendance', 'requestReg()'], ['users', 'Find a colleague', "go('directory')"]].map(q => `<button onclick="${q[2]}"><i>${ic(q[0], 16)}</i>${q[1]}</button>`).join('')}</div>`)}</div>
  <h2 class="sect">Your apps</h2><div class="apps-grid">${APPS.map(a => appCard(a, a[0] === 'plus' ? plusMetric() : appMetrics()[a[0]])).join('')}</div>
  <div class="grid g4 mt">${S.leaveTypes.slice(0, 4).map(t => stat('leave', t.n, `${t.q - used(ME, t.n)}`, `of ${t.q} days left`)).join('')}</div>
  <div class="grid g-dash mt">
   ${card('Things to do', tasks.length ? `<div class="list">${tasks.map(t => `<div class="row"><span class="av" style="background:var(--warn-bg);color:var(--warn)">${ic('list', 16)}</span><div class="grow"><b>${esc(t[0])}</b></div><button class="btn sm" onclick="${t[1]}">Open</button></div>`).join('')}</div>` : '<div class="empty">You’re all caught up.</div>', `<span class="pill p-warn">${tasks.length} open</span>`)}
   ${card('Holidays ahead', `<div class="list">${nextH.map(x => `<div class="row"><div class="grow"><b>${x.n}</b><div class="sub">${fd(x.d)}</div></div>${pill(x.t === 'Optional' ? 'Draft' : 'Active').replace(/Active|Draft/, x.t)}</div>`).join('') || '<div class="empty">No upcoming holidays.</div>'}</div>`)}
  </div>
  <div class="grid g2 mt">
   ${card('Announcements', `<div class="list">${[...S.announcements].sort((a, b) => b.pin - a.pin).map(a => `<div class="row"><div class="grow"><b>${a.pin ? 'Pinned: ' : ''}${esc(a.t)}</b><div class="sub">${esc(a.b)} ${fdShort(a.d)}</div></div></div>`).join('')}</div>`)}
   ${card('My recent requests', `<div class="list">${S.leaves.filter(l => l.emp === ME).slice(0, 2).map(l => `<div class="row"><div class="grow"><b>${l.type}</b><div class="sub">${fd(l.from)}, ${l.days} day${l.days > 1 ? 's' : ''}</div></div>${pill(l.status)}</div>`).join('')}${S.tickets.filter(t => t.emp === ME).slice(0, 2).map(t => `<div class="row"><div class="grow"><b>${esc(t.sub)}</b><div class="sub">${t.id}, helpdesk</div></div>${pill(t.status)}</div>`).join('')}</div>`)}
  </div>`;
    };

    /* ---------- EMPLOYEE: Profile ---------- */
    V.profile = () => {
      const e = me(), T = ['Personal', 'Job', 'Bank & statutory', 'Family'], t = tabOf('profile', T);
      let body = '';
      if (t === 'Personal') body = card('Personal details', `<div class="kv-grid">${[['Full name', e.name], ['Work email', e.email], ['Phone', e.phone], ['Date of birth', fd(e.dob)], ['Blood group', e.blood], ['Address', e.address], ['Emergency contact', e.emergency]].map(x => `<div><span>${x[0]}</span><b>${esc(x[1] || '—')}</b></div>`).join('')}</div>`, `<button class="link" onclick="editMe()">Edit details</button>`);
      if (t === 'Job') body = card('Job information', `<div class="kv-grid">${[['Employee ID', e.id], ['Designation', e.role], ['Grade', e.grade], ['Department', e.dept], ['Reports to', e.mgr], ['Location', e.loc], ['Shift', e.shift], ['Date of joining', fd(e.joined)], ['Status', e.status]].map(x => `<div><span>${x[0]}</span><b>${esc(x[1] || '—')}</b></div>`).join('')}</div><p class="muted" style="font-size:13.5px;margin:18px 0 0">Job details are managed by HR. Raise a request if something’s wrong.</p>`);
      if (t === 'Bank & statutory') body = card('Bank & statutory', `<div class="kv-grid">${[['Salary account', e.bank], ['PAN', e.pan], ['UAN (PF)', e.uan], ['Tax regime', S.decl[ME].regime]].map(x => `<div><span>${x[0]}</span><b>${esc(x[1] || '—')}</b></div>`).join('')}</div><div class="mt">${btn('Request bank change', "raiseTicket('Payroll & tax','Change salary bank account')", 'sm')}</div>`);
      if (t === 'Family') body = depCard();
      return head('My profile', 'Keep your details current so payroll, insurance and emergency contacts stay accurate.') +
        `<div class="card" style="display:flex;gap:16px;align-items:center;margin-bottom:18px;flex-wrap:wrap">${av(e.name, 'lg')}<div><h2 style="font-size:20px">${e.name}</h2><div class="muted">${e.role}, ${e.dept}</div></div><div style="margin-left:auto">${pill(e.status)}</div></div>` + tabs('profile', T) + body;
    };
    function editMe() { const e = me(); form('Edit personal details', 'Changes are saved to your profile right away.', [{ k: 'phone', l: 'Phone', v: e.phone, req: true }, { k: 'address', l: 'Address', t: 'textarea', v: e.address }, { k: 'emergency', l: 'Emergency contact', v: e.emergency }, { k: 'blood', l: 'Blood group', t: 'select', o: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'], v: e.blood }], 'Save details', v => { Object.assign(e, v); log('Updated personal details'); toast('Personal details saved') }) }
    function depCard() { const d = S.dependents[ME] || []; return card('Family & dependents', tbl([['Name', r => `<b>${esc(r.n)}</b>`], ['Relationship', r => r.rel], ['Date of birth', r => fd(r.dob)], ['', r => `<button class="btn sm bad" onclick="removeDep('${esc(r.n)}')">Remove</button>`]], d, 'No dependents added.'), `<button class="link" onclick="addDep()">Add dependent</button>`) }
    function addDep() { form('Add dependent', 'Dependents are covered under group health insurance.', [{ k: 'n', l: 'Full name', req: true }, { k: 'rel', l: 'Relationship', t: 'select', o: ['Spouse', 'Child', 'Father', 'Mother'], half: true }, { k: 'dob', l: 'Date of birth', t: 'date', half: true, req: true }], 'Add dependent', v => { (S.dependents[ME] = S.dependents[ME] || []).push(v); toast(`${v.n} added as a dependent`) }) }
    function removeDep(n) { confirmBox('Remove dependent?', `${n} will be removed from your insurance cover at the next renewal.`, 'Remove', () => { S.dependents[ME] = S.dependents[ME].filter(d => d.n !== n); toast('Dependent removed') }) }

    /* ---------- EMPLOYEE: Attendance ---------- */
    V.myAttendance = () => {
      const days = [['Mon', 'Sep 28', '9h 12m', 'Present'], ['Tue', 'Sep 29', '8h 47m', 'Present'], ['Wed', 'Sep 30', '8h 05m', 'Remote'], ['Thu', 'Oct 1', '9h 31m', 'Present'], ['Fri', 'Oct 2', '—', 'Gandhi Jayanti'], ['Sat', 'Oct 3', '—', 'Weekend'], ['Sun', 'Oct 4', '—', 'Weekend']];
      return head('Attendance', 'Clock in and out, check your timesheet and fix missed punches.', btn('Request regularisation', 'requestReg()')) +
        `<div class="grid g-dash"><div class="card hero"><h2>Today</h2><p>General shift, 9:30 am to 6:30 pm.</p>${clockCard()}</div>
   <div class="grid g2">${stat('clock', 'Avg. hours, Oct', '8h 52m', 'Target 8h 30m', 'up')}${stat('leave', 'Late arrivals', '1', 'Grace limit is 3 a month')}</div></div>
  ${card('Last week', `<div class="week">${days.map(d => `<div class="day ${['Weekend', 'Gandhi Jayanti'].includes(d[3]) ? 'off' : ''}"><b>${d[0]}, ${d[1]}</b><div class="h">${d[2]}</div>${d[3] === 'Gandhi Jayanti' ? '<span class="pill p-warn">Holiday</span>' : pill(d[3] === 'Weekend' ? 'Closed' : d[3]).replace('Closed', 'Weekend')}</div>`).join('')}</div>`).replace('class="card"', 'class="card mt"')}
  <div class="mt">${card('My regularisation requests', tbl([['Date', r => fd(r.date)], ['Clock in', r => r.in], ['Clock out', r => r.out], ['Reason', r => esc(r.reason)], ['Status', r => pill(r.status)]], S.regs.filter(r => r.emp === ME), 'No regularisation requests.'))}</div>`;
    };
    function requestReg() { form('Request regularisation', 'Fix a missed clock-in or clock-out. Your manager approves it.', [{ k: 'date', l: 'Date', t: 'date', req: true }, { k: 'in', l: 'Clock in', t: 'time', v: '09:30', half: true }, { k: 'out', l: 'Clock out', t: 'time', v: '18:30', half: true }, { k: 'reason', l: 'Reason', t: 'select', o: ['Forgot to clock out', 'Forgot to clock in', 'Client visit', 'System issue', 'On duty elsewhere'] }], 'Send for approval', v => { S.regs.unshift({ id: 'R' + uid(), emp: ME, ...v, status: 'Pending' }); toast('Regularisation sent for approval') }) }

    /* ---------- EMPLOYEE: Leave ---------- */
    V.myLeave = () => {
      const mine = S.leaves.filter(l => l.emp === ME);
      return head('Leave', 'Your 2026 balances, requests and the holiday calendar.', btn('Apply for leave', 'applyLeave()', 'primary', 'plus')) +
        `<div class="grid g3">${S.leaveTypes.filter(t => t.q).map(t => { const u = used(ME, t.n), p = used(ME, t.n, 'Pending'); return `<div class="card balance"><div class="muted" style="font-size:13px">${t.n}</div><div class="v">${t.q - u} <small>of ${t.q} days left</small></div><div style="margin-top:10px">${bar((t.q - u) / t.q * 100)}</div><div class="muted" style="font-size:12.5px;margin-top:8px">${u} used${p ? `, ${p} pending` : ''}. ${t.carry}.</div></div>` }).join('')}</div>
  <div class="grid g-dash mt">${card('My requests', tbl([['Type', r => r.type], ['Dates', r => `${fdShort(r.from)}${r.to !== r.from ? ' to ' + fdShort(r.to) : ''}`], ['Days', r => r.days], ['Reason', r => esc(r.reason) || '—'], ['Status', r => pill(r.status)], ['', r => r.status === 'Pending' ? `<button class="btn sm" onclick="cancelLeave('${r.id}')">Cancel</button>` : '']], mine, 'You haven’t applied for leave yet.'))}
  ${card('Holiday calendar 2026–27', `<div class="list">${S.holidays.map(x => `<div class="row"><div class="grow"><b>${x.n}</b><div class="sub">${fd(x.d)}</div></div><span class="pill p-${x.t === 'Optional' ? 'mute' : 'info'}">${x.t}</span></div>`).join('')}</div>`)}</div>`;
    };
    function cancelLeave(id) { confirmBox('Cancel this leave request?', 'Your manager will be told it’s withdrawn.', 'Cancel request', () => { S.leaves.find(l => l.id === id).status = 'Cancelled'; toast('Leave request cancelled') }) }

    /* ---------- EMPLOYEE: Pay ---------- */
    V.myPay = () => {
      const e = me(), s = salary(e), d = S.decl[ME], T = ['Payslip', 'History', 'Tax declarations', 'Salary structure'], t = tabOf('myPay', T);
      let body = '';
      if (t === 'Payslip') body = `<div class="grid g2">${card('September 2026', `<div class="list">${s.earn.map(c => `<div class="row"><span class="grow">${c[0]}</span><b>${inr(c[1])}</b></div>`).join('')}<div class="row"><span class="grow"><b>Gross earnings</b></span><b>${inr(s.gross)}</b></div>${s.ded.map(c => `<div class="row"><span class="grow muted">${c[0]}</span><span class="down">−${inr(c[1])}</span></div>`).join('')}<div class="row" style="padding-top:14px"><span class="grow"><b>Net pay</b></span><b style="font:600 22px Sora">${inr(s.net)}</b></div></div>`, `<button class="link" onclick="toast('Payslip for September 2026 downloaded')">Download PDF</button>`)}
   ${card('Year to date, FY 2026–27', `<div class="kv-grid">${[['Gross earned', inr(s.gross * 6)], ['Tax deducted', inr(s.ded[2][1] * 6)], ['PF contributed (you + company)', inr(s.pfE * 12)], ['Credited to', e.bank]].map(x => `<div><span>${x[0]}</span><b>${x[1]}</b></div>`).join('')}</div><div class="mt" style="display:flex;gap:8px;flex-wrap:wrap">${btn('Form 16, FY 2025–26', "toast('Form 16 downloaded')", 'sm', 'download')}${btn('Raise a payroll query', "raiseTicket('Payroll & tax','Question about my payslip')", 'sm')}</div>`)}</div>`;
      if (t === 'History') body = card('Payslip history', tbl([['Month', r => `<b>${r.m}</b>`], ['Paid on', r => fd(r.d)], ['Net pay', r => inr(s.net)], ['', r => `<button class="btn sm" onclick="toast('Payslip for ${r.m} downloaded')">${ic('download', 15)}Download</button>`]], S.payroll.runs));
      if (t === 'Tax declarations') body = card(`Investment declarations, FY 2026–27 ${pill(d.status)}`, `<div class="grid g2">${[['80C (PF, ELSS, LIC)', '80C', 150000], ['80D (Health insurance)', '80D', 25000], ['HRA (Rent paid)', 'HRA', 360000], ['80CCD(1B) (NPS)', '80CCD(1B)', 50000]].map(x => `<div><div style="display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:6px"><span>${x[0]}</span><b>${inr(d[x[1]])} of ${inr(x[2])}</b></div>${bar(d[x[1]] / x[2] * 100)}</div>`).join('')}</div><p class="muted" style="font-size:13.5px;margin:18px 0 0">Tax regime: <b>${d.regime}</b>. Upload proofs by Jan 31 to avoid extra TDS.</p>`, `<button class="link" onclick="editDecl()">Update declarations</button>`);
      if (t === 'Salary structure') body = card(`Annual CTC ${inr(e.ctc)}`, tbl([['Component', r => r[0]], ['Monthly', r => inr(r[1])], ['Annual', r => inr(r[1] * 12)]], [...s.earn, ['Employer PF', s.pfE]]));
      return head('Payslips & tax', 'View payslips, download tax documents and declare investments.') + tabs('myPay', T) + body;
    };
    function editDecl() { const d = S.decl[ME]; form('Update tax declarations', 'Amounts are for FY 2026–27. Upload proofs later in the year.', [{ k: 'regime', l: 'Tax regime', t: 'select', o: ['Old regime', 'New regime'], v: d.regime }, { k: '80C', l: '80C', t: 'number', v: d['80C'], half: true }, { k: '80D', l: '80D', t: 'number', v: d['80D'], half: true }, { k: 'HRA', l: 'Annual rent paid (HRA)', t: 'number', v: d.HRA, half: true }, { k: '80CCD(1B)', l: 'NPS, 80CCD(1B)', t: 'number', v: d['80CCD(1B)'], half: true }], 'Save declarations', v => { for (const k of ['80C', '80D', 'HRA', '80CCD(1B)']) d[k] = +v[k] || 0; d.regime = v.regime; d.status = 'Submitted'; toast('Tax declarations saved') }) }

    /* ---------- EMPLOYEE: Expenses ---------- */
    V.myExpenses = () => {
      const mine = S.expenses.filter(x => x.emp === ME); const sum = st => mine.filter(x => x.status === st).reduce((a, x) => a + x.amt, 0);
      return head('Expenses', 'Claim reimbursements. Approved claims are paid with your next salary.', btn('Claim expense', 'claimExpense()', 'primary', 'plus')) +
        `<div class="grid g3">${stat('receipt', 'Waiting for approval', inr(sum('Pending')), `${mine.filter(x => x.status === 'Pending').length} claims`)}${stat('check', 'Approved, to be paid', inr(sum('Approved')), 'Awaiting a payroll run')}${stat('pay', 'Paid claims', inr(sum('Paid')), 'From saved claim records')}</div>
  <div class="mt">${card('My claims', tbl([['Date', r => fd(r.date)], ['Category', r => r.cat], ['Description', r => esc(r.desc)], ['Amount', r => `<b>${inr(r.amt)}</b>`], ['Status', r => pill(r.status)], ['', r => r.status === 'Pending' ? `<button class="btn sm" onclick="withdrawExp('${r.id}')">Withdraw</button>` : '']], mine, 'No claims yet.'))}</div>`
    };
    function claimExpense() { form('Claim an expense', 'Attach the receipt when your manager asks for it.', [{ k: 'cat', l: 'Category', t: 'select', o: ['Travel', 'Meals', 'Internet', 'Client entertainment', 'Learning', 'Office supplies', 'Other'] }, { k: 'amt', l: 'Amount (₹)', t: 'number', req: true, half: true }, { k: 'date', l: 'Date', t: 'date', v: todayISO(), half: true, req: true }, { k: 'desc', l: 'Description', req: true, ph: 'What was it for?' }], 'Submit claim', v => { if (!(+v.amt > 0)) return 'Enter an amount greater than zero.'; S.expenses.unshift({ id: 'E' + uid(), emp: ME, cat: v.cat, amt: +v.amt, date: v.date, desc: v.desc, status: 'Pending' }); toast(`Claim for ${inr(+v.amt)} submitted`) }) }
    function withdrawExp(id) { S.expenses.find(x => x.id === id).status = 'Withdrawn'; toast('Claim withdrawn'); rerender() }

    /* ---------- EMPLOYEE: Benefits ---------- */
    V.myBenefits = () => head('Benefits', 'Your insurance cover and the people it protects. Enrolment for 2027 closes Oct 31.') +
      `<div class="grid g2">${S.plans.map(p => `<div class="card"><div style="display:flex;justify-content:space-between;gap:8px"><h3 style="margin:0">${p.n}</h3>${pill(p.cost.startsWith('Company') ? 'Active' : 'Draft').replace(/Active|Draft/, p.cost.startsWith('Company') ? 'Enrolled' : 'Optional')}</div><div class="kv-grid mt"><div><span>Provider</span><b>${p.prov}</b></div><div><span>Cover</span><b>${p.cover}</b></div><div><span>Cost</span><b>${p.cost}</b></div></div><div class="mt" style="display:flex;gap:8px">${p.cost.startsWith('Company') ? btn('Download e-card', `toast('${p.n} e-card downloaded')`, 'sm', 'download') : btn('Opt in', `toast('Top-up cover added. ₹350 a month will be deducted.')`, 'sm primary')}</div></div>`).join('')}</div><div class="mt">${depCard()}</div>`;

    /* ---------- EMPLOYEE: Performance ---------- */
    V.myPerformance = () => {
      const goals = S.goals.filter(g => g.emp === ME), rv = S.reviews[ME] || {};
      const stages = ['Goal setting', 'Self-review', 'Manager review', 'Calibration', 'Results shared'];
      return head('Goals & reviews', `${S.cycle.n}. Self-reviews are due by ${fd(S.cycle.due)}.`, btn('Give feedback', 'giveFeedback()', '', 'chat') + btn(rv.self ? 'Edit self-review' : 'Write self-review', 'selfReview()', 'primary', 'edit')) +
        `<div class="card"><h3>Review cycle</h3><div class="stepper" style="--n:${stages.length}">${stages.map((s, i) => `<div class="step ${i < S.cycle.stage ? 'done' : i === S.cycle.stage ? 'cur' : ''}"><span class="n">${i < S.cycle.stage ? '✓' : i + 1}</span><b>${s}</b></div>`).join('')}</div>
   <p class="muted" style="font-size:13.5px;margin:14px 0 0">Your self-review: <b>${rv.self ? 'Submitted' : 'Not submitted'}</b>${rv.rating ? `. Final rating: <b>${rv.rating}</b>` : ''}</p></div>
  <div class="grid g-dash mt">${card('My goals', `<div class="list">${goals.map(g => `<div class="row" style="display:block"><div style="display:flex;justify-content:space-between;gap:10px;margin-bottom:8px"><b>${esc(g.t)}</b><span class="muted" style="font-size:13px">Due ${fdShort(g.due)}</span></div><div style="display:flex;gap:12px;align-items:center"><input type="range" min="0" max="100" step="5" value="${g.p}" aria-label="Progress for ${esc(g.t)}" oninput="this.nextElementSibling.textContent=this.value+'%'" onchange="setGoal('${g.id}',this.value)"><b style="width:44px;text-align:right">${g.p}%</b></div></div>`).join('') || '<div class="empty">Add your first goal for this cycle.</div>'}</div>`, `<button class="link" onclick="addGoal()">Add goal</button>`)}
  ${card('Feedback for you', `<div class="list">${S.feedback.filter(f => f.to === ME).map(f => `<div class="row" style="align-items:flex-start">${av(f.from)}<div class="grow"><b>${f.from}</b><div class="sub">${esc(f.t)}</div><div class="sub">${fd(f.d)}</div></div></div>`).join('') || '<div class="empty">No feedback yet.</div>'}</div>`)}</div>`;
    };
    function setGoal(id, v) { S.goals.find(g => g.id === id).p = +v; save(); toast('Goal progress updated') }
    function addGoal() { form('Add goal', 'Make it specific and measurable.', [{ k: 't', l: 'Goal', req: true, ph: 'e.g. Reduce API error rate below 0.1%' }, { k: 'due', l: 'Due date', t: 'date', req: true }], 'Add goal', v => { S.goals.push({ id: 'G' + uid(), emp: ME, t: v.t, due: v.due, p: 0 }); toast('Goal added') }) }
    function selfReview() { const r = S.reviews[ME]?.self || {}; form('Self-review', `${S.cycle.n}. Your manager sees this once you submit.`, [{ k: 'win', l: 'What went well this half?', t: 'textarea', v: r.win, req: true }, { k: 'grow', l: 'Where do you want to grow?', t: 'textarea', v: r.grow }, { k: 'score', l: 'Self-rating', t: 'select', o: ['Exceeds expectations', 'Meets expectations', 'Partially meets'], v: r.score }], 'Submit self-review', v => { (S.reviews[ME] = S.reviews[ME] || {}).self = v; log('Submitted self-review'); toast(`Self-review submitted to ${me().mgr || 'HR'}`) }) }
    function giveFeedback() { form('Give feedback', 'Feedback is shared with the person and their manager.', [{ k: 'to', l: 'To', t: 'select', o: S.employees.map(e => e.name).filter(n => n !== ME) }, { k: 't', l: 'Feedback', t: 'textarea', req: true, ph: 'Be specific about what they did and its impact' }], 'Send feedback', v => { S.feedback.unshift({ from: ME, to: v.to, t: v.t, d: todayISO() }); toast(`Feedback sent to ${v.to}`) }) }

    /* ---------- EMPLOYEE: Learning ---------- */
    V.myLearning = () => {
      const e = me(), pr = S.progress[ME] = S.progress[ME] || {}; const mine = S.courses.filter(c => c.aud === 'Everyone' || c.aud === e.dept);
      return head('Learning', 'Required compliance courses and skills programs assigned to you.') +
        `<div class="grid g3">${mine.map(c => { const p = pr[c.id] || 0, st = p >= 100 ? 'Completed' : p ? 'In progress' : 'Not started'; return `<div class="card"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><h3 style="margin:0">${esc(c.t)}</h3>${pill(st)}</div><div class="muted" style="font-size:13px;margin:6px 0 14px">${c.type}, ${c.dur}${c.due ? `, due ${fdShort(c.due)}` : ''}</div>${bar(p)}<div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px"><span class="muted" style="font-size:13px">${p}% complete</span>${p >= 100 ? btn('Certificate', `toast('Certificate downloaded')`, 'sm', 'download') : btn(p ? 'Continue' : 'Start', `learn('${c.id}')`, 'sm primary')}</div></div>` }).join('')}</div>`
    };
    function learn(id) { const pr = S.progress[ME]; pr[id] = Math.min(100, (pr[id] || 0) + 25); toast(pr[id] >= 100 ? 'Course completed. Certificate ready.' : `Progress saved: ${pr[id]}%`); rerender() }

    /* ---------- EMPLOYEE: Careers ---------- */
    V.careers = () => head('Jobs & referrals', 'Open roles at Brightcone. Refer someone great or apply internally.') +
      `<div class="grid g2">${S.jobs.filter(j => j.status === 'Open').map(j => `<div class="card"><h3 style="margin-bottom:4px">${esc(j.t)}</h3><div class="muted" style="font-size:13.5px">${j.dept}, ${j.loc}, ${j.type}</div><p style="font-size:13.5px;margin:12px 0">Referral bonus <b>${inr(j.bonus)}</b> after the hire completes 90 days.</p><div style="display:flex;gap:8px">${btn('Refer someone', `refer('${j.id}')`, 'sm primary')}${btn('Apply internally', `applyInternal('${j.id}')`, 'sm')}</div></div>`).join('')}</div>
 <div class="mt">${card('My referrals', tbl([['Candidate', r => `<b>${esc(r.cand)}</b>`], ['Role', r => jobT(r.job)], ['Status', r => pill(r.status)]], S.referrals.filter(r => r.by === ME), 'You haven’t referred anyone yet.'))}</div>`;
    function refer(job) { form(`Refer for ${jobT(job)}`, 'We’ll contact them and keep you posted.', [{ k: 'n', l: 'Candidate name', req: true }, { k: 'email', l: 'Email', t: 'email', req: true, half: true }, { k: 'phone', l: 'Phone', half: true }, { k: 'why', l: 'Why are they a good fit?', t: 'textarea' }], 'Submit referral', v => { S.referrals.unshift({ id: 'RF' + uid(), by: ME, cand: v.n, job, status: 'Applied' }); S.cands.unshift({ id: 'C' + uid(), n: v.n, job, s: 'Applied', sc: 80, src: 'Referral' }); toast(`Thanks! ${v.n} has been referred.`) }) }
    function applyInternal(job) { confirmBox(`Apply for ${jobT(job)}?`, 'Your manager will be informed when you move to interviews.', 'Apply', () => { S.cands.unshift({ id: 'C' + uid(), n: ME, job, s: 'Screening', sc: 85, src: 'Internal' }); toast('Application submitted') }, false) }

    /* ---------- Directory (both) ---------- */
    V.directory = () => {
      const T = ['People', 'Org chart'], t = tabOf('directory', T);
      return head('People directory', `${S.employees.filter(e => e.status !== 'Inactive').length} people at Brightcone.`) + tabs('directory', T) +
        (t === 'People' ? `<div class="toolbar"><div class="search">${ic('search')}<input class="input" id="dq" placeholder="Search by name, role or team" oninput="dirFilter()"></div><select class="input" id="dd" onchange="dirFilter()"><option value="">All departments</option>${deptNames().map(d => `<option>${d}</option>`).join('')}</select></div><div class="people-grid" id="dgrid"></div>` : card('Organisation chart', orgTree()));
    };
    AFTER.directory = () => document.getElementById('dgrid') && dirFilter();
    function dirFilter() { const q = (document.getElementById('dq').value || '').toLowerCase(), d = document.getElementById('dd').value; const r = S.employees.filter(e => e.status !== 'Inactive' && (!q || (e.name + e.role + e.dept).toLowerCase().includes(q)) && (!d || e.dept === d)); document.getElementById('dgrid').innerHTML = r.map(e => `<button class="pcard" onclick="miniProfile('${e.id}')"><div class="who">${av(e.name)}<div><b>${e.name}</b><span>${e.role}</span></div></div><div class="muted" style="font-size:13px">${e.dept}, ${e.loc}</div></button>`).join('') || '<div class="empty">No one matches. Try another name.</div>' }
    function miniProfile(id) { const e = S.employees.find(x => x.id === id); drawer(`<div style="display:flex;gap:16px;align-items:center">${av(e.name, 'lg')}<div><h2 style="font-size:20px">${e.name}</h2><div class="muted">${e.role}</div></div></div><dl class="kv"><dt>Department</dt><dd>${e.dept}</dd><dt>Reports to</dt><dd>${e.mgr || '—'}</dd><dt>Location</dt><dd>${e.loc}</dd><dt>Email</dt><dd>${e.email || e.name.split(' ')[0].toLowerCase() + '@brightcone.ai'}</dd><dt>Phone</dt><dd>${e.phone}</dd></dl><div class="mt">${btn('Send message', `toast('Message sent to ${e.name.split(' ')[0]}')`, 'primary')}</div>`) }
    function orgTree() { const kids = n => S.employees.filter(e => e.mgr === n && e.status !== 'Inactive'); const node = e => `<li><span class="node" onclick="miniProfile('${e.id}')">${av(e.name)}<div><b>${e.name}</b><span>${e.role}</span></div></span>${kids(e.name).length ? `<ul>${kids(e.name).map(node).join('')}</ul>` : ''}</li>`; return `<div style="overflow-x:auto"><ul class="org">${S.employees.filter(e => !e.mgr).map(node).join('')}</ul></div>` }

    /* ---------- EMPLOYEE: Documents ---------- */
    V.myDocs = () => {
      const T = ['Policies', 'My documents', 'Letter requests'], t = tabOf('myDocs', T); let b = '';
      if (t === 'Policies') b = card('Company policies', `<div class="list">${S.policies.map(p => { const a = p.ack.includes(ME); return `<div class="row"><span class="av" style="background:var(--info-bg);color:var(--brand)">${ic('doc', 16)}</span><div class="grow"><b>${esc(p.n)}</b><div class="sub">Version ${p.v}, updated ${fd(p.d)}${p.mand ? ', acknowledgement required' : ''}</div></div>${btn('Read', `toast('${esc(p.n)} opened')`, 'sm')}${a ? pill('Acknowledged') : p.mand ? btn('Acknowledge', `ackPolicy('${p.id}')`, 'sm primary') : ''}</div>` }).join('')}</div>`);
      if (t === 'My documents') b = card('My documents', tbl([['Document', r => `<b>${r.doc}</b>`], ['Status', r => pill(r.status)], ['', r => btn('Download', `toast('${r.doc} downloaded')`, 'sm', 'download')]], S.empDocs.filter(d => d.emp === ME)), `<button class="link" onclick="uploadDoc()">Upload document</button>`);
      if (t === 'Letter requests') b = card('Letter requests', tbl([['Letter', r => `<b>${r.type}</b>`], ['Addressed to', r => esc(r.to)], ['Requested', r => fd(r.date)], ['Status', r => pill(r.status)], ['', r => r.status === 'Issued' ? btn('Download', `toast('${r.type} letter downloaded')`, 'sm', 'download') : '']], S.letters.filter(l => l.emp === ME), 'No letters requested.'), `<button class="link" onclick="requestLetter()">Request a letter</button>`);
      return head('Documents & letters', 'Read and acknowledge policies, keep your documents up to date, and request letters.') + tabs('myDocs', T) + b
    };
    function ackPolicy(id) { S.policies.find(p => p.id === id).ack.push(ME); log('Acknowledged policy ' + id); toast('Policy acknowledged'); rerender() }
    function uploadDoc() { form('Upload document', 'HR verifies new documents within two working days.', [{ k: 'doc', l: 'Document type', t: 'select', o: ['Passport', 'Driving licence', 'Address proof', 'Marriage certificate', 'Other'] }, { k: 'file', l: 'File', t: 'file' }], 'Upload', v => { S.empDocs.push({ emp: ME, doc: v.doc, status: 'Submitted' }); toast(`${v.doc} uploaded for verification`) }) }
    function requestLetter() { form('Request a letter', 'Signed letters are usually ready within two working days.', [{ k: 'type', l: 'Letter type', t: 'select', o: ['Employment verification', 'Address proof', 'Salary certificate', 'Visa support letter', 'No objection certificate'] }, { k: 'to', l: 'Addressed to', req: true, ph: 'e.g. To whom it may concern' }], 'Request letter', v => { S.letters.unshift({ id: 'LT' + uid(), emp: ME, type: v.type, to: v.to, status: 'Pending', date: todayISO() }); toast('Letter requested') }) }

    /* ---------- EMPLOYEE: Assets ---------- */
    V.myAssets = () => head('My assets', 'Company equipment assigned to you.', btn('Request equipment', 'requestAsset()', 'primary', 'plus')) +
      card('Assigned to me', tbl([['Asset tag', r => `<b>${r.tag}</b>`], ['Type', r => r.type], ['Model', r => r.model], ['Since', r => fd(r.since)], ['', r => btn('Report an issue', `raiseTicket('IT & assets','Issue with ${r.tag} (${r.model})')`, 'sm')]], S.assets.filter(a => a.emp === ME), 'No assets assigned.')) +
      `<div class="mt">${card('My equipment requests', tbl([['Item', r => r.item], ['Reason', r => esc(r.reason)], ['Status', r => pill(r.status)]], S.assetReqs.filter(r => r.emp === ME), 'No requests yet.'))}</div>`;
    function requestAsset() { form('Request equipment', 'IT reviews requests within one working day.', [{ k: 'item', l: 'Item', t: 'select', o: ['Laptop', 'Monitor', 'Headset', 'Keyboard & mouse', 'Mobile phone'] }, { k: 'reason', l: 'Reason', req: true }], 'Send request', v => { S.assetReqs.unshift({ id: 'AR' + uid(), emp: ME, ...v, status: 'Pending' }); toast('Equipment request sent') }) }

    /* ---------- EMPLOYEE: Helpdesk ---------- */
    V.myHelp = () => head('HR helpdesk', 'Ask a question or raise a request. Most are answered within one working day.', btn('Raise a request', 'raiseTicket()', 'primary', 'plus')) +
      `<div class="grid g4">${[['pay', 'Payroll & tax'], ['heart', 'Benefits & insurance'], ['doc', 'Letters & documents'], ['leave', 'Leave & attendance']].map(c => `<button class="card stat" style="text-align:left;cursor:pointer" onclick="raiseTicket('${c[1]}')"><div class="k"><i>${ic(c[0], 16)}</i></div><div style="font-weight:600;margin-top:12px">${c[1]}</div><div class="d">Raise a request</div></button>`).join('')}</div>
 <div class="mt">${card('My requests', tbl([['ID', r => `<span class="muted">${r.id}</span>`], ['Subject', r => `<b>${esc(r.sub)}</b>`], ['Category', r => r.cat], ['Raised', r => fd(r.date)], ['Status', r => pill(r.status)], ['', r => btn('View', `viewTicket('${r.id}')`, 'sm')]], S.tickets.filter(t => t.emp === ME), 'No requests yet.'))}</div>`;
    function viewTicket(id) { const t = S.tickets.find(x => x.id === id); drawer(`<h2 style="font-size:19px">${esc(t.sub)}</h2><div style="margin-top:8px">${pill(t.status)} ${pill(t.pri)}</div><dl class="kv"><dt>Ticket</dt><dd>${t.id}</dd><dt>Raised by</dt><dd>${t.emp}</dd><dt>Category</dt><dd>${t.cat}</dd><dt>Assigned to</dt><dd>${t.to || 'Unassigned'}</dd><dt>Raised on</dt><dd>${fd(t.date)}</dd></dl><h3 style="font-size:15px;margin:22px 0 10px">Conversation</h3><div class="list">${t.notes.map(n => `<div class="row"><div class="grow sub" style="color:var(--text)">${esc(n)}</div></div>`).join('') || '<div class="muted" style="font-size:13.5px">No messages yet.</div>'}</div><label class="field mt">Add a message<textarea class="input" id="tnote" rows="3"></textarea></label><div class="actions">${btn('Send', 'addNote(\'' + id + '\')', 'primary')}${isAdmin() && t.status !== 'Resolved' ? btn('Mark resolved', `setTicket('${id}','Resolved')`, 'ok') : ''}</div>`) }
    function addNote(id) { const v = document.getElementById('tnote').value.trim(); if (!v) return; const t = S.tickets.find(x => x.id === id); t.notes.push((isAdmin() ? ADMIN : ME) + ': ' + v); if (isAdmin() && t.status === 'Open') t.status = 'In progress'; save(); toast('Message sent'); viewTicket(id) }

    /* ---------- EMPLOYEE: Resignation ---------- */
    V.myExit = () => {
      const r = S.resignations.find(x => x.emp === ME && !['Withdrawn', 'Rejected'].includes(x.status));
      return head('Resignation', `Notice period is ${S.company.notice}. Talk to your manager before submitting.`) +
        (r ? card(`Your resignation ${pill(r.status)}`, `<div class="kv-grid"><div><span>Submitted</span><b>${fd(r.date)}</b></div><div><span>Proposed last day</span><b>${fd(r.lwd)}</b></div><div><span>Reason</span><b>${esc(r.reason)}</b></div></div>${r.check ? `<h3 class="mt">Exit checklist</h3>${r.check.map(c => `<div class="check ${c[1] ? 'done' : ''}"><input type="checkbox" disabled ${c[1] ? 'checked' : ''}><span>${c[0]}</span></div>`).join('')}` : ''}<div class="mt">${r.status === 'Pending' ? btn('Withdraw resignation', `withdrawRes('${r.id}')`, 'bad') : ''}</div>`)
          : `<div class="card"><h3>Submit resignation</h3><p class="muted" style="margin:0 0 16px">Your manager and HR are notified. You can withdraw until it’s accepted.</p>${btn('Start resignation', 'submitRes()', 'primary')}</div>`)
    };
    function submitRes() { const d = new Date(); d.setDate(d.getDate() + 60); form('Submit resignation', `This goes to ${me().mgr || 'your manager'} and HR.`, [{ k: 'lwd', l: 'Proposed last working day', t: 'date', v: d.toISOString().slice(0, 10), req: true }, { k: 'reason', l: 'Reason', t: 'select', o: ['Career growth', 'Higher studies', 'Relocation', 'Personal reasons', 'Compensation', 'Other'] }, { k: 'note', l: 'Anything you’d like to share?', t: 'textarea' }], 'Submit resignation', v => { S.resignations.unshift({ id: 'RS' + uid(), emp: ME, date: todayISO(), lwd: v.lwd, reason: v.reason, status: 'Pending' }); toast('Resignation submitted') }) }
    function withdrawRes(id) { confirmBox('Withdraw your resignation?', 'Your manager and HR will be told.', 'Withdraw', () => { S.resignations.find(r => r.id === id).status = 'Withdrawn'; toast('Resignation withdrawn') }, false) }

    /* =================== ADMIN =================== */
    V.adminDash = () => {
      const act = S.employees.filter(e => e.status !== 'Inactive'); const P = pendingAll();
      const cnt = deptNames().map(d => [d, act.filter(e => e.dept === d).length]).filter(x => x[1]).sort((a, b) => b[1] - a[1]); const mx = Math.max(...cnt.map(c => c[1]));
      const onLeave = S.leaves.filter(l => l.status === 'Approved' && l.from <= todayISO() && l.to >= todayISO()).length;
      return head('People dashboard', 'Headcount, approvals and people moves across Brightcone today.', btn('Post announcement', 'postAnn()', '', 'mega') + btn('Add employee', 'addEmp()', 'primary', 'plus')) +
        `<div class="grid g4">${stat('users', 'Headcount', act.length, `${act.filter(e => e.status === 'Probation').length} on probation`)}${stat('leave', 'On leave today', onLeave, 'Approved leave covering today')}${stat('briefcase', 'Open positions', S.jobs.filter(j => j.status === 'Open').length, `${S.cands.filter(c => !['Hired', 'Rejected'].includes(c.s)).length} candidates in pipeline`)}${stat('inbox', 'Pending approvals', P.length, 'Across all modules', P.length ? 'down' : 'up')}</div>
  <div class="grid g-dash mt">${card('Approvals waiting', P.length ? `<div class="list">${P.slice(0, 5).map(p => `<div class="row">${av(p.emp)}<div class="grow"><b>${p.emp}</b> <span class="pill p-info" style="margin-left:4px">${p.mod}</span><div class="sub">${esc(p.what)}</div></div>${approveBtns(p.col, p.id)}</div>`).join('')}</div>` : '<div class="empty">You’re all caught up.</div>', `<button class="link" onclick="go('approvals')">See all ${P.length}</button>`)}
  ${card('Headcount by department', `<div class="dept-bars">${cnt.map(([d, n]) => `<div class="r"><span>${d}</span>${bar(n / mx * 100)}<em>${n}</em></div>`).join('')}</div>`)}</div>
  <div class="grid g3 mt">
   ${card('Payroll, ' + S.payroll.month, `<p style="margin:0 0 10px">${S.payroll.step >= 5 ? '<b>Completed.</b> Payslips published.' : `Step ${S.payroll.step + 1} of 5: <b>${PAYSTEPS[S.payroll.step]}</b>`}</p>${bar(S.payroll.step / 5 * 100)}<div class="mt">${btn('Open payroll', "go('payrollAdmin')", 'sm')}</div>`)}
   ${card('Helpdesk', `<div class="kv-grid"><div><span>Open</span><b>${S.tickets.filter(t => t.status === 'Open').length}</b></div><div><span>In progress</span><b>${S.tickets.filter(t => t.status === 'In progress').length}</b></div><div><span>Unassigned</span><b>${S.tickets.filter(t => !t.to && t.status !== 'Resolved').length}</b></div></div><div class="mt">${btn('Open queue', "go('helpAdmin')", 'sm')}</div>`)}
   ${card('People moves', `<div class="list">${S.onboard.map(o => `<div class="row">${av(o.emp)}<div class="grow"><b>${o.emp}</b><div class="sub">Onboarding, ${o.tasks.filter(t => t[1]).length}/${o.tasks.length} done</div></div></div>`).join('')}${S.resignations.filter(r => r.status === 'Accepted').map(r => `<div class="row">${av(r.emp)}<div class="grow"><b>${r.emp}</b><div class="sub">Leaving ${fdShort(r.lwd)}</div></div></div>`).join('')}</div>`)}
  </div>`;
    };

    V.approvals = () => {
      const P = pendingAll(); const mods = ['All', ...new Set(P.map(p => p.mod))]; const f = TAB.approvalsF || 'All'; const L = P.filter(p => f === 'All' || p.mod === f);
      return head('Approvals inbox', 'Every request waiting on HR, in one place.', P.length ? btn('Approve all shown', 'bulkApprove()', 'primary', 'check') : '') +
        `<div class="tabs" style="margin-bottom:16px">${mods.map(m => `<button class="${m === f ? 'on' : ''}" onclick="TAB.approvalsF='${m}';rerender()">${m}${m !== 'All' ? ` (${P.filter(p => p.mod === m).length})` : ''}</button>`).join('')}</div>` +
        card(`${L.length} pending`, tbl([['Employee', r => who(r.emp)], ['Type', r => `<span class="pill p-info">${r.mod}</span>`], ['Details', r => `<span style="white-space:normal">${esc(r.what)}</span>`], ['', r => approveBtns(r.col, r.id)]], L, 'No pending approvals. Nice work.'))
    };
    function bulkApprove() { const f = TAB.approvalsF || 'All'; const L = pendingAll().filter(p => f === 'All' || p.mod === f); confirmBox(`Approve ${L.length} requests?`, 'Each employee is notified.', 'Approve all', () => { L.forEach(p => { const x = S[p.col].find(r => r.id === p.id); x.status = p.col === 'letters' ? 'Issued' : p.col === 'resignations' ? 'Accepted' : 'Approved' }); log(`Bulk approved ${L.length} requests`); toast(`${L.length} requests approved`) }, false) }

    /* ---------- Employee Master Data & Central Register ---------- */
    function calcTenure(joined) {
      if (!joined) return '—';
      const d = new Date(joined + 'T00:00:00'), now = new Date();
      if (isNaN(d)) return joined;
      let months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      if (months < 0) return 'Starts soon';
      if (months < 1) return '< 1 mo';
      const y = Math.floor(months / 12), m = months % 12;
      if (!y) return `${m} mo${m > 1 ? 's' : ''}`;
      return `${y}y${m ? ' ' + m + 'm' : ''}`;
    }

    function syncEmployeeStores() {
      if (!S || !S.employees) return;
      const emps = recs('emp');
      const profs = recs('profile');
      S.employees.forEach(e => {
        let r = emps.find(x => x.id === e.id);
        const parts = (e.name || '').trim().split(' ');
        const first = parts[0] || '';
        const last = parts.slice(1).join(' ') || '';
        const mgrEmp = S.employees.find(m => m.name === e.mgr);
        if (!r) {
          r = {
            id: e.id,
            first,
            last,
            email: e.email || mail(e.name),
            phone: e.phone || '',
            dob: e.dob || '',
            gender: e.gender || (['Ananya Rao', 'Priya Menon', 'Sneha Iyer', 'Emily Carter', 'Meera Joshi', 'Lakshmi Prasad', 'Divya Kulkarni'].includes(e.name) ? 'Female' : 'Male'),
            department: e.dept || '',
            designation: e.role || '',
            grade: e.grade || 'L4',
            location: e.loc || 'Hyderabad',
            manager: mgrEmp ? mgrEmp.id : '',
            type: e.type || 'Full-time',
            doj: e.joined || todayISO(),
            probEnd: e.probEnd || (e.status === 'Probation' ? '2026-12-31' : ''),
            status: e.status === 'On leave' ? 'Active' : e.status === 'Inactive' ? 'Exited' : e.status,
            ctc: e.ctc || 0,
            _c: nowISO(),
            _u: nowISO(),
            _cb: USER ? USER.email : 'system'
          };
          emps.push(r);
        } else {
          if (!e.phone && r.phone) e.phone = r.phone;
          if (!e.dob && r.dob) e.dob = r.dob;
          if (!e.gender && r.gender) e.gender = r.gender;
          if (!e.type && r.type) e.type = r.type;
          if (!e.probEnd && r.probEnd) e.probEnd = r.probEnd;
        }
        let p = profs.find(x => x.emp === e.id);
        if (!p) {
          p = {
            id: 'PRF-' + e.id.replace('BC-', ''),
            emp: e.id,
            pemail: e.pemail || '',
            marital: e.marital || 'Single',
            address: e.address || (e.loc ? e.loc + ', India' : ''),
            ecName: e.emergency ? e.emergency.split(',')[0].trim() : '',
            ecPhone: e.emergency ? (e.emergency.split(',')[1] || '').trim() : '',
            blood: e.blood || 'O+',
            pan: e.pan || ('ABCDE' + e.id.replace(/\D/g, '').slice(-4) + 'F'),
            aadhaar: e.aadhaar || e.id.replace(/\D/g, '').slice(-4),
            uan: e.uan || ('1009' + e.id.replace(/\D/g, '').padStart(8, '0')),
            bank: e.bank || 'HDFC Bank',
            acct: e.acct || ('50100' + e.id.replace(/\D/g, '').padStart(7, '3')),
            ifsc: e.ifsc || 'HDFC0001234',
            status: 'Verified',
            _c: nowISO(),
            _u: nowISO(),
            _cb: 'system'
          };
          profs.push(p);
        } else {
          if (!e.pan && p.pan) e.pan = p.pan;
          if (!e.blood && p.blood) e.blood = p.blood;
          if (!e.address && p.address) e.address = p.address;
          if (!e.emergency && (p.ecName || p.ecPhone)) e.emergency = `${p.ecName || ''} (${p.ecPhone || ''})`.trim();
        }
      });
    }

    let MASK_STATE = {};
    function toggleMaskVal(key, id) {
      const k = key + '_' + id;
      MASK_STATE[k] = !MASK_STATE[k];
      const el = document.getElementById(k);
      const btnEl = document.getElementById('btn_' + k);
      if (el) {
        const raw = el.dataset.raw || '';
        const masked = el.dataset.masked || '';
        el.textContent = MASK_STATE[k] ? raw : masked;
      }
      if (btnEl) {
        btnEl.title = MASK_STATE[k] ? 'Hide sensitive data' : 'Reveal sensitive data';
      }
    }

    function copyEmpId(id, ev) {
      if (ev) ev.stopPropagation();
      try {
        navigator.clipboard.writeText(id);
        toast(`Copied ${id} to clipboard`);
      } catch (err) {
        toast(`Employee ID: ${id}`);
      }
    }

    V.employees = () => {
      syncEmployeeStores();
      const all = S.employees;
      const act = all.filter(e => e.status === 'Active' || e.status === 'On leave');
      const prob = all.filter(e => e.status === 'Probation');
      const notice = all.filter(e => e.status === 'Notice period');
      const dNames = deptNames();
      const locNames = [...new Set(all.map(e => e.loc).filter(Boolean))].sort();
      const grNames = S.grades.map(g => g[0]);
      const actPct = all.length ? Math.round((act.length / all.length) * 100) : 0;

      const actBtns = btn('Import CSV', 'importMasterCsv()', '', 'upload') +
                      btn('Export CSV', 'exportMasterCsv()', '', 'download') +
                      btn('Add employee', 'openAddMasterModal()', 'primary', 'plus');

      return head('Employee master data', 'The primary enterprise register for identity, organization placement, compensation, statutory profiles and employee 360.', actBtns) +
        `<div class="emp-master-stats">
          <div class="emp-stat-card">
            <div class="emp-stat-icon">${ic('users', 22)}</div>
            <div class="emp-stat-info">
              <span class="num">${all.length}</span>
              <span class="label">Total Headcount</span>
              <span class="sub">${act.length} active in workforce</span>
            </div>
          </div>
          <div class="emp-stat-card">
            <div class="emp-stat-icon" style="background:var(--ok-bg);color:var(--ok)">${ic('check', 22)}</div>
            <div class="emp-stat-info">
              <span class="num">${act.length}</span>
              <span class="label">Active Employees</span>
              <span class="sub" style="color:var(--ok)">${actPct}% operational strength</span>
            </div>
          </div>
          <div class="emp-stat-card">
            <div class="emp-stat-icon" style="background:var(--info-bg);color:var(--brand)">${ic('clock', 22)}</div>
            <div class="emp-stat-info">
              <span class="num">${prob.length}</span>
              <span class="label">On Probation</span>
              <span class="sub">Evaluation in progress</span>
            </div>
          </div>
          <div class="emp-stat-card">
            <div class="emp-stat-icon" style="background:var(--bad-bg);color:var(--bad)">${ic('logout', 22)}</div>
            <div class="emp-stat-info">
              <span class="num">${notice.length}</span>
              <span class="label">Notice Period</span>
              <span class="sub">Exit & handover stage</span>
            </div>
          </div>
          <div class="emp-stat-card">
            <div class="emp-stat-icon" style="background:var(--surface-2);color:var(--muted)">${ic('org', 22)}</div>
            <div class="emp-stat-info">
              <span class="num">${dNames.length}</span>
              <span class="label">Departments</span>
              <span class="sub">${locNames.length} office locations</span>
            </div>
          </div>
        </div>
        <div class="master-table-card">
          <div class="master-toolbar">
            <label class="search" style="flex:1;min-width:220px;max-width:380px">
              ${ic('search', 16)}
              <input class="input" id="masterSearch" type="search" placeholder="Search by name, ID, role, email, location..." oninput="filterMasterData()">
            </label>
            <select class="input" id="masterDept" onchange="filterMasterData()" aria-label="Department filter">
              <option value="">All Departments</option>
              ${dNames.map(d => `<option value="${esc(d)}">${esc(d)}</option>`).join('')}
            </select>
            <select class="input" id="masterLoc" onchange="filterMasterData()" aria-label="Location filter">
              <option value="">All Locations</option>
              ${locNames.map(l => `<option value="${esc(l)}">${esc(l)}</option>`).join('')}
            </select>
            <select class="input" id="masterGrade" onchange="filterMasterData()" aria-label="Grade filter">
              <option value="">All Grades</option>
              ${grNames.map(g => `<option value="${esc(g)}">${esc(g)}</option>`).join('')}
            </select>
            <select class="input" id="masterStatus" onchange="filterMasterData()" aria-label="Status filter">
              <option value="">All Statuses</option>
              ${['Active', 'Probation', 'Notice period', 'On leave', 'Inactive'].map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('')}
            </select>
            <div class="tabs" style="margin:0;padding:2px;background:var(--surface-2);border-radius:9px" role="tablist">
              <button class="${TAB.masterView !== 'cards' && TAB.masterView !== 'depts' ? 'on' : ''}" onclick="TAB.masterView='table';filterMasterData()" title="Table view" style="padding:5px 9px">${ic('list', 15)}</button>
              <button class="${TAB.masterView === 'cards' ? 'on' : ''}" onclick="TAB.masterView='cards';filterMasterData()" title="Card grid view" style="padding:5px 9px">${ic('grid', 15)}</button>
              <button class="${TAB.masterView === 'depts' ? 'on' : ''}" onclick="TAB.masterView='depts';filterMasterData()" title="Group by department" style="padding:5px 9px">${ic('org', 15)}</button>
            </div>
            <button class="link" onclick="resetMasterFilters()" style="font-size:12.5px;margin-left:4px">Reset</button>
            <span id="masterCounter" class="muted" style="margin-left:auto;font-size:12.5px;font-variant-numeric:tabular-nums">${all.length} employees</span>
          </div>
          <div id="masterContainer"></div>
        </div>`;
    };
    V.m_emp = () => V.employees();

    AFTER.employees = () => { filterMasterData(); };
    AFTER.m_emp = () => { filterMasterData(); };

    function resetMasterFilters() {
      const q = document.getElementById('masterSearch'); if (q) q.value = '';
      const d = document.getElementById('masterDept'); if (d) d.value = '';
      const l = document.getElementById('masterLoc'); if (l) l.value = '';
      const g = document.getElementById('masterGrade'); if (g) g.value = '';
      const s = document.getElementById('masterStatus'); if (s) s.value = '';
      filterMasterData();
    }

    function filterMasterData() {
      syncEmployeeStores();
      const q = (document.getElementById('masterSearch')?.value || '').trim().toLowerCase();
      const d = document.getElementById('masterDept')?.value || '';
      const l = document.getElementById('masterLoc')?.value || '';
      const g = document.getElementById('masterGrade')?.value || '';
      const s = document.getElementById('masterStatus')?.value || '';
      const view = TAB.masterView || 'table';

      const list = S.employees.filter(e => {
        const text = `${e.name} ${e.id} ${e.role} ${e.dept} ${e.loc} ${e.email || ''} ${e.phone || ''}`.toLowerCase();
        return (!q || text.includes(q)) &&
               (!d || e.dept === d) &&
               (!l || e.loc === l) &&
               (!g || e.grade === g) &&
               (!s || e.status === s);
      });

      const cnt = document.getElementById('masterCounter');
      if (cnt) cnt.textContent = `${list.length} of ${S.employees.length} shown`;

      const box = document.getElementById('masterContainer');
      if (!box) return;

      if (!list.length) {
        box.innerHTML = `<div class="empty" style="padding:48px 20px">
          <div class="empty-ic">${ic('users', 32)}</div>
          <b style="font-size:15px;color:var(--text);display:block;margin-top:10px">No employee records match the filters</b>
          <p class="muted" style="margin:4px 0 16px;font-size:13px">Try clearing search terms or department filters.</p>
          <button class="btn sm" onclick="resetMasterFilters()">Clear all filters</button>
        </div>`;
        return;
      }

      if (view === 'cards') {
        box.innerHTML = `<div class="emp-grid-view">${list.map(e => `
          <div class="emp-card-item">
            <div class="emp-card-head">
              ${av(e.name)}
              <div style="flex:1;min-width:0">
                <button class="link" style="color:inherit;text-align:left;font-weight:600;font-size:14.5px;display:block" onclick="empMasterDrawer('${e.id}')">${esc(e.name)}</button>
                <div class="muted" style="font-size:12.5px;margin-top:2px">${esc(e.role)}</div>
              </div>
              <span class="emp-copy-id" title="Click to copy ID" onclick="copyEmpId('${e.id}',event)">${e.id}</span>
            </div>
            <div class="emp-card-meta">
              <div><span>Department</span><b>${esc(e.dept)}</b></div>
              <div><span>Grade & Shift</span><b>${esc(e.grade || '—')} · ${esc(e.shift || 'General')}</b></div>
              <div><span>Location</span><b>${esc(e.loc)}</b></div>
              <div><span>Manager</span><b>${esc(e.mgr || 'Top Exec')}</b></div>
              <div><span>Joined</span><b>${fd(e.joined)}</b></div>
              <div><span>Status</span>${pill(e.status)}</div>
            </div>
            <div class="emp-card-acts">
              <button class="btn sm" onclick="empMasterDrawer('${e.id}')">${ic('eye', 14)} 360 Profile</button>
              <button class="btn sm" onclick="openAddMasterModal('${e.id}')">${ic('edit', 14)} Edit</button>
            </div>
          </div>`).join('')}</div>`;
        return;
      }

      if (view === 'depts') {
        const byDept = {};
        list.forEach(e => { byDept[e.dept] = byDept[e.dept] || []; byDept[e.dept].push(e); });
        box.innerHTML = `<div style="padding:16px 20px">${Object.entries(byDept).map(([dname, emps]) => {
          const dObj = S.depts.find(x => x.n === dname);
          return `<div class="card mt" style="margin-top:14px;background:var(--surface)">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
              <div>
                <b style="font-size:16px;color:var(--text)">${esc(dname)}</b>
                <span class="muted" style="font-size:13px;margin-left:8px">Head: ${dObj?.head || '—'} · Cost Centre: ${dObj?.cc || '—'}</span>
              </div>
              <span class="pill p-info">${emps.length} Employee${emps.length > 1 ? 's' : ''}</span>
            </div>
            ${tbl([
              ['Employee', e => `<button class="link" style="color:inherit;text-align:left" onclick="empMasterDrawer('${e.id}')">${who(e.name, e.email || '')}</button>`],
              ['ID', e => `<span class="emp-copy-id" title="Click to copy" onclick="copyEmpId('${e.id}',event)">${e.id}</span>`],
              ['Designation', e => esc(e.role)],
              ['Grade', e => `<span class="pill p-mute">${esc(e.grade || '—')}</span>`],
              ['Location', e => esc(e.loc)],
              ['Manager', e => e.mgr ? esc(e.mgr) : '<span class="muted">—</span>'],
              ['Joined', e => `${fd(e.joined)} <small class="muted">(${calcTenure(e.joined)})</small>`],
              ['Status', e => pill(e.status)],
              ['', e => `<div style="display:flex;gap:4px">
                <button class="btn sm ib" title="View 360 Profile" aria-label="View ${e.name}" onclick="empMasterDrawer('${e.id}')">${ic('eye', 14)}</button>
                <button class="btn sm ib" title="Edit" aria-label="Edit ${e.name}" onclick="openAddMasterModal('${e.id}')">${ic('edit', 14)}</button>
              </div>`]
            ], emps)}
          </div>`;
        }).join('')}</div>`;
        return;
      }

      // Default Table view
      box.innerHTML = tbl([
        ['Employee', e => `
          <div style="display:flex;align-items:center;gap:10px">
            <button class="link" style="display:flex;align-items:center;gap:10px;text-align:left;color:inherit" onclick="empMasterDrawer('${e.id}')">
              ${av(e.name)}
              <div>
                <b style="color:var(--text);font-weight:600">${esc(e.name)}</b>
                <span style="display:block;font-size:12px;color:var(--muted)">${esc(e.email || mail(e.name))}</span>
              </div>
            </button>
          </div>`],
        ['Employee ID', e => `<button class="emp-copy-id" title="Click to copy ID" onclick="copyEmpId('${e.id}',event)">${e.id} ${ic('pen', 11)}</button>`],
        ['Role & Grade', e => `
          <div>
            <span style="font-weight:500;color:var(--text)">${esc(e.role)}</span>
            <span class="pill p-mute" style="margin-left:6px;font-size:11px;padding:1px 6px">${esc(e.grade || 'L4')}</span>
          </div>`],
        ['Department', e => `<span class="emp-dept-tag">${esc(e.dept)}</span>`],
        ['Location & Shift', e => `
          <div style="line-height:1.2">
            <span>${esc(e.loc)}</span>
            <span style="display:block;font-size:11.5px;color:var(--muted)">${esc(e.shift || 'General')}</span>
          </div>`],
        ['Manager', e => e.mgr ? who(e.mgr) : '<span class="muted">Executive Level</span>'],
        ['Joined & Tenure', e => `
          <div style="line-height:1.2">
            <span>${fd(e.joined)}</span>
            <span style="display:block;font-size:11.5px;color:var(--muted)">${calcTenure(e.joined)}</span>
          </div>`],
        ['Status', e => pill(e.status)],
        ['Actions', e => `
          <div style="display:flex;align-items:center;gap:5px">
            <button class="btn sm ib" title="View 360 Master Profile" aria-label="View ${e.name}" onclick="empMasterDrawer('${e.id}')">${ic('eye', 15)}</button>
            <button class="btn sm ib" title="Edit Master Record" aria-label="Edit ${e.name}" onclick="openAddMasterModal('${e.id}')">${ic('edit', 15)}</button>
            <button class="btn sm ib" title="Revise CTC / Salary" aria-label="Salary ${e.name}" onclick="reviseSalary('${e.id}')">${ic('pay', 15)}</button>
          </div>`]
      ], list);
    }

    /* ---------- 360-Degree Employee Master Profile Drawer ---------- */
    function empMasterDrawer(id) {
      syncEmployeeStores();
      const e = S.employees.find(x => x.id === id);
      if (!e) { toast('Employee record not found'); return; }
      const p = recs('profile').find(x => x.emp === e.id) || {};
      const r = recs('emp').find(x => x.id === e.id) || {};
      const s = salary(e);
      const tenure = calcTenure(e.joined);
      const curTab = TAB.profileTab || 'Personal & Contact';

      const d = document.getElementById('drawer');
      d.classList.add('wide');

      const tabsList = ['Personal & Contact', 'Job & Organization', 'Statutory & Bank', 'Compensation & Leaves', 'Assets & Docs', 'Audit & History'];

      let tabBody = '';
      if (curTab === 'Personal & Contact') {
        tabBody = `
          <div class="profile-sec-card">
            <h4>${ic('user', 16)} Personal & Demographic Information</h4>
            <div class="kv-grid">
              <div><span>Full Legal Name</span><b>${esc(e.name)}</b></div>
              <div><span>Date of Birth</span><b>${fd(e.dob || r.dob || '—')}</b></div>
              <div><span>Gender</span><b>${esc(e.gender || r.gender || 'Not specified')}</b></div>
              <div><span>Blood Group</span><b>${esc(e.blood || p.blood || '—')}</b></div>
              <div><span>Marital Status</span><b>${esc(e.marital || p.marital || 'Single')}</b></div>
              <div><span>Nationality</span><b>Indian</b></div>
            </div>
          </div>
          <div class="profile-sec-card">
            <h4>${ic('chat', 16)} Contact & Emergency Details</h4>
            <div class="kv-grid">
              <div><span>Official Email</span><b><a href="mailto:${esc(e.email || mail(e.name))}" class="link">${esc(e.email || mail(e.name))}</a></b></div>
              <div><span>Personal Email</span><b>${p.pemail ? `<a href="mailto:${esc(p.pemail)}" class="link">${esc(p.pemail)}</a>` : '<span class="muted">—</span>'}</b></div>
              <div><span>Mobile Phone</span><b><a href="tel:${esc(e.phone || '—')}" class="link">${esc(e.phone || '—')}</a></b></div>
              <div><span>Emergency Contact</span><b>${esc(e.emergency || (p.ecName ? `${p.ecName || ''} (${p.ecPhone || ''})` : '—'))}</b></div>
            </div>
            <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line)">
              <span class="muted" style="font-size:12.5px;display:block;margin-bottom:4px">Current Residential Address</span>
              <p style="margin:0;font-size:13.5px;line-height:1.4">${esc(e.address || p.address || 'Address on record at ' + (e.loc || 'Hyderabad') + ' corporate hub')}</p>
            </div>
          </div>`;
      } else if (curTab === 'Job & Organization') {
        const mgr = S.employees.find(m => m.name === e.mgr);
        const deptObj = S.depts.find(d => d.n === e.dept);
        tabBody = `
          <div class="profile-sec-card">
            <h4>${ic('org', 16)} Position & Departmental Hierarchy</h4>
            <div class="kv-grid">
              <div><span>Employee ID</span><b><span class="emp-copy-id" onclick="copyEmpId('${e.id}',event)">${e.id}</span></b></div>
              <div><span>Designation</span><b>${esc(e.role)}</b></div>
              <div><span>Department</span><b>${esc(e.dept)}</b></div>
              <div><span>Cost Centre</span><b>${esc(deptObj?.cc || 'CC-200')}</b></div>
              <div><span>Grade & Level</span><b><span class="pill p-mute">${esc(e.grade || 'L4')}</span></b></div>
              <div><span>Reporting Manager</span><b>${mgr ? `<button class="link" onclick="empMasterDrawer('${mgr.id}')">${esc(mgr.name)}</button>` : (e.mgr ? esc(e.mgr) : '<span class="muted">Leadership</span>')}</b></div>
            </div>
          </div>
          <div class="profile-sec-card">
            <h4>${ic('calendar', 16)} Terms of Employment & Work Schedule</h4>
            <div class="kv-grid">
              <div><span>Employment Type</span><b>${esc(e.type || r.type || 'Full-time')}</b></div>
              <div><span>Base Location</span><b>${esc(e.loc)}</b></div>
              <div><span>Assigned Shift</span><b>${esc(e.shift || 'General (09:30 - 18:30)')}</b></div>
              <div><span>Date of Joining</span><b>${fd(e.joined)}</b></div>
              <div><span>Total Tenure</span><b>${tenure}</b></div>
              <div><span>Probation Status</span><b>${e.status === 'Probation' ? `<span class="pill p-warn">Probation till ${fd(r.probEnd || '2026-12-31')}</span>` : '<span class="pill p-ok">Confirmed</span>'}</b></div>
              <div><span>Notice Period</span><b>60 Days</b></div>
              <div><span>Portal Role</span><b>${S.accounts.find(a => a.name === e.name)?.role || 'Employee'}</b></div>
            </div>
          </div>`;
      } else if (curTab === 'Statutory & Bank') {
        const panRaw = p.pan || e.pan || ('ABCDE' + e.id.replace(/\D/g, '').slice(-4) + 'F');
        const panMasked = mask(panRaw);
        const uanRaw = p.uan || e.uan || ('1009' + e.id.replace(/\D/g, '').padStart(8, '0'));
        const uanMasked = mask(uanRaw);
        const acctRaw = p.acct || e.acct || ('50100' + e.id.replace(/\D/g, '').padStart(7, '3'));
        const acctMasked = mask(acctRaw);

        tabBody = `
          <div class="profile-sec-card">
            <h4>${ic('shield', 16)} Statutory & Tax Identifiers</h4>
            <div class="kv-grid">
              <div>
                <span>PAN Number</span>
                <div class="mask-val-row">
                  <b id="pan_${e.id}" data-raw="${esc(panRaw)}" data-masked="${esc(panMasked)}">${esc(MASK_STATE['pan_' + e.id] ? panRaw : panMasked)}</b>
                  <button class="mask-toggle-btn" id="btn_pan_${e.id}" title="Toggle reveal" onclick="toggleMaskVal('pan','${e.id}')">${ic('eye', 13)}</button>
                </div>
              </div>
              <div>
                <span>Aadhaar (Last 4 digits)</span>
                <b>•••• •••• ${esc(p.aadhaar || e.id.replace(/\D/g, '').slice(-4))}</b>
              </div>
              <div>
                <span>Universal Account Number (UAN)</span>
                <div class="mask-val-row">
                  <b id="uan_${e.id}" data-raw="${esc(uanRaw)}" data-masked="${esc(uanMasked)}">${esc(MASK_STATE['uan_' + e.id] ? uanRaw : uanMasked)}</b>
                  <button class="mask-toggle-btn" id="btn_uan_${e.id}" title="Toggle reveal" onclick="toggleMaskVal('uan','${e.id}')">${ic('eye', 13)}</button>
                </div>
              </div>
              <div>
                <span>ESIC Number</span>
                <b>${esc(p.esi || 'Not applicable (CTC > ₹21k/mo)')}</b>
              </div>
              <div>
                <span>Tax Regime</span>
                <b>New Tax Regime (FY 2026-27)</b>
              </div>
              <div>
                <span>Identity Status</span>
                <b>${pill('Verified')}</b>
              </div>
            </div>
          </div>
          <div class="profile-sec-card">
            <h4>${ic('pay', 16)} Salary Bank Account</h4>
            <div class="kv-grid">
              <div><span>Bank Name</span><b>${esc(p.bank || e.bank || 'HDFC Bank Ltd.')}</b></div>
              <div>
                <span>Bank Account Number</span>
                <div class="mask-val-row">
                  <b id="acct_${e.id}" data-raw="${esc(acctRaw)}" data-masked="${esc(acctMasked)}">${esc(MASK_STATE['acct_' + e.id] ? acctRaw : acctMasked)}</b>
                  <button class="mask-toggle-btn" id="btn_acct_${e.id}" title="Toggle reveal" onclick="toggleMaskVal('acct','${e.id}')">${ic('eye', 13)}</button>
                </div>
              </div>
              <div><span>IFSC Code</span><b>${esc(p.ifsc || e.ifsc || 'HDFC0001234')}</b></div>
              <div><span>Disbursement Mode</span><b>Direct Bank Transfer (NEFT/IMPS)</b></div>
              <div><span>Bank Verification</span><b>${pill('Verified')}</b></div>
            </div>
          </div>`;
      } else if (curTab === 'Compensation & Leaves') {
        const approvedLeaves = S.leaves.filter(l => l.emp === e.name && l.status === 'Approved');
        const daysUsed = approvedLeaves.reduce((a, l) => a + l.days, 0);
        tabBody = `
          <div class="profile-sec-card">
            <h4>${ic('pay', 16)} Compensation Structure</h4>
            <div class="kv-grid" style="margin-bottom:14px">
              <div><span>Annual CTC</span><b style="font-size:16px;color:var(--brand)">${inr(e.ctc)}</b></div>
              <div><span>Monthly Gross</span><b>${inr(s.gross)}</b></div>
              <div><span>Estimated Monthly Net</span><b style="color:var(--ok)">${inr(s.net)}</b></div>
              <div><span>Provident Fund (Employer + Employee)</span><b>${inr(s.pfE * 2)} / mo</b></div>
            </div>
            <div class="table-wrap" style="margin:0">
              <table style="font-size:13px">
                <thead><tr><th>Component</th><th>Monthly</th><th>Annual</th></tr></thead>
                <tbody>
                  ${s.earn.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${inr(v)}</td><td>${inr(v * 12)}</td></tr>`).join('')}
                  ${s.ded.map(([k, v]) => `<tr style="color:var(--muted)"><td>${esc(k)} (Deduction)</td><td>-${inr(v)}</td><td>-${inr(v * 12)}</td></tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
          <div class="profile-sec-card">
            <h4>${ic('leave', 16)} Leave Quotas & Utilisation</h4>
            <div class="kv-grid" style="margin-bottom:12px">
              <div><span>Leave Taken (2026)</span><b>${daysUsed} days</b></div>
              <div><span>Pending Requests</span><b>${S.leaves.filter(l => l.emp === e.name && l.status === 'Pending').length} requests</b></div>
            </div>
            <div class="table-wrap" style="margin:0">
              <table style="font-size:13px">
                <thead><tr><th>Leave Type</th><th>Annual Quota</th><th>Used</th><th>Available Balance</th></tr></thead>
                <tbody>
                  ${S.leaveTypes.filter(x => x.q).map(lt => {
                    const u = used(e.name, lt.n);
                    const bal = Math.max(0, lt.q - u);
                    return `<tr><td><b>${esc(lt.n)}</b></td><td>${lt.q} days</td><td>${u}</td><td><b style="color:${bal <= 2 ? 'var(--warn)' : 'var(--ok)'}">${bal} days</b></td></tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>`;
      } else if (curTab === 'Assets & Docs') {
        const assList = S.assets.filter(a => a.emp === e.name);
        const docList = S.empDocs.filter(d => d.emp === e.name);
        tabBody = `
          <div class="profile-sec-card">
            <h4>${ic('laptop', 16)} IT Hardware & Equipment Assigned</h4>
            ${assList.length ? tbl([
              ['Asset Tag', a => `<b>${a.tag}</b>`],
              ['Type', a => a.type],
              ['Model', a => esc(a.model)],
              ['Assigned On', a => fd(a.since || e.joined)],
              ['Status', a => pill(a.status)]
            ], assList) : '<p class="muted" style="margin:0;font-size:13px">No hardware assets currently checked out.</p>'}
          </div>
          <div class="profile-sec-card">
            <h4>${ic('doc', 16)} Verification Documents & Records</h4>
            ${docList.length ? tbl([
              ['Document', d => `<b>${esc(d.doc)}</b>`],
              ['Status', d => pill(d.status)],
              ['Verified By', d => d.status === 'Verified' ? 'People Ops' : 'Pending']
            ], docList) : `
              <div class="list">
                <div class="row"><div class="grow"><b>Identity & Address Proof</b><div class="sub">Aadhaar card submitted during onboarding</div></div>${pill('Verified')}</div>
                <div class="row"><div class="grow"><b>Permanent Account Number (PAN)</b><div class="sub">Verified via NSDL API check</div></div>${pill('Verified')}</div>
                <div class="row"><div class="grow"><b>Degree Certificate & Background</b><div class="sub">Highest educational degree verified</div></div>${pill('Verified')}</div>
                <div class="row"><div class="grow"><b>Previous Experience & Relieving</b><div class="sub">Relieving letter and pay slips on file</div></div>${pill('Verified')}</div>
              </div>`}
          </div>`;
      } else if (curTab === 'Audit & History') {
        const hist = S.audit.filter(a => a.a.includes(e.name) || a.a.includes(e.id));
        tabBody = `
          <div class="profile-sec-card">
            <h4>${ic('shield', 16)} Lifecycle Milestones</h4>
            <div class="list">
              <div class="row">
                <span class="av" style="background:var(--ok-bg);color:var(--ok)">${ic('check', 16)}</span>
                <div class="grow"><b>Joined Brightcone</b><div class="sub">${fd(e.joined)} · Registered as ${esc(e.role)} in ${esc(e.dept)}</div></div>
              </div>
              <div class="row">
                <span class="av" style="background:var(--info-bg);color:var(--brand)">${ic('clock', 16)}</span>
                <div class="grow"><b>Probation Confirmation</b><div class="sub">${e.status === 'Probation' ? `Ongoing evaluation (Ends ${fd(r.probEnd || '2026-12-31')})` : 'Successfully completed and confirmed'}</div></div>
              </div>
              <div class="row">
                <span class="av" style="background:var(--surface-2);color:var(--muted)">${ic('pay', 16)}</span>
                <div class="grow"><b>Latest Annual CTC</b><div class="sub">${inr(e.ctc)} per annum</div></div>
              </div>
            </div>
          </div>
          <div class="profile-sec-card">
            <h4>${ic('list', 16)} Audit Log for this Employee</h4>
            ${hist.length ? `<div class="list">${hist.map(h => `<div class="row"><div class="grow"><b>${esc(h.a)}</b><div class="sub">${esc(h.t)} · by ${esc(h.who)}</div></div></div>`).join('')}</div>`
              : '<p class="muted" style="margin:0;font-size:13px">No recent audit trail entries specifically tagging this employee.</p>'}
          </div>`;
      }

      drawer(`
        <div class="profile-hero">
          ${av(e.name, 'lg')}
          <div class="profile-hero-content">
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
              <span class="profile-hero-name">${esc(e.name)}</span>
              <span class="emp-copy-id" title="Copy ID" onclick="copyEmpId('${e.id}',event)">${e.id}</span>
              ${pill(e.status)}
            </div>
            <div class="profile-hero-role">${esc(e.role)} · ${esc(e.dept)} · <span class="pill p-mute">${esc(e.grade || 'L4')}</span></div>
            <div class="profile-quick-chips">
              <a href="mailto:${esc(e.email || mail(e.name))}" class="profile-chip" title="Send email">${ic('chat', 13)} ${esc(e.email || mail(e.name))}</a>
              ${e.phone ? `<a href="tel:${esc(e.phone)}" class="profile-chip" title="Call">${ic('chat', 13)} ${esc(e.phone)}</a>` : ''}
              <span class="profile-chip">${ic('org', 13)} ${esc(e.loc)}</span>
              <span class="profile-chip">${ic('calendar', 13)} ${esc(e.shift || 'General')}</span>
            </div>
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px">
          ${btn('Edit Master', `openAddMasterModal('${e.id}')`, 'primary', 'edit')}
          ${btn('Revise Salary', `reviseSalary('${e.id}')`, '', 'pay')}
          ${btn('Issue Letter', `issueLetter('${e.name}')`, '', 'doc')}
          ${btn('Reset Password', `resetPw('${esc(e.email || mail(e.name))}')`, '', 'shield')}
          ${e.status === 'Inactive' ? btn('Reactivate', `setStatus('${e.id}','Active')`, 'ok') : btn('Deactivate', `setStatus('${e.id}','Inactive')`, 'bad')}
        </div>
        <div class="tabs subtabs" role="tablist" style="margin-bottom:16px;overflow-x:auto;padding-bottom:4px">
          ${tabsList.map(t => `<button role="tab" class="${t === curTab ? 'on' : ''}" onclick="TAB.profileTab='${t}';empMasterDrawer('${e.id}')">${t}</button>`).join('')}
        </div>
        <div>${tabBody}</div>
      `);
    }

    /* ---------- Add / Edit Employee Master Data Modal ---------- */
    function openAddMasterModal(empId) {
      syncEmployeeStores();
      const isEdit = !!empId;
      const e = isEdit ? S.employees.find(x => x.id === empId) : {};
      const p = isEdit ? (recs('profile').find(x => x.emp === empId) || {}) : {};
      const r = isEdit ? (recs('emp').find(x => x.id === empId) || {}) : {};

      const parts = (e.name || '').trim().split(' ');
      const firstVal = r.first || parts[0] || '';
      const lastVal = r.last || parts.slice(1).join(' ') || '';

      const dNames = deptNames();
      const locList = S.locations;
      const gradeList = S.grades.map(g => g[0]);
      const mgrList = S.employees.filter(x => !isEdit || x.id !== empId).map(x => x.name);

      const title = isEdit ? `Edit Employee Master: ${esc(e.name)}` : 'Add New Employee Master Record';
      const sub = isEdit ? `Employee ID: ${esc(e.id)} · Changes are synchronized across all modules and audit logged.` : 'Create a complete employee record. ID is generated automatically.';

      modal(`
        <h2>${title}</h2>
        <p class="sub">${sub}</p>
        <form id="masterForm" onsubmit="saveMasterEmployee(event, '${empId || ''}')" novalidate>
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--brand);margin:16px 0 10px;padding-bottom:4px;border-bottom:1px solid var(--line)">1. Personal & Contact Details</div>
          <div class="frow">
            <label class="field">First name <span class="req">*</span><input class="input" id="mf_first" value="${esc(firstVal)}" required placeholder="e.g. Rahul"></label>
            <label class="field">Last name <span class="req">*</span><input class="input" id="mf_last" value="${esc(lastVal)}" required placeholder="e.g. Varma"></label>
          </div>
          <div class="frow">
            <label class="field">Work email <span class="req">*</span><input class="input" type="email" id="mf_email" value="${esc(e.email || '')}" placeholder="firstname.lastname@brightcone.ai" required></label>
            <label class="field">Mobile phone <span class="req">*</span><input class="input" type="tel" id="mf_phone" value="${esc(e.phone || '')}" placeholder="+91 98480 11000" required></label>
          </div>
          <div class="frow">
            <label class="field">Date of birth<input class="input" type="date" id="mf_dob" value="${esc(e.dob || r.dob || '')}"></label>
            <label class="field">Gender<select class="input" id="mf_gender"><option value="Male" ${(e.gender || r.gender) === 'Male' ? 'selected' : ''}>Male</option><option value="Female" ${(e.gender || r.gender) === 'Female' ? 'selected' : ''}>Female</option><option value="Non-binary" ${(e.gender || r.gender) === 'Non-binary' ? 'selected' : ''}>Non-binary</option><option value="Prefer not to say" ${(e.gender || r.gender) === 'Prefer not to say' ? 'selected' : ''}>Prefer not to say</option></select></label>
          </div>
          <div class="frow">
            <label class="field">Blood group<select class="input" id="mf_blood">${['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => `<option value="${b}" ${(e.blood || p.blood) === b ? 'selected' : ''}>${b}</option>`).join('')}</select></label>
            <label class="field">Marital status<select class="input" id="mf_marital"><option value="Single" ${(e.marital || p.marital) === 'Single' ? 'selected' : ''}>Single</option><option value="Married" ${(e.marital || p.marital) === 'Married' ? 'selected' : ''}>Married</option><option value="Other" ${(e.marital || p.marital) === 'Other' ? 'selected' : ''}>Other</option></select></label>
          </div>
          <label class="field">Residential address<textarea class="input" id="mf_address" rows="2" placeholder="Full residential address">${esc(e.address || p.address || '')}</textarea></label>

          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--brand);margin:20px 0 10px;padding-bottom:4px;border-bottom:1px solid var(--line)">2. Job & Organizational Placement</div>
          <div class="frow">
            <label class="field">Designation / Role <span class="req">*</span><input class="input" id="mf_role" value="${esc(e.role || '')}" placeholder="e.g. Senior Backend Engineer" required></label>
            <label class="field">Department <span class="req">*</span><select class="input" id="mf_dept">${dNames.map(d => `<option value="${esc(d)}" ${e.dept === d ? 'selected' : ''}>${esc(d)}</option>`).join('')}</select></label>
          </div>
          <div class="frow">
            <label class="field">Grade level<select class="input" id="mf_grade">${gradeList.map(g => `<option value="${esc(g)}" ${(e.grade || 'L4') === g ? 'selected' : ''}>${esc(g)}</option>`).join('')}</select></label>
            <label class="field">Work location <span class="req">*</span><select class="input" id="mf_loc">${locList.map(l => `<option value="${esc(l)}" ${(e.loc || 'Hyderabad') === l ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>
          </div>
          <div class="frow">
            <label class="field">Reporting manager<select class="input" id="mf_mgr"><option value="">None (Top Executive)</option>${mgrList.map(m => `<option value="${esc(m)}" ${e.mgr === m ? 'selected' : ''}>${esc(m)}</option>`).join('')}</select></label>
            <label class="field">Employment type<select class="input" id="mf_type"><option value="Full-time" ${(e.type || r.type) === 'Full-time' ? 'selected' : ''}>Full-time</option><option value="Part-time" ${(e.type || r.type) === 'Part-time' ? 'selected' : ''}>Part-time</option><option value="Contract" ${(e.type || r.type) === 'Contract' ? 'selected' : ''}>Contract</option><option value="Intern" ${(e.type || r.type) === 'Intern' ? 'selected' : ''}>Intern</option></select></label>
          </div>
          <div class="frow">
            <label class="field">Date of joining <span class="req">*</span><input class="input" type="date" id="mf_doj" value="${esc(e.joined || todayISO())}" required></label>
            <label class="field">Work shift<select class="input" id="mf_shift">${S.shifts.map(s => `<option value="${esc(s.n)}" ${(e.shift || 'General') === s.n ? 'selected' : ''}>${esc(s.n)} (${s.s} - ${s.e})</option>`).join('')}</select></label>
          </div>

          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--brand);margin:20px 0 10px;padding-bottom:4px;border-bottom:1px solid var(--line)">3. Compensation & Statutory Banking</div>
          <div class="frow">
            <label class="field">Annual CTC (₹) <span class="req">*</span><input class="input" type="number" id="mf_ctc" value="${esc(e.ctc || '')}" placeholder="e.g. 2400000" required oninput="calcMasterCtcPreview(this.value)"></label>
            <div id="ctcPreviewBox" style="font-size:12.5px;color:var(--muted);background:var(--surface-2);padding:8px 12px;border-radius:8px;align-self:center">
              Monthly Gross: <b>${inr(salary(e).gross||0)}</b> · Net est.: <b>${inr(salary(e).net || 0)}</b>
            </div>
          </div>
          <div class="frow">
            <label class="field">PAN Number<input class="input" id="mf_pan" value="${esc(p.pan || e.pan || '')}" placeholder="ABCDE1234F" style="text-transform:uppercase"></label>
            <label class="field">Aadhaar (last 4 digits)<input class="input" id="mf_aadhaar" maxlength="4" value="${esc(p.aadhaar || '')}" placeholder="1234"></label>
          </div>
          <div class="frow">
            <label class="field">Salary Bank Name<input class="input" id="mf_bank" value="${esc(p.bank || e.bank || 'HDFC Bank')}" placeholder="e.g. HDFC Bank"></label>
            <label class="field">Bank Account Number<input class="input" id="mf_acct" value="${esc(p.acct || e.acct || '')}" placeholder="Account number"></label>
          </div>
          <div class="frow">
            <label class="field">Bank IFSC Code<input class="input" id="mf_ifsc" value="${esc(p.ifsc || e.ifsc || 'HDFC0001234')}" placeholder="HDFC0001234" style="text-transform:uppercase"></label>
            <label class="field">UAN / PF Number<input class="input" id="mf_uan" value="${esc(p.uan || e.uan || '')}" placeholder="100912345678"></label>
          </div>

          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--brand);margin:20px 0 10px;padding-bottom:4px;border-bottom:1px solid var(--line)">4. Employment Status & Access</div>
          <div class="frow">
            <label class="field">Employment status <span class="req">*</span><select class="input" id="mf_status">${['Active', 'Probation', 'Notice period', 'On leave', 'Inactive'].map(s => `<option value="${s}" ${(e.status || 'Active') === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
            <label class="field">Portal access role<select class="input" id="mf_accrole"><option value="Employee" ${(S.accounts.find(a => a.name === e.name)?.role || 'Employee') === 'Employee' ? 'selected' : ''}>Employee (Self Service)</option><option value="HR Admin" ${(S.accounts.find(a => a.name === e.name)?.role) === 'HR Admin' ? 'selected' : ''}>HR Admin (Full Access)</option></select></label>
          </div>

          <p id="mferr" role="alert" style="color:var(--bad);font-size:13px;margin:8px 0 12px;min-height:1px"></p>
          <div class="mfoot">
            <button type="button" class="btn" onclick="closeAll()">Cancel</button>
            <button type="submit" class="btn primary" id="mf_submit">${isEdit ? 'Save Changes' : 'Create Employee Master Record'}</button>
          </div>
        </form>
      `);
      document.getElementById('modal').classList.add('wide');
      setTimeout(() => document.getElementById('mf_first')?.focus(), 60);
    }

    async function calcMasterCtcPreview(val){const box=document.getElementById('ctcPreviewBox');if(!box)return;box.dataset.ctc=String(val);try{const s=await request('/money/preview','POST',{ctc:Number(val)||0});if(box.isConnected&&box.dataset.ctc===String(val))box.innerHTML='Monthly Gross: <b>'+inr(s.gross)+'</b> · Net est.: <b>'+inr(s.net)+'</b>'}catch(error){box.textContent=error.message}}

    function saveMasterEmployee(ev, empId) {
      ev.preventDefault();
      const errBox = document.getElementById('mferr');
      const err = m => { if (errBox) errBox.textContent = m; return false; };

      const first = (document.getElementById('mf_first')?.value || '').trim();
      const last = (document.getElementById('mf_last')?.value || '').trim();
      if (!first || !last) return err('First name and last name are required.');

      const fullName = `${first} ${last}`.trim();
      let email = (document.getElementById('mf_email')?.value || '').trim().toLowerCase();
      if (!email) email = mail(fullName);
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return err('Please enter a valid work email.');

      const phone = (document.getElementById('mf_phone')?.value || '').trim();
      const role = (document.getElementById('mf_role')?.value || '').trim();
      if (!role) return err('Designation / Role is required.');

      const dept = document.getElementById('mf_dept')?.value || 'Engineering';
      const grade = document.getElementById('mf_grade')?.value || 'L4';
      const loc = document.getElementById('mf_loc')?.value || 'Hyderabad';
      const mgr = document.getElementById('mf_mgr')?.value || '';
      const type = document.getElementById('mf_type')?.value || 'Full-time';
      const doj = document.getElementById('mf_doj')?.value || todayISO();
      const shift = document.getElementById('mf_shift')?.value || 'General';
      const ctc = Number(document.getElementById('mf_ctc')?.value) || 0;
      const status = document.getElementById('mf_status')?.value || 'Active';
      const accRole = document.getElementById('mf_accrole')?.value || 'Employee';

      const dob = document.getElementById('mf_dob')?.value || '';
      const gender = document.getElementById('mf_gender')?.value || 'Prefer not to say';
      const blood = document.getElementById('mf_blood')?.value || 'O+';
      const marital = document.getElementById('mf_marital')?.value || 'Single';
      const address = (document.getElementById('mf_address')?.value || '').trim();
      const pan = (document.getElementById('mf_pan')?.value || '').trim().toUpperCase();
      const aadhaar = (document.getElementById('mf_aadhaar')?.value || '').trim();
      const bank = (document.getElementById('mf_bank')?.value || '').trim() || 'HDFC Bank';
      const acct = (document.getElementById('mf_acct')?.value || '').trim();
      const ifsc = (document.getElementById('mf_ifsc')?.value || '').trim().toUpperCase();
      const uan = (document.getElementById('mf_uan')?.value || '').trim();

      const isEdit = !!empId;
      let eObj = isEdit ? S.employees.find(x => x.id === empId) : null;

      // Duplicate email check
      if (S.employees.some(x => x.email.toLowerCase() === email.toLowerCase() && (!isEdit || x.id !== empId))) {
        return err('Another employee already uses this email.');
      }

      if (!isEdit) {
        const idNum = 1071 + S.employees.length;
        const newId = 'BC-' + idNum;
        eObj = {
          id: newId,
          name: fullName,
          role,
          dept,
          loc,
          status,
          joined: doj,
          mgr,
          ctc,
          phone,
          shift,
          grade,
          email,
          dob,
          gender,
          blood,
          marital,
          address,
          pan,
          aadhaar,
          bank,
          acct,
          ifsc,
          uan
        };
        S.employees.push(eObj);
        addAccount(eObj, accRole);
        S.onboard.unshift({
          emp: fullName,
          tasks: [
            ['Offer letter signed', 1],
            ['Laptop & accounts provisioned', 0],
            ['ID and PAN submitted', 0],
            ['Bank details for payroll', 0],
            ['Security & POSH training', 0],
            ['Buddy assigned', 0],
            ['30-day check-in with manager', 0]
          ]
        });
        log(`Added employee master ${fullName} (${newId})`);
        raudit(`Added employee master ${fullName} (${newId})`);
        toast(`Employee ${fullName} (${newId}) created`);
      } else {
        const oldName = eObj.name;
        Object.assign(eObj, {
          name: fullName,
          role,
          dept,
          loc,
          status,
          joined: doj,
          mgr,
          ctc,
          phone,
          shift,
          grade,
          email,
          dob,
          gender,
          blood,
          marital,
          address,
          pan,
          aadhaar,
          bank,
          acct,
          ifsc,
          uan
        });
        const acctObj = S.accounts.find(a => a.email === email || a.name === oldName);
        if (acctObj) {
          acctObj.name = fullName;
          acctObj.email = email;
          acctObj.role = accRole;
        }
        log(`Updated employee master ${fullName} (${empId})`);
        raudit(`Updated employee master ${fullName} (${empId})`);
        toast(`Employee record ${empId} updated`);
      }

      // Sync into R records
      const emps = recs('emp');
      let rObj = emps.find(x => x.id === eObj.id);
      if (!rObj) {
        rObj = { id: eObj.id, _c: nowISO(), _cb: USER ? USER.email : 'system' };
        emps.push(rObj);
      }
      Object.assign(rObj, {
        first,
        last,
        email,
        phone,
        dob,
        gender,
        department: dept,
        designation: role,
        grade,
        location: loc,
        manager: S.employees.find(m => m.name === mgr)?.id || '',
        type,
        doj,
        probEnd: status === 'Probation' ? (rObj.probEnd || addMonths(doj, 6)) : '',
        status: status === 'On leave' ? 'Active' : status === 'Inactive' ? 'Exited' : status,
        ctc,
        _u: nowISO(),
        _ub: USER ? USER.email : 'system'
      });

      const profs = recs('profile');
      let pObj = profs.find(x => x.emp === eObj.id);
      if (!pObj) {
        pObj = { id: 'PRF-' + eObj.id.replace('BC-', ''), emp: eObj.id, _c: nowISO(), _cb: USER ? USER.email : 'system' };
        profs.push(pObj);
      }
      Object.assign(pObj, {
        marital,
        address,
        blood,
        pan,
        aadhaar,
        uan,
        bank,
        acct,
        ifsc,
        status: 'Verified',
        _u: nowISO()
      });

      rsave();
      save();
      closeAll();
      rerender();
    }

    /* ---------- Master CSV Export & Import ---------- */
    function exportMasterCsv() {
      syncEmployeeStores();
      const rows = [
        ['Employee ID', 'Full Name', 'Work Email', 'Phone', 'Designation', 'Department', 'Grade', 'Location', 'Reporting Manager', 'Shift', 'Date of Joining', 'Status', 'Annual CTC', 'Blood Group', 'PAN', 'Bank', 'IFSC']
      ];
      S.employees.forEach(e => {
        rows.push([
          e.id,
          e.name,
          e.email || mail(e.name),
          e.phone || '',
          e.role,
          e.dept,
          e.grade || 'L4',
          e.loc,
          e.mgr || '',
          e.shift || 'General',
          e.joined,
          e.status,
          e.ctc || 0,
          e.blood || '',
          e.pan || '',
          e.bank || '',
          e.ifsc || ''
        ]);
      });
      csvDownload(`brightcone-employee-master-${tdy()}.csv`, rows);
      log('Exported Employee Master Data to CSV');
      toast(`Exported ${S.employees.length} employee records to CSV`);
    }

    function importMasterCsv() {
      modal(`
        <h2>Import Employee Master Data</h2>
        <p class="sub">Upload a CSV file containing employee master records. Existing employee IDs are updated; new IDs are created automatically.</p>
        <div style="background:var(--surface-2);border:1px dashed var(--line);border-radius:12px;padding:24px;text-align:center;margin-bottom:18px">
          <input type="file" id="masterCsvInput" accept=".csv,text/csv" style="display:none" onchange="handleMasterCsvFile(this.files[0])">
          <div style="font-size:32px;color:var(--brand);margin-bottom:8px">${ic('upload', 32)}</div>
          <p style="margin:0 0 12px;font-size:14px;color:var(--text)"><b>Choose a CSV file</b> or drag and drop</p>
          <button type="button" class="btn primary" onclick="document.getElementById('masterCsvInput').click()">Browse CSV File</button>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <button type="button" class="link" onclick="exportMasterCsv()">${ic('download', 14)} Download Master Template</button>
          <button type="button" class="btn" onclick="closeAll()">Cancel</button>
        </div>
      `);
    }

    function handleMasterCsvFile(file) {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (e) {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        if (lines.length < 2) { toast('CSV file is empty or missing headers'); return; }
        let imported = 0, updated = 0;
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.replace(/^["']|["']$/g, '').trim());
          if (!cols[1]) continue;
          const id = cols[0] || ('BC-' + (1071 + S.employees.length));
          const name = cols[1];
          const email = cols[2] || mail(name);
          const role = cols[4] || 'Software Engineer';
          const dept = cols[5] || 'Engineering';
          const grade = cols[6] || 'L4';
          const loc = cols[7] || 'Hyderabad';
          const existing = S.employees.find(x => x.id === id || x.name === name);
          if (existing) {
            Object.assign(existing, { role, dept, grade, loc, email });
            updated++;
          } else {
            const newEmp = { id, name, email, role, dept, grade, loc, status: 'Active', joined: todayISO(), ctc: 1800000, shift: 'General' };
            S.employees.push(newEmp);
            addAccount(newEmp);
            imported++;
          }
        }
        syncEmployeeStores();
        save();
        rsave();
        closeAll();
        rerender();
        log(`Imported ${imported} employees, updated ${updated}`);
        toast(`Success: ${imported} added, ${updated} updated from CSV`);
      };
      reader.readAsText(file);
    }

    /* Backwards compatibility bindings */
    function addEmp() { openAddMasterModal(); }
    function editEmp(id) { openAddMasterModal(id); }
    function empDrawer(id) { empMasterDrawer(id); }
    function setStatus(id, s) { const e = S.employees.find(x => x.id === id); confirmBox(`${s === 'Inactive' ? 'Deactivate' : 'Reactivate'} ${e.name}?`, s === 'Inactive' ? 'They lose portal access and are excluded from payroll.' : 'Their access and payroll are restored.', s === 'Inactive' ? 'Deactivate' : 'Reactivate', () => { e.status = s; log(`Set ${e.id} to ${s}`); toast(`${e.name} is now ${s.toLowerCase()}`) }, s === 'Inactive'); }
    function reviseSalary(id) { const e = S.employees.find(x => x.id === id); form(`Revise salary for ${e.name}`, `Current CTC ${inr(e.ctc)}.`, [{ k: 'ctc', l: 'New annual CTC (₹)', t: 'number', v: e.ctc, req: true, half: true }, { k: 'eff', l: 'Effective from', t: 'date', v: todayISO(), half: true }, { k: 'why', l: 'Reason', t: 'select', o: ['Annual appraisal', 'Promotion', 'Market correction', 'Retention'] }], 'Save revision', v => { const old = e.ctc; e.ctc = +v.ctc; log(`Revised CTC for ${e.id} from ${inr(old)} to ${inr(e.ctc)}`); toast(`Salary revised by ${Math.round((e.ctc - old) / old * 100)}%`); }); }
    function issueLetter(n) { form(`Issue letter to ${n}`, 'The letter is generated on company letterhead and shared with the employee.', [{ k: 'type', l: 'Letter', t: 'select', o: ['Appointment letter', 'Confirmation letter', 'Salary revision letter', 'Promotion letter', 'Warning letter', 'Experience letter', 'Relieving letter'] }], 'Generate & send', v => { S.letters.unshift({ id: 'LT' + uid(), emp: n, type: v.type, to: 'Employee', status: 'Issued', date: todayISO() }); log(`Issued ${v.type} to ${n}`); toast(`${v.type} sent to ${n}`); }); }
    function importCsv() { importMasterCsv(); }

    /* ---------- Org structure ---------- */
    V.orgStructure = () => {
      const T = ['Departments', 'Designations & grades', 'Locations', 'Org chart'], t = tabOf('orgStructure', T); let b = '';
      if (t === 'Departments') b = card('Departments', tbl([['Department', r => `<b>${r.n}</b>`], ['Head', r => r.head], ['Cost centre', r => r.cc], ['Headcount', r => S.employees.filter(e => e.dept === r.n && e.status !== 'Inactive').length], ['', r => `<button class="btn sm" onclick="editDept('${r.n}')">${ic('edit', 15)}</button> <button class="btn sm bad" aria-label="Delete" onclick="delDept('${r.n}')">${ic('trash', 15)}</button>`]], S.depts), `<button class="link" onclick="editDept()">Add department</button>`);
      if (t === 'Designations & grades') b = card('Grades', tbl([['Grade', r => `<b>${r[0]}</b>`], ['Band', r => r[1]], ['Employees', r => S.employees.filter(e => e.grade === r[0]).length]], S.grades), `<button class="link" onclick="addGrade()">Add grade</button>`);
      if (t === 'Locations') b = card('Office locations', tbl([['Location', r => `<b>${r}</b>`], ['Employees', r => S.employees.filter(e => e.loc === r).length]], S.locations), `<button class="link" onclick="form('Add location','Used for holidays, payroll state and attendance.',[{k:'n',l:'Location name',req:true}],'Add location',v=>{S.locations.push(v.n);toast('Location added')})">Add location</button>`);
      if (t === 'Org chart') b = card('Organisation chart', orgTree());
      return head('Org structure', 'Departments, grades, locations and reporting lines.') + tabs('orgStructure', T) + b
    };
    function editDept(n) { const d = S.depts.find(x => x.n === n) || {}; form(n ? 'Edit department' : 'Add department', 'Department heads approve leave and expenses by default.', [{ k: 'n', l: 'Name', v: d.n, req: true }, { k: 'head', l: 'Head', t: 'select', o: S.employees.map(e => e.name), v: d.head, half: true }, { k: 'cc', l: 'Cost centre', v: d.cc || 'CC-' + (600 + S.depts.length), half: true }], n ? 'Save' : 'Add department', v => { if (n) { const old = d.n; Object.assign(d, v); S.employees.forEach(e => { if (e.dept === old) e.dept = v.n }) } else S.depts.push(v); log(`${n ? 'Edited' : 'Added'} department ${v.n}`); toast('Department saved') }) }
    function delDept(n) { if (S.employees.some(e => e.dept === n && e.status !== 'Inactive')) { toast(`Move people out of ${n} before deleting it`); return } confirmBox(`Delete ${n}?`, 'This can’t be undone.', 'Delete', () => { S.depts = S.depts.filter(d => d.n !== n); toast('Department deleted') }) }
    function addGrade() { form('Add grade', 'Grades drive salary bands and approval limits.', [{ k: 'g', l: 'Grade code', req: true, half: true, ph: 'L10' }, { k: 'b', l: 'Band name', req: true, half: true }], 'Add grade', v => { S.grades.push([v.g, v.b]); toast('Grade added') }) }

    /* ---------- Onboarding ---------- */
    V.onboarding = () => head('Onboarding', 'Checklists for every new joiner, from offer to their 30-day check-in.', btn('Add new hire', 'addEmp()', 'primary', 'plus')) +
      `<div class="grid g2">${S.onboard.map((o, i) => { const d = o.tasks.filter(t => t[1]).length, e = emp(o.emp); return `<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">${who(o.emp, `${e?.role || ''}, joined ${fd(e?.joined)}`)}${d === o.tasks.length ? btn('Complete', 'finishOnb(' + i + ')', 'sm ok') : ''}</div><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px"><span class="muted">Checklist</span><b>${d} of ${o.tasks.length} done</b></div>${bar(d / o.tasks.length * 100)}<div class="mt">${o.tasks.map((t, j) => `<label class="check ${t[1] ? 'done' : ''}"><input type="checkbox" ${t[1] ? 'checked' : ''} onchange="S.onboard[${i}].tasks[${j}][1]=this.checked?1:0;rerender()"><span>${t[0]}</span></label>`).join('')}</div><button class="link" onclick="addTask(${i})">Add task</button></div>` }).join('') || '<div class="card empty">No one is onboarding right now.</div>'}</div>
 <div class="mt">${card('Pre-joining documents', tbl([['Employee', r => who(r.emp)], ['Document', r => r.doc], ['Status', r => pill(r.status)], ['', r => r.status === 'Submitted' ? btn('Verify', `verifyDoc('${r.emp}','${r.doc}')`, 'sm ok') : r.status === 'Not submitted' ? btn('Send reminder', `toast('Reminder sent to ${r.emp}')`, 'sm') : '']], S.empDocs.filter(d => S.onboard.some(o => o.emp === d.emp))))}</div>`;
    function addTask(i) { form('Add checklist task', 'Added for this new joiner only.', [{ k: 't', l: 'Task', req: true }], 'Add task', v => { S.onboard[i].tasks.push([v.t, 0]) }) }
    function finishOnb(i) { const o = S.onboard[i]; S.onboard.splice(i, 1); log(`Completed onboarding for ${o.emp}`); toast(`Onboarding complete for ${o.emp}`); rerender() }
    function verifyDoc(e, d) { S.empDocs.find(x => x.emp === e && x.doc === d).status = 'Verified'; log(`Verified ${d} for ${e}`); toast(`${d} verified`); rerender() }

    /* ---------- Exits ---------- */
    V.exits = () => head('Exits & offboarding', 'Resignations, clearance and full & final settlement.', btn('Initiate exit', 'initExit()', 'primary', 'plus')) +
      `${S.resignations.filter(r => r.status === 'Pending').length ? `<div class="banner"><b>${S.resignations.filter(r => r.status === 'Pending').length} resignation waiting for a decision.</b> Review it below.</div>` : ''}
 ${card('Resignations', tbl([['Employee', r => who(r.emp)], ['Submitted', r => fd(r.date)], ['Last day', r => fd(r.lwd)], ['Reason', r => esc(r.reason)], ['Status', r => pill(r.status)], ['', r => r.status === 'Pending' ? `${btn('Accept', `decide('resignations','${r.id}',true)`, 'sm ok')} ${btn('Reject', `decide('resignations','${r.id}',false)`, 'sm bad')}` : '']], S.resignations))}
 <div class="grid g2 mt">${S.resignations.filter(r => r.status === 'Accepted' && r.check).map(r => { const i = S.resignations.indexOf(r), d = r.check.filter(c => c[1]).length; return `<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">${who(r.emp, 'Last day ' + fd(r.lwd))}${d === r.check.length ? btn('Close exit', `closeExit(${i})`, 'sm ok') : ''}</div>${bar(d / r.check.length * 100)}<div class="mt">${r.check.map((c, j) => `<label class="check ${c[1] ? 'done' : ''}"><input type="checkbox" ${c[1] ? 'checked' : ''} onchange="S.resignations[${i}].check[${j}][1]=this.checked?1:0;rerender()"><span>${c[0]}</span></label>`).join('')}</div><div style="display:flex;gap:8px;flex-wrap:wrap">${btn('Calculate F&F', `ffCalc('${r.emp}')`, 'sm')}${btn('Schedule exit interview', `toast('Exit interview scheduled with ${r.emp}')`, 'sm')}</div></div>` }).join('')}</div>`;
    function initExit() { form('Initiate exit', 'Use for terminations, contract ends or resignations received offline.', [{ k: 'emp', l: 'Employee', t: 'select', o: S.employees.filter(e => e.status !== 'Inactive').map(e => e.name) }, { k: 'lwd', l: 'Last working day', t: 'date', req: true }, { k: 'reason', l: 'Reason', t: 'select', o: ['Resignation', 'Termination', 'Contract end', 'Retirement', 'Absconding'] }], 'Initiate exit', v => { S.resignations.unshift({ id: 'RS' + uid(), emp: v.emp, date: todayISO(), lwd: v.lwd, reason: v.reason, status: 'Accepted', check: [['Manager approval', 1], ['Knowledge transfer', 0], ['Asset return', 0], ['Exit interview', 0], ['Full & final settlement', 0], ['Relieving & experience letter', 0]] }); emp(v.emp).status = 'Notice period'; log(`Initiated exit for ${v.emp}`); toast('Exit initiated') }) }
    function ffCalc(n){openMoneySettings(emp(n)?.id||'')}
    function closeExit(i) { const r = S.resignations[i]; r.status = 'Completed'; const e = emp(r.emp); if (e) e.status = 'Inactive'; S.assets.filter(a => a.emp === r.emp).forEach(a => { a.emp = ''; a.status = 'In stock' }); log(`Closed exit for ${r.emp}`); toast(`${r.emp} offboarded. Assets returned to stock.`); rerender() }

    /* ---------- Attendance admin ---------- */
    V.attendanceAdmin = () => {
      const T = ['Today', 'Regularisation', 'Shifts', 'Monthly report'], t = tabOf('attendanceAdmin', T); let b = '';
      const act = S.employees.filter(e => e.status !== 'Inactive');
      const st = (e, i) => e.status === 'On leave' ? 'On leave' : i % 5 === 2 ? 'Late' : i % 7 === 4 ? 'Absent' : e.loc === 'Remote' ? 'Remote' : 'Present';
      if (t === 'Today') b = `<div class="grid g4" style="margin-bottom:18px">${['Present', 'Remote', 'Late', 'On leave'].map(s => stat('clock', s, act.filter((e, i) => st(e, i) === s).length, 'employees today')).join('')}</div>` + card('Who’s in today', tbl([['Employee', r => who(r.name)], ['Shift', r => r.shift], ['Clock in', (r) => { const i = act.indexOf(r), s = st(r, i); return ['On leave', 'Absent'].includes(s) ? '—' : s === 'Late' ? '10:04 am' : ['9:12 am', '9:28 am', '9:05 am', '9:41 am', '9:19 am'][i % 5] }], ['Status', r => pill(st(r, act.indexOf(r)))], ['', r => st(r, act.indexOf(r)) === 'Absent' ? btn('Mark leave', `toast('Marked as leave for ${r.name}')`, 'sm') : '']], act));
      if (t === 'Regularisation') b = card('Regularisation requests', tbl([['Employee', r => who(r.emp)], ['Date', r => fd(r.date)], ['In / out', r => `${r.in} to ${r.out}`], ['Reason', r => esc(r.reason)], ['Status', r => pill(r.status)], ['', r => r.status === 'Pending' ? approveBtns('regs', r.id) : '']], S.regs));
      if (t === 'Shifts') b = card('Shifts', tbl([['Shift', r => `<b>${r.n}</b>`], ['Timing', r => `${r.s} to ${r.e}`], ['Grace', r => r.grace + ' min'], ['Employees', r => S.employees.filter(e => e.shift === r.n).length], ['', r => `<button class="btn sm" onclick="editShift('${r.n}')">${ic('edit', 15)}</button> ${btn('Assign', `assignShift('${r.n}')`, 'sm')}`]], S.shifts), `<button class="link" onclick="editShift()">Add shift</button>`);
      if (t === 'Monthly report') b = card('September 2026', tbl([['Employee', r => who(r.name)], ['Working days', () => 21], ['Present', (r,) => 21 - (r.name.length % 3)], ['Leave', r => r.name.length % 3], ['Late marks', r => r.name.length % 4], ['Avg. hours', r => `8h ${30 + r.name.length % 25}m`]], act), `<button class="link" onclick="toast('September attendance report downloaded')">Download</button>`);
      return head('Attendance & shifts', 'Live attendance, regularisations, shift rosters and reports.') + tabs('attendanceAdmin', T) + b
    };
    function editShift(n) { const s = S.shifts.find(x => x.n === n) || {}; form(n ? 'Edit shift' : 'Add shift', 'Shift timings drive late marks and overtime.', [{ k: 'n', l: 'Name', v: s.n, req: true }, { k: 's', l: 'Start', t: 'time', v: s.s || '09:30', half: true }, { k: 'e', l: 'End', t: 'time', v: s.e || '18:30', half: true }, { k: 'grace', l: 'Grace period (minutes)', t: 'number', v: s.grace || 15 }], n ? 'Save shift' : 'Add shift', v => { v.grace = +v.grace; if (n) Object.assign(s, v); else S.shifts.push(v); toast('Shift saved') }) }
    function assignShift(n) { form(`Assign ${n} shift`, 'Applies from the next working day.', [{ k: 'e', l: 'Employee', t: 'select', o: S.employees.map(e => e.name) }], 'Assign', v => { emp(v.e).shift = n; log(`Assigned ${n} shift to ${v.e}`); toast(`${v.e} moved to ${n} shift`) }) }

    /* ---------- Leave admin ---------- */
    V.leaveAdmin = () => {
      const T = ['Requests', 'Balances', 'Leave types', 'Holiday calendar'], t = tabOf('leaveAdmin', T); let b = '';
      if (t === 'Requests') b = card('All leave requests', tbl([['Employee', r => who(r.emp)], ['Type', r => r.type], ['Dates', r => `${fdShort(r.from)}${r.to !== r.from ? ' to ' + fdShort(r.to) : ''}`], ['Days', r => r.days], ['Reason', r => esc(r.reason) || '—'], ['Status', r => pill(r.status)], ['', r => r.status === 'Pending' ? approveBtns('leaves', r.id) : '']], [...S.leaves].sort((a, b) => (a.status === 'Pending' ? 0 : 1) - (b.status === 'Pending' ? 0 : 1))), `<button class="link" onclick="leaveOnBehalf()">Add leave for an employee</button>`);
      if (t === 'Balances') b = card('Leave balances, 2026', tbl([['Employee', r => who(r.name)], ...S.leaveTypes.filter(x => x.q).map(lt => [lt.n, r => `${lt.q - used(r.name, lt.n)} / ${lt.q}`]), ['', r => btn('Adjust', `adjustBal('${r.name}')`, 'sm')]], S.employees.filter(e => e.status !== 'Inactive')));
      if (t === 'Leave types') b = card('Leave types & policy', tbl([['Leave type', r => `<b>${r.n}</b>`], ['Annual quota', r => r.q ? r.q + ' days' : '—'], ['Carry forward', r => r.carry], ['Pay', r => r.paid], ['', r => `<button class="btn sm" onclick="editLT('${r.n}')">${ic('edit', 15)}</button>`]], S.leaveTypes), `<button class="link" onclick="editLT()">Add leave type</button>`);
      if (t === 'Holiday calendar') b = card('Holiday calendar', tbl([['Date', r => fd(r.d)], ['Holiday', r => `<b>${r.n}</b>`], ['Type', r => `<span class="pill p-${r.t === 'Optional' ? 'mute' : 'info'}">${r.t}</span>`], ['', r => `<button class="btn sm bad" aria-label="Delete" onclick="delHol('${r.d}')">${ic('trash', 15)}</button>`]], [...S.holidays].sort((a, b) => a.d.localeCompare(b.d))), `<button class="link" onclick="addHol()">Add holiday</button>`);
      return head('Leave management', 'Approve requests, manage balances, and set leave policy and holidays.') + tabs('leaveAdmin', T) + b
    };
    function editLT(n) { const l = S.leaveTypes.find(x => x.n === n) || {}; form(n ? 'Edit leave type' : 'Add leave type', 'Changes apply to future accruals.', [{ k: 'n', l: 'Name', v: l.n, req: true }, { k: 'q', l: 'Annual quota (days)', t: 'number', v: l.q ?? 12, half: true }, { k: 'paid', l: 'Pay', t: 'select', o: ['Paid', 'Unpaid'], v: l.paid, half: true }, { k: 'carry', l: 'Carry forward rule', v: l.carry || 'Lapses' }], 'Save', v => { v.q = +v.q; if (n) Object.assign(l, v); else S.leaveTypes.push(v); log(`Saved leave type ${v.n}`); toast('Leave type saved') }) }
    function addHol() { form('Add holiday', 'Shown to everyone in the leave calendar.', [{ k: 'n', l: 'Holiday name', req: true }, { k: 'd', l: 'Date', t: 'date', req: true, half: true }, { k: 't', l: 'Type', t: 'select', o: ['National', 'Festival', 'Optional'], half: true }], 'Add holiday', v => { S.holidays.push(v); toast('Holiday added') }) }
    function delHol(d) { S.holidays = S.holidays.filter(h => h.d !== d); toast('Holiday removed'); rerender() }
    function adjustBal(n) { form(`Adjust balance for ${n}`, 'Adjustments are recorded as approved leave entries.', [{ k: 'type', l: 'Leave type', t: 'select', o: S.leaveTypes.filter(t => t.q).map(t => t.n) }, { k: 'days', l: 'Days to deduct (use negative to credit)', t: 'number', v: 1, req: true }, { k: 'why', l: 'Reason', req: true }], 'Save adjustment', v => { S.leaves.push({ id: 'L' + uid(), emp: n, type: v.type, from: todayISO(), to: todayISO(), days: +v.days, reason: 'Adjustment: ' + v.why, status: 'Approved' }); log(`Adjusted ${v.type} for ${n} by ${v.days}`); toast('Balance adjusted') }) }
    function leaveOnBehalf() { form('Add leave for an employee', 'Recorded as approved.', [{ k: 'emp', l: 'Employee', t: 'select', o: S.employees.map(e => e.name) }, { k: 'type', l: 'Leave type', t: 'select', o: S.leaveTypes.map(t => t.n) }, { k: 'from', l: 'From', t: 'date', v: todayISO(), half: true }, { k: 'to', l: 'To', t: 'date', v: todayISO(), half: true }], 'Add leave', v => { const days = weekdays(v.from, v.to); if (!days) return 'Pick valid working dates.'; S.leaves.unshift({ id: 'L' + uid(), ...v, days, reason: 'Added by HR', status: 'Approved' }); toast('Leave recorded') }) }

    /* ---------- Payroll admin ---------- */
    const PAYSTEPS = ['Sync attendance & leave', 'Add bonuses & deductions', 'Review variances', 'Approve payroll', 'Disburse & publish payslips'];
    V.payrollAdmin = () => {
      const T = ['Run payroll', 'Salary register', 'Statutory compliance', 'History'], t = tabOf('payrollAdmin', T); let b = '';
      const act = S.employees.filter(e => e.status !== 'Inactive'), reg = act.map(e => ({ e, s: salary(e) })); const tot = k => reg.reduce((a, r) => a + r.s[k], 0);
      if (t === 'Run payroll') b = `<div class="card"><h3>${S.payroll.month} <span class="muted" style="font:500 13px Figtree">Last recorded ${fdShort(S.payroll.runs[0]?.d)}</span></h3><div class="stepper" style="--n:5">${PAYSTEPS.map((s, i) => `<div class="step ${i < S.payroll.step ? 'done' : i === S.payroll.step ? 'cur' : ''}"><span class="n">${i < S.payroll.step ? '✓' : i + 1}</span><b>${s}</b></div>`).join('')}</div><div class="mt" style="display:flex;gap:8px;flex-wrap:wrap">${S.payroll.step < 5 ? btn(S.payroll.step === 4 ? 'Disburse & publish' : 'Mark step complete', 'payStep()', 'primary') : `<span class="pill p-ok">Payroll completed</span>`}${S.payroll.step > 0 && S.payroll.step < 5 ? btn('Go back a step', 'S.payroll.step--;rerender()') : ''}</div></div>
  <div class="grid g4 mt">${stat('users', 'Employees', act.length, 'Included in this run')}${stat('pay', 'Gross pay', inr(tot('gross')), 'This month')}${stat('receipt', 'Deductions', inr(tot('gross') - tot('net')), 'PF, PT and TDS')}${stat('check', 'Net payout', inr(tot('net')), 'To bank accounts')}</div>
  <div class="mt">${card('One-time inputs', tbl([['Employee', r => who(r.emp)], ['Type', r => r.k], ['Amount', r => inr(r.amt)], ['', (r) => `<button class="btn sm bad" aria-label="Remove" onclick="S.payroll.inputs.splice(${S.payroll.inputs.indexOf(r)},1);rerender()">${ic('trash', 15)}</button>`]], S.payroll.inputs, 'No one-time inputs.'), `<button class="link" onclick="payInput()">Add input</button>`)}</div>`;
      if (t === 'Salary register') b = card(`Salary register, ${S.payroll.month}`, tbl([['Employee', r => who(r.e.name, r.e.id)], ['Gross', r => inr(r.s.gross)], ['PF', r => inr(r.s.employeePf||0)], ['PT', r => inr(r.s.professionalTax||0)], ['TDS', r => inr(r.s.tds||0)], ['Net pay', r => `<b>${inr(r.s.net)}</b>`], ['', r => btn('Payslip', `toast('Payslip for ${r.e.name} downloaded')`, 'sm', 'download')]], reg), `<button class="link" onclick="toast('Salary register exported')">Export</button>`);
            if (t === 'History') b = card('Payroll history', tbl([['Month', r => `<b>${r.m}</b>`], ['Employees', r => r.emps], ['Gross', r => inr(r.gross)], ['Net', r => inr(r.net)], ['Paid on', r => fd(r.d)], ['', r => btn('Bank file', `toast('Bank transfer file for ${r.m} downloaded')`, 'sm', 'download')]], S.payroll.runs));
      return head('Payroll', 'Run monthly payroll, review the salary register and stay on top of statutory filings.') + tabs('payrollAdmin', T) + b
    };
    async function payStep(){try{if(S.payroll.step===4){await bridge.flush();const d=new Date('1 '+S.payroll.month),month=Number.isNaN(+d)?tdy().slice(0,7):d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');const data=await request('/money/run','POST',{requestId:crypto.randomUUID(),month});bridge.adopt(data.state);toast('Payroll recorded. Payslip snapshots saved.')}else{S.payroll.step++;toast(PAYSTEPS[S.payroll.step-1]+': done')}rerender()}catch(error){toast(error.message)}}
    function payInput() { form('Add one-time input', 'Applied to this month’s payroll only.', [{ k: 'emp', l: 'Employee', t: 'select', o: S.employees.map(e => e.name) }, { k: 'k', l: 'Type', t: 'select', o: ['Bonus', 'Incentive', 'Reimbursement', 'Arrears', 'Loan recovery', 'Deduction'], half: true }, { k: 'amt', l: 'Amount (₹)', t: 'number', req: true, half: true }], 'Add input', v => { S.payroll.inputs.push({ ...v, amt: +v.amt, month: S.payroll.month }); toast('Input added') }) }

    /* ---------- Expenses admin ---------- */
    V.expensesAdmin = () => {
      const f = TAB.expF || 'Pending'; const L = S.expenses.filter(x => f === 'All' || x.status === f);
      return head('Expenses', 'Review claims, approve them and mark them paid.', btn('Export', 'toast(\'Expense report exported\')', '', 'download')) +
        `<div class="tabs" style="margin-bottom:16px">${['Pending', 'Approved', 'Paid', 'Rejected', 'All'].map(s => `<button class="${s === f ? 'on' : ''}" onclick="TAB.expF='${s}';rerender()">${s}</button>`).join('')}</div>` +
        card(`${L.length} claims, ${inr(L.reduce((a, x) => a + x.amt, 0))}`, tbl([['Employee', r => who(r.emp)], ['Date', r => fd(r.date)], ['Category', r => r.cat], ['Description', r => esc(r.desc)], ['Amount', r => `<b>${inr(r.amt)}</b>`], ['Status', r => pill(r.status)], ['', r => r.status === 'Pending' ? approveBtns('expenses', r.id) : r.status === 'Approved' ? btn('Mark paid', `S.expenses.find(x=>x.id==='${r.id}').status='Paid';log('Marked expense ${r.id} as paid');rerender()`, 'sm') : '']], L, 'No claims in this list.'))
    };

    /* ---------- Benefits admin ---------- */
    V.benefitsAdmin = () => head('Benefits', 'Insurance plans, enrolment and dependents across the company.', btn('Add plan', 'addPlan()', 'primary', 'plus')) +
      `<div class="grid g3">${stat('heart', 'Enrolled in health cover', S.employees.filter(e => e.status !== 'Inactive').length, '100% of eligible employees')}${stat('users', 'Dependents covered', Object.values(S.dependents).flat().length, 'Spouses, children, parents')}${stat('leave','Enrolment closes',S.plans.map(p=>p.close).filter(Boolean).sort()[0]||'—','From saved plan deadlines')}</div>
 <div class="mt">${card('Plans', tbl([['Plan', r => `<b>${r.n}</b>`], ['Provider', r => r.prov], ['Cover', r => r.cover], ['Cost', r => r.cost], ['', (r) => `<button class="btn sm bad" aria-label="Remove" onclick="S.plans.splice(${S.plans.indexOf(r)},1);rerender()">${ic('trash', 15)}</button>`]], S.plans))}</div>
 <div class="mt">${card('Dependents on record', tbl([['Employee', r => who(r.e)], ['Dependent', r => r.n], ['Relationship', r => r.rel], ['Date of birth', r => fd(r.dob)]], Object.entries(S.dependents).flatMap(([e, ds]) => ds.map(d => ({ e, ...d })))), `<button class="link" onclick="toast('Insurer census file downloaded')">Download census for insurer</button>`)}</div>`;
    function addPlan() { form('Add benefit plan', 'Visible to employees under Benefits.', [{ k: 'n', l: 'Plan name', req: true }, { k: 'prov', l: 'Provider', half: true, req: true }, { k: 'cover', l: 'Cover', half: true }, { k: 'cost', l: 'Cost', v: 'Company paid' }], 'Add plan', v => { S.plans.push(v); toast('Plan added') }) }

    /* ---------- Recruitment ---------- */
    const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'];
    V.recruitment = () => {
      const T = ['Pipeline', 'Jobs', 'Interviews', 'Offers', 'Referrals'], t = tabOf('recruitment', T); let b = '';
      if (t === 'Pipeline') b = `<div class="kanban">${STAGES.map((s, si) => { const cs = S.cands.filter(c => c.s === s); return `<div class="col"><h4>${s} <span>${cs.length}</span></h4>${cs.map(c => `<div class="kc"><div class="who">${av(c.n)}<div><b>${esc(c.n)}</b></div></div><div class="role">${jobT(c.job)}, via ${c.src}</div><div class="ft"><span class="score">${c.sc}% fit</span><span>${si < 4 ? `<button class="btn sm" onclick="moveCand('${c.id}')">Move</button> <button class="btn sm bad" aria-label="Reject ${esc(c.n)}" onclick="rejectCand('${c.id}')">${ic('x', 14)}</button>` : pill('Hired')}</span></div></div>`).join('') || '<div class="empty" style="font-size:13px">No candidates</div>'}</div>` }).join('')}</div>`;
      if (t === 'Jobs') b = card('Job postings', tbl([['Role', r => `<b>${esc(r.t)}</b>`], ['Department', r => r.dept], ['Location', r => r.loc], ['Applicants', r => S.cands.filter(c => c.job === r.id).length], ['Status', r => pill(r.status)], ['', r => `<button class="btn sm" onclick="editJob('${r.id}')">${ic('edit', 15)}</button> ${r.status === 'Open' ? btn('Close', `S.jobs.find(j=>j.id==='${r.id}').status='Closed';rerender()`, 'sm') : btn('Reopen', `S.jobs.find(j=>j.id==='${r.id}').status='Open';rerender()`, 'sm')}`]], S.jobs), `<button class="link" onclick="editJob()">Post a job</button>`);
      if (t === 'Interviews') b = card('Scheduled interviews', tbl([['Candidate', r => who(S.cands.find(c => c.id === r.cand)?.n || '—', jobT(S.cands.find(c => c.id === r.cand)?.job))], ['Round', r => r.round], ['When', r => new Date(r.when).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })], ['Panel', r => r.panel], ['', r => btn('Add scorecard', `scorecard('${r.id}')`, 'sm')]], S.interviews, 'No interviews scheduled.'), `<button class="link" onclick="schedInt()">Schedule interview</button>`);
      if (t === 'Offers') b = card('Offers', tbl([['Candidate', r => who(r.n, jobT(r.job))], ['Fit', r => r.sc + '%'], ['Status', r => pill(r.offer || 'Draft')], ['', r => !r.offer ? btn('Send offer', `sendOffer('${r.id}')`, 'sm primary') : r.offer === 'Submitted' ? btn('Mark accepted', `acceptOffer('${r.id}')`, 'sm ok') : '']], S.cands.filter(c => c.s === 'Offer'), 'No candidates at offer stage.'));
      if (t === 'Referrals') b = card('Employee referrals', tbl([['Candidate', r => `<b>${esc(r.cand)}</b>`], ['Role', r => jobT(r.job)], ['Referred by', r => who(r.by)], ['Status', r => pill(r.status)]], S.referrals));
      return head('Recruitment', 'Bright HR agent screens applicants and scores fit. Manage jobs, interviews and offers here.', btn('Post a job', 'editJob()', 'primary', 'plus')) + tabs('recruitment', T) + b
    };
    function moveCand(id) { const c = S.cands.find(x => x.id === id); c.s = STAGES[STAGES.indexOf(c.s) + 1]; S.referrals.filter(r => r.cand === c.n).forEach(r => r.status = c.s); toast(`${c.n} moved to ${c.s}`); rerender() }
    function rejectCand(id) { const c = S.cands.find(x => x.id === id); confirmBox(`Reject ${c.n}?`, 'They receive a polite rejection email.', 'Reject', () => { c.s = 'Rejected'; S.referrals.filter(r => r.cand === c.n).forEach(r => r.status = 'Rejected'); toast(`${c.n} rejected`) }) }
    function editJob(id) { const j = S.jobs.find(x => x.id === id) || {}; form(id ? 'Edit job' : 'Post a job', 'Published to the careers page, LinkedIn and the internal jobs board.', [{ k: 't', l: 'Job title', v: j.t, req: true }, { k: 'dept', l: 'Department', t: 'select', o: deptNames(), v: j.dept, half: true }, { k: 'loc', l: 'Location', t: 'select', o: S.locations, v: j.loc, half: true }, { k: 'type', l: 'Employment type', t: 'select', o: ['Full-time', 'Contract', 'Intern'], v: j.type, half: true }, { k: 'bonus', l: 'Referral bonus (₹)', t: 'number', v: j.bonus || 30000, half: true }], id ? 'Save job' : 'Post job', v => { v.bonus = +v.bonus; if (id) Object.assign(j, v); else S.jobs.unshift({ id: 'J' + uid(), ...v, status: 'Open' }); log(`${id ? 'Edited' : 'Posted'} job ${v.t}`); toast(id ? 'Job updated' : `${v.t} posted`) }) }
    function schedInt() { const cs = S.cands.filter(c => ['Screening', 'Interview'].includes(c.s)); form('Schedule interview', 'Invites go to the candidate and panel.', [{ k: 'cand', l: 'Candidate', t: 'select', o: cs.map(c => c.n) }, { k: 'round', l: 'Round', t: 'select', o: ['Phone screen', 'Technical, round 1', 'Technical, round 2', 'Hiring manager', 'Culture & values'] }, { k: 'when', l: 'Date & time', t: 'datetime-local', req: true }, { k: 'panel', l: 'Panel', req: true, ph: 'Names, comma separated' }], 'Schedule', v => { const c = cs.find(x => x.n === v.cand); S.interviews.push({ id: 'I' + uid(), cand: c.id, round: v.round, when: v.when, panel: v.panel }); if (c.s === 'Screening') c.s = 'Interview'; toast('Interview scheduled') }) }
    function scorecard(id){const row=S.interviews.find(x=>x.id===id);form('Interview scorecard','Shared with the hiring team.',[{k:'rec',l:'Recommendation',t:'select',o:['Strong hire','Hire','No hire','Strong no hire']},{k:'notes',l:'Notes',t:'textarea',req:true}],'Submit scorecard',v=>{if(!row)return 'Interview not found';row.rec=v.rec;row.notes=v.notes;row.status='Completed';log('Submitted interview scorecard '+id);toast('Scorecard saved')})}
    function sendOffer(id) { const c = S.cands.find(x => x.id === id); form(`Offer for ${c.n}`, jobT(c.job), [{ k: 'ctc', l: 'Annual CTC (₹)', t: 'number', req: true, half: true }, { k: 'join', l: 'Joining date', t: 'date', req: true, half: true }], 'Send offer', v => { c.offer = 'Submitted'; c.ctc = +v.ctc; c.join = v.join; log(`Sent offer to ${c.n}`); toast(`Offer sent to ${c.n}`) }) }
    function acceptOffer(id) { const c = S.cands.find(x => x.id === id), j = S.jobs.find(x => x.id === c.job); c.offer = 'Accepted'; c.s = 'Hired'; S.employees.push({ id: 'BC-' + (1071 + S.employees.length), email: '', name: c.n, role: j.t, dept: j.dept, loc: j.loc, status: 'Probation', joined: c.join || todayISO(), mgr: S.depts.find(d => d.n === j.dept)?.head || '', ctc: c.ctc || 0, phone: '', shift: 'General', grade: 'L5' }); addAccount(S.employees[S.employees.length - 1]); S.onboard.unshift({ emp: c.n, tasks: [['Offer letter signed', 1], ['Laptop & accounts provisioned', 0], ['ID and PAN submitted', 0], ['Bank details for payroll', 0], ['Security & POSH training', 0], ['Buddy assigned', 0], ['30-day check-in with manager', 0]] }); log(`${c.n} accepted offer; employee created`); toast(`${c.n} hired. Employee record and onboarding created.`); rerender() }

    /* ---------- Performance admin ---------- */
    V.performanceAdmin = () => {
      const stages = ['Goal setting', 'Self-review', 'Manager review', 'Calibration', 'Results shared']; const act = S.employees.filter(e => e.status !== 'Inactive');
      return head('Performance', `${S.cycle.n}. Run the cycle, track completion and finalise ratings.`, btn('New cycle', 'newCycle()') + (S.cycle.stage < 4 ? btn(`Move to ${stages[S.cycle.stage + 1]}`, 'S.cycle.stage++;log(\'Advanced review cycle\');rerender()', 'primary') : '')) +
        `<div class="card"><h3>Cycle stage <span class="muted" style="font:500 13px Figtree">Self-reviews due ${fd(S.cycle.due)}</span></h3><div class="stepper" style="--n:5">${stages.map((s, i) => `<div class="step ${i < S.cycle.stage ? 'done' : i === S.cycle.stage ? 'cur' : ''}"><span class="n">${i < S.cycle.stage ? '✓' : i + 1}</span><b>${s}</b></div>`).join('')}</div></div>
 <div class="grid g3 mt">${stat('chart', 'Self-reviews submitted', `${act.filter(e => S.reviews[e.name]?.self).length} / ${act.length}`, '')}${stat('users', 'Manager reviews done', `${act.filter(e => S.reviews[e.name]?.rating).length} / ${act.length}`, '')}${stat('check', 'Goals set', S.goals.length, 'Across all employees')}</div>
 <div class="mt">${card('Review status', tbl([['Employee', r => who(r.name)], ['Manager', r => r.mgr || '—'], ['Self-review', r => pill(S.reviews[r.name]?.self ? 'Submitted' : 'Not submitted')], ['Goals', r => S.goals.filter(g => g.emp === r.name).length], ['Rating', r => S.reviews[r.name]?.rating || '—'], ['', r => `${!S.reviews[r.name]?.self ? btn('Remind', `toast('Reminder sent to ${r.name}')`, 'sm') : ''} ${btn('Rate', `rate('${r.name}')`, 'sm')}`]], act), `<button class="link" onclick="toast('Ratings distribution exported')">Export ratings</button>`)}</div>`
    };
    function rate(n) { const r = S.reviews[n] || {}; form(`Final rating for ${n}`, r.self ? `Self-rating: ${r.self.score}.` : 'No self-review submitted yet.', [{ k: 'rating', l: 'Rating', t: 'select', o: ['Outstanding', 'Exceeds expectations', 'Meets expectations', 'Partially meets', 'Below expectations'], v: r.rating }, { k: 'hike', l: 'Recommended increment (%)', t: 'number', v: r.hike || 8 }], 'Save rating', v => { S.reviews[n] = { ...r, ...v }; log(`Rated ${n}: ${v.rating}`); toast('Rating saved') }) }
    function newCycle() { form('Start a new review cycle', 'Goals and reviews from the current cycle are archived.', [{ k: 'n', l: 'Cycle name', v: 'H1 2027 review', req: true }, { k: 'due', l: 'Self-review due', t: 'date', req: true }], 'Start cycle', v => { S.cycle = { n: v.n, stage: 0, due: v.due }; S.reviews = {}; log('Started cycle ' + v.n); toast(`${v.n} started`) }) }

    /* ---------- Learning admin ---------- */
    V.learningAdmin = () => {
      const act = S.employees.filter(e => e.status !== 'Inactive'); const aud = c => act.filter(e => c.aud === 'Everyone' || c.aud === e.dept || (c.aud === 'Managers' && S.employees.some(x => x.mgr === e.name))); const done = c => aud(c).filter(e => (S.progress[e.name]?.[c.id] || 0) >= 100).length;
      return head('Learning', 'Build the catalogue, assign courses and track compliance.', btn('Add course', 'editCourse()', 'primary', 'plus')) +
        card('Course catalogue', tbl([['Course', r => `<b>${esc(r.t)}</b><div class="muted" style="font-size:12.5px">${r.dur}</div>`], ['Type', r => `<span class="pill p-${r.type === 'Mandatory' ? 'warn' : 'info'}">${r.type}</span>`], ['Assigned to', r => r.aud], ['Due', r => fd(r.due)], ['Completion', r => { const a = aud(r).length || 1; return `<div style="min-width:120px">${bar(done(r) / a * 100)}<span class="muted" style="font-size:12px">${done(r)} of ${aud(r).length}</span></div>` }], ['', r => `<button class="btn sm" onclick="editCourse('${r.id}')">${ic('edit', 15)}</button> ${btn('Remind', `toast('Reminder sent to ${aud(r).length - done(r)} people')`, 'sm')}`]], S.courses))
    };
    function editCourse(id) { const c = S.courses.find(x => x.id === id) || {}; form(id ? 'Edit course' : 'Add course', 'Assigned people see it under Learning.', [{ k: 't', l: 'Course title', v: c.t, req: true }, { k: 'type', l: 'Type', t: 'select', o: ['Mandatory', 'Elective'], v: c.type, half: true }, { k: 'dur', l: 'Duration', v: c.dur || '1 h', half: true }, { k: 'aud', l: 'Assign to', t: 'select', o: ['Everyone', 'Managers', ...deptNames()], v: c.aud, half: true }, { k: 'due', l: 'Due date', t: 'date', v: c.due, half: true }], 'Save course', v => { if (id) Object.assign(c, v); else S.courses.push({ id: 'CO' + uid(), ...v }); log(`Saved course ${v.t}`); toast('Course saved') }) }

    /* ---------- Assets admin ---------- */
    V.assetsAdmin = () => {
      const T = ['Inventory', 'Requests'], t = tabOf('assetsAdmin', T);
      return head('Assets', 'Company equipment, who has it, and equipment requests.', btn('Add asset', 'addAsset()', 'primary', 'plus')) +
        `<div class="grid g4" style="margin-bottom:18px">${['Assigned', 'In stock', 'In repair'].map(s => stat('laptop', s, S.assets.filter(a => a.status === s).length, 'assets')).join('')}${stat('inbox', 'Open requests', S.assetReqs.filter(r => r.status === 'Pending').length, '')}</div>` + tabs('assetsAdmin', T) +
        (t === 'Inventory' ? card('Inventory', tbl([['Tag', r => `<b>${r.tag}</b>`], ['Type', r => r.type], ['Model', r => r.model], ['Assigned to', r => r.emp ? who(r.emp) : '—'], ['Status', r => pill(r.status)], ['', r => r.emp ? btn('Return', `retAsset('${r.tag}')`, 'sm') : r.status === 'In stock' ? btn('Assign', `assignAsset('${r.tag}')`, 'sm primary') : btn('Back in stock', `S.assets.find(a=>a.tag==='${r.tag}').status='In stock';rerender()`, 'sm')]], S.assets))
          : card('Equipment requests', tbl([['Employee', r => who(r.emp)], ['Item', r => r.item], ['Reason', r => esc(r.reason)], ['Status', r => pill(r.status)], ['', r => r.status === 'Pending' ? approveBtns('assetReqs', r.id) : '']], S.assetReqs)))
    };
    function addAsset() { form('Add asset', 'Tagged and added to inventory as in stock.', [{ k: 'type', l: 'Type', t: 'select', o: ['Laptop', 'Monitor', 'Headset', 'Mobile phone', 'Keyboard & mouse'], half: true }, { k: 'tag', l: 'Asset tag', v: 'BC-' + uid().toUpperCase(), half: true, req: true }, { k: 'model', l: 'Model', req: true }], 'Add asset', v => { S.assets.push({ ...v, emp: '', status: 'In stock', since: '' }); toast('Asset added') }) }
    function assignAsset(tag) { form(`Assign ${tag}`, 'The employee is asked to acknowledge receipt.', [{ k: 'e', l: 'Employee', t: 'select', o: S.employees.filter(e => e.status !== 'Inactive').map(e => e.name) }], 'Assign', v => { const a = S.assets.find(x => x.tag === tag); a.emp = v.e; a.status = 'Assigned'; a.since = todayISO(); log(`Assigned ${tag} to ${v.e}`); toast(`${tag} assigned to ${v.e}`) }) }
    function retAsset(tag) { const a = S.assets.find(x => x.tag === tag); a.emp = ''; a.status = 'In stock'; a.since = ''; log(`Returned ${tag}`); toast(`${tag} returned to stock`); rerender() }

    /* ---------- Docs admin ---------- */
    V.docsAdmin = () => {
      const T = ['Policies', 'Letter requests', 'Employee documents'], t = tabOf('docsAdmin', T); const act = S.employees.filter(e => e.status !== 'Inactive').length; let b = '';
      if (t === 'Policies') b = card('Policies', tbl([['Policy', r => `<b>${esc(r.n)}</b>`], ['Version', r => r.v], ['Updated', r => fd(r.d)], ['Acknowledged', r => r.mand ? `<div style="min-width:110px">${bar(r.ack.length / act * 100)}<span class="muted" style="font-size:12px">${r.ack.length} of ${act}</span></div>` : 'Not required'], ['', r => `${btn('New version', `newVersion('${r.id}')`, 'sm')} ${r.mand ? btn('Remind', `toast('Reminder sent to ${act - r.ack.length} people')`, 'sm') : ''}`]], S.policies), `<button class="link" onclick="newPolicy()">Upload policy</button>`);
      if (t === 'Letter requests') b = card('Letter requests', tbl([['Employee', r => who(r.emp)], ['Letter', r => r.type], ['Addressed to', r => esc(r.to)], ['Requested', r => fd(r.date)], ['Status', r => pill(r.status)], ['', r => r.status === 'Pending' ? `${btn('Generate & issue', `decide('letters','${r.id}',true)`, 'sm primary')} ${btn('Reject', `decide('letters','${r.id}',false)`, 'sm bad')}` : '']], S.letters), `<button class="link" onclick="issueLetter(S.employees[0].name)">Issue a letter</button>`);
      if (t === 'Employee documents') b = card('Employee documents', tbl([['Employee', r => who(r.emp)], ['Document', r => r.doc], ['Status', r => pill(r.status)], ['', r => r.status === 'Submitted' ? `${btn('Verify', `verifyDoc('${r.emp}','${r.doc}')`, 'sm ok')} ${btn('Reject', `S.empDocs.find(x=>x.emp==='${r.emp}'&&x.doc==='${r.doc}').status='Rejected';rerender()`, 'sm bad')}` : '']], S.empDocs));
      return head('Documents & letters', 'Publish policies, track acknowledgements, issue letters and verify documents.') + tabs('docsAdmin', T) + b
    };
    function newPolicy() { form('Upload policy', 'Everyone is notified when you publish.', [{ k: 'n', l: 'Policy name', req: true }, { k: 'file', l: 'File', t: 'file' }, { k: 'mand', l: 'Acknowledgement', t: 'select', o: ['Required', 'Not required'] }], 'Publish policy', v => { S.policies.unshift({ id: 'P' + uid(), n: v.n, v: '1.0', d: todayISO(), mand: v.mand === 'Required', ack: [] }); log(`Published policy ${v.n}`); toast(`${v.n} published`) }) }
    function newVersion(id) { const p = S.policies.find(x => x.id === id); confirmBox(`Publish a new version of ${p.n}?`, 'Existing acknowledgements are reset and everyone must acknowledge again.', 'Publish new version', () => { p.v = (parseFloat(p.v) + 0.1).toFixed(1); p.d = todayISO(); p.ack = []; log(`New version of ${p.n}`); toast(`Version ${p.v} published`) }, false) }

    /* ---------- Announcements ---------- */
    V.announcements = () => head('Announcements', 'Posts appear on every employee’s home page.', btn('Post announcement', 'postAnn()', 'primary', 'plus')) +
      card('Published', tbl([['Title', r => `<b>${esc(r.t)}</b><div class="muted" style="font-size:12.5px;white-space:normal">${esc(r.b)}</div>`], ['Posted', r => fd(r.d)], ['Pinned', r => `<label class="sw"><input type="checkbox" ${r.pin ? 'checked' : ''} aria-label="Pin" onchange="S.announcements.find(a=>a.id==='${r.id}').pin=this.checked;rerender()"><i></i></label>`], ['', r => `<button class="btn sm" onclick="postAnn('${r.id}')">${ic('edit', 15)}</button> <button class="btn sm bad" aria-label="Delete" onclick="S.announcements=S.announcements.filter(a=>a.id!=='${r.id}');rerender()">${ic('trash', 15)}</button>`]], S.announcements, 'No announcements yet.'));
    function postAnn(id) { const a = S.announcements.find(x => x.id === id) || {}; form(id ? 'Edit announcement' : 'Post announcement', 'Shown on the employee home page and sent to Slack.', [{ k: 't', l: 'Title', v: a.t, req: true }, { k: 'b', l: 'Message', t: 'textarea', v: a.b, req: true }, { k: 'pin', l: 'Pin to top', t: 'select', o: ['No', 'Yes'], v: a.pin ? 'Yes' : 'No' }], id ? 'Save' : 'Publish', v => { const o = { t: v.t, b: v.b, pin: v.pin === 'Yes' }; if (id) Object.assign(a, o); else S.announcements.unshift({ id: 'A' + uid(), d: todayISO(), ...o }); log(`Published announcement "${v.t}"`); toast(id ? 'Announcement updated' : 'Announcement published') }) }

    /* ---------- Helpdesk admin ---------- */
    V.helpAdmin = () => {
      const f = TAB.hf || 'Open'; const L = S.tickets.filter(t => f === 'All' || t.status === f); const hr = S.employees.filter(e => e.dept === 'People Ops' || e.dept === 'Finance').map(e => e.name);
      return head('Helpdesk queue', 'Assign, respond to and resolve employee requests.') +
        `<div class="tabs" style="margin-bottom:16px">${['Open', 'In progress', 'Resolved', 'All'].map(s => `<button class="${s === f ? 'on' : ''}" onclick="TAB.hf='${s}';rerender()">${s} (${s === 'All' ? S.tickets.length : S.tickets.filter(t => t.status === s).length})</button>`).join('')}</div>` +
        card(`${L.length} requests`, tbl([['ID', r => `<span class="muted">${r.id}</span>`], ['Subject', r => `<b>${esc(r.sub)}</b>`], ['From', r => who(r.emp)], ['Category', r => r.cat], ['Priority', r => pill(r.pri)], ['Assignee', r => `<select class="input" style="padding:4px 8px" aria-label="Assignee" onchange="assignT('${r.id}',this.value)"><option value="">Unassigned</option>${hr.map(n => `<option ${n === r.to ? 'selected' : ''}>${n}</option>`).join('')}</select>`], ['Status', r => pill(r.status)], ['', r => btn('Open', `viewTicket('${r.id}')`, 'sm')]], L, 'No requests here.'))
    };
    function assignT(id, n) { const t = S.tickets.find(x => x.id === id); t.to = n; if (n && t.status === 'Open') t.status = 'In progress'; log(`Assigned ${id} to ${n || 'nobody'}`); toast(n ? `${id} assigned to ${n}` : 'Unassigned'); rerender() }
    function setTicket(id, s) { S.tickets.find(x => x.id === id).status = s; log(`${id} marked ${s}`); toast(`${id} resolved`); closeAll(); rerender() }

    /* ---------- Reports ---------- */
    V.reports = () => {
      const act = S.employees.filter(e => e.status !== 'Inactive'); const history=recordedHeadcountTrend(),months=history.map(x=>x[0]),hc=history.map(x=>x[1]); const mx = Math.max(...hc);
      const lt = S.leaveTypes.filter(t => t.q).map(t => [t.n, S.leaves.filter(l => l.type === t.n && l.status === 'Approved').reduce((a, l) => a + l.days, 0)]); const lmx = Math.max(...lt.map(x => x[1]), 1);
      return head('Reports & analytics', 'Workforce trends and downloadable reports.') +
        `<div class="grid g4">${stat('users', 'Headcount', act.length, '+2 this quarter', 'up')}${stat('logout','Recorded exits',live('exit').filter(e=>e.status==='Completed').length,'Completed exits in saved records')}${stat('briefcase','Avg. time to hire',recordedTimeToHire(),'From dated candidate and joining records')}${stat('pay', 'Avg. CTC', inr(act.reduce((a, e) => a + e.ctc, 0) / act.length), 'All employees')}</div>
 <div class="grid g2 mt">${card('Headcount trend', `<div class="mini-bars">${hc.map((v, i) => `<div><b style="color:var(--text)">${v}</b><i style="height:${v / mx * 100}%"></i>${months[i]}</div>`).join('')}</div>`)}
 ${card('Leave taken by type, 2026', `<div class="dept-bars">${lt.map(([n, v]) => `<div class="r"><span>${n}</span>${bar(v / lmx * 100)}<em>${v}</em></div>`).join('')}</div>`)}</div>
 <div class="mt">${card('Standard reports', `<div class="list">${[['Headcount & demographics', 'Department, grade, location, tenure'], ['Attrition analysis', 'Voluntary vs involuntary, by team'], ['Leave liability', 'Earned leave balances and encashment value'], ['Payroll cost by department', 'Monthly cost centre breakdown'], ['Diversity snapshot', 'Gender and location mix'], ['Recruitment funnel', 'Conversion by stage and source']].map(r => `<div class="row"><span class="av" style="background:var(--info-bg);color:var(--brand)">${ic('chart', 16)}</span><div class="grow"><b>${r[0]}</b><div class="sub">${r[1]}</div></div>${btn('Download', `toast('${r[0]} report downloaded')`, 'sm', 'download')}</div>`).join('')}</div>`)}</div>`
    };

    /* ---------- Settings ---------- */
    V.settings = () => {
      const T = ['Company', 'User accounts', 'Roles & permissions', 'Approval workflows', 'Notifications', 'Data', 'Money calculations'], t = tabOf('settings', T); let b = '';
      if (t === 'User accounts') b = card(`${S.accounts.length} sign-in accounts`, tbl([['User', a => who(a.name, a.email)], ['Role', a => `<select class="input" style="padding:4px 8px" aria-label="Role for ${esc(a.name)}" onchange="setAcctRole('${a.email}',this.value)" ${a.email === USER.email ? 'disabled' : ''}>${['Employee', 'HR Admin'].map(r => `<option ${r === a.role ? 'selected' : ''}>${r}</option>`).join('')}</select>`], ['Status', a => pill(emp(a.name)?.status === 'Inactive' ? 'Disabled' : a.status)], ['Last sign-in', a => a.last || 'Never'], ['', a => `${btn('Reset password', `resetPw('${a.email}')`, 'sm')} ${a.status === 'Locked' ? btn('Unlock', `acct('${a.email}','Active')`, 'sm ok') : a.email === USER.email ? '' : a.status === 'Disabled' ? btn('Enable', `acct('${a.email}','Active')`, 'sm ok') : btn('Disable', `acct('${a.email}','Disabled')`, 'sm bad')}`]], S.accounts)) + `<p class="muted" style="font-size:13px;margin:12px 2px 0">New employees get an account automatically, with the temporary password Welcome@123. Accounts lock after 5 wrong passwords.</p>`;
      const mods = ['Employees', 'Leave', 'Payroll', 'Recruitment', 'Performance', 'Expenses', 'Settings'];
      if (t === 'Company') b = card('Company profile', `<div class="kv-grid">${[['Legal name', 'name'], ['Financial year', 'fy'], ['Work week', 'week'], ['Time zone', 'tz'], ['Probation period', 'probation'], ['Notice period', 'notice']].map(x => `<div><span>${x[0]}</span><b>${esc(S.company[x[1]])}</b></div>`).join('')}</div>`, `<button class="link" onclick="editCompany()">Edit</button>`);
      if (t === 'Roles & permissions') b = card('Who can manage what', `<div class="table-wrap"><table class="matrix"><thead><tr><th>Role</th>${mods.map(m => `<th>${m}</th>`).join('')}</tr></thead><tbody>${Object.entries(S.perms).map(([r, p]) => `<tr><td><b>${r}</b></td>${p.map((v, i) => `<td><input type="checkbox" aria-label="${r} can manage ${mods[i]}" ${v ? 'checked' : ''} ${r === 'HR Admin' ? 'disabled' : ''} onchange="S.perms['${r}'][${i}]=this.checked?1:0;log('Changed ${r} access to ${mods[i]}');save();toast('Permission updated')"></td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="muted" style="font-size:13px;margin:14px 0 0">Employees always see their own records. HR Admin access can’t be reduced.</p>`);
      if (t === 'Approval workflows') b = card('Approval chains', tbl([['Request', r => `<b>${r[0]}</b>`], ['First approver', r => r[1]], ['Second approver', r => r[2]], ['', (r) => btn('Edit', `editWf(${S.workflows.indexOf(r)})`, 'sm')]], S.workflows));
      if (t === 'Notifications') b = card('Notifications', `<div class="list">${[['email', 'Email notifications for approvals'], ['slack', 'Slack notifications via Bright HR agent'], ['digest', 'Daily digest to managers'], ['birthdays', 'Celebrate birthdays and anniversaries']].map(([k, l]) => `<div class="row"><span class="grow">${l}</span><label class="sw"><input type="checkbox" aria-label="${l}" ${S.notif[k] ? 'checked' : ''} onchange="S.notif['${k}']=this.checked;save();toast('Preference saved')"><i></i></label></div>`).join('')}</div>`);
      if (t === 'Data') b = card('Demo data', `<p class="muted" style="margin:0 0 14px">Changes are stored in PostgreSQL. Use Data & backup to export and import records.</p>${btn('Reset demo data', 'resetData()', 'bad')}`);
      return head('Settings & access', 'Company setup, permissions, approval chains and notifications.') + tabs('settings', T) + b
    };
    function editCompany() { const c = S.company; form('Edit company profile', 'Used on letters, payslips and policies.', [{ k: 'name', l: 'Legal name', v: c.name, req: true }, { k: 'fy', l: 'Financial year', v: c.fy, half: true }, { k: 'week', l: 'Work week', v: c.week, half: true }, { k: 'probation', l: 'Probation period', v: c.probation, half: true }, { k: 'notice', l: 'Notice period', v: c.notice, half: true }], 'Save', v => { Object.assign(c, v); log('Updated company profile'); toast('Company profile saved') }) }
    function editWf(i) { const w = S.workflows[i]; const o = ['Reporting manager', 'Department head', 'HR Admin', 'Finance', 'IT admin', '—']; form(`Edit ${w[0]} workflow`, 'Applies to new requests.', [{ k: 'a', l: 'First approver', t: 'select', o, v: w[1] }, { k: 'b', l: 'Second approver', t: 'select', o: [...o, w[2]], v: w[2] }], 'Save workflow', v => { w[1] = v.a; w[2] = v.b; log(`Edited ${w[0]} workflow`); toast('Workflow saved') }) }
    function setAcctRole(email, r) { const a = S.accounts.find(x => x.email === email); a.role = r; log(`Changed ${a.name}'s role to ${r}`); toast(`${a.name} is now ${r === 'HR Admin' ? 'an HR Admin' : 'an Employee'}. Applies at their next sign-in.`); rerender() }
    function acct(email, st) { const a = S.accounts.find(x => x.email === email); a.status = st; a.fails = 0; log(`${st === 'Active' ? 'Enabled' : 'Disabled'} account for ${a.name}`); toast(`${a.name}'s account ${st === 'Active' ? 'is active' : 'is disabled'}`); rerender() }
    function resetPw(email) { const a = S.accounts.find(x => x.email === email); if (!a) { toast('This person has no sign-in account'); return } confirmBox(`Reset password for ${a.name}?`, 'Their password becomes Welcome@123 and they’re asked to change it at next sign-in. Any lock is cleared.', 'Reset password', () => { a.pass = a.role === 'HR Admin' ? 'Admin@123' : 'Welcome@123'; a.status = 'Active'; a.fails = 0; log(`Reset password for ${a.name}`); toast(`Password reset for ${a.name}`) }, false) }
    function resetData() { confirmBox('Reset all demo data?', 'Everything you changed in this prototype is replaced with the original sample data.', 'Reset', () => { const r = S.role; S = seed(); migrate(); S.role = r; toast('Demo data reset') }) }

    /* ---------- Audit ---------- */
    V.audit = () => head('Audit log', 'Every change made by HR admins and employees, newest first.', btn('Export', 'toast(\'Audit log exported\')', '', 'download')) +
      card(`${S.audit.length} events`, tbl([['When', r => `<span class="muted">${r.t}</span>`], ['Who', r => who(r.who)], ['Action', r => `<span style="white-space:normal">${esc(r.a)}</span>`]], S.audit));

    /* =========================================================
       PEOPLE PLUS SUITE: shared helpers
       ========================================================= */
    const SIGN_OPEN = ['Awaiting signature', 'Viewed'];
    const PAYHIST = [];
    const localISO = x => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
    const activeCands = () => S.cands.filter(c => !['Hired', 'Rejected'].includes(c.s));
    const courseAud = c => S.employees.filter(e => e.status !== 'Inactive').filter(e => c.aud === 'Everyone' || c.aud === e.dept || (c.aud === 'Managers' && S.employees.some(x => x.mgr === e.name)));
    const courseDone = c => courseAud(c).filter(e => (S.progress[e.name]?.[c.id] || 0) >= 100).length;
    function compliance() { let a = 0, d = 0; S.courses.filter(c => c.type === 'Mandatory').forEach(c => { a += courseAud(c).length; d += courseDone(c) }); return a ? Math.round(d / a * 100) : 100 }
    const donut = p => `<div class="donut" style="--p:${p}" role="img" aria-label="${p}%"><b>${p}%</b></div>`;
    const payTrend = ()=>[...S.payroll.runs].reverse().slice(-6);

    function area(vals, labels, fmt = v => v) {
      const W = 600, H = 210, L = 16, R = 16, T = 30, B = 30; const mx = Math.max(...vals), mn = Math.min(...vals), pad = (mx - mn) || mx * .1 || 1;
      const lo = mn - pad * .7, hi = mx + pad * .3; const X = i => L + i * (W - L - R) / Math.max(1, vals.length - 1), Y = v => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
      const line = vals.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(''); const id = 'ar' + uid(), n = vals.length - 1;
      return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block" role="img" aria-label="Trend from ${esc(labels[0])} to ${esc(labels[n])}, latest ${esc(fmt(vals[n]))}">
  <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--ac,var(--brand));stop-opacity:.26"/><stop offset="1" style="stop-color:var(--ac,var(--brand));stop-opacity:0"/></linearGradient></defs>
  ${[0, 1, 2, 3].map(k => { const y = T + k * (H - T - B) / 3; return `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" style="stroke:var(--line)" stroke-dasharray="3 5"/>` }).join('')}
  <path d="${line}L${X(n)},${H - B}L${X(0)},${H - B}Z" fill="url(#${id})"/>
  <path d="${line}" fill="none" style="stroke:var(--ac,var(--brand))" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
  ${vals.map((v, i) => `<circle cx="${X(i)}" cy="${Y(v)}" r="${i === n ? 5.5 : 3.5}" style="fill:var(--surface);stroke:var(--ac,var(--brand))" stroke-width="2.2"><title>${esc(labels[i])}: ${esc(fmt(v))}</title></circle>`).join('')}
  ${labels.map((l, i) => `<text x="${X(i)}" y="${H - 8}" text-anchor="${i === 0 ? 'start' : i === n ? 'end' : 'middle'}" font-size="12.5" style="fill:var(--muted)">${esc(l)}</text>`).join('')}
  <text x="${X(n)}" y="${Y(vals[n]) - 14}" text-anchor="end" font-size="14" font-weight="700" style="fill:var(--text)">${esc(fmt(vals[n]))}</text></svg>`;
    }

    function appMetrics() {
      const act = S.employees.filter(e => e.status !== 'Inactive'); const st = S.payroll.step;
      if (isAdmin()) {
        const pe = S.expenses.filter(x => x.status === 'Pending'); const onL = S.leaves.filter(l => l.status === 'Approved' && l.from <= todayISO() && l.to >= todayISO()).length;
        const kud = S.posts.filter(p => p.type === 'Kudos').length;
        return {
          people: { v: act.length, u: 'employees', s: `${onL} on leave today · ${S.leaves.filter(l => l.status === 'Pending').length} leave requests pending` },
          recruit: { v: S.jobs.filter(j => j.status === 'Open').length, u: 'open roles', s: `${activeCands().length} active candidates · ${S.interviews.length} interviews booked` },
          payroll: { v: st >= 5 ? 'Done' : `Step ${st + 1}/5`, u: S.payroll.month, s: st >= 5 ? 'Payslips published' : PAYSTEPS[st] },
          expense: { v: inr(pe.reduce((a, x) => a + x.amt, 0)), u: 'to review', s: `${pe.length} pending claim${pe.length === 1 ? '' : 's'}` },
          sign: { v: S.sign.filter(g => SIGN_OPEN.includes(g.status)).length, u: 'awaiting signature', s: `${S.sign.filter(g => g.status === 'Completed').length} envelopes completed` },
          connect: { v: S.posts.length, u: 'posts', s: `${kud} kudos shared · ${S.groups.length} groups` },
          learn: { v: compliance() + '%', u: 'compliant', s: `${S.courses.filter(c => c.type === 'Mandatory').length} mandatory courses · ${S.courses.length} total` },
          shift: { v: S.swaps.filter(x => x.status === 'Pending').length, u: 'swap requests', s: `${S.shifts.length} shifts · roster ${S.published ? 'published' : 'in draft'}` }
        }
      }
      const e = me(), myExp = S.expenses.filter(x => x.emp === ME && x.status === 'Pending'), toSign = S.sign.filter(g => g.to === ME && SIGN_OPEN.includes(g.status)).length;
      const due = S.courses.filter(c => c.type === 'Mandatory' && (c.aud === 'Everyone' || c.aud === e.dept) && (S.progress[ME]?.[c.id] || 0) < 100).length;
      const todays = shiftOn(e, localISO(new Date())), sh = S.shifts.find(x => x.n === todays);
      return {
        people: { v: S.leaveTypes[0].q - used(ME, 'Earned leave'), u: 'days earned leave', s: `${S.leaves.filter(l => l.emp === ME && l.status === 'Pending').length} leave requests pending` },
        recruit: { v: S.jobs.filter(j => j.status === 'Open').length, u: 'open roles', s: `Referral bonus up to ${inr(Math.max(...S.jobs.map(j => j.bonus || 0)))}` },
        payroll: { v: inr(salary(e).net), u: 'monthly net', s: `${S.payroll.runs[0].m} payslip is ready` },
        expense: { v: myExp.length, u: 'claims pending', s: myExp.length ? `${inr(myExp.reduce((a, x) => a + x.amt, 0))} waiting for approval` : 'Nothing waiting' },
        sign: { v: toSign, u: 'to sign', s: toSign ? 'Documents waiting for your signature' : 'You’re all caught up' },
        connect: { v: S.posts.filter(p => p.to === ME).length, u: 'kudos for you', s: `${S.posts.length} posts on the company feed` },
        learn: { v: due, u: 'courses due', s: due ? 'Mandatory training to finish' : 'All mandatory training done' },
        shift: { v: scode(todays)[0], u: 'today', s: sh ? `${sh.s} to ${sh.e}, ${todays} shift` : todays === 'Leave' ? 'On approved leave' : 'Day off' }
      }
    }
    const appCard = (a, m) => `<button class="appcard" style="--c:${a[3]}" onclick="${a[0] === 'plus' ? 'openPlusAdv()' : `openApp('${a[0]}')`}"><div class="t"><i>${ic(a[2])}</i><b>${a[1]}</b><span class="go">${ic('arrow', 16)}</span></div><div class="m">${m.v}<small>${esc(m.u)}</small></div><p>${m.s}</p></button>`;

    function celebrations() {
      const n = new Date(), m = n.getMonth(), y = n.getFullYear(), L = [];
      S.employees.filter(e => e.status !== 'Inactive').forEach(e => {
        if (e.dob && +e.dob.slice(5, 7) - 1 === m) L.push({ e: e.name, k: 'Birthday', d: e.dob.slice(5) });
        const j = new Date(e.joined + 'T00:00:00'); if (j.getMonth() === m && j.getFullYear() < y) { const k = y - j.getFullYear(); L.push({ e: e.name, k: `${k} year${k > 1 ? 's' : ''} at Brightcone`, d: e.joined.slice(5) }) }
      });
      return L.sort((a, b) => a.d.localeCompare(b.d))
    }
    const celebList = () => { const L = celebrations(); return L.length ? `<div class="list">${L.map(c => `<div class="row">${av(c.e)}<div class="grow"><b>${esc(c.e)}</b><div class="sub">${c.k} · ${new Date('2000-' + c.d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div></div><button class="btn sm" onclick="wish('${c.e}')">Wish</button></div>`).join('')}</div>` : '<div class="empty">No birthdays or work anniversaries this month.</div>' };
    function wish(n) { S.posts.unshift({ id: 'PO' + uid(), by: USER.name, type: 'Celebration', to: n, t: `Wishing ${n} a wonderful day!`, d: todayISO(), likes: [], comments: [] }); log(`Posted wishes for ${n}`); toast(`Posted wishes for ${n} on Connect`); rerender() }

    /* ---------- PEOPLE PLUS: Suite dashboard ---------- */
    V.suiteDash = () => {
      const act = S.employees.filter(e => e.status !== 'Inactive'), P = pendingAll(), M = appMetrics(), h = new Date().getHours(), g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
      const runs = payTrend(), st = S.payroll.step;
      const up = [...S.holidays.filter(x => x.d >= todayISO()).slice(0, 2).map(x => ({ d: x.d, t: x.n, s: x.t + ' holiday' })),
      ...S.interviews.map(i => ({ d: i.when.slice(0, 10), t: `Interview: ${S.cands.find(c => c.id === i.cand)?.n || 'Candidate'}`, s: i.round })),
      ...S.courses.filter(c => c.due && c.due >= todayISO()).map(c => ({ d: c.due, t: c.t, s: 'Training deadline' })),
      ...S.sign.filter(x => SIGN_OPEN.includes(x.status)).map(x => ({ d: x.due, t: x.doc, s: `Signature due from ${x.to}` }))].sort((a, b) => a.d.localeCompare(b.d)).filter(x => x.d >= todayISO()).slice(0, 5);
      return head(`${g}, ${USER.name.split(' ')[0]}`, `Here’s Brightcone today, ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}.`, btn('All apps', 'openLauncher()', '', 'grid') + btn('Add employee', 'addEmp()', 'primary', 'plus')) +
        `<div class="grid g4">${stat('users', 'Headcount', act.length, `${act.filter(e => e.status === 'Probation').length} on probation, ${act.filter(e => e.status === 'Notice period').length} serving notice`)}${stat('inbox', 'Pending approvals', P.length, 'Across all apps', P.length ? 'down' : 'up')}${stat('pay', 'Payroll, ' + S.payroll.month.split(' ')[0], st >= 5 ? 'Completed' : `Step ${st + 1} of 5`, st >= 5 ? 'Payslips published' : PAYSTEPS[st])}${stat('shield', 'Training compliance', compliance() + '%', 'Mandatory courses', compliance() >= 80 ? 'up' : 'down')}</div>
  <h2 class="sect">Apps</h2>
  <div class="apps-grid">${APPS.map(a => appCard(a, a[0] === 'plus' ? plusMetric() : M[a[0]])).join('')}</div>
  <div class="grid g-dash mt">
   ${card('Gross payroll, last 6 months', area(runs.map(r => r.gross / 1e5), runs.map(r => r.m.slice(0, 3)), v => '₹' + v.toFixed(1) + ' L'), `<button class="link" onclick="openApp('payroll')">Open Payroll</button>`)}
   ${card('Approvals waiting', P.length ? `<div class="list">${P.slice(0, 4).map(p => `<div class="row">${av(p.emp)}<div class="grow"><b>${esc(p.emp)}</b> <span class="pill p-info" style="margin-left:4px">${p.mod}</span><div class="sub" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p.what)}</div></div></div>`).join('')}</div>` : '<div class="empty">You’re all caught up.</div>', `<button class="link" onclick="go('approvals')">Review all ${P.length}</button>`)}
  </div>
  <div class="grid g3 mt">
   ${card('Coming up', up.length ? `<div class="list">${up.map(x => { const d = new Date(x.d + 'T00:00:00'); return `<div class="row"><span class="dchip"><b>${d.getDate()}</b>${d.toLocaleDateString('en-US', { month: 'short' })}</span><div class="grow"><b style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(x.t)}</b><div class="sub">${esc(x.s)}</div></div></div>` }).join('')}</div>` : '<div class="empty">Nothing scheduled.</div>')}
   ${card('Celebrations this month', celebList())}
   ${card('Latest on Connect', `<div class="list">${S.posts.slice(0, 3).map(p => `<div class="row">${av(p.by)}<div class="grow"><b>${esc(p.by)}</b> <span class="muted" style="font-size:12.5px">· ${p.type}</span><div class="sub" style="white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(p.t)}</div></div></div>`).join('')}</div>`, `<button class="link" onclick="openApp('connect')">Open feed</button>`)}
  </div>`;
    };

    /* ---------- RECRUIT: Dashboard ---------- */
    V.recruitDash = () => {
      const open = S.jobs.filter(j => j.status === 'Open'), st = STAGES.map(s => [s, S.cands.filter(c => c.s === s).length]), mx = Math.max(1, ...st.map(x => x[1]));
      const src = {}; S.cands.forEach(c => src[c.src] = (src[c.src] || 0) + 1); const sr = Object.entries(src).sort((a, b) => b[1] - a[1]), smx = Math.max(1, ...sr.map(x => x[1]));
      const avg = S.cands.length ? Math.round(S.cands.reduce((a, c) => a + c.sc, 0) / S.cands.length) : 0;
      return head('Recruit dashboard', 'Hiring health across every open role, scored by the Bright HR agent.', btn('Schedule interview', 'schedInt()', '', 'calendar') + btn('Post a job', 'editJob()', 'primary', 'plus')) +
        `<div class="grid g4">${stat('briefcase', 'Open roles', open.length, `${S.jobs.length} postings in total`)}${stat('users', 'Active candidates', activeCands().length, `Average fit score ${avg}%`)}${stat('calendar', 'Interviews booked', S.interviews.length, 'Upcoming rounds')}${stat('send', 'Offers out', S.cands.filter(c => c.s === 'Offer').length, `${S.cands.filter(c => c.s === 'Hired').length} hired this quarter`, 'up')}</div>
  <div class="grid g2 mt">
   ${card('Hiring funnel', `<div class="dept-bars">${st.map(([s, n]) => `<div class="r"><span>${s}</span>${bar(n / mx * 100)}<em>${n}</em></div>`).join('')}</div>`, `<button class="link" onclick="TAB.recruitment='Pipeline';go('recruitment')">Open pipeline</button>`)}
   ${card('Where candidates come from', `<div class="dept-bars">${sr.map(([s, n]) => `<div class="r"><span>${esc(s)}</span>${bar(n / smx * 100)}<em>${n}</em></div>`).join('')}</div>`)}
  </div>
  <div class="grid g-dash mt">
   ${card('Open roles', tbl([['Role', r => `<b>${esc(r.t)}</b><div class="muted" style="font-size:12.5px">${r.dept}, ${r.loc}</div>`], ['In pipeline', r => { const n = S.cands.filter(c => c.job === r.id && !['Rejected', 'Hired'].includes(c.s)).length; return `${n} candidate${n === 1 ? '' : 's'}` }], ['Top fit', r => { const t = S.cands.filter(c => c.job === r.id).sort((a, b) => b.sc - a.sc)[0]; return t ? `<span class="score">${t.sc}%</span> ${esc(t.n)}` : '—' }], ['Referral bonus', r => inr(r.bonus || 0)]], open, 'No open roles.'), `<button class="link" onclick="TAB.recruitment='Jobs';go('recruitment')">Manage jobs</button>`)}
   ${card('Upcoming interviews', S.interviews.length ? `<div class="list">${S.interviews.map(i => { const c = S.cands.find(x => x.id === i.cand); const d = new Date(i.when); return `<div class="row"><span class="dchip"><b>${d.getDate()}</b>${d.toLocaleDateString('en-US', { month: 'short' })}</span><div class="grow"><b>${esc(c?.n || '—')}</b><div class="sub">${esc(i.round)}, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div></div></div>` }).join('')}</div>` : '<div class="empty">No interviews scheduled.</div>')}
  </div>`;
    };

    /* ---------- PAYROLL: Dashboard ---------- */
    V.payrollDash = () => {
      const act = S.employees.filter(e => e.status !== 'Inactive'), runs = payTrend(), st = S.payroll.step;
      const dc = deptNames().map(d => [d, act.filter(e => e.dept === d).reduce((a, e) => a + e.ctc, 0) / 12]).filter(x => x[1]).sort((a, b) => b[1] - a[1]), dmx = dc[0]?.[1] || 1;
      const last = S.payroll.runs[0], prev = S.payroll.runs[1], ch = prev ? (last.gross - prev.gross) / prev.gross * 100 : 0;
      return head('Payroll dashboard', `${S.payroll.month} run, cost trends and statutory deadlines at a glance.`, btn('Salary register', "TAB.payrollAdmin='Salary register';go('payrollAdmin')", '', 'list') + btn(st >= 5 ? 'View payroll run' : 'Continue payroll run', "TAB.payrollAdmin='Run payroll';go('payrollAdmin')", 'primary', 'pay')) +
        `<div class="grid g4">${stat('pay', 'Gross pay, ' + last.m.split(' ')[0], inr(last.gross), `${ch >= 0 ? '+' : ''}${ch.toFixed(1)}% vs ${prev ? prev.m.split(' ')[0] : 'last month'}`)}${stat('check', 'Net payout', inr(last.net), `${last.emps} employees paid on ${fdShort(last.d)}`)}${stat('receipt', 'Deductions', inr(last.gross - last.net), 'PF, professional tax and TDS')}${stat('calendar','Last recorded pay date',S.payroll.runs[0]?.d?fdShort(S.payroll.runs[0].d):'—','From saved payroll history')}</div>
  <div class="grid g-dash mt">
   ${card('Gross payroll, last 6 months', area(runs.map(r => r.gross / 1e5), runs.map(r => r.m.slice(0, 3)), v => '₹' + v.toFixed(1) + ' L'))}
   ${card(S.payroll.month + ' run', `<div class="list">${PAYSTEPS.map((s, i) => `<div class="row"><span class="stepdot ${i < st ? 'done' : i === st ? 'cur' : ''}">${i < st ? ic('check', 13) : i + 1}</span><div class="grow"><b style="font-weight:${i === st ? 700 : 500}">${s}</b></div>${i < st ? pill('Completed') : i === st ? pill('In progress') : ''}</div>`).join('')}</div>`)}
  </div>
  <div class="grid g2 mt">
   ${card('Monthly cost by department', `<div class="dept-bars wide">${dc.map(([d, v]) => `<div class="r"><span>${d}</span>${bar(v / dmx * 100)}<em>₹${(v / 1e5).toFixed(1)}L</em></div>`).join('')}</div>`)}
   ${card('Statutory deadlines', `<div class="list">${[['Professional tax, Telangana', '2026-10-10', 'Pending'], ['Provident fund (ECR)', '2026-10-15', 'Pending'], ['ESI', '2026-10-15', 'Completed'], ['TDS (Form 24Q), Q2', '2026-10-31', 'Pending']].map(r => { const d = new Date(r[1] + 'T00:00:00'); return `<div class="row"><span class="dchip"><b>${d.getDate()}</b>${d.toLocaleDateString('en-US', { month: 'short' })}</span><div class="grow"><b>${r[0]}</b></div>${pill(r[2])}</div>` }).join('')}</div>`, `<button class="link" onclick="TAB.payrollAdmin='Statutory compliance';go('payrollAdmin')">Open compliance</button>`)}
  </div>`;
    };

    /* ---------- EXPENSE: Dashboard ---------- */
    V.expenseDash = () => {
      const E = S.expenses, sum = f => E.filter(f).reduce((a, x) => a + x.amt, 0), pend = E.filter(x => x.status === 'Pending');
      const cats = {}; E.forEach(x => cats[x.cat] = (cats[x.cat] || 0) + x.amt); const cr = Object.entries(cats).sort((a, b) => b[1] - a[1]), cmx = cr[0]?.[1] || 1;
      return head('Expense dashboard', 'Claims waiting on you, spend by category and reimbursements due.', btn('Export', "toast('Expense report exported')", '', 'download') + btn('Review claims', "TAB.expF='Pending';go('expensesAdmin')", 'primary', 'receipt')) +
        `<div class="grid g4">${stat('inbox', 'Awaiting approval', inr(sum(x => x.status === 'Pending')), `${pend.length} claim${pend.length === 1 ? '' : 's'}`, pend.length ? 'down' : 'up')}${stat('check', 'Approved, not yet paid', inr(sum(x => x.status === 'Approved')), 'Paid with the next payroll')}${stat('pay', 'Reimbursed', inr(sum(x => x.status === 'Paid')), 'This quarter')}${stat('receipt', 'Average claim', inr(E.length ? sum(() => true) / E.length : 0), `${E.length} claims filed`)}</div>
  <div class="grid g-dash mt">
   ${card('Pending claims', pend.length ? `<div class="list">${pend.map(x => `<div class="row" style="flex-wrap:wrap">${av(x.emp)}<div class="grow"><b>${esc(x.emp)}</b> <span class="muted">· ${esc(x.cat)}</span><div class="sub">${esc(x.desc)}, ${fdShort(x.date)}</div></div><b style="margin-right:6px;font-variant-numeric:tabular-nums">${inr(x.amt)}</b><span>${approveBtns('expenses', x.id)}</span></div>`).join('')}</div>` : '<div class="empty">No claims waiting. Nice work.</div>')}
   ${card('Spend by category', `<div class="dept-bars wide">${cr.map(([c, v]) => `<div class="r"><span>${esc(c)}</span>${bar(v / cmx * 100)}<em>₹${(v / 1000).toFixed(1)}k</em></div>`).join('')}</div><p class="muted" style="font-size:12.5px;margin:12px 0 0">Claims above ₹25,000 also need Finance approval.</p>`)}
  </div>
  <div class="mt">${card('Recent claims', tbl([['Employee', r => who(r.emp)], ['Category', r => r.cat], ['Date', r => fd(r.date)], ['Amount', r => `<b>${inr(r.amt)}</b>`], ['Status', r => pill(r.status)]], [...E].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)), `<button class="link" onclick="TAB.expF='All';go('expensesAdmin')">See all claims</button>`)}</div>`;
    };

    /* ---------- SIGN ---------- */
    function signRow(g) { const late = g.due < todayISO(); return `<div class="row"><span class="av" style="background:color-mix(in srgb,var(--ac) 14%,transparent);color:var(--ac)">${ic('doc', 16)}</span><div class="grow"><b style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(g.doc)}</b><div class="sub">To ${esc(g.to)}${g.ext ? ' (external)' : ''} · ${late ? '<span style="color:var(--bad);font-weight:600">overdue</span>' : 'due ' + fdShort(g.due)}</div></div>${pill(g.status)}<button class="btn sm" onclick="remindSign('${g.id}')">Remind</button></div>` }
    V.signDash = () => {
      const G = S.sign, open = G.filter(g => SIGN_OPEN.includes(g.status)), done = G.filter(g => g.status === 'Completed');
      const tat = done.length ? (done.reduce((a, g) => a + (new Date(g.signed) - new Date(g.sent)) / 864e5, 0) / done.length).toFixed(1) + ' days' : '—';
      return head('Sign dashboard', 'Send offers, agreements and policies for e-signature and track every envelope.', btn('Templates', "go('signTemplates')", '', 'doc') + btn('New signature request', 'newSign()', 'primary', 'pen')) +
        `<div class="grid g4">${stat('pen', 'Awaiting signature', open.length, `${G.filter(g => g.status === 'Viewed').length} opened but not signed`)}${stat('check', 'Completed', done.length, 'Signed and filed', 'up')}${stat('clock', 'Average turnaround', tat, 'From sent to signed')}${stat('x', 'Declined or voided', G.filter(g => ['Declined', 'Voided', 'Expired'].includes(g.status)).length, 'Need follow-up')}</div>
  <div class="grid g-dash mt">
   ${card('Waiting on others', open.length ? `<div class="list">${open.map(signRow).join('')}</div>` : '<div class="empty">Nothing waiting for a signature.</div>', `<button class="link" onclick="go('signDocs')">All requests</button>`)}
   ${card('Envelope status', `<div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap">${donut(G.length ? Math.round(done.length / G.length * 100) : 0)}<div class="list" style="flex:1;min-width:150px">${['Completed', 'Awaiting signature', 'Viewed', 'Declined'].map(s => `<div class="row"><div class="grow">${pill(s)}</div><b>${G.filter(g => g.status === s).length}</b></div>`).join('')}</div></div><p class="muted" style="font-size:12.5px;margin:14px 0 0">Share of all envelopes that are fully signed.</p>`)}
  </div>
  <div class="mt">${card('Most-used templates', `<div class="dept-bars wide2">${[...S.signTpls].sort((a, b) => b.used - a.used).map(t => `<div class="r"><span>${esc(t.n)}</span>${bar(t.used / Math.max(...S.signTpls.map(x => x.used)) * 100)}<em>${t.used}</em></div>`).join('')}</div>`)}</div>`;
    };
    V.signDocs = () => {
      const T = ['All', 'Awaiting signature', 'Viewed', 'Completed', 'Declined'], f = TAB.sgF || 'All', L = S.sign.filter(g => f === 'All' || g.status === f);
      return head('Signature requests', 'Every envelope sent from Brightcone, with its signing status.', btn('New signature request', 'newSign()', 'primary', 'pen')) +
        `<div class="tabs" style="margin-bottom:16px">${T.map(s => `<button class="${s === f ? 'on' : ''}" onclick="TAB.sgF='${s}';rerender()">${s} (${s === 'All' ? S.sign.length : S.sign.filter(g => g.status === s).length})</button>`).join('')}</div>` +
        card(`${L.length} envelope${L.length === 1 ? '' : 's'}`, tbl([['ID', r => `<span class="muted">${r.id}</span>`], ['Document', r => `<b>${esc(r.doc)}</b><div class="muted" style="font-size:12.5px">${esc(r.tpl)}</div>`], ['Recipient', r => who(r.to, r.ext ? 'External' : emp(r.to)?.role || '')], ['Sent', r => fd(r.sent)], ['Due', r => fd(r.due)], ['Status', r => pill(r.status)], ['', r => SIGN_OPEN.includes(r.status) ? `${btn('Remind', `remindSign('${r.id}')`, 'sm')} ${btn('Void', `voidSign('${r.id}')`, 'sm bad')}` : r.status === 'Completed' ? btn('Signed copy', "toast('Signed copy downloaded')", 'sm', 'download') : '']], L, 'No envelopes in this list.'))
    };
    V.signTemplates = () => head('Templates', 'Reusable documents with signature and form fields already placed.', btn('Upload template', "toast('Template upload isn’t connected in this prototype')", '', 'upload')) +
      `<div class="tplgrid">${S.signTpls.map(t => `<div class="card"><div class="tplprev"><i></i><i></i><i style="width:62%"></i><i></i><i style="width:40%"></i><em>${ic('pen', 13)} Sign here</em></div><b>${esc(t.n)}</b><div class="muted" style="font-size:12.5px">${t.f} fields · used ${t.used} times</div><div style="margin-top:12px">${btn('Use template', `newSign('${esc(t.n)}')`, 'sm primary', 'send')}</div></div>`).join('')}</div>`;
    function newSign(tpl) {
      form('New signature request', 'The recipient gets an email with a secure signing link.', [
        { k: 'tpl', l: 'Template', t: 'select', o: S.signTpls.map(t => t.n), v: tpl || 'Offer letter' },
        { k: 'doc', l: 'Document title', req: true, ph: 'For example, Offer letter: QA Automation Engineer' },
        { k: 'to', l: 'Recipient', t: 'select', o: [...S.employees.map(e => e.name), ...S.cands.filter(c => ['Offer', 'Interview'].includes(c.s)).map(c => c.n)] },
        { k: 'due', l: 'Sign by', t: 'date', v: localISO(new Date(Date.now() + 7 * 864e5)), req: true }], 'Send for signature', v => {
          S.sign.unshift({ id: 'SG-' + (1043 + S.sign.length), doc: v.doc, tpl: v.tpl, to: v.to, ext: !emp(v.to), from: USER.name, sent: todayISO(), due: v.due, status: 'Awaiting signature' });
          const t = S.signTpls.find(t => t.n === v.tpl); if (t) t.used++; log(`Sent "${v.doc}" to ${v.to} for signature`); toast(`Sent to ${v.to} for signature`)
        })
    }
    function remindSign(id) { const g = S.sign.find(x => x.id === id); log(`Sent signing reminder for ${g.id} to ${g.to}`); toast(`Reminder sent to ${g.to}`) }
    function voidSign(id) { const g = S.sign.find(x => x.id === id); confirmBox('Void this envelope?', `${g.to} can no longer sign “${esc(g.doc)}”. You can send a new request later.`, 'Void envelope', () => { g.status = 'Voided'; log(`Voided ${g.id}`); toast('Envelope voided') }) }
    V.mySign = () => {
      const mine = S.sign.filter(g => g.to === ME), open = mine.filter(g => SIGN_OPEN.includes(g.status));
      return head('Documents to sign', 'Review and e-sign documents HR sends you. Signed copies stay here.') +
        (open.length ? `<div class="banner" style="background:color-mix(in srgb,var(--ac) 9%,var(--surface));border-color:color-mix(in srgb,var(--ac) 30%,transparent)">${ic('pen')}<span><b style="color:var(--ac)">${open.length} document${open.length > 1 ? 's' : ''}</b> waiting for your signature.</span></div>` : '') +
        card('Your documents', tbl([['Document', r => `<b>${esc(r.doc)}</b><div class="muted" style="font-size:12.5px">From ${esc(r.from)}</div>`], ['Received', r => fd(r.sent)], ['Sign by', r => fd(r.due)], ['Status', r => pill(r.status)], ['', r => SIGN_OPEN.includes(r.status) ? btn('Review & sign', `signDoc('${r.id}')`, 'sm primary', 'pen') : r.status === 'Completed' ? btn('Signed copy', "toast('Signed copy downloaded')", 'sm', 'download') : '']], mine, 'Nothing to sign right now.'))
    };
    function signDoc(id) {
      const g = S.sign.find(x => x.id === id); if (g.status === 'Awaiting signature') g.status = 'Viewed'; save();
      modal(`<h2>${esc(g.doc)}</h2><p class="sub">Sent by ${esc(g.from)} on ${fd(g.sent)}. Read it, then type your full name to sign.</p>
  <div class="docprev"><b>${esc(g.tpl)}</b><p>Document preview. In the live portal the full PDF opens here with your fields highlighted.</p><div class="lines"><i></i><i></i><i style="width:72%"></i><i></i><i style="width:50%"></i></div></div>
  <label class="field">Type your full name<input class="input" id="sigName" autocomplete="name" placeholder="${esc(ME)}" oninput="document.getElementById('sigPrev').textContent=this.value"></label>
  <div class="sigbox"><span id="sigPrev"></span><small>Signature preview</small></div>
  <label class="check"><input type="checkbox" id="sigOk"> <span>I agree to sign this document electronically.</span></label>
  <p id="ferr" style="color:var(--bad);font-size:13.5px;margin:0 0 8px;min-height:1px"></p>
  <div class="mfoot"><button class="btn" onclick="closeAll();rerender()">Later</button><button class="btn primary" onclick="finishSign('${id}')">${ic('pen', 16)}Sign document</button></div>`)
    }
    function finishSign(id) {
      const n = document.getElementById('sigName').value.trim(), err = m => document.getElementById('ferr').textContent = m;
      if (n.toLowerCase() !== ME.toLowerCase()) return err(`Type your name exactly as it appears on record: ${ME}.`);
      if (!document.getElementById('sigOk').checked) return err('Tick the box to agree to e-signing.');
      const g = S.sign.find(x => x.id === id); g.status = 'Completed'; g.signed = todayISO(); log(`Signed "${g.doc}"`); closeAll(); toast('Signed. Your copy is saved here.'); rerender()
    }

    /* ---------- CONNECT ---------- */
    const PT = { Kudos: ['star', '#D99A00'], Update: ['chat', '#0BA6CC'], Announcement: ['mega', '#D9466F'], Welcome: ['gift', '#12A58E'], Celebration: ['gift', '#7C5CFF'] };
    function postCard(p) {
      const liked = p.likes.includes(USER.name), [i, c] = PT[p.type] || PT.Update, n = p.likes.length;
      return `<article class="card post mt"><header>${who(p.by, `${fdShort(p.d)} · ${emp(p.by)?.dept || ''}`)}<span class="ptag" style="--c:${c}">${ic(i, 14)}${p.type}</span></header>
  ${p.to ? `<div class="kudo" style="--c:${c}">${av(p.to)}<div><span>${p.type === 'Kudos' ? 'Kudos to' : p.type === 'Welcome' ? 'Welcome to the team' : 'Celebrating'}</span><b>${esc(p.to)}</b></div></div>` : ''}
  <p>${esc(p.t)}</p>
  <footer><button class="pbtn ${liked ? 'on' : ''}" onclick="likePost('${p.id}')" aria-pressed="${liked}">${ic('thumb', 16)}${n ? n + ' ' : ''}Like${n > 1 ? 's' : ''}</button><button class="pbtn" onclick="document.getElementById('c_${p.id}').focus()">${ic('chat', 16)}${p.comments.length} comment${p.comments.length === 1 ? '' : 's'}</button></footer>
  ${p.comments.map(c => `<div class="cmt">${av(c.by)}<div><b>${esc(c.by)}</b> ${esc(c.t)}</div></div>`).join('')}
  <div class="cmt-in">${av(USER.name)}<input class="input" id="c_${p.id}" placeholder="Write a comment and press Enter" aria-label="Comment" onkeydown="if(event.key==='Enter')addComment('${p.id}',this.value)"></div></article>`
    }
    V.feed = () => {
      const pt = TAB.ptype || 'Update';
      return head('Company feed', 'Updates, kudos and celebrations from across Brightcone.', isAdmin() ? btn('Post announcement', 'postAnn()', '', 'mega') : '') +
        `<div class="grid g-dash" style="align-items:start"><div>
   <div class="card composer">${who(USER.name, 'Share with everyone at Brightcone')}<textarea class="input" id="postT" rows="3" placeholder="Share an update or thank a colleague"></textarea>
    <div class="cfoot"><div class="tabs" id="ptype">${['Update', 'Kudos', 'Celebration'].map(t => `<button data-t="${t}" class="${pt === t ? 'on' : ''}" onclick="setPType('${t}')">${t}</button>`).join('')}</div>
    <select class="input" id="kudoTo" ${pt === 'Kudos' ? '' : 'hidden'} aria-label="Who to thank">${S.employees.filter(e => e.name !== USER.name).map(e => `<option>${esc(e.name)}</option>`).join('')}</select>
    <button class="btn primary" style="margin-left:auto" onclick="addPost()">${ic('send', 16)}Post</button></div></div>
   ${S.posts.map(postCard).join('')}
  </div><div>
   ${card('Celebrations this month', celebList())}
   <div class="mt">${card('Pinned', `<div class="list">${S.announcements.filter(a => a.pin).concat(S.announcements.filter(a => !a.pin)).slice(0, 3).map(a => `<div class="row"><div class="grow"><b style="white-space:normal">${esc(a.t)}</b><div class="sub">${fdShort(a.d)}</div></div></div>`).join('')}</div>`, isAdmin() ? `<button class="link" onclick="go('announcements')">Manage</button>` : '')}</div>
   <div class="mt">${card('Groups', `<div class="list">${S.groups.map(g => `<div class="row"><span class="av" style="background:color-mix(in srgb,var(--ac) 14%,transparent);color:var(--ac)">${ic('users', 16)}</span><div class="grow"><b>${esc(g.n)}</b><div class="sub">${g.m} members</div></div><button class="btn sm" onclick="toast('You joined ${esc(g.n)}')">Join</button></div>`).join('')}</div>`)}</div>
  </div></div>`};
    function setPType(t) { TAB.ptype = t; document.querySelectorAll('#ptype button').forEach(b => b.classList.toggle('on', b.dataset.t === t)); document.getElementById('kudoTo').hidden = t !== 'Kudos' }
    function addPost() {
      const el = document.getElementById('postT'), t = el.value.trim(); if (!t) { toast('Write something before posting'); el.focus(); return }
      const ty = TAB.ptype || 'Update', p = { id: 'PO' + uid(), by: USER.name, type: ty, t, d: todayISO(), likes: [], comments: [] }; if (ty === 'Kudos') p.to = document.getElementById('kudoTo').value;
      S.posts.unshift(p); log(`Posted ${ty.toLowerCase()} on Connect`); toast('Posted to the company feed'); rerender()
    }
    function likePost(id) { const p = S.posts.find(x => x.id === id), i = p.likes.indexOf(USER.name); i >= 0 ? p.likes.splice(i, 1) : p.likes.push(USER.name); rerender() }
    function addComment(id, t) { t = t.trim(); if (!t) return; S.posts.find(x => x.id === id).comments.push({ by: USER.name, t }); rerender() }

    /* ---------- LEARN: Dashboard ---------- */
    V.learnDash = () => {
      const m = S.courses.filter(c => c.type === 'Mandatory'), comp = compliance(), open = [];
      m.forEach(c => courseAud(c).forEach(e => { const p = S.progress[e.name]?.[c.id] || 0; if (p < 100) open.push({ e: e.name, c, p }) }));
      open.sort((a, b) => (a.c.due || '9').localeCompare(b.c.due || '9')); const ppl = new Set(open.map(o => o.e)).size;
      const inprog = Object.values(S.progress).flatMap(o => Object.values(o)).filter(v => v > 0 && v < 100).length;
      return head('Learn dashboard', 'Compliance training, course progress and who needs a nudge.', btn('Remind everyone behind', `toast('Reminders sent to ${ppl} people')`, '', 'bell') + btn('Add course', 'editCourse()', 'primary', 'plus')) +
        `<div class="grid g4">${stat('shield', 'Mandatory compliance', comp + '%', 'Across all required courses', comp >= 80 ? 'up' : 'down')}${stat('learn', 'Courses', S.courses.length, `${m.length} mandatory, ${S.courses.length - m.length} elective`)}${stat('clock', 'In progress', inprog, 'Learners part-way through')}${stat('users', 'People behind', ppl, 'With mandatory courses open', ppl ? 'down' : 'up')}</div>
  <div class="grid g-dash mt">
   ${card('Completion by course', `<div class="dept-bars wide2">${S.courses.map(c => { const a = courseAud(c).length || 1, d = courseDone(c); return `<div class="r"><span title="${esc(c.t)}">${esc(c.t)}</span>${bar(d / a * 100)}<em>${Math.round(d / a * 100)}%</em></div>` }).join('')}</div>`, `<button class="link" onclick="go('learningAdmin')">Catalogue</button>`)}
   ${card('Compliance', `<div style="display:flex;justify-content:center;padding:4px 0 14px">${donut(comp)}</div><div class="list">${m.map(c => `<div class="row"><div class="grow"><b style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(c.t)}</b><div class="sub">Due ${fd(c.due)}</div></div><span class="muted" style="font-variant-numeric:tabular-nums">${courseDone(c)}/${courseAud(c).length}</span></div>`).join('')}</div>`)}
  </div>
  <div class="mt">${card('Mandatory courses still open', tbl([['Employee', r => who(r.e)], ['Course', r => esc(r.c.t)], ['Due', r => fd(r.c.due)], ['Progress', r => `<div style="min-width:130px">${bar(r.p)}<span class="muted" style="font-size:12px">${r.p}%</span></div>`], ['', r => btn('Nudge', `toast('Reminder sent to ${r.e}')`, 'sm')]], open.slice(0, 8), 'Everyone is up to date.'), open.length > 8 ? `<span class="muted" style="font:500 13px Figtree">Showing 8 of ${open.length}</span>` : '')}</div>`;
    };

    /* ---------- SHIFT ---------- */
    let WK = 0;
    const SCODE = { 'General': ['GEN', '#0B6FDB'], 'US Pacific': ['USP', '#7C5CFF'], 'US Central': ['USC', '#E07A1D'], 'Night support': ['NGT', '#5B6BD8'], 'Off': ['OFF', ''], 'Leave': ['LV', ''] };
    const scode = n => SCODE[n] || [String(n).slice(0, 3).toUpperCase(), '#3B82C4'];
    function weekDates(off = 0) { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + off * 7); return [...Array(7)].map((_, i) => { const x = new Date(d); x.setDate(d.getDate() + i); return localISO(x) }) }
    function shiftOn(e, d) { const k = e.id + '|' + d; if (S.roster[k]) return S.roster[k]; if (S.leaves.some(l => l.emp === e.name && l.status === 'Approved' && l.from <= d && l.to >= d)) return 'Leave'; const w = new Date(d + 'T00:00:00').getDay(); if (w === 0 || w === 6) return e.shift === 'Night support' ? e.shift : 'Off'; return e.shift }
    function chip(s, click) {
      const [c, col] = scode(s), cls = s === 'Off' ? 'off' : s === 'Leave' ? 'lv' : '', st = col && !cls ? `style="--c:${col}"` : '';
      return click ? `<button class="chip ${cls}" ${st} onclick="${click}" title="${esc(s)}. Click to change" aria-label="${esc(s)}">${c}</button>` : `<span class="chip ${cls}" ${st} title="${esc(s)}">${c}</span>`
    }
    const weekNav = () => `<div class="tabs" role="group" aria-label="Week"><button onclick="WK--;rerender()">‹ Prev</button><button class="${WK === 0 ? 'on' : ''}" onclick="WK=0;rerender()">This week</button><button onclick="WK++;rerender()">Next ›</button></div>`;
    V.shiftRoster = () => {
      const D = weekDates(WK), t = localISO(new Date()), act = S.employees.filter(e => e.status !== 'Inactive'), opts = [...S.shifts.map(s => s.n), 'Off'];
      const cov = D.map(d => act.filter(e => !['Off', 'Leave'].includes(shiftOn(e, d))).length), ti = D.indexOf(t);
      return head('Weekly roster', `${fd(D[0])} to ${fd(D[6])}. Click any cell to change that person’s shift.`, weekNav() + btn(S.published ? 'Roster published' : 'Publish roster', 'publishRoster()', S.published ? '' : 'primary', S.published ? 'check' : 'send')) +
        `<div class="grid g4">${stat('users', ti >= 0 ? 'Scheduled today' : 'Scheduled Monday', ti >= 0 ? cov[ti] : cov[0], `of ${act.length} people`)}${stat('calendar', 'Shifts defined', S.shifts.length, S.shifts.map(s => scode(s.n)[0]).join(' · '))}${stat('swap', 'Swap requests', S.swaps.filter(s => s.status === 'Pending').length, 'Waiting for approval')}${stat('leave', 'On leave this week', act.filter(e => D.some(d => shiftOn(e, d) === 'Leave')).length, 'From approved leave')}</div>
  <div class="card mt" style="padding:0;overflow:hidden"><div class="table-wrap" style="margin:0;border-top:0"><table class="roster"><thead><tr><th>Employee</th>${D.map(d => { const x = new Date(d + 'T00:00:00'); return `<th class="${d === t ? 'today' : ''}">${x.toLocaleDateString('en-US', { weekday: 'short' })}<span>${x.getDate()}</span></th>` }).join('')}</tr></thead>
  <tbody>${act.map(e => `<tr><td>${who(e.name, e.shift + ' shift')}</td>${D.map(d => `<td class="${d === t ? 'today' : ''}">${chip(shiftOn(e, d), `cycleShift('${e.id}','${d}')`)}</td>`).join('')}</tr>`).join('')}
  <tr class="covrow"><td><b>Coverage</b></td>${cov.map((c, i) => `<td class="${D[i] === t ? 'today' : ''}"><b>${c}</b></td>`).join('')}</tr></tbody></table></div></div>
  <div class="legend mt">${opts.map(o => `<span>${chip(o)}${esc(o)}</span>`).join('')}<span>${chip('Leave')}On leave</span></div>`
    };
    function cycleShift(id, d) {
      const e = S.employees.find(x => x.id === id), opts = [...S.shifts.map(s => s.n), 'Off'], cur = shiftOn(e, d);
      if (cur === 'Leave') { toast(`${e.name} is on approved leave that day`); return }
      const nx = opts[(opts.indexOf(cur) + 1) % opts.length]; S.roster[id + '|' + d] = nx; S.published = false; toast(`${e.name}: ${nx} on ${fdShort(d)}`); rerender()
    }
    function publishRoster() { if (S.published) { toast('This roster is already published'); return } S.published = true; log('Published shift roster'); toast('Roster published. Everyone has been notified of their shifts.'); rerender() }
    V.shiftSwaps = () => {
      const f = TAB.swF || 'Pending', L = S.swaps.filter(x => f === 'All' || x.status === f);
      return head('Swap requests', 'Approve shift swaps and cover requests. Approved swaps update the roster automatically.') +
        `<div class="tabs" style="margin-bottom:16px">${['Pending', 'Approved', 'Rejected', 'All'].map(s => `<button class="${s === f ? 'on' : ''}" onclick="TAB.swF='${s}';rerender()">${s} (${s === 'All' ? S.swaps.length : S.swaps.filter(x => x.status === s).length})</button>`).join('')}</div>` +
        card(`${L.length} request${L.length === 1 ? '' : 's'}`, tbl([['Employee', r => who(r.emp)], ['Date', r => fd(r.date)], ['Change', r => `<span style="display:inline-flex;gap:6px;align-items:center">${chip(r.from)}${ic('arrow', 14)}${chip(r.to)}</span>`], ['Swap with', r => r.with ? esc(r.with) : '<span class="muted">Needs cover</span>'], ['Reason', r => `<span style="white-space:normal">${esc(r.reason)}</span>`], ['Status', r => pill(r.status)], ['', r => r.status === 'Pending' ? approveBtns('swaps', r.id) : '']], L, 'No requests in this list.'))
    };
    V.mySchedule = () => {
      const e = me(), D = weekDates(WK), t = localISO(new Date());
      return head('My schedule', `Your shifts from ${fd(D[0])} to ${fd(D[6])}.`, weekNav() + btn('Request a swap', 'reqSwap()', 'primary', 'swap')) +
        `<div class="week">${D.map(d => { const s = shiftOn(e, d), x = new Date(d + 'T00:00:00'), o = S.shifts.find(y => y.n === s); return `<div class="day ${d === t ? 'today' : ''} ${['Off', 'Leave'].includes(s) ? 'off' : ''}"><b>${x.toLocaleDateString('en-US', { weekday: 'short' })}</b><div class="h">${x.getDate()}</div>${chip(s)}<div class="muted" style="font-size:12px;margin-top:8px">${o ? `${o.s} to ${o.e}` : s === 'Leave' ? 'On leave' : 'Day off'}</div></div>` }).join('')}</div>
  <div class="mt">${card('My swap requests', tbl([['Date', r => fd(r.date)], ['Change', r => `<span style="display:inline-flex;gap:6px;align-items:center">${chip(r.from)}${ic('arrow', 14)}${chip(r.to)}</span>`], ['Swap with', r => r.with ? esc(r.with) : '<span class="muted">Needs cover</span>'], ['Status', r => pill(r.status)]], S.swaps.filter(s => s.emp === ME), 'No swap requests yet.'))}</div>`
    };
    function reqSwap() {
      const e = me(); form('Request a shift swap', 'Your manager approves swaps, then the roster updates.', [
        { k: 'date', l: 'Date', t: 'date', v: localISO(new Date()), req: true, half: true }, { k: 'to', l: 'Change to', t: 'select', o: [...S.shifts.map(s => s.n), 'Off'], half: true },
        { k: 'with', l: 'Swap with', t: 'select', o: ['Nobody, I need cover', ...S.employees.filter(x => x.name !== ME).map(x => x.name)] }, { k: 'reason', l: 'Reason', t: 'textarea' }], 'Send request', v => {
          const from = shiftOn(e, v.date); if (from === 'Leave') return 'You’re on approved leave that day.'; if (from === v.to) return `You’re already on ${v.to} that day.`;
          S.swaps.unshift({ id: 'SW' + uid(), emp: ME, date: v.date, from, to: v.to, with: v.with.startsWith('Nobody') ? '' : v.with, reason: v.reason || '—', status: 'Pending' }); log('Requested a shift swap'); toast('Swap request sent to your manager')
        })
    }

    /* =========================================================
       LIVE HR RECORDS ENGINE
       Separate storage from the demo state (bc-hr-state). Starts empty.
       ========================================================= */
    const RKEY = 'bc-pp-records-v1';
    function rload(){return structuredClone(initial.live)}
    let R = rload() || { v: 1, data: {}, seq: {}, settings: { empPrefix: 'BC-', quotas: { 'Casual leave': 12 } }, audit: [], created: new Date().toISOString() };
    R.settings = R.settings || {}; R.settings.quotas = R.settings.quotas || { 'Casual leave': 12 }; R.settings.empPrefix = R.settings.empPrefix || 'BC-'; R.audit = R.audit || []; R.seq = R.seq || {};
    let RSAVED = null;
    function rsave(){RSAVED=R.saved||null;return save()}
    function raudit(a) { R.audit.unshift({ t: new Date().toISOString(), by: USER ? USER.email : 'system', a }); if (R.audit.length > 500) R.audit.length = 500 }
    const recs = k => (R.data[k] = R.data[k] || []);
    const live = k => recs(k).filter(r => !r._arch);
    const nowISO = () => new Date().toISOString();
    const tdy = () => localISO(new Date());
    const fdt = s => s ? new Date(s).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—';
    const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return localISO(d) };
    const addMonths = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setMonth(d.getMonth() + n); return localISO(d) };
    const dayDiff = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5);
    function nextId(k, prefix, pad = 4) { const used = new Set(recs(k).map(r => r.id)); let n = R.seq[k] || 0; let id; do { n++; id = prefix + String(n).padStart(pad, '0') } while (used.has(id)); R.seq[k] = n; return id }
    const mask = v => { v = String(v || ''); return v.length > 4 ? '•'.repeat(Math.min(8, v.length - 4)) + v.slice(-4) : v };
    I.eye = '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>';
    I.restore = '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>';
    I.idcard = '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2.5"/><path d="M14 10h5M14 14h4"/>';
    I.building = '<rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>';

    /* ---------- employees (live master data) ---------- */
    const MEMP = () => live('emp');
    const empName = e => `${e.first || ''} ${e.last || ''}`.trim();
    const empById = id => recs('emp').find(r => r.id === id);
    const empText = id => { const e = empById(id); return e ? `${empName(e)} (${id})` : (id || '') };
    const empCell = id => { if (!id) return '<span class="muted">—</span>'; const e = empById(id); const n = e ? empName(e) : id; return `<div class="who">${av(n || '?')}<div><b>${esc(n)}</b><span>${esc(id)}${e && e.designation ? ' · ' + esc(e.designation) : ''}</span></div></div>` };

    /* ---------- status pills ---------- */
    Object.assign(PILL, { Overdue: 'bad', 'In review': 'info', Confirmed: 'ok', Extended: 'warn', Expired: 'bad', 'In clearance': 'info', 'On hold': 'mute', Applied: 'mute', Screening: 'info', Interview: 'info', Selected: 'ok', Offered: 'info', Joined: 'ok', Scheduled: 'info', Rescheduled: 'warn', 'Pending approval': 'warn', Sent: 'info', Accepted: 'ok', Declined: 'bad', Converted: 'ok', Discontinued: 'bad', Recorded: 'ok', Regularised: 'info', Availed: 'ok', Upcoming: 'info', Past: 'mute', Processed: 'info', Superseded: 'mute', Generated: 'info', Filed: 'ok', 'Self review done': 'info', 'Manager review done': 'info', Nominated: 'info', Awarded: 'ok', Planned: 'info', Ongoing: 'info', Returned: 'mute', Retired: 'mute', Lost: 'bad', Deactivated: 'mute', Terminated: 'bad', Archived: 'mute', 'Under review': 'info', Exited: 'mute', Pending: 'warn', Approved: 'ok', Completed: 'ok', Active: 'ok' });

    /* ---------- field helper ---------- */
    const F = (k, l, t = 'text', x = {}) => ({ k, l, t, ...x });
    const LTYPES = ['Casual leave', 'Sick leave', 'Earned leave', 'Comp-off', 'Loss of pay', 'Maternity leave', 'Paternity leave', 'Bereavement leave'];
    const ATT = ['Present', 'Absent', 'Half day', 'On leave', 'Work from home', 'Holiday', 'Week off'];

    /* ---------- registry: one entry per submenu ---------- */
    const REG = {
      emp: {
        title: 'Employee master data', one: 'Employee', icon: 'users', app: 'people', desc: 'The live employee register. Every other record links here by Employee ID.',
        f: [F('first', 'First name', 'text', { req: 1, half: 1 }), F('last', 'Last name', 'text', { req: 1, half: 1 }), F('email', 'Work email', 'email', { req: 1, half: 1 }), F('phone', 'Phone', 'tel', { half: 1 }), F('dob', 'Date of birth', 'date', { half: 1 }), F('gender', 'Gender', 'select', { o: ['Female', 'Male', 'Non-binary', 'Prefer not to say'], half: 1 }),
        F('department', 'Department', 'text', { req: 1, suggest: 1, half: 1 }), F('designation', 'Designation', 'text', { req: 1, suggest: 1, half: 1 }), F('grade', 'Grade', 'text', { suggest: 1, half: 1 }), F('location', 'Location', 'text', { suggest: 1, half: 1 }),
        F('manager', 'Reporting manager', 'emp', { half: 1 }), F('type', 'Employment type', 'select', { o: ['Full-time', 'Part-time', 'Contract', 'Intern', 'Consultant'], req: 1, half: 1 }),
        F('doj', 'Date of joining', 'date', { req: 1, half: 1 }), F('probEnd', 'Probation end', 'date', { half: 1, help: 'Leave blank to set 6 months from joining' }), F('status', 'Status', 'select', { o: ['Probation', 'Active', 'Notice period', 'Exited'], req: 1 })],
        cols: ['id', 'name', 'department', 'designation', 'location', 'doj', 'status'], filter: 'department', kpi: ['Active', 'Probation', 'Notice period', 'Exited'], unique: ['email'],
        label: r => `${empName(r)} (${r.id})`, idf: () => nextId('emp', R.settings.empPrefix, 4),
        calc: undefined,
        after: undefined
      },
      profile: {
        title: 'Employee profiles', one: 'Profile', icon: 'user', app: 'people', desc: 'Personal, emergency and statutory details for each employee. Sensitive numbers are masked in lists and exports.',
        f: [F('emp', 'Employee', 'emp', { req: 1 }), F('pemail', 'Personal email', 'email', { half: 1 }), F('marital', 'Marital status', 'select', { o: ['Single', 'Married', 'Other'], half: 1 }), F('address', 'Current address', 'textarea'),
        F('ecName', 'Emergency contact name', 'text', { half: 1 }), F('ecPhone', 'Emergency contact phone', 'tel', { half: 1 }), F('blood', 'Blood group', 'select', { o: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'], half: 1 }), F('pan', 'PAN', 'text', { mask: 1, half: 1 }),
        F('aadhaar', 'Aadhaar (last 4 digits only)', 'text', { half: 1, ph: '1234' }), F('uan', 'UAN', 'text', { mask: 1, half: 1 }), F('bank', 'Bank name', 'text', { half: 1 }), F('acct', 'Account number', 'text', { mask: 1, half: 1 }), F('ifsc', 'IFSC', 'text', { half: 1 }), F('status', 'Verification', 'select', { o: ['Pending', 'Verified'], req: 1, half: 1 })],
        cols: ['emp', 'pemail', 'blood', 'pan', 'acct', 'status'], kpi: ['Pending', 'Verified'], unique: ['emp'],
        validate: undefined
      },
      probation: {
        title: 'Probation tracking', one: 'Probation record', icon: 'clock', app: 'people', desc: 'Every employee on probation, their end date and the outcome. Overdue when the end date passes without a decision.',
        f: [F('emp', 'Employee', 'emp', { req: 1 }), F('start', 'Probation start', 'date', { req: 1, half: 1 }), F('end', 'Probation end', 'date', { req: 1, half: 1 }), F('reviewer', 'Reviewer', 'emp', { half: 1 }), F('outcome', 'Outcome', 'select', { o: ['Confirm', 'Extend', 'Terminate'], half: 1 }), F('extTill', 'Extended till', 'date', { half: 1 }), F('status', 'Status', 'select', { o: ['Pending', 'In review', 'Confirmed', 'Extended'], req: 1, half: 1 }), F('remarks', 'Remarks', 'textarea')],
        cols: ['emp', 'start', 'end', 'reviewer', 'outcome', 'status'], due: 'end', closed: ['Confirmed'], kpi: ['Pending', 'In review', 'Confirmed', 'Overdue'],
        validate: undefined,
        calc: undefined,
        after: undefined
      },
      docs: {
        title: 'Employee documents', one: 'Document', icon: 'doc', app: 'people', desc: 'ID proofs, certificates and letters for each employee, with verification and expiry.',
        f: [F('emp', 'Employee', 'emp', { req: 1 }), F('dtype', 'Document type', 'select', { o: ['Aadhaar', 'PAN', 'Passport', 'Degree certificate', 'Experience letter', 'Relieving letter', 'Offer letter', 'Appointment letter', 'Address proof', 'Photograph', 'Other'], req: 1, half: 1 }), F('dno', 'Document number', 'text', { mask: 1, half: 1 }), F('file', 'File', 'file'), F('issued', 'Issue date', 'date', { half: 1 }), F('expiry', 'Expiry date', 'date', { half: 1 }), F('verifiedBy', 'Verified by', 'emp', { half: 1 }), F('status', 'Status', 'select', { o: ['Pending', 'Verified', 'Rejected', 'Expired'], req: 1, half: 1 })],
        cols: ['emp', 'dtype', 'dno', 'file', 'expiry', 'status'], filter: 'dtype', kpi: ['Pending', 'Verified', 'Rejected', 'Expired'],
        calc: undefined
      },
      exit: {
        title: 'Employee exit management', one: 'Exit', icon: 'logout', app: 'people', desc: 'Resignations and exits from notice to final settlement. Completing an exit marks the employee as Exited.',
        f: [F('emp', 'Employee', 'emp', { req: 1 }), F('etype', 'Exit type', 'select', { o: ['Resignation', 'Termination', 'Retirement', 'Contract end', 'Absconding'], req: 1, half: 1 }), F('resDate', 'Resignation date', 'date', { req: 1, half: 1 }), F('lwd', 'Last working day', 'date', { req: 1, half: 1 }), F('notice', 'Notice period (days)', 'number', { half: 1 }), F('reason', 'Reason', 'textarea'),
        F('handover', 'Handover to', 'emp', { half: 1 }), F('assets', 'Asset return', 'select', { o: ['Pending', 'Done', 'Not applicable'], half: 1 }), F('interview', 'Exit interview date', 'date', { half: 1 }), F('ff', 'F&F settlement', 'select', { o: ['Pending', 'Processed', 'Paid'], half: 1 }), F('status', 'Status', 'select', { o: ['Pending', 'Approved', 'In clearance', 'Completed'], req: 1 })],
        cols: ['emp', 'etype', 'resDate', 'lwd', 'assets', 'ff', 'status'], due: 'lwd', closed: ['Completed'], kpi: ['Pending', 'In clearance', 'Completed', 'Overdue'], filter: 'etype',
        validate: undefined,
        after: undefined
      },
      appraisal: {
        title: 'Appraisal tracker', one: 'Appraisal', icon: 'chart', app: 'people', desc: 'Where each employee is in the appraisal cycle. Overdue when the review due date passes.',
        f: [F('emp', 'Employee', 'emp', { req: 1 }), F('cycle', 'Appraisal cycle', 'text', { req: 1, suggest: 1, half: 1, ph: 'e.g. FY 2026-27 annual' }), F('appraiser', 'Appraiser', 'emp', { half: 1 }), F('due', 'Review due', 'date', { req: 1, half: 1 }), F('rating', 'Final rating (1–5)', 'select', { o: ['1', '2', '3', '4', '5'], half: 1 }), F('incPct', 'Recommended increment (%)', 'number', { half: 1 }), F('status', 'Status', 'select', { o: ['Pending', 'Self review done', 'Manager review done', 'Completed'], req: 1, half: 1 }), F('notes', 'Notes', 'textarea')],
        cols: ['emp', 'cycle', 'appraiser', 'due', 'rating', 'incPct', 'status'], due: 'due', closed: ['Completed'], filter: 'cycle', kpi: ['Pending', 'Manager review done', 'Completed', 'Overdue']
      },
      reviews: {
        title: 'Employee performance reviews', one: 'Review', icon: 'chart', app: 'people', desc: 'Written reviews with goals, strengths and areas to improve.',
        f: [F('emp', 'Employee', 'emp', { req: 1 }), F('reviewer', 'Reviewer', 'emp', { req: 1 }), F('from', 'Period from', 'date', { req: 1, half: 1 }), F('to', 'Period to', 'date', { req: 1, half: 1 }), F('goals', 'Goals achieved', 'textarea'), F('strengths', 'Strengths', 'textarea'), F('improve', 'Areas to improve', 'textarea'), F('rating', 'Rating (1–5)', 'select', { o: ['1', '2', '3', '4', '5'], half: 1 }), F('rdate', 'Review date', 'date', { half: 1 }), F('status', 'Status', 'select', { o: ['Draft', 'Submitted', 'Acknowledged'], req: 1 })],
        cols: ['emp', 'reviewer', 'from', 'to', 'rating', 'status'], kpi: ['Draft', 'Submitted', 'Acknowledged'], validate: undefined
      },
      probrev: {
        title: 'Probation reviews', one: 'Probation review', icon: 'check', app: 'people', desc: 'Assessment at the end of probation. A completed review with “Confirm” makes the employee Active and closes their probation record.',
        f: [F('emp', 'Employee', 'emp', { req: 1 }), F('reviewer', 'Reviewer', 'emp', { req: 1, half: 1 }), F('pEnd', 'Probation end', 'date', { req: 1, half: 1 }), F('perf', 'Performance', 'select', { o: ['Exceeds', 'Meets', 'Below'], half: 1 }), F('conduct', 'Conduct & attendance', 'select', { o: ['Good', 'Satisfactory', 'Needs improvement'], half: 1 }), F('rec', 'Recommendation', 'select', { o: ['Confirm', 'Extend', 'Terminate'], req: 1, half: 1 }), F('rdate', 'Review date', 'date', { half: 1 }), F('comments', 'Comments', 'textarea'), F('status', 'Status', 'select', { o: ['Pending', 'Completed'], req: 1 })],
        cols: ['emp', 'reviewer', 'pEnd', 'perf', 'rec', 'status'], due: 'pEnd', closed: ['Completed'], kpi: ['Pending', 'Completed', 'Overdue'],
        defaults: { status: 'Pending' },
        after: undefined
      },
      increments: {
        title: 'Increment history', one: 'Increment', icon: 'pay', app: 'people', desc: 'Every pay change for each employee. Approved salary revisions in Payroll are added here automatically.',
        f: [F('emp', 'Employee', 'emp', { req: 1 }), F('eff', 'Effective date', 'date', { req: 1, half: 1 }), F('itype', 'Type', 'select', { o: ['Annual increment', 'Promotion', 'Market correction', 'Probation confirmation', 'Other'], req: 1, half: 1 }), F('prev', 'Previous CTC (₹/year)', 'money', { req: 1, half: 1 }), F('next', 'New CTC (₹/year)', 'money', { req: 1, half: 1 }), F('pct', 'Increment %', 'number', { ro: 1, half: 1 }), F('approver', 'Approved by', 'emp', { half: 1 }), F('letter', 'Letter issued', 'yesno', { half: 1 }), F('status', 'Status', 'select', { o: ['Pending', 'Approved', 'Completed'], req: 1, half: 1 })],
        cols: ['emp', 'eff', 'itype', 'prev', 'next', 'pct', 'status'], kpi: ['Pending', 'Approved', 'Completed'], filter: 'itype',
        calc: undefined
      },
      recog: {
        title: 'Employee recognition', one: 'Recognition', icon: 'star', app: 'people', desc: 'Awards and spot recognition, from nomination to award.',
        f: [F('emp', 'Employee', 'emp', { req: 1 }), F('award', 'Award', 'select', { o: ['Star performer', 'Team player', 'Customer hero', 'Spot award', 'Innovation award', 'Long service'], req: 1, half: 1 }), F('by', 'Nominated by', 'emp', { half: 1 }), F('date', 'Date', 'date', { req: 1, half: 1 }), F('reward', 'Reward (₹)', 'money', { half: 1 }), F('citation', 'Citation', 'textarea'), F('status', 'Status', 'select', { o: ['Nominated', 'Approved', 'Awarded'], req: 1 })],
        cols: ['emp', 'award', 'by', 'date', 'reward', 'status'], filter: 'award', kpi: ['Nominated', 'Approved', 'Awarded']
      },
      assets2: {
        title: 'Laptop & asset management', one: 'Asset', icon: 'laptop', app: 'people', desc: 'Company laptops and equipment, who has them, and their condition.',
        f: [F('tag', 'Asset tag', 'text', { req: 1, half: 1 }), F('atype', 'Asset type', 'select', { o: ['Laptop', 'Desktop', 'Monitor', 'Mobile phone', 'Headset', 'Keyboard & mouse', 'Other'], req: 1, half: 1 }), F('model', 'Make & model', 'text', { req: 1, half: 1 }), F('serial', 'Serial number', 'text', { half: 1 }), F('purchase', 'Purchase date', 'date', { half: 1 }), F('warranty', 'Warranty till', 'date', { half: 1 }), F('emp', 'Assigned to', 'emp', { half: 1 }), F('assigned', 'Assigned on', 'date', { half: 1 }), F('condition', 'Condition', 'select', { o: ['New', 'Good', 'Fair', 'Damaged'], half: 1 }), F('status', 'Status', 'select', { o: ['In stock', 'Assigned', 'In repair', 'Returned', 'Retired'], req: 1, half: 1 })],
        cols: ['tag', 'atype', 'model', 'emp', 'warranty', 'status'], filter: 'atype', unique: ['tag'], kpi: ['In stock', 'Assigned', 'In repair', 'Retired'],
        validate: undefined
      },
      cards: {
        title: 'Access card tracker', one: 'Access card', icon: 'idcard', app: 'people', desc: 'Office access cards: who holds them, validity and returns.',
        f: [F('cardNo', 'Card number', 'text', { req: 1, half: 1 }), F('ctype', 'Card type', 'select', { o: ['Employee', 'Temporary', 'Visitor', 'Contractor'], req: 1, half: 1 }), F('emp', 'Issued to', 'emp', { half: 1 }), F('holder', 'Holder name (non-employee)', 'text', { half: 1 }), F('issued', 'Issued on', 'date', { req: 1, half: 1 }), F('valid', 'Valid till', 'date', { half: 1 }), F('zones', 'Access zones', 'text', { suggest: 1 }), F('returned', 'Returned on', 'date', { half: 1 }), F('status', 'Status', 'select', { o: ['Active', 'Lost', 'Returned', 'Deactivated'], req: 1, half: 1 })],
        cols: ['cardNo', 'ctype', 'emp', 'issued', 'valid', 'status'], due: 'valid', closed: ['Returned', 'Deactivated', 'Lost'], unique: ['cardNo'], filter: 'ctype', kpi: ['Active', 'Lost', 'Returned', 'Overdue'],
        validate: undefined
      },
      facilities: {
        title: 'Office facilities', one: 'Facility request', icon: 'building', app: 'people', desc: 'Maintenance and facility requests for the office, with owners and due dates.',
        f: [F('facility', 'Facility', 'select', { o: ['Meeting room', 'Housekeeping', 'Electrical', 'Air conditioning', 'Furniture', 'Internet & Wi-Fi', 'Pantry', 'Security', 'Other'], req: 1, half: 1 }), F('location', 'Location / floor', 'text', { suggest: 1, half: 1 }), F('raisedBy', 'Raised by', 'emp', { half: 1 }), F('priority', 'Priority', 'select', { o: ['Low', 'Normal', 'High', 'Urgent'], req: 1, half: 1 }), F('desc', 'Description', 'textarea', { req: 1 }), F('owner', 'Assigned to', 'text', { suggest: 1, half: 1 }), F('due', 'Due date', 'date', { req: 1, half: 1 }), F('status', 'Status', 'select', { o: ['Pending', 'In progress', 'Completed'], req: 1 })],
        cols: ['id', 'facility', 'location', 'priority', 'owner', 'due', 'status'], due: 'due', closed: ['Completed'], filter: 'facility', kpi: ['Pending', 'In progress', 'Completed', 'Overdue']
      },
      vendors: {
        title: 'Vendor management', one: 'Vendor', icon: 'briefcase', app: 'people', desc: 'Office and HR vendors with contracts and renewal dates.',
        f: [F('name', 'Vendor name', 'text', { req: 1, half: 1 }), F('cat', 'Category', 'select', { o: ['IT & hardware', 'Housekeeping', 'Security', 'Catering', 'Transport', 'Stationery', 'Recruitment agency', 'Insurance', 'Payroll / compliance', 'Other'], req: 1, half: 1 }), F('contact', 'Contact person', 'text', { half: 1 }), F('phone', 'Phone', 'tel', { half: 1 }), F('email', 'Email', 'email', { half: 1 }), F('gstin', 'GSTIN', 'text', { half: 1 }), F('pan', 'PAN', 'text', { half: 1 }), F('terms', 'Payment terms', 'select', { o: ['Advance', 'Net 15', 'Net 30', 'Net 45', 'Net 60'], half: 1 }), F('start', 'Contract start', 'date', { half: 1 }), F('end', 'Contract end', 'date', { half: 1 }), F('value', 'Monthly value (₹)', 'money', { half: 1 }), F('status', 'Status', 'select', { o: ['Pending approval', 'Active', 'Expired', 'Terminated'], req: 1, half: 1 })],
        cols: ['name', 'cat', 'contact', 'end', 'value', 'status'], due: 'end', closed: ['Expired', 'Terminated'], filter: 'cat', kpi: ['Active', 'Pending approval', 'Expired', 'Overdue'], label: r => `${r.name} (${r.id})`,
        validate: undefined
      },
      manpower: {
        title: 'Manpower requirements', one: 'Requirement', icon: 'briefcase', app: 'recruit', desc: 'Approved headcount to hire against. Candidates are tracked against these requirements.',
        f: [F('department', 'Department', 'text', { req: 1, suggest: 1, sugFrom: 'emp', half: 1 }), F('designation', 'Designation', 'text', { req: 1, suggest: 1, sugFrom: 'emp', half: 1 }), F('positions', 'Positions', 'number', { req: 1, half: 1 }), F('etype', 'Employment type', 'select', { o: ['Full-time', 'Contract', 'Intern', 'Part-time'], req: 1, half: 1 }), F('location', 'Location', 'text', { suggest: 1, sugFrom: 'emp', half: 1 }), F('exp', 'Experience (years)', 'text', { half: 1, ph: 'e.g. 3-5' }), F('budget', 'Budget CTC (₹/year)', 'text', { half: 1, ph: 'e.g. 12-15 lakh' }), F('reason', 'Reason', 'select', { o: ['New position', 'Replacement'], req: 1, half: 1 }), F('replacing', 'Replacing', 'emp', { half: 1 }), F('hm', 'Hiring manager', 'emp', { half: 1 }), F('by', 'Required by', 'date', { req: 1, half: 1 }), F('status', 'Status', 'select', { o: ['Pending', 'Approved', 'On hold', 'Closed'], req: 1, half: 1 }), F('jd', 'Job description', 'textarea')],
        cols: ['id', 'designation', 'department', 'positions', 'hm', 'by', 'status'], due: 'by', closed: ['Closed'], filter: 'department', kpi: ['Pending', 'Approved', 'On hold', 'Overdue'], label: r => `${r.designation} · ${r.department} (${r.id})`,
        validate: undefined
      },
      cands: {
        title: 'Candidate tracker', one: 'Candidate', icon: 'users', app: 'recruit', desc: 'Every applicant and their stage. “Convert to employee” creates their Employee ID and sets up onboarding.',
        f: [F('name', 'Full name', 'text', { req: 1, half: 1 }), F('email', 'Email', 'email', { req: 1, half: 1 }), F('phone', 'Phone', 'tel', { req: 1, half: 1 }), F('req', 'Applied for', 'ref', { ref: 'manpower', half: 1 }), F('source', 'Source', 'select', { o: ['Careers page', 'LinkedIn', 'Naukri', 'Referral', 'Agency', 'Campus', 'Walk-in', 'Other'], req: 1, half: 1 }), F('exp', 'Total experience (years)', 'number', { half: 1 }), F('cctc', 'Current CTC (₹/year)', 'money', { half: 1 }), F('ectc', 'Expected CTC (₹/year)', 'money', { half: 1 }), F('notice', 'Notice period (days)', 'number', { half: 1 }), F('loc', 'Current location', 'text', { half: 1 }), F('resume', 'Resume', 'file'), F('consent', 'Consent to store data', 'yesno', { req: 1, half: 1 }), F('stage', 'Stage', 'select', { o: ['Applied', 'Screening', 'Interview', 'Selected', 'Offered', 'Joined', 'Rejected', 'On hold'], req: 1, half: 1 }), F('empId', 'Employee ID', 'text', { ro: 1, noForm: 1 })],
        st: 'stage', cols: ['id', 'name', 'req', 'source', 'exp', 'ectc', 'stage'], filter: 'source', kpi: ['Applied', 'Interview', 'Offered', 'Joined'], unique: ['email'], label: r => `${r.name} (${r.id})`,
        validate: undefined,
        rowAct: r => ['Selected', 'Offered'].includes(r.stage) && !r.empId ? `<button class="btn sm primary" onclick="convertCand('${r.id}')">${ic('login', 14)}Convert to employee</button>` : r.empId ? `<span class="pill p-ok">${esc(r.empId)}</span>` : ''
      },
      interviews2: {
        title: 'Interview scheduling', one: 'Interview', icon: 'calendar', app: 'recruit', desc: 'Interview rounds with panel, time, feedback and result.',
        f: [F('cand', 'Candidate', 'ref', { ref: 'cands', req: 1 }), F('round', 'Round', 'select', { o: ['HR screening', 'Technical 1', 'Technical 2', 'Managerial', 'Final / founder'], req: 1, half: 1 }), F('mode', 'Mode', 'select', { o: ['In person', 'Video call', 'Phone'], req: 1, half: 1 }), F('date', 'Date', 'date', { req: 1, half: 1 }), F('time', 'Time', 'time', { req: 1, half: 1 }), F('panel', 'Interviewer', 'emp', { half: 1 }), F('venue', 'Venue or meeting link', 'text', { half: 1 }), F('rating', 'Rating (1–5)', 'select', { o: ['1', '2', '3', '4', '5'], half: 1 }), F('result', 'Result', 'select', { o: ['Pending', 'Selected', 'Rejected', 'On hold'], half: 1 }), F('feedback', 'Feedback', 'textarea'), F('status', 'Status', 'select', { o: ['Scheduled', 'Completed', 'Rescheduled', 'Cancelled'], req: 1 })],
        cols: ['cand', 'round', 'date', 'time', 'panel', 'result', 'status'], filter: 'round', kpi: ['Scheduled', 'Completed', 'Rescheduled', 'Cancelled'],
        after: undefined
      },
      offers2: {
        title: 'Offer letters', one: 'Offer', icon: 'send', app: 'recruit', desc: 'Offers from draft to acceptance. Overdue when the offer passes its valid-till date unanswered.',
        f: [F('cand', 'Candidate', 'ref', { ref: 'cands', req: 1 }), F('designation', 'Designation', 'text', { req: 1, suggest: 1, sugFrom: 'emp', half: 1 }), F('department', 'Department', 'text', { req: 1, suggest: 1, sugFrom: 'emp', half: 1 }), F('ctc', 'Annual CTC (₹)', 'money', { req: 1, half: 1 }), F('doj', 'Joining date', 'date', { req: 1, half: 1 }), F('odate', 'Offer date', 'date', { req: 1, half: 1 }), F('valid', 'Valid till', 'date', { req: 1, half: 1 }), F('approver', 'Approved by', 'emp', { half: 1 }), F('file', 'Offer letter file', 'file', { half: 1 }), F('status', 'Status', 'select', { o: ['Draft', 'Pending approval', 'Approved', 'Sent', 'Accepted', 'Declined'], req: 1 })],
        cols: ['id', 'cand', 'designation', 'ctc', 'doj', 'valid', 'status'], due: 'valid', closed: ['Accepted', 'Declined'], kpi: ['Pending approval', 'Sent', 'Accepted', 'Overdue'],
        validate: undefined,
        after: undefined
      },
      joining: {
        title: 'Joining formalities', one: 'Joining record', icon: 'login', app: 'recruit', desc: 'Day-one paperwork and setup for each new joiner. Created automatically when a candidate is converted.',
        f: [F('emp', 'Employee', 'emp', { req: 1 }), F('doj', 'Joining date', 'date', { req: 1, half: 1 }), F('docs', 'Documents collected', 'select', { o: ['Not started', 'Partial', 'All collected'], half: 1 }), F('idcard', 'ID card issued', 'yesno', { half: 1 }), F('mail', 'Work email created', 'yesno', { half: 1 }), F('laptop', 'Laptop issued', 'yesno', { half: 1 }), F('bankd', 'Bank details received', 'yesno', { half: 1 }), F('pf', 'PF / nomination form', 'yesno', { half: 1 }), F('appt', 'Appointment letter issued', 'yesno', { half: 1 }), F('status', 'Status', 'select', { o: ['Pending', 'In progress', 'Completed'], req: 1 }), F('notes', 'Notes', 'textarea')],
        cols: ['emp', 'doj', 'docs', 'idcard', 'mail', 'laptop', 'status'], due: 'doj', closed: ['Completed'], kpi: ['Pending', 'In progress', 'Completed', 'Overdue'],
        calc: undefined
      },
      onboard2: {
        title: 'Onboarding checklist', one: 'Onboarding task', icon: 'list', app: 'recruit', desc: 'Tasks to settle each new joiner in. Use “Add standard checklist” to create the usual 8 tasks in one step.',
        f: [F('emp', 'Employee', 'emp', { req: 1 }), F('task', 'Task', 'text', { req: 1, suggest: 1 }), F('owner', 'Owner', 'emp', { half: 1 }), F('due', 'Due date', 'date', { req: 1, half: 1 }), F('status', 'Status', 'select', { o: ['Pending', 'Completed'], req: 1, half: 1 }), F('done', 'Completed on', 'date', { half: 1 }), F('notes', 'Notes', 'textarea')],
        cols: ['emp', 'task', 'owner', 'due', 'status'], due: 'due', closed: ['Completed'], kpi: ['Pending', 'Completed', 'Overdue'],
        calc: undefined,
        head: () => btn('Add standard checklist', 'stdChecklist()', '', 'list')
      },
      interns: {
        title: 'Internship management', one: 'Intern', icon: 'learn', app: 'recruit', desc: 'Interns, mentors, projects and evaluations. “Convert to employee” moves a good intern into the employee register.',
        f: [F('name', 'Intern name', 'text', { req: 1, half: 1 }), F('email', 'Email', 'email', { req: 1, half: 1 }), F('phone', 'Phone', 'tel', { half: 1 }), F('college', 'College', 'text', { suggest: 1, half: 1 }), F('course', 'Course', 'text', { half: 1 }), F('department', 'Department', 'text', { suggest: 1, sugFrom: 'emp', half: 1 }), F('mentor', 'Mentor', 'emp', { half: 1 }), F('stipend', 'Monthly stipend (₹)', 'money', { half: 1 }), F('start', 'Start date', 'date', { req: 1, half: 1 }), F('end', 'End date', 'date', { req: 1, half: 1 }), F('project', 'Project', 'text'), F('eval', 'Evaluation', 'select', { o: ['Not evaluated', 'Excellent', 'Good', 'Average', 'Poor'], half: 1 }), F('status', 'Status', 'select', { o: ['Active', 'Extended', 'Completed', 'Converted', 'Discontinued'], req: 1, half: 1 }), F('empId', 'Employee ID', 'text', { ro: 1, noForm: 1 })],
        cols: ['name', 'college', 'department', 'mentor', 'start', 'end', 'status'], due: 'end', closed: ['Completed', 'Converted', 'Discontinued'], filter: 'department', kpi: ['Active', 'Completed', 'Converted', 'Overdue'], unique: ['email'],
        validate: undefined,
        rowAct: r => !r.empId && ['Active', 'Extended', 'Completed'].includes(r.status) ? `<button class="btn sm" onclick="convertIntern('${r.id}')">${ic('login', 14)}Convert</button>` : ''
      },
      att: {
        title: 'Daily attendance', one: 'Attendance entry', icon: 'clock', app: 'shift', desc: 'One entry per employee per day. Hours are worked out from in and out times.',
        f: [F('emp', 'Employee', 'emp', { req: 1 }), F('date', 'Date', 'date', { req: 1, half: 1 }), F('mark', 'Attendance', 'select', { o: ATT, req: 1, half: 1 }), F('in', 'In time', 'time', { half: 1 }), F('out', 'Out time', 'time', { half: 1 }), F('hours', 'Hours worked', 'text', { ro: 1, half: 1 }), F('status', 'Entry status', 'select', { o: ['Recorded', 'Pending', 'Regularised'], req: 1, half: 1 }), F('remarks', 'Remarks', 'textarea')],
        cols: ['emp', 'date', 'mark', 'in', 'out', 'hours', 'status'], filter: 'mark', kpi: ['Recorded', 'Pending', 'Regularised'],
        defaults: { date: () => tdy(), status: 'Recorded', mark: 'Present' },
        validate: undefined,
        calc: undefined
      },
      logs: {
        title: 'Login & logout tracking', one: 'Login record', icon: 'login', app: 'shift', desc: 'Clock-in and clock-out times. Use “Log in / out now” to stamp the current time for an employee.',
        f: [F('emp', 'Employee', 'emp', { req: 1 }), F('date', 'Date', 'date', { req: 1, half: 1 }), F('source', 'Source', 'select', { o: ['Web', 'Biometric', 'Mobile', 'Manual entry'], req: 1, half: 1 }), F('login', 'Login time', 'time', { req: 1, half: 1 }), F('logout', 'Logout time', 'time', { half: 1 }), F('hours', 'Total hours', 'text', { ro: 1, half: 1 }), F('place', 'Location / IP', 'text', { half: 1 })],
        st: null, stFn: r => r.logout ? 'Completed' : 'Pending', statuses: ['Pending', 'Completed'], cols: ['emp', 'date', 'login', 'logout', 'hours', 'source'], filter: 'source', kpi: ['Pending', 'Completed'],
        defaults: { date: () => tdy(), source: 'Manual entry' },
        validate: undefined,
        calc: undefined, head: () => btn('Log in / out now', 'quickLog()', '', 'clock')
      },
      leaves2: {
        title: 'Leave requests', one: 'Leave request', icon: 'leave', app: 'shift', desc: 'Leave applications and approvals. Approved days count against Leave Balance.',
        f: [F('emp', 'Employee', 'emp', { req: 1 }), F('ltype', 'Leave type', 'select', { o: LTYPES, req: 1, half: 1 }), F('half', 'Half day', 'yesno', { half: 1 }), F('from', 'From', 'date', { req: 1, half: 1 }), F('to', 'To', 'date', { req: 1, half: 1 }), F('days', 'Working days', 'number', { ro: 1, half: 1 }), F('approver', 'Approver', 'emp', { half: 1 }), F('reason', 'Reason', 'textarea'), F('status', 'Status', 'select', { o: ['Pending', 'Approved', 'Rejected', 'Cancelled'], req: 1 })],
        cols: ['emp', 'ltype', 'from', 'to', 'days', 'approver', 'status'], filter: 'ltype', kpi: ['Pending', 'Approved', 'Rejected', 'Cancelled'], defaults: { status: 'Pending', half: 'No' },
        validate: undefined,
        calc: undefined,
        warn: undefined
      },
      wfh: {
        title: 'Work from home tracker', one: 'WFH request', icon: 'home', app: 'shift', desc: 'WFH requests checked against your Leave Policy: 1 day a month, requested at least 15 days ahead.',
        f: [F('emp', 'Employee', 'emp', { req: 1 }), F('date', 'WFH date', 'date', { req: 1, half: 1 }), F('reqOn', 'Requested on', 'date', { req: 1, half: 1 }), F('reason', 'Reason', 'textarea'), F('approver', 'Approver', 'emp', { half: 1 }), F('status', 'Status', 'select', { o: ['Pending', 'Approved', 'Rejected'], req: 1, half: 1 }), F('notice', 'Notice (days)', 'number', { ro: 1, half: 1 }), F('flag', 'Policy check', 'text', { ro: 1, half: 1 })],
        cols: ['emp', 'date', 'reqOn', 'notice', 'flag', 'status'], kpi: ['Pending', 'Approved', 'Rejected'], defaults: { reqOn: () => tdy(), status: 'Pending' },
        calc: undefined
      },
      compoff: {
        title: 'Comp-off tracker', one: 'Comp-off', icon: 'swap', app: 'shift', desc: 'Compensatory days earned for working on a holiday or week off, and when they are used.',
        f: [F('emp', 'Employee', 'emp', { req: 1 }), F('worked', 'Worked on', 'date', { req: 1, half: 1 }), F('hours', 'Hours worked', 'number', { req: 1, half: 1 }), F('reason', 'Reason / project', 'textarea', { req: 1 }), F('approver', 'Approved by', 'emp', { half: 1 }), F('useBy', 'Use by', 'date', { req: 1, half: 1 }), F('availed', 'Availed on', 'date', { half: 1 }), F('status', 'Status', 'select', { o: ['Pending', 'Approved', 'Availed', 'Rejected', 'Expired'], req: 1, half: 1 })],
        cols: ['emp', 'worked', 'hours', 'useBy', 'availed', 'status'], due: 'useBy', closed: ['Availed', 'Rejected', 'Expired'], kpi: ['Pending', 'Approved', 'Availed', 'Overdue'], defaults: { status: 'Pending' },
        calc: undefined, validate: undefined
      },
      holidays2: {
        title: 'Holiday calendar', one: 'Holiday', icon: 'gift', app: 'shift', desc: 'Company holidays by location. The status updates itself as dates pass.',
        f: [F('date', 'Date', 'date', { req: 1, half: 1 }), F('day', 'Day', 'text', { ro: 1, half: 1 }), F('name', 'Holiday', 'text', { req: 1, half: 1 }), F('htype', 'Type', 'select', { o: ['National', 'Festival', 'Optional', 'Company'], req: 1, half: 1 }), F('loc', 'Applies to', 'text', { suggest: 1, ph: 'All locations' })],
        st: null, stFn: r => r.date >= tdy() ? 'Upcoming' : 'Past', statuses: ['Upcoming', 'Past'], cols: ['date', 'day', 'name', 'htype', 'loc'], filter: 'htype', kpi: ['Upcoming', 'Past'], sort: (a, b) => a.date.localeCompare(b.date), unique: ['date'],
        calc: undefined
      },
      payroll2: {
        title: 'Monthly payroll', one: 'Payroll entry', icon: 'pay', app: 'payroll', desc: 'One line per employee per month. Net pay is gross minus deductions.',
        f: [F('month', 'Month', 'month', { req: 1, half: 1 }), F('emp', 'Employee', 'emp', { req: 1, half: 1 }), F('wdays', 'Working days', 'number', { req: 1, half: 1 }), F('lop', 'LOP days', 'number', { half: 1 }), F('pdays', 'Paid days', 'number', { ro: 1, half: 1 }), F('gross', 'Gross pay (₹)', 'money', { req: 1, half: 1 }), F('ded', 'Total deductions (₹)', 'money', { req: 1, half: 1 }), F('net', 'Net pay (₹)', 'money', { ro: 1, half: 1 }), F('paidOn', 'Payment date', 'date', { half: 1 }), F('status', 'Status', 'select', { o: ['Draft', 'Processed', 'Approved', 'Paid'], req: 1, half: 1 })],
        cols: ['month', 'emp', 'pdays', 'gross', 'ded', 'net', 'status'], filter: 'month', kpi: ['Draft', 'Processed', 'Approved', 'Paid'], defaults: { status: 'Draft' },
        validate: undefined,
        calc: undefined
      },
      structure: {
        title: 'Salary structure', one: 'Salary structure', icon: 'list', app: 'payroll', desc: 'Monthly salary components for each employee. Monthly gross is the sum of earnings.',
        f: [F('emp', 'Employee', 'emp', { req: 1 }), F('eff', 'Effective from', 'date', { req: 1, half: 1 }), F('ctc', 'Annual CTC (₹)', 'money', { req: 1, half: 1 }), F('basic', 'Basic (₹/month)', 'money', { req: 1, half: 1 }), F('hra', 'HRA (₹/month)', 'money', { half: 1 }), F('special', 'Special allowance (₹/month)', 'money', { half: 1 }), F('other', 'Other allowances (₹/month)', 'money', { half: 1 }), F('pfEr', 'Employer PF (₹/month)', 'money', { half: 1 }), F('mgross', 'Monthly gross (₹)', 'money', { ro: 1, half: 1 }), F('status', 'Status', 'select', { o: ['Draft', 'Active', 'Superseded'], req: 1 })],
        cols: ['emp', 'eff', 'ctc', 'basic', 'mgross', 'status'], kpi: ['Draft', 'Active', 'Superseded'],
        calc: undefined,
        after: undefined
      },
      revisions: {
        title: 'Salary revision & appraisals', one: 'Salary revision', icon: 'chart', app: 'payroll', desc: 'Pay revisions from appraisals. Approving one adds it to the employee’s Increment History.',
        f: [F('emp', 'Employee', 'emp', { req: 1 }), F('cycle', 'Appraisal cycle', 'text', { suggest: 1, sugFrom: 'appraisal', half: 1 }), F('rating', 'Rating (1–5)', 'select', { o: ['1', '2', '3', '4', '5'], half: 1 }), F('cur', 'Current CTC (₹/year)', 'money', { req: 1, half: 1 }), F('rev', 'Revised CTC (₹/year)', 'money', { req: 1, half: 1 }), F('pct', 'Change %', 'number', { ro: 1, half: 1 }), F('eff', 'Effective date', 'date', { req: 1, half: 1 }), F('approver', 'Approved by', 'emp', { half: 1 }), F('status', 'Status', 'select', { o: ['Pending', 'Approved', 'Rejected', 'Completed'], req: 1, half: 1 }), F('incId', 'Increment record', 'text', { ro: 1, noForm: 1 })],
        cols: ['emp', 'cycle', 'cur', 'rev', 'pct', 'eff', 'status'], kpi: ['Pending', 'Approved', 'Rejected', 'Completed'], defaults: { status: 'Pending' },
        calc: undefined,
        after: undefined
      },
      payslips2: {
        title: 'Payslip records', one: 'Payslip', icon: 'download', app: 'payroll', desc: 'Issued payslips by month, with acknowledgement.',
        f: [F('emp', 'Employee', 'emp', { req: 1 }), F('month', 'Month', 'month', { req: 1, half: 1 }), F('issued', 'Issued on', 'date', { half: 1 }), F('gross', 'Gross (₹)', 'money', { req: 1, half: 1 }), F('ded', 'Deductions (₹)', 'money', { half: 1 }), F('net', 'Net pay (₹)', 'money', { ro: 1, half: 1 }), F('file', 'Payslip file', 'file', { half: 1 }), F('status', 'Status', 'select', { o: ['Generated', 'Sent', 'Acknowledged'], req: 1, half: 1 })],
        cols: ['emp', 'month', 'gross', 'net', 'issued', 'status'], filter: 'month', kpi: ['Generated', 'Sent', 'Acknowledged'],
        calc: undefined, head: () => btn('Create from payroll', 'slipsFromPayroll()', '', 'pay')
      },
      pfesi: {
        title: 'PF & ESI compliance', one: 'PF/ESI filing', icon: 'shield', app: 'payroll', desc: 'Monthly PF and ESI contributions and challans. Overdue after the due date.',
        f: [F('month', 'Wage month', 'month', { req: 1, half: 1 }), F('scheme', 'Scheme', 'select', { o: ['PF', 'ESI'], req: 1, half: 1 }), F('count', 'Employees covered', 'number', { half: 1 }), F('ee', 'Employee share (₹)', 'money', { half: 1 }), F('er', 'Employer share (₹)', 'money', { half: 1 }), F('total', 'Total (₹)', 'money', { ro: 1, half: 1 }), F('due', 'Due date', 'date', { req: 1, half: 1 }), F('challan', 'Challan / TRRN no.', 'text', { half: 1 }), F('paidOn', 'Paid on', 'date', { half: 1 }), F('status', 'Status', 'select', { o: ['Pending', 'Paid'], req: 1, half: 1 })],
        cols: ['month', 'scheme', 'count', 'total', 'due', 'paidOn', 'status'], due: 'due', closed: ['Paid'], filter: 'scheme', kpi: ['Pending', 'Paid', 'Overdue'],
        calc: undefined,
        validate: undefined
      },
      statutory: {
        title: 'Statutory compliance tracker', one: 'Compliance item', icon: 'shield', app: 'payroll', desc: 'All statutory filings and renewals with owners and due dates.',
        f: [F('item', 'Compliance', 'select', { o: ['Professional tax', 'TDS return (24Q)', 'Form 16', 'Labour welfare fund', 'Shops & establishment renewal', 'Gratuity', 'Bonus Act', 'Maternity benefit returns', 'POSH annual report', 'Other'], req: 1, half: 1 }), F('period', 'Period', 'text', { req: 1, half: 1, ph: 'e.g. Q2 FY 2026-27' }), F('authority', 'Authority / portal', 'text', { suggest: 1, half: 1 }), F('due', 'Due date', 'date', { req: 1, half: 1 }), F('owner', 'Responsible', 'emp', { half: 1 }), F('filed', 'Filed on', 'date', { half: 1 }), F('ack', 'Acknowledgement no.', 'text', { half: 1 }), F('status', 'Status', 'select', { o: ['Pending', 'Completed'], req: 1, half: 1 }), F('notes', 'Notes', 'textarea')],
        cols: ['item', 'period', 'due', 'owner', 'filed', 'status'], due: 'due', closed: ['Completed'], filter: 'item', kpi: ['Pending', 'Completed', 'Overdue'],
        calc: undefined
      },
      events: {
        title: 'Company events', one: 'Event', icon: 'gift', app: 'connect', desc: 'Celebrations, offsites and festivals, with budget and turnout.',
        f: [F('name', 'Event name', 'text', { req: 1 }), F('etype', 'Type', 'select', { o: ['Celebration', 'Festival', 'Offsite', 'Sports', 'CSR', 'Team outing', 'Other'], req: 1, half: 1 }), F('date', 'Date', 'date', { req: 1, half: 1 }), F('time', 'Time', 'time', { half: 1 }), F('venue', 'Venue', 'text', { half: 1 }), F('organiser', 'Organiser', 'emp', { half: 1 }), F('budget', 'Budget (₹)', 'money', { half: 1 }), F('att', 'Attendees', 'number', { half: 1 }), F('status', 'Status', 'select', { o: ['Planned', 'Confirmed', 'Completed', 'Cancelled'], req: 1, half: 1 }), F('notes', 'Notes', 'textarea')],
        cols: ['name', 'etype', 'date', 'venue', 'budget', 'status'], filter: 'etype', kpi: ['Planned', 'Confirmed', 'Completed', 'Cancelled'], sort: (a, b) => b.date.localeCompare(a.date)
      },
      feedback: {
        title: 'Employee feedback', one: 'Feedback', icon: 'chat', app: 'connect', desc: 'Suggestions and concerns from employees, with the action taken. Anonymous feedback hides the employee.',
        f: [F('anon', 'Anonymous', 'yesno', { req: 1, half: 1 }), F('emp', 'Employee', 'emp', { half: 1 }), F('cat', 'Category', 'select', { o: ['Workplace', 'Manager', 'Policy', 'Facilities', 'Pay & benefits', 'Culture', 'Other'], req: 1, half: 1 }), F('rating', 'Rating (1–5)', 'select', { o: ['1', '2', '3', '4', '5'], half: 1 }), F('text', 'Feedback', 'textarea', { req: 1 }), F('date', 'Submitted on', 'date', { half: 1 }), F('owner', 'Action owner', 'emp', { half: 1 }), F('action', 'Action taken', 'textarea'), F('status', 'Status', 'select', { o: ['Pending', 'In progress', 'Completed'], req: 1 })],
        cols: ['date', 'cat', 'emp', 'rating', 'owner', 'status'], filter: 'cat', kpi: ['Pending', 'In progress', 'Completed'], defaults: { anon: 'No', date: () => tdy(), status: 'Pending' },
        calc: undefined
      },
      townhall: {
        title: 'Town hall meetings', one: 'Town hall', icon: 'mega', app: 'connect', desc: 'Agenda, attendance, minutes and action items for each town hall.',
        f: [F('title', 'Title', 'text', { req: 1 }), F('date', 'Date', 'date', { req: 1, half: 1 }), F('time', 'Time', 'time', { half: 1 }), F('mode', 'Mode', 'select', { o: ['In person', 'Online', 'Hybrid'], half: 1 }), F('host', 'Host', 'emp', { half: 1 }), F('agenda', 'Agenda', 'textarea'), F('att', 'Attendance', 'number', { half: 1 }), F('status', 'Status', 'select', { o: ['Scheduled', 'Completed', 'Cancelled'], req: 1, half: 1 }), F('minutes', 'Minutes', 'textarea'), F('actions', 'Action items', 'textarea')],
        cols: ['title', 'date', 'time', 'host', 'att', 'status'], kpi: ['Scheduled', 'Completed', 'Cancelled'], sort: (a, b) => b.date.localeCompare(a.date)
      },
      training: {
        title: 'Training & development', one: 'Training programme', icon: 'learn', app: 'learn', desc: 'Training programmes with trainer, dates, participants and cost.',
        f: [F('prog', 'Programme', 'text', { req: 1 }), F('ttype', 'Type', 'select', { o: ['Technical', 'Soft skills', 'Leadership', 'Induction', 'Compliance', 'Other'], req: 1, half: 1 }), F('trainer', 'Trainer', 'text', { half: 1 }), F('mode', 'Mode', 'select', { o: ['Classroom', 'Online', 'Hybrid', 'Self-paced'], half: 1 }), F('start', 'Start date', 'date', { req: 1, half: 1 }), F('end', 'End date', 'date', { half: 1 }), F('parts', 'Participants', 'number', { half: 1 }), F('cost', 'Cost (₹)', 'money', { half: 1 }), F('status', 'Status', 'select', { o: ['Planned', 'Ongoing', 'Completed', 'Cancelled'], req: 1, half: 1 }), F('notes', 'Notes', 'textarea')],
        cols: ['prog', 'ttype', 'trainer', 'start', 'end', 'parts', 'status'], filter: 'ttype', kpi: ['Planned', 'Ongoing', 'Completed', 'Cancelled']
      },
      posh: {
        title: 'POSH training & committee', one: 'POSH record', icon: 'shield', app: 'learn', desc: 'Internal Committee members and POSH training sessions. Complaints are not recorded here.',
        f: [F('rtype', 'Record type', 'select', { o: ['Committee member', 'Training session'], req: 1, half: 1 }), F('emp', 'Employee', 'emp', { half: 1 }), F('name', 'Name or session title', 'text', { req: 1 }), F('role', 'Role', 'select', { o: ['Presiding officer', 'Member', 'External member', 'Trainer', 'Session'], half: 1 }), F('date', 'Appointed on / session date', 'date', { req: 1, half: 1 }), F('valid', 'Valid till', 'date', { half: 1 }), F('parts', 'Participants', 'number', { half: 1 }), F('status', 'Status', 'select', { o: ['Active', 'Scheduled', 'Completed'], req: 1, half: 1 })],
        cols: ['rtype', 'name', 'role', 'date', 'valid', 'status'], due: 'valid', closed: ['Completed'], filter: 'rtype', kpi: ['Active', 'Scheduled', 'Completed', 'Overdue']
      },
      sectrain: {
        title: 'Security & compliance training', one: 'Training assignment', icon: 'shield', app: 'learn', desc: 'Mandatory courses assigned to each employee, with due dates and scores.',
        f: [F('course', 'Course', 'select', { o: ['Information security awareness', 'Data privacy (DPDP Act)', 'POSH awareness', 'Code of conduct', 'Anti-bribery', 'Other'], req: 1, half: 1 }), F('emp', 'Employee', 'emp', { req: 1, half: 1 }), F('assigned', 'Assigned on', 'date', { req: 1, half: 1 }), F('due', 'Due date', 'date', { req: 1, half: 1 }), F('done', 'Completed on', 'date', { half: 1 }), F('score', 'Score (%)', 'number', { half: 1 }), F('status', 'Status', 'select', { o: ['Pending', 'In progress', 'Completed'], req: 1 })],
        cols: ['emp', 'course', 'assigned', 'due', 'done', 'score', 'status'], due: 'due', closed: ['Completed'], filter: 'course', kpi: ['Pending', 'In progress', 'Completed', 'Overdue'], defaults: { assigned: () => tdy(), status: 'Pending' },
        calc: undefined, head: () => btn('Assign to everyone', 'assignAll()', '', 'users')
      },
      handbook: {
        title: 'Employee handbook', one: 'Handbook version', icon: 'doc', app: 'sign', desc: 'Versions of the employee handbook. Publish a version, then send it for acknowledgement.',
        f: [F('ver', 'Version', 'text', { req: 1, half: 1, ph: 'e.g. 4.0' }), F('eff', 'Effective date', 'date', { req: 1, half: 1 }), F('title', 'Title', 'text', { req: 1 }), F('owner', 'Owner', 'emp', { half: 1 }), F('file', 'File', 'file', { half: 1 }), F('changes', 'Summary of changes', 'textarea'), F('status', 'Status', 'select', { o: ['Draft', 'Under review', 'Published', 'Archived'], req: 1 })],
        cols: ['ver', 'title', 'eff', 'owner', 'file', 'status'], kpi: ['Draft', 'Under review', 'Published'], label: r => `Handbook v${r.ver} (${r.id})`,
        after: undefined
      },
      policies: {
        title: 'HR policies', one: 'Policy', icon: 'doc', app: 'sign', desc: 'All HR policies with owners and review dates. Overdue when the review date passes.',
        f: [F('name', 'Policy name', 'text', { req: 1, half: 1 }), F('cat', 'Category', 'select', { o: ['Leave', 'Attendance & WFH', 'Travel & expense', 'IT & security', 'Code of conduct', 'POSH', 'Compensation', 'Other'], req: 1, half: 1 }), F('ver', 'Version', 'text', { req: 1, half: 1 }), F('eff', 'Effective date', 'date', { req: 1, half: 1 }), F('review', 'Next review due', 'date', { half: 1 }), F('owner', 'Owner', 'emp', { half: 1 }), F('file', 'Policy file', 'file', { half: 1 }), F('ackReq', 'Acknowledgement required', 'yesno', { req: 1, half: 1 }), F('status', 'Status', 'select', { o: ['Draft', 'Under review', 'Published'], req: 1, half: 1 })],
        cols: ['name', 'cat', 'ver', 'eff', 'review', 'ackReq', 'status'], due: 'review', filter: 'cat', kpi: ['Draft', 'Under review', 'Published', 'Overdue'], label: r => `${r.name} v${r.ver} (${r.id})`
      },
      acks: {
        title: 'Policy acknowledgements', one: 'Acknowledgement', icon: 'check', app: 'sign', desc: 'Who has acknowledged which policy. Use “Send to all employees” to create pending acknowledgements in one step.',
        f: [F('policy', 'Policy or handbook', 'select', { req: 1, opts: () => [...live('policies').map(p => [p.id, REG.policies.label(p)]), ...live('handbook').map(h => [h.id, REG.handbook.label(h)])] }), F('emp', 'Employee', 'emp', { req: 1 }), F('sent', 'Sent on', 'date', { req: 1, half: 1 }), F('due', 'Due', 'date', { req: 1, half: 1 }), F('ackOn', 'Acknowledged on', 'date', { half: 1 }), F('status', 'Status', 'select', { o: ['Pending', 'Acknowledged'], req: 1, half: 1 })],
        cols: ['policy', 'emp', 'sent', 'due', 'ackOn', 'status'], due: 'due', closed: ['Acknowledged'], kpi: ['Pending', 'Acknowledged', 'Overdue'], defaults: { sent: () => tdy(), status: 'Pending' },
        calc: undefined, head: () => btn('Send to all employees', 'sendAcks()', '', 'send'),
        validate: undefined
      },
      officeexp: {
        title: 'Office expenses', one: 'Office expense', icon: 'receipt', app: 'expense', desc: 'Company spend on rent, utilities, supplies and services, linked to vendors.',
        f: [F('date', 'Date', 'date', { req: 1, half: 1 }), F('cat', 'Category', 'select', { o: ['Rent', 'Electricity & utilities', 'Internet', 'Stationery', 'Pantry', 'Housekeeping', 'Repairs & maintenance', 'Travel', 'Events', 'Software', 'Other'], req: 1, half: 1 }), F('vendor', 'Vendor', 'ref', { ref: 'vendors', half: 1 }), F('inv', 'Invoice no.', 'text', { half: 1 }), F('desc', 'Description', 'textarea', { req: 1 }), F('amount', 'Amount before GST (₹)', 'money', { req: 1, half: 1 }), F('gst', 'GST (₹)', 'money', { half: 1 }), F('total', 'Total (₹)', 'money', { ro: 1, half: 1 }), F('mode', 'Payment mode', 'select', { o: ['Bank transfer', 'UPI', 'Card', 'Cash', 'Cheque'], half: 1 }), F('paidBy', 'Paid by', 'emp', { half: 1 }), F('approver', 'Approved by', 'emp', { half: 1 }), F('receipt', 'Bill / receipt', 'file', { half: 1 }), F('status', 'Status', 'select', { o: ['Pending', 'Approved', 'Paid', 'Rejected'], req: 1, half: 1 })],
        cols: ['date', 'cat', 'vendor', 'desc', 'total', 'status'], filter: 'cat', kpi: ['Pending', 'Approved', 'Paid', 'Rejected'], sort: (a, b) => b.date.localeCompare(a.date),
        calc: undefined
      }
    };
    Object.entries(REG).forEach(([k, d]) => { d.k = k; if (d.st === undefined) d.st = 'status'; d.statuses = d.statuses || (d.f.find(f => f.k === d.st)?.o || []); if (d.due && !d.statuses.includes('Overdue')) d.statuses = [...d.statuses, 'Overdue']; d.idp = d.idp || ({ emp: '', cands: 'CAN-', manpower: 'MR-', offers2: 'OF-', interviews2: 'INT-', interns: 'IN-', vendors: 'VN-', facilities: 'FR-', assets2: 'AS-', cards: 'AC-', policies: 'POL-', handbook: 'HB-', acks: 'ACK-', leaves2: 'LV-', wfh: 'WFH-', compoff: 'CO-', payroll2: 'PR-', payslips2: 'PS-', officeexp: 'OX-', feedback: 'FB-', events: 'EV-', townhall: 'TH-', training: 'TR-', revisions: 'SR-', increments: 'INC-' }[k] || k.toUpperCase().slice(0, 3) + '-'); d.label = d.label || (r => `${r.id}`) });
    const hrs = (a, b) => { const m = (+b.slice(0, 2) * 60 + +b.slice(3, 5)) - (+a.slice(0, 2) * 60 + +a.slice(3, 5)); return m >= 0 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m` : '' };
    function takenDays(empId, lt, year, exceptId) { return live('leaves2').filter(l => l.emp === empId && l.ltype === lt && l.status === 'Approved' && l.from.slice(0, 4) === year && l.id !== exceptId).reduce((a, l) => a + (+l.days || 0), 0) }
    function effSt(d, r) { const s = d.stFn ? d.stFn(r) : r[d.st]; if (d.due && r[d.due] && r[d.due] < tdy() && !(d.closed || []).includes(s)) return 'Overdue'; return s || '—' }
    function defaultsOf(d) { const o = {}; Object.entries(d.defaults || {}).forEach(([k, v]) => o[k] = typeof v === 'function' ? v() : v); return o }

    /* ---------- create a record programmatically (used by links) ---------- */
    function addRec(k, vals) { const d = REG[k]; const r = { ...vals }; r.id = d.idf ? d.idf(r) : nextId(k, d.idp); r._c = r._u = nowISO(); r._cb = USER ? USER.email : 'system'; d.calc && d.calc(r); r._h = [{ t: r._c, by: r._cb, s: d.st ? r[d.st] : 'Created' }]; recs(k).unshift(r); raudit(`Created ${d.one.toLowerCase()} ${r.id} (automatic)`); return r }

    /* ---------- value display ---------- */
    function show(d, f, v, r) {
      if (v === undefined || v === null || v === '') return '<span class="muted">—</span>';
      if (f.mask) return `<span style="font-variant-numeric:tabular-nums">${esc(mask(v))}</span>`;
      switch (f.t) {
        case 'emp': return empCell(v); case 'ref': { const x = recs(f.ref).find(y => y.id === v); return x ? esc(REG[f.ref].label(x)) : esc(v) }
        case 'date': return fd(v); case 'money': return inr(v); case 'month': { const [y, m] = v.split('-'); return new Date(+y, +m - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) }
        case 'file': return `<span class="filechip">${ic('doc', 13)}${esc(v)}</span>`; case 'textarea': return `<span style="white-space:normal">${esc(v)}</span>`
      }
      if (f.opts) { const o = f.opts().find(x => x[0] === v); return esc(o ? o[1] : v) }
      return esc(v)
    }
    function plain(d, f, v) { if (v === undefined || v === null) return ''; if (f.mask) return mask(v); if (f.t === 'emp') return empText(v); if (f.t === 'ref') { const x = recs(f.ref).find(y => y.id === v); return x ? REG[f.ref].label(x) : v } if (f.opts) { const o = f.opts().find(x => x[0] === v); return o ? o[1] : v } return String(v) }
    const fieldOf = (d, k) => k === 'id' ? { k: 'id', l: d.k === 'emp' ? 'Employee ID' : 'ID', t: 'id' } : k === 'name' && d.k === 'emp' ? { k: 'name', l: 'Name', t: 'name' } : d.f.find(f => f.k === k);
    function cellHTML(d, k, r) { if (k === 'id') return `<span class="muted" style="font-variant-numeric:tabular-nums">${esc(r.id)}</span>`; if (k === 'name' && d.k === 'emp') return `<div class="who">${av(empName(r) || '?')}<div><b>${esc(empName(r))}</b><span>${esc(r.email || '')}</span></div></div>`; const f = fieldOf(d, k); return show(d, f, r[k], r) }
    const searchText = (d, r) => [r.id, ...d.f.map(f => plain(d, f, r[f.k])), d.k === 'emp' ? empName(r) : ''].join(' ').toLowerCase();

    /* ---------- list view ---------- */
    function regFiltered(k) {
      const d = REG[k]; const arch = !!TAB['arch_' + k]; const sf = TAB['sf_' + k] || 'All', ff = TAB['ff_' + k] || 'All', q = (TAB['q_' + k] || '').trim().toLowerCase();
      let L = recs(k).filter(r => !!r._arch === arch && canSeeRec(k, r) && (!d.xf || d.xf(r)) && (sf === 'All' || effSt(d, r) === sf) && (ff === 'All' || String(r[d.filter] ?? '') === ff) && (!q || searchText(d, r).includes(q)));
      return d.sort ? L.sort(d.sort) : L
    }
    function regView(k, o = {}) {
      const d = REG[k]; if (d.acc && scopeOf(d.acc) === 'summary') return summaryView(k, o); const all = live(k).filter(r => canSeeRec(k, r) && (!d.xf || d.xf(r))); const L = regFiltered(k); const arch = !!TAB['arch_' + k]; const nArch = recs(k).filter(r => r._arch && canSeeRec(k, r) && (!d.xf || d.xf(r))).length;
      const sf = TAB['sf_' + k] || 'All', ff = TAB['ff_' + k] || 'All', q = TAB['q_' + k] || '';
      const fopts = d.filter ? [...new Set(all.map(r => r[d.filter]).filter(Boolean))].sort() : []; const ffield = d.filter && fieldOf(d, d.filter);
      const needsEmp = d.f.some(f => f.t === 'emp' && f.req) && !MEMP().length;
      const kpis = [stat(d.icon, 'Total records', all.length, nArch ? `${nArch} archived` : 'Live records'), ...(d.kpi || []).slice(0, 3).map(s => stat(s === 'Overdue' ? 'clock' : d.icon, s, all.filter(r => effSt(d, r) === s).length, s === 'Overdue' ? 'Past due date' : 'Records', s === 'Overdue' && all.some(r => effSt(d, r) === 'Overdue') ? 'down' : ''))].join('');
      const cols = d.cols.filter(c => c !== d.st).map(c => fieldOf(d, c)).filter(Boolean);
      return head(o.title || esc(d.title), o.desc || esc(d.desc), (d.head && canAddK(k) ? d.head() : '') + btn('Export CSV', `regCSV('${k}')`, '', 'download') + (canAddK(k) ? btn('Add ' + esc(d.one.toLowerCase()), `regForm('${k}')`, 'primary', 'plus') : '')) + (o.after || '') +
        (needsEmp ? `<div class="banner">${ic('users')}<span><b>No employees yet.</b> These records link to an Employee ID, so add your people in Employee master data first.</span><button class="btn sm" style="margin-left:auto" onclick="openRec('m_emp')">Open Employee master data</button></div>` : '') +
        `<div class="grid g4">${kpis}</div>
  <div class="card mt rv"><div class="toolbar rtools">
   <label class="search">${ic('search', 16)}<input class="input" type="search" placeholder="Search ${esc(d.title.toLowerCase())}" value="${esc(q)}" aria-label="Search" oninput="regSearch('${k}',this.value)"></label>
   ${d.statuses.length ? `<select class="input" aria-label="Filter by status" onchange="TAB['sf_${k}']=this.value;rerender()"><option value="All">All statuses</option>${d.statuses.map(s => `<option ${s === sf ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select>` : ''}
   ${d.filter && fopts.length ? `<select class="input" aria-label="Filter by ${esc(ffield.l)}" onchange="TAB['ff_${k}']=this.value;rerender()"><option value="All">All: ${esc(ffield.l.toLowerCase())}</option>${fopts.map(s => `<option value="${esc(s)}" ${String(s) === ff ? 'selected' : ''}>${esc(ffield.t === 'month' ? show(d, ffield, s) : s)}</option>`).join('')}</select>` : ''}
   <label class="check" style="margin-left:auto;padding:0"><input type="checkbox" ${arch ? 'checked' : ''} onchange="TAB['arch_${k}']=this.checked;rerender()"><span>Archived (${nArch})</span></label>
  </div>
  <div class="table-wrap"><table class="rtable"><thead><tr>${cols.map(c => `<th>${esc(c.l)}</th>`).join('')}${d.st !== undefined ? `<th>${d.stFn ? 'Status' : esc(fieldOf(d, d.st)?.l || 'Status')}</th>` : ''}<th class="ract">Actions</th></tr></thead>
  <tbody id="rb_${k}">${L.map(r => `<tr data-s="${esc(searchText(d, r))}">${cols.map(c => `<td>${cellHTML(d, c.k, r)}</td>`).join('')}${d.st !== undefined ? `<td>${pill(effSt(d, r))}</td>` : ''}<td class="ract"><div class="racts">${d.rowAct && !arch ? d.rowAct(r) : ''}<button class="btn sm ib" title="View" aria-label="View ${esc(r.id)}" onclick="regShow('${k}','${r.id}')">${ic('eye', 15)}</button>${!canEditRec(k, r) ? '' : arch ? `<button class="btn sm" onclick="regRestore('${k}','${r.id}')">${ic('restore', 14)}Restore</button>` : `<button class="btn sm ib" title="Edit" aria-label="Edit ${esc(r.id)}" onclick="regForm('${k}','${r.id}')">${ic('edit', 15)}</button><button class="btn sm ib bad" title="Delete" aria-label="Delete ${esc(r.id)}" onclick="regDel('${k}','${r.id}')">${ic('trash', 15)}</button>`}</div></td></tr>`).join('')}</tbody></table>
  ${L.length ? '' : `<div class="empty"><div class="empty-ic">${ic(d.icon, 24)}</div>${all.length || arch ? 'No records match these filters.' : `No ${esc(d.title.toLowerCase())} yet. Use <b>Add ${esc(d.one.toLowerCase())}</b> to create the first one.`}</div>`}</div>
  <div class="rfoot"><span id="rc_${k}">${L.length} of ${arch ? nArch : all.length} shown</span><span>Saved in this browser · ${R.saved ? 'last saved ' + fdt(R.saved) : 'nothing saved yet'}</span></div></div>`
    }
    function regSearch(k, v) { TAB['q_' + k] = v; const q = v.trim().toLowerCase(); let n = 0; const rows = document.querySelectorAll(`#rb_${k} tr`); rows.forEach(tr => { const m = !q || tr.dataset.s.includes(q); tr.hidden = !m; if (m) n++ }); const c = document.getElementById('rc_' + k); if (c) c.textContent = `${n} of ${rows.length} shown` }
    function openRec(v) { CURAPP = appOf(v); go(v) }

    /* ---------- form ---------- */
    function fOpts(f, k) { if (f.t === 'emp') return MEMP().filter(e => !(REG[k] && REG[k].acc && f.k === (REG[k].accEmp || 'emp')) || empVisible(REG[k].acc, e.id)).map(e => [e.id, `${empName(e)} (${e.id})${e.status === 'Exited' ? ' · exited' : ''}`]); if (f.t === 'ref') return live(f.ref).map(r => [r.id, REG[f.ref].label(r)]); if (f.opts) return f.opts(); if (f.t === 'select') return f.o.map(o => [o, o]); if (f.t === 'yesno') return [['Yes', 'Yes'], ['No', 'No']]; return null }
    function fInput(f, v, k) {
      const id = 'rf_' + f.k;
      if (f.ro) return `<input class="input" id="${id}" value="${esc(v ?? '')}" readonly tabindex="-1" placeholder="Worked out automatically" style="background:var(--surface-2)">`;
      const o = fOpts(f, k);
      if (o) return `<select class="input" id="${id}"><option value="">${o.length ? 'Select…' : (f.t === 'emp' ? 'No employees yet' : 'Nothing to choose yet')}</option>${o.map(([a, b]) => `<option value="${esc(a)}" ${String(a) === String(v ?? '') ? 'selected' : ''}>${esc(b)}</option>`).join('')}</select>`;
      if (f.t === 'textarea') return `<textarea class="input" id="${id}" rows="3" placeholder="${esc(f.ph || '')}">${esc(v ?? '')}</textarea>`;
      if (f.t === 'file') return `<input class="input" id="${id}" type="file">${v ? `<span class="muted" style="font-size:12.5px;font-weight:400">Current file: ${esc(v)}</span>` : ''}`;
      const type = { money: 'number', number: 'number', date: 'date', time: 'time', month: 'month', email: 'email', tel: 'tel' }[f.t] || 'text';
      const src = f.sugFrom || k; const dl = f.suggest ? [...new Set([...live(src), ...live(k)].map(r => r[f.k]).filter(Boolean))] : [];
      return `<input class="input" id="${id}" type="${type}" ${type === 'number' ? 'step="any" min="0" inputmode="decimal"' : ''} value="${esc(v ?? '')}" placeholder="${esc(f.ph || '')}" ${f.suggest ? `list="dl_${f.k}" autocomplete="off"` : ''}>${f.suggest ? `<datalist id="dl_${f.k}">${dl.map(x => `<option value="${esc(x)}">`).join('')}</datalist>` : ''}`
    }
    function regForm(k, id, prefill = {}, after) {
      const d = REG[k]; const r = id ? recs(k).find(x => x.id === id) : null;
      if (d.f.some(f => f.t === 'emp' && f.req) && !MEMP().length) { modal(`<h2>Add an employee first</h2><p class="sub">${esc(d.title)} link to an Employee ID, and the employee register is empty.</p><div class="mfoot"><button class="btn" onclick="closeAll()">Cancel</button><button class="btn primary" onclick="closeAll();openRec('m_emp');setTimeout(()=>regForm('emp'),60)">Add employee</button></div>`); return }
      const v = { ...(r ? {} : defaultsOf(d)), ...(r || {}), ...prefill }; const fs = d.f.filter(f => !f.noForm);
      const cell = f => `<label class="field"><span>${esc(f.l)}${f.req && !f.ro ? ' <span class="req" aria-hidden="true">*</span>' : ''}</span>${fInput(f, v[f.k], k)}${f.help ? `<span class="muted" style="font-size:12px;font-weight:400">${esc(f.help)}</span>` : ''}</label>`;
      let h = '', i = 0; while (i < fs.length) { if (fs[i].half && fs[i + 1]?.half) { h += `<div class="frow">${cell(fs[i])}${cell(fs[i + 1])}</div>`; i += 2 } else { h += cell(fs[i]); i++ } }
      modal(`<h2>${r ? 'Edit' : 'Add'} ${esc(d.one.toLowerCase())}</h2><p class="sub">${r ? `${esc(r.id)} · last updated ${fdt(r._u)}` : k === 'emp' ? `Employee ID ${esc(R.settings.empPrefix)}#### is issued when you save. Fields marked * are required.` : 'Fields marked * are required.'}</p>${h}<p id="ferr" role="alert" style="color:var(--bad);font-size:13.5px;margin:0 0 8px;min-height:1px"></p><div class="mfoot"><button class="btn" onclick="closeAll()">Cancel</button><button class="btn primary" id="rsave">${r ? 'Save changes' : 'Add ' + esc(d.one.toLowerCase())}</button></div>`);
      document.getElementById('modal').classList.add('wide');
      document.getElementById('rsave').onclick = () => regSubmit(k, r, after)
    }
    async function regSubmit(k,r,after){const vals={};for(const f of REG[k].f.filter(f=>!f.noForm&&!f.ro)){const el=document.getElementById('rf_'+f.k);if(!el)continue;let x=f.t==='file'?(el.files?.[0]?.name||r?.[f.k]||''):el.value.trim();if((f.t==='number'||f.t==='money')&&x!=='')x=Number(x);vals[f.k]=x}try{await bridge.flush();if(k==='emp'&&CONVERT_SOURCE)vals.__source=CONVERT_SOURCE;const {record,state,warning}=await bridge.register(k,vals,r?.id);CONVERT_SOURCE=null;hydrate(state);if(after)after(record);closeAll();rerender();toast(warning?'Saved '+record.id+'. Note: '+warning:(r?'Saved ':'Added ')+record.id)}catch(error){document.getElementById('ferr').textContent=error.message}}

    /* ---------- view / delete / restore ---------- */
    function linkedTo(empId) { const out = []; Object.entries(REG).forEach(([k, d]) => { if (k === 'emp') return; const ef = d.f.filter(f => f.t === 'emp').map(f => f.k); const n = live(k).filter(r => ef.some(x => r[x] === empId)).length; if (n) out.push([k, d.title, n]) }); return out }
    function regShow(k, id) {
      const d = REG[k]; const r = recs(k).find(x => x.id === id); if (!r) return;
      const kv = d.f.map(f => `<div><span>${esc(f.l)}</span><b>${show(d, f, r[f.k], r)}</b></div>`).join('');
      const links = k === 'emp' ? linkedTo(r.id) : [];
      drawer(`<div style="display:flex;gap:14px;align-items:center;margin-bottom:6px">${k === 'emp' ? av(empName(r), 'lg') : `<span class="av lg" style="background:color-mix(in srgb,var(--ac) 14%,transparent);color:var(--ac)">${ic(d.icon, 26)}</span>`}<div><h2 style="font-size:19px">${esc(k === 'emp' ? empName(r) : d.label(r))}</h2><div class="muted">${esc(d.one)} · ${esc(r.id)}</div></div></div>
   <div style="margin:10px 0 16px">${d.st !== undefined ? pill(effSt(d, r)) : ''}${r._arch ? ' ' + pill('Archived') : ''}</div>
   <div class="kv-grid">${kv}</div>
   ${links.length ? `<h3 style="font-size:14px;margin:22px 0 8px">Linked records</h3><div class="list">${links.map(([lk, t, n]) => `<div class="row"><div class="grow"><b>${esc(t)}</b></div><span class="muted">${n}</span><button class="btn sm" onclick="TAB['q_${lk}']='${esc(r.id)}';closeAll();openRec('m_${lk}')">Open</button></div>`).join('')}</div>` : ''}
   <h3 style="font-size:14px;margin:22px 0 8px">History</h3><div class="list">${(r._h || []).slice().reverse().map(h => `<div class="row"><div class="grow"><b>${esc(h.s || 'Updated')}</b><div class="sub">${fdt(h.t)} · ${esc(h.by)}</div></div></div>`).join('')}</div>
   <p class="muted" style="font-size:12.5px;margin-top:14px">Created ${fdt(r._c)} by ${esc(r._cb || '—')}. Last updated ${fdt(r._u)}.</p>
   <div class="mfoot" style="justify-content:flex-start;margin-top:16px">${r._arch ? btn('Restore', `regRestore('${k}','${r.id}')`, '', 'restore') : btn('Edit', `closeAll();regForm('${k}','${r.id}')`, 'primary', 'edit') + btn('Delete', `closeAll();regDel('${k}','${r.id}')`, 'bad', 'trash')}</div>`)
    }
    function regDel(k, id) {
      const d = REG[k]; const r = recs(k).find(x => x.id === id); const links = k === 'emp' ? linkedTo(id) : [];
      confirmBox(`Delete ${esc(r.id)}?`, `It moves to <b>Archived</b>, where you can restore it at any time. Nothing is erased.${links.length ? ` This employee has ${links.reduce((a, x) => a + x[2], 0)} linked records, which stay as they are.` : ''}`, 'Move to archive', async () => {try{await bridge.flush();const data=await request('/reg/'+k+'/'+encodeURIComponent(id),'DELETE');bridge.adopt(data.state);closeAll();rerender();toast(r.id+' archived')}catch(error){toast(error.message)}})
    }
    async function regRestore(k,id){try{await bridge.flush();const data=await request('/reg/'+k+'/'+encodeURIComponent(id)+'/restore','POST');bridge.adopt(data.state);closeAll();rerender();toast(id+' restored')}catch(error){toast(error.message)}}

    /* ---------- CSV ---------- */
    function csvDownload(name, rows) { const csv = rows.map(r => r.map(c => { const s = String(c ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }).join(',')).join('\r\n'); const b = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 500) }
    function regCSV(k) {
      const d = REG[k]; const L = regFiltered(k); if (!L.length) { toast('Nothing to export with these filters'); return }
      const fs = d.f; csvDownload(`${d.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${tdy()}.csv`, [[d.k === 'emp' ? 'Employee ID' : 'ID', ...fs.map(f => f.l), 'Status', 'Created', 'Last updated'], ...L.map(r => [r.id, ...fs.map(f => plain(d, f, r[f.k])), d.st !== undefined ? effSt(d, r) : '', r._c || '', r._u || ''])]); raudit(`Exported ${L.length} ${d.title.toLowerCase()} to CSV`); rsave(); toast(`Exported ${L.length} records`)
    }

    /* ---------- cross-module actions ---------- */
    function convertCand(id) {
      const c = recs('cands').find(x => x.id === id); const off = live('offers2').filter(o => o.cand === id).sort((a, b) => b.odate.localeCompare(a.odate))[0]; const req = live('manpower').find(m => m.id === c.req);
      if (off && off.status !== 'Accepted') { confirmBox('Offer not accepted yet', `The latest offer ${esc(off.id)} is “${esc(off.status)}”. Convert ${esc(c.name)} anyway?`, 'Continue', () => setTimeout(() => doConvert(c, off, req), 50), false); return } doConvert(c, off, req)
    }
    function doConvert(c,off,req){CONVERT_SOURCE={kind:'candidate',id:c.id};const[first,...rest]=c.name.split(' ');regForm('emp',null,{first,last:rest.join(' '),phone:c.phone,designation:off?.designation||req?.designation||'',department:off?.department||req?.department||'',location:req?.location||'',type:req?.etype==='Intern'?'Intern':'Full-time',doj:off?.doj||'',status:'Probation',manager:req?.hm||''})}
    function convertIntern(id){const n=recs('interns').find(x=>x.id===id);CONVERT_SOURCE={kind:'intern',id};const[first,...rest]=n.name.split(' ');regForm('emp',null,{first,last:rest.join(' '),phone:n.phone,department:n.department,manager:n.mentor,type:'Full-time',status:'Probation'})}
    const STDTASKS = [['Offer letter signed and filed', -3], ['ID, address and education documents verified', 0], ['Work email and system accounts created', 0], ['Laptop and accessories issued', 0], ['Access card issued', 1], ['Bank, PAN and PF details collected', 3], ['Induction and policy walkthrough', 3], ['30-day check-in with manager', 30]];
    function makeChecklist(e) { const base = e.doj || tdy(); let n = 0; STDTASKS.forEach(([t, o]) => { if (!live('onboard2').some(x => x.emp === e.id && x.task === t)) { addRec('onboard2', { emp: e.id, task: t, due: addDays(base, o), status: 'Pending' }); n++ } }); return n }
    function stdChecklist() {
      if (!MEMP().length) { regForm('onboard2'); return }
      modal(`<h2>Add standard checklist</h2><p class="sub">Creates up to 8 onboarding tasks, due relative to the joining date. Tasks the employee already has are skipped.</p><label class="field">Employee<select class="input" id="sc_emp">${MEMP().filter(e => e.status !== 'Exited').map(e => `<option value="${e.id}">${esc(empName(e))} (${e.id})</option>`).join('')}</select></label><div class="mfoot"><button class="btn" onclick="closeAll()">Cancel</button><button class="btn primary" onclick="const e=empById(document.getElementById('sc_emp').value);const n=makeChecklist(e);rsave();closeAll();rerender();toast(n?n+' tasks added for '+e.id:'Checklist already complete for '+e.id)">Add tasks</button></div>`)
    }
    function quickLog() {
      if (!MEMP().length) { regForm('logs'); return }
      modal(`<h2>Log in / out now</h2><p class="sub">Stamps the current time. If the employee is logged in today, this logs them out.</p><label class="field">Employee<select class="input" id="ql_emp">${MEMP().filter(e => e.status !== 'Exited').map(e => `<option value="${e.id}">${esc(empName(e))} (${e.id})</option>`).join('')}</select></label><div class="mfoot"><button class="btn" onclick="closeAll()">Cancel</button><button class="btn primary" onclick="doQuickLog(document.getElementById('ql_emp').value)">Stamp time</button></div>`)
    }
    function doQuickLog(eid) {
      const t = new Date().toTimeString().slice(0, 5); const open = live('logs').find(l => l.emp === eid && l.date === tdy() && !l.logout);
      if (open) { open.logout = t; REG.logs.calc(open); open._u = nowISO(); (open._h = open._h || []).push({ t: open._u, by: USER.email, s: 'Completed' }); toast(`${eid} logged out at ${t}`) } else { addRec('logs', { emp: eid, date: tdy(), login: t, source: 'Web' }); toast(`${eid} logged in at ${t}`) } rsave(); closeAll(); rerender()
    }
    function sendAcks() {
      const P = [...live('policies').filter(p => p.status === 'Published').map(p => [p.id, REG.policies.label(p)]), ...live('handbook').filter(h => h.status === 'Published').map(h => [h.id, REG.handbook.label(h)])];
      if (!P.length) { modal(`<h2>No published policies</h2><p class="sub">Publish a policy in HR policies or a handbook version first, then send it for acknowledgement.</p><div class="mfoot"><button class="btn primary" onclick="closeAll();openRec('m_policies')">Open HR policies</button></div>`); return }
      if (!MEMP().length) { regForm('acks'); return }
      modal(`<h2>Send to all employees</h2><p class="sub">Creates a pending acknowledgement for every active employee who doesn’t already have one for this policy.</p><label class="field">Policy<select class="input" id="sa_p">${P.map(([a, b]) => `<option value="${a}">${esc(b)}</option>`).join('')}</select></label><label class="field">Due date<input class="input" type="date" id="sa_d" value="${addDays(tdy(), 14)}"></label><div class="mfoot"><button class="btn" onclick="closeAll()">Cancel</button><button class="btn primary" onclick="doSendAcks()">Send</button></div>`)
    }
    function doSendAcks() { const p = document.getElementById('sa_p').value, due = document.getElementById('sa_d').value; if (!due) { toast('Pick a due date'); return } let n = 0; MEMP().filter(e => e.status !== 'Exited').forEach(e => { if (!live('acks').some(a => a.policy === p && a.emp === e.id)) { addRec('acks', { policy: p, emp: e.id, sent: tdy(), due, status: 'Pending' }); n++ } }); rsave(); closeAll(); rerender(); toast(n ? `Sent to ${n} employees` : 'Everyone already has this policy') }
    function assignAll() {
      if (!MEMP().length) { regForm('sectrain'); return }
      modal(`<h2>Assign to everyone</h2><p class="sub">Assigns a course to every active employee who doesn’t already have it.</p><label class="field">Course<select class="input" id="aa_c">${REG.sectrain.f[0].o.map(o => `<option>${esc(o)}</option>`).join('')}</select></label><label class="field">Due date<input class="input" type="date" id="aa_d" value="${addDays(tdy(), 30)}"></label><div class="mfoot"><button class="btn" onclick="closeAll()">Cancel</button><button class="btn primary" onclick="doAssignAll()">Assign</button></div>`)
    }
    function doAssignAll() { const c = document.getElementById('aa_c').value, due = document.getElementById('aa_d').value; if (!due) { toast('Pick a due date'); return } let n = 0; MEMP().filter(e => e.status !== 'Exited').forEach(e => { if (!live('sectrain').some(a => a.course === c && a.emp === e.id)) { addRec('sectrain', { course: c, emp: e.id, assigned: tdy(), due, status: 'Pending' }); n++ } }); rsave(); closeAll(); rerender(); toast(n ? `Assigned to ${n} employees` : 'Everyone already has this course') }
    function slipsFromPayroll() {
      const L = live('payroll2').filter(p => ['Approved', 'Paid'].includes(p.status) && !live('payslips2').some(s => s.emp === p.emp && s.month === p.month));
      if (!L.length) { toast('No approved payroll lines without a payslip'); return } L.forEach(p => addRec('payslips2', { emp: p.emp, month: p.month, gross: p.gross, ded: p.ded, issued: tdy(), status: 'Generated' })); rsave(); rerender(); toast(`${L.length} payslips created from Monthly payroll`)
    }

    /* ---------- computed views ---------- */
    function compShell(title, desc, acts, kpis, cols, rows, emptyMsg, key) {
      const q = TAB['q_' + key] || '';
      return head(esc(title), esc(desc), acts) + (kpis ? `<div class="grid g4">${kpis}</div>` : '') + `<div class="card mt rv"><div class="toolbar rtools"><label class="search">${ic('search', 16)}<input class="input" type="search" placeholder="Search" value="${esc(q)}" aria-label="Search" oninput="regSearch('${key}',this.value)"></label></div><div class="table-wrap"><table class="rtable"><thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody id="rb_${key}">${rows.map(r => `<tr data-s="${esc(r.s)}" ${q && !r.s.includes(q.toLowerCase()) ? 'hidden' : ''}>${r.c.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>${rows.length ? '' : `<div class="empty"><div class="empty-ic">${ic('users', 24)}</div>${emptyMsg}</div>`}</div><div class="rfoot"><span id="rc_${key}">${rows.length} rows</span><span>Worked out from your live records</span></div></div>`
    }
    const emptyEmp = 'No employees yet. Add people in <b>Employee master data</b> and this fills in automatically.';
    V.m_joiners = () => {
      const t = tdy(); const L = MEMP().filter(e => e.doj && dayDiff(e.doj, t) <= 90 && dayDiff(t, e.doj) <= 60).sort((a, b) => b.doj.localeCompare(a.doj));
      const prog = e => { const T = live('onboard2').filter(x => x.emp === e.id); return T.length ? [T.filter(x => x.status === 'Completed').length, T.length] : null };
      const rows = L.map(e => { const p = prog(e), j = live('joining').find(x => x.emp === e.id); const d = dayDiff(e.doj, t); return { s: searchText(REG.emp, e), c: [empCell(e.id), esc(e.department || ''), fd(e.doj), d < 0 ? `<span class="pill p-info">Joins in ${-d} day${d === -1 ? '' : 's'}</span>` : `${d} day${d === 1 ? '' : 's'} ago`, p ? `<div style="min-width:120px">${bar(p[0] / p[1] * 100)}<span class="muted" style="font-size:12px">${p[0]} of ${p[1]} tasks</span></div>` : `<button class="btn sm" onclick="makeChecklist(empById('${e.id}'));rsave();rerender()">Create checklist</button>`, j ? pill(effSt(REG.joining, j)) : '<span class="muted">—</span>', fd(e.probEnd), `<button class="btn sm ib" title="View" aria-label="View ${e.id}" onclick="regShow('emp','${e.id}')">${ic('eye', 15)}</button>`] } });
      return compShell('New joiners', 'Employees who joined in the last 90 days or are joining in the next 60, with onboarding progress.', btn('Add employee', "regForm('emp')", 'primary', 'plus'), [stat('users', 'Joining soon', L.filter(e => e.doj > t).length, 'Next 60 days'), stat('login', 'Joined in 30 days', L.filter(e => e.doj <= t && dayDiff(e.doj, t) <= 30).length, 'Recent joiners'), stat('list', 'Onboarding open', live('onboard2').filter(x => x.status !== 'Completed' && L.some(e => e.id === x.emp)).length, 'Tasks still pending'), stat('clock', 'Overdue tasks', live('onboard2').filter(x => effSt(REG.onboard2, x) === 'Overdue' && L.some(e => e.id === x.emp)).length, 'Past due date', live('onboard2').some(x => effSt(REG.onboard2, x) === 'Overdue') ? 'down' : '')].join(''), ['Employee', 'Department', 'Joining date', 'Since joining', 'Onboarding', 'Joining formalities', 'Probation end', ''], rows, emptyEmp, 'joiners')
    };
    V.m_balance = () => {
      const yr = TAB.balYr || String(new Date().getFullYear()); const Q = R.settings.quotas; const types = LTYPES.filter(t => Q[t] > 0);
      const rows = MEMP().filter(e => e.status !== 'Exited').map(e => {
        const co = live('compoff').filter(c => c.emp === e.id && c.status === 'Approved').length; const coTaken = takenDays(e.id, 'Comp-off', yr); const lop = takenDays(e.id, 'Loss of pay', yr);
        return { s: searchText(REG.emp, e), c: [empCell(e.id), ...types.map(t => { const u = takenDays(e.id, t, yr), b = Q[t] - u; return `<b style="color:${b < 0 ? 'var(--bad)' : 'inherit'}">${b}</b> <span class="muted">of ${Q[t]} · ${u} taken</span>` }), `${co} earned · ${coTaken} taken`, String(lop)] }
      });
      const ys = [...new Set([String(new Date().getFullYear()), ...live('leaves2').map(l => l.from.slice(0, 4))])].sort().reverse();
      return compShell('Leave balance', `Balance = yearly quota minus approved leave in ${yr}. Quotas come from your leave policy and can be edited.`, `<select class="input" aria-label="Year" onchange="TAB.balYr=this.value;rerender()">${ys.map(y => `<option ${y === yr ? 'selected' : ''}>${y}</option>`).join('')}</select>` + btn('Edit quotas', 'editQuotas()', '', 'edit') + btn('Export CSV', "balCSV()", '', 'download'), '', ['Employee', ...types.map(t => esc(t)), 'Comp-off', 'Loss of pay (days)'], rows, emptyEmp, 'balance')
    };
    function editQuotas() {
      const Q = R.settings.quotas; const T = LTYPES.filter(t => !['Comp-off', 'Loss of pay'].includes(t));
      modal(`<h2>Leave quotas per year</h2><p class="sub">Days each employee gets per calendar year. Set 0 to hide a type. Casual leave is 12 (1 per month) in your Leave Policy.</p>${T.map(t => `<label class="field">${esc(t)}<input class="input" type="number" min="0" step="0.5" id="q_${t.replace(/\W/g, '')}" value="${Q[t] || 0}"></label>`).join('')}<div class="mfoot"><button class="btn" onclick="closeAll()">Cancel</button><button class="btn primary" onclick="saveQuotas()">Save quotas</button></div>`)
    }
    function saveQuotas() { LTYPES.forEach(t => { const el = document.getElementById('q_' + t.replace(/\W/g, '')); if (el) R.settings.quotas[t] = Math.max(0, +el.value || 0) }); raudit('Updated leave quotas'); rsave(); closeAll(); rerender(); toast('Leave quotas saved') }
    function balCSV() {
      const yr = TAB.balYr || String(new Date().getFullYear()); const Q = R.settings.quotas; const types = LTYPES.filter(t => Q[t] > 0); const E = MEMP().filter(e => e.status !== 'Exited'); if (!E.length) { toast('Nothing to export'); return }
      csvDownload(`leave-balance-${yr}.csv`, [['Employee ID', 'Name', ...types.flatMap(t => [t + ' quota', t + ' taken', t + ' balance']), 'Comp-off earned', 'Comp-off taken', 'LOP days'], ...E.map(e => [e.id, empName(e), ...types.flatMap(t => { const u = takenDays(e.id, t, yr); return [Q[t], u, Q[t] - u] }), live('compoff').filter(c => c.emp === e.id && c.status === 'Approved').length, takenDays(e.id, 'Comp-off', yr), takenDays(e.id, 'Loss of pay', yr)])])
    }
    V.m_celebrate = () => {
      const t = tdy(), y = new Date().getFullYear(); const L = [];
      MEMP().filter(e => e.status !== 'Exited').forEach(e => {
        const nxt = md => { let d = `${y}-${md}`; if (d < t) d = `${y + 1}-${md}`; return d };
        if (e.dob) { const d = nxt(e.dob.slice(5)); L.push({ e, k: 'Birthday', d, n: dayDiff(t, d), yrs: +d.slice(0, 4) - +e.dob.slice(0, 4) }) }
        if (e.doj && e.doj < t) { const d = nxt(e.doj.slice(5)); const yrs = +d.slice(0, 4) - +e.doj.slice(0, 4); if (yrs > 0) L.push({ e, k: 'Work anniversary', d, n: dayDiff(t, d), yrs }) }
      });
      const S2 = L.filter(x => x.n <= 60).sort((a, b) => a.n - b.n);
      const rows = S2.map(x => ({ s: searchText(REG.emp, x.e) + ' ' + x.k.toLowerCase(), c: [empCell(x.e.id), `<span class="ptag" style="--c:${x.k === 'Birthday' ? '#7C5CFF' : '#12A58E'}">${ic(x.k === 'Birthday' ? 'gift' : 'star', 13)}${x.k}</span>`, fd(x.d), x.n === 0 ? '<span class="pill p-ok">Today</span>' : `In ${x.n} day${x.n === 1 ? '' : 's'}`, x.k === 'Birthday' ? (x.e.dob ? `Turns ${x.yrs}` : '') : `${x.yrs} year${x.yrs > 1 ? 's' : ''}`, esc(x.e.department || '')] }));
      return compShell('Birthday & work anniversary tracker', 'Upcoming birthdays and work anniversaries in the next 60 days, from Employee master data.', '', [stat('gift', 'Today', S2.filter(x => x.n === 0).length, 'Celebrations today'), stat('calendar', 'Next 7 days', S2.filter(x => x.n <= 7).length, 'Coming up this week'), stat('gift', 'Birthdays', S2.filter(x => x.k === 'Birthday').length, 'Next 60 days'), stat('star', 'Anniversaries', S2.filter(x => x.k !== 'Birthday').length, 'Next 60 days')].join(''), ['Employee', 'Occasion', 'Date', 'When', 'Milestone', 'Department'], rows, MEMP().length ? 'No birthdays or anniversaries in the next 60 days. Add dates of birth in Employee master data to track birthdays.' : emptyEmp, 'celebrate')
    };
    V.m_completion = () => {
      const A = live('sectrain'); const rows = MEMP().filter(e => e.status !== 'Exited').map(e => {
        const m = A.filter(a => a.emp === e.id), c = m.filter(a => a.status === 'Completed').length, o = m.filter(a => effSt(REG.sectrain, a) === 'Overdue').length, p = m.length ? Math.round(c / m.length * 100) : 0;
        return { s: searchText(REG.emp, e), c: [empCell(e.id), esc(e.department || ''), m.length, c, m.length - c - o, o ? `<b style="color:var(--bad)">${o}</b>` : '0', m.length ? `<div style="min-width:120px">${bar(p)}<span class="muted" style="font-size:12px">${p}%</span></div>` : '<span class="muted">Nothing assigned</span>', m.length ? pill(o ? 'Overdue' : c === m.length ? 'Completed' : 'Pending') : ''] }
      });
      const tot = A.length, done = A.filter(a => a.status === 'Completed').length;
      return compShell('Training completion tracker', 'Completion of security and compliance training for each employee.', btn('Assign course', 'assignAll()', 'primary', 'plus'), [stat('shield', 'Overall completion', tot ? Math.round(done / tot * 100) + '%' : '—', `${done} of ${tot} assignments`), stat('check', 'Completed', done, 'Assignments'), stat('clock', 'Pending', A.filter(a => a.status !== 'Completed' && effSt(REG.sectrain, a) !== 'Overdue').length, 'Not yet due'), stat('clock', 'Overdue', A.filter(a => effSt(REG.sectrain, a) === 'Overdue').length, 'Past due date', A.some(a => effSt(REG.sectrain, a) === 'Overdue') ? 'down' : '')].join(''), ['Employee', 'Department', 'Assigned', 'Completed', 'Pending', 'Overdue', 'Progress', 'Status'], rows, emptyEmp, 'completion')
    };

    /* ---------- data & backup ---------- */
    V.m_backup = () => {
      const size = new Blob([JSON.stringify(R)]).size; const rows = Object.entries(REG).map(([k, d]) => [d.title, APP(d.app)[1], live(k).length, recs(k).length - live(k).length]).filter(x => x[2] || x[3]);
      return head('Data & backup', 'Your live HR records, how they are stored, and backup files you can keep.', btn('Import backup', "document.getElementById('bk_in').click()", '', 'upload') + btn('Download backup', 'backupJSON()', 'primary', 'download')) +
        `<input type="file" id="bk_in" accept="application/json,.json" hidden onchange="importJSON(this.files[0]);this.value=''">
  <div class="grid g4">${stat('shield', 'Live records', Object.keys(REG).reduce((a, k) => a + live(k).length, 0), 'Across all modules')}${stat('trash', 'Archived', Object.keys(REG).reduce((a, k) => a + recs(k).length - live(k).length, 0), 'Restorable')}${stat('download', 'Storage used', (size / 1024).toFixed(1) + ' KB', 'Of about 5,000 KB in this browser')}${stat('clock', 'Last saved', R.saved ? new Date(R.saved).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : '—', R.saved ? fd(R.saved.slice(0, 10)) : 'Nothing saved yet')}</div>
  <div class="banner mt" style="background:var(--info-bg);border-color:color-mix(in srgb,var(--brand) 25%,transparent)">${ic('shield')}<span>Records are saved in <b>this browser on this device</b>, separately from the demo data, and survive a refresh. Download a backup regularly. Clearing browser data, or using another device, starts empty. Moving to the secure server database in the spec makes this shared and backed up automatically.</span></div>
  <div class="grid g2 mt">${card('Records by submenu', rows.length ? tbl([['Submenu', r => `<b>${esc(r[0])}</b>`], ['App', r => r[1]], ['Live', r => r[2]], ['Archived', r => r[3]]], rows) : '<div class="empty">No live records yet.</div>')}
  ${card('Activity log', R.audit.length ? `<div class="list">${R.audit.slice(0, 12).map(a => `<div class="row"><div class="grow"><b style="font-weight:500;white-space:normal">${esc(a.a)}</b><div class="sub">${fdt(a.t)} · ${esc(a.by)}</div></div></div>`).join('')}</div>` : '<div class="empty">No activity yet.</div>', R.audit.length ? `<button class="link" onclick="auditCSV()">Export log</button>` : '')}</div>
  <div class="mt">${card('Employee ID format', `<div class="kv-grid"><div><span>Prefix</span><b>${esc(R.settings.empPrefix)}</b></div><div><span>Next ID</span><b>${esc(R.settings.empPrefix + String((R.seq.emp || 0) + 1).padStart(4, '0'))}</b></div></div>`, MEMP().length ? '' : `<button class="link" onclick="editPrefix()">Change prefix</button>`)}</div>`
    };
    async function backupJSON(){try{await bridge.flush();const data=await request('/backup');downloadJSON(data,'people-plus-backup-'+tdy()+'.json');toast('Backup downloaded')}catch(error){toast(error.message)}}
    async function importJSON(file){if(!file)return;let x;try{x=JSON.parse(await file.text())}catch{toast('That file isn’t a valid backup');return}if(!x||!x.data){toast('That file isn’t a People Plus backup');return}try{await bridge.flush();const data=await request('/backup/import','POST',x);bridge.adopt(data.state);rerender();toast(data.added+' records added, '+data.skipped+' skipped (already here). Nothing was overwritten.')}catch(error){toast(error.message)}}
    function auditCSV() { csvDownload(`activity-log-${tdy()}.csv`, [['When', 'By', 'Action'], ...R.audit.map(a => [a.t, a.by, a.a])]) }
    function editPrefix() { form('Employee ID prefix', 'Used for new Employee IDs, followed by 4 digits. It can only be changed before the first employee is added.', [{ k: 'p', l: 'Prefix', v: R.settings.empPrefix, req: true }], 'Save', v => { if (!/^[A-Z0-9-]{1,6}$/i.test(v.p)) return 'Use up to 6 letters, numbers or hyphens.'; R.settings.empPrefix = v.p.toUpperCase(); rsave() }) }

    /* ---------- register views + navigation ---------- */
    Object.keys(REG).forEach(k => { if (!V['m_' + k]) V['m_' + k] = () => regView(k) });
    (function () {
      const A = NAV.admin; const ins = (app, groups, at = 1) => A[app].splice(at, 0, ...groups); const it = (k, l) => ['m_' + k, l || REG[k]?.title.replace(/^./, c => c.toUpperCase()), REG[k]?.icon || 'list'];
      ins('recruit', [['Recruitment & onboarding', [it('manpower', 'Manpower requirements'), it('cands', 'Candidate tracker'), it('interviews2', 'Interview scheduling'), it('offers2', 'Offer letters'), it('joining', 'Joining formalities'), it('onboard2', 'Onboarding checklist'), it('interns', 'Internship management')]]]);
      ins('shift', [['Attendance & leave', [it('att', 'Daily attendance'), it('logs', 'Login & logout'), it('leaves2', 'Leave requests'), ['m_balance', 'Leave balance', 'leave'], it('wfh', 'Work from home'), it('compoff', 'Comp-off tracker'), it('holidays2', 'Holiday calendar')]]]);
      ins('payroll', [['Payroll & compliance', [it('payroll2', 'Monthly payroll'), it('structure', 'Salary structure'), it('revisions', 'Salary revision & appraisals'), it('payslips2', 'Payslip records'), it('pfesi', 'PF & ESI compliance'), it('statutory', 'Statutory compliance')]]]);
      ins('expense', [['Office expenses', [it('officeexp', 'Office expenses')]]]);
      ins('sign', [['HR policies & compliance', [it('handbook', 'Employee handbook'), it('policies', 'HR policies'), it('acks', 'Policy acknowledgements')]]]);
      ins('connect', [['Employee engagement', [['m_celebrate', 'Birthdays & anniversaries', 'gift'], it('events', 'Company events'), it('feedback', 'Employee feedback'), it('townhall', 'Town hall meetings')]]]);
      ins('learn', [['Training & development', [it('training', 'Training & development')]], ['Compliance training', [it('posh', 'POSH training & committee'), it('sectrain', 'Security & compliance training'), ['m_completion', 'Training completion', 'check']]]]);
      const admG = A.plus.find(g => g[0].includes('Administration')); if (admG && !admG[1].some(x => x[0] === 'm_backup')) admG[1].push(['m_backup', 'Data & backup', 'download']);
    })();
    let NAVC = {}; try { NAVC = JSON.parse(localStorage.getItem('bc-pp-navc') || '{}') || {} } catch (e) { }
    function navGroupHead(g, items, gi) {
      const id = CURAPP + '|' + g, has = items.some(x => x[0] === current), total = NAV[S.role][CURAPP].reduce((a, x) => a + x[1].length, 0);
      const open = has ? true : NAVC[id] !== undefined ? !NAVC[id] : (g.includes('Overview') || g.includes('Master') || g.includes('Strategic') || g.includes('Me') || total <= 14);
      return `<button class="navgroup ngbtn" aria-expanded="${open}" onclick="toggleNG(this,${gi})"><span>${esc(g)}</span>${ic('chev', 13)}</button><div class="ngitems"${open ? '' : ' hidden'}>`
    }
    function toggleNG(b, gi) { const g = NAV[S.role][CURAPP][gi][0], id = CURAPP + '|' + g, open = b.getAttribute('aria-expanded') === 'true'; NAVC[id] = open; try { localStorage.setItem('bc-pp-navc', JSON.stringify(NAVC)) } catch (e) { } b.setAttribute('aria-expanded', String(!open)); b.nextElementSibling.hidden = open }

    /* =========================================================
       PEOPLE PLUS · ADVANCED HR (spec section 9A)
       Access control, 6 submenus, rules engine. Reads Employee
       master data by Employee ID; never copies employee fields.
       ========================================================= */
    R.settings.acc = R.settings.acc || {}; R.settings.answered = R.settings.answered || {};
    R.settings.adv = Object.assign({ ratingHigh: 4, ratingLow: 2, eligMonths: 12, eligRating: 4, ffDays: 30, minGroup: 5 }, R.settings.adv || {});
    let VIEWAS = null;
    const ROLES = ['HR Admin', 'HR Executive', 'Manager', 'Finance', 'Leadership', 'Employee'];
    const ACC = {
      perf: { 'HR Admin': 'all', 'HR Executive': 'all', Manager: 'team', Finance: 'none', Leadership: 'summary', Employee: 'own' },
      pip: { 'HR Admin': 'all', 'HR Executive': 'assigned', Manager: 'teamx', Finance: 'none', Leadership: 'none', Employee: 'ownshared' },
      promo: { 'HR Admin': 'all', 'HR Executive': 'view', Manager: 'teamx', Finance: 'view', Leadership: 'summary', Employee: 'none' },
      succ: { 'HR Admin': 'all', 'HR Executive': 'none', Manager: 'none', Finance: 'none', Leadership: 'view', Employee: 'none' },
      idp: { 'HR Admin': 'all', 'HR Executive': 'all', Manager: 'team', Finance: 'none', Leadership: 'none', Employee: 'own' },
      wfa: { 'HR Admin': 'all', 'HR Executive': 'all', Manager: 'team', Finance: 'pay', Leadership: 'all', Employee: 'none' },
      pay: { 'HR Admin': 'all', 'HR Executive': 'none', Manager: 'none', Finance: 'all', Leadership: 'none', Employee: 'none' },
      eng: { 'HR Admin': 'all', 'HR Executive': 'all', Manager: 'team', Finance: 'respond', Leadership: 'all', Employee: 'respond' },
      risk: { 'HR Admin': 'all', 'HR Executive': 'none', Manager: 'none', Finance: 'none', Leadership: 'all', Employee: 'none' },
      comp: { 'HR Admin': 'all', 'HR Executive': 'all', Manager: 'none', Finance: 'statutory', Leadership: 'scores', Employee: 'none' },
      act: { 'HR Admin': 'all', 'HR Executive': 'all', Manager: 'team', Finance: 'own', Leadership: 'own', Employee: 'own' }
    };
    const realRole = () => { if (!USER) return 'Employee'; const a = R.settings.acc[USER.email]; return a && a.role ? a.role : (USER.role === 'HR Admin' ? 'HR Admin' : 'Employee') };
    const curRole = () => VIEWAS && realRole() === 'HR Admin' ? VIEWAS : realRole();
    const myEmp = () => USER && R.settings.acc[USER.email]?.emp || '';
    const scopeOf = a => ACC[a]?.[curRole()] || 'none';
    const canHR = () => ['HR Admin', 'HR Executive'].includes(curRole());
    function teamOf(id) { if (!id) return new Set(); const out = new Set(); let f = [id]; while (f.length) { const n = []; MEMP().forEach(e => { if (f.includes(e.manager) && !out.has(e.id) && e.id !== id) { out.add(e.id); n.push(e.id) } }); f = n } return out }
    function empVisible(area, id) { const s = scopeOf(area), me = myEmp(); if (['all', 'view', 'pay', 'statutory', 'scores', 'assigned'].includes(s)) return true; if (s === 'team') return id === me || teamOf(me).has(id); if (s === 'teamx') return id !== me && teamOf(me).has(id); if (s === 'own' || s === 'ownshared' || s === 'respond') return !!me && id === me; return false }
    const visEmps = area => MEMP().filter(e => empVisible(area, e.id));
    function canSeeRec(k, r) {
      const d = REG[k]; if (!d.acc) return true; const s = scopeOf(d.acc), me = myEmp();
      if (s === 'none' || s === 'summary') return false;
      if (k === 'pips') { if (s === 'assigned') return r.hrp === me; if (s === 'ownshared') return r.emp === me && r.shared === 'Yes' }
      if (k === 'promos' && s === 'teamx') return (r.emp !== me && teamOf(me).has(r.emp)) || (r.nomBy === me && r.emp !== me);
      if (k === 'actions') { if (s === 'all') return true; const own = r.owner === me || r._cb === USER.email; if (s === 'own') return own; if (s === 'team') return own || teamOf(me).has(r.owner) || teamOf(me).has(r.emp); return false }
      return empVisible(d.acc, r[d.accEmp || 'emp'])
    }
    function canAddK(k) { const d = REG[k]; if (!d.acc) return true; const s = scopeOf(d.acc); if (['none', 'summary', 'view', 'pay', 'respond', 'scores', 'statutory'].includes(s)) return false; if (k === 'pips' && s === 'ownshared') return false; if (k === 'succession') return curRole() === 'HR Admin'; return true }
    const canEditRec = (k, r) => canAddK(k) && canSeeRec(k, r);
    function logConf(k, r) { if (['pips', 'promos', 'succession'].includes(k)) { raudit(`Viewed confidential ${REG[k].one.toLowerCase()} ${r.id}${r.emp ? ' (' + r.emp + ')' : ''}`); rsave() } }
    const confNote = t => `<div class="banner conf">${ic('shield')}<span><b>Confidential.</b> ${t} Every time someone opens one of these records, it is recorded in the activity log.</span></div>`;
    function latestAppr(id) { return live('appraisal').filter(a => a.emp === id).sort((a, b) => (b.due || '').localeCompare(a.due || ''))[0] }
    function ratingOf(id){return COMPUTED.ratings?.[id]??null}
    const curGradeSince = id => { const p = live('promos').filter(x => x.emp === id && x.status === 'Effected').sort((a, b) => b.eff.localeCompare(a.eff))[0]; return p ? p.eff : empById(id)?.doj };
    const onPip = id => live('pips').some(p => p.emp === id && p.status === 'Active');
    function eligibility(id){return COMPUTED.eligibility?.[id]||{ok:false,why:['Not in master data']}}
    const tabsBar = (key, list) => { const cur = list.includes(TAB[key]) ? TAB[key] : list[0]; return [cur, `<div class="tabs subtabs" role="tablist">${list.map(t => `<button role="tab" class="${t === cur ? 'on' : ''}" onclick="TAB['${key}']='${t}';rerender()">${t}</button>`).join('')}</div>`] };
    function pageShell(H, acts, kpis, extra, cols, rows, empty, key) {
      const q = TAB['q_' + key] || '';
      return head(H.title, H.desc, acts) + (H.after || '') + (kpis ? `<div class="grid g4">${kpis}</div>` : '') + (extra || '') + (cols ? `<div class="card mt rv"><div class="toolbar rtools"><label class="search">${ic('search', 16)}<input class="input" type="search" placeholder="Search" value="${esc(q)}" aria-label="Search" oninput="regSearch('${key}',this.value)"></label>${H.tools || ''}</div><div class="table-wrap"><table class="rtable"><thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody id="rb_${key}">${rows.map(r => `<tr data-s="${esc(r.s)}" ${q && !r.s.includes(q.toLowerCase()) ? 'hidden' : ''}>${r.c.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>${rows.length ? '' : `<div class="empty"><div class="empty-ic">${ic('users', 24)}</div>${empty}</div>`}</div><div class="rfoot"><span id="rc_${key}">${rows.length} rows</span><span>Worked out from Employee master data and linked records</span></div></div>` : '')
    }
    const noLink = () => myEmp() || canHR() ? '' : `<div class="banner">${ic('users')}<span><b>Your login isn’t linked to an Employee ID yet.</b> Ask HR Admin to link it in People Plus › Access control so your own and your team’s records appear.</span></div>`;
    const hbars = (rows, fmt = v => v) => { const mx = Math.max(1, ...rows.map(r => r[1])); return rows.length ? `<div class="dept-bars wide">${rows.map(([n, v]) => `<div class="r"><span title="${esc(n)}">${esc(n)}</span>${bar(v / mx * 100)}<em>${esc(fmt(v))}</em></div>`).join('')}</div>` : '<div class="empty" style="padding:24px">No data yet.</div>' };
    const groupCount = (list, fn) => { const m = {}; list.forEach(x => { const k = fn(x) || 'Not set'; m[k] = (m[k] || 0) + 1 }); return Object.entries(m).sort((a, b) => b[1] - a[1]) };

    /* ---------- new record types ---------- */
    Object.assign(PILL, { 'At risk': 'warn', Achieved: 'ok', Missed: 'bad', Dropped: 'mute', 'Manager endorsed': 'info', 'HR reviewed': 'info', Effected: 'ok', Covered: 'ok', 'Partly covered': 'warn', 'Not covered': 'bad', Snoozed: 'mute', 'Renewal due': 'warn', Eligible: 'ok', 'Not yet': 'mute', Low: 'ok', Medium: 'warn', High: 'bad', Done: 'ok', Draft: 'mute', Open: 'warn', Closed: 'mute' });
    REG.appraisal.f.splice(REG.appraisal.f.length - 1, 0, F('released', 'Rating released to employee', 'yesno', { half: 1 }));
    const REG2 = {
      goals: {
        title: 'Goals & KRAs', one: 'Goal', icon: 'chart', app: 'plus', acc: 'perf', desc: 'Goals for each employee and cycle. Weights for one cycle should add up to 100%.',
        f: [F('emp', 'Employee', 'emp', { req: 1 }), F('cycle', 'Cycle', 'text', { req: 1, suggest: 1, sugFrom: 'appraisal', half: 1, ph: 'e.g. FY 2026-27' }), F('kra', 'KRA area', 'select', { o: ['Delivery', 'Quality', 'Customer', 'People', 'Learning', 'Other'], req: 1, half: 1 }), F('title', 'Goal', 'text', { req: 1 }), F('measure', 'Measure / target', 'text'), F('weight', 'Weight %', 'number', { req: 1, half: 1 }), F('due', 'Due date', 'date', { req: 1, half: 1 }), F('progress', 'Progress %', 'number', { half: 1 }), F('status', 'Status', 'select', { o: ['Draft', 'Pending approval', 'Active', 'At risk', 'Achieved', 'Missed', 'Dropped'], req: 1, half: 1 }), F('ec', 'Employee comment', 'textarea'), F('mc', 'Manager comment', 'textarea')],
        cols: ['emp', 'cycle', 'title', 'weight', 'progress', 'due'], due: 'due', closed: ['Achieved', 'Missed', 'Dropped'], filter: 'cycle', kpi: ['Active', 'At risk', 'Achieved'], defaults: { status: 'Draft', progress: 0 },
        validate: undefined,
        warn: undefined,
        calc: undefined
      },
      checkins: {
        title: 'Check-ins', one: 'Check-in', icon: 'chat', app: 'plus', acc: 'perf', desc: 'Regular one-to-one conversations between employees and managers.',
        f: [F('emp', 'Employee', 'emp', { req: 1 }), F('mgr', 'Manager', 'emp', { half: 1, help: 'Filled from master data if left blank' }), F('date', 'Date', 'date', { req: 1, half: 1 }), F('well', 'What went well', 'textarea'), F('block', 'Blockers', 'textarea'), F('acts', 'Agreed actions', 'textarea'), F('next', 'Next check-in', 'date', { half: 1 }), F('status', 'Status', 'select', { o: ['Scheduled', 'Completed', 'Missed'], req: 1, half: 1 })],
        cols: ['emp', 'mgr', 'date', 'next'], due: 'date', closed: ['Completed', 'Missed'], kpi: ['Scheduled', 'Completed', 'Missed'], defaults: { date: () => tdy(), status: 'Scheduled' }, sort: (a, b) => b.date.localeCompare(a.date),
        calc: undefined,
        after: undefined
      },
      pips: {
        title: 'Improvement plans', one: 'Improvement plan', icon: 'shield', app: 'plus', acc: 'pip', desc: 'Performance improvement plans. Confidential: visible only to HR Admin, the assigned HR partner, the manager, and the employee once shared.',
        f: [F('emp', 'Employee', 'emp', { req: 1 }), F('mgr', 'Manager', 'emp', { half: 1 }), F('hrp', 'HR partner', 'emp', { half: 1 }), F('start', 'Start', 'date', { req: 1, half: 1 }), F('end', 'End', 'date', { req: 1, half: 1 }), F('reason', 'Reason', 'textarea', { req: 1 }), F('targets', 'Improvement targets', 'textarea', { req: 1 }), F('support', 'Support offered', 'textarea'), F('reviews', 'Review dates and notes', 'textarea'), F('outcome', 'Outcome', 'select', { o: ['Successful', 'Extended', 'Exit'], half: 1 }), F('shared', 'Shared with employee', 'yesno', { half: 1 }), F('status', 'Status', 'select', { o: ['Draft', 'Active', 'Completed', 'Closed'], req: 1 })],
        cols: ['emp', 'mgr', 'start', 'end', 'outcome'], due: 'end', closed: ['Completed', 'Closed'], kpi: ['Draft', 'Active', 'Completed'], defaults: { status: 'Draft', shared: 'No' },
        calc: undefined, validate: undefined
      },
      promos: {
        title: 'Promotion nominations', one: 'Nomination', icon: 'chart', app: 'plus', acc: 'promo', desc: 'Promotions from nomination to effect. Current designation, grade and pay are read from master data and Salary structure.',
        f: [F('emp', 'Employee', 'emp', { req: 1 }), F('curDes', 'Current designation', 'text', { ro: 1, half: 1 }), F('curGrade', 'Current grade', 'text', { ro: 1, half: 1 }), F('curCtc', 'Current CTC (₹/year)', 'money', { ro: 1, half: 1 }), F('rating', 'Latest rating', 'text', { ro: 1, half: 1 }), F('propDes', 'Proposed designation', 'text', { req: 1, suggest: 1, sugFrom: 'emp', half: 1 }), F('propGrade', 'Proposed grade', 'text', { suggest: 1, sugFrom: 'emp', half: 1 }), F('propCtc', 'Proposed CTC (₹/year)', 'money', { half: 1 }), F('pct', 'Change %', 'number', { ro: 1, half: 1 }), F('elig', 'Eligibility', 'text', { ro: 1 }), F('just', 'Justification', 'textarea', { req: 1 }), F('override', 'Override reason (if not eligible)', 'textarea'), F('nomBy', 'Nominated by', 'emp', { half: 1 }), F('eff', 'Effective date', 'date', { req: 1, half: 1 }), F('status', 'Stage', 'select', { o: ['Nominated', 'Manager endorsed', 'HR reviewed', 'Approved', 'Rejected', 'Effected'], req: 1 })],
        cols: ['emp', 'curDes', 'propDes', 'pct', 'rating', 'eff'], kpi: ['Nominated', 'HR reviewed', 'Approved', 'Effected'], filter: 'status', defaults: { status: 'Nominated', nomBy: () => myEmp() },
        calc: undefined,
        validate: undefined,
        after: undefined
      },
      idps: {
        title: 'Career plans', one: 'Career plan', icon: 'learn', app: 'plus', acc: 'idp', desc: 'Individual development plans: target role, skills to build and progress.',
        f: [F('emp', 'Employee', 'emp', { req: 1 }), F('target', 'Target role', 'text', { req: 1, suggest: 1, sugFrom: 'emp', half: 1 }), F('time', 'Timeframe', 'select', { o: ['6 months', '1 year', '2 years', '3+ years'], half: 1 }), F('skills', 'Skills to build', 'textarea'), F('courses', 'Linked courses / training', 'text'), F('mentor', 'Mentor', 'emp', { half: 1 }), F('review', 'Next review', 'date', { half: 1 }), F('progress', 'Progress %', 'number', { half: 1 }), F('status', 'Status', 'select', { o: ['Draft', 'Active', 'Achieved', 'On hold'], req: 1, half: 1 })],
        cols: ['emp', 'target', 'time', 'mentor', 'progress', 'review'], due: 'review', closed: ['Achieved', 'On hold'], kpi: ['Active', 'Achieved', 'Overdue'], defaults: { status: 'Draft', progress: 0 }
      },
      succession: {
        title: 'Succession planning', one: 'Succession plan', icon: 'users', app: 'plus', acc: 'succ', accEmp: 'inc', desc: 'Successors for critical roles and how ready they are. Restricted to HR Admin and Leadership.',
        f: [F('role', 'Critical role', 'text', { req: 1, suggest: 1, sugFrom: 'emp' }), F('inc', 'Incumbent', 'emp', { req: 1, half: 1 }), F('risk', 'Risk of losing incumbent', 'select', { o: ['Low', 'Medium', 'High'], req: 1, half: 1 }), F('s1', 'Successor 1', 'emp', { half: 1 }), F('r1', 'Readiness 1', 'select', { o: ['Ready now', '1–2 years', '3+ years'], half: 1 }), F('s2', 'Successor 2', 'emp', { half: 1 }), F('r2', 'Readiness 2', 'select', { o: ['Ready now', '1–2 years', '3+ years'], half: 1 }), F('s3', 'Successor 3', 'emp', { half: 1 }), F('r3', 'Readiness 3', 'select', { o: ['Ready now', '1–2 years', '3+ years'], half: 1 }), F('notes', 'Notes', 'textarea')],
        st: null, stFn: r => [r.r1, r.r2, r.r3].includes('Ready now') ? 'Covered' : (r.s1 || r.s2 || r.s3) ? 'Partly covered' : 'Not covered', statuses: ['Covered', 'Partly covered', 'Not covered'], cols: ['role', 'inc', 'risk', 's1', 'r1'], kpi: ['Covered', 'Partly covered', 'Not covered'], label: r => `${r.role} (${r.id})`,
        validate: undefined
      },
      surveys: {
        title: 'Pulse surveys', one: 'Pulse survey', icon: 'chat', app: 'plus', desc: 'Short anonymous surveys. Every survey asks the eNPS question (0–10) plus your statements rated 1–5.',
        f: [F('title', 'Title', 'text', { req: 1 }), F('period', 'Period', 'text', { half: 1, ph: 'e.g. Oct 2026' }), F('aud', 'Audience', 'select', { req: 1, half: 1, opts: () => [['All employees', 'All employees'], ...[...new Set(MEMP().map(e => e.department).filter(Boolean))].map(d => [d, d])] }), F('stmts', 'Statements (one per line)', 'textarea', { req: 1 }), F('open', 'Opens', 'date', { req: 1, half: 1 }), F('close', 'Closes', 'date', { req: 1, half: 1 }), F('status', 'Status', 'select', { o: ['Draft', 'Open', 'Closed'], req: 1 })],
        cols: ['title', 'period', 'aud', 'open', 'close'], kpi: ['Draft', 'Open', 'Closed'], label: r => `${r.title} (${r.id})`,
        defaults: { aud: 'All employees', open: () => tdy(), close: () => addDays(tdy(), 14), status: 'Draft', stmts: 'I have the tools and resources to do my job well\nMy manager supports my growth\nI feel recognised for good work\nI understand how my work contributes to company goals\nI see myself working here in two years' },
        validate: undefined,
        rowAct: r => r.status === 'Open' && myEmp() && !(R.settings.answered[r.id] || []).includes(USER.email) ? `<button class="btn sm primary" onclick="respondSurvey('${r.id}')">Respond</button>` : ''
      },
      licences: {
        title: 'Licences & registrations', one: 'Licence', icon: 'shield', app: 'plus', desc: 'Company registrations and licences with renewal dates.',
        f: [F('name', 'Licence / registration', 'select', { o: ['Shops & Establishment', 'PF establishment code', 'ESI registration', 'Professional tax registration', 'Labour welfare fund', 'Contract labour licence', 'Trade licence', 'Fire NOC', 'Other'], req: 1, half: 1 }), F('no', 'Number', 'text', { req: 1, half: 1 }), F('auth', 'Authority', 'text', { suggest: 1, half: 1 }), F('loc', 'Location', 'text', { suggest: 1, half: 1 }), F('valid', 'Valid till', 'date', { half: 1 }), F('owner', 'Renewal owner', 'emp', { half: 1 }), F('file', 'Certificate', 'file')],
        st: null, stFn: r => !r.valid ? 'Active' : r.valid < tdy() ? 'Expired' : dayDiff(tdy(), r.valid) <= 30 ? 'Renewal due' : 'Active', statuses: ['Active', 'Renewal due', 'Expired'], cols: ['name', 'no', 'auth', 'loc', 'valid', 'owner'], kpi: ['Active', 'Renewal due', 'Expired'], label: r => `${r.name} ${r.no}`
      },
      actions: {
        title: 'HR actions & reminders', one: 'Action', icon: 'bell', app: 'plus', acc: 'act', accEmp: 'owner', desc: 'One to-do list for HR. Most actions are created automatically from dates in other modules and close themselves when resolved.',
        f: [F('title', 'Action', 'text', { req: 1 }), F('cat', 'Category', 'select', { o: ['Probation', 'Appraisal', 'Performance', 'Promotion', 'Documents', 'Compliance', 'Onboarding', 'Exit', 'Policy', 'Training', 'Engagement', 'Other'], req: 1, half: 1 }), F('pri', 'Priority', 'select', { o: ['Low', 'Normal', 'High', 'Urgent'], req: 1, half: 1 }), F('emp', 'Related employee', 'emp', { half: 1 }), F('owner', 'Owner', 'emp', { half: 1, help: 'Blank = HR team' }), F('due', 'Due date', 'date', { req: 1, half: 1 }), F('remind', 'Remind me', 'select', { o: ['On the day', '1 day before', '3 days before', '7 days before'], half: 1 }), F('repeat', 'Repeat', 'select', { o: ['None', 'Monthly', 'Quarterly', 'Yearly'], half: 1 }), F('status', 'Status', 'select', { o: ['Open', 'In progress', 'Done', 'Snoozed', 'Cancelled'], req: 1, half: 1 }), F('src', 'Source', 'text', { ro: 1 }), F('notes', 'Notes', 'textarea')],
        cols: ['title', 'cat', 'emp', 'owner', 'pri', 'due'], due: 'due', closed: ['Done', 'Cancelled'], filter: 'cat', kpi: ['Open', 'In progress', 'Overdue'], defaults: { status: 'Open', pri: 'Normal', remind: '1 day before', repeat: 'None', due: () => tdy() },
        sort: (a, b) => { const o = x => ['Done', 'Cancelled'].includes(x.status) ? 1 : 0; return o(a) - o(b) || (a.due || '').localeCompare(b.due || '') },
        xf: r => { const v = TAB.actView || 'My actions', me = myEmp(); if (v === 'My actions') return r.owner === me && !!me || r._cb === USER.email || (!r.owner && canHR()); if (v === 'My team') return teamOf(me).has(r.owner) || teamOf(me).has(r.emp); return true },
        after: undefined
      }
    };
    Object.entries(REG2).forEach(([k, d]) => { d.k = k; if (d.st === undefined) d.st = 'status'; d.statuses = d.statuses || (d.f.find(f => f.k === d.st)?.o || []); if (d.due && !d.statuses.includes('Overdue')) d.statuses = [...d.statuses, 'Overdue']; d.idp = { goals: 'GL-', checkins: 'CI-', pips: 'PIP-', promos: 'PRM-', idps: 'IDP-', succession: 'SUC-', surveys: 'SV-', licences: 'LIC-', actions: 'ACT-' }[k]; d.label = d.label || (r => `${r.id}`); REG[k] = d });

    /* ---------- summary-only view (Leadership etc.) ---------- */
    function summaryView(k,o={}){const d=REG[k],data=COMPUTED.summaries?.[k]||{total:0,counts:{}};return head(o.title||esc(d.title),o.desc||esc(d.desc),'')+(o.after||'')+'<div class="grid g4">'+[stat(d.icon,'Total',data.total,'Records'),...(d.kpi||[]).slice(0,3).map(s=>stat(d.icon,s,data.counts[s]||0,'Records'))].join('')+'</div><div class="banner mt" style="background:var(--info-bg);border-color:color-mix(in srgb,var(--brand) 25%,transparent)">'+ic('shield')+'<span>Your role (<b>'+esc(curRole())+'</b>) sees totals only. Names and individual details are restricted.</span></div>'}

    /* ---------- 1. Performance management ---------- */
    V.m_perf = () => {
      const s = scopeOf('perf'); const T = ['Overview']; if (s !== 'summary') { T.push('Goals & KRAs', 'Check-ins') } if (!['none'].includes(scopeOf('pip')) && curRole() !== 'Employee') T.push('Improvement plans'); else if (scopeOf('pip') === 'ownshared' && live('pips').some(p => canSeeRec('pips', p))) T.push('Improvement plans');
      const [t, tbar] = tabsBar('t_perf', T); const H = { title: 'Performance management', desc: 'Goals, check-ins and year-end results for each employee, linked by Employee ID. Ratings come from the Appraisal tracker.', after: noLink() + tbar };
      if (t === 'Goals & KRAs') return regView('goals', H); if (t === 'Check-ins') return regView('checkins', H); if (t === 'Improvement plans') return regView('pips', { ...H, after: H.after + confNote('Improvement plans are visible only to HR Admin, the assigned HR partner, the manager, and the employee once shared.') });
      const E = s === 'summary' ? MEMP().filter(e => e.status !== 'Exited') : visEmps('perf').filter(e => e.status !== 'Exited'); const A = R.settings.adv;
      const rows = E.map(e => {
        const a = latestAppr(e.id), r = ratingOf(e.id); const cyc = a?.cycle; const G = live('goals').filter(g => g.emp === e.id && (!cyc || g.cycle === cyc) && g.status !== 'Dropped' && g.status !== 'Draft'); const w = G.reduce((x, g) => x + (+g.weight || 0), 0); const gp = w ? Math.round(G.reduce((x, g) => x + (+g.weight || 0) * Math.min(100, +g.progress || 0), 0) / w) : null;
        const ci = live('checkins').filter(c => c.emp === e.id && c.status === 'Completed').sort((x, y) => y.date.localeCompare(x.date))[0]; const pip = scopeOf('pip') !== 'none' && live('pips').some(p => p.emp === e.id && p.status === 'Active' && canSeeRec('pips', p));
        return { e, a, r, gp, ci, pip }
      });
      const rated = rows.filter(x => typeof x.r === 'number'); const avg = rated.length ? (rated.reduce((a, x) => a + x.r, 0) / rated.length).toFixed(1) : '—'; const gps = rows.filter(x => x.gp !== null); const odr = live('appraisal').filter(a => effSt(REG.appraisal, a) === 'Overdue' && (s === 'summary' || empVisible('perf', a.emp))).length; const stale = rows.filter(x => !x.ci || dayDiff(x.ci.date, tdy()) > 60).length;
      const kpis = [stat('users', 'Employees in view', rows.length, s === 'summary' ? 'Company totals' : 'Within your access'), stat('star', 'Average rating', avg, `${rated.length} rated · scale 1–5`), stat('chart', 'Goal completion', gps.length ? Math.round(gps.reduce((a, x) => a + x.gp, 0) / gps.length) + '%' : '—', 'Weighted progress'), stat('clock', 'Overdue reviews', odr, 'Past review due date', odr ? 'down' : '')].join('');
      const dist = [1, 2, 3, 4, 5].map(n => [`Rating ${n}`, rated.filter(x => x.r === n).length]);
      const byDept = Object.entries(rows.filter(x => x.gp !== null).reduce((m, x) => { const d = x.e.department || 'Not set'; (m[d] = m[d] || []).push(x.gp); return m }, {})).map(([d, v]) => [d, Math.round(v.reduce((a, b) => a + b, 0) / v.length)]);
      const extra = `<div class="grid g2 mt">${card('Rating distribution', hbars(dist))}${card('Goal completion by department', hbars(byDept, v => v + '%'))}</div>`;
      if (s === 'summary') return head(H.title, H.desc, '') + H.after + `<div class="grid g4">${kpis}</div>` + extra + `<div class="banner mt" style="background:var(--info-bg)">${ic('shield')}<span>Your role sees company totals only.</span></div>`;
      H.tools = `<span class="muted" style="margin-left:auto;font-size:12.5px">${stale} with no check-in in 60 days</span>`;
      return pageShell(H, btn('Export report', 'perfCSV()', '', 'download') + (canAddK('goals') ? btn('Add goal', "TAB.t_perf='Goals & KRAs';regForm('goals')", 'primary', 'plus') : ''), kpis, extra, ['Employee', 'Department', 'Cycle stage', 'Goal progress', 'Last check-in', 'Latest rating', 'Flags'],
        rows.map(x => ({ s: searchText(REG.emp, x.e), c: [empCell(x.e.id), esc(x.e.department || ''), x.a ? pill(effSt(REG.appraisal, x.a)) : '<span class="muted">No appraisal</span>', x.gp === null ? '<span class="muted">No goals</span>' : `<div style="min-width:110px">${bar(x.gp)}<span class="muted" style="font-size:12px">${x.gp}%</span></div>`, x.ci ? fd(x.ci.date) : '<span class="muted">Never</span>', x.r === 'hidden' ? '<span class="muted">Not released</span>' : x.r === null ? '—' : `<b>${x.r}</b>`, [x.pip ? '<span class="pill p-bad">PIP</span>' : '', typeof x.r === 'number' && x.r <= A.ratingLow && !x.pip && canAddK('pips') ? '<span class="pill p-warn">Consider PIP</span>' : '', typeof x.r === 'number' && x.r >= A.ratingHigh && canAddK('promos') ? '<span class="pill p-ok">Promotion candidate</span>' : ''].join(' ') || '—'] })), 'No employees in your view yet. Add people in Employee master data.', 'perf')
    };
    function perfCSV() { const rows = visEmps('perf').map(e => { const a = latestAppr(e.id), r = ratingOf(e.id); return [e.id, empName(e), e.department || '', a?.cycle || '', a ? effSt(REG.appraisal, a) : '', r === 'hidden' ? 'Not released' : r ?? ''] }); if (!rows.length) { toast('Nothing to export'); return } csvDownload(`performance-report-${tdy()}.csv`, [['Employee ID', 'Name', 'Department', 'Cycle', 'Stage', 'Latest rating'], ...rows]); raudit('Exported performance report'); rsave() }

    /* ---------- 2. Career growth & promotions ---------- */
    V.m_career = () => {
      const T = []; if (scopeOf('promo') !== 'none') T.push('Promotion nominations'); if (['all', 'view', 'teamx'].includes(scopeOf('promo'))) T.push('Eligibility'); if (scopeOf('idp') !== 'none') T.push('Career plans'); if (scopeOf('succ') !== 'none') T.push('Succession'); if (scopeOf('idp') !== 'none' || scopeOf('promo') !== 'none') T.push('Career timeline');
      if (!T.length) return head('Career growth & promotions', 'Not available for your role.', '');
      const [t, tbar] = tabsBar('t_career', T); const H = { title: 'Career growth & promotions', desc: 'Promotions, development plans and succession cover. An effected promotion is the only step that changes Employee master data.', after: noLink() + tbar };
      if (t === 'Promotion nominations') return scopeOf('promo') === 'summary' ? summaryView('promos', H) : regView('promos', { ...H, after: H.after + confNote('Nominations include proposed pay.') });
      if (t === 'Career plans') return regView('idps', H);
      if (t === 'Succession') return scopeOf('succ') === 'view' || curRole() === 'HR Admin' ? regView('succession', { ...H, after: H.after + confNote('Succession plans and flight risk are restricted to HR Admin and Leadership.') }) : '';
      if (t === 'Eligibility') {
        const A = R.settings.adv; const E = MEMP().filter(e => e.status !== 'Exited' && (scopeOf('promo') !== 'teamx' || empVisible('promo', e.id))); const rows = E.map(e => ({ e, el: eligibility(e.id), last: live('promos').filter(p => p.emp === e.id && p.status === 'Effected').sort((a, b) => b.eff.localeCompare(a.eff))[0], open: live('promos').find(p => p.emp === e.id && !['Rejected', 'Effected'].includes(p.status)) }));
        return pageShell(H, canHR() && curRole() === 'HR Admin' ? btn('Edit rules', 'editElig()', '', 'edit') : '', [stat('check', 'Eligible', rows.filter(x => x.el.ok).length, `${A.eligMonths}+ months in grade, rating ${A.eligRating}+`), stat('users', 'Eligible, not nominated', rows.filter(x => x.el.ok && !x.open).length, 'Worth a look'), stat('chart', 'Open nominations', rows.filter(x => x.open).length, 'In progress'), stat('star', 'Promoted in 12 months', live('promos').filter(p => p.status === 'Effected' && dayDiff(p.eff, tdy()) <= 365).length, 'Effected')].join(''), '', ['Employee', 'Designation', 'Months in grade', 'Latest rating', 'Last promotion', 'Result', ''],
          rows.map(x => ({ s: searchText(REG.emp, x.e), c: [empCell(x.e.id), esc(x.e.designation || ''), x.el.months, x.el.rating ?? '—', x.last ? fd(x.last.eff) : '—', x.el.ok ? pill('Eligible') : `${pill('Not yet')}<div class="muted" style="font-size:12px;margin-top:3px">${esc(x.el.why.join('; '))}</div>`, x.open ? `<span class="muted">${esc(x.open.id)}: ${esc(x.open.status)}</span>` : canAddK('promos') ? `<button class="btn sm" onclick="regForm('promos',null,{emp:'${x.e.id}'})">Nominate</button>` : ''] })), 'No employees in your view.', 'elig')
      }
      const sel = TAB.tlEmp && visEmps(scopeOf('idp') !== 'none' ? 'idp' : 'promo').some(e => e.id === TAB.tlEmp) ? TAB.tlEmp : (visEmps(scopeOf('idp') !== 'none' ? 'idp' : 'promo')[0]?.id || ''); const e = empById(sel); const ev = [];
      if (e) { if (e.doj) ev.push([e.doj, 'Joined', `${esc(e.designation || '')}, ${esc(e.department || '')}`, 'login']); live('probation').filter(p => p.emp === sel && p.status === 'Confirmed').forEach(p => ev.push([p.end, 'Confirmed after probation', '', 'check'])); live('increments').filter(i => i.emp === sel).forEach(i => ev.push([i.eff, i.itype, `${inr(i.prev)} → ${inr(i.next)} (${i.pct}%)`, 'pay'])); live('promos').filter(p => p.emp === sel && p.status === 'Effected').forEach(p => ev.push([p.eff, 'Promoted', `${esc(p.curDes)} → ${esc(p.propDes)}`, 'star'])); live('recog').filter(r => r.emp === sel && r.status === 'Awarded').forEach(r => ev.push([r.date, esc(r.award), 'Recognition', 'star'])); live('exit').filter(x => x.emp === sel).forEach(x => ev.push([x.lwd, 'Last working day', esc(x.etype), 'logout'])) }
      ev.sort((a, b) => (b[0] || '').localeCompare(a[0] || ''));
      return head(H.title, H.desc, '') + H.after + `<div class="card"><label class="field" style="max-width:420px">Employee<select class="input" onchange="TAB.tlEmp=this.value;rerender()">${visEmps(scopeOf('idp') !== 'none' ? 'idp' : 'promo').map(x => `<option value="${x.id}" ${x.id === sel ? 'selected' : ''}>${esc(empName(x))} (${x.id})</option>`).join('')}</select></label>${ev.length ? `<ol class="tline">${ev.map(x => `<li><span class="tdot">${ic(x[3], 14)}</span><div><b>${x[1]}</b><div class="sub">${fd(x[0])}${x[2] ? ' · ' + x[2] : ''}</div></div></li>`).join('')}</ol>` : '<div class="empty">No career events yet.</div>'}</div>`
    };
    function editElig() { const A = R.settings.adv; form('Promotion eligibility rules', 'Used by the eligibility check and the Performance flags.', [{ k: 'm', l: 'Minimum months in current grade', t: 'number', v: A.eligMonths, req: true, half: true }, { k: 'r', l: 'Minimum latest rating (1–5)', t: 'number', v: A.eligRating, req: true, half: true }, { k: 'lo', l: 'Low rating (suggest PIP at or below)', t: 'number', v: A.ratingLow, half: true }, { k: 'hi', l: 'High rating (promotion candidate at or above)', t: 'number', v: A.ratingHigh, half: true }], 'Save rules', v => { A.eligMonths = +v.m; A.eligRating = +v.r; A.ratingLow = +v.lo; A.ratingHigh = +v.hi; raudit('Updated promotion eligibility rules'); rsave() }) }

    /* ---------- 3. Workforce analytics ---------- */
    function exitDate(e) { const x = live('exit').filter(r => r.emp === e.id && ['Completed', 'Approved', 'In clearance'].includes(r.status)).sort((a, b) => b.lwd.localeCompare(a.lwd))[0]; if (x && (x.status === 'Completed' || x.lwd <= tdy())) return x.lwd; return e.status === 'Exited' ? (x?.lwd || e._u?.slice(0, 10)) : null }
    V.m_wfa = () => {
      const s = scopeOf('wfa'); const H = { title: 'Workforce analytics', desc: 'Headcount, movement, tenure and absence, calculated live from Employee master data and linked records. Nothing to enter.' };
      const F2 = TAB.wfaF || {}; const M = TAB.wfaM || 12; let E = MEMP(); if (s === 'team') { const t = teamOf(myEmp()); E = E.filter(e => t.has(e.id)) }
      const opt = k => [...new Set(MEMP().map(e => e[k]).filter(Boolean))].sort(); E = E.filter(e => ['department', 'location', 'grade', 'type'].every(k => !F2[k] || e[k] === F2[k]));
      const tools = `<div class="card wfa-f">${['department', 'location', 'grade', 'type'].map(k => `<select class="input" aria-label="${k}" onchange="TAB.wfaF={...(TAB.wfaF||{}),${k}:this.value};rerender()"><option value="">All ${k === 'type' ? 'employment types' : k + 's'}</option>${opt(k).map(o => `<option ${F2[k] === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`).join('')}<select class="input" aria-label="Trend period" onchange="TAB.wfaM=+this.value;rerender()">${[6, 12, 24].map(n => `<option value="${n}" ${n === M ? 'selected' : ''}>Last ${n} months</option>`).join('')}</select></div>`;
      if (s === 'pay') return head(H.title, 'Monthly pay cost by department, from active salary structures. Your role sees pay cost only.', btn('Export', 'wfaCSV()', '', 'download')) + tools + payCard(E);
      if (!MEMP().length) return head(H.title, H.desc, '') + `<div class="card"><div class="empty"><div class="empty-ic">${ic('chart', 24)}</div>No employees yet. Analytics appear once you add people in <b>Employee master data</b>.</div></div>`;
      const months = [...Array(M)].map((_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (M - 1 - i)); return localISO(d).slice(0, 7) }); const endOf = m => { const [y, mm] = m.split('-').map(Number); return localISO(new Date(y, mm, 0)) };
      const active = (e, dt) => e.doj && e.doj <= dt && !(exitDate(e) && exitDate(e) < dt);
      const hc = months.map(m => E.filter(e => active(e, endOf(m))).length); const join = months.map(m => E.filter(e => (e.doj || '').slice(0, 7) === m).length); const leave = months.map(m => E.filter(e => (exitDate(e) || '').slice(0, 7) === m).length);
      const cur = E.filter(e => active(e, tdy())); const yr = addDays(tdy(), -365); const lv12 = E.filter(e => exitDate(e) && exitDate(e) >= yr && exitDate(e) <= tdy()); const avgHc = (E.filter(e => active(e, yr)).length + cur.length) / 2 || 1;
      const vol = lv12.filter(e => live('exit').some(x => x.emp === e.id && x.etype === 'Resignation')).length;
      const ten = [['Under 1 year', 0], ['1–3 years', 0], ['3–5 years', 0], ['5+ years', 0]]; cur.forEach(e => { const y = dayDiff(e.doj, tdy()) / 365.25; ten[y < 1 ? 0 : y < 3 ? 1 : y < 5 ? 2 : 3][1]++ });
      const by = TAB.wfaBy || 'department'; const span = groupCount(cur.filter(e => e.manager), e => e.manager).map(([m, n]) => [empText(m), n]);
      const pr = live('probation'); const conv = live('cands').filter(c => c.empId); const tth = conv.map(c => { const e = empById(c.empId); return e && e.doj ? dayDiff(c._c.slice(0, 10), e.doj) : null }).filter(x => x !== null && x >= 0); const offA = live('offers2').filter(o => o.status === 'Accepted').length, offD = live('offers2').filter(o => o.status === 'Declined').length;
      const ids = new Set(E.map(e => e.id)); const att30 = live('att').filter(a => ids.has(a.emp) && a.date >= addDays(tdy(), -30)); const abs = att30.length ? Math.round(att30.filter(a => a.mark === 'Absent').length / att30.length * 1000) / 10 : null;
      const lvT = groupCount(live('leaves2').filter(l => ids.has(l.emp) && l.status === 'Approved' && l.from.slice(0, 4) === tdy().slice(0, 4)), l => l.ltype).map(([t]) => [t, live('leaves2').filter(l => ids.has(l.emp) && l.status === 'Approved' && l.ltype === t && l.from.slice(0, 4) === tdy().slice(0, 4)).reduce((a, l) => a + (+l.days || 0), 0)]);
      TAB._wfa = { months, hc, join, leave, ten, by, cur, lvT, span };
      return head(H.title, H.desc + (s === 'team' ? ' Showing your team only.' : ''), btn('Download report', 'wfaCSV()', 'primary', 'download')) + tools +
        `<div class="grid g4 mt">${stat('users', 'Headcount', cur.length, `${cur.filter(e => e.status === 'Probation').length} on probation`)}${stat('logout', 'Attrition, last 12 months', (lv12.length / avgHc * 100).toFixed(1) + '%', `${lv12.length} left · ${vol} voluntary, ${lv12.length - vol} other`, lv12.length ? 'down' : '')}${stat('briefcase', 'Time to hire', tth.length ? Math.round(tth.reduce((a, b) => a + b, 0) / tth.length) + ' days' : '—', offA + offD ? `Offer acceptance ${Math.round(offA / (offA + offD) * 100)}%` : 'No offers decided yet')}${stat('clock', 'Absenteeism, 30 days', abs === null ? '—' : abs + '%', `${att30.length} attendance entries`)}</div>
  <div class="grid g-dash mt">${card(`Headcount, last ${M} months`, hc.some(Boolean) ? area(hc, months.map(m => new Date(m + '-15').toLocaleDateString('en-US', { month: 'short' })), v => String(v)) : '<div class="empty">No joining dates in this period.</div>')}
  ${card('Joiners and leavers', `<div class="jl">${months.slice(-6).map((m, i) => { const j = join.slice(-6)[i], l = leave.slice(-6)[i], mx = Math.max(1, ...join.slice(-6), ...leave.slice(-6)); return `<div><span class="jlb"><i style="height:${j / mx * 100}%;background:var(--ok)" title="${j} joined"></i><i style="height:${l / mx * 100}%;background:var(--bad)" title="${l} left"></i></span><b>${j}/${l}</b>${new Date(m + '-15').toLocaleDateString('en-US', { month: 'short' })}</div>` }).join('')}</div><div class="legend" style="margin-top:10px"><span><i class="lg" style="background:var(--ok)"></i>Joined</span><span><i class="lg" style="background:var(--bad)"></i>Left</span></div>`)}</div>
  <div class="grid g3 mt">${card('Distribution', `<div class="tabs" style="margin-bottom:12px">${[['department', 'Department'], ['location', 'Location'], ['grade', 'Grade'], ['gender', 'Gender'], ['type', 'Type']].map(([k, l]) => `<button class="${by === k ? 'on' : ''}" onclick="TAB.wfaBy='${k}';rerender()">${l}</button>`).join('')}</div>${hbars(groupCount(cur, e => e[by]))}`)}
  ${card('Tenure', hbars(ten))}
  ${card('Probation pipeline', `<div class="list">${[['Due in 30 days', pr.filter(p => !['Confirmed'].includes(p.status) && p.end >= tdy() && dayDiff(tdy(), p.end) <= 30 && ids.has(p.emp)).length], ['Overdue decision', pr.filter(p => effSt(REG.probation, p) === 'Overdue' && ids.has(p.emp)).length], ['Confirmed, last 90 days', pr.filter(p => p.status === 'Confirmed' && ids.has(p.emp) && p._u && dayDiff(p._u.slice(0, 10), tdy()) <= 90).length]].map(([l, n]) => `<div class="row"><div class="grow">${l}</div><b>${n}</b></div>`).join('')}</div>`)}</div>
  <div class="grid g2 mt">${card('Span of control', span.length ? `<div class="list">${span.slice(0, 8).map(([m, n]) => `<div class="row"><div class="grow">${esc(m)}</div><b>${n} direct report${n > 1 ? 's' : ''}</b></div>`).join('')}</div>` : '<div class="empty" style="padding:24px">No reporting managers set.</div>')}
  ${card(`Leave used in ${tdy().slice(0, 4)} (days)`, hbars(lvT))}</div>` + (scopeOf('pay') === 'all' ? `<div class="mt">${payCard(E)}</div>` : '')
    };
    function payCard(E) { const ids = new Set(E.map(e => e.id)); const st = live('structure').filter(s => s.status === 'Active' && ids.has(s.emp)); const rows = groupCount(st, s => empById(s.emp)?.department).map(([d]) => [d, st.filter(s => (empById(s.emp)?.department || 'Not set') === d).reduce((a, s) => a + (+s.mgross || 0), 0)]); return card('Monthly pay cost by department (confidential)', st.length ? hbars(rows, v => '₹' + (v / 1e5).toFixed(2) + 'L') + `<p class="muted" style="font-size:12.5px;margin:10px 0 0">Total ${inr(rows.reduce((a, r) => a + r[1], 0))} a month across ${st.length} active salary structures.</p>` : '<div class="empty" style="padding:24px">No active salary structures yet.</div>') }
    function wfaCSV() {
      const W = TAB._wfa; const out = [['Section', 'Label', 'Value']]; if (W) { W.months.forEach((m, i) => out.push(['Headcount', m, W.hc[i]], ['Joiners', m, W.join[i]], ['Leavers', m, W.leave[i]])); W.ten.forEach(t => out.push(['Tenure', t[0], t[1]])); groupCount(W.cur, e => e[W.by]).forEach(([k, n]) => out.push(['By ' + W.by, k, n])); W.lvT.forEach(([k, n]) => out.push(['Leave days', k, n])); W.span.forEach(([k, n]) => out.push(['Direct reports', k, n])) }
      if (scopeOf('pay') === 'all') live('structure').filter(s => s.status === 'Active').forEach(s => out.push(['Monthly pay cost', empById(s.emp)?.department || 'Not set', s.mgross])); if (out.length < 2) { toast('Nothing to export'); return } csvDownload(`workforce-analytics-${tdy()}.csv`, out); raudit('Exported workforce analytics'); rsave()
    }

    /* ---------- 4. Engagement analytics ---------- */
    R.data.resp = R.data.resp || [];
    const band = e => { const y = e && e.doj ? dayDiff(e.doj, tdy()) / 365.25 : 0; return y < 1 ? 'Under 1 year' : y < 3 ? '1–3 years' : y < 5 ? '3–5 years' : '5+ years' };
    function respondSurvey(id) {
      const s = recs('surveys').find(x => x.id === id); const st = s.stmts.split('\n').map(x => x.trim()).filter(Boolean);
      modal(`<h2>${esc(s.title)}</h2><p class="sub">Anonymous. Only your department and tenure band are saved with your answers, never your name or Employee ID.</p><label class="field">How likely are you to recommend Brightcone as a place to work? (0–10)<select class="input" id="sv_n"><option value="">Select…</option>${[...Array(11)].map((_, i) => `<option>${i}</option>`).join('')}</select></label>${st.map((q, i) => `<label class="field">${esc(q)}<select class="input" id="sv_${i}"><option value="">Select…</option>${['1 · Strongly disagree', '2 · Disagree', '3 · Neutral', '4 · Agree', '5 · Strongly agree'].map((o, j) => `<option value="${j + 1}">${o}</option>`).join('')}</select></label>`).join('')}<p id="ferr" style="color:var(--bad);font-size:13.5px;margin:0"></p><div class="mfoot"><button class="btn" onclick="closeAll()">Cancel</button><button class="btn primary" onclick="submitSurvey('${id}',${st.length})">Submit</button></div>`); document.getElementById('modal').classList.add('wide')
    }
    async function submitSurvey(id,n){const nps=document.getElementById('sv_n').value,sc=[...Array(n)].map((_,i)=>document.getElementById('sv_'+i).value);try{if(nps===''||sc.some(x=>!x))throw new Error('Please answer every question.');await bridge.flush();const data=await request('/surveys/'+id+'/respond','POST',{nps:+nps,sc:sc.map(Number)});bridge.adopt(data.state);closeAll();rerender();toast(data.message)}catch(error){document.getElementById('ferr').textContent=error.message}}
    function surveyStats(sv,filter){const data=COMPUTED.surveys?.[sv.id];if(!data)return{n:0,enps:null,avg:sv.stmts.split(String.fromCharCode(10)).map(q=>[q,null]),rs:[]};if(!filter)return data.all;for(const[dept,stats]of Object.entries(data.depts||{}))if(filter({dept}))return stats;return{n:0,enps:null,avg:[],rs:[]}}
    V.m_eng = () => {
      const s = scopeOf('eng'); const T = []; if (!['respond', 'none'].includes(s)) T.push('Engagement overview', 'Signals'); T.push('Pulse surveys'); if (scopeOf('risk') === 'all') T.push('Retention risk');
      const [t, tbar] = tabsBar('t_eng', T); const H = { title: 'Engagement analytics', desc: 'Pulse survey results and engagement signals from Connect, People and Learn. Results for groups under ' + R.settings.adv.minGroup + ' responses are hidden.', after: noLink() + tbar }; const MIN = R.settings.adv.minGroup;
      if (t === 'Pulse surveys') {
        if (['respond'].includes(s)) { const open = live('surveys').filter(x => x.status === 'Open'); return head(H.title, 'Open surveys you can answer. Your answers are anonymous.', '') + H.after + (open.length ? `<div class="grid g2">${open.map(x => { const done = (R.settings.answered[x.id] || []).includes(USER.email); return card(esc(x.title), `<p class="muted" style="margin:0 0 12px">${esc(x.period || '')} · closes ${fd(x.close)}</p>${done ? pill('Completed') : myEmp() ? btn('Respond', `respondSurvey('${x.id}')`, 'primary') : '<span class="muted">Link your login to an Employee ID to respond.</span>'}`) }).join('')}</div>` : '<div class="card"><div class="empty">No open surveys right now.</div></div>') }
        return regView('surveys', H)
      }
      if (t === 'Signals') {
        const fb = live('feedback'); const cats = groupCount(fb, f => f.cat).map(([c, n]) => { const rt = fb.filter(f => f.cat === c && f.rating); return [c, n, rt.length ? (rt.reduce((a, f) => a + +f.rating, 0) / rt.length).toFixed(1) : '—'] });
        const months = [...Array(6)].map((_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i)); return localISO(d).slice(0, 7) }); const rc = months.map(m => live('recog').filter(r => (r.date || '').slice(0, 7) === m).length + S.posts.filter(p => p.type === 'Kudos' && (p.d || '').slice(0, 7) === m).length);
        return head(H.title, H.desc, '') + H.after + `<div class="grid g4">${stat('chat', 'Feedback items', fb.length, `${fb.filter(f => f.status !== 'Completed').length} still open`)}${stat('star', 'Recognitions, 6 months', rc.reduce((a, b) => a + b, 0), 'Awards and kudos')}${stat('gift', 'Events held', live('events').filter(e => e.status === 'Completed').length, `${live('events').filter(e => e.status === 'Completed').reduce((a, e) => a + (+e.att || 0), 0)} total attendance`)}${stat('mega', 'Town halls', live('townhall').filter(e => e.status === 'Completed').length, `Average attendance ${(() => { const c = live('townhall').filter(e => e.status === 'Completed' && e.att); return c.length ? Math.round(c.reduce((a, e) => a + +e.att, 0) / c.length) : '—' })()}`)}</div>
    <div class="grid g2 mt">${card('Feedback by category', cats.length ? tbl([['Category', r => `<b>${esc(r[0])}</b>`], ['Items', r => r[1]], ['Average rating', r => r[2]]], cats) : '<div class="empty" style="padding:24px">No feedback yet.</div>')}${card('Recognition per month', rc.some(Boolean) ? area(rc, months.map(m => new Date(m + '-15').toLocaleDateString('en-US', { month: 'short' })), v => String(v)) : '<div class="empty" style="padding:24px">No recognition in the last 6 months.</div>')}</div>`
      }
      if (t === 'Retention risk') {
        const hi = R.settings.adv; const rows = MEMP().filter(e => !['Exited'].includes(e.status)).map(e => { const sig = []; const sixAgo = addDays(tdy(), -183); if (!live('recog').some(r => r.emp === e.id && r.date >= sixAgo) && dayDiff(e.doj || tdy(), tdy()) > 183) sig.push('No recognition in 6 months'); const ap = live('appraisal').filter(a => a.emp === e.id && a.rating).sort((a, b) => (b.due || '').localeCompare(a.due || '')); if (ap.length > 1 && +ap[0].rating < +ap[1].rating) sig.push('Rating dropped'); const since = curGradeSince(e.id); if (since && dayDiff(since, tdy()) > 365 * 3) sig.push('No promotion in 3+ years'); const lv = (a, b) => live('leaves2').filter(l => l.emp === e.id && ['Sick leave', 'Casual leave', 'Loss of pay'].includes(l.ltype) && l.status === 'Approved' && l.from >= a && l.from < b).reduce((x, l) => x + (+l.days || 0), 0); const n1 = lv(addDays(tdy(), -90), addDays(tdy(), 1)), n0 = lv(addDays(tdy(), -180), addDays(tdy(), -90)); if (n1 > n0 && n1 >= 3) sig.push('Unplanned leave rising'); return { e, sig, lvl: sig.length >= 3 ? 'High' : sig.length === 2 ? 'Medium' : 'Low' } }).sort((a, b) => b.sig.length - a.sig.length);
        raudit('Viewed retention risk'); rsave();
        return pageShell({ ...H, after: H.after + confNote('Retention risk is restricted to HR Admin and Leadership.') }, '', [stat('shield', 'High risk', rows.filter(x => x.lvl === 'High').length, '3+ signals', 'down'), stat('shield', 'Medium risk', rows.filter(x => x.lvl === 'Medium').length, '2 signals'), stat('shield', 'Low risk', rows.filter(x => x.lvl === 'Low').length, '0–1 signals'), stat('users', 'Employees assessed', rows.length, 'Active employees')].join(''), '', ['Employee', 'Department', 'Signals', 'Risk', ''], rows.map(x => ({ s: searchText(REG.emp, x.e), c: [empCell(x.e.id), esc(x.e.department || ''), x.sig.length ? `<span style="white-space:normal">${esc(x.sig.join(' · '))}</span>` : '<span class="muted">None</span>', pill(x.lvl), x.lvl !== 'Low' && canHR() ? `<button class="btn sm" onclick="regForm('actions',null,{title:'Stay conversation with ${esc(empName(x.e))}',cat:'Engagement',emp:'${x.e.id}',pri:'${x.lvl === 'High' ? 'High' : 'Normal'}',src:'Retention risk'})">Create action</button>` : ''] })), 'No employees yet.', 'risk')
      }
      const SV = live('surveys').filter(x => x.status !== 'Draft').sort((a, b) => b.open.localeCompare(a.open)); if (!SV.length) return head(H.title, H.desc, '') + H.after + `<div class="card"><div class="empty"><div class="empty-ic">${ic('chat', 24)}</div>No surveys run yet. Create one in <b>Pulse surveys</b> and set it to Open.</div></div>`;
      const sv = SV.find(x => x.id === TAB.engS) || SV[0]; let flt = null; if (s === 'team') { const md = empById(myEmp())?.department; flt = r => r.dept === md }
      const st = surveyStats(sv, flt); const aud = sv.aud === 'All employees' ? MEMP().filter(e => e.status !== 'Exited').length : MEMP().filter(e => e.status !== 'Exited' && e.department === sv.aud).length; const ok = st.n >= MIN;
      const depts = Object.keys(COMPUTED.surveys?.[sv.id]?.depts||{}).map(d => { const x = surveyStats(sv, r => r.dept === d && (!flt || flt(r))); return [d, x] }).filter(([, x]) => x.n);
      const trend = SV.slice().reverse().map(x => { const y = surveyStats(x, flt); return [x.title, y.n >= MIN ? y.enps : null] }).filter(x => x[1] !== null);
      return head(H.title, H.desc + (s === 'team' ? ' Showing your department only.' : ''), `<select class="input" aria-label="Survey" onchange="TAB.engS=this.value;rerender()">${SV.map(x => `<option value="${x.id}" ${x.id === sv.id ? 'selected' : ''}>${esc(x.title)}</option>`).join('')}</select>` + btn('Export', 'engCSV()', '', 'download')) + H.after +
        `<div class="grid g4">${stat('star', 'eNPS', ok ? (st.enps > 0 ? '+' : '') + st.enps : 'Hidden', ok ? 'Promoters minus detractors' : `Fewer than ${MIN} responses`)}${stat('users', 'Responses', st.n, aud ? `${Math.round(st.n / aud * 100)}% participation of ${aud}` : '')}${stat('chart', 'Average score', ok ? (st.avg.reduce((a, x) => a + x[1], 0) / st.avg.length).toFixed(2) + ' / 5' : 'Hidden', 'Across all statements')}${stat('calendar', 'Status', sv.status, `Closes ${fd(sv.close)}`)}</div>
  <div class="grid g-dash mt">${card('Score by statement', ok ? `<div class="list">${st.avg.map(([q, v]) => `<div class="row"><div class="grow"><b style="font-weight:500;white-space:normal">${esc(q)}</b><div style="margin-top:6px">${bar(v / 5 * 100)}</div></div><b style="min-width:42px;text-align:right;color:${v < 3 ? 'var(--bad)' : 'inherit'}">${v}</b>${v < 3 && canHR() ? `<button class="btn sm" onclick="regForm('actions',null,{title:'Act on low score: ${esc(q).replace(/'/g, '')}',cat:'Engagement',pri:'Normal',src:'Survey ${sv.id}'})">Action</button>` : ''}</div>`).join('')}</div>` : `<div class="empty">Results appear once at least ${MIN} people respond.</div>`)}
  ${card('By department', depts.length ? tbl([['Department', r => `<b>${esc(r[0])}</b>`], ['Responses', r => r[1].n], ['eNPS', r => r[1].n >= MIN ? r[1].enps : '<span class="muted">Hidden</span>'], ['Average', r => r[1].n >= MIN ? (r[1].avg.reduce((a, x) => a + x[1], 0) / r[1].avg.length).toFixed(2) : '<span class="muted">Hidden</span>']], depts) : '<div class="empty" style="padding:24px">No responses yet.</div>')}</div>` + (trend.length > 1 ? `<div class="mt">${card('eNPS across surveys', area(trend.map(x => x[1]), trend.map(x => x[0].slice(0, 10)), v => String(v)))}</div>` : '')
    };
    function engCSV() { const SV = live('surveys'); const out = [['Survey', 'Group', 'Responses', 'eNPS', 'Statement', 'Average']]; const MIN = R.settings.adv.minGroup; SV.forEach(sv => { const st = surveyStats(sv); if (st.n >= MIN) st.avg.forEach(([q, v]) => out.push([sv.title, 'All', st.n, st.enps, q, v])); else out.push([sv.title, 'All', st.n, 'Hidden (under ' + MIN + ')', '', '']); }); csvDownload(`engagement-${tdy()}.csv`, out); raudit('Exported engagement results'); rsave() }

    /* ---------- 5. Compliance dashboard ---------- */
    const REQDOCS = ['PAN', 'Aadhaar', 'Address proof', 'Degree certificate', 'Appointment letter'];
    function compAreas(){return COMPUTED.compliance||[]}
    V.m_comp = () => {
      const s = scopeOf('comp'); const T = ['Scorecard & gaps']; if (['all'].includes(s)) T.push('Licences & registrations'); const [t, tbar] = tabsBar('t_comp', T); const H = { title: 'HR compliance dashboard', desc: 'A score for each compliance area and every gap, with its Employee ID and a link to fix it. Calculated from your records.', after: tbar };
      if (t === 'Licences & registrations') return regView('licences', H);
      let A = compAreas(); if (s === 'statutory') A = A.filter(a => a.key === 'stat'); const withData = A.filter(a => a.score !== null); const overall = withData.length ? Math.round(withData.reduce((x, a) => x + a.score, 0) / withData.length) : null;
      const gaps = A.flatMap(a => a.gaps).sort((a, b) => (a.due || '9').localeCompare(b.due || '9')); const soon = A.flatMap(a => a.soon.map(x => ({ ...x, area: a.name, link: a.link }))); const fa = TAB.compA || 'All'; const G = gaps.filter(g => fa === 'All' || g.area === fa);
      TAB._comp = { A, gaps, soon, overall };
      const tone = v => v === null ? 'var(--faint)' : v >= 90 ? 'var(--ok)' : v >= 70 ? 'var(--warn)' : 'var(--bad)';
      const score = `<div class="grid g-dash"><div class="card compo"><div class="donut" style="--p:${overall ?? 0};--ac:${tone(overall)}"><b>${overall === null ? '—' : overall + '%'}</b></div><div><h3 style="margin:0 0 6px">Overall compliance</h3><p class="muted" style="margin:0 0 12px">Average of ${withData.length} area${withData.length === 1 ? '' : 's'} with data. ${gaps.length} open gap${gaps.length === 1 ? '' : 's'}, ${soon.length} due in the next 30 days.</p>${s !== 'scores' ? btn('Monthly compliance report', 'compCSV()', 'primary', 'download') : ''}</div></div>
   ${card('Due in the next 30 days', soon.length ? `<div class="list">${soon.slice(0, 6).map(x => `<div class="row"><div class="grow"><b style="font-weight:500">${esc(x.item)}</b><div class="sub">${esc(x.area)}${x.emp ? ' · ' + esc(empText(x.emp)) : ''}</div></div><span class="muted">${fd(x.due)}</span></div>`).join('')}</div>` : '<div class="empty" style="padding:24px">Nothing due in the next 30 days.</div>')}</div>
   <div class="compgrid mt">${A.map(a => `<button class="card compcard" onclick="TAB.compA='${a.name}';rerender()" ${s === 'scores' ? 'disabled' : ''}><div class="ct"><b>${a.name}</b>${a.gaps.length ? `<span class="pill p-bad">${a.gaps.length} gap${a.gaps.length > 1 ? 's' : ''}</span>` : a.score === null ? '<span class="pill p-mute">No data</span>' : '<span class="pill p-ok">Clear</span>'}</div><div class="cv" style="color:${tone(a.score)}">${a.score === null ? '—' : a.score + '%'}</div>${bar(a.score ?? 0)}<span class="muted" style="font-size:12px">${a.ok} of ${a.total} compliant</span></button>`).join('')}</div>`;
      if (s === 'scores') return head(H.title, H.desc, '') + H.after + score + `<div class="banner mt" style="background:var(--info-bg)">${ic('shield')}<span>Your role sees scores only.</span></div>`;
      H.tools = `<select class="input" aria-label="Area" onchange="TAB.compA=this.value;rerender()"><option>All</option>${A.map(a => `<option ${fa === a.name ? 'selected' : ''}>${a.name}</option>`).join('')}</select>`;
      return pageShell(H, '', null, score, ['Area', 'Item', 'Employee', 'Due', 'Severity', ''], G.map(g => ({ s: `${g.area} ${g.item} ${g.emp ? empText(g.emp) : ''}`.toLowerCase(), c: [esc(g.area), `<span style="white-space:normal">${esc(g.item)}</span>`, g.emp ? empCell(g.emp) : '<span class="muted">Company</span>', g.due ? fd(g.due) : '—', pill('Overdue'), `<div class="racts"><button class="btn sm" onclick="compFix('${g.link}','${g.id || g.emp || ''}')">Fix</button>${canHR() ? `<button class="btn sm" onclick="regForm('actions',null,{title:'${esc(g.item).replace(/'/g, '')}',cat:'Compliance',emp:'${g.emp || ''}',pri:'High',due:'${tdy()}',src:'Compliance: ${esc(g.area)}'})">Create action</button>` : ''}</div>`] })), overall === null ? 'No compliance data yet. Scores appear as you add filings, policies, training, documents and exits.' : 'No open gaps. Everything checked is compliant.', 'compgaps')
    };
    function compFix(v, q) { if (v === 'm_comp') { TAB.t_comp = 'Licences & registrations'; rerender(); return } if (q) TAB['q_' + v.slice(2)] = q; openRec(v) }
    function compCSV() { const C = TAB._comp || { A: compAreas() }; const out = [['Section', 'Area', 'Item', 'Employee ID', 'Due', 'Status / score']]; C.A.forEach(a => out.push(['Score', a.name, '', `${a.ok} of ${a.total}`, '', a.score === null ? 'No data' : a.score + '%'])); C.A.forEach(a => a.gaps.forEach(g => out.push(['Gap', a.name, g.item, g.emp || '', g.due || '', 'Overdue']))); C.A.forEach(a => a.soon.forEach(g => out.push(['Due in 30 days', a.name, g.item, g.emp || '', g.due || '', 'Due soon']))); csvDownload(`compliance-report-${tdy().slice(0, 7)}.csv`, out); raudit('Exported monthly compliance report'); rsave() }

    /* ---------- 6. Action & reminder tracker ---------- */
    V.m_actions = () => {
      runRules(); const views = ['My actions']; if (['team', 'all'].includes(scopeOf('act'))) views.push('My team'); if (scopeOf('act') === 'all') views.push('All'); const cur = views.includes(TAB.actView) ? TAB.actView : (canHR() ? 'All' : 'My actions'); TAB.actView = cur;
      const vbar = `<div class="tabs subtabs">${views.map(v => `<button class="${v === cur ? 'on' : ''}" onclick="TAB.actView='${v}';rerender()">${v}</button>`).join('')}</div>`;
      const vis = live('actions').filter(r => canSeeRec('actions', r) && REG.actions.xf(r)); const t = tdy(); const grp = [['Overdue', vis.filter(r => effSt(REG.actions, r) === 'Overdue').length], ['Due today', vis.filter(r => r.due === t && !['Done', 'Cancelled'].includes(r.status)).length], ['This week', vis.filter(r => r.due > t && dayDiff(t, r.due) <= 7 && !['Done', 'Cancelled'].includes(r.status)).length], ['Later', vis.filter(r => r.due && dayDiff(t, r.due) > 7 && !['Done', 'Cancelled'].includes(r.status)).length]];
      return regView('actions', { title: 'HR actions & reminders', desc: REG.actions.desc, after: noLink() + vbar + `<div class="agrp">${grp.map(([l, n]) => `<span class="${l === 'Overdue' && n ? 'bad' : ''}"><b>${n}</b>${l}</span>`).join('')}<span class="muted" style="margin-left:auto">9 automatic rules · last run ${new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</span></div>` })
    };
    const RULES = [
      ['prob', 'Probation', () => live('probation').filter(p => !['Confirmed', 'Extended'].includes(p.status) && dayDiff(tdy(), p.end) <= 15 && !live('probrev').some(r => r.emp === p.emp && r.status === 'Completed')), p => ({ title: `Complete probation review for ${empText(p.emp)}`, emp: p.emp, due: p.end, src: `Probation ${p.id}` }), (a, id) => { const p = recs('probation').find(x => x.id === id); return !p || p._arch || ['Confirmed', 'Extended'].includes(p.status) || live('probrev').some(r => r.emp === p.emp && r.status === 'Completed') }],
      ['appr', 'Appraisal', () => live('appraisal').filter(a => a.status !== 'Completed' && a.due && dayDiff(tdy(), a.due) <= 7), a => ({ title: `Chase appraisal for ${empText(a.emp)}`, emp: a.emp, due: a.due, src: `Appraisal ${a.id}` }), (x, id) => { const a = recs('appraisal').find(r => r.id === id); return !a || a._arch || a.status === 'Completed' }],
      ['doc', 'Documents', () => live('docs').filter(d => d.expiry && d.status !== 'Rejected' && dayDiff(tdy(), d.expiry) <= 30), d => ({ title: `Collect renewed ${d.dtype} from ${empText(d.emp)}`, emp: d.emp, due: d.expiry, src: `Document ${d.id}` }), (x, id) => { const d = recs('docs').find(r => r.id === id); return !d || d._arch || !d.expiry || dayDiff(tdy(), d.expiry) > 30 }],
      ['stat', 'Compliance', () => [...live('statutory').filter(r => r.status !== 'Completed' && dayDiff(tdy(), r.due) <= 7), ...live('pfesi').filter(r => r.status !== 'Paid' && dayDiff(tdy(), r.due) <= 7)], r => ({ title: `File ${r.item || r.scheme} for ${r.period || r.month} and record the challan`, due: r.due, src: `${r.item ? 'Statutory' : 'PF/ESI'} ${r.id}`, pri: 'High' }), (x, id) => { const r = recs('statutory').find(y => y.id === id) || recs('pfesi').find(y => y.id === id); return !r || r._arch || ['Completed', 'Paid'].includes(r.status) }],
      ['offer', 'Onboarding', () => live('offers2').filter(o => !['Accepted', 'Declined'].includes(o.status) && dayDiff(tdy(), o.valid) <= 2), o => ({ title: `Follow up offer ${o.id} (${plain(REG.offers2, REG.offers2.f[0], o.cand)})`, due: o.valid, src: `Offer ${o.id}`, pri: 'High' }), (x, id) => { const o = recs('offers2').find(r => r.id === id); return !o || o._arch || ['Accepted', 'Declined'].includes(o.status) }],
      ['exit', 'Exit', () => live('exit').filter(x => x.status !== 'Completed' && dayDiff(tdy(), x.lwd) <= 7 && (x.assets === 'Pending' || x.ff !== 'Paid')), x => ({ title: `Complete exit clearance for ${empText(x.emp)}`, emp: x.emp, due: x.lwd, src: `Exit ${x.id}`, pri: 'High' }), (a, id) => { const x = recs('exit').find(r => r.id === id); return !x || x._arch || x.status === 'Completed' || (x.assets !== 'Pending' && x.ff === 'Paid') }],
      ['renew', 'Compliance', () => [...live('vendors').filter(v => v.status === 'Active' && v.end && dayDiff(tdy(), v.end) <= 30), ...live('licences').filter(l => l.valid && dayDiff(tdy(), l.valid) <= 30)], r => ({ title: r.cat ? `Renew or close vendor contract: ${r.name}` : `Renew ${r.name} (${r.no})`, due: r.end || r.valid, src: `${r.cat ? 'Vendor' : 'Licence'} ${r.id}` }), (x, id) => { const r = recs('vendors').find(y => y.id === id) || recs('licences').find(y => y.id === id); return !r || r._arch || (r.cat ? (r.status !== 'Active' || dayDiff(tdy(), r.end) > 30) : dayDiff(tdy(), r.valid) > 30) }],
      ['chk', 'Performance', () => MEMP().filter(e => !['Exited'].includes(e.status) && live('goals').some(g => g.emp === e.id && ['Active', 'At risk'].includes(g.status)) && !live('checkins').some(c => c.emp === e.id && c.status === 'Completed' && dayDiff(c.date, tdy()) <= 60) && e.doj && dayDiff(e.doj, tdy()) > 60), e => ({ title: `Schedule a check-in with ${empText(e.id)}`, emp: e.id, due: addDays(tdy(), 7), src: `Employee ${e.id}`, key: e.id + '|' + tdy().slice(0, 7) }), (x, id) => live('checkins').some(c => c.emp === id.split('|')[0] && c.status === 'Completed' && dayDiff(c.date, tdy()) <= 60)]
    ];
    function runRules(){}
    const dueActions = ()=>COMPUTED.dueActions||0;

    /* ---------- Access control ---------- */
    V.m_access = () => {
      const vr = realRole(); if (vr !== 'HR Admin') return head('Access control', 'Only HR Admin can manage roles.', '');
      const MX = [['Goals and check-ins', 'perf'], ['Improvement plans (PIP)', 'pip'], ['Promotion nominations and proposed pay', 'promo'], ['Succession planning', 'succ'], ['Career plans (IDP)', 'idp'], ['Workforce analytics', 'wfa'], ['Pay cost', 'pay'], ['Engagement results', 'eng'], ['Retention risk', 'risk'], ['Compliance dashboard', 'comp'], ['Action tracker', 'act']];
      const lbl = { all: 'All', team: 'Own + team', teamx: 'Team (not self)', own: 'Own', ownshared: 'Own, once shared', assigned: 'Assigned only', view: 'View all', summary: 'Totals only', pay: 'Pay cost only', statutory: 'Statutory only', scores: 'Scores only', respond: 'Respond to surveys', none: '—' };
      return head('Access control', 'Link each login to an Employee ID and give it a role. Roles decide which advanced HR data that person can see.', `<label class="viewas">View as <select class="input" onchange="setViewAs(this.value)"><option value="">Myself (HR Admin)</option>${ROLES.filter(r => r !== 'HR Admin').map(r => `<option ${VIEWAS === r ? 'selected' : ''}>${r}</option>`).join('')}</select></label>`) +
        (VIEWAS ? `<div class="banner">${ic('eye')}<span>Previewing as <b>${esc(VIEWAS)}</b>. Menus and data now show what that role sees. Switch back with “View as”.</span></div>` : '') +
        `<div class="card rv"><div class="table-wrap"><table class="rtable"><thead><tr><th>Login</th><th>Role</th><th>Linked Employee ID</th><th>Last sign-in</th></tr></thead><tbody>${S.accounts.map(a => { const c = R.settings.acc[a.email] || {}; const role = c.role || (a.role === 'HR Admin' ? 'HR Admin' : 'Employee'); return `<tr><td>${who(a.name, a.email)}</td><td><select class="input" aria-label="Role for ${esc(a.name)}" ${a.email === USER.email ? 'disabled title="You can’t change your own role"' : ''} onchange="setAcc('${a.email}','role',this.value)">${ROLES.map(r => `<option ${r === role ? 'selected' : ''}>${r}</option>`).join('')}</select></td><td><select class="input" aria-label="Employee for ${esc(a.name)}" onchange="setAcc('${a.email}','emp',this.value)"><option value="">Not linked</option>${MEMP().map(e => `<option value="${e.id}" ${c.emp === e.id ? 'selected' : ''}>${esc(empName(e))} (${e.id})</option>`).join('')}</select></td><td class="muted">${esc(a.last || 'Never')}</td></tr>` }).join('')}</tbody></table></div><div class="rfoot"><span>${S.accounts.length} logins</span><span>Role changes apply at the person’s next page load and are logged.</span></div></div>
  <div class="mt">${card('What each role can see', `<div class="table-wrap"><table class="matrix"><thead><tr><th>Data</th>${ROLES.map(r => `<th>${r}</th>`).join('')}</tr></thead><tbody>${MX.map(([n, k]) => `<tr><td><b>${n}</b></td>${ROLES.map(r => `<td class="${ACC[k][r] === 'none' ? 'muted' : ''}">${lbl[ACC[k][r]]}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="muted" style="font-size:12.5px;margin:12px 0 0">Managers never see their own rating, nomination or PIP through the team view. Opening any confidential record is logged. Exports follow the same rules.</p>`)}</div>
  <div class="banner mt" style="background:var(--info-bg);border-color:color-mix(in srgb,var(--brand) 25%,transparent)">${ic('shield')}<span>In this browser-only version, these rules hide data on screen. Full protection needs the server database in the spec, where the server checks the role before sending any data.</span></div>`
    };
    function setAcc(email, k, v) { const c = R.settings.acc[email] = R.settings.acc[email] || {}; const a = S.accounts.find(x => x.email === email); if (k === 'role' && !c.role) c.role = a.role === 'HR Admin' ? 'HR Admin' : 'Employee'; c[k] = v; raudit(`${k === 'role' ? 'Role' : 'Employee link'} for ${email} set to ${v || 'none'}`); rsave(); rerender(); toast(k === 'role' ? `${a.name} is now ${v}` : `${a.name} linked to ${v || 'no employee'}`) }

    /* ---------- navigation & hooks ---------- */
    const ADVNAV = [['m_perf', 'Performance management', 'chart', 'perf'], ['m_career', 'Career growth & promotions', 'star', null], ['m_wfa', 'Workforce analytics', 'chart', 'wfa'], ['m_eng', 'Engagement analytics', 'heart', 'eng'], ['m_comp', 'HR compliance dashboard', 'shield', 'comp'], ['m_actions', 'Actions & reminders', 'bell', 'act'], ['m_access', 'Access control', 'gear', '__admin']];
    function advAllowed(k, a) { if (a === '__admin') return realRole() === 'HR Admin' && !VIEWAS; if (k === 'm_career') return ['promo', 'idp', 'succ'].some(x => scopeOf(x) !== 'none'); return scopeOf(a) !== 'none' }
    function syncAdvNav() {
      ['admin', 'employee'].forEach(r => {
        if (!NAV[r]?.plus) return;
        const P = NAV[r].plus;
        const gi = P.findIndex(g => g[0] === 'Advanced HR');
        if (gi >= 0) P.splice(gi, 1);
      });
    }
    const _enter = enter; enter = function (a, f) { USER = { email: a.email, name: a.name, role: a.role }; VIEWAS = null; syncAdvNav(); _enter(a, f); runRules() };
    const _renderNav = renderNav; renderNav = function () { _renderNav(); if (!USER) return; const n = dueActions(); if (n && !document.querySelector('#bell .dot')) document.getElementById('bell').insertAdjacentHTML('beforeend', '<span class="dot"></span>'); document.getElementById('bell').title = n ? `${n} HR action${n > 1 ? 's' : ''} due` : 'Notifications' };
    const _notifs = notifs; notifs = function () { if (dueActions() && ADVNAV.some(x => x[0] === 'm_actions') && navItems().some(x => x[0] === 'm_actions')) { TAB.actView = canHR() ? 'All' : 'My actions'; CURAPP = 'plus'; go('m_actions'); return } _notifs() };
    const _regShow = regShow; regShow = function (k, id) { const r = recs(k).find(x => x.id === id); if (r && REG[k].acc && !canSeeRec(k, r)) { toast('You don’t have access to this record'); return } if (r) logConf(k, r); _regShow(k, id); if (r && REG[k].acc && !canEditRec(k, r)) document.querySelectorAll('#drawer .mfoot .btn').forEach(b => { if (!/Restore/.test(b.textContent)) b.remove() }) };


    /* ---------- Advanced HR tiles on dashboards ---------- */
    function advTiles() {
      if (!USER) return ''; const items = ADVNAV.filter(([k, , , a]) => advAllowed(k, a)); if (!items.length) return '';
      const M = {
        m_perf: () => { const g = live('goals').filter(r => canSeeRec('goals', r)); const od = live('appraisal').filter(a => effSt(REG.appraisal, a) === 'Overdue' && empVisible('perf', a.emp)).length; return [g.length, 'goals tracked', `${od} overdue review${od === 1 ? '' : 's'}`] },
        m_career: () => { const n = live('promos').filter(r => canSeeRec('promos', r) && !['Rejected', 'Effected'].includes(r.status)).length; const e = scopeOf('promo') === 'none' ? null : MEMP().filter(x => x.status !== 'Exited' && eligibility(x.id).ok).length; return [n, 'open nominations', e === null ? `${live('idps').filter(r => canSeeRec('idps', r)).length} career plans` : `${e} eligible for promotion`] },
        m_wfa: () => { const a = MEMP().filter(e => e.status !== 'Exited'); return [a.length, 'active employees', `${a.filter(e => e.status === 'Probation').length} on probation`] },
        m_eng: () => { const o = live('surveys').filter(x => x.status === 'Open').length; return [o, 'open survey' + (o === 1 ? '' : 's'), `${R.data.resp.length} responses so far`] },
        m_comp: () => { if (scopeOf('comp') === 'none') return ['—', '', '']; const A = compAreas().filter(a => a.score !== null); const ov = A.length ? Math.round(A.reduce((x, a) => x + a.score, 0) / A.length) + '%' : '—'; return [ov, 'compliant', `${compAreas().reduce((x, a) => x + a.gaps.length, 0)} open gaps`] },
        m_actions: () => { const v = live('actions').filter(r => canSeeRec('actions', r) && !['Done', 'Cancelled'].includes(r.status)); return [dueActions(), 'due or overdue', `${v.length} open actions`] },
        m_access: () => { const n = Object.values(R.settings.acc).filter(a => a.emp).length; return [n, 'logins linked', `${S.accounts.length} logins in total`] }
      };
      const C = { m_perf: '#0B6FDB', m_career: '#7C5CFF', m_wfa: '#0F9F6E', m_eng: '#D9466F', m_comp: '#E07A1D', m_actions: '#0BA6CC', m_access: '#5B6787' };
      return `${items.map(([k, l, i]) => { let m; try { m = M[k]() } catch (e) { m = ['—', '', ''] } return `<button class="appcard" style="--c:${C[k]}" onclick="CURAPP='plus';go('${k}')"><div class="t"><i>${ic(i)}</i><b>${esc(l)}</b><span class="go">${ic('arrow', 16)}</span></div><div class="m">${m[0]}<small>${esc(m[1])}</small></div><p>${esc(m[2])}</p></button>` }).join('')}`
    }


    function plusMetric() {
      const items = USER ? ADVNAV.filter(([k, , , a]) => advAllowed(k, a) && k !== 'm_access') : []; const due = items.length ? dueActions() : 0;
      if (!items.length) return { v: '—', u: '', s: 'Advanced HR tools appear once HR gives you a role' };
      if (scopeOf('comp') !== 'none' && scopeOf('comp') !== 'statutory') { const A = compAreas().filter(a => a.score !== null); const ov = A.length ? Math.round(A.reduce((x, a) => x + a.score, 0) / A.length) + '%' : '—'; return { v: ov, u: 'compliant', s: `${due} HR action${due === 1 ? '' : 's'} due · ${items.length} advanced HR tools` } }
      return { v: due, u: 'actions due', s: `${items.length} tools: performance, career, engagement and more` }
    }
    function openPlusAdv() { const it = ADVNAV.find(([k, , , a]) => advAllowed(k, a)); CURAPP = 'plus'; go(it ? it[0] : home()) }

    /* =================== PALETTE =================== */
    let pItems = [], pSel = 0;
    function openPalette() { document.getElementById('palette').classList.add('on'); document.getElementById('scrim').classList.add('on'); const q = document.getElementById('pq'); q.value = ''; renderPalette(''); q.focus() }
    function renderPalette(q) {
      q = q.toLowerCase();
      const pages = [...APPS.map(([k, n]) => ({ g: 'Apps', label: n, hint: 'Open app', run: () => openApp(k) })), ...Object.entries(NAV[S.role]).flatMap(([a, gs]) => gs.flatMap(g => g[1]).map(([k, l]) => ({ g: 'Pages', label: l, hint: APP(a)[1], run: () => { CURAPP = a; go(k) } })))];
      const A = isAdmin() ? [['Add employee', addEmp], ['Post a job', () => editJob()], ['Post announcement', () => postAnn()], ['Open approvals inbox', () => go('approvals')], ['Run payroll', () => go('payrollAdmin')], ['Sign out', logout]] : [['Apply for leave', applyLeave], ['Claim an expense', claimExpense], ['Raise an HR request', () => raiseTicket()], ['Request a letter', requestLetter], ['Regularise attendance', requestReg], ['Sign out', logout]];
      const acts = A.map(([l, f]) => ({ g: 'Actions', label: l, hint: 'Action', run: f }));
      const ppl = S.employees.map(e => ({ g: 'People', label: e.name, hint: e.role, run: () => { if (isAdmin()) { go('employees'); empDrawer(e.id) } else { go('directory'); miniProfile(e.id) } } }));
      pItems = [...acts, ...pages, ...ppl].filter(i => !q || (i.label + i.hint).toLowerCase().includes(q)).slice(0, 14); pSel = 0;
      let last = ''; document.getElementById('plist').innerHTML = pItems.length ? pItems.map((it, i) => { const h = it.g !== last ? `<div class="grp">${it.g}</div>` : ''; last = it.g; return h + `<li class="${i === pSel ? 'sel' : ''}" onclick="runP(${i})">${esc(it.label)}<span>${esc(it.hint)}</span></li>` }).join('') : `<div class="empty">Nothing found for “${esc(q)}”.</div>`
    }
    function runP(i) { const it = pItems[i]; closeAll(); it && setTimeout(it.run, 10) }
    document.getElementById('pq').addEventListener('input', e => renderPalette(e.target.value));
    document.getElementById('pq').addEventListener('keydown', e => { if (!pItems.length) return; if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); pSel = (pSel + (e.key === 'ArrowDown' ? 1 : -1) + pItems.length) % pItems.length; document.querySelectorAll('#plist li').forEach((li, i) => li.classList.toggle('sel', i === pSel)) } if (e.key === 'Enter') runP(pSel) });
    document.addEventListener('keydown', e => { if (USER && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette() } if (e.key === 'Escape') closeAll() });

    /* =================== THEME & TOAST =================== */
    function effTheme() { return document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') }
    function paintTheme() { const d = effTheme() === 'dark', b = document.getElementById('themeBtn'); b.innerHTML = ic(d ? 'sun' : 'moon'); b.setAttribute('aria-label', d ? 'Switch to light theme' : 'Switch to dark theme'); const l = document.getElementById('lthemeBtn'); if (l) { l.innerHTML = b.innerHTML; l.setAttribute('aria-label', b.getAttribute('aria-label')) } }
    function toggleTheme() { const n = effTheme() === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = n; try { localStorage.setItem('bc-theme', n) } catch (e) { } paintTheme() }
    try { const t = localStorage.getItem('bc-theme'); if (t) document.documentElement.dataset.theme = t } catch (e) { }
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', paintTheme);
    let tt; function toast(m) { const t = document.getElementById('toast'); t.querySelector('span').textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2800) }


function recordedTimeToHire(){const days=live('cands').filter(c=>c.stage==='Joined'&&c.empId&&c._c).map(c=>dayDiff(c._c.slice(0,10),empById(c.empId)?.doj||'')).filter(n=>n>=0&&Number.isFinite(n));return days.length?(days.reduce((a,n)=>a+n,0)/days.length).toFixed(1)+' days':'—'}
function recordedHeadcountTrend(){const now=new Date();return [...Array(6)].map((_,i)=>{const d=new Date(now.getFullYear(),now.getMonth()+i-4,0),end=localISO(d);return[d.toLocaleDateString('en-US',{month:'short'}),S.employees.filter(e=>e.joined&&e.joined<=end&&!live('exit').some(x=>x.emp===e.id&&x.status==='Completed'&&x.lwd<=end)&&(e.status!=='Inactive'||live('exit').some(x=>x.emp===e.id&&x.lwd>end))).length]})}
const attendanceView=V.attendanceAdmin;V.attendanceAdmin=()=>{const T=['Today','Regularisation','Shifts','Monthly report'],t=tabOf('attendanceAdmin',T);if(['Regularisation','Shifts'].includes(t))return attendanceView();const L=(COMPUTED.attendance||[]).filter(r=>t==='Today'?r.date===tdy():r.date.startsWith(tdy().slice(0,7)));return head('Attendance & shifts','Attendance from saved time logs and register records.')+tabs('attendanceAdmin',T)+card(t==='Today'?'Today':tdy().slice(0,7)+' attendance',tbl([['Employee',r=>empCell(r.emp)],['Date',r=>fd(r.date)],['Clock in',r=>esc(r.in||'—')],['Clock out',r=>esc(r.out||'—')],['Hours',r=>esc(r.hours||'—')],['Mark',r=>pill(r.mark)]],L,'No attendance records for this period.'))};
V.myAttendance=()=>head('Attendance','Your saved time logs and regularisation requests.',btn('Request regularisation','requestReg()'))+'<div class="card hero"><h2>Today</h2>'+clockCard()+'</div><div class="mt">'+card('My time logs',tbl([['Date',r=>fd(r.date)],['Clock in',r=>esc(r.login)],['Clock out',r=>esc(r.logout||'—')],['Hours',r=>esc(r.hours||'—')]],COMPUTED.logs||[],'No saved time logs.'))+'</div>'+card('My regularisation requests',tbl([['Date',r=>fd(r.date)],['Clock in',r=>esc(r.in)],['Clock out',r=>esc(r.out)],['Status',r=>pill(r.status)]],S.regs.filter(r=>r.emp===ME),'No regularisation requests.'));
const payView=V.myPay;V.myPay=()=>{const T=['Payslip','History','Tax declarations','Salary structure'],t=tabOf('myPay',T),e=me(),L=(COMPUTED.payslips||[]).filter(r=>r.emp===e.id).sort((a,b)=>b.month.localeCompare(a.month));if(t==='Salary structure')return payView();let b='';if(t==='History')b=card('Payslip history',tbl([['Month',r=>esc(r.month)],['Issued',r=>fd(r.issued)],['Net pay',r=>inr(r.net)],['',r=>btn('Download CSV',"downloadPayslip('"+r.id+"')",'sm')]],L,'No recorded payslips.'));if(t==='Payslip'){const r=L[0],v=r?.calculation||salary(e);b=card(r?'Recorded payslip, '+r.month:'Current salary estimate',tbl([['Component',x=>esc(x[0])],['Amount',x=>inr(x[1])]],[...(v.earn||[]),['Gross earnings',v.gross],...(v.ded||[]).map(x=>[x[0],-x[1]]),['Net pay',v.net]]),r?btn('Download CSV',"downloadPayslip('"+r.id+"')",'sm'):'No payroll snapshot has been recorded yet.');}if(t==='Tax declarations'){const d=S.decl[ME];b=card('Investment declarations '+pill(d.status),tbl([['Declaration',r=>esc(r[0])],['Amount entered',r=>inr(r[1])]],Object.entries(d).filter(([k,v])=>typeof v==='number')),btn('Update declarations','editDecl()','sm'));}return head('Payslips & tax','Recorded payslips and editable investment declarations.')+tabs('myPay',T)+b};
function downloadPayslip(id){const r=(COMPUTED.payslips||[]).find(r=>r.id===id);if(!r)return;csvDownload('payslip-'+r.month+'-'+r.emp+'.csv',[['Employee ID','Month','Component','Amount'],...(r.calculation?.earn||[]).map(x=>[r.emp,r.month,x[0],x[1]]),...(r.calculation?.ded||[]).map(x=>[r.emp,r.month,x[0],-x[1]]),[r.emp,r.month,'Net pay',r.net]])}
function openMoneySettings(id=''){MONEY_PRESET=id;TAB.settings='Money calculations';go('settings')}
let MONEY_PRESET='';
const settingsView=V.settings;V.settings=()=>tabOf('settings',['Company','User accounts','Roles & permissions','Approval workflows','Notifications','Data','Money calculations'])==='Money calculations'?head('Settings & access','Company setup, permissions, approval chains and notifications.')+tabs('settings',['Company','User accounts','Roles & permissions','Approval workflows','Notifications','Data','Money calculations'])+'<div id="money-settings"></div>':settingsView();
const settingsAfter=AFTER.settings;AFTER.settings=()=>{if(settingsAfter)settingsAfter();const root=document.getElementById('money-settings');if(root)void mountMoney(root,{adopt:value=>bridge.adopt(value),flush:()=>bridge.flush()},MONEY_PRESET)};
const payrollView=V.payrollAdmin;V.payrollAdmin=()=>{const money=btn('Money calculations',"openMoneySettings()",'', 'gear');if(tabOf('payrollAdmin',['Run payroll','Salary register','Statutory compliance','History'])==='Statutory compliance')return head('Payroll','Recorded statutory amounts and filings.',money)+tabs('payrollAdmin',['Run payroll','Salary register','Statutory compliance','History'])+card('Recorded PF / ESI',tbl([['Scheme',r=>esc(r.scheme)],['Month',r=>esc(r.month)],['Employee share',r=>inr(r.ee)],['Employer share',r=>inr(r.er)],['Total',r=>inr(r.total)],['Status',r=>pill(r.status)]],live('pfesi'),'No recorded contributions. Add values in the PF / ESI register.'),btn('Open PF / ESI',"go('m_pfesi')",'sm'))+card('Statutory filings',tbl([['Item',r=>esc(r.item)],['Period',r=>esc(r.period)],['Due',r=>fd(r.due)],['Status',r=>pill(r.status)]],live('statutory'),'No filings recorded.'),btn('Open filings',"go('m_statutory')",'sm'));return '<div style="display:flex;justify-content:flex-end;margin-bottom:10px">'+money+'</div>'+payrollView()};
function reconcile(target,source){if(Array.isArray(source)){const key=(v,i)=>v&&typeof v==='object'&&!Array.isArray(v)?(v.id||v.email||v.n||v.tag||(v.emp&&v.doc?v.emp+'|'+v.doc:null)||i):i;const old=new Map((Array.isArray(target)?target:[]).map((v,i)=>[key(v,i),v]));return source.map((v,i)=>reconcile(old.get(key(v,i)),v))}if(source&&typeof source==='object'){const out=target&&typeof target==='object'&&!Array.isArray(target)?target:{};for(const k of Object.keys(out))if(!(k in source))delete out[k];for(const[k,v]of Object.entries(source))out[k]=reconcile(out[k],v);return out}return source}
function hydrate(value){applyRegistry(value.registry);S=reconcile(S,value.demo);R=reconcile(R,value.live);RSAVED=R.saved||null;COMPUTED=value.computed||{};USER=value.user;VIEWAS=value.access?.realRole==='HR Admin'&&value.access.curRole!==value.access.realRole?value.access.curRole:null;if(USER){S.role=USER.role==='HR Admin'?'admin':'employee';if(S.role==='admin')ADMIN=USER.name;else ME=USER.name;ensureUser(USER.name)}syncAdvNav()}
function applyRegistry(metadata){if(!metadata)return;for(const[k,d]of Object.entries(metadata)){if(!REG[k])continue;for(const[name,value]of Object.entries(d)){if(name==='f'){for(const field of value){const own=REG[k].f.find(f=>f.k===field.k);if(own)Object.assign(own,field)}}else if(name!=='defaults')REG[k][name]=value}}}
async function setViewAs(value){try{await bridge.flush();const next=await bridge.viewas(value||null);hydrate(next);rerender();toast(VIEWAS?'Previewing as '+VIEWAS:'Back to your own access')}catch(error){toast(error.message)}}
function downloadJSON(data,name){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,1)],{type:'application/json'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
Object.defineProperty(window,"I",{configurable:true,get:()=>I});
Object.defineProperty(window,"ic",{configurable:true,get:()=>ic});
Object.defineProperty(window,"AVC",{configurable:true,get:()=>AVC});
Object.defineProperty(window,"avc",{configurable:true,get:()=>avc});
Object.defineProperty(window,"ini",{configurable:true,get:()=>ini});
Object.defineProperty(window,"av",{configurable:true,get:()=>av});
Object.defineProperty(window,"inr",{configurable:true,get:()=>inr});
Object.defineProperty(window,"esc",{configurable:true,get:()=>esc});
Object.defineProperty(window,"todayISO",{configurable:true,get:()=>todayISO});
Object.defineProperty(window,"fd",{configurable:true,get:()=>fd});
Object.defineProperty(window,"fdShort",{configurable:true,get:()=>fdShort});
Object.defineProperty(window,"uid",{configurable:true,get:()=>uid});
Object.defineProperty(window,"weekdays",{configurable:true,get:()=>weekdays,set:v=>{weekdays=v}});
Object.defineProperty(window,"PILL",{configurable:true,get:()=>PILL});
Object.defineProperty(window,"pill",{configurable:true,get:()=>pill});
Object.defineProperty(window,"BANDV",{configurable:true,get:()=>BANDV});
Object.defineProperty(window,"head",{configurable:true,get:()=>head});
Object.defineProperty(window,"btn",{configurable:true,get:()=>btn});
Object.defineProperty(window,"stat",{configurable:true,get:()=>stat});
Object.defineProperty(window,"bar",{configurable:true,get:()=>bar});
Object.defineProperty(window,"tbl",{configurable:true,get:()=>tbl,set:v=>{tbl=v}});
Object.defineProperty(window,"card",{configurable:true,get:()=>card});
Object.defineProperty(window,"who",{configurable:true,get:()=>who});
Object.defineProperty(window,"TAB",{configurable:true,get:()=>TAB});
Object.defineProperty(window,"tabs",{configurable:true,get:()=>tabs,set:v=>{tabs=v}});
Object.defineProperty(window,"tabOf",{configurable:true,get:()=>tabOf});
Object.defineProperty(window,"ME",{configurable:true,get:()=>ME,set:v=>{ME=v}});
Object.defineProperty(window,"ADMIN",{configurable:true,get:()=>ADMIN,set:v=>{ADMIN=v}});
Object.defineProperty(window,"USER",{configurable:true,get:()=>USER,set:v=>{USER=v}});
Object.defineProperty(window,"seed",{configurable:true,get:()=>seed,set:v=>{seed=v}});
Object.defineProperty(window,"S",{configurable:true,get:()=>S,set:v=>{S=v}});
Object.defineProperty(window,"mail",{configurable:true,get:()=>mail});
Object.defineProperty(window,"addAccount",{configurable:true,get:()=>addAccount,set:v=>{addAccount=v}});
Object.defineProperty(window,"initAccounts",{configurable:true,get:()=>initAccounts,set:v=>{initAccounts=v}});
Object.defineProperty(window,"STATE_V",{configurable:true,get:()=>STATE_V});
Object.defineProperty(window,"migrate",{configurable:true,get:()=>migrate,set:v=>{migrate=v}});
Object.defineProperty(window,"ensureUser",{configurable:true,get:()=>ensureUser,set:v=>{ensureUser=v}});
Object.defineProperty(window,"save",{configurable:true,get:()=>save,set:v=>{save=v}});
Object.defineProperty(window,"log",{configurable:true,get:()=>log,set:v=>{log=v}});
Object.defineProperty(window,"emp",{configurable:true,get:()=>emp});
Object.defineProperty(window,"me",{configurable:true,get:()=>me});
Object.defineProperty(window,"deptNames",{configurable:true,get:()=>deptNames});
Object.defineProperty(window,"used",{configurable:true,get:()=>used});
Object.defineProperty(window,"jobT",{configurable:true,get:()=>jobT});
Object.defineProperty(window,"isAdmin",{configurable:true,get:()=>isAdmin});
Object.defineProperty(window,"APPS",{configurable:true,get:()=>APPS});
Object.defineProperty(window,"APP",{configurable:true,get:()=>APP});
Object.defineProperty(window,"NAV",{configurable:true,get:()=>NAV});
Object.defineProperty(window,"current",{configurable:true,get:()=>current,set:v=>{current=v}});
Object.defineProperty(window,"CURAPP",{configurable:true,get:()=>CURAPP,set:v=>{CURAPP=v}});
Object.defineProperty(window,"navItems",{configurable:true,get:()=>navItems});
Object.defineProperty(window,"appOf",{configurable:true,get:()=>appOf});
Object.defineProperty(window,"home",{configurable:true,get:()=>home});
Object.defineProperty(window,"pendingAll",{configurable:true,get:()=>pendingAll,set:v=>{pendingAll=v}});
Object.defineProperty(window,"appBadge",{configurable:true,get:()=>appBadge,set:v=>{appBadge=v}});
Object.defineProperty(window,"renderNav",{configurable:true,get:()=>renderNav,set:v=>{renderNav=v}});
Object.defineProperty(window,"go",{configurable:true,get:()=>go,set:v=>{go=v}});
Object.defineProperty(window,"openApp",{configurable:true,get:()=>openApp,set:v=>{openApp=v}});
Object.defineProperty(window,"openLauncher",{configurable:true,get:()=>openLauncher,set:v=>{openLauncher=v}});
Object.defineProperty(window,"rerender",{configurable:true,get:()=>rerender,set:v=>{rerender=v}});
Object.defineProperty(window,"SKEY",{configurable:true,get:()=>SKEY});
Object.defineProperty(window,"LVIEW",{configurable:true,get:()=>LVIEW,set:v=>{LVIEW=v}});
Object.defineProperty(window,"LMSG",{configurable:true,get:()=>LMSG,set:v=>{LMSG=v}});
Object.defineProperty(window,"readSession",{configurable:true,get:()=>readSession,set:v=>{readSession=v}});
Object.defineProperty(window,"writeSession",{configurable:true,get:()=>writeSession,set:v=>{writeSession=v}});
Object.defineProperty(window,"clearSession",{configurable:true,get:()=>clearSession,set:v=>{clearSession=v}});
Object.defineProperty(window,"canLogin",{configurable:true,get:()=>canLogin,set:v=>{canLogin=v}});
Object.defineProperty(window,"boot",{configurable:true,get:()=>boot,set:v=>{boot=v}});
Object.defineProperty(window,"showLogin",{configurable:true,get:()=>showLogin,set:v=>{showLogin=v}});
Object.defineProperty(window,"renderLogin",{configurable:true,get:()=>renderLogin,set:v=>{renderLogin=v}});
Object.defineProperty(window,"fillDemo",{configurable:true,get:()=>fillDemo,set:v=>{fillDemo=v}});
Object.defineProperty(window,"doLogin",{configurable:true,get:()=>doLogin,set:v=>{doLogin=v}});
Object.defineProperty(window,"forgot",{configurable:true,get:()=>forgot,set:v=>{forgot=v}});
Object.defineProperty(window,"enter",{configurable:true,get:()=>enter,set:v=>{enter=v}});
Object.defineProperty(window,"logout",{configurable:true,get:()=>logout,set:v=>{logout=v}});
Object.defineProperty(window,"toggleSide",{configurable:true,get:()=>toggleSide,set:v=>{toggleSide=v}});
Object.defineProperty(window,"notifs",{configurable:true,get:()=>notifs,set:v=>{notifs=v}});
Object.defineProperty(window,"FORM_CB",{configurable:true,get:()=>FORM_CB,set:v=>{FORM_CB=v}});
Object.defineProperty(window,"form",{configurable:true,get:()=>form,set:v=>{form=v}});
Object.defineProperty(window,"confirmBox",{configurable:true,get:()=>confirmBox,set:v=>{confirmBox=v}});
Object.defineProperty(window,"modal",{configurable:true,get:()=>modal,set:v=>{modal=v}});
Object.defineProperty(window,"drawer",{configurable:true,get:()=>drawer,set:v=>{drawer=v}});
Object.defineProperty(window,"closeAll",{configurable:true,get:()=>closeAll,set:v=>{closeAll=v}});
Object.defineProperty(window,"decide",{configurable:true,get:()=>decide,set:v=>{decide=v}});
Object.defineProperty(window,"approveBtns",{configurable:true,get:()=>approveBtns});
Object.defineProperty(window,"applyLeave",{configurable:true,get:()=>applyLeave,set:v=>{applyLeave=v}});
Object.defineProperty(window,"raiseTicket",{configurable:true,get:()=>raiseTicket,set:v=>{raiseTicket=v}});
Object.defineProperty(window,"tick",{configurable:true,get:()=>tick,set:v=>{tick=v}});
Object.defineProperty(window,"toggleClock",{configurable:true,get:()=>toggleClock,set:v=>{toggleClock=v}});
Object.defineProperty(window,"clockUI",{configurable:true,get:()=>clockUI,set:v=>{clockUI=v}});
Object.defineProperty(window,"clockCard",{configurable:true,get:()=>clockCard});
Object.defineProperty(window,"salary",{configurable:true,get:()=>salary,set:v=>{salary=v}});
Object.defineProperty(window,"V",{configurable:true,get:()=>V});
Object.defineProperty(window,"AFTER",{configurable:true,get:()=>AFTER});
Object.defineProperty(window,"editMe",{configurable:true,get:()=>editMe,set:v=>{editMe=v}});
Object.defineProperty(window,"depCard",{configurable:true,get:()=>depCard,set:v=>{depCard=v}});
Object.defineProperty(window,"addDep",{configurable:true,get:()=>addDep,set:v=>{addDep=v}});
Object.defineProperty(window,"removeDep",{configurable:true,get:()=>removeDep,set:v=>{removeDep=v}});
Object.defineProperty(window,"requestReg",{configurable:true,get:()=>requestReg,set:v=>{requestReg=v}});
Object.defineProperty(window,"cancelLeave",{configurable:true,get:()=>cancelLeave,set:v=>{cancelLeave=v}});
Object.defineProperty(window,"editDecl",{configurable:true,get:()=>editDecl,set:v=>{editDecl=v}});
Object.defineProperty(window,"claimExpense",{configurable:true,get:()=>claimExpense,set:v=>{claimExpense=v}});
Object.defineProperty(window,"withdrawExp",{configurable:true,get:()=>withdrawExp,set:v=>{withdrawExp=v}});
Object.defineProperty(window,"setGoal",{configurable:true,get:()=>setGoal,set:v=>{setGoal=v}});
Object.defineProperty(window,"addGoal",{configurable:true,get:()=>addGoal,set:v=>{addGoal=v}});
Object.defineProperty(window,"selfReview",{configurable:true,get:()=>selfReview,set:v=>{selfReview=v}});
Object.defineProperty(window,"giveFeedback",{configurable:true,get:()=>giveFeedback,set:v=>{giveFeedback=v}});
Object.defineProperty(window,"learn",{configurable:true,get:()=>learn,set:v=>{learn=v}});
Object.defineProperty(window,"refer",{configurable:true,get:()=>refer,set:v=>{refer=v}});
Object.defineProperty(window,"applyInternal",{configurable:true,get:()=>applyInternal,set:v=>{applyInternal=v}});
Object.defineProperty(window,"dirFilter",{configurable:true,get:()=>dirFilter,set:v=>{dirFilter=v}});
Object.defineProperty(window,"miniProfile",{configurable:true,get:()=>miniProfile,set:v=>{miniProfile=v}});
Object.defineProperty(window,"orgTree",{configurable:true,get:()=>orgTree,set:v=>{orgTree=v}});
Object.defineProperty(window,"ackPolicy",{configurable:true,get:()=>ackPolicy,set:v=>{ackPolicy=v}});
Object.defineProperty(window,"uploadDoc",{configurable:true,get:()=>uploadDoc,set:v=>{uploadDoc=v}});
Object.defineProperty(window,"requestLetter",{configurable:true,get:()=>requestLetter,set:v=>{requestLetter=v}});
Object.defineProperty(window,"requestAsset",{configurable:true,get:()=>requestAsset,set:v=>{requestAsset=v}});
Object.defineProperty(window,"viewTicket",{configurable:true,get:()=>viewTicket,set:v=>{viewTicket=v}});
Object.defineProperty(window,"addNote",{configurable:true,get:()=>addNote,set:v=>{addNote=v}});
Object.defineProperty(window,"submitRes",{configurable:true,get:()=>submitRes,set:v=>{submitRes=v}});
Object.defineProperty(window,"withdrawRes",{configurable:true,get:()=>withdrawRes,set:v=>{withdrawRes=v}});
Object.defineProperty(window,"bulkApprove",{configurable:true,get:()=>bulkApprove,set:v=>{bulkApprove=v}});
Object.defineProperty(window,"calcTenure",{configurable:true,get:()=>calcTenure,set:v=>{calcTenure=v}});
Object.defineProperty(window,"syncEmployeeStores",{configurable:true,get:()=>syncEmployeeStores,set:v=>{syncEmployeeStores=v}});
Object.defineProperty(window,"MASK_STATE",{configurable:true,get:()=>MASK_STATE,set:v=>{MASK_STATE=v}});
Object.defineProperty(window,"toggleMaskVal",{configurable:true,get:()=>toggleMaskVal,set:v=>{toggleMaskVal=v}});
Object.defineProperty(window,"copyEmpId",{configurable:true,get:()=>copyEmpId,set:v=>{copyEmpId=v}});
Object.defineProperty(window,"resetMasterFilters",{configurable:true,get:()=>resetMasterFilters,set:v=>{resetMasterFilters=v}});
Object.defineProperty(window,"filterMasterData",{configurable:true,get:()=>filterMasterData,set:v=>{filterMasterData=v}});
Object.defineProperty(window,"empMasterDrawer",{configurable:true,get:()=>empMasterDrawer,set:v=>{empMasterDrawer=v}});
Object.defineProperty(window,"openAddMasterModal",{configurable:true,get:()=>openAddMasterModal,set:v=>{openAddMasterModal=v}});
Object.defineProperty(window,"calcMasterCtcPreview",{configurable:true,get:()=>calcMasterCtcPreview,set:v=>{calcMasterCtcPreview=v}});
Object.defineProperty(window,"saveMasterEmployee",{configurable:true,get:()=>saveMasterEmployee,set:v=>{saveMasterEmployee=v}});
Object.defineProperty(window,"exportMasterCsv",{configurable:true,get:()=>exportMasterCsv,set:v=>{exportMasterCsv=v}});
Object.defineProperty(window,"importMasterCsv",{configurable:true,get:()=>importMasterCsv,set:v=>{importMasterCsv=v}});
Object.defineProperty(window,"handleMasterCsvFile",{configurable:true,get:()=>handleMasterCsvFile,set:v=>{handleMasterCsvFile=v}});
Object.defineProperty(window,"addEmp",{configurable:true,get:()=>addEmp,set:v=>{addEmp=v}});
Object.defineProperty(window,"editEmp",{configurable:true,get:()=>editEmp,set:v=>{editEmp=v}});
Object.defineProperty(window,"empDrawer",{configurable:true,get:()=>empDrawer,set:v=>{empDrawer=v}});
Object.defineProperty(window,"setStatus",{configurable:true,get:()=>setStatus,set:v=>{setStatus=v}});
Object.defineProperty(window,"reviseSalary",{configurable:true,get:()=>reviseSalary,set:v=>{reviseSalary=v}});
Object.defineProperty(window,"issueLetter",{configurable:true,get:()=>issueLetter,set:v=>{issueLetter=v}});
Object.defineProperty(window,"importCsv",{configurable:true,get:()=>importCsv,set:v=>{importCsv=v}});
Object.defineProperty(window,"editDept",{configurable:true,get:()=>editDept,set:v=>{editDept=v}});
Object.defineProperty(window,"delDept",{configurable:true,get:()=>delDept,set:v=>{delDept=v}});
Object.defineProperty(window,"addGrade",{configurable:true,get:()=>addGrade,set:v=>{addGrade=v}});
Object.defineProperty(window,"addTask",{configurable:true,get:()=>addTask,set:v=>{addTask=v}});
Object.defineProperty(window,"finishOnb",{configurable:true,get:()=>finishOnb,set:v=>{finishOnb=v}});
Object.defineProperty(window,"verifyDoc",{configurable:true,get:()=>verifyDoc,set:v=>{verifyDoc=v}});
Object.defineProperty(window,"initExit",{configurable:true,get:()=>initExit,set:v=>{initExit=v}});
Object.defineProperty(window,"ffCalc",{configurable:true,get:()=>ffCalc,set:v=>{ffCalc=v}});
Object.defineProperty(window,"closeExit",{configurable:true,get:()=>closeExit,set:v=>{closeExit=v}});
Object.defineProperty(window,"editShift",{configurable:true,get:()=>editShift,set:v=>{editShift=v}});
Object.defineProperty(window,"assignShift",{configurable:true,get:()=>assignShift,set:v=>{assignShift=v}});
Object.defineProperty(window,"editLT",{configurable:true,get:()=>editLT,set:v=>{editLT=v}});
Object.defineProperty(window,"addHol",{configurable:true,get:()=>addHol,set:v=>{addHol=v}});
Object.defineProperty(window,"delHol",{configurable:true,get:()=>delHol,set:v=>{delHol=v}});
Object.defineProperty(window,"adjustBal",{configurable:true,get:()=>adjustBal,set:v=>{adjustBal=v}});
Object.defineProperty(window,"leaveOnBehalf",{configurable:true,get:()=>leaveOnBehalf,set:v=>{leaveOnBehalf=v}});
Object.defineProperty(window,"PAYSTEPS",{configurable:true,get:()=>PAYSTEPS});
Object.defineProperty(window,"payStep",{configurable:true,get:()=>payStep,set:v=>{payStep=v}});
Object.defineProperty(window,"payInput",{configurable:true,get:()=>payInput,set:v=>{payInput=v}});
Object.defineProperty(window,"addPlan",{configurable:true,get:()=>addPlan,set:v=>{addPlan=v}});
Object.defineProperty(window,"STAGES",{configurable:true,get:()=>STAGES});
Object.defineProperty(window,"moveCand",{configurable:true,get:()=>moveCand,set:v=>{moveCand=v}});
Object.defineProperty(window,"rejectCand",{configurable:true,get:()=>rejectCand,set:v=>{rejectCand=v}});
Object.defineProperty(window,"editJob",{configurable:true,get:()=>editJob,set:v=>{editJob=v}});
Object.defineProperty(window,"schedInt",{configurable:true,get:()=>schedInt,set:v=>{schedInt=v}});
Object.defineProperty(window,"scorecard",{configurable:true,get:()=>scorecard,set:v=>{scorecard=v}});
Object.defineProperty(window,"sendOffer",{configurable:true,get:()=>sendOffer,set:v=>{sendOffer=v}});
Object.defineProperty(window,"acceptOffer",{configurable:true,get:()=>acceptOffer,set:v=>{acceptOffer=v}});
Object.defineProperty(window,"rate",{configurable:true,get:()=>rate,set:v=>{rate=v}});
Object.defineProperty(window,"newCycle",{configurable:true,get:()=>newCycle,set:v=>{newCycle=v}});
Object.defineProperty(window,"editCourse",{configurable:true,get:()=>editCourse,set:v=>{editCourse=v}});
Object.defineProperty(window,"addAsset",{configurable:true,get:()=>addAsset,set:v=>{addAsset=v}});
Object.defineProperty(window,"assignAsset",{configurable:true,get:()=>assignAsset,set:v=>{assignAsset=v}});
Object.defineProperty(window,"retAsset",{configurable:true,get:()=>retAsset,set:v=>{retAsset=v}});
Object.defineProperty(window,"newPolicy",{configurable:true,get:()=>newPolicy,set:v=>{newPolicy=v}});
Object.defineProperty(window,"newVersion",{configurable:true,get:()=>newVersion,set:v=>{newVersion=v}});
Object.defineProperty(window,"postAnn",{configurable:true,get:()=>postAnn,set:v=>{postAnn=v}});
Object.defineProperty(window,"assignT",{configurable:true,get:()=>assignT,set:v=>{assignT=v}});
Object.defineProperty(window,"setTicket",{configurable:true,get:()=>setTicket,set:v=>{setTicket=v}});
Object.defineProperty(window,"editCompany",{configurable:true,get:()=>editCompany,set:v=>{editCompany=v}});
Object.defineProperty(window,"editWf",{configurable:true,get:()=>editWf,set:v=>{editWf=v}});
Object.defineProperty(window,"setAcctRole",{configurable:true,get:()=>setAcctRole,set:v=>{setAcctRole=v}});
Object.defineProperty(window,"acct",{configurable:true,get:()=>acct,set:v=>{acct=v}});
Object.defineProperty(window,"resetPw",{configurable:true,get:()=>resetPw,set:v=>{resetPw=v}});
Object.defineProperty(window,"resetData",{configurable:true,get:()=>resetData,set:v=>{resetData=v}});
Object.defineProperty(window,"SIGN_OPEN",{configurable:true,get:()=>SIGN_OPEN});
Object.defineProperty(window,"PAYHIST",{configurable:true,get:()=>PAYHIST});
Object.defineProperty(window,"localISO",{configurable:true,get:()=>localISO});
Object.defineProperty(window,"activeCands",{configurable:true,get:()=>activeCands});
Object.defineProperty(window,"courseAud",{configurable:true,get:()=>courseAud});
Object.defineProperty(window,"courseDone",{configurable:true,get:()=>courseDone});
Object.defineProperty(window,"compliance",{configurable:true,get:()=>compliance,set:v=>{compliance=v}});
Object.defineProperty(window,"donut",{configurable:true,get:()=>donut});
Object.defineProperty(window,"payTrend",{configurable:true,get:()=>payTrend});
Object.defineProperty(window,"area",{configurable:true,get:()=>area,set:v=>{area=v}});
Object.defineProperty(window,"appMetrics",{configurable:true,get:()=>appMetrics,set:v=>{appMetrics=v}});
Object.defineProperty(window,"appCard",{configurable:true,get:()=>appCard});
Object.defineProperty(window,"celebrations",{configurable:true,get:()=>celebrations,set:v=>{celebrations=v}});
Object.defineProperty(window,"celebList",{configurable:true,get:()=>celebList});
Object.defineProperty(window,"wish",{configurable:true,get:()=>wish,set:v=>{wish=v}});
Object.defineProperty(window,"signRow",{configurable:true,get:()=>signRow,set:v=>{signRow=v}});
Object.defineProperty(window,"newSign",{configurable:true,get:()=>newSign,set:v=>{newSign=v}});
Object.defineProperty(window,"remindSign",{configurable:true,get:()=>remindSign,set:v=>{remindSign=v}});
Object.defineProperty(window,"voidSign",{configurable:true,get:()=>voidSign,set:v=>{voidSign=v}});
Object.defineProperty(window,"signDoc",{configurable:true,get:()=>signDoc,set:v=>{signDoc=v}});
Object.defineProperty(window,"finishSign",{configurable:true,get:()=>finishSign,set:v=>{finishSign=v}});
Object.defineProperty(window,"PT",{configurable:true,get:()=>PT});
Object.defineProperty(window,"postCard",{configurable:true,get:()=>postCard,set:v=>{postCard=v}});
Object.defineProperty(window,"setPType",{configurable:true,get:()=>setPType,set:v=>{setPType=v}});
Object.defineProperty(window,"addPost",{configurable:true,get:()=>addPost,set:v=>{addPost=v}});
Object.defineProperty(window,"likePost",{configurable:true,get:()=>likePost,set:v=>{likePost=v}});
Object.defineProperty(window,"addComment",{configurable:true,get:()=>addComment,set:v=>{addComment=v}});
Object.defineProperty(window,"WK",{configurable:true,get:()=>WK,set:v=>{WK=v}});
Object.defineProperty(window,"SCODE",{configurable:true,get:()=>SCODE});
Object.defineProperty(window,"scode",{configurable:true,get:()=>scode});
Object.defineProperty(window,"weekDates",{configurable:true,get:()=>weekDates,set:v=>{weekDates=v}});
Object.defineProperty(window,"shiftOn",{configurable:true,get:()=>shiftOn,set:v=>{shiftOn=v}});
Object.defineProperty(window,"chip",{configurable:true,get:()=>chip,set:v=>{chip=v}});
Object.defineProperty(window,"weekNav",{configurable:true,get:()=>weekNav});
Object.defineProperty(window,"cycleShift",{configurable:true,get:()=>cycleShift,set:v=>{cycleShift=v}});
Object.defineProperty(window,"publishRoster",{configurable:true,get:()=>publishRoster,set:v=>{publishRoster=v}});
Object.defineProperty(window,"reqSwap",{configurable:true,get:()=>reqSwap,set:v=>{reqSwap=v}});
Object.defineProperty(window,"RKEY",{configurable:true,get:()=>RKEY});
Object.defineProperty(window,"rload",{configurable:true,get:()=>rload,set:v=>{rload=v}});
Object.defineProperty(window,"R",{configurable:true,get:()=>R,set:v=>{R=v}});
Object.defineProperty(window,"RSAVED",{configurable:true,get:()=>RSAVED,set:v=>{RSAVED=v}});
Object.defineProperty(window,"rsave",{configurable:true,get:()=>rsave,set:v=>{rsave=v}});
Object.defineProperty(window,"raudit",{configurable:true,get:()=>raudit,set:v=>{raudit=v}});
Object.defineProperty(window,"recs",{configurable:true,get:()=>recs});
Object.defineProperty(window,"live",{configurable:true,get:()=>live});
Object.defineProperty(window,"nowISO",{configurable:true,get:()=>nowISO});
Object.defineProperty(window,"tdy",{configurable:true,get:()=>tdy});
Object.defineProperty(window,"fdt",{configurable:true,get:()=>fdt});
Object.defineProperty(window,"addDays",{configurable:true,get:()=>addDays});
Object.defineProperty(window,"addMonths",{configurable:true,get:()=>addMonths});
Object.defineProperty(window,"dayDiff",{configurable:true,get:()=>dayDiff});
Object.defineProperty(window,"nextId",{configurable:true,get:()=>nextId,set:v=>{nextId=v}});
Object.defineProperty(window,"mask",{configurable:true,get:()=>mask});
Object.defineProperty(window,"MEMP",{configurable:true,get:()=>MEMP});
Object.defineProperty(window,"empName",{configurable:true,get:()=>empName});
Object.defineProperty(window,"empById",{configurable:true,get:()=>empById});
Object.defineProperty(window,"empText",{configurable:true,get:()=>empText});
Object.defineProperty(window,"empCell",{configurable:true,get:()=>empCell});
Object.defineProperty(window,"F",{configurable:true,get:()=>F});
Object.defineProperty(window,"LTYPES",{configurable:true,get:()=>LTYPES});
Object.defineProperty(window,"ATT",{configurable:true,get:()=>ATT});
Object.defineProperty(window,"REG",{configurable:true,get:()=>REG});
Object.defineProperty(window,"hrs",{configurable:true,get:()=>hrs});
Object.defineProperty(window,"takenDays",{configurable:true,get:()=>takenDays,set:v=>{takenDays=v}});
Object.defineProperty(window,"effSt",{configurable:true,get:()=>effSt,set:v=>{effSt=v}});
Object.defineProperty(window,"defaultsOf",{configurable:true,get:()=>defaultsOf,set:v=>{defaultsOf=v}});
Object.defineProperty(window,"addRec",{configurable:true,get:()=>addRec,set:v=>{addRec=v}});
Object.defineProperty(window,"show",{configurable:true,get:()=>show,set:v=>{show=v}});
Object.defineProperty(window,"plain",{configurable:true,get:()=>plain,set:v=>{plain=v}});
Object.defineProperty(window,"fieldOf",{configurable:true,get:()=>fieldOf});
Object.defineProperty(window,"cellHTML",{configurable:true,get:()=>cellHTML,set:v=>{cellHTML=v}});
Object.defineProperty(window,"searchText",{configurable:true,get:()=>searchText});
Object.defineProperty(window,"regFiltered",{configurable:true,get:()=>regFiltered,set:v=>{regFiltered=v}});
Object.defineProperty(window,"regView",{configurable:true,get:()=>regView,set:v=>{regView=v}});
Object.defineProperty(window,"regSearch",{configurable:true,get:()=>regSearch,set:v=>{regSearch=v}});
Object.defineProperty(window,"openRec",{configurable:true,get:()=>openRec,set:v=>{openRec=v}});
Object.defineProperty(window,"fOpts",{configurable:true,get:()=>fOpts,set:v=>{fOpts=v}});
Object.defineProperty(window,"fInput",{configurable:true,get:()=>fInput,set:v=>{fInput=v}});
Object.defineProperty(window,"regForm",{configurable:true,get:()=>regForm,set:v=>{regForm=v}});
Object.defineProperty(window,"regSubmit",{configurable:true,get:()=>regSubmit,set:v=>{regSubmit=v}});
Object.defineProperty(window,"linkedTo",{configurable:true,get:()=>linkedTo,set:v=>{linkedTo=v}});
Object.defineProperty(window,"regShow",{configurable:true,get:()=>regShow,set:v=>{regShow=v}});
Object.defineProperty(window,"regDel",{configurable:true,get:()=>regDel,set:v=>{regDel=v}});
Object.defineProperty(window,"regRestore",{configurable:true,get:()=>regRestore,set:v=>{regRestore=v}});
Object.defineProperty(window,"csvDownload",{configurable:true,get:()=>csvDownload,set:v=>{csvDownload=v}});
Object.defineProperty(window,"regCSV",{configurable:true,get:()=>regCSV,set:v=>{regCSV=v}});
Object.defineProperty(window,"convertCand",{configurable:true,get:()=>convertCand,set:v=>{convertCand=v}});
Object.defineProperty(window,"doConvert",{configurable:true,get:()=>doConvert,set:v=>{doConvert=v}});
Object.defineProperty(window,"convertIntern",{configurable:true,get:()=>convertIntern,set:v=>{convertIntern=v}});
Object.defineProperty(window,"STDTASKS",{configurable:true,get:()=>STDTASKS});
Object.defineProperty(window,"makeChecklist",{configurable:true,get:()=>makeChecklist,set:v=>{makeChecklist=v}});
Object.defineProperty(window,"stdChecklist",{configurable:true,get:()=>stdChecklist,set:v=>{stdChecklist=v}});
Object.defineProperty(window,"quickLog",{configurable:true,get:()=>quickLog,set:v=>{quickLog=v}});
Object.defineProperty(window,"doQuickLog",{configurable:true,get:()=>doQuickLog,set:v=>{doQuickLog=v}});
Object.defineProperty(window,"sendAcks",{configurable:true,get:()=>sendAcks,set:v=>{sendAcks=v}});
Object.defineProperty(window,"doSendAcks",{configurable:true,get:()=>doSendAcks,set:v=>{doSendAcks=v}});
Object.defineProperty(window,"assignAll",{configurable:true,get:()=>assignAll,set:v=>{assignAll=v}});
Object.defineProperty(window,"doAssignAll",{configurable:true,get:()=>doAssignAll,set:v=>{doAssignAll=v}});
Object.defineProperty(window,"slipsFromPayroll",{configurable:true,get:()=>slipsFromPayroll,set:v=>{slipsFromPayroll=v}});
Object.defineProperty(window,"compShell",{configurable:true,get:()=>compShell,set:v=>{compShell=v}});
Object.defineProperty(window,"emptyEmp",{configurable:true,get:()=>emptyEmp});
Object.defineProperty(window,"editQuotas",{configurable:true,get:()=>editQuotas,set:v=>{editQuotas=v}});
Object.defineProperty(window,"saveQuotas",{configurable:true,get:()=>saveQuotas,set:v=>{saveQuotas=v}});
Object.defineProperty(window,"balCSV",{configurable:true,get:()=>balCSV,set:v=>{balCSV=v}});
Object.defineProperty(window,"backupJSON",{configurable:true,get:()=>backupJSON,set:v=>{backupJSON=v}});
Object.defineProperty(window,"importJSON",{configurable:true,get:()=>importJSON,set:v=>{importJSON=v}});
Object.defineProperty(window,"auditCSV",{configurable:true,get:()=>auditCSV,set:v=>{auditCSV=v}});
Object.defineProperty(window,"editPrefix",{configurable:true,get:()=>editPrefix,set:v=>{editPrefix=v}});
Object.defineProperty(window,"NAVC",{configurable:true,get:()=>NAVC,set:v=>{NAVC=v}});
Object.defineProperty(window,"navGroupHead",{configurable:true,get:()=>navGroupHead,set:v=>{navGroupHead=v}});
Object.defineProperty(window,"toggleNG",{configurable:true,get:()=>toggleNG,set:v=>{toggleNG=v}});
Object.defineProperty(window,"VIEWAS",{configurable:true,get:()=>VIEWAS,set:v=>{VIEWAS=v}});
Object.defineProperty(window,"ROLES",{configurable:true,get:()=>ROLES});
Object.defineProperty(window,"ACC",{configurable:true,get:()=>ACC});
Object.defineProperty(window,"realRole",{configurable:true,get:()=>realRole});
Object.defineProperty(window,"curRole",{configurable:true,get:()=>curRole});
Object.defineProperty(window,"myEmp",{configurable:true,get:()=>myEmp});
Object.defineProperty(window,"scopeOf",{configurable:true,get:()=>scopeOf});
Object.defineProperty(window,"canHR",{configurable:true,get:()=>canHR});
Object.defineProperty(window,"teamOf",{configurable:true,get:()=>teamOf,set:v=>{teamOf=v}});
Object.defineProperty(window,"empVisible",{configurable:true,get:()=>empVisible,set:v=>{empVisible=v}});
Object.defineProperty(window,"visEmps",{configurable:true,get:()=>visEmps});
Object.defineProperty(window,"canSeeRec",{configurable:true,get:()=>canSeeRec,set:v=>{canSeeRec=v}});
Object.defineProperty(window,"canAddK",{configurable:true,get:()=>canAddK,set:v=>{canAddK=v}});
Object.defineProperty(window,"canEditRec",{configurable:true,get:()=>canEditRec});
Object.defineProperty(window,"logConf",{configurable:true,get:()=>logConf,set:v=>{logConf=v}});
Object.defineProperty(window,"confNote",{configurable:true,get:()=>confNote});
Object.defineProperty(window,"latestAppr",{configurable:true,get:()=>latestAppr,set:v=>{latestAppr=v}});
Object.defineProperty(window,"ratingOf",{configurable:true,get:()=>ratingOf,set:v=>{ratingOf=v}});
Object.defineProperty(window,"curGradeSince",{configurable:true,get:()=>curGradeSince});
Object.defineProperty(window,"onPip",{configurable:true,get:()=>onPip});
Object.defineProperty(window,"eligibility",{configurable:true,get:()=>eligibility,set:v=>{eligibility=v}});
Object.defineProperty(window,"tabsBar",{configurable:true,get:()=>tabsBar});
Object.defineProperty(window,"pageShell",{configurable:true,get:()=>pageShell,set:v=>{pageShell=v}});
Object.defineProperty(window,"noLink",{configurable:true,get:()=>noLink});
Object.defineProperty(window,"hbars",{configurable:true,get:()=>hbars});
Object.defineProperty(window,"groupCount",{configurable:true,get:()=>groupCount});
Object.defineProperty(window,"REG2",{configurable:true,get:()=>REG2});
Object.defineProperty(window,"summaryView",{configurable:true,get:()=>summaryView,set:v=>{summaryView=v}});
Object.defineProperty(window,"perfCSV",{configurable:true,get:()=>perfCSV,set:v=>{perfCSV=v}});
Object.defineProperty(window,"editElig",{configurable:true,get:()=>editElig,set:v=>{editElig=v}});
Object.defineProperty(window,"exitDate",{configurable:true,get:()=>exitDate,set:v=>{exitDate=v}});
Object.defineProperty(window,"payCard",{configurable:true,get:()=>payCard,set:v=>{payCard=v}});
Object.defineProperty(window,"wfaCSV",{configurable:true,get:()=>wfaCSV,set:v=>{wfaCSV=v}});
Object.defineProperty(window,"band",{configurable:true,get:()=>band});
Object.defineProperty(window,"respondSurvey",{configurable:true,get:()=>respondSurvey,set:v=>{respondSurvey=v}});
Object.defineProperty(window,"submitSurvey",{configurable:true,get:()=>submitSurvey,set:v=>{submitSurvey=v}});
Object.defineProperty(window,"surveyStats",{configurable:true,get:()=>surveyStats,set:v=>{surveyStats=v}});
Object.defineProperty(window,"engCSV",{configurable:true,get:()=>engCSV,set:v=>{engCSV=v}});
Object.defineProperty(window,"REQDOCS",{configurable:true,get:()=>REQDOCS});
Object.defineProperty(window,"compAreas",{configurable:true,get:()=>compAreas,set:v=>{compAreas=v}});
Object.defineProperty(window,"compFix",{configurable:true,get:()=>compFix,set:v=>{compFix=v}});
Object.defineProperty(window,"compCSV",{configurable:true,get:()=>compCSV,set:v=>{compCSV=v}});
Object.defineProperty(window,"RULES",{configurable:true,get:()=>RULES});
Object.defineProperty(window,"runRules",{configurable:true,get:()=>runRules,set:v=>{runRules=v}});
Object.defineProperty(window,"dueActions",{configurable:true,get:()=>dueActions});
Object.defineProperty(window,"setAcc",{configurable:true,get:()=>setAcc,set:v=>{setAcc=v}});
Object.defineProperty(window,"ADVNAV",{configurable:true,get:()=>ADVNAV});
Object.defineProperty(window,"advAllowed",{configurable:true,get:()=>advAllowed,set:v=>{advAllowed=v}});
Object.defineProperty(window,"syncAdvNav",{configurable:true,get:()=>syncAdvNav,set:v=>{syncAdvNav=v}});
Object.defineProperty(window,"_enter",{configurable:true,get:()=>_enter});
Object.defineProperty(window,"_renderNav",{configurable:true,get:()=>_renderNav});
Object.defineProperty(window,"_notifs",{configurable:true,get:()=>_notifs});
Object.defineProperty(window,"_regShow",{configurable:true,get:()=>_regShow});
Object.defineProperty(window,"advTiles",{configurable:true,get:()=>advTiles,set:v=>{advTiles=v}});
Object.defineProperty(window,"plusMetric",{configurable:true,get:()=>plusMetric,set:v=>{plusMetric=v}});
Object.defineProperty(window,"openPlusAdv",{configurable:true,get:()=>openPlusAdv,set:v=>{openPlusAdv=v}});
Object.defineProperty(window,"pItems",{configurable:true,get:()=>pItems,set:v=>{pItems=v}});
Object.defineProperty(window,"pSel",{configurable:true,get:()=>pSel,set:v=>{pSel=v}});
Object.defineProperty(window,"openPalette",{configurable:true,get:()=>openPalette,set:v=>{openPalette=v}});
Object.defineProperty(window,"renderPalette",{configurable:true,get:()=>renderPalette,set:v=>{renderPalette=v}});
Object.defineProperty(window,"runP",{configurable:true,get:()=>runP,set:v=>{runP=v}});
Object.defineProperty(window,"effTheme",{configurable:true,get:()=>effTheme,set:v=>{effTheme=v}});
Object.defineProperty(window,"paintTheme",{configurable:true,get:()=>paintTheme,set:v=>{paintTheme=v}});
Object.defineProperty(window,"toggleTheme",{configurable:true,get:()=>toggleTheme,set:v=>{toggleTheme=v}});
Object.defineProperty(window,"tt",{configurable:true,get:()=>tt,set:v=>{tt=v}});
Object.defineProperty(window,"toast",{configurable:true,get:()=>toast,set:v=>{toast=v}});
Object.assign(window,{setViewAs,openMoneySettings,downloadPayslip,flushChanges:()=>bridge.flush()});
applyRegistry(initial.registry);
const originalPerf=V.m_perf;V.m_perf=()=>{if(scopeOf('perf')!=='summary')return originalPerf();const p=COMPUTED.performance||{},[,tbar]=tabsBar('t_perf',['Overview']);const kpis=[stat('users','Employees in view',p.employees||0,'Company totals'),stat('star','Average rating',p.avg??'—',(p.rated||0)+' rated · scale 1–5'),stat('chart','Goal completion',p.goalCompletion||'—','Weighted progress'),stat('clock','Overdue reviews',p.odr||0,'Past review due date',p.odr?'down':'')].join('');return head('Performance management','Goals, check-ins and year-end results for each employee, linked by Employee ID. Ratings come from the Appraisal tracker.','')+noLink()+tbar+'<div class="grid g4">'+kpis+'</div><div class="grid g2 mt">'+card('Rating distribution',hbars(p.dist||[]))+card('Goal completion by department',hbars(p.byDept||[],v=>v+'%'))+'</div><div class="banner mt" style="background:var(--info-bg)">'+ic('shield')+'<span>Your role sees company totals only.</span></div>'};
paintTheme();boot();
return {hydrate,snapshot:()=>({demo:S,live:R}),showLogin,navigate:(app,view)=>{CURAPP=app;go(view)},home,user:()=>USER,toast};
}
