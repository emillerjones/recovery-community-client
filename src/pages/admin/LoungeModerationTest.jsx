import { useId, useRef, useState } from 'react';
import { reviewModeLabel } from './loungeReviewModes';

const category=key=>key.replaceAll('/',' / ').replaceAll('-',' ');

export default function LoungeModerationTest({request,processing}) {
  const [text,setText]=useState(''),[result,setResult]=useState(null),[checkedText,setCheckedText]=useState('');
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const lock=useRef(false),id=useId();
  const valid=Boolean(text.trim())&&text.length<=4000;
  async function run(event){
    event.preventDefault();if(lock.current||!valid||!processing.enabled)return;
    lock.current=true;setBusy(true);setError('');setResult(null);
    const submitted=text;
    try{const data=await request('/test',{method:'POST',body:JSON.stringify({text:submitted})});setCheckedText(submitted);setResult(data);}
    catch(err){setError(err.message);}finally{lock.current=false;setBusy(false);}
  }
  const response=result?.response?.results?.[0],cutoffsActive=result?.review_mode!=='openai';
  const changedSettings=result&&(result.review_mode_revision!==processing.reviewModeRevision||result.review_mode!==processing.reviewMode);
  return <details className="lounge-test" id="lounge-test">
    <summary><span className="lounge-review__summary-icon" aria-hidden="true">↗</span><span><strong>Test a message</strong><small>Owner sandbox · See a report card without posting anything</small></span><span className="lounge-review__summary-hint">Open test</span></summary>
    <div className="lounge-test__inside">
      <p className="lounge-test__privacy">Your text is sent to OpenAI. We do not save the text or results to our database, post it to the Lounge, or add it to the review queue.</p>
      <form onSubmit={run}>
        <div className="lounge-test__label"><label htmlFor={id}>Text to check</label><span>{text.length.toLocaleString()} / 4,000</span></div>
        <textarea id={id} value={text} maxLength={4000} rows={5} disabled={busy} aria-describedby={`${id}-help`} placeholder="Write an example message to see how the AI evaluates it…"
          onChange={event=>{setText(event.target.value);setError('');}}/>
        <div className="lounge-test__submit"><small id={`${id}-help`}>Uses the saved review mode and cutoffs at the start of this test. Unsaved changes do not apply.</small>
          <div><button className="lounge-review__primary" disabled={busy||!valid||!processing.enabled}>{busy?'Checking with OpenAI…':'Run AI check'}</button>
            <button type="button" disabled={busy||(!text&&!result&&!error)} onClick={()=>{setText('');setResult(null);setCheckedText('');setError('');}}>Clear test</button></div>
        </div>
        {!processing.enabled&&<p className="lounge-test__paused">AI checks are paused. Enable checks and resolve any configuration issues before testing.</p>}
        {busy&&<p role="status">Checking your example. This can take up to 20 seconds.</p>}
        {error&&<p role="alert" className="lounge-review__error">{error}</p>}
      </form>
      {result&&<section className="lounge-test__result" aria-label="Test report card">
        <header className={`lounge-test__outcome${result.needs_review?' is-concern':''}`} role="status"><span aria-hidden="true">{result.needs_review?'!':'✓'}</span><div><strong>{result.needs_review?'Would enter review':'Would not enter review'}</strong><small>Test only · Nothing saved or added to the queue</small></div></header>
        <div className="lounge-test__result-meta"><span><b>Rule used</b>{reviewModeLabel(result.review_mode)}</span><span><b>OpenAI overall flagged</b>{response?.flagged?'Yes':'No'}</span><span><b>Checked</b>{new Date(result.checked_at).toLocaleString()}</span></div>
        {result.needs_review&&<p>Triggered by: {result.review_reasons.map(reviewModeLabel).join(' + ')}.</p>}
        {(text!==checkedText||changedSettings)&&<p className="lounge-test__paused">This report belongs to the previous test. Run another check to use your current text and saved settings.</p>}
        <details><summary>Text checked</summary><blockquote>{checkedText}</blockquote></details>
        <div className="lounge-review__table-wrap"><table><caption>Test report card · All category scores</caption><thead><tr><th>Category</th><th>Model score</th><th>Saved cutoff</th><th>Review signal</th><th>OpenAI flagged?</th></tr></thead>
          <tbody>{Object.entries(response?.category_scores||{}).map(([key,score])=>{
            const crossed=score>=result.thresholds_used[key],flag=response.categories?.[key];
            const contributes=(cutoffsActive&&crossed)||(result.review_mode!=='cutoffs'&&response.flagged&&flag===true);
            return <tr key={key} className={contributes?'is-triggered':'is-below'}><th scope="row">{category(key)}</th><td title={String(score)}>{score.toFixed(4)}</td><td>{result.thresholds_used[key]}{!cutoffsActive&&' (not used)'}</td><td>{contributes?'Review signal':cutoffsActive?'Below cutoff':'No category flag'}</td><td>{flag===true?'Yes':flag===false?'No':'Not available'}</td></tr>;
          })}</tbody></table></div>
        <small>Scores are AI signals, not proof of a violation. Displayed scores are rounded; decisions use the full values. Cutoffs shown here are a snapshot and do not update when settings change.</small>
        <details><summary>Raw OpenAI response</summary><pre>{JSON.stringify(result.response,null,2)}</pre></details>
      </section>}
    </div>
  </details>;
}
