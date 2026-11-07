(function(){
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var root=document.documentElement;

  try{var saved=localStorage.getItem('avi-theme');if(saved==='dark'||saved==='light'){root.setAttribute('data-theme',saved)}}catch(e){}
  $('#themeBtn').addEventListener('click',function(){
    var cur=root.getAttribute('data-theme');
    var dark=cur?cur==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;
    var next=dark?'light':'dark';
    root.setAttribute('data-theme',next);
    try{localStorage.setItem('avi-theme',next)}catch(e){}
  });

  var toast=$('#toast'),tt;
  function say(t){toast.textContent=t;toast.classList.add('show');clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove('show')},1800)}
  function selectNode(el){var r=document.createRange();r.selectNodeContents(el);var s=window.getSelection();s.removeAllRanges();s.addRange(r)}
  function copyText(text,node){
    var p=null;
    try{p=navigator.clipboard&&navigator.clipboard.writeText(text)}catch(e){}
    if(p&&p.then){p.then(function(){say('Copied')},function(){selectNode(node);say('Selected. Press Ctrl+C to copy')})}
    else{selectNode(node);say('Selected. Press Ctrl+C to copy')}
  }
  function debounce(fn,ms){var t;return function(){clearTimeout(t);t=setTimeout(fn,ms)}}

  var tabs=$$('[role=tab]');
  function pick(t,focus){
    tabs.forEach(function(x){
      var on=x===t;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1;
      document.getElementById(x.getAttribute('aria-controls')).hidden=!on;
    });
    if(focus)t.focus();
  }
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){pick(t)});
    t.addEventListener('keydown',function(e){
      var d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;
      if(d){e.preventDefault();pick(tabs[(i+d+tabs.length)%tabs.length],true)}
      else if(e.key==='Home'){e.preventDefault();pick(tabs[0],true)}
      else if(e.key==='End'){e.preventDefault();pick(tabs[tabs.length-1],true)}
    });
  });

  var SETS={lower:'abcdefghijklmnopqrstuvwxyz',upper:'ABCDEFGHIJKLMNOPQRSTUVWXYZ',digit:'0123456789',sym:'!@#$%^&*()-_=+[]{};:,.?'};
  var el={out:$('#pwOut'),len:$('#pwLen'),lv:$('#pwLenVal'),lab:$('#pwLabel'),bits:$('#pwBits'),
    o:{lower:$('#oLower'),upper:$('#oUpper'),digit:$('#oDigit'),sym:$('#oSym')}};
  function rnd(n){
    var max=Math.floor(4294967296/n)*n,a=new Uint32Array(1);
    do{crypto.getRandomValues(a)}while(a[0]>=max);
    return a[0]%n;
  }
  function genPw(){
    var keys=Object.keys(SETS).filter(function(k){return el.o[k].checked});
    if(!keys.length){el.o.lower.checked=true;keys=['lower']}
    var pool=keys.map(function(k){return SETS[k]}).join('');
    var len=+el.len.value,chars=[];
    keys.forEach(function(k){chars.push(SETS[k][rnd(SETS[k].length)])});
    while(chars.length<len)chars.push(pool[rnd(pool.length)]);
    for(var i=chars.length-1;i>0;i--){var j=rnd(i+1),t=chars[i];chars[i]=chars[j];chars[j]=t}
    el.out.textContent=chars.slice(0,len).join('');
    el.lv.textContent=len;
    var bits=Math.round(len*Math.log2(pool.length));
    var lvl=bits<40?1:bits<60?2:bits<80?3:4;
    el.lab.textContent=['','Weak','Fair','Strong','Excellent'][lvl];
    el.bits.textContent=bits+' bits';
    for(var s=1;s<=4;s++)$('#s'+s).classList.toggle('on',s<=lvl);
  }
  el.len.addEventListener('input',genPw);
  Object.keys(el.o).forEach(function(k){el.o[k].addEventListener('change',genPw)});
  $('#pwNew').addEventListener('click',genPw);
  $('#pwCopy').addEventListener('click',function(){copyText(el.out.textContent,el.out)});
  genPw();

  function dot(n){return [n>>>24,(n>>>16)&255,(n>>>8)&255,n&255].join('.')}
  function ipCalc(){
    var s=$('#ipIn').value.trim(),m=s.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/);
    var msg=$('#ipMsg'),out=$('#ipOut'),note=$('#ipNote');
    var o=m&&m.slice(1,5).map(Number),p=m&&+m[5];
    if(!m||o.some(function(n){return n>255})||p>32){
      msg.textContent=s?'Use the form 192.168.10.37/24, with each number from 0 to 255 and a prefix from 0 to 32.':'Enter an address and prefix.';
      msg.className='msg err';out.innerHTML='';note.textContent='';return;
    }
    msg.textContent='';msg.className='msg';
    var ip=((o[0]<<24)|(o[1]<<16)|(o[2]<<8)|o[3])>>>0;
    var mask=p===0?0:((0xFFFFFFFF<<(32-p))>>>0);
    var wild=(~mask)>>>0,net=(ip&mask)>>>0,bc=(net|wild)>>>0;
    var first,last,hosts;
    if(p===32){first=last=ip;hosts=1}
    else if(p===31){first=net;last=bc;hosts=2}
    else{first=net+1;last=bc-1;hosts=Math.pow(2,32-p)-2}
    var cells=[['Network',dot(net)+'/'+p],['Broadcast',dot(bc)],['Netmask',dot(mask)],['Wildcard',dot(wild)],['First host',dot(first)],['Last host',dot(last)],['Usable hosts',hosts.toLocaleString('en')]];
    out.innerHTML=cells.map(function(c){return '<div class="cell"><span class="lbl">'+c[0]+'</span><span class="val">'+c[1]+'</span></div>'}).join('');
    var priv=o[0]===10||(o[0]===172&&o[1]>=16&&o[1]<=31)||(o[0]===192&&o[1]===168);
    var kind=priv?'<b>Private range</b> (RFC 1918). Not routed on the internet.':(o[0]===127?'<b>Loopback</b> address, this machine only.':(o[0]===169&&o[1]===254?'<b>Link-local</b> address. A device that cannot reach DHCP often picks one of these.':'<b>Public or special-use</b> address.'));
    note.innerHTML=kind+(p===31?' A /31 has two usable addresses for point-to-point links.':'')+(p===32?' A /32 is a single host.':'');
  }
  $('#ipIn').addEventListener('input',ipCalc);ipCalc();

  function fmt(n){
    if(!isFinite(n))return '–';
    if(n===0)return '0';
    if(Math.abs(n)<0.001||Math.abs(n)>=1e15)return n.toExponential(3);
    return n.toLocaleString('en',{maximumSignificantDigits:7});
  }
  function stCalc(){
    var v=parseFloat($('#stVal').value),f=parseFloat($('#stUnit').value);
    var body=$('#stBody'),note=$('#stNote');
    if(!isFinite(v)||v<0){body.innerHTML='';note.textContent='Enter a size of zero or more.';return}
    var b=v*f,dec=[['B',1],['KB',1e3],['MB',1e6],['GB',1e9],['TB',1e12]],bin=[['B',1],['KiB',1024],['MiB',1048576],['GiB',1073741824],['TiB',1099511627776]];
    body.innerHTML=dec.map(function(d,i){return '<tr><td class="m">'+d[0]+'</td><td class="m num">'+fmt(b/d[1])+'</td><td class="m">'+bin[i][0]+'</td><td class="m num">'+fmt(b/bin[i][1])+'</td></tr>'}).join('');
    note.innerHTML='<b>'+fmt(b/1e9)+' GB</b> on the box shows up as <b>'+fmt(b/1073741824)+' GiB</b> in Windows, because Windows divides by 1024 and labels the result GB.';
  }
  $('#stVal').addEventListener('input',stCalc);$('#stUnit').addEventListener('change',stCalc);stCalc();

  var PORTS=[
    [20,'TCP','FTP data','File transfer, data channel'],[21,'TCP','FTP','File transfer, control channel'],[22,'TCP','SSH','Secure shell and SFTP'],[23,'TCP','Telnet','Unencrypted remote shell, avoid'],
    [25,'TCP','SMTP','Mail between servers'],[53,'TCP/UDP','DNS','Name lookups'],[67,'UDP','DHCP server','Hands out IP addresses'],[68,'UDP','DHCP client','Receives IP addresses'],
    [80,'TCP','HTTP','Web, unencrypted'],[110,'TCP','POP3','Mail download'],[123,'UDP','NTP','Time sync'],[135,'TCP','RPC','Windows remote procedure calls'],
    [137,'UDP','NetBIOS name','Legacy Windows name service'],[143,'TCP','IMAP','Mail access'],[161,'UDP','SNMP','Network device monitoring'],[389,'TCP/UDP','LDAP','Directory lookups, Active Directory'],
    [443,'TCP','HTTPS','Web, encrypted'],[445,'TCP','SMB','Windows file and printer sharing'],[465,'TCP','SMTPS','Mail submission over TLS'],[514,'UDP','Syslog','Log forwarding'],
    [587,'TCP','SMTP submission','Mail sending from clients'],[636,'TCP','LDAPS','Directory lookups over TLS'],[993,'TCP','IMAPS','Mail access over TLS'],[995,'TCP','POP3S','Mail download over TLS'],
    [1433,'TCP','SQL Server','Microsoft SQL Server'],[1521,'TCP','Oracle DB','Oracle listener'],[3306,'TCP','MySQL','MySQL and MariaDB'],[3389,'TCP/UDP','RDP','Windows Remote Desktop'],
    [5432,'TCP','PostgreSQL','PostgreSQL database'],[5900,'TCP','VNC','Remote screen sharing'],[8080,'TCP','HTTP alt','Proxies and dev web servers'],[9100,'TCP','JetDirect','Raw network printing']
  ];
  function ptRender(){
    var q=$('#ptIn').value.trim().toLowerCase();
    var rows=PORTS.filter(function(r){return !q||(r[0]+' '+r[1]+' '+r[2]+' '+r[3]).toLowerCase().indexOf(q)>-1});
    $('#ptBody').innerHTML=rows.map(function(r){return '<tr><td class="m num">'+r[0]+'</td><td class="m">'+r[1]+'</td><td>'+r[2]+'</td><td class="n">'+r[3]+'</td></tr>'}).join('');
    $('#ptMsg').textContent=rows.length?rows.length+' of '+PORTS.length+' ports shown.':'No port matches that search.';
  }
  $('#ptIn').addEventListener('input',ptRender);ptRender();

  function hex(buf){
    var a=new Uint8Array(buf),s='';
    for(var i=0;i<a.length;i++)s+=(a[i]<16?'0':'')+a[i].toString(16);
    return s;
  }
  var HASH_ALGS=['SHA-1','SHA-256','SHA-384','SHA-512'];
  var hashOut={};
  HASH_ALGS.forEach(function(a){hashOut[a]=$('#'+(a==='SHA-1'?'hSha1':a==='SHA-256'?'hSha256':a==='SHA-384'?'hSha384':'hSha512'))});
  var hashSeq=0;
  function hashRun(){
    var text=$('#hashIn').value,id=++hashSeq;
    if(!text){HASH_ALGS.forEach(function(a){hashOut[a].textContent='–'});return}
    if(!window.crypto||!crypto.subtle){HASH_ALGS.forEach(function(a){hashOut[a].textContent='Needs HTTPS'});return}
    var data=new TextEncoder().encode(text);
    HASH_ALGS.forEach(function(a){
      crypto.subtle.digest(a,data).then(function(buf){
        if(id===hashSeq)hashOut[a].textContent=hex(buf);
      },function(){
        if(id===hashSeq)hashOut[a].textContent='Not available';
      });
    });
  }
  $('#hashIn').addEventListener('input',debounce(hashRun,120));
  hashRun();
  $$('[data-copy]').forEach(function(b){
    b.addEventListener('click',function(){
      var n=document.getElementById(b.getAttribute('data-copy'));
      if(n)copyText(n.textContent,n);
    });
  });

  var b64Mode='encode';
  function b64Set(mode){
    b64Mode=mode;
    $('#b64Enc').setAttribute('aria-pressed',mode==='encode'?'true':'false');
    $('#b64Dec').setAttribute('aria-pressed',mode==='decode'?'true':'false');
    b64Run();
  }
  function b64Run(){
    var s=$('#b64In').value,out=$('#b64Out'),msg=$('#b64Msg');
    msg.textContent='';msg.className='msg';
    if(!s){out.textContent='';return}
    try{
      if(b64Mode==='encode'){
        var bytes=new TextEncoder().encode(s),bin='';
        for(var i=0;i<bytes.length;i++)bin+=String.fromCharCode(bytes[i]);
        var b=btoa(bin);
        if($('#b64Url').checked)b=b.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
        out.textContent=b;
      }else{
        var t=s.trim();
        if($('#b64Url').checked)t=t.replace(/-/g,'+').replace(/_/g,'/');
        while(t.length%4)t+='=';
        var raw=atob(t),arr=new Uint8Array(raw.length);
        for(var j=0;j<raw.length;j++)arr[j]=raw.charCodeAt(j);
        out.textContent=new TextDecoder('utf-8',{fatal:true}).decode(arr);
      }
    }catch(e){
      out.textContent='';
      msg.textContent=b64Mode==='encode'?'Could not encode that text.':'That is not valid Base64.';
      msg.className='msg err';
    }
  }
  $('#b64Enc').addEventListener('click',function(){b64Set('encode')});
  $('#b64Dec').addEventListener('click',function(){b64Set('decode')});
  $('#b64In').addEventListener('input',b64Run);
  $('#b64Url').addEventListener('change',b64Run);
  $('#b64Copy').addEventListener('click',function(){var n=$('#b64Out');if(n.textContent)copyText(n.textContent,n)});
  b64Run();

  function b64urlDecode(s){
    s=s.replace(/-/g,'+').replace(/_/g,'/');
    while(s.length%4)s+='=';
    var raw=atob(s),arr=new Uint8Array(raw.length);
    for(var i=0;i<raw.length;i++)arr[i]=raw.charCodeAt(i);
    return new TextDecoder().decode(arr);
  }
  function jwtRun(){
    var t=$('#jwtIn').value.trim(),out=$('#jwtOut'),msg=$('#jwtMsg');
    if(!t){out.hidden=true;msg.textContent='';msg.className='msg';return}
    var parts=t.split('.');
    if(parts.length<2){out.hidden=true;msg.textContent='A JWT has at least two parts separated by dots.';msg.className='msg err';return}
    try{
      var h=JSON.parse(b64urlDecode(parts[0])),p=JSON.parse(b64urlDecode(parts[1]));
      $('#jwtHead').textContent=JSON.stringify(h,null,2);
      $('#jwtPay').textContent=JSON.stringify(p,null,2);
      var bits=[];
      if(p.exp){var d=new Date(p.exp*1000);bits.push((d.getTime()<Date.now()?'Expired ':'Valid until ')+d.toLocaleString())}
      if(p.iat){bits.push('Issued '+new Date(p.iat*1000).toLocaleString())}
      if(p.nbf){bits.push('Not before '+new Date(p.nbf*1000).toLocaleString())}
      $('#jwtTime').textContent=bits.length?bits.join(' · '):'No exp, iat or nbf claim.';
      out.hidden=false;msg.textContent='';msg.className='msg';
    }catch(e){
      out.hidden=true;msg.textContent='Could not decode: '+e.message;msg.className='msg err';
    }
  }
  $('#jwtIn').addEventListener('input',debounce(jwtRun,150));
  jwtRun();

  function jsonRun(mode){
    var src=$('#jsonIn').value,out=$('#jsonOut'),msg=$('#jsonMsg');
    if(!src.trim()){out.textContent='';msg.textContent='';msg.className='msg';return}
    try{
      var v=JSON.parse(src);
      out.textContent=mode==='min'?JSON.stringify(v):JSON.stringify(v,null,2);
      msg.textContent='Valid JSON';msg.className='msg';
    }catch(e){
      out.textContent='';msg.textContent=e.message;msg.className='msg err';
    }
  }
  $('#jsonFmt').addEventListener('click',function(){jsonRun('format')});
  $('#jsonMin').addEventListener('click',function(){jsonRun('min')});
  $('#jsonCopy').addEventListener('click',function(){var n=$('#jsonOut');if(n.textContent)copyText(n.textContent,n)});

  function relTime(d){
    var diff=Math.round((d.getTime()-Date.now())/1000),a=Math.abs(diff),n,u;
    if(a<45)return diff>=0?'in a moment':'just now';
    if(a<3600){n=Math.round(a/60);u=n===1?'minute':'minutes'}
    else if(a<86400){n=Math.round(a/3600);u=n===1?'hour':'hours'}
    else if(a<2592000){n=Math.round(a/86400);u=n===1?'day':'days'}
    else if(a<31536000){n=Math.round(a/2592000);u=n===1?'month':'months'}
    else{n=Math.round(a/31536000);u=n===1?'year':'years'}
    return (diff>0?'in ':'')+n+' '+u+(diff<0?' ago':'');
  }
  function tsRun(){
    var raw=$('#tsIn').value.trim(),msg=$('#tsMsg'),out=$('#tsOut');
    if(!raw){out.innerHTML='';msg.textContent='Enter a timestamp or a date.';msg.className='msg';return}
    var d=null;
    if(/^-?\d+(\.\d+)?$/.test(raw)){
      var n=parseFloat(raw);
      d=new Date(Math.abs(n)>=1e11?n:n*1000);
    }else{
      var p=Date.parse(raw);
      if(!isNaN(p))d=new Date(p);
    }
    if(!d||isNaN(d.getTime())){out.innerHTML='';msg.textContent='That is not a timestamp or date I can read.';msg.className='msg err';return}
    msg.textContent='';msg.className='msg';
    var cells=[['ISO 8601 (UTC)',d.toISOString()],['Your local time',d.toLocaleString()],['Weekday',d.toLocaleDateString(undefined,{weekday:'long'})],['Relative',relTime(d)],['Unix seconds',Math.floor(d.getTime()/1000)],['Unix milliseconds',d.getTime()]];
    out.innerHTML=cells.map(function(c){return '<div class="cell"><span class="lbl">'+c[0]+'</span><span class="val">'+c[1]+'</span></div>'}).join('');
  }
  $('#tsIn').addEventListener('input',debounce(tsRun,120));
  $('#tsNow').addEventListener('click',function(){$('#tsIn').value=Math.floor(Date.now()/1000);tsRun()});
  $('#tsIn').value=Math.floor(Date.now()/1000);
  tsRun();

  var wifiBars=[];
  (function(){
    var box=$('#wifiRows');
    for(var c=1;c<=13;c++){
      var row=document.createElement('div');row.className='wifi-row';
      var n=document.createElement('span');n.textContent=c;
      var track=document.createElement('div');track.className='wifi-track';
      var bar=document.createElement('span');bar.className='wifi-bar';
      bar.style.left=((c-1)/13*100)+'%';
      bar.style.width=(5/13*100)+'%';
      track.appendChild(bar);row.appendChild(n);row.appendChild(track);box.appendChild(row);
      wifiBars.push(bar);
    }
  })();
  function wifiRun(){
    var sel=+$('#wifiCh').value,lo=Math.max(1,sel-4),hi=Math.min(13,sel+4);
    wifiBars.forEach(function(b,i){
      var ch=i+1;
      b.className='wifi-bar'+(ch===sel?' on':(Math.abs(ch-sel)<=4?' hit':''));
    });
    var clean=sel===1||sel===6||sel===11;
    $('#wifiOut').textContent=clean
      ?('Channel '+sel+' overlaps '+lo+'–'+hi+'. It is one of the three clean choices: 1, 6 and 11.')
      :('Channel '+sel+' overlaps '+lo+'–'+hi+'. Move to 1, 6 or 11 to avoid the overlap.');
  }
  $('#wifiCh').addEventListener('change',wifiRun);
  wifiRun();

  function fmtDur(s){
    if(!isFinite(s)||s<0)return '–';
    if(s<1)return 'under 1 second';
    s=Math.round(s);
    var h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60,out=[];
    if(h)out.push(h+' h');
    if(m)out.push(m+' min');
    if(sec||!out.length)out.push(sec+' s');
    return out.join(' ');
  }
  function ttRun(){
    var v=parseFloat($('#ttSize').value),u=parseFloat($('#ttUnit').value),sp=parseFloat($('#ttSpeed').value);
    if(!isFinite(v)||v<0||!isFinite(sp)||sp<=0){$('#ttOut').textContent='–';$('#ttReal').textContent='–';return}
    var sec=(v*u*8)/(sp*1e6);
    $('#ttOut').textContent=fmtDur(sec);
    $('#ttReal').textContent=fmtDur(sec/0.8);
  }
  ['#ttSize','#ttUnit','#ttSpeed'].forEach(function(s){$(s).addEventListener('input',ttRun);$(s).addEventListener('change',ttRun)});
  ttRun();

  var HTTP=[
    [100,'Continue','Server got the request headers, client should send the body'],
    [101,'Switching Protocols','Protocol change accepted, used by WebSocket upgrades'],
    [103,'Early Hints','Preload hints sent before the final response'],
    [200,'OK','Request succeeded'],
    [201,'Created','Resource created, usually after a POST'],
    [202,'Accepted','Queued for processing, not finished yet'],
    [204,'No Content','Success with an empty body'],
    [206,'Partial Content','Part of a file, used for downloads and video'],
    [301,'Moved Permanently','New URL, update bookmarks and links'],
    [302,'Found','Temporary redirect, keep the old URL'],
    [303,'See Other','Redirect the browser to a GET after a POST'],
    [304,'Not Modified','Cached copy is still valid'],
    [307,'Temporary Redirect','Like 302 but the method must not change'],
    [308,'Permanent Redirect','Like 301 but the method must not change'],
    [400,'Bad Request','Malformed request or invalid input'],
    [401,'Unauthorized','Login required or credentials rejected'],
    [402,'Payment Required','Reserved, used by some paid APIs'],
    [403,'Forbidden','Logged in but not allowed'],
    [404,'Not Found','No resource at that URL'],
    [405,'Method Not Allowed','Wrong HTTP method for this URL'],
    [406,'Not Acceptable','Server cannot produce the requested format'],
    [408,'Request Timeout','Client took too long to send the request'],
    [409,'Conflict','Request clashes with the current state'],
    [410,'Gone','Resource removed on purpose and will not return'],
    [411,'Length Required','Content-Length header is missing'],
    [412,'Precondition Failed','A conditional header did not match'],
    [413,'Payload Too Large','Request body is bigger than the server allows'],
    [414,'URI Too Long','URL is longer than the server accepts'],
    [415,'Unsupported Media Type','Wrong Content-Type for this endpoint'],
    [418,'I\'m a Teapot','April Fools code, sometimes used for bots'],
    [422,'Unprocessable Content','JSON was valid but the fields were not'],
    [425,'Too Early','Server refuses to replay a request too soon'],
    [429,'Too Many Requests','Rate limited, slow down and retry later'],
    [500,'Internal Server Error','Unhandled error on the server'],
    [501,'Not Implemented','Server does not support that method'],
    [502,'Bad Gateway','Upstream server returned an invalid response'],
    [503,'Service Unavailable','Overloaded or down, retry later'],
    [504,'Gateway Timeout','Upstream server did not answer in time'],
    [505,'HTTP Version Not Supported','Server cannot use that HTTP version'],
    [511,'Network Authentication Required','Captive portal or network login needed']
  ];
  function httpRender(){
    var q=$('#httpIn').value.trim().toLowerCase();
    var rows=HTTP.filter(function(r){return !q||(r[0]+' '+r[1]+' '+r[2]).toLowerCase().indexOf(q)>-1});
    var body=$('#httpBody');body.textContent='';
    rows.forEach(function(r){
      var tr=document.createElement('tr');
      [r[0],r[1],r[2]].forEach(function(v,i){
        var td=document.createElement('td');td.textContent=v;
        td.className=i===0?'m num':i===1?'m':'n';
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });
    $('#httpMsg').textContent=rows.length?rows.length+' of '+HTTP.length+' codes shown.':'No code matches that search.';
  }
  $('#httpIn').addEventListener('input',httpRender);
  httpRender();
})();
