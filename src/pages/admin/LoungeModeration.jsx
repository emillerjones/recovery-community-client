import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import MemberAvatar from '../../components/MemberAvatar';
import { Toast, useToast } from '../../components/Toast';
import './LoungeModeration.css';
import './ReviewActionsDialog.css';
import LoungeThresholds from './LoungeThresholds';

const API=import.meta.env.VITE_API;
const date=value=>new Date(value).toLocaleString();
const category=value=>value.replaceAll('/',' / ').replaceAll('-',' ');

function Dialog({ title, children, onClose, busy=false }) {
  const ref=useRef(null);
  const titleId='lounge-review-dialog-title';
  useEffect(()=>{ const dialog=ref.current; dialog.showModal(); return()=>dialog.close(); },[]);
  return <dialog ref={ref} className="review-actions-dialog lounge-review-dialog" aria-labelledby={titleId}
    onCancel={event=>{event.preventDefault();if(!busy)onClose();}}>
    <h2 id={titleId}>{title}</h2>{children}
    <footer><button autoFocus type="button" disabled={busy} onClick={onClose}>Cancel</button></footer>
  </dialog>;
}

function ResultCard({ item, request, canDelete, onChanged, showToast, reviewed }) {
  const navigate=useNavigate();
  const {user,token}=useAuth();
  const [dialog,setDialog]=useState(null);
  const [context,setContext]=useState(null);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [expanded,setExpanded]=useState(false);
  const lock=useRef(false);
  const targetRef=useRef(null);
  const scores=item.response?.results?.[0]?.category_scores||{};
  useEffect(()=>{ if(context&&dialog==='context')targetRef.current?.scrollIntoView({block:'center'}); },[context,dialog]);

  async function run(work) {
    if(lock.current)return;
    lock.current=true;setBusy(true);setError('');
    try {await work();} catch(err) {setError(err.message);} finally {lock.current=false;setBusy(false);}
  }
  function close() {if(lock.current)return;setDialog(null);setError('');}
  async function act(action) {
    await run(async()=>{
      await request(`/results/${item.result_id}/review`,{method:'POST',body:JSON.stringify({action})});
      setDialog(null);
      showToast(action==='delete'?'Message deleted from the Lounge.':'Message kept. Concern cleared.');
      await onChanged();
    });
  }
  async function openContext() {
    setDialog('context');setContext(null);
    await run(async()=>setContext((await request(`/messages/${item.message_id}/context`)).messages));
  }
  async function openDM() {
    await run(async()=>{
      const response=await fetch(`${API}/api/messages/conversations`,{
        method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({username:item.author_username}),
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok||!data.conversation_id)throw new Error(data.message||'Could not open a direct message.');
      navigate(`/messages/${data.conversation_id}`);
    });
  }
  const self=Number(item.author_id)===Number(user?.id||user?.user_id);
  return <article className="lounge-review__card">
    <header className="lounge-review__card-bar"><span className="lounge-review__badge">{reviewed?item.review_status==='deleted'?'Deleted':'Concern cleared':'AI concern'}</span>
      <span>Community Lounge</span><div className="lounge-review__actions">
        <button type="button" disabled={busy} onClick={openContext}>View context</button>
        {!reviewed&&<button className="lounge-review__primary" type="button" onClick={()=>{setError('');setDialog('actions');}}>Review Actions</button>}
      </div>
    </header>
    <div className="lounge-review__message"><div className="lounge-review__author">
      <MemberAvatar username={item.author_username} avatarUrl={item.avatar_url} size={44}/>
      <div><strong>{item.author_username}</strong><small>{date(item.message_created_at)}</small>
        <button type="button" disabled={busy||!item.author_id||self} onClick={openDM}>Message author (DM)</button>
        <small>{self?'This is your account.':'Open a private conversation about this message.'}</small>
      </div></div><div><p>{expanded||item.content_snapshot?.length<=200?item.content_snapshot:item.content_snapshot?.slice(0,200)+'…'}</p>
        {item.content_snapshot?.length>200&&<button type="button" className="lounge-review__expand" aria-expanded={expanded} onClick={()=>setExpanded(value=>!value)}>{expanded?'Show less':'Show full message'}</button>}
      </div>
    </div>
    {error&&!dialog&&<p role="alert" className="lounge-review__error">{error}</p>}
    <section className="lounge-review__report"><header><h2>AI report card</h2><small>Checked {date(item.checked_at)}</small></header>
      <div className="lounge-review__table-wrap"><table><thead><tr><th>Category</th><th>Model score</th><th>Review threshold</th></tr></thead>
        <tbody>{(item.triggered_categories||[]).map(key=><tr key={key}><th scope="row">{category(key)}</th><td title={String(scores[key])}>{scores[key]?.toFixed(4)}</td><td>{item.thresholds_used?.[key]}</td></tr>)}</tbody></table></div>
      <p>These scores reached or exceeded the cutoffs saved for this check.</p>
      <small>AI signals support human review; they do not establish a guideline violation. Scores are rounded for display; decisions use the full values.</small>
      <details><summary>View all categories and raw response</summary>
        <p>These are the cutoffs used when this message was checked. Later setting changes do not change this report card.</p>
        <div className="lounge-review__table-wrap"><table><caption>All category scores and cutoffs at check time</caption>
          <thead><tr><th>Category</th><th>Model score</th><th>Cutoff at check</th><th>Outcome</th></tr></thead>
          <tbody>{Object.entries(scores).map(([key,score])=>{
            const cutoff=item.thresholds_used?.[key],configured=typeof cutoff==='number',crossed=configured&&score>=cutoff;
            return <tr key={key} className={crossed?'is-triggered':'is-below'}><th scope="row">{category(key)}</th><td title={String(score)}>{Number(score).toFixed(4)}</td><td>{configured?String(cutoff):'Not configured'}</td><td>{crossed?'Human review':configured?'Below cutoff':'Not evaluated'}</td></tr>;
          })}</tbody></table></div>
        <small>Scores are rounded for display; decisions use the full values.</small>
        <p>Model: {item.model}</p><details><summary>Raw OpenAI response (technical details)</summary><pre>{JSON.stringify(item.response,null,2)}</pre></details>
      </details>
      {reviewed&&<ul className="lounge-review__history">{(item.actions||[]).map((action,index)=><li key={index}>{action.action==='delete'?'Deleted':'Kept and cleared'} by {action.reviewer_username||'former staff member'} · {date(action.created_at)}</li>)}</ul>}
    </section>
    {dialog&&<Dialog title={dialog==='context'?'Lounge message context':dialog==='delete'?'Confirm message deletion':dialog==='clear'?'Keep message and clear concern?':'Review Actions'} onClose={close} busy={busy}>
      {dialog==='context'?<><p>Nearby messages, in chronological order. The selected message is highlighted.</p>
        {busy&&!context&&<p role="status">Loading context…</p>}
        <div className="lounge-review__context">{context?.map(message=><article key={message.message_id}
          ref={String(message.message_id)===String(item.message_id)?targetRef:null}
          className={String(message.message_id)===String(item.message_id)?'is-target':''}>
          <strong>{message.author_username}</strong><small>{date(message.created_at)}</small><p>{message.deleted_at?'Message removed':message.body}</p>
        </article>)}</div>
      </>:dialog==='actions'?<>
        <p>AI has taken no action on this message. Choose what happens after your review.</p>
        <section className="review-actions-dialog__option"><div><h3>Keep message and clear concern</h3><p>The message stays visible. Removes this concern from the pending queue and records your decision.</p>
          <button type="button" onClick={()=>setDialog('clear')}>Keep message and clear concern</button></div></section>
        <section className="review-actions-dialog__option review-actions-dialog__option--delete"><div><h3>Delete message</h3><p>Removes this one message from the Lounge. Replies and other messages stay intact. A confirmation follows.</p><small>Admins and Owners only.</small>
          <button type="button" disabled={!canDelete} onClick={()=>setDialog('delete')}>Delete message</button></div></section>
      </>:<><p>{dialog==='delete'?'Remove this message from the Lounge? This is a soft delete; there is no member-facing restore control.':'Keep this message visible and clear its AI concern from the pending queue?'}</p>
        <blockquote><strong>{item.author_username}</strong><p>{item.content_snapshot}</p></blockquote>
        <p>No direct message or notification is sent automatically.</p>
        <button type="button" disabled={busy} onClick={()=>{setError('');setDialog('actions');}}>Back</button>{' '}
        <button type="button" className={dialog==='delete'?'review-actions-dialog__delete':''} disabled={busy||(dialog==='delete'&&!canDelete)} onClick={()=>act(dialog==='delete'?'delete':'clear')}>{busy?'Saving…':dialog==='delete'?'Confirm deletion':'Confirm keep and clear'}</button>
      </>}
      {error&&<p role="alert" className="lounge-review__error">{error}</p>}
    </Dialog>}
  </article>;
}

function OwnerControls({ processing, request, onSaved, showToast }) {
  const [change,setChange]=useState(null),[saving,setSaving]=useState(false),[error,setError]=useState('');
  const [history,setHistory]=useState(null),[historyError,setHistoryError]=useState('');
  const lock=useRef(false);
  async function save() {
    if(lock.current||!change)return;
    lock.current=true;setSaving(true);setError('');
    try {
      const result=await request('/settings',{method:'PATCH',body:JSON.stringify(change)});
      setChange(null);
      if(history!==null)await loadHistory();
      showToast(result.processing.enabled?'AI checks enabled.':result.processing.ownerEnabled?'Owner setting saved. Server configuration still prevents checks.':'AI checks paused. Messages will remain queued.');
      await onSaved();
    } catch(err){setError(err.message);} finally{lock.current=false;setSaving(false);}
  }
  async function loadHistory() {
    setHistoryError('');
    try{setHistory((await request('/settings')).history);}catch(err){setHistoryError(err.message);}
  }
  return <section className="lounge-review__controls" aria-label="Owner moderation controls">
    <label><input type="checkbox" checked={Boolean(processing.ownerEnabled)} disabled={saving}
      onChange={event=>{setError('');setChange({enabled:event.target.checked,revision:processing.settingsRevision});}}/>Enable AI checks</label>
    <strong>Owner setting: {processing.ownerEnabled?'Enabled':'Paused'}</strong>
    <p>Only Owners can change this. Paused messages stay queued; enabling checks processes the backlog, up to 90 days old. No AI notifications or automatic enforcement.</p>
    <small>Changes take effect within about 15 seconds. A request already in progress may finish.</small>
    {processing.updatedByUsername&&<small>Last changed by {processing.updatedByUsername} · {date(processing.updatedAt)}</small>}
    <details onToggle={event=>{if(event.currentTarget.open)void loadHistory();}}><summary>Setting change history</summary>
      {historyError&&<p role="alert">{historyError}</p>}
      {history===null&&!historyError&&<p>Open to load recent changes.</p>}
      {history?.length===0&&<p>No Owner changes recorded yet.</p>}
      <ul>{history?.map(entry=><li key={entry.change_id}>{entry.enabled?'Enabled':'Paused'} by {entry.changed_by_username||'former Owner'} · {date(entry.created_at)}</li>)}</ul>
    </details>
    {change&&<Dialog title={change.enabled?'Enable AI checks?':'Pause AI checks?'} busy={saving} onClose={()=>{if(!lock.current)setChange(null);}}>
      <p>{change.enabled?'New and queued Community Lounge text will be sent to OpenAI for automated checks when server configuration permits. AI concerns appear here for human review.':'Stops starting new checks. Messages stay visible and queued for when checks are enabled again. A request already in progress may finish.'}</p>
      {change.enabled&&(processing.mode!=='testing'||!processing.keyConfigured||processing.error)&&<p className="lounge-review__error">This saves the Owner setting, but checks will remain paused until Render allows testing mode, an API key is configured, and any configuration errors are fixed.</p>}
      <p>No AI notifications, automatic deletion, or automated replies are enabled by this setting.</p>
      {error&&<p role="alert" className="lounge-review__error">{error}</p>}
      <button type="button" disabled={saving} onClick={save}>{saving?'Saving…':change.enabled?'Confirm enable':'Confirm pause'}</button>
    </Dialog>}
  </section>;
}

function processingExplanation(processing) {
  if(processing.error)return processing.error;
  if(processing.enabled)return 'Checks are running. Messages remain visible; staff review concerns.';
  if(processing.mode!=='testing')return 'Render override is off. Set LOUNGE_MODERATION_MODE=testing once on the Express service to allow the Owner toggle to run checks.';
  if(!processing.keyConfigured)return 'The Express service needs an OpenAI API key before checks can run.';
  return 'Paused by an Owner. New messages stay queued. An Owner can enable checks below.';
}

export default function LoungeModeration() {
  const {token,user}=useAuth();
  const {toast,showToast}=useToast();
  const [data,setData]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(true);
  const [status,setStatus]=useState('pending'),[page,setPage]=useState(1),[search,setSearch]=useState(''),[draft,setDraft]=useState('');
  const [failures,setFailures]=useState(null),[retrying,setRetrying]=useState(null);
  const loadVersion=useRef(0);
  const request=useCallback(async(path,options={})=>{
    const response=await fetch(`${API}/api/lounge-moderation${path}`,{...options,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'}});
    const result=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(result.message||'Could not complete the request. Please try again.');
    return result;
  },[token]);
  const load=useCallback(async()=>{
    const version=++loadVersion.current;
    setLoading(true);setError('');
    try {const result=await request(`?status=${status}&page=${page}&search=${encodeURIComponent(search)}`);if(version===loadVersion.current)setData(result);}
    catch(err){if(version===loadVersion.current)setError(err.message);}
    finally{if(version===loadVersion.current)setLoading(false);}
  },[request,status,page,search]);
  useEffect(()=>{let cancelled=false;queueMicrotask(()=>{if(!cancelled)void load();});return()=>{cancelled=true;};},[load]);
  async function loadFailures(){try{setFailures((await request('/failures')).jobs);}catch(err){setError(err.message);}}
  async function retry(jobId){
    if(retrying)return;setRetrying(jobId);
    try{await request(`/jobs/${jobId}/retry`,{method:'POST'});await loadFailures();await load();showToast('Check queued for retry. Processing must be enabled to run it.');}
    catch(err){setError(err.message);}finally{setRetrying(null);}
  }
  function tab(next){setStatus(next);setPage(1);}
  return <main className="lounge-review">
    <h1>Lounge AI Review</h1><p>Review Community Lounge messages identified by automated checks.</p>
    {data&&<div className="lounge-review__notice" role="status"><strong>{data.processing.enabled?'AI checks running · Testing mode':data.processing.error?'Configuration needs attention':'AI processing paused'}</strong>
      <span>{processingExplanation(data.processing)}</span>
      <small>{data.queued} checks queued · {data.failed} failed checks · No automatic enforcement</small>
    </div>}
    {data&&user?.role_id===1&&<OwnerControls processing={data.processing} request={request} onSaved={load} showToast={showToast}/>}
    <LoungeThresholds request={request} canEdit={user?.role_id===1}/>
    <div className="lounge-review__toolbar"><div role="group" aria-label="Review status">
      <button type="button" aria-pressed={status==='pending'} onClick={()=>tab('pending')}>Pending {data?.pending??''}</button>
      <button type="button" aria-pressed={status==='reviewed'} onClick={()=>tab('reviewed')}>Reviewed</button></div>
      <form onSubmit={event=>{event.preventDefault();setSearch(draft.trim());setPage(1);}}><input aria-label="Search review messages" placeholder="Search review messages" value={draft} maxLength={200} onChange={event=>setDraft(event.target.value)}/><button>Search</button></form>
      <button type="button" onClick={load} disabled={loading}>Refresh</button>
    </div>
    {error&&<p role="alert" className="lounge-review__error">{error}</p>}
    {loading?<p role="status">Loading review queue…</p>:!error&&<>
      {!data?.items.length&&<p className="lounge-review__empty">{status==='pending'?'No Lounge messages are waiting for review.':'No reviewed messages match these filters.'}</p>}
      {data?.items.map(item=><ResultCard key={item.result_id} item={item} request={request} canDelete={[1,10].includes(user?.role_id)} onChanged={load} showToast={showToast} reviewed={status==='reviewed'}/>)}
      <div className="lounge-review__pagination"><button type="button" disabled={page===1} onClick={()=>setPage(value=>value-1)}>Previous</button><span>Page {page} · {data?.total??0} results</span><button type="button" disabled={!data?.hasMore} onClick={()=>setPage(value=>value+1)}>Next</button></div>
    </>}
    <details className="lounge-review__failures" onToggle={event=>{if(event.currentTarget.open)void loadFailures();}}><summary>Failed checks {data?.failed?`(${data.failed})`:''}</summary>
      <p>Failures never stop members posting. Retry checks after fixing the server configuration or API issue. Latest 50 shown.</p>
      {failures?.length===0&&<p>No checks need retrying.</p>}
      {failures?.map(job=><div key={job.job_id}><span>Message #{job.message_id} · {job.attempt_count} attempts · {job.last_error}</span><button type="button" disabled={Boolean(retrying)} onClick={()=>retry(job.job_id)}>{retrying===job.job_id?'Queueing…':'Retry check'}</button></div>)}
    </details>
    <Toast toast={toast}/>
  </main>;
}
