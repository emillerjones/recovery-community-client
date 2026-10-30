import { useId, useRef, useState } from 'react';

function ThresholdRow({ category, canEdit, revision, request, onSaved, blocked }) {
  const [editing,setEditing]=useState(false),[draft,setDraft]=useState('');
  const [saving,setSaving]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(false);
  const lock=useRef(false),id=useId();
  const value=Number(draft);
  const valid=draft.trim()!==''&&Number.isFinite(value)&&value>=0&&value<=1;
  const dirty=valid&&value!==category.value;
  async function save(event) {
    event.preventDefault();
    if(lock.current||!valid||!dirty)return;
    lock.current=true;setSaving(true);setError('');
    try {
      const result=await request('/thresholds',{method:'PATCH',body:JSON.stringify({category:category.key,value,revision})});
      onSaved(result);setEditing(false);setSaved(true);
    }catch(err){setError(err.message);}finally{lock.current=false;setSaving(false);}
  }
  return <article className="lounge-thresholds__row" aria-label={`${category.label} threshold`}>
    <div><h3 id={`${id}-title`}>{category.label}</h3><p id={`${id}-description`}>{category.description}</p>
      <small>Starting default: {category.defaultValue}</small>
    </div>
    <div className="lounge-thresholds__value"><span>Current review cutoff</span><strong>{category.value}</strong>
      <small>{category.source==='render'?'Render override':category.source==='owner'?'Saved by an Owner':'Starting default'}</small>
    </div>
    <div className="lounge-thresholds__editor">
      {editing?<form onSubmit={save}>
        <label htmlFor={id}>Review threshold for {category.label}</label>
        <input id={id} type="number" min="0" max="1" step="any" required value={draft} disabled={saving}
          aria-describedby={`${id}-description ${id}-preview`} onChange={event=>{setDraft(event.target.value);setError('');}}/>
        <p id={`${id}-preview`}>{valid?`Scores of ${value} or higher will send the message for review.`:'Enter a number from 0 to 1.'}</p>
        {valid&&value!==category.value&&<small>{value<category.value?'Lower cutoff: more messages may enter the queue.':'Higher cutoff: fewer messages may enter the queue.'}</small>}
        {valid&&value===0&&<small>A cutoff of 0 sends every successfully checked message for review.</small>}
        {valid&&value===1&&<small>A cutoff of 1 only catches scores that reach exactly 1.</small>}
        <div><button type="submit" disabled={saving||!valid||!dirty||blocked}>{saving?'Saving…':'Save threshold'}</button>
          <button type="button" disabled={saving} onClick={()=>{setEditing(false);setError('');}}>Cancel</button></div>
      </form>:canEdit&&category.source!=='render'&&<button type="button" disabled={blocked} onClick={()=>{setDraft(String(category.value));setError('');setSaved(false);setEditing(true);}}>Edit threshold</button>}
      {category.source==='render'&&<small>This server override must be removed before an Owner can edit this category here.</small>}
      {saved&&<p role="status" className="lounge-thresholds__saved">✓ Saved successfully. Current cutoff: {category.value}.</p>}
      {error&&<p role="alert" className="lounge-review__error">{error}</p>}
    </div>
  </article>;
}

export default function LoungeThresholds({ request, canEdit }) {
  const [data,setData]=useState(null),[loading,setLoading]=useState(false),[error,setError]=useState('');
  const [history,setHistory]=useState(null),[historyError,setHistoryError]=useState('');
  const loadLock=useRef(false);
  async function load() {
    if(loadLock.current)return;loadLock.current=true;setLoading(true);setError('');
    try{const result=await request('/thresholds');setData(current=>!current||result.revision>=current.revision?result:current);}catch(err){setError(err.message);}finally{loadLock.current=false;setLoading(false);}
  }
  async function loadHistory() {
    setHistoryError('');
    try{setHistory((await request('/thresholds/history')).history);}catch(err){setHistoryError(err.message);}
  }
  function saved(result) {setData(current=>!current||result.revision>=current.revision?result:current);if(history!==null)void loadHistory();}
  return <details className="lounge-thresholds" onToggle={event=>{if(event.currentTarget.open&&!data)void load();}}>
    <summary><strong>AI review thresholds</strong><span>Understand every category and what sends a message for review</span></summary>
    <div className="lounge-thresholds__inside">
      <h2>How a message gets here</h2>
      <ol><li>OpenAI checks one Community Lounge message and returns a score for each category.</li>
        <li>Our server compares every score with the cutoff shown below.</li>
        <li>If <strong>any score is at or above its cutoff</strong>, the message enters this queue for a person to review.</li></ol>
      <div className="lounge-thresholds__example"><strong>Example, using an illustrative cutoff</strong>
        <p>Harassment score <b>0.97</b> ≥ cutoff <b>0.95</b> → human review.<br/>Score <b>0.80</b> &lt; cutoff <b>0.95</b> → this category does not send it for review. Another category still could.</p>
      </div>
      <p><strong>A score is an AI signal from 0 to 1.</strong> It is not a percentage proving someone broke a rule. OpenAI's overall flagged label does not decide our queue; these cutoffs do.</p>
      <p><strong>Lower cutoff = more potential reviews. Higher cutoff = fewer.</strong> Staff make the decision; AI never removes a message or sends a reply.</p>
      <p>Recovery discussions can include drugs, overdose, trauma and mental health. A concern may need support rather than deletion. These categories do not cover every community guideline, and a low score does not guarantee safety.</p>
      <p>{canEdit?'Owners can edit and save one category at a time.':'You can view these settings. Only Owners can change them.'} Changes apply to checks that start afterward, including queued messages. In-progress checks and older report cards keep their original cutoffs. Earlier messages are not automatically checked again.</p>
      <a href="https://developers.openai.com/api/docs/guides/moderation" target="_blank" rel="noreferrer">OpenAI category definitions and score guidance ↗</a>
      <small>The model can change over time. Review real outcomes and adjust cutoffs carefully.</small>
      <div className="lounge-thresholds__heading"><h2>Categories and current cutoffs</h2><button type="button" disabled={loading} onClick={load}>Refresh thresholds</button></div>
      {loading&&<p role="status">Loading thresholds…</p>}
      {error&&<p role="alert" className="lounge-review__error">{error}</p>}
      {data?.error&&<p role="alert" className="lounge-review__error">{data.error} Changes are disabled until the configuration is fixed.</p>}
      {data?.categories.map(category=><ThresholdRow key={category.key} category={category} canEdit={canEdit} revision={data.revision} request={request} onSaved={saved} blocked={Boolean(data.error)||category.source==='render'}/>) }
      {data?.updatedByUsername&&<small>Last cutoff change by {data.updatedByUsername} · {new Date(data.updatedAt).toLocaleString()}</small>}
      {canEdit&&<details className="lounge-thresholds__history" onToggle={event=>{event.stopPropagation();if(event.currentTarget.open)void loadHistory();}}><summary>Threshold change history</summary>
        {historyError&&<p role="alert">{historyError}</p>}
        {history===null&&!historyError&&<p>Loading recent changes…</p>}
        {history?.length===0&&<p>No threshold changes recorded yet.</p>}
        <ul>{history?.map(entry=><li key={entry.change_id}><strong>{data?.categories.find(category=>category.key===entry.category)?.label||entry.category}</strong>: {entry.previous_threshold} → {entry.threshold} · {entry.changed_by_username||'former Owner'} · {new Date(entry.created_at).toLocaleString()}</li>)}</ul>
      </details>}
    </div>
  </details>;
}
