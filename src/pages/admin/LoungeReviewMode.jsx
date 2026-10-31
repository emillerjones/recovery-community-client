import { useId, useRef, useState } from 'react';

import { REVIEW_MODES, reviewModeLabel } from './loungeReviewModes';

export default function LoungeReviewMode({processing,request,canEdit,onSaved}) {
  const [draft,setDraft]=useState(null),[saving,setSaving]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(false);
  const [history,setHistory]=useState(null),[historyError,setHistoryError]=useState('');
  const lock=useRef(false),id=useId();
  const current=processing.reviewMode||'cutoffs',selected=draft??current,dirty=selected!==current;
  async function loadHistory(){
    setHistoryError('');
    try{setHistory((await request('/review-mode/history')).history);}catch(err){setHistoryError(err.message);}
  }
  async function save(event){
    event.preventDefault();if(lock.current||!dirty)return;
    lock.current=true;setSaving(true);setError('');setSaved(false);
    try{
      const result=await request('/review-mode',{method:'PATCH',body:JSON.stringify({reviewMode:selected,revision:processing.reviewModeRevision})});
      onSaved(result.processing);setDraft(null);setSaved(true);
      if(history!==null)void loadHistory();
    }catch(err){setError(err.message);}finally{lock.current=false;setSaving(false);}
  }
  return <section className="lounge-review-mode" aria-labelledby={`${id}-title`}>
    <div className="lounge-review__section-heading"><div><span className="lounge-review__eyebrow">Review rules</span><h2 id={`${id}-title`}>What sends a message for review?</h2></div>
      <span className="lounge-review__saved-pill">Saved: {reviewModeLabel(current)}</span></div>
    <p>Choose which AI signals bring a Community Lounge message into this queue. A person still makes every moderation decision.</p>
    <form onSubmit={save}>
      <fieldset disabled={saving||!canEdit}><legend className="lounge-review__sr-only">Review decision mode</legend>
        {REVIEW_MODES.map(mode=><label key={mode.value} className={`lounge-review-mode__option${selected===mode.value?' is-selected':''}`}>
          <span className="lounge-review-mode__option-title"><input type="radio" aria-label={mode.label} name={`${id}-mode`} value={mode.value} checked={selected===mode.value}
            onChange={()=>{setDraft(mode.value);setError('');setSaved(false);}}/><strong>{mode.label}</strong></span>
          <span>{mode.description}</span><small>{mode.example}</small>
        </label>)}
      </fieldset>
      <div className="lounge-review-mode__footer"><small>{canEdit?'Owners can change this setting.':'Only Owners can change this setting.'} Changes apply to checks that start afterward, including queued messages. Earlier report cards stay unchanged.</small>
        {canEdit&&<div className="lounge-review-mode__save"><button className="lounge-review__primary" disabled={!dirty||saving}>{saving?'Saving…':'Save review mode'}</button>
          {dirty&&<button type="button" disabled={saving} onClick={()=>{setDraft(null);setError('');}}>Cancel</button>}</div>}
      </div>
      {dirty&&<p className="lounge-review-mode__draft" role="status">Unsaved choice: {reviewModeLabel(selected)}. Save to apply it.</p>}
      {saved&&!dirty&&<p className="lounge-thresholds__saved" role="status">✓ Review mode saved successfully: {reviewModeLabel(current)}.</p>}
      {error&&<p className="lounge-review__error" role="alert">{error}</p>}
    </form>
    {processing.reviewModeUpdatedByUsername&&<small>Last changed by {processing.reviewModeUpdatedByUsername} · {new Date(processing.reviewModeUpdatedAt).toLocaleString()}</small>}
    {canEdit&&<details onToggle={event=>{if(event.currentTarget.open)void loadHistory();}}><summary>Review mode change history</summary>
      {historyError&&<p role="alert">{historyError}</p>}{history===null&&!historyError&&<p>Loading recent changes…</p>}
      {history?.length===0&&<p>No review mode changes recorded yet.</p>}
      <ul>{history?.map(entry=><li key={entry.change_id}>{reviewModeLabel(entry.previous_mode)} → {reviewModeLabel(entry.review_mode)} · {entry.changed_by_username||'former Owner'} · {new Date(entry.created_at).toLocaleString()}</li>)}</ul>
    </details>}
  </section>;
}
