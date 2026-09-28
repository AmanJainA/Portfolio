import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { db } from './supabase';
import './AdminPage.css';

const resources = [
  { key:'languages', label:'Languages', resource:'language', fields:[['name','Name','text'],['icon_url','Icon URL','url'],['icon_class','Icon class','text'],['level','Level','text'],['sort_order','Order','number'],['is_visible','Visible','boolean']] },
  { key:'skills', label:'Skills', resource:'skill', fields:[['category','Category','select:box|technical|professional'],['name','Name','text'],['description','Description','textarea'],['percent','Percent','number'],['icon_class','Icon class','text'],['icon_url','Icon URL','url'],['sort_order','Order','number'],['is_visible','Visible','boolean']] },
  { key:'projects', label:'Projects', resource:'project', fields:[['title','Title','text'],['summary','Summary','textarea'],['image_url','Image URL','url'],['link','Project URL','url'],['repo_url','Repository URL','url'],['tech_stack','Tech stack (comma separated)','text'],['sort_order','Order','number'],['is_visible','Visible','boolean']] },
  { key:'education', label:'Education', resource:'education', fields:[['period','Period','text'],['location','Location','text'],['title','Title','text'],['details','Details (one per line)','textarea'],['sort_order','Order','number'],['is_visible','Visible','boolean']] },
  { key:'experience', label:'Work Experience', resource:'experience', fields:[['period','Period','text'],['company','Company','text'],['title','Title','text'],['details','Details (one per line)','textarea'],['sort_order','Order','number'],['is_visible','Visible','boolean']] },
  { key:'social_links', label:'Social Platforms', resource:'social', fields:[['label','Label','text'],['url','URL','url'],['icon_class','Font Awesome icon class','text'],['sort_order','Order','number'],['is_visible','Visible','boolean']] },
];

const empty = (fields) => fields.reduce((a,[key]) => ({...a,[key]:''}), {is_visible:true});

