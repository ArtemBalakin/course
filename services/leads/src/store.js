// SQLite: сначала заявка попадает сюда и только потом уходит в каналы доставки.
import {DatabaseSync} from 'node:sqlite';

const COLUMNS=[
  'id','created_at','name','contact','service','details','source','landing','referrer',
  'utm_source','utm_medium','utm_campaign','utm_content','utm_term','suspicious','sender'
];
export const CHANNELS=['telegram','email'];
const BACKOFF_CAP_MS=6*3600_000;

export function openStore(path){
  const db=new DatabaseSync(path);
  db.exec(`
    PRAGMA journal_mode=WAL;
    PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS leads(
      id TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      name TEXT NOT NULL,
      contact TEXT NOT NULL,
      service TEXT NOT NULL,
      details TEXT NOT NULL,
      source TEXT NOT NULL,
      landing TEXT NOT NULL,
      referrer TEXT NOT NULL,
      utm_source TEXT NOT NULL,
      utm_medium TEXT NOT NULL,
      utm_campaign TEXT NOT NULL,
      utm_content TEXT NOT NULL,
      utm_term TEXT NOT NULL,
      suspicious INTEGER NOT NULL DEFAULT 0,
      sender TEXT NOT NULL,
      held INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS deliveries(
      lead_id TEXT NOT NULL REFERENCES leads(id),
      channel TEXT NOT NULL,
      sent_at INTEGER,
      attempts INTEGER NOT NULL DEFAULT 0,
      next_attempt_at INTEGER NOT NULL,
      PRIMARY KEY(lead_id,channel)
    );
    CREATE INDEX IF NOT EXISTS ix_deliveries_due ON deliveries(sent_at,next_attempt_at);
    CREATE INDEX IF NOT EXISTS ix_leads_held ON leads(held);
  `);

  const insertLead=db.prepare(
    'INSERT OR IGNORE INTO leads('+COLUMNS.join(',')+',held) VALUES('+COLUMNS.map(()=>'?').join(',')+',?)'
  );
  const insertDelivery=db.prepare('INSERT INTO deliveries(lead_id,channel,next_attempt_at) VALUES(?,?,?)');
  const due=db.prepare(`
    SELECT leads.*,deliveries.channel,deliveries.attempts FROM deliveries
    JOIN leads ON leads.id=deliveries.lead_id
    WHERE deliveries.sent_at IS NULL AND deliveries.next_attempt_at<=?
    ORDER BY leads.created_at LIMIT 25
  `);
  const markSent=db.prepare('UPDATE deliveries SET sent_at=? WHERE lead_id=? AND channel=?');
  const markFailed=db.prepare(
    'UPDATE deliveries SET attempts=attempts+1,next_attempt_at=? WHERE lead_id=? AND channel=?'
  );
  const heldRows=db.prepare('SELECT id,name,contact,sender FROM leads WHERE held=1 ORDER BY created_at');
  const clearHeld=db.prepare('UPDATE leads SET held=2 WHERE id=?');
  const pending=db.prepare('SELECT count(*) AS n FROM deliveries WHERE sent_at IS NULL');
  const total=db.prepare('SELECT count(*) AS n FROM leads');

  function transaction(work){
    db.exec('BEGIN IMMEDIATE');
    try{
      const result=work();
      db.exec('COMMIT');
      return result;
    }catch(error){
      db.exec('ROLLBACK');
      throw error;
    }
  }

  return {
    // false значит, что такой id уже сохранён: повторная отправка формы не даёт второго уведомления.
    save(lead,{now,held,sender}){
      return transaction(()=>{
        const row={...lead,created_at:now,sender};
        const {changes}=insertLead.run(...COLUMNS.map(column=>row[column]),held?1:0);
        if(Number(changes)===0)return false;
        if(!held)for(const channel of CHANNELS)insertDelivery.run(lead.id,channel,now);
        return true;
      });
    },
    due:now=>due.all(now),
    markSent:(id,channel,now)=>markSent.run(now,id,channel),
    markFailed(id,channel,attempts,now){
      const wait=Math.min(BACKOFF_CAP_MS,60_000*2**Math.min(attempts,10));
      markFailed.run(now+wait,id,channel);
    },
    heldGroups(){
      const groups=new Map();
      for(const row of heldRows.all()){
        if(!groups.has(row.sender))groups.set(row.sender,[]);
        groups.get(row.sender).push(row);
      }
      return [...groups.values()].map(rows=>({rows}));
    },
    clearHeld(rows){transaction(()=>rows.forEach(row=>clearHeld.run(row.id)));},
    counts:()=>({leads:Number(total.get().n),undelivered:Number(pending.get().n)}),
    close:()=>db.close()
  };
}
