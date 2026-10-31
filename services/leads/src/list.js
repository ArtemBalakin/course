// Просмотр заявок на сервере: docker compose exec leads node src/list.js [сколько]
import {DatabaseSync} from 'node:sqlite';

const limit=Number(process.argv[2])||20;
const db=new DatabaseSync(process.env.DB_PATH||'/data/leads.sqlite',{readOnly:true});
const rows=db.prepare(`
  SELECT datetime(created_at/1000,'unixepoch') AS created,name,contact,service,details,suspicious,held
  FROM leads ORDER BY created_at DESC LIMIT ?
`).all(limit);
for(const row of rows){
  const marks=[row.suspicious?'возможно, спам':'',row.held?'без уведомления':''].filter(Boolean).join(', ');
  console.log(row.created+' UTC'+(marks?' ['+marks+']':''));
  console.log('  '+row.name+' — '+row.contact+' — '+row.service);
  console.log('  '+row.details.replaceAll('\n',' '));
}
console.log('Показано: '+rows.length);
db.close();
