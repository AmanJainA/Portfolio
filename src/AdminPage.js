import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { db } from './supabase';
import './AdminPage.css';

const resources = [
  { key:'languages', label:'Languages', resource:'language', fields:[['name','Name'],['icon_url','Icon URL'],['icon_class','Icon class'],['level','Level'],['sort_order','Order']] },
  { key:'skills', label:'Skills', resource:'skill', fields:[['category','Category (box/technical/professional)'],['name','Name'],['description','Description'],['percent','Percent'],['icon_class','Icon class'],['icon_url','Icon URL'],['sort_order','Order']] },
  { key:'projects', label:'Projects', resource:'project', fields:[['title','Title'],['summary','Summary'],['image_url','Image URL'],['link','Project URL'],['repo_url','Repository URL'],['tech_stack','Tech stack (comma separated)'],['sort_order','Order']] },
  { key:'education', label:'Education', resource:'education', fields:[['period','Period'],['location','Location'],['title','Title'],['details','Details (one per line)'],['sort_order','Order']] },
  { key:'experience', label:'Work Experience', resource:'experience', fields:[['period','Period'],['company','Company'],['title','Title'],['details','Details (one per line)'],['sort_order','Order']] },
  { key:'social_links', label:'Social Platforms', resource:'social', fields:[['label','Label'],['url','URL'],['icon_class','Font Awesome icon class'],['sort_order','Order']] },
];

const empty = (fields) => fields.reduce((a,[key]) => ({...a,[key]:''}), {is_visible:true});

function AdminPage() {
  const [token,setToken] = useState(localStorage.getItem('portfolio_admin_token') || '');
  const [user,setUser] = useState(JSON.parse(localStorage.getItem('portfolio_admin_user') || 'null'));
  const [login,setLogin] = useState({email:'',password:''});
  const [data,setData] = useState(null);
  const [active,setActive] = useState('profile');
  const [editing,setEditing] = useState(null);
  const [form,setForm] = useState({});
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');

  const load = async () => {
    if (!token) return;
    setBusy(true);
    const {data: result,error} = await db.rpc('admin_get_all',{p_token:token});
    if(error){setMessage(error.message); setToken(''); localStorage.removeItem('portfolio_admin_token');}
    else setData(result);
    setBusy(false);
  };
  useEffect(()=>{load()},[token]);

  const doLogin = async (e) => {
    e.preventDefault(); setBusy(true); setMessage('');
    const {data:result,error}=await db.rpc('admin_login',{p_email:login.email,p_password:login.password});
    if(error || !result?.ok) setMessage(error?.message || result?.message || 'Login failed');
    else { localStorage.setItem('portfolio_admin_token',result.token); localStorage.setItem('portfolio_admin_user',JSON.stringify(result.user)); setToken(result.token); setUser(result.user); }
    setBusy(false);
  };

  const logout = async()=>{ if(token) await db.rpc('admin_logout',{p_token:token}); localStorage.removeItem('portfolio_admin_token');localStorage.removeItem('portfolio_admin_user');setToken('');setUser(null);setData(null); };

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
  const activeConfig=resources.find(r=>r.key===active);
  const items=active==='profile'?[profile]:data?.[active]||[];

  const startEdit=(item,config)=>{setEditing(item?.id||'new');setForm(item?{...item}:empty(config.fields));};
  const normalize=(config,payload)=>{
    const next={...payload};
    if(config.resource==='project')next.tech_stack=String(next.tech_stack||'').split(',').map(x=>x.trim()).filter(Boolean);
    if(config.resource==='education'||config.resource==='experience')next.details=String(next.details||'').split('\n').map(x=>x.trim()).filter(Boolean);
    return next;
  };

  return <div className="admin-shell">
    <aside className="admin-sidebar"><div className="admin-side-brand"><i className="fa-solid fa-layer-group"/> Portfolio CMS</div><div className="admin-user"><div className="admin-avatar">{(user?.username||'A')[0]}</div><div><b>{user?.username||'Admin'}</b><small>{user?.email}</small></div></div>
      <nav><button className={active==='profile'?'active':''} onClick={()=>{setActive('profile');setEditing(null)}}><i className="fa-solid fa-user"/> Profile</button>{resources.map(r=><button key={r.key} className={active===r.key?'active':''} onClick={()=>{setActive(r.key);setEditing(null)}}><i className={r.key==='projects'?'fa-solid fa-briefcase':r.key==='social_links'?'fa-solid fa-share-nodes':'fa-solid fa-layer-group'}/>{r.label}</button>)}<button onClick={()=>setActive('contact')} className={active==='contact'?'active':''}><i className="fa-solid fa-inbox"/> Contact Messages</button></nav>
      <button className="admin-logout" onClick={logout}><i className="fa-solid fa-right-from-bracket"/> Logout</button>
    </aside>
    <main className="admin-main"><header className="admin-top"><div><span>Dashboard</span><h1>{active==='profile'?'Profile Settings':active==='contact'?'Contact Messages':activeConfig?.label}</h1></div><a href={process.env.PUBLIC_URL || '/'} className="admin-view">View Portfolio <i className="fa-solid fa-arrow-up-right-from-square"/></a></header>
      {message&&<div className="admin-message">{message}</div>}
      {active==='profile' && <ProfileEditor profile={profile} onSave={(x)=>save('profile',x)} busy={busy}/>}
      {active==='contact' && <ContactList items={data?.contact||[]} onDelete={(id)=>remove('contact',id)}/>}
      {active!=='profile'&&active!=='contact'&&activeConfig && <section className="admin-section"><div className="admin-toolbar"><button className="admin-add" onClick={()=>startEdit(null,activeConfig)}>+ Add {activeConfig.label.replace(/s$/,'')}</button><span>{items.length} records</span></div>{editing && <ItemEditor config={activeConfig} form={form} setForm={setForm} onSave={()=>save(activeConfig.resource,normalize(activeConfig,form))} onCancel={()=>setEditing(null)} busy={busy}/>}<div className="admin-table">{items.map(item=><div className="admin-row" key={item.id}><div className="admin-row-main"><strong>{item.name||item.title||item.label}</strong><small>{item.category||item.company||item.url||item.level||''}</small></div><div className="admin-row-actions"><button onClick={()=>startEdit(item,activeConfig)}>Edit</button><button className="danger" onClick={()=>remove(activeConfig.resource,item.id)}>Delete</button></div></div>)}</div></section>}
    </main>
  </div>;
}

