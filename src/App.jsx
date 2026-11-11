import { useEffect, useMemo, useState } from 'react'
import { supabase, supabaseReady, usernameToAuthEmail } from './supabase'
import { Menu, X, Star, Orbit, CalendarDays, Trophy, Users, Shield, LogIn, LogOut, Sparkles, ChevronRight, Volume2, Crown, Radio, Megaphone, Plus, Image as ImageIcon, Save, RefreshCw } from 'lucide-react'

const nav = [
  ['HOME','home'],['TRAINEES','trainees'],['SCHEDULE','schedule'],['VOTE','vote'],
  ['FAN CLUB','fanclub'],['RULE','rule'],['UNIFORM','uniform']
]
const palette = ['#450A18','#7B182F','#C43556','#F9CCCB','#86DDE4','#197074','#082D36']
const demoTrainees = [
  {id:'demo-1',stage_name:'AURORA',rank_no:1,status:'ACTIVE',tagline:'Voice that lights the night',image_url:'',votes:1284},
  {id:'demo-2',stage_name:'LYRA',rank_no:2,status:'ACTIVE',tagline:'A melody beyond the stars',image_url:'',votes:1108},
  {id:'demo-3',stage_name:'NOVA',rank_no:3,status:'RISING',tagline:'Born to become a supernova',image_url:'',votes:986},
  {id:'demo-4',stage_name:'VEGA',rank_no:4,status:'ACTIVE',tagline:'Find your own constellation',image_url:'',votes:842}
]
const demoEvents = [
  {id:1,event_date:'2027-11-03',title:'PROJECT OPENING',description:'เปิดจักรวาล The Celestial Project'},
  {id:2,event_date:'2027-11-12',title:'FIRST VOICE MISSION',description:'ภารกิจร้องเพลงรอบแรก'},
  {id:3,event_date:'2027-12-05',title:'LIVE PERFORMANCE',description:'การแสดงสดและประกาศคะแนน'},
  {id:4,event_date:'2028-01-14',title:'ELIMINATION NIGHT',description:'ประกาศผลรอบคัดออก'}
]
const demoBanners = [
  {id:1,title:'A NEW CONSTELLATION BEGINS',subtitle:'เสียงของคุณ จะพาใครไปถึงดวงดาว',image_url:''},
  {id:2,title:'FIND YOUR LIGHT',subtitle:'THE CELESTIAL PROJECT — OFFICIAL COMMUNITY',image_url:''}
]
const initials = (s='C') => s.slice(0,1).toUpperCase()