function AdminPage() {
  const [token,setToken] = useState(localStorage.getItem('portfolio_admin_token') || '');
  const [user,setUser] = useState(JSON.parse(localStorage.getItem('portfolio_admin_user') || 'null'));
  const [login,setLogin] = useState({email:'',password:''});
  const [data,setData] = useState(null);
  const [active,setActive] = useState('dashboard');
  const [editing,setEditing] = useState(null);
  const [form,setForm] = useState({});
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');
  const [search,setSearch] = useState('');
  const [sidebarOpen,setSidebarOpen] = useState(false);
  const [lastSync,setLastSync] = useState(null);
  const [theme,setTheme] = useState(localStorage.getItem('portfolio_admin_theme') || 'light');
  const [pageSize,setPageSize] = useState(10);
  const [page,setPage] = useState(1);

  const load = async () => {
    if (!token) return;
    setBusy(true);
    const {data: result,error} = await db.rpc('admin_get_all',{p_token:token});
    if(error){setMessage(error.message); setToken(''); setUser(null); localStorage.removeItem('portfolio_admin_token'); localStorage.removeItem('portfolio_admin_user');}
    else { setData(result); setLastSync(new Date()); }
    setBusy(false);
  };
  useEffect(()=>{load()},[token]);
  useEffect(()=>{setSearch('');setEditing(null);setPage(1)},[active]);
  useEffect(()=>{document.documentElement.setAttribute('data-admin-theme',theme);localStorage.setItem('portfolio_admin_theme',theme)},[theme]);

  const doLogin = async (e) => {
    e.preventDefault(); setBusy(true); setMessage('');
    const {data:result,error}=await db.rpc('admin_login',{p_email:login.email,p_password:login.password});
    if(error || !result?.ok) setMessage(error?.message || result?.message || 'Login failed');
    else { localStorage.setItem('portfolio_admin_token',result.token); localStorage.setItem('portfolio_admin_user',JSON.stringify(result.user)); setToken(result.token); setUser(result.user); }
    setBusy(false);
  };

  const logout = async()=>{ if(token) await db.rpc('admin_logout',{p_token:token}); localStorage.removeItem('portfolio_admin_token');localStorage.removeItem('portfolio_admin_user');setToken('');setUser(null);setData(null);setLastSync(null);setSearch('');setSidebarOpen(false); };

  const save = async(resource,payload)=>{
    setBusy(true);setMessage('');
    const {data:result,error}=await db.rpc('admin_upsert',{p_token:token,p_resource:resource,p_data:payload});
    if(error){setMessage(error.message)} else {setMessage('Saved successfully.');await load();setEditing(null);}
    setBusy(false);
  };
  const remove = async(resource,id)=>{
    if(!window.confirm('Delete this item?')) return;
    setBusy(true); const {error}=await db.rpc('admin_delete',{p_token:token,p_resource:resource,p_id:id});
    if(error)setMessage(error.message);else{setMessage('Deleted.');await load();}
    setBusy(false);
  };

  if(!token) return <div className="admin-login"><motion.form className="admin-login-card" onSubmit={doLogin} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}><div className="admin-logo"><i className="fa-solid fa-layer-group"/></div><span>PORTFOLIO CMS</span><h1>Admin Login</h1><p>Manage every public section from one place.</p><input type="email" placeholder="Admin email" value={login.email} onChange={e=>setLogin({...login,email:e.target.value})} required/><input type="password" placeholder="Password" value={login.password} onChange={e=>setLogin({...login,password:e.target.value})} required/><button disabled={busy}>{busy?'Signing in…':'Sign in'}</button>{message&&<small>{message}</small>}</motion.form></div>;

  const profile=data?.profile||{};
  const counts = {
    projects: data?.projects?.length || 0,
    skills: data?.skills?.length || 0,
    languages: data?.languages?.length || 0,
    education: data?.education?.length || 0,
    experience: data?.experience?.length || 0,
    social_links: data?.social_links?.length || 0,
    contacts: data?.contact?.length || 0,
  };
  const activeConfig=resources.find(r=>r.key===active);
  const items=active==='profile'?[profile]:data?.[active]||[];
  const filteredItems=(!search.trim() || active==='profile' || active==='dashboard' || active==='contact') ? items : items.filter(item=>Object.values(item||{}).some(value=>Array.isArray(value)?value.join(' ').toLowerCase().includes(search.toLowerCase()):String(value??'').toLowerCase().includes(search.toLowerCase())));
  const pageCount=Math.max(1,Math.ceil(filteredItems.length/pageSize));
  const safePage=Math.min(page,pageCount);
  const pagedItems=filteredItems.slice((safePage-1)*pageSize,safePage*pageSize);

  const startEdit=(item,config)=>{setEditing(item?.id||'new');setForm(item?{...item}:empty(config.fields));};
  const normalize=(config,payload)=>{
    const next={...payload};
    if(config.resource==='project')next.tech_stack=Array.isArray(next.tech_stack)?next.tech_stack:String(next.tech_stack||'').split(',').map(x=>x.trim()).filter(Boolean);
    if(config.resource==='education'||config.resource==='experience')next.details=Array.isArray(next.details)?next.details:String(next.details||'').split('\n').map(x=>x.trim()).filter(Boolean);
    if(next.percent!==undefined&&next.percent!=='')next.percent=Math.max(0,Math.min(100,Number(next.percent)));
    if(next.sort_order!==undefined&&next.sort_order!=='')next.sort_order=Number(next.sort_order);
    return next;
  };

  return <div className={`admin-shell ${sidebarOpen?'sidebar-open':''}`}>
    <button type="button" className="admin-sidebar-overlay" aria-label="Close menu" onClick={()=>setSidebarOpen(false)}/>
    <aside className="admin-sidebar"><div className="admin-side-brand"><i className="fa-solid fa-layer-group"/> Portfolio CMS</div><div className="admin-user"><div className="admin-avatar">{(user?.username||'A')[0]}</div><div><b>{user?.username||'Admin'}</b><small>{user?.email}</small></div></div>
      <nav><button className={active==='dashboard'?'active':''} onClick={()=>{setActive('dashboard');setEditing(null);setSidebarOpen(false)}}><i className="fa-solid fa-chart-pie"/> Dashboard</button><button className={active==='profile'?'active':''} onClick={()=>{setActive('profile');setEditing(null);setSidebarOpen(false)}}><i className="fa-solid fa-user"/> Profile</button>{resources.map(r=><button key={r.key} className={active===r.key?'active':''} onClick={()=>{setActive(r.key);setEditing(null);setSidebarOpen(false)}}><i className={r.key==='projects'?'fa-solid fa-briefcase':r.key==='social_links'?'fa-solid fa-share-nodes':'fa-solid fa-layer-group'}/>{r.label}</button>)}<button onClick={()=>{setActive('contact');setSidebarOpen(false)}} className={active==='contact'?'active':''}><i className="fa-solid fa-inbox"/> Contact Messages</button></nav>
      <button className="admin-logout" onClick={logout}><i className="fa-solid fa-right-from-bracket"/> Logout</button>
    </aside>
    <main className="admin-main"><header className="admin-top"><button type="button" className="admin-menu-toggle" onClick={()=>setSidebarOpen(true)} aria-label="Open menu"><i className="fa-solid fa-bars"/></button><div><span>Portfolio CMS</span><h1>{active==='dashboard'?'Dashboard':active==='profile'?'Profile Settings':active==='contact'?'Contact Messages':activeConfig?.label}</h1></div><div className="admin-top-actions">{lastSync&&<span className="admin-sync"><i className="fa-solid fa-circle-check"/> Synced {lastSync.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>}<button key={`admin-theme-${theme}`} type="button" className="admin-theme-toggle" onClick={()=>setTheme(theme==='dark'?'light':'dark')} title="Toggle theme"><i className={`fa-solid ${theme==='dark'?'fa-sun':'fa-moon'}`}/><span>{theme==='dark'?'Light':'Dark'}</span></button><button type="button" className="admin-refresh" onClick={load} disabled={busy}><i className={`fa-solid fa-rotate ${busy?'spin':''}`}/> Refresh</button><a href={process.env.PUBLIC_URL || '/'} className="admin-view">View Portfolio <i className="fa-solid fa-arrow-up-right-from-square"/></a></div></header>
      {message&&<div className="admin-message">{message}</div>}
      {active==='dashboard' && <Dashboard data={data} profile={profile} counts={counts} onOpen={(key)=>{setActive(key);setSearch('')}} lastSync={lastSync}/>} {active==='profile' && <ProfileEditor profile={profile} onSave={(x)=>save('profile',x)} busy={busy}/>}
      {active==='contact' && <ContactList items={data?.contact||[]} onDelete={(id)=>remove('contact',id)}/>}
      {active!=='profile'&&active!=='contact'&&activeConfig && <section className="admin-section"><div className="admin-toolbar"><div className="admin-toolbar-left"><button className="admin-add" onClick={()=>startEdit(null,activeConfig)}>+ Add {activeConfig.label.replace(/s$/,'')}</button><span>{filteredItems.length} of {items.length} records</span></div><div className="admin-table-tools"><input className="admin-search" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder={`Search ${activeConfig.label.toLowerCase()}…`} aria-label="Search records"/><ExportMenu items={filteredItems} config={activeConfig}/></div></div><DataTable items={pagedItems} config={activeConfig} onEdit={item=>startEdit(item,activeConfig)} onDelete={id=>remove(activeConfig.resource,id)}/><Pagination page={safePage} pageCount={pageCount} pageSize={pageSize} setPage={setPage} setPageSize={n=>{setPageSize(n);setPage(1)}} total={filteredItems.length}/>{editing&&<ItemEditor config={activeConfig} form={form} setForm={setForm} onSave={()=>save(activeConfig.resource,normalize(activeConfig,form))} onCancel={()=>setEditing(null)} busy={busy}/>}</section>}}
    </main>
  </div>;
}



