(function(){
  'use strict';
  const app = document.getElementById('app');

  const LOGIN_USERS = [
    { u: 'admin', p: 'admin123', role: 'admin', name: 'Administrator' },
    { u: 'teacher1', p: 'teacher123', role: 'teacher', name: 'O‘qituvchi' },
    { u: 'student1', p: 'student123', role: 'student', name: 'Talaba' },
    { u: 'teacher', p: 'teacher123', role: 'teacher', name: 'O‘qituvchi' },
    { u: 'student', p: 'student123', role: 'student', name: 'Talaba' }
  ];

  const defaultData = {
    vlans: [
      ['Management',10,'192.168.10.0/24','192.168.10.1','Administrator boshqaruvi'],
      ['Administration',20,'192.168.20.0/24','192.168.20.1','Rahbariyat'],
      ['Accounting',30,'192.168.30.0/24','192.168.30.1','Buxgalteriya'],
      ['IT Department',40,'192.168.40.0/24','192.168.40.1','IT bo‘limi'],
      ['Staff',50,'192.168.50.0/24','192.168.50.1','Xodimlar'],
      ['Servers',60,'192.168.60.0/24','192.168.60.1','Serverlar'],
      ['Guest Wi‑Fi',70,'192.168.70.0/24','192.168.70.1','Mehmonlar'],
      ['Branch LAN',80,'192.168.80.0/24','192.168.80.1','Filial LAN']
    ],
    labs: [
      {id:1,title:'Korporativ topologiya yaratish',status:'Faol',ball:15,desc:'Router, multilayer switch, access switch, server va PClarni joylashtirish.'},
      {id:2,title:'VLAN va trunk sozlash',status:'Faol',ball:15,desc:'VLAN 10–70 yaratish, access va trunk portlarni sozlash.'},
      {id:3,title:'Inter-VLAN routing',status:'Faol',ball:15,desc:'MLS da SVI interfeyslar, gateway va ip routingni yoqish.'},
      {id:4,title:'DHCP, DNS, Web xizmatlari',status:'Faol',ball:15,desc:'Server VLANda markazlashgan xizmatlarni ishga tushirish.'},
      {id:5,title:'OSPF va WAN ulanish',status:'Faol',ball:15,desc:'Bosh ofis va filial o‘rtasida 10.0.0.0/30 WAN link.'},
      {id:6,title:'NAT va ACL xavfsizligi',status:'Faol',ball:15,desc:'Guest VLANni ichki tarmoqdan cheklash, internetga ruxsat berish.'}
    ],
    submissions: [
      {student:'student1',lab:'VLAN va trunk sozlash',status:'Tekshirildi',score:92,date:'2026-06-05'},
      {student:'student1',lab:'Inter-VLAN routing',status:'Topshirildi',score:0,date:'2026-06-05'}
    ],
    configs: {
      vlan: 'conf t\nvlan 10\n name Management\nvlan 20\n name Administration\nvlan 30\n name Accounting\nvlan 40\n name IT_Department\nvlan 50\n name Staff\nvlan 60\n name Servers\nvlan 70\n name Guest\nend\nwrite memory',
      svi: 'conf t\nip routing\ninterface vlan 20\n ip address 192.168.20.1 255.255.255.0\n no shutdown\ninterface vlan 30\n ip address 192.168.30.1 255.255.255.0\n no shutdown\ninterface vlan 40\n ip address 192.168.40.1 255.255.255.0\n no shutdown\ninterface vlan 50\n ip address 192.168.50.1 255.255.255.0\n no shutdown\ninterface vlan 60\n ip address 192.168.60.1 255.255.255.0\n no shutdown\nend\nwrite memory',
      ospf: 'conf t\nrouter ospf 1\n network 192.168.0.0 0.0.255.255 area 0\n network 10.0.0.0 0.0.0.3 area 0\nend\nwrite memory',
      nat: 'access-list 1 permit 192.168.0.0 0.0.255.255\ninterface g0/0\n ip nat inside\ninterface g0/1\n ip nat outside\nip nat inside source list 1 interface g0/1 overload',
      acl: 'access-list 100 deny ip 192.168.70.0 0.0.0.255 192.168.0.0 0.0.255.255\naccess-list 100 permit ip 192.168.70.0 0.0.0.255 any\ninterface vlan 70\n ip access-group 100 in'
    },
    tests: []
  };

  const questions = [
    'VLANning asosiy vazifasi nima?','/30 subnet odatda qayerda ishlatiladi?','Inter-VLAN routing nima qiladi?','DHCP xizmati nimani bajaradi?','DNS server vazifasi nima?','ACL nima uchun qo‘llaniladi?','NAT asosiy maqsadi nima?','OSPF qanday protokol?','Trunk port vazifasi nima?','SVI nimaga kerak?','Core layer vazifasi nima?','Access layer qayerda ishlaydi?','Guest VLAN uchun to‘g‘ri siyosat qaysi?','show vlan brief nimani ko‘rsatadi?','ping buyrug‘i nimani tekshiradi?','traceroute nimani ko‘rsatadi?','ip helper-address qachon kerak?','Management VLAN vazifasi nima?','Server VLANda nimalar joylashadi?','WAN link nima?','Subnetting foydasi nima?','Multilayer switch nimani bajaradi?','Default gateway nima?','Port security nimaga xizmat qiladi?','Simulation mode afzalligi nima?','FTP xizmati vazifasi nima?','Web server nimani beradi?','Email server vazifasi nima?','Routing jadvali nimani saqlaydi?','Korporativ tarmoq uchun muhim talab?'
  ];
  defaultData.tests = questions.map(function(q){ return {q:q, opts:['Noto‘g‘ri javob','Tarmoqni boshqarish va tekshirishga oid to‘g‘ri javob','Faqat dizayn uchun','Faqat kompyuterni o‘chirish uchun'], a:1}; });

  function clone(obj){ return JSON.parse(JSON.stringify(obj)); }
  function readJSON(key, fallback){ try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch(e){ localStorage.removeItem(key); return fallback; } }
  function data(){ let d = readJSON('netData', null); if(!d || !Array.isArray(d.tests) || d.tests.length < 30){ d = clone(defaultData); localStorage.setItem('netData', JSON.stringify(d)); } return d; }
  function save(d){ localStorage.setItem('netData', JSON.stringify(d)); }
  function session(){ return readJSON('session', null); }
  function setSession(u){ localStorage.setItem('session', JSON.stringify(u)); }
  function clearAll(){ localStorage.removeItem('session'); localStorage.removeItem('netData'); renderLogin(); }
  window.clearAll = clearAll;

  const menu = {
    admin:['dashboard','topology','vlans','labs','tests','results','configs','users'],
    teacher:['dashboard','topology','vlans','labs','tests','results','configs'],
    student:['dashboard','topology','vlans','labs','tests','configs']
  };
  const names = {dashboard:'Bosh panel',topology:'Topologiya',vlans:'VLAN va IP',labs:'Laboratoriyalar',tests:'Testlar',results:'Natijalar',configs:'Konfiguratsiya',users:'Foydalanuvchilar'};

  function renderLogin(){
    app.innerHTML = '<div class="login-page"><div class="login-card"><div class="login-info"><span class="badge">Cisco Packet Tracer • Korporativ tarmoq</span><h1>Kattaroq korporativ tarmoq simulyatsiyasi platformasi</h1><p>VLAN, IP-manzillash, OSPF, WAN, DHCP, DNS, Web, FTP, NAT, ACL va monitoring bo‘limlari bitta platformada.</p><div class="features"><div class="feature">Admin panel</div><div class="feature">O‘qituvchi panel</div><div class="feature">Talaba panel</div><div class="feature">30 ta test</div></div></div><form class="login-form" id="loginForm"><h2>Tizimga kirish</h2><p class="hint">Parol oynada ko‘rinmaydi. Login va parolni pastdagidek kiriting.</p><div class="field"><label>Login</label><input id="login" autocomplete="username" required placeholder="admin"></div><div class="field"><label>Parol</label><input id="password" type="password" autocomplete="current-password" required placeholder="••••••••"></div><button class="primary" type="submit">Kirish</button><button class="secondary" type="button" id="resetBtn">Tozalab qayta boshlash</button><p class="hint"><b>Admin:</b> admin / admin123<br><b>O‘qituvchi:</b> teacher1 / teacher123<br><b>Talaba:</b> student1 / student123</p><div id="loginError" class="error-box" style="display:none"></div></form></div></div>';
    document.getElementById('loginForm').addEventListener('submit', doLogin);
    document.getElementById('resetBtn').addEventListener('click', clearAll);
  }

  function doLogin(e){
    e.preventDefault();
    const login = document.getElementById('login').value.trim().toLowerCase();
    const password = document.getElementById('password').value.trim();
    const found = LOGIN_USERS.find(function(x){ return x.u.toLowerCase() === login && x.p === password; });
    if(!found){
      const err = document.getElementById('loginError');
      err.style.display = 'block';
      err.innerHTML = 'Login yoki parol xato. Masalan: <b>admin</b> / <b>admin123</b>. Kerak bo‘lsa “Tozalab qayta boshlash” tugmasini bosing.';
      return;
    }
    setSession({u:found.u, role:found.role, name:found.name});
    renderApp('dashboard');
  }

  function logout(){ localStorage.removeItem('session'); renderLogin(); }
  window.logout = logout;

  function layout(page, content){
    const u = session();
    const buttons = menu[u.role].map(function(m){ return '<button class="'+(m===page?'active':'')+'" data-page="'+m+'">'+names[m]+'</button>'; }).join('') + '<button id="logoutBtn">Chiqish</button>';
    app.innerHTML = '<div class="app"><aside class="sidebar"><div class="logo"><div class="logo-mark">PT</div><div><b>Network Lab</b><small>'+u.role+' panel</small></div></div><div class="nav">'+buttons+'</div></aside><main class="main"><div class="topbar"><h2>'+names[page]+'</h2><div class="user-chip"><div class="avatar">'+u.name.charAt(0)+'</div><div><b>'+u.name+'</b><br><small>'+u.u+'</small></div></div></div>'+content+'<div class="footer-note">GitHub Pages uchun tayyor: backend talab qilmaydi, barcha ma’lumotlar brauzer xotirasida saqlanadi.</div></main></div>';
    document.querySelectorAll('[data-page]').forEach(function(btn){ btn.addEventListener('click', function(){ renderApp(btn.getAttribute('data-page')); }); });
    document.getElementById('logoutBtn').addEventListener('click', logout);
  }

  function dashboard(d){ layout('dashboard', '<div class="grid"><div class="card stat"><div><small>VLAN segmentlar</small><div class="num">'+d.vlans.length+'</div></div><span class="pill ok">Faol</span></div><div class="card stat"><div><small>Laboratoriya</small><div class="num">'+d.labs.length+'</div></div><span class="pill">Amaliy</span></div><div class="card stat"><div><small>Test savollari</small><div class="num">'+d.tests.length+'</div></div><span class="pill warn">30 ta</span></div><div class="card stat"><div><small>Natija</small><div class="num">92%</div></div><span class="pill ok">Yaxshi</span></div></div><div class="two section"><div class="card"><h3>Loyiha maqsadi</h3><p>Cisco Packet Tracer dasturida kattaroq korporativ tarmoq simulyatsiyasini yaratish, VLAN, routing, WAN, server xizmatlari va xavfsizlikni amaliy joriy etish.</p></div><div class="card"><h3>Baholash mezonlari</h3>'+['Topologiya','IP manzillash','VLAN','Routing','Server xizmatlari','ACL/NAT'].map(function(x,i){ return '<p>'+x+'</p><div class="progress"><span style="width:'+([95,92,94,90,88,91][i])+'%"></span></div>'; }).join('')+'</div></div>'); }
  function topology(){ layout('topology','<div class="card"><h3>Korporativ tarmoq topologiyasi</h3><div class="topology"><div class="line" style="left:130px;top:85px;width:240px;transform:rotate(10deg)"></div><div class="line" style="left:390px;top:100px;width:220px;transform:rotate(18deg)"></div><div class="line" style="left:390px;top:100px;width:220px;transform:rotate(72deg)"></div><div class="line" style="left:390px;top:100px;width:245px;transform:rotate(133deg)"></div><div class="node" style="left:25px;top:55px">Internet<small>ISP</small></div><div class="node" style="left:300px;top:70px">CORE-R1<small>Router</small></div><div class="node" style="left:570px;top:120px">MLS-CORE<small>Inter-VLAN</small></div><div class="node" style="left:560px;top:285px">SW-SERVER<small>DHCP DNS WEB</small></div><div class="node" style="left:300px;top:290px">BRANCH-R1<small>WAN 10.0.0.0/30</small></div><div class="node" style="left:760px;top:60px">SW-ADMIN<small>VLAN20/30</small></div><div class="node" style="left:760px;top:180px">SW-STAFF<small>VLAN40/50</small></div><div class="node" style="left:760px;top:300px">Guest AP<small>VLAN70</small></div></div></div>'); }
  function vlans(d){ layout('vlans','<div class="card"><h3>VLAN va IP-manzillash jadvali</h3><div class="table-wrap"><table><thead><tr><th>Segment</th><th>VLAN ID</th><th>Tarmoq</th><th>Gateway</th><th>Vazifa</th></tr></thead><tbody>'+d.vlans.map(function(v){return '<tr><td>'+v[0]+'</td><td><span class="pill">'+v[1]+'</span></td><td>'+v[2]+'</td><td>'+v[3]+'</td><td>'+v[4]+'</td></tr>';}).join('')+'</tbody></table></div></div>'); }
  function labs(d,u){ layout('labs','<div class="actions">'+(u.role!=='student'?'<button class="primary" id="addLabBtn">Laboratoriya qo‘shish</button>':'')+'</div><div class="three section">'+d.labs.map(function(l){return '<div class="card"><span class="pill ok">'+l.status+'</span><h3>'+l.title+'</h3><p>'+l.desc+'</p><b>'+l.ball+' ball</b><div class="actions">'+(u.role==='student'?'<button class="primary submitLab" data-lab="'+l.title+'">Topshirish</button>':'<button class="secondary editLab" data-id="'+l.id+'">Tahrirlash</button>')+'</div></div>';}).join('')+'</div>'); const a=document.getElementById('addLabBtn'); if(a)a.onclick=addLab; document.querySelectorAll('.submitLab').forEach(b=>b.onclick=()=>submitLab(b.dataset.lab)); document.querySelectorAll('.editLab').forEach(b=>b.onclick=()=>editLab(Number(b.dataset.id))); }
  function addLab(){ const title=prompt('Laboratoriya nomi'); if(!title)return; const d=data(); d.labs.push({id:Date.now(),title:title,status:'Faol',ball:15,desc:'Yangi amaliy topshiriq'}); save(d); renderApp('labs'); }
  function editLab(id){ const d=data(), l=d.labs.find(x=>x.id===id); if(!l)return; const t=prompt('Nom',l.title); if(t){l.title=t;save(d);renderApp('labs');} }
  function submitLab(lab){ const d=data(), u=session(); d.submissions.push({student:u.u,lab:lab,status:'Topshirildi',score:0,date:new Date().toISOString().slice(0,10)}); save(d); alert('Topshiriq yuborildi'); renderApp('labs'); }
  function tests(d){ layout('tests','<div class="card"><h3>30 ta test savoli</h3><form id="testForm">'+d.tests.map(function(t,i){return '<div class="test-q"><b>'+(i+1)+'. '+t.q+'</b><div class="answers">'+t.opts.map(function(o,j){return '<label><input type="radio" name="q'+i+'" value="'+j+'"> '+o+'</label>';}).join('')+'</div></div>';}).join('')+'<button class="primary" type="button" id="checkTestBtn">Testni yakunlash</button></form><div id="testResult"></div></div>'); document.getElementById('checkTestBtn').onclick=checkTest; }
  function checkTest(){ const d=data(); let score=0; d.tests.forEach(function(t,i){ const a=document.querySelector('input[name="q'+i+'"]:checked'); if(a && Number(a.value)===t.a) score++; }); document.getElementById('testResult').innerHTML='<div class="alert">Natija: <b>'+score+'/'+d.tests.length+'</b> ('+Math.round(score/d.tests.length*100)+'%)</div>'; }
  function results(d){ layout('results','<div class="card"><h3>Topshiriqlar va baholar monitoringi</h3><div class="table-wrap"><table><thead><tr><th>Talaba</th><th>Laboratoriya</th><th>Holat</th><th>Ball</th><th>Sana</th><th>Amal</th></tr></thead><tbody>'+d.submissions.map(function(s,i){return '<tr><td>'+s.student+'</td><td>'+s.lab+'</td><td><span class="pill '+(s.status==='Tekshirildi'?'ok':'warn')+'">'+s.status+'</span></td><td>'+s.score+'</td><td>'+s.date+'</td><td><button class="secondary gradeBtn" data-i="'+i+'">Baholash</button></td></tr>';}).join('')+'</tbody></table></div></div>'); document.querySelectorAll('.gradeBtn').forEach(b=>b.onclick=()=>grade(Number(b.dataset.i))); }
  function grade(i){ const d=data(), b=prompt('Ball kiriting', '90'); if(b!==null){ d.submissions[i].score=Number(b); d.submissions[i].status='Tekshirildi'; save(d); renderApp('results'); } }
  function esc(s){ return String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
  function configs(d){ layout('configs','<div class="two">'+Object.keys(d.configs).map(function(k){return '<div class="card"><h3>'+k.toUpperCase()+' konfiguratsiyasi</h3><pre class="code">'+esc(d.configs[k])+'</pre><button class="secondary copyBtn" data-k="'+k+'">Nusxa olish</button></div>';}).join('')+'</div>'); document.querySelectorAll('.copyBtn').forEach(b=>b.onclick=()=>navigator.clipboard.writeText(data().configs[b.dataset.k]).then(()=>alert('Nusxa olindi'))); }
  function usersPage(){ layout('users','<div class="card"><h3>Foydalanuvchilar</h3><div class="table-wrap"><table><thead><tr><th>Login</th><th>Rol</th><th>Ism</th><th>Holat</th></tr></thead><tbody>'+LOGIN_USERS.slice(0,3).map(function(x){return '<tr><td>'+x.u+'</td><td>'+x.role+'</td><td>'+x.name+'</td><td><span class="pill ok">Faol</span></td></tr>';}).join('')+'</tbody></table></div><p class="hint">Parollar foydalanuvchi oynasida ko‘rinmaydi.</p></div>'); }

  function renderApp(page){ const u=session(); if(!u){ renderLogin(); return; } const d=data(); const pages={dashboard:dashboard,topology:topology,vlans:vlans,labs:labs,tests:tests,results:results,configs:configs,users:usersPage}; (pages[page] || dashboard)(d,u); }
  window.renderApp = renderApp;

  if(session()) renderApp('dashboard'); else renderLogin();
})();