export default function App(){
  const [page,setPage] = useState('home')
  const [mobileOpen,setMobileOpen] = useState(false)
  const [session,setSession] = useState(null)
  const [profile,setProfile] = useState(null)
  const [trainees,setTrainees] = useState(demoTrainees)
  const [events,setEvents] = useState(demoEvents)
  const [banners,setBanners] = useState(demoBanners)
  const [announcements,setAnnouncements] = useState([])
  const [polls,setPolls] = useState([])
  const [votes,setVotes] = useState([])
  const [uniforms,setUniforms] = useState([])
  const [loginMode,setLoginMode] = useState('fan')
  const [username,setUsername] = useState('')
  const [password,setPassword] = useState('')
  const [authBusy,setAuthBusy] = useState(false)
  const [notice,setNotice] = useState('')
  const [adminTab,setAdminTab] = useState('overview')
  const [form,setForm] = useState({title:'',subtitle:'',description:'',image_url:'',stage_name:'',tagline:'',rank_no:1,status:'ACTIVE',event_date:'2027-11-01'})
  const isStaff = profile?.role === 'staff'

  useEffect(()=>{
    if(!supabaseReady) return
    supabase.auth.getSession().then(({data})=>setSession(data.session))
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_e,s)=>setSession(s))
    return ()=>subscription.unsubscribe()
  },[])
  useEffect(()=>{
    if(!session || !supabaseReady) { setProfile(null); return }
    loadProfile()
  },[session])
  useEffect(()=>{ if(supabaseReady) loadPublicData() },[])
  async function loadProfile(){
    const {data} = await supabase.from('profiles').select('*').eq('id',session.user.id).maybeSingle()
    setProfile(data)
  }
  async function loadPublicData(){
    const [t,e,b,a,p,u] = await Promise.all([
      supabase.from('trainees').select('*').order('rank_no'),
      supabase.from('calendar_events').select('*').order('event_date'),
      supabase.from('banners').select('*').eq('is_active',true).order('sort_order'),
      supabase.from('announcements').select('*').eq('is_published',true).order('created_at',{ascending:false}).limit(6),
      supabase.from('polls').select('*').eq('is_active',true).order('created_at',{ascending:false}),
      supabase.from('uniforms').select('*').order('created_at',{ascending:false})
    ])
    if(t.data?.length) setTrainees(t.data)
    if(e.data?.length) setEvents(e.data)
    if(b.data?.length) setBanners(b.data)
    if(a.data) setAnnouncements(a.data)
    if(p.data) setPolls(p.data)
    if(u.data) setUniforms(u.data)
    if(session){
      const {data:v} = await supabase.from('votes').select('poll_id,trainee_id').eq('user_id',session.user.id)
      setVotes(v||[])
    }
  }
  async function authenticate(e){
    e.preventDefault(); setAuthBusy(true); setNotice('')
    if(!supabaseReady){setNotice('กรุณาตั้งค่า Supabase URL และ Anon Key ในไฟล์ .env ก่อน');setAuthBusy(false);return}
    const email = usernameToAuthEmail(username)
    if(!email || !password){setNotice('กรอก Username และ Password ให้ครบ');setAuthBusy(false);return}
    if(loginMode==='register'){
      const {error} = await supabase.auth.signUp({email,password,options:{data:{username:username.trim()}}})
      setNotice(error ? error.message : 'สมัครสมาชิกสำเร็จ! หากเปิดยืนยันอีเมลไว้ ให้ตรวจสอบการตั้งค่า Supabase Auth')
    } else {
      const {error} = await supabase.auth.signInWithPassword({email,password})
      if(error) setNotice('เข้าสู่ระบบไม่สำเร็จ: ตรวจสอบ Username และ Password')
      else {setNotice('เข้าสู่ระบบสำเร็จ');setPage('fanclub')}
    }
    setAuthBusy(false)
  }
  async function signOut(){await supabase?.auth.signOut();setPage('home');setProfile(null)}
  async function castVote(pollId,traineeId){
    if(!session){setNotice('กรุณาเข้าสู่ระบบแฟนคลับก่อนโหวต');setPage('fanclub');return}
    const {error}=await supabase.from('votes').insert({poll_id:pollId,trainee_id:traineeId,user_id:session.user.id})
    if(error) setNotice(error.code==='23505'?'คุณใช้สิทธิ์โหวตในรอบนี้แล้ว':'ไม่สามารถโหวตได้: '+error.message)
    else {setNotice('บันทึกคะแนนโหวตแล้ว');setVotes([...votes,{poll_id:pollId,trainee_id:traineeId}])}
  }
  async function addRecord(table,values){
    const {error}=await supabase.from(table).insert(values)
    if(error) setNotice('บันทึกไม่สำเร็จ: '+error.message)
    else {setNotice('บันทึกข้อมูลเรียบร้อย');await loadPublicData()}
  }
  async function updateTrainee(id,patch){
    const {error}=await supabase.from('trainees').update(patch).eq('id',id)
    setNotice(error?'อัปเดตไม่สำเร็จ: '+error.message:'อัปเดตข้อมูลเด็กฝึกแล้ว')
    if(!error) await loadPublicData()
  }
  const sortedTrainees = useMemo(()=>[...trainees].sort((a,b)=>(a.rank_no||99)-(b.rank_no||99)),[trainees])
  const activeBanner = banners[0] || demoBanners[0]
  const go = (p)=>{setPage(p);setMobileOpen(false);setNotice('');window.scrollTo({top:0,behavior:'smooth'})}

  return <div className="app-shell">
    <div className="stars stars-a"/><div className="stars stars-b"/>
    <header className="topbar">
      <button className="brand" onClick={()=>go('home')} aria-label="Home"><img src="./celestial-logo.svg" alt="The Celestial Project"/></button>
      <nav className="desktop-nav">{nav.map(([label,id])=><button key={id} className={page===id?'nav-link active':'nav-link'} onClick={()=>go(id)}>{label}</button>)}</nav>
      <div className="header-actions">
        {session ? <button className="account-chip" onClick={()=>go('fanclub')}><span className="online-dot"/>{profile?.username||username||'MEMBER'}</button> : <button className="staff-entry" onClick={()=>{setLoginMode('login');setPage('login')}}><Shield size={14}/> TEAM ACCESS</button>}
        {session ? <button className="icon-button" onClick={signOut} aria-label="Sign out"><LogOut size={17}/></button>:<button className="icon-button" onClick={()=>{setLoginMode('login');setPage('login')}} aria-label="Sign in"><LogIn size={17}/></button>}
        <button className="icon-button mobile-toggle" onClick={()=>setMobileOpen(!mobileOpen)} aria-label="Menu">{mobileOpen?<X/>:<Menu/>}</button>
      </div>
    </header>
    {mobileOpen&&<nav className="mobile-nav">{nav.map(([l,id])=><button key={id} onClick={()=>go(id)}>{l}<ChevronRight size={15}/></button>)}</nav>}
    <main>
      {notice&&<div className="notice"><span>{notice}</span><button onClick={()=>setNotice('')}><X size={15}/></button></div>}
      {page==='home'&&<Home banner={activeBanner} announcements={announcements} trainees={sortedTrainees} go={go}/>}
      {page==='trainees'&&<section className="page-wrap"><PageHeading eyebrow="THE STARS IN OUR UNIVERSE" title="TRAINEES" desc="Meet the voices. Discover their stories. Follow their journey."/><div className="trainee-grid">{sortedTrainees.map((t,i)=><TraineeCard key={t.id} t={t} index={i}/>)}</div></section>}
      {page==='schedule'&&<Schedule events={events}/>}
      {page==='vote'&&<section className="page-wrap"><PageHeading eyebrow="YOUR VOICE MATTERS" title="VOTE" desc="One voice can change the constellation."/><div className="poll-list">{polls.length?polls.map(p=><div className="panel poll" key={p.id}><div><span className="eyebrow">OFFICIAL POLL</span><h2>{p.title}</h2><p>{p.description}</p></div><div className="vote-options">{sortedTrainees.map(t=><button key={t.id} className="vote-option" disabled={votes.some(v=>v.poll_id===p.id)} onClick={()=>castVote(p.id,t.id)}><span>{t.stage_name}</span><span>VOTE <ChevronRight size={14}/></span></button>)}</div><small>{votes.some(v=>v.poll_id===p.id)?'YOUR VOTE HAS BEEN RECORDED':'ONE VOTE PER ACCOUNT'}</small></div>):<EmptyState icon={<Trophy/>} title="THE VOTING GATE IS CLOSED" text="Official voting rounds will appear here when the mission begins."/ >}</div></section>}
      {page==='fanclub'&&<section className="page-wrap"><PageHeading eyebrow="OFFICIAL MEMBERSHIP" title="FAN CLUB" desc="Join the constellation. Your support becomes part of this story."/><div className="fan-layout"><div className="fan-card"><div className="card-top"><span>CELESTIAL MEMBERSHIP</span><Star size={18}/></div><img src="./celestial-logo.svg" alt="" className="fan-logo"/><div className="member-name">{profile?.username||'YOUR USERNAME'}</div><div className="member-id">MEMBER ID · {session?.user?.id?.slice(0,8).toUpperCase()||'NOT REGISTERED'}</div><div className="card-bottom"><span>THE CELESTIAL PROJECT</span><span>EST. 2027</span></div></div><div className="fan-copy"><span className="eyebrow">BECOME A MEMBER</span><h2>Your own place<br/>among the stars.</h2><p>สมัครแฟนคลับด้วย Username และ Password เพื่อรับ Fan Card ประจำตัว และเข้าร่วมกิจกรรมโหวตของโปรเจกต์</p>{session?<button className="button button-outline" onClick={signOut}>SIGN OUT <LogOut size={15}/></button>:<button className="button button-primary" onClick={()=>{setLoginMode('register');go('login')}}>JOIN THE FAN CLUB <ChevronRight size={16}/></button>}</div></div></section>}
      {page==='rule'&&<section className="page-wrap"><PageHeading eyebrow="READ BEFORE YOU ENTER" title="TRAINEE RULE" desc="กติกาและแนวทางการเข้าร่วมโปรเจกต์"/><div className="rules-grid">{[['01','RESPECT','เคารพผู้ดูแล ผู้เข้าแข่งขัน และสมาชิกทุกคน'],['02','REAL VOICE','ใช้เสียงร้องจริงตามรูปแบบภารกิจ ห้ามแอบอ้างผลงาน'],['03','NO HARASSMENT','ไม่คุกคาม เหยียดหยาม เปิดเผยข้อมูลส่วนตัว หรือสร้างความขัดแย้ง'],['04','MISSION TIME','ติดตามกำหนดการ ส่งผลงาน และเข้าร่วมกิจกรรมตามเวลาที่ประกาศ'],['05','ROLE-PLAY','แยกบทบาทในคอมมูนิตี้ออกจากชีวิตจริง และไม่สวมรอยบุคคลอื่น'],['06','STAFF DECISION','คำตัดสินของทีมงานในกรณีที่เกี่ยวกับความปลอดภัยและกติกาถือเป็นที่สิ้นสุด']].map(x=><div className="rule-card" key={x[0]}><span>{x[0]}</span><div><h3>{x[1]}</h3><p>{x[2]}</p></div></div>)}</div></section>}
      {page==='uniform'&&<section className="page-wrap"><PageHeading eyebrow="THE OFFICIAL LOOK" title="UNIFORM" desc="ชุดประจำโปรเจกต์และแนวทางการแต่งกายของเด็กฝึก"/>{uniforms.length?<div className="uniform-grid">{uniforms.map(u=><div className="uniform-card" key={u.id}>{u.image_url&&<img src={u.image_url} alt={u.title}/>}<div><span className="eyebrow">{u.category||'OFFICIAL UNIFORM'}</span><h2>{u.title}</h2><p>{u.description}</p></div></div>)}</div>:<EmptyState icon={<Sparkles/>} title="UNIFORM ARCHIVE" text="ภาพชุดและรายละเอียดเครื่องแต่งกายอย่างเป็นทางการจะประกาศที่นี่เร็ว ๆ นี้."/ >}</section>}
      {page==='login'&&<section className="page-wrap auth-wrap"><div className="auth-card"><div className="auth-mark"><img src="./celestial-logo.svg" alt=""/></div><span className="eyebrow">{loginMode==='register'?'CREATE YOUR MEMBERSHIP':'SECURE ACCESS'}</span><h1>{loginMode==='register'?'JOIN THE UNIVERSE': 'WELCOME BACK'}</h1><p>{loginMode==='register'?'สร้างบัญชีแฟนคลับด้วย Username และ Password':'เข้าสู่ระบบสมาชิกหรือทีมงานด้วย Username และ Password'}</p><form onSubmit={authenticate}><label>USERNAME<input value={username} onChange={e=>setUsername(e.target.value)} autoComplete="username" minLength="3" maxLength="24" required placeholder="Your username"/></label><label>PASSWORD<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete={loginMode==='register'?'new-password':'current-password'} minLength="8" required placeholder="At least 8 characters"/></label><button className="button button-primary full" disabled={authBusy}>{authBusy?'PLEASE WAIT...':loginMode==='register'?'CREATE ACCOUNT':'SIGN IN'} <ChevronRight size={16}/></button></form><button className="text-button" onClick={()=>setLoginMode(loginMode==='register'?'login':'register')}>{loginMode==='register'?'Already a member? Sign in':'New here? Create a fan account'}</button><small>TEAM ACCESS ใช้บัญชีที่ได้รับอนุมัติจากผู้ดูแลเท่านั้น</small></div></section>}
      {page==='admin'&&<section className="page-wrap"><PageHeading eyebrow="RESTRICTED AREA" title="CONTROL ROOM" desc="THE CELESTIAL PROJECT · STAFF CONSOLE"/>{!isStaff?<div className="panel"><Shield/><h2>STAFF ACCESS ONLY</h2><p>บัญชีนี้ยังไม่มีสิทธิ์ทีมงาน กรุณาเข้าสู่ระบบด้วยบัญชีที่ได้รับอนุมัติ</p><button className="button button-primary" onClick={()=>go('login')}>TEAM SIGN IN</button></div>:<AdminPanel tab={adminTab} setTab={setAdminTab} form={form} setForm={setForm} trainees={sortedTrainees} addRecord={addRecord} updateTrainee={updateTrainee} reload={loadPublicData}/>}</section>}
    </main>
    <footer><div className="footer-brand"><img src="./celestial-logo.svg" alt=""/><span>THE CELESTIAL PROJECT</span></div><p>AN IDOL SURVIVAL · REAL VOICE · COMMUNITY · ROLE-PLAY</p><small>© 2027 THE CELESTIAL PROJECT. ALL RIGHTS RESERVED.</small></footer>
    {isStaff&&<button className="staff-fab" onClick={()=>go('admin')}><Shield size={15}/> STAFF CONTROL ROOM</button>}
  </div>
}

