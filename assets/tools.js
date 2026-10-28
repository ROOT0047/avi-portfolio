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
})();