function Dashboard({data,profile,counts,onOpen,lastSync}){
  const projects=[...(data?.projects||[])].sort((a,b)=>(Number(a.sort_order)||0)-(Number(b.sort_order)||0)).slice(0,5);
  const messages=[...(data?.contact||[])].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,4);
  const profileFields=[
    ['full_name','Full name'],['hero_role','Hero role'],['hero_intro','Hero intro'],
    ['about_text','About text'],['profile_image_url','Profile image'],['email','Email'],
    ['phone','Phone'],['location','Location'],['resume_url','Resume']
  ];
  const completed=profileFields.filter(([k])=>String(profile?.[k]||'').trim()).length;
  const completeness=Math.round((completed/profileFields.length)*100);
  const contentStats=[
    ['Projects',counts.projects,'projects','fa-briefcase'],
    ['Skills',counts.skills,'skills','fa-code'],
    ['Experience',counts.experience,'experience','fa-building'],
    ['Education',counts.education,'education','fa-graduation-cap'],
    ['Languages',counts.languages,'languages','fa-globe'],
    ['Social links',counts.social_links,'social_links','fa-share-nodes']
  ];
  const totalContent=contentStats.reduce((sum,x)=>sum+x[1],0)||1;
  const visibility=counts.projects+counts.skills+counts.experience+counts.education+counts.languages+counts.social_links;
  const readiness=Math.min(100, Math.round((completeness*0.6)+(Math.min(visibility,30)/30*40)));
  const missing=profileFields.filter(([k])=>!String(profile?.[k]||'').trim());

  return (
    <section className="dashboard-page">
      <div className="dashboard-welcome">
        <div>
          <span className="dashboard-kicker">CONTROL CENTRE</span>
          <h2>Portfolio overview</h2>
          <p>Manage your public profile, content and incoming enquiries from one screen.</p>
        </div>
        <div className="dashboard-welcome-actions">
          <div className="dashboard-status-stack"><span className="dashboard-live"><i className="fa-solid fa-circle"/> CMS connected</span><span className="dashboard-readiness"><i className="fa-solid fa-gauge-high"/> Portfolio readiness <b>{readiness}%</b></span>{lastSync&&<small className="dashboard-sync">Updated {lastSync.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</small>}</div>
          <button type="button" onClick={()=>onOpen('profile')}><i className="fa-solid fa-pen"/> Edit Profile</button>
        </div>
      </div>

      <div className="dashboard-stat-grid">
        {[
          ['Projects',counts.projects,'fa-briefcase','projects'],
          ['Skills',counts.skills,'fa-code','skills'],
          ['Experience',counts.experience,'fa-building','experience'],
          ['Education',counts.education,'fa-graduation-cap','education'],
          ['Languages',counts.languages,'fa-globe','languages'],
          ['Messages',counts.contacts,'fa-inbox','contact']
        ].map(([label,value,icon,key])=>(
          <button type="button" key={label} className="dashboard-stat" onClick={()=>onOpen(key)}>
            <span className="dashboard-stat-icon"><i className={'fa-solid '+icon}/></span>
            <span><small>{label}</small><strong>{value}</strong></span>
            <i className="fa-solid fa-arrow-up-right-from-square dashboard-stat-arrow"/>
          </button>
        ))}
      </div>

      <div className="dashboard-main-grid">
        <article className="dashboard-card dashboard-profile-card">
          <div className="dashboard-card-head">
            <div><span>PROFILE HEALTH</span><h3>Profile completeness</h3></div>
            <strong>{completeness}%</strong>
          </div>
          <div className="dashboard-progress"><span style={{width:completeness+'%'}}/></div>
          <p>{completed} of {profileFields.length} key profile fields completed.</p>
          <div className="dashboard-checks">
            {profileFields.map(([k,label])=>(
              <span key={k} className={profile?.[k]?'done':''}>
                <i className={'fa-solid '+(profile?.[k]?'fa-check':'fa-minus')}/> {label}
              </span>
            ))}
          </div>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card-head">
            <div><span>PROFILE SNAPSHOT</span><h3>{profile?.full_name||'Your portfolio'}</h3></div>
            <button type="button" className="dashboard-link" onClick={()=>onOpen('profile')}>Edit</button>
          </div>
          <div className="dashboard-profile-row">
            {profile?.profile_image_url ? <img src={profile.profile_image_url} alt="Profile"/> : <div className="dashboard-avatar"><i className="fa-solid fa-user"/></div>}
            <div>
              <b>{profile?.hero_role||'Role not set'}</b>
              <small>{profile?.location||'Location not set'}</small>
              <small>{profile?.email||'Email not set'}</small>
            </div>
          </div>
          <div className="dashboard-mini-status">
            <span><i className="fa-solid fa-circle-check"/> {counts.projects} projects published</span>
            <span><i className="fa-solid fa-circle-check"/> {counts.skills} skills listed</span>
          </div>
        </article>
      </div>

      <div className="dashboard-two-column">
        <article className="dashboard-card">
          <div className="dashboard-card-head">
            <div><span>CONTENT ANALYTICS</span><h3>Portfolio structure</h3></div>
            <small className="dashboard-muted">{totalContent} records</small>
          </div>
          <div className="dashboard-bars">
            {contentStats.map(([label,value,key,icon])=>{
              const width=Math.max(value?Math.round((value/Math.max(...contentStats.map(x=>x[1]),1))*100):0,value?8:0);
              return (
                <button type="button" className="dashboard-bar-row" key={key} onClick={()=>onOpen(key)}>
                  <span className="dashboard-bar-label"><i className={'fa-solid '+icon}/>{label}<b>{value}</b></span>
                  <span className="dashboard-bar-track"><span style={{width:width+'%'}}/></span>
                </button>
              );
            })}
          </div>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card-head">
            <div><span>ACTION CENTRE</span><h3>Next updates</h3></div>
            <strong className="dashboard-count-badge">{missing.length}</strong>
          </div>
          {missing.length ? (
            <div className="dashboard-missing">
              {missing.slice(0,5).map(([key,label])=>(
                <button type="button" key={key} onClick={()=>onOpen('profile')}>
                  <span><i className="fa-solid fa-circle-exclamation"/>{label}</span>
                  <i className="fa-solid fa-arrow-right"/>
                </button>
              ))}
            </div>
          ) : (
            <div className="dashboard-complete"><i className="fa-solid fa-circle-check"/> All key profile fields are complete.</div>
          )}
        </article>
      </div>

      <div className="dashboard-card">
        <div className="dashboard-card-head">
          <div><span>RECENT CONTENT</span><h3>Latest projects</h3></div>
          <button type="button" className="dashboard-link" onClick={()=>onOpen('projects')}>Manage all</button>
        </div>
        {projects.length ? (
          <div className="dashboard-projects">
            {projects.map(x=>(
              <div className="dashboard-project" key={x.id}>
                <div className="dashboard-project-thumb">{x.image_url ? <img src={x.image_url} alt=""/> : <i className="fa-solid fa-code"/>}</div>
                <div className="dashboard-project-info">
                  <b>{x.title||'Untitled project'}</b>
                  <small>{Array.isArray(x.tech_stack)?x.tech_stack.join(' · '):(x.tech_stack||'No tech stack added')}</small>
                </div>
                <button type="button" onClick={()=>onOpen('projects')}><i className="fa-solid fa-arrow-right"/></button>
              </div>
            ))}
          </div>
        ) : <div className="dashboard-empty">No projects added yet.</div>}
      </div>

      <div className="dashboard-two-column">
        <article className="dashboard-card">
          <div className="dashboard-card-head">
            <div><span>INBOX</span><h3>Recent messages</h3></div>
            <button type="button" className="dashboard-link" onClick={()=>onOpen('contact')}>Open inbox</button>
          </div>
          {messages.length ? (
            <div className="dashboard-message-list">
              {messages.map(x=>(
                <button type="button" className="dashboard-message-row" key={x.id} onClick={()=>onOpen('contact')}>
                  <span className="dashboard-message-avatar">{(x.name||'?').trim().charAt(0).toUpperCase()}</span>
                  <span><b>{x.name||'Unknown sender'}</b><small>{x.subject||'No subject'} · {new Date(x.created_at).toLocaleDateString()}</small></span>
                  <i className="fa-solid fa-arrow-right"/>
                </button>
              ))}
            </div>
          ) : <div className="dashboard-empty">No contact messages yet.</div>}
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card-head">
            <div><span>QUICK ACTIONS</span><h3>Manage portfolio</h3></div>
          </div>
          <div className="dashboard-quick-grid">
            <button type="button" onClick={()=>onOpen('experience')}><i className="fa-solid fa-briefcase"/>Experience</button>
            <button type="button" onClick={()=>onOpen('skills')}><i className="fa-solid fa-code"/>Skills</button>
            <button type="button" onClick={()=>onOpen('education')}><i className="fa-solid fa-graduation-cap"/>Education</button>
            <button type="button" onClick={()=>onOpen('social_links')}><i className="fa-solid fa-share-nodes"/>Social</button>
          </div>
        </article>
      </div>
    </section>
  );
}
function sanitizeRichText(html) {
  if (!html) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(String(html), 'text/html');
  const allowed = new Set(['P','BR','STRONG','B','EM','I','U','SPAN','DIV']);
  doc.body.querySelectorAll('*').forEach((node) => {
    if (!allowed.has(node.tagName)) {
      node.replaceWith(...Array.from(node.childNodes));
      return;
    }
    Array.from(node.attributes).forEach((attr) => {
      if (attr.name !== 'style') node.removeAttribute(attr.name);
    });
    if (node.hasAttribute('style')) {
      const color = node.style.color;
      node.removeAttribute('style');
      if (color) node.style.color = color;
    }
  });
  return doc.body.innerHTML;
}

