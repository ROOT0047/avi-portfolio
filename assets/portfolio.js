(function(){
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var root=document.documentElement;

  /* Theme toggle */
  try{var saved=localStorage.getItem('avi-theme');if(saved==='dark'||saved==='light'){root.setAttribute('data-theme',saved)}}catch(e){}
  $('#themeBtn').addEventListener('click',function(){
    var cur=root.getAttribute('data-theme');
    var dark=cur?cur==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;
    var next=dark?'light':'dark';
    root.setAttribute('data-theme',next);
    try{localStorage.setItem('avi-theme',next)}catch(e){}
  });

  /* Toast + copy */
  var toast=$('#toast'),tt;
  function say(t){toast.textContent=t;toast.classList.add('show');clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove('show')},1800)}
  function selectNode(el){var r=document.createRange();r.selectNodeContents(el);var s=window.getSelection();s.removeAllRanges();s.addRange(r)}
  function copyText(text,node){
    var p=null;
    try{p=navigator.clipboard&&navigator.clipboard.writeText(text)}catch(e){}
    if(p&&p.then){p.then(function(){say('Copied')},function(){selectNode(node);say('Selected. Press Ctrl+C to copy')})}
    else{selectNode(node);say('Selected. Press Ctrl+C to copy')}
  }
  $$('[data-copy]').forEach(function(b){
    b.addEventListener('click',function(){var n=document.getElementById(b.getAttribute('data-copy'));copyText(b.getAttribute('data-raw')||n.textContent,n)});
  });

  /* Interactive grid background (Three.js) */
  (function(){
    var canvas=$('#gridBg');
    if(!canvas)return;
    var still=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(still){canvas.style.display='none';return;}
    var scene=new THREE.Scene();
    var camera=new THREE.PerspectiveCamera(45,1,1,15000);
    camera.position.z=1000;
    var renderer=new THREE.WebGLRenderer({canvas:canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    var density=24,gridSize=520,half=gridSize/2,pts=[];
    for(var y=0;y<=density;y++){for(var x=0;x<=density;x++){pts.push(x/density*gridSize-half,y/density*gridSize-half,0);}}
    var geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
    var material=new THREE.PointsMaterial({color:0x3447F5,size:3,transparent:true,opacity:0.5,sizeAttenuation:true});
    var points=new THREE.Points(geometry,material);scene.add(points);
    var mouse=new THREE.Vector2(-1,-1),target=new THREE.Vector2(-1,-1),time=0;
    function resize(){
      var r=canvas.parentElement.getBoundingClientRect();
      renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();
    }
    window.addEventListener('resize',resize);resize();
    var stage=$('#stage');
    stage.addEventListener('pointermove',function(e){
      var r=canvas.getBoundingClientRect();
      mouse.set((e.clientX-r.left)/r.width*2-1,(e.clientY-r.top)/r.height*2-1);
    });
    stage.addEventListener('pointerleave',function(){mouse.set(-1,-1);});
    function animate(){
      requestAnimationFrame(animate);
      time+=0.01;
      target.lerp(mouse,0.1);
      var pos=geometry.attributes.position;
      for(var i=0;i<pos.count;i++){
        var x=pos.getX(i),y=pos.getY(i);
        var dx=x-target.x*half,dy=y-target.y*half,dist=Math.sqrt(dx*dx+dy*dy);
        var falloff=Math.exp(-Math.pow(dist/(half*0.4),2));
        var z=Math.sin(time+x*0.01+y*0.01)*6+falloff*90;
        pos.setZ(i,z);
      }
      pos.needsUpdate=true;
      renderer.render(scene,camera);
    }
    animate();
  })();

  /* Mobile nav menu */
(function(){
  var btn=$('#navMenu'),panel=$('#navPanel'),close=$('#navClose'),overlay=$('#navOverlay');
  if(!btn)return;
  function open(){panel.classList.add('open');overlay.classList.add('open');btn.setAttribute('aria-expanded','true');}
  function closeMenu(){panel.classList.remove('open');overlay.classList.remove('open');btn.setAttribute('aria-expanded','false');}
  btn.addEventListener('click',open);
  close.addEventListener('click',closeMenu);
  overlay.addEventListener('click',closeMenu);
  $$('#navPanel .nav-link').forEach(function(a){a.addEventListener('click',closeMenu);});
})();

/* Hero tilt */
  var stage=$('#stage'),stack=$('#stack');
  var still=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!still){
    stage.addEventListener('pointermove',function(e){
      var r=stage.getBoundingClientRect();
      var x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      stack.style.setProperty('--ry',(-14+x*26).toFixed(1)+'deg');
      stack.style.setProperty('--rx',(6-y*20).toFixed(1)+'deg');
    });
    stage.addEventListener('pointerleave',function(){stack.style.removeProperty('--ry');stack.style.removeProperty('--rx')});
  }

})();