function ProfileEditor({profile,onSave,busy}){
 const [form,setForm]=useState(profile);const [same,setSame]=useState(profile.favicon_url===profile.profile_image_url);
 useEffect(()=>setForm(profile),[profile]);
 const change=(k,v)=>setForm({...form,[k]:v});
 const submit=e=>{e.preventDefault();onSave({...form,favicon_url:same?form.profile_image_url:form.favicon_url})};
 return <form className="admin-form profile-form" onSubmit={submit}><div className="profile-preview"><img src={form.profile_image_url} alt="profile"/><div><b>One profile image function</b><p>Use this same URL for the profile image and browser favicon.</p><label><input type="checkbox" checked={same} onChange={e=>setSame(e.target.checked)}/> Use profile image as favicon</label></div></div><div className="admin-form-grid">{[['full_name','Full name'],['username','Display username'],['hero_role','Hero role'],['hero_intro','Hero intro'],['profile_image_url','Profile image URL'],['favicon_url','Favicon URL'],['resume_url','Resume URL'],['email','Email'],['phone','Phone'],['location','Location'],['contact_heading','Contact heading'],['contact_description','Contact description']].map(([k,l])=><label key={k}>{l}{['hero_intro','about_text','contact_description'].includes(k)?<textarea value={form[k]||''} onChange={e=>change(k,e.target.value)}/>:<input value={form[k]||''} onChange={e=>change(k,e.target.value)}/>}</label>)}<label className="wide">About Me<textarea rows="7" value={form.about_text||''} onChange={e=>change('about_text',e.target.value)}/></label></div><button className="admin-save" disabled={busy}>Save Profile</button></form>
}

function ItemEditor({config,form,setForm,onSave,onCancel,busy}){
 return <div className="admin-editor"><div className="admin-editor-head"><h3>Edit {config.label}</h3><button onClick={onCancel}>×</button></div><div className="admin-form-grid">{config.fields.map(([k,label])=><label key={k} className={['description','summary','details'].includes(k)?'wide':''}>{label}{['description','summary','details'].includes(k)?<textarea rows="5" value={Array.isArray(form[k])?form[k].join('\n'):form[k]||''} onChange={e=>setForm({...form,[k]:e.target.value})}/>:<input value={Array.isArray(form[k])?form[k].join(', '):form[k]||''} onChange={e=>setForm({...form,[k]:e.target.value})}/>}</label>)}</div><div className="admin-editor-actions"><button onClick={onCancel}>Cancel</button><button className="admin-save" onClick={onSave} disabled={busy}>Save Changes</button></div></div>
}

function ContactList({items,onDelete}){return <section className="admin-section"><div className="admin-toolbar"><span>{items.length} messages</span></div><div className="admin-message-list">{items.map(x=><article key={x.id} className="contact-admin-card"><div><span>{new Date(x.created_at).toLocaleString()}</span><h3>{x.subject||'No subject'}</h3><b>{x.name} · {x.email}</b></div><p>{x.message}</p><button className="danger" onClick={()=>onDelete(x.id)}>Delete</button></article>)}</div></section>}
export default AdminPage;