function RichTextEditor({label,value,onChange,placeholder}) {
  const editorRef = useRef(null);
  const savedSelection = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if (document.activeElement !== editorRef.current && editorRef.current.innerHTML !== (value || '')) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount || !editorRef.current?.contains(selection.anchorNode)) return;
    savedSelection.current = selection.getRangeAt(0).cloneRange();
  };

  const restoreSelection = () => {
    if (!savedSelection.current) return;
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedSelection.current);
  };

  const run = (command, commandValue=null) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand('styleWithCSS', false, true);
    document.execCommand(command, false, commandValue);
    onChange(sanitizeRichText(editorRef.current?.innerHTML || ''));
  };

  const handleInput = () => onChange(sanitizeRichText(editorRef.current?.innerHTML || ''));

  return (
    <div className="admin-rich-editor wide">
      <div className="admin-rich-editor-label">{label}</div>
      <div className="admin-rich-toolbar" role="toolbar" aria-label={label + ' formatting'}>
        <button type="button" title="Bold" onMouseDown={(e)=>e.preventDefault()} onClick={()=>run('bold')}><b>B</b></button>
        <button type="button" title="Italic" onMouseDown={(e)=>e.preventDefault()} onClick={()=>run('italic')}><i>I</i></button>
        <button type="button" title="Underline" onMouseDown={(e)=>e.preventDefault()} onClick={()=>run('underline')}><u>U</u></button>
        <label className="admin-color-picker" title="Text colour">
          <span>A</span>
          <input type="color" defaultValue="#fe655c" onMouseDown={saveSelection} onChange={(e)=>run('foreColor',e.target.value)} aria-label="Text colour"/>
        </label>
        <button type="button" title="Clear formatting" onMouseDown={(e)=>e.preventDefault()} onClick={()=>run('removeFormat')}>Tx</button>
      </div>
      <div
        ref={editorRef}
        className="admin-rich-content"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder || 'Write your content…'}
        onInput={handleInput}
        onBlur={handleInput}
      />
      <small className="admin-rich-hint">Select specific words, then use B, I, U or the colour picker. Formatting is saved with the profile.</small>
    </div>
  );
}