function PageHeading({eyebrow,title,desc}){return <div className="page-heading"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{desc}</p><div className="heading-rule"><i/><span>✦</span><i/></div></div>}
function Home({banner,announcements,trainees,go}){
 return <><section className="hero"><div className="hero-copy"><span className="eyebrow"><span className="live-dot"/> OFFICIAL PROJECT · 2027</span><h1>FIND YOUR<br/><em>CONSTELLATION.</em></h1><p>เสียงจริง ความฝัน และเส้นทางสู่การเป็นไอดอล<br/>ทุกดวงดาวมีโอกาสเปล่งประกาย</p><div className="hero-actions"><button className="button button-primary" onClick={()=>go('trainees')}>MEET THE TRAINEES <ChevronRight size={16}/></button><button className="button button-outline" onClick={()=>go('rule')}>READ THE RULES</button></div><div className="hero-meta"><span><Radio size={14}/> IDOL SURVIVAL</span><span><Volume2 size={14}/> REAL VOICE</span><span><Orbit size={14}/> ROLE-PLAY</span></div></div><div className="hero-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="planet"><div className="planet-glow"/><img src="./celestial-logo.svg" alt="The Celestial Project"/></div><span className="star-point p1">✦</span><span className="star-point p2">✧</span><span className="star-point p3">✦</span><span className="art-caption">THE STARS ARE WAITING FOR YOU</span></div></section>
 <section className="banner-section"><div className="section-label"><span>01 / THE TRANSMISSION</span><span>PROJECT NEWS</span></div><div className="feature-banner"><div className="banner-visual"><div className="banner-moon"/><div className="banner-orbit"/></div><div className="banner-content"><span className="eyebrow">ANNOUNCEMENT · {banner.title==='A NEW CONSTELLATION BEGINS'?'COMING SOON':'OFFICIAL UPDATE'}</span><h2>{banner.title}</h2><p>{banner.subtitle}</p><button className="arrow-link" onClick={()=>go('schedule')}>EXPLORE THE JOURNEY <ChevronRight size={15}/></button></div></div></section>
 <section className="home-section"><div className="section-label"><span>02 / THE LINEUP</span><button onClick={()=>go('trainees')}>VIEW ALL TRAINEES <ChevronRight size={14}/></button></div><div className="mini-trainees">{trainees.slice(0,3).map((t,i)=><div className="mini-trainee" key={t.id}><span className="mini-rank">0{i+1}</span><div className="mini-avatar">{t.image_url?<img src={t.image_url} alt=""/>:<Star/>}</div><div><h3>{t.stage_name}</h3><p>{t.tagline||'A new star in the making'}</p></div><span className="status">{t.status}</span></div>)}</div></section>
 <section className="home-section announcement-section"><div className="section-label"><span>03 / LATEST SIGNAL</span><span>FROM THE CONTROL ROOM</span></div>{announcements.length?announcements.map(a=><article className="announcement" key={a.id}><span>{new Date(a.created_at).toLocaleDateString('en-GB')}</span><div><h3>{a.title}</h3><p>{a.body}</p></div><Megaphone size={17}/></article>):<div className="announcement empty-announcement"><span>11.11.2026</span><div><h3>WELCOME TO THE CELESTIAL PROJECT</h3><p>พื้นที่แห่งเสียงจริง ความฝัน และมิตรภาพ — official transmission begins soon.</p></div><Megaphone size={17}/></div>}</section>
 <section className="cta-strip"><div><span className="eyebrow">YOUR JOURNEY STARTS HERE</span><h2>READY TO JOIN THE UNIVERSE?</h2></div><button className="button button-primary" onClick={()=>go('fanclub')}>BECOME A FAN <ChevronRight size={16}/></button></section></>
}
function TraineeCard({t,index}){return <article className="trainee-card"><div className="trainee-image">{t.image_url?<img src={t.image_url} alt={t.stage_name}/>:<div className="avatar-placeholder"><span>✦</span><small>CELESTIAL<br/>TRAINEE</small></div>}<span className="rank-badge">RANK {String(t.rank_no||index+1).padStart(2,'0')}</span><span className="trainee-status">{t.status}</span></div><div className="trainee-info"><span className="eyebrow">THE CELESTIAL PROJECT</span><h2>{t.stage_name}</h2><p>{t.tagline||'A voice waiting to be discovered.'}</p><div className="trainee-foot"><span><Star size={13}/> {Number(t.vote_count||t.votes||0).toLocaleString()} SUPPORT</span><span>DISCOVER <ChevronRight size={13}/></span></div></div></article>}
function Schedule({events}){const [month,setMonth]=useState(10);const [year,setYear]=useState(2027);const months=['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];const filtered=events.filter(e=>{const d=new Date(e.event_date+'T00:00:00');return d.getMonth()===month&&d.getFullYear()===year});function shift(n){let d=new Date(year,month+n,1);setMonth(d.getMonth());setYear(d.getFullYear())}return <section className="page-wrap"><PageHeading eyebrow="MISSION TIMELINE" title="SCHEDULE" desc="ปฏิทินภารกิจและกิจกรรมประจำโปรเจกต์ · NOV 2027 — MAR 2028"/><div className="calendar-panel"><div className="calendar-head"><div><span className="eyebrow">OFFICIAL CALENDAR</span><h2>{months[month]} <em>{year}</em></h2></div><div className="calendar-controls"><button onClick={()=>shift(-1)}>←</button><button onClick={()=>shift(1)}>→</button></div></div><div className="calendar-grid">{['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d=><span className="day-name" key={d}>{d}</span>)}{Array.from({length:new Date(year,month,1).getDay()},(_,i)=><span key={'b'+i}/>)}{Array.from({length:new Date(year,month+1,0).getDate()},(_,i)=>{const day=i+1;const has=events.some(e=>{let d=new Date(e.event_date+'T00:00:00');return d.getDate()===day&&d.getMonth()===month&&d.getFullYear()===year});return <span key={day} className={has?'calendar-day has-event':'calendar-day'}>{day}{has&&<i/>}</span>})}</div><div className="event-list"><h3>MISSION DETAILS</h3>{filtered.length?filtered.map(e=><div className="event-row" key={e.id}><span>{new Date(e.event_date+'T00:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short'})}</span><div><b>{e.title}</b><p>{e.description}</p></div><CalendarDays size={17}/></div>):<p className="muted">No scheduled transmissions for this month.</p>}</div></div></section>}
function EmptyState({icon,title,text}){return <div className="empty-state"><div>{icon}</div><h2>{title}</h2><p>{text}</p></div>}
function AdminPanel({tab,setTab,form,setForm,trainees,addRecord,updateTrainee,reload}){const tabs=[['overview','OVERVIEW'],['trainees','TRAINEES'],['content','CONTENT'],['calendar','CALENDAR'],['uniform','UNIFORM']];const change=(k,v)=>setForm(f=>({...f,[k]:v}));return <div className="admin-shell"><aside className="admin-sidebar">{tabs.map(([id,l])=><button className={tab===id?'selected':''} onClick={()=>setTab(id)} key={id}>{l}<ChevronRight size={14}/></button>)}</aside><div className="admin-content">{tab==='overview'&&<><div className="admin-welcome"><span className="eyebrow">SYSTEM STATUS · ONLINE</span><h2>Good evening, <em>Team.</em></h2><p>Control the story. Keep every star in orbit.</p></div><div className="stats-grid"><div><Users/><b>{trainees.length}</b><span>TRAINEES</span></div><div><CalendarDays/><b>5</b><span>PROJECT MONTHS</span></div><div><Shield/><b>08</b><span>STAFF SEATS</span></div></div><p className="muted">ใช้เมนูด้านซ้ายเพื่อจัดการข้อมูลหน้าเว็บไซต์ การเปลี่ยนแปลงจะบันทึกลง Supabase</p></>}
 {tab==='trainees'&&<><h2>TRAINEE MANAGEMENT</h2><div className="admin-form"><label>STAGE NAME<input value={form.stage_name} onChange={e=>change('stage_name',e.target.value)}/></label><label>RANK<input type="number" value={form.rank_no} onChange={e=>change('rank_no',Number(e.target.value))}/></label><label>STATUS<select value={form.status} onChange={e=>change('status',e.target.value)}><option>ACTIVE</option><option>RISING</option><option>ELIMINATED</option><option>WINNER</option></select></label><label>IMAGE URL<input value={form.image_url} onChange={e=>change('image_url',e.target.value)} placeholder="https://..."/></label><label className="wide">TAGLINE<input value={form.tagline} onChange={e=>change('tagline',e.target.value)}/></label><button className="button button-primary" onClick={()=>addRecord('trainees',{stage_name:form.stage_name,rank_no:Number(form.rank_no),status:form.status,image_url:form.image_url||null,tagline:form.tagline})}><Plus size={15}/> ADD TRAINEE</button></div><div className="admin-table">{trainees.map(t=><div className="admin-row" key={t.id}><b>#{t.rank_no} {t.stage_name}</b><select value={t.status} onChange={e=>updateTrainee(t.id,{status:e.target.value})}><option>ACTIVE</option><option>RISING</option><option>ELIMINATED</option><option>WINNER</option></select><input aria-label="Rank" type="number" defaultValue={t.rank_no} onBlur={e=>updateTrainee(t.id,{rank_no:Number(e.target.value)})}/></div>)}</div></>}
 {tab==='content'&&<><h2>ANNOUNCEMENTS & BANNERS</h2><div className="admin-form"><label>TITLE<input value={form.title} onChange={e=>change('title',e.target.value)}/></label><label>SUBTITLE<input value={form.subtitle} onChange={e=>change('subtitle',e.target.value)}/></label><label className="wide">BODY / DESCRIPTION<textarea value={form.description} onChange={e=>change('description',e.target.value)}/></label><label className="wide">IMAGE URL<input value={form.image_url} onChange={e=>change('image_url',e.target.value)}/></label><button className="button button-primary" onClick={()=>addRecord('announcements',{title:form.title,body:form.description,is_published:true})}><Plus size={15}/> PUBLISH ANNOUNCEMENT</button><button className="button button-outline" onClick={()=>addRecord('banners',{title:form.title,subtitle:form.subtitle,image_url:form.image_url,is_active:true,sort_order:1})}><ImageIcon size={15}/> ADD BANNER</button><button className="button button-outline" onClick={()=>addRecord('polls',{title:form.title,description:form.description,is_active:true})}><Trophy size={15}/> OPEN VOTING ROUND</button></div></>}
 {tab==='calendar'&&<><h2>ADD PROGRAMME</h2><div className="admin-form"><label>DATE<input type="date" value={form.event_date} onChange={e=>change('event_date',e.target.value)}/></label><label>TITLE<input value={form.title} onChange={e=>change('title',e.target.value)}/></label><label className="wide">DESCRIPTION<input value={form.description} onChange={e=>change('description',e.target.value)}/></label><button className="button button-primary" onClick={()=>addRecord('calendar_events',{event_date:form.event_date,title:form.title,description:form.description})}><Plus size={15}/> ADD TO CALENDAR</button></div></>}
 {tab==='uniform'&&<><h2>UNIFORM ARCHIVE</h2><div className="admin-form"><label>TITLE<input value={form.title} onChange={e=>change('title',e.target.value)}/></label><label>CATEGORY<input value={form.subtitle} onChange={e=>change('subtitle',e.target.value)}/></label><label className="wide">IMAGE URL<input value={form.image_url} onChange={e=>change('image_url',e.target.value)}/></label><label className="wide">DESCRIPTION<textarea value={form.description} onChange={e=>change('description',e.target.value)}/></label><button className="button button-primary" onClick={()=>addRecord('uniforms',{title:form.title,category:form.subtitle,image_url:form.image_url,description:form.description})}><Plus size={15}/> ADD UNIFORM</button></div></>}
 <button className="refresh-button" onClick={reload}><RefreshCw size={14}/> REFRESH DATA</button>
 </div></div>}