function ProfileEditor({profile,onSave,busy}){
 const [form,setForm]=useState(profile);const [same,setSame]=useState(profile.favicon_url===profile.profile_image_url);
 useEffect(()=>setForm(profile),[profile]);
 const change=(k,v)=>setForm({...form,[k]:v});
 const submit=e=>{e.preventDefault();onSave({...form,favicon_url:same?form.profile_image_url:form.favicon_url})};
 return <form className="admin-form profile-form" onSubmit={submit}>
   <div className="profile-preview"><img src={form.profile_image_url} alt="profile"/><div><b>One profile image function</b><p>Use this same URL for the profile image and browser favicon.</p><label><input type="checkbox" checked={same} onChange={e=>setSame(e.target.checked)}/> Use profile image as favicon</label></div></div>
   <div className="admin-form-grid">
     {[
       ['full_name','Full name'],['username','Display username'],['hero_role','Hero role'],
       ['profile_image_url','Profile image URL'],['favicon_url','Favicon URL'],['resume_url','Resume URL'],
       ['email','Email'],['phone','Phone'],['location','Location'],['contact_heading','Contact heading'],
       ['contact_description','Contact description']
     ].map(([k,l])=><label key={k}>{l}{k==='contact_description'?<textarea rows="4" value={form[k]||''} onChange={e=>change(k,e.target.value)}/>:<input value={form[k]||''} onChange={e=>change(k,e.target.value)}/>}</label>)}
     <RichTextEditor label="Hero Intro" value={form.hero_intro||''} onChange={v=>change('hero_intro',v)} placeholder="Write the short introduction shown in the Hero section…"/>
     <RichTextEditor label="About Me" value={form.about_text||''} onChange={v=>change('about_text',v)} placeholder="Write your About Me content…"/>
   </div>
   <button className="admin-save" disabled={busy}>Save Profile</button>
 </form>
}

function DataTable({ items, config, onEdit, onDelete }) {
  const renderCell = (item, key) => {
    if (key === 'is_visible') {
      return (
        <span className={item[key] ? 'status-on' : 'status-off'}>
          {item[key] ? 'Visible' : 'Hidden'}
        </span>
      );
    }

    if (key === 'image_url' && item[key]) {
      return <img className="table-thumb" src={item[key]} alt="" />;
    }

    if (Array.isArray(item[key])) {
      return item[key].join(', ');
    }

    if (item[key] === null || item[key] === undefined) {
      return '';
    }

    return String(item[key]);
  };

  return (
    <div className="admin-table-wrap">
      <table className="admin-data-table">
        <thead>
          <tr>
            <th>#</th>
            {config.fields.map(([key, label]) => (
              <th key={key}>{label}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item, index) => (
              <tr key={item.id || index}>
                <td>{index + 1}</td>
                {config.fields.map(([key]) => (
                  <td key={key}>{renderCell(item, key)}</td>
                ))}
                <td>
                  <div className="table-actions">
                    <button type="button" title="Edit" onClick={() => onEdit(item)}>
                      <i className="fa-solid fa-pen" />
                    </button>
                    <button type="button" title="Delete" className="danger" onClick={() => onDelete(item.id)}>
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={config.fields.length + 2} className="table-empty">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({page,pageCount,pageSize,setPage,setPageSize,total}){return <div className="admin-pagination"><span>Showing {total?((page-1)*pageSize+1):0}-{Math.min(page*pageSize,total)} of {total}</span><div><label>Rows <select value={pageSize} onChange={e=>setPageSize(Number(e.target.value))}>{[10,20,50,100].map(n=><option key={n}>{n}</option>)}</select></label><button disabled={page<=1} onClick={()=>setPage(page-1)}>‹</button><b>{page} / {pageCount}</b><button disabled={page>=pageCount} onClick={()=>setPage(page+1)}>›</button></div></div>}

function ExportMenu({items,config}){const [open,setOpen]=useState(false);const headers=config.fields.map(x=>x[1]);const rows=items.map(item=>config.fields.map(([k])=>Array.isArray(item[k])?item[k].join(', '):item[k]??''));const tsv=[headers,...rows].map(r=>r.map(v=>String(v).replace(/\t/g,' ').replace(/\n/g,' ')).join('\t')).join('\n');const download=(content,name,type)=>{const blob=new Blob([content],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)};const excel=()=>{const html='<table><tr>'+headers.map(h=>'<th>'+escapeHtml(h)+'</th>').join('')+'</tr>'+rows.map(r=>'<tr>'+r.map(v=>'<td>'+escapeHtml(v)+'</td>').join('')+'</tr>').join('')+'</table>';download('<html><body>'+html+'</body></html>',config.key+'-export.xls','application/vnd.ms-excel');setOpen(false)};const word=()=>{const html='<html><body><h2>'+escapeHtml(config.label)+'</h2><table border="1"><tr>'+headers.map(h=>'<th>'+escapeHtml(h)+'</th>').join('')+'</tr>'+rows.map(r=>'<tr>'+r.map(v=>'<td>'+escapeHtml(v)+'</td>').join('')+'</tr>').join('')+'</table></body></html>';download(html,config.key+'-export.doc','application/msword');setOpen(false)};const pdf=()=>{const w=window.open('','_blank','width=1100,height=800');if(!w)return;w.document.write('<html><head><title>'+escapeHtml(config.label)+'</title><style>body{font-family:Arial;padding:30px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:7px;text-align:left;font-size:11px}th{background:#eee}</style></head><body><h2>'+escapeHtml(config.label)+'</h2><table><tr>'+headers.map(h=>'<th>'+escapeHtml(h)+'</th>').join('')+'</tr>'+rows.map(r=>'<tr>'+r.map(v=>'<td>'+escapeHtml(v)+'</td>').join('')+'</tr>').join('')+'</table><script>window.onload=()=>window.print()</script></body></html>');w.document.close();setOpen(false)};return <div className="export-wrap"><button className="export-button" onClick={()=>setOpen(!open)}><i className="fa-solid fa-download"/> Export <i className="fa-solid fa-chevron-down"/></button>{open&&<div className="export-menu"><button onClick={()=>{navigator.clipboard?.writeText(tsv);setOpen(false)}}><i className="fa-solid fa-copy"/> Copy</button><button onClick={excel}><i className="fa-solid fa-file-excel"/> Excel</button><button onClick={word}><i className="fa-solid fa-file-word"/> Word</button><button onClick={pdf}><i className="fa-solid fa-file-pdf"/> PDF</button></div>}</div>}
const escapeHtml=(value)=>String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

function ItemEditor({config,form,setForm,onSave,onCancel,busy}){const change=(key,value)=>setForm({...form,[key]:value});return <div className="admin-modal-backdrop" role="dialog" aria-modal="true" onMouseDown={e=>{if(e.target===e.currentTarget)onCancel()}}><div className="admin-modal"><div className="admin-editor-head"><div><span>{form.id?'EDIT':'NEW'} RECORD</span><h3>{form.id?'Edit':'Add'} {config.label.replace(/s$/,'')}</h3></div><button onClick={onCancel}>×</button></div><div className="admin-form-grid">{config.fields.map(([k,label,type])=><label key={k} className={type==='textarea'?'wide':''}>{label}{type==='textarea'?<textarea rows="5" value={Array.isArray(form[k])?form[k].join('\n'):form[k]||''} onChange={e=>change(k,e.target.value)}/>:type==='boolean'?<select value={form[k]===false?'false':'true'} onChange={e=>change(k,e.target.value==='true')}><option value="true">Visible</option><option value="false">Hidden</option></select>:type?.startsWith('select:')?<select value={form[k]||''} onChange={e=>change(k,e.target.value)}><option value="">Select…</option>{type.slice(7).split('|').map(v=><option key={v} value={v}>{v}</option>)}</select>:<input type={type==='number'?'number':type==='url'?'url':'text'} value={Array.isArray(form[k])?form[k].join(', '):form[k]??''} onChange={e=>change(k,e.target.value)}/>}</label>)}</div><div className="admin-editor-actions"><button onClick={onCancel}>Cancel</button><button className="admin-save" onClick={onSave} disabled={busy}>{busy?'Saving…':'Save Changes'}</button></div></div></div>}

function ContactList({items,onDelete}){return <section className="admin-section"><div className="admin-toolbar"><span>{items.length} messages</span></div><div className="admin-message-list">{items.map(x=><article key={x.id} className="contact-admin-card"><div><span>{new Date(x.created_at).toLocaleString()}</span><h3>{x.subject||'No subject'}</h3><b>{x.name} · {x.email}</b></div><p>{x.message}</p><button className="danger" onClick={()=>onDelete(x.id)}>Delete</button></article>)}</div></section>}
export default AdminPage;
